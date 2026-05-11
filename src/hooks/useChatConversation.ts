import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { supabase } from '@lib/supabase';
import { User, ChatMessage } from '@/types';

const MESSAGES_PER_PAGE = 20;

export const useChatConversation = (
    selectedChat: string | null,
    currentUser: User,
    msgInput: string
) => {
    const [localMessages, setLocalMessages] = useState<any[]>([]);
    const [page, setPage] = useState(0);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const isSyncingRef = useRef(false);
    const [isOtherTyping, setIsOtherTyping] = useState(false);
    const [isSending, setIsSending] = useState(false);
    
    const activeChatChannelRef = useRef<any>(null);
    const incomingTypingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const outgoingTypingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const selectedChatRef = useRef(selectedChat);

    const OFFLINE_KEY = useMemo(
        () => `offline_msgs_${currentUser?.id ?? 'anon'}`,
        [currentUser?.id]
    );

    useEffect(() => {
        selectedChatRef.current = selectedChat;
    }, [selectedChat]);

    const fetchConversation = useCallback(async (chatId: string, pageNum: number, cancelled?: { current: boolean }) => {
        try {
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${chatId}),and(sender_id.eq.${chatId},receiver_id.eq.${currentUser.id})`)
                .order('created_at', { ascending: false })
                .range(pageNum * MESSAGES_PER_PAGE, (pageNum + 1) * MESSAGES_PER_PAGE - 1);

            if (cancelled?.current || error) return;
            
            const stored = await AsyncStorage.getItem(OFFLINE_KEY);
            const queue = stored ? JSON.parse(stored).map((m: any) => ({ ...m, isOffline: true, id: `temp-${Math.random()}` })) : [];

            if (pageNum === 0) {
                setLocalMessages([...queue, ...(data || [])]);
            } else {
                setLocalMessages(prev => [...prev, ...(data || [])]);
            }
            setHasMore((data || []).length === MESSAGES_PER_PAGE);
        } catch (err) {
            console.error("Pagination Fetch Error:", err);
        }
    }, [currentUser.id, OFFLINE_KEY]);

    const syncOfflineMessages = useCallback(async () => {
        if (isSyncingRef.current) return;
        isSyncingRef.current = true;
        try {
            const stored = await AsyncStorage.getItem(OFFLINE_KEY);
            if (!stored) return;
            
            const queue = JSON.parse(stored);
            if (queue.length === 0) return;

            const stillOffline = [];
            for (const msgPayload of queue) {
                const { error } = await supabase.from('messages').insert(msgPayload);
                if (error) stillOffline.push({ ...msgPayload, failed: true });
            }

            if (stillOffline.length > 0) {
                await AsyncStorage.setItem(OFFLINE_KEY, JSON.stringify(stillOffline));
                setLocalMessages(prev => prev.map(m => {
                    const matchingOffline = stillOffline.find(o => o.id === m.id);
                    return matchingOffline ? { ...m, failed: true } : m;
                }));
            } else {
                await AsyncStorage.removeItem(OFFLINE_KEY);
            }

            if (queue.length > stillOffline.length && selectedChatRef.current) {
                fetchConversation(selectedChatRef.current, 0); 
            }
        } catch (e) {
            console.error("Sync routine error:", e);
        } finally {
            isSyncingRef.current = false;
        }
    }, [OFFLINE_KEY, fetchConversation]);

    // Initial load and chat switch
    useEffect(() => {
        if (!selectedChat || !currentUser?.id) return;
        const cancelled = { current: false };

        setLocalMessages([]);
        setPage(0);
        setHasMore(true);

        fetchConversation(selectedChat, 0, cancelled);
        syncOfflineMessages();

        return () => { cancelled.current = true; };
    }, [selectedChat, currentUser?.id, fetchConversation, syncOfflineMessages]);

    // Reconnect Sync
    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            if (state.isConnected) {
                syncOfflineMessages();
            }
        });
        return () => unsubscribe();
    }, [syncOfflineMessages]);

    // Real-time
    useEffect(() => {
        if (!currentUser?.id || !selectedChat) return;

        const channelId = `chat:${[currentUser.id, selectedChat].sort().join('-')}`;
        const chatChannel = supabase.channel(channelId);
        activeChatChannelRef.current = chatChannel;

        chatChannel
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `receiver_id=eq.${currentUser.id}`
            }, (payload) => {
                const newMsg = payload.new;
                if (selectedChatRef.current && (newMsg.sender_id === selectedChatRef.current || newMsg.receiver_id === selectedChatRef.current)) {
                    setLocalMessages((prev) => {
                        const alreadyExists = prev.some((m) => m.id === newMsg.id);
                        if (alreadyExists) return prev;
                        return [newMsg, ...prev];
                    });
                    setIsOtherTyping(false); 
                }
            })
            .on('broadcast', { event: 'typing' }, ({ payload }) => {
                if (payload.sender_id === selectedChatRef.current) {
                    setIsOtherTyping(payload.isTyping);
                    if (incomingTypingTimeoutRef.current) clearTimeout(incomingTypingTimeoutRef.current);
                    if (payload.isTyping) {
                        incomingTypingTimeoutRef.current = setTimeout(() => setIsOtherTyping(false), 5000);
                    }
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(chatChannel);
            activeChatChannelRef.current = null;
        };
    }, [currentUser?.id, selectedChat]);

    // Typing Broadcast
    useEffect(() => {
        if (!selectedChat || !currentUser?.id || !activeChatChannelRef.current) return;
        
        if (msgInput.length > 0) {
            activeChatChannelRef.current.send({
                type: 'broadcast',
                event: 'typing',
                payload: { sender_id: currentUser.id, isTyping: true },
            });

            if (outgoingTypingTimeoutRef.current) clearTimeout(outgoingTypingTimeoutRef.current);
            outgoingTypingTimeoutRef.current = setTimeout(() => {
                activeChatChannelRef.current.send({
                    type: 'broadcast',
                    event: 'typing',
                    payload: { sender_id: currentUser.id, isTyping: false },
                });
            }, 3000);
        } else {
            activeChatChannelRef.current.send({
                type: 'broadcast',
                event: 'typing',
                payload: { sender_id: currentUser.id, isTyping: false },
            });
        }

        return () => {
            if (outgoingTypingTimeoutRef.current) clearTimeout(outgoingTypingTimeoutRef.current);
        };
    }, [msgInput, selectedChat, currentUser.id]);

    const queueOfflineMessage = useCallback(async (msgPayload: any) => {
        try {
            const stored = await AsyncStorage.getItem(OFFLINE_KEY);
            const queue = stored ? JSON.parse(stored) : [];
            queue.push(msgPayload);
            await AsyncStorage.setItem(OFFLINE_KEY, JSON.stringify(queue));
        } catch (e) {
            console.error("Offline queue error", e);
        }
    }, [OFFLINE_KEY]);

    const onSendDirect = useCallback(async (type = 'TEXT', url?: string, name?: string, metadataPayload?: any) => {
        const finalContent = typeof metadataPayload === 'string' ? metadataPayload : msgInput;
        if (!finalContent.trim() && !url && !metadataPayload) return;
        if (isSending || !selectedChat) return;
        
        setIsSending(true);
        const payload = {
            school_id: currentUser.school_id,
            sender_id: currentUser.id,
            receiver_id: selectedChat,
            content: finalContent,
            message_type: type,
            attachment_url: url,
            attachment_name: name,
            metadata: metadataPayload || null
        };

        const tempId = `temp_${Date.now()}`;
        const optimisticMsg = { ...payload, id: tempId, created_at: new Date().toISOString(), isOffline: true };
        setLocalMessages(prev => [optimisticMsg, ...prev]);

        try {
            const netState = await NetInfo.fetch();
            if (!netState.isConnected) {
                await queueOfflineMessage(payload);
                return;
            }

            const { data, error } = await supabase.from('messages').insert(payload).select().single();
            if (error) throw error;
            setLocalMessages(prev => prev.map(msg => msg.id === tempId ? data : msg));
        } catch (err) {
            await queueOfflineMessage(payload);
        } finally {
            setIsSending(false);
        }
    }, [currentUser, selectedChat, msgInput, isSending, queueOfflineMessage]);

    const loadMore = useCallback(async () => {
        if (!hasMore || loadingMore || !selectedChat) return;
        setLoadingMore(true);
        const nextPage = page + 1;
        await fetchConversation(selectedChat, nextPage);
        setPage(nextPage);
        setLoadingMore(false);
    }, [hasMore, loadingMore, selectedChat, page, fetchConversation]);

    return {
        localMessages,
        isOtherTyping,
        isSending,
        onSendDirect,
        loadMore,
        loadingMore,
        hasMore
    };
};
