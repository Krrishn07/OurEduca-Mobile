import * as React from 'react';
import { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, Modal, Pressable, Image, Linking, FlatList, Platform, Animated, Keyboard } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../../../lib/supabase';
import { BlurView } from 'expo-blur';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { Icons } from '../../../../components/Icons';
import { User, ChatMessage, UserRole } from '../../../../types';
import { AppTheme, AppCard, AppTypography, AppRow, StatusPill, SectionHeader, PlatinumHeader } from '../../../design-system';
import { formatAcademicTime } from '../../../utils/timeUtils';

interface TeacherMessagesProps {
  selectedChat: string | null;
  setSelectedChat: (id: string | null) => void;
  msgInput: string;
  setMsgInput: (text: string) => void;
  displayContacts: User[];
  chatMessages: ChatMessage[];
  currentUser: User;
  handleSendMessage: (type?: string, url?: string, name?: string, customContent?: string) => void | Promise<void>;
  uploadMessageFile: (schoolId: string, uri: string, name: string) => Promise<string>;
  assignments?: any[];
}

import NetInfo from '@react-native-community/netinfo';

const AttachmentModal = ({ visible, onClose, onSelect }: {
    visible: boolean;
    onClose: () => void;
    onSelect: (type: string) => void;
}) => {
    const insets = useSafeAreaInsets();
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View className="flex-1 justify-end">
                <Pressable 
                    className="absolute inset-0 bg-black/40"
                    onPress={onClose}
                />
                
                <View 
                  className="bg-white rounded-t-[40px] px-6 pt-8 shadow-2xl z-10"
                  style={{ paddingBottom: Math.max(insets.bottom, 24) }}
                >
                    <View className="w-12 h-1.5 bg-gray-100 rounded-full self-center mb-8" />
                    
                    <Text className="text-[18px] font-black text-gray-900 font-inter-black mb-2">Share Content</Text>
                    <Text className="text-[11px] font-black text-gray-400 uppercase tracking-widest font-inter-black mb-8">Select Institutional Resource</Text>
                    
                    <View className="flex-row flex-wrap justify-between">
                        {[
                            { id: 'DOC', label: 'Document', sub: 'PDF, Word, Excel', icon: 'FileText', color: '#4f46e5', bg: '#f5f7ff' },
                            { id: 'MEDIA', label: 'Media', sub: 'Photos & Videos', icon: 'Camera', color: '#ec4899', bg: '#fff1f2' },
                            { id: 'LINK', label: 'Link', sub: 'Academic URL', icon: 'Globe', color: AppTheme.colors.success, bg: '#f0fdf4' },
                            { id: 'ASSIGN', label: 'Assignment', sub: 'Existing Task', icon: 'Edit', color: '#f59e0b', bg: '#fffbeb' },
                        ].map((item) => {
                            const IconComp = (Icons as any)[item.icon];
                            return (
                                <TouchableOpacity 
                                    key={item.id}
                                    onPress={() => onSelect(item.id)}
                                    activeOpacity={0.7}
                                    className="w-[47%] mb-4 p-5 rounded-[24px] border border-gray-50 shadow-sm"
                                    style={{ backgroundColor: item.bg }}
                                >
                                    <View className="w-10 h-10 rounded-xl items-center justify-center mb-4" style={{ backgroundColor: 'white' }}>
                                        <IconComp size={20} color={item.color} />
                                    </View>
                                    <Text className="text-[14px] font-black text-gray-900 font-inter-black">{item.label}</Text>
                                    <Text className="text-[9px] font-bold text-gray-400 mt-1">{item.sub}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                    
                    <TouchableOpacity 
                        onPress={onClose}
                        className="mt-4 w-full py-4 bg-gray-50 rounded-2xl items-center justify-center border border-gray-100"
                    >
                        <Text className="text-[11px] font-black text-gray-400 uppercase tracking-widest font-inter-black">Cancel</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

export const TeacherMessages = React.memo<TeacherMessagesProps>(({
  selectedChat,
  setSelectedChat,
  msgInput,
  setMsgInput,
  displayContacts,
  chatMessages,
  currentUser,
  handleSendMessage,
  uploadMessageFile,
  assignments
}) => {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showAttachModal, setShowAttachModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkInput, setLinkInput] = useState('');
  const [showAssignModal, setShowAssignModal] = useState(false);

  // Keyboard Avoidance Logic
  const keyboardHeight = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const showSub = Animated.timing(keyboardHeight, {
      toValue: Platform.OS === 'ios' ? 340 : 0, // Fallback for estimation if needed, but listeners are better
      duration: 250,
      useNativeDriver: false,
    });

    const hideSub = Animated.timing(keyboardHeight, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    });

    const showListener = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideListener = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const s = (event: any) => {
      Animated.timing(keyboardHeight, {
        toValue: event.endCoordinates.height - (Platform.OS === 'ios' ? insets.bottom : 0),
        duration: event.duration || 250,
        useNativeDriver: false,
      }).start();
    };

    const h = (event: any) => {
      Animated.timing(keyboardHeight, {
        toValue: 0,
        duration: event.duration || 200,
        useNativeDriver: false,
      }).start();
    };

    const sSub = Keyboard.addListener(showListener, s);
    const hSub = Keyboard.addListener(hideListener, h);

    return () => {
      sSub.remove();
      hSub.remove();
    };
  }, [insets.bottom]);

  const filteredContacts = useMemo(() => {
    if (!searchQuery.trim()) return displayContacts || [];
    return (displayContacts || []).filter((c: User) => 
      c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.role?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [displayContacts, searchQuery]);

  const activeContact = (displayContacts || []).find((c: User) => c.id === selectedChat);
  
  // 1. Create a highly efficient O(1) lookup map to avoid O(N*M) render loops
  const lastMessagesMap = useMemo(() => {
    const map = new Map();
    const sortedMessages = [...(chatMessages || [])].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    sortedMessages.forEach(m => {
        const otherUserId = m.sender_id === currentUser.id ? m.receiver_id : m.sender_id;
        map.set(otherUserId, m);
    });
    return map;
  }, [chatMessages, currentUser.id]);

  const [localMessages, setLocalMessages] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const isSyncingRef = useRef(false);
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const MESSAGES_PER_PAGE = 20;

  const fetchConversation = async (chatId: string, pageNum: number) => {
      try {
          const { data, error } = await supabase
              .from('messages')
              .select('*')
              .or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${chatId}),and(sender_id.eq.${chatId},receiver_id.eq.${currentUser.id})`)
              .order('created_at', { ascending: false })
              .range(pageNum * MESSAGES_PER_PAGE, (pageNum + 1) * MESSAGES_PER_PAGE - 1);

          if (error) throw error;
          
          // PRESERVE OFFLINE MESSAGES: Don't let server fetch overwrite what's still in the outbox
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
  };

  useEffect(() => {
      if (selectedChat) {
          // 1. Clear old state to prevent ghosting
          setLocalMessages([]);
          setPage(0);
          setHasMore(true);
          setMsgInput(''); // FIX: Reset input when switching chats

          // 2. Fetch fresh data and sync
          fetchConversation(selectedChat, 0);
          syncOfflineMessages();
      }
  }, [selectedChat]);

  // AUTO-SYNC ON RECONNECT: Listen for network changes and trigger sync
  useEffect(() => {
      const unsubscribe = NetInfo.addEventListener(state => {
          if (state.isConnected) {
              syncOfflineMessages();
          }
      });
      return () => unsubscribe();
  }, [selectedChat]); // Also re-sync if we switch chats during reconnection

  // Real-time Messaging & Typing Subscription
  useEffect(() => {
    if (!currentUser?.id || !selectedChat) return;

    const channelId = `chat:${[currentUser.id, selectedChat].sort().join('-')}`;
    const chatChannel = supabase.channel(channelId);

    chatChannel
        .on(
            'postgres_changes',
            {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
            },
            (payload) => {
                const newMsg = payload.new;
                
                // Only update if message belongs to the active conversation
                if (
                    selectedChat &&
                    (newMsg.sender_id === selectedChat || newMsg.receiver_id === selectedChat)
                ) {
                    setLocalMessages((prev) => {
                        // Prevent duplicates (especially for messages we sent optimistically)
                        const alreadyExists = prev.some((m) => m.id === newMsg.id);
                        if (alreadyExists) return prev;

                        return [newMsg, ...prev];
                    });
                    setIsOtherTyping(false); 
                }
            }
        )
        .on('broadcast', { event: 'typing' }, ({ payload }) => {
            if (payload.sender_id === selectedChat) {
                setIsOtherTyping(payload.isTyping);
                
                // SAFETY FIX: Auto-clear if the student vanishes (crash/signal loss)
                if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
                if (payload.isTyping) {
                    typingTimeoutRef.current = setTimeout(() => {
                        setIsOtherTyping(false);
                    }, 5000); // 5s grace period
                }
            }
        })
        .subscribe();

    return () => {
        supabase.removeChannel(chatChannel);
    };
  }, [currentUser?.id, selectedChat]);

  // Broadcast own typing status
  useEffect(() => {
    if (!selectedChat || !currentUser?.id) return;
    
    const channelId = `chat:${[currentUser.id, selectedChat].sort().join('-')}`;
    const chatChannel = supabase.channel(channelId);

    if (msgInput.length > 0) {
        chatChannel.send({
            type: 'broadcast',
            event: 'typing',
            payload: { sender_id: currentUser.id, isTyping: true },
        });

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            chatChannel.send({
                type: 'broadcast',
                event: 'typing',
                payload: { sender_id: currentUser.id, isTyping: false },
            });
            setIsOtherTyping(false);
        }, 3000);
    } else {
        chatChannel.send({
            type: 'broadcast',
            event: 'typing',
            payload: { sender_id: currentUser.id, isTyping: false },
        });
    }
  }, [msgInput, selectedChat]);

  const handleLoadMore = async () => {
      if (!hasMore || loadingMore || !selectedChat) return;
      setLoadingMore(true);
      const nextPage = page + 1;
      await fetchConversation(selectedChat, nextPage);
      setPage(nextPage);
      setLoadingMore(false);
  };

  const OFFLINE_KEY = `offline_msgs_${currentUser.id}`;
  
  const queueOfflineMessage = async (msgObj: any) => {
      try {
          const stored = await AsyncStorage.getItem(OFFLINE_KEY);
          const queue = stored ? JSON.parse(stored) : [];
          queue.push(msgObj);
          await AsyncStorage.setItem(OFFLINE_KEY, JSON.stringify(queue));
          // No longer touching setLocalMessages here as it's handled by Optimistic UI or Sync
      } catch (e) {
          console.error("AsyncStorage error", e);
      }
  };

  const syncOfflineMessages = async () => {
      if (isSyncingRef.current) return;
      isSyncingRef.current = true;
      try {
          const stored = await AsyncStorage.getItem(OFFLINE_KEY);
          if (!stored) return;
          
          const queue = JSON.parse(stored);
          if (queue.length === 0) return;

          const stillOffline: any[] = [];

          // Process individually to prevent losing the whole batch if one fails
          for (const msgPayload of queue) {
              const { error } = await supabase.from('messages').insert(msgPayload);
              if (error) {
                  console.warn("Failed to sync offline message:", error);
                  // Mark as failed to trigger the Warning icon in UI
                  stillOffline.push({ ...msgPayload, failed: true });
              }
          }

          if (stillOffline.length > 0) {
              await AsyncStorage.setItem(OFFLINE_KEY, JSON.stringify(stillOffline));
              // Update local state to show failures
              setLocalMessages(prev => prev.map(m => {
                  const matchingOffline = stillOffline.find(o => o.id === m.id);
                  return matchingOffline ? { ...m, failed: true } : m;
              }));
          } else {
              await AsyncStorage.removeItem(OFFLINE_KEY);
          }

          if (queue.length > stillOffline.length && selectedChat) {
              fetchConversation(selectedChat, 0); 
          }
      } catch (e) {
          console.error("Sync routine error:", e);
      } finally {
          isSyncingRef.current = false;
      }
  };

  const onSendDirect = async (type = 'TEXT', url?: string, name?: string, metadataPayload?: any) => {
      const finalContent = typeof metadataPayload === 'string' ? metadataPayload : msgInput;
      if (!finalContent.trim() && !url && !metadataPayload) return;
      if (isSending || !selectedChat) return;
      
      setIsSending(true);
      
      const payload = {
          school_id: currentUser.schoolId,
          sender_id: currentUser.id,
          receiver_id: selectedChat,
          content: finalContent,
          message_type: type,
          attachment_url: url,
          attachment_name: name,
          metadata: metadataPayload || null
      };

      // 1. OPTIMISTIC UI: Inject immediately
      const tempId = `temp_${Date.now()}`;
      const optimisticMsg = { 
          ...payload, 
          id: tempId, 
          created_at: new Date().toISOString(),
          isOffline: true 
      };
      
      setLocalMessages(prev => [optimisticMsg, ...prev]);
      setMsgInput('');

      try {
          // 2. Pre-flight Connectivity Check to avoid "hanging" on timeout
          const netState = await NetInfo.fetch();
          if (!netState.isConnected) {
              await queueOfflineMessage(payload);
              setIsSending(false);
              return;
          }

          // 3. Send to Supabase and get the real row back
          const { data, error } = await supabase.from('messages').insert(payload).select().single();
          if (error) throw error;
          
          // 4. Replace temp message with server-confirmed data
          setLocalMessages(prev => prev.map(msg => msg.id === tempId ? data : msg));
      } catch (err: any) {
          console.error("Send error:", err);
          
          if (err.message?.includes('metadata') && err.message?.includes('not exist')) {
              Alert.alert("Database Schema Error", "The 'metadata' column is missing in your Supabase 'messages' table. Please add it as a JSONB column.");
          }
          
          await queueOfflineMessage(payload);
      } finally {
          setIsSending(false);
      }
  };

  const onSend = () => onSendDirect('TEXT');

  const handlePlusAction = () => {
    setShowAttachModal(true);
  };

  const onAttachmentSelect = async (type: string) => {
      setShowAttachModal(false);
      
      try {
          let result;
          if (type === 'DOC') {
              result = await DocumentPicker.getDocumentAsync({ type: '*/*', copyToCacheDirectory: true });
              if (!result.canceled) {
                  const asset = result.assets[0];
                  if (asset.size && asset.size > 10 * 1024 * 1024) {
                      Alert.alert("File Too Large", "Please select a document smaller than 10MB.");
                      return;
                  }
                  await processUpload(asset.uri, asset.name, 'DOCUMENT', asset.mimeType);
              }
          } else if (type === 'MEDIA') {
              result = await ImagePicker.launchImageLibraryAsync({
                  mediaTypes: ImagePicker.MediaTypeOptions.All,
                  allowsEditing: false,
                  quality: 0.7,
              });
              if (!result.canceled) {
                  const asset = result.assets[0];
                  if (asset.fileSize && asset.fileSize > 25 * 1024 * 1024) {
                      Alert.alert("File Too Large", "Please select media smaller than 25MB.");
                      return;
                  }
                  const fileName = asset.uri.split('/').pop() || 'upload.jpg';
                  await processUpload(asset.uri, fileName, asset.type === 'video' ? 'DOCUMENT' : 'IMAGE', asset.mimeType);
              }
          } else if (type === 'LINK') {
              setShowLinkModal(true);
          } else if (type === 'ASSIGN') {
              setShowAssignModal(true);
          }
      } catch (err: any) {
          Alert.alert("Upload Failed", err.message);
      }
  };

  const processUpload = async (uri: string, name: string, msgType: any, mimeType?: string) => {
      setIsUploading(true);
      try {
          const publicUrl = await uploadMessageFile(currentUser.schoolId || '', uri, name);
          await onSendDirect(msgType, publicUrl, name);
      } catch (err: any) {
          Alert.alert("Upload Error", err.message);
      } finally {
          setIsUploading(false);
      }
  };

  const renderMessageItem = useCallback(({ item: msg, index: idx }: { item: any, index: number }) => {
      const isMine = msg.sender_id === currentUser.id;
      const isImage = msg.message_type === 'IMAGE';
      const isDoc = msg.message_type === 'DOCUMENT';

      return (
         <View className={`mb-4 flex-row ${isMine ? 'justify-end' : 'justify-start'}`}>
             {!isMine && (
                 <View className="w-8 h-8 rounded-full bg-indigo-50 items-center justify-center mr-2 mt-auto">
                    <Text className="text-indigo-600 font-bold font-inter text-[12px]">{activeContact?.name?.charAt(0) || '?'}</Text>
                 </View>
             )}
              {isOtherTyping && idx === 0 && (
                 <View className="mb-4 flex-row justify-start">
                     <View className="w-8 h-8 rounded-full bg-indigo-50 items-center justify-center mr-2 mt-auto">
                        <Text className="text-indigo-600 font-bold font-inter text-[12px]">{activeContact?.name?.charAt(0) || '?'}</Text>
                     </View>
                     <View className="bg-white border border-gray-100 rounded-2xl px-4 py-2 shadow-sm flex-row items-center">
                         <Text className="text-[10px] text-gray-400 font-inter-bold italic">Typing...</Text>
                     </View>
                 </View>
              )}
                  <TouchableOpacity 
                     activeOpacity={(msg.attachment_url || msg.metadata?.url || msg.content?.includes('[LINK]:')) ? 0.7 : 1}
                     onPress={() => {
                         if (msg.attachment_url) {
                             Linking.openURL(msg.attachment_url).catch(() => Alert.alert('Error', 'Could not open attachment.'));
                         } else if (msg.metadata?.url) {
                             Linking.openURL(msg.metadata.url).catch(() => Alert.alert('Error', 'Could not open link.'));
                         } else if (msg.content?.includes('[LINK]:')) {
                             const extractedUrl = msg.content.split('[LINK]:')[1]?.trim();
                             if (extractedUrl) {
                                 Linking.openURL(extractedUrl).catch(() => Alert.alert('Error', 'Could not open link.'));
                             }
                         }
                     }}
                     className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${
                         isMine ? 'bg-indigo-600' : 'bg-white border border-gray-100'
                     } ${msg.isOffline ? 'opacity-70' : 'opacity-100'}`}
                 >
                     {isImage && (
                         <Image 
                             source={{ uri: msg.attachment_url }} 
                             className="w-48 h-48 rounded-xl mb-3 bg-gray-100"
                             resizeMode="cover"
                         />
                     )}
                     
                     {isDoc && (
                         <View className={`flex-row items-center p-3 rounded-xl mb-3 ${isMine ? 'bg-white/20' : 'bg-gray-50 border border-gray-100'}`}>
                             <Icons.FileText size={20} color={isMine ? 'white' : '#4f46e5'} />
                             <View className="ml-3">
                                 <Text className={`text-[10px] font-black font-inter-black ${isMine ? 'text-white' : 'text-gray-900'}`} numberOfLines={1}>
                                     {msg.attachment_name || 'Document'}
                                 </Text>
                                 <Text className={`text-[8px] font-bold ${isMine ? 'text-indigo-100' : 'text-gray-400'}`}>Click to view</Text>
                             </View>
                         </View>
                     )}

                     {(msg.message_type === 'ASSIGNMENT' || msg.metadata?.assignment_id || msg.content?.startsWith('[ASSIGNMENT]:')) ? (
                         <View className={`flex-row items-center p-3 rounded-xl mb-1 ${isMine ? 'bg-white/20' : 'bg-[#fffbeb] border border-[#fef3c7]'}`}>
                             <Icons.Edit size={20} color={isMine ? 'white' : '#f59e0b'} />
                             <View className="ml-3 flex-1">
                                 <Text className={`text-[12px] font-black font-inter-black ${isMine ? 'text-white' : 'text-gray-900'}`} numberOfLines={1}>
                                     {msg.metadata?.title || msg.content.split('|')[1] || 'Assignment'}
                                 </Text>
                                 <Text className={`text-[9px] font-bold mt-0.5 ${isMine ? 'text-indigo-100' : 'text-gray-500'}`}>
                                     Max Marks: {msg.metadata?.max_marks || msg.content.split('|')[2] || '100'}
                                 </Text>
                             </View>
                         </View>
                     ) : (
                         <Text className={`text-[14px] leading-relaxed font-inter-regular ${isMine ? 'text-white' : 'text-gray-800'}`}>
                             {msg.content}
                         </Text>
                     )}
                     <View className="flex-row items-center justify-end mt-1">
                         <Text className={`text-[9px] font-inter-medium ${isMine ? 'text-white/60' : 'text-gray-400'}`}>
                             {msg.isOffline ? 'Pending' : (msg.timestamp || formatAcademicTime(msg.created_at))}
                         </Text>
                         {isMine && (
                             msg.failed ? 
                             <View style={{marginLeft: 4}}><Icons.Alert size={10} color="#fb7185" /></View> :
                             msg.isOffline ? 
                             <View style={{marginLeft: 4}}><Icons.Clock size={10} color="white" /></View> : 
                             <View style={{marginLeft: 4}}><Icons.Check size={10} color="white" /></View>
                         )}
                     </View>
                 </TouchableOpacity>
         </View>
      );
  }, [currentUser.id, activeContact?.name, isOtherTyping]);

  const keyExtractor = useCallback((item: any, index: number) => item.id || String(index), []);

  return (
    <View className="flex-1 bg-gray-50" style={{ paddingBottom: Platform.OS === 'ios' ? 0 : insets.bottom }}>
      {!selectedChat ? (
        <View className="flex-1 bg-gray-50">
          <PlatinumHeader 
            title="Inbox"
            subtitle={`${(currentUser as any)?.school_name || 'Academy'} Node`}
            icon={
              <View className="w-10 h-10 rounded-full bg-indigo-50 items-center justify-center">
                <Icons.Messages size={20} color="#4f46e5" />
              </View>
            }
          />
              
              <View className="flex-row bg-gray-100 rounded-3xl items-center px-4 py-2 w-1/2 mx-4 mb-2">
                 <Icons.Search size={16} color="#9ca3af" />
                 <TextInput 
                    placeholder="Search..." 
                    placeholderTextColor="#9ca3af"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    className="flex-1 ml-2 text-[12px] text-gray-800 font-inter-regular" 
                 />
              </View>

          <ScrollView 
            className="flex-1 p-4 bg-gray-50" 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
          >
              {filteredContacts.map((contact: User) => {
                const lastMsg = lastMessagesMap.get(contact.id);
                return (
                  <TouchableOpacity
                    key={contact.id}
                    onPress={() => setSelectedChat(contact.id)}
                    className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm mb-3 flex-row items-center"
                  >
                    <View className="w-11 h-11 rounded-full bg-indigo-50 items-center justify-center mr-3 border border-indigo-100">
                      <Text className="text-indigo-600 font-inter-bold text-[15px]">
                        {contact.name?.charAt(0) || '?'}
                      </Text>
                    </View>
                    
                    <View className="flex-1">
                      <View className="flex-row justify-between items-center mb-1">
                        {/* Name constrained to prevent timestamp push */}
                        <Text className="font-inter-black text-gray-900 text-[14px] flex-1 mr-2" numberOfLines={1}>
                          {contact.name}
                        </Text>
                        <Text className="text-[10px] text-gray-400 font-inter-medium">
                          {lastMsg ? new Date(lastMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </Text>
                      </View>
                      
                      <View className="flex-row justify-between items-center">
                        <Text className="text-[12px] text-gray-500 font-inter-regular flex-1 mr-4" numberOfLines={1}>
                          {lastMsg?.content || "No message history..."}
                        </Text>
                        {/* Role Badge */}
                        <View className="px-1.5 py-0.5 bg-gray-50 rounded border border-gray-100">
                          <Text className="text-[7px] text-gray-500 uppercase font-inter-black tracking-widest">
                            {contact.role || 'STAFF'}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}

              {filteredContacts.length === 0 && (
                <View className="items-center justify-center py-20">
                  <View className="w-14 h-14 bg-white rounded-full items-center justify-center mb-4 shadow-sm border border-gray-100">
                    <Icons.Messages size={24} color="#e2e8f0" />
                  </View>
                  <Text className="text-[12px] font-medium text-gray-400 font-inter">
                    {searchQuery ? "No search results" : "No Active Dialogues"}
                  </Text>
                </View>
              )}
          </ScrollView>
        </View>
      ) : (
        <View className="flex-1 bg-gray-50">
          {/* Chat Header */}
          <PlatinumHeader 
            title={activeContact?.name || 'Academic Chat'}
            subtitle={activeContact?.role === UserRole.STUDENT ? 'SCHOLAR NODE' : activeContact?.role === UserRole.SUPER_ADMIN ? 'FACULTY HUB' : 'INSTITUTIONAL SYNC'}
            onBack={() => setSelectedChat(null)}
            rightAction={
              <TouchableOpacity className="w-10 h-10 bg-gray-50 rounded-xl items-center justify-center border border-gray-100 active:scale-95">
                <Icons.Phone size={18} color="#64748b" />
              </TouchableOpacity>
            }
          />

          <FlatList
              className="flex-1 p-4 bg-gray-50"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
              data={localMessages}
              inverted={true}
              onEndReached={handleLoadMore}
              onEndReachedThreshold={0.5}
              ListFooterComponent={loadingMore ? <ActivityIndicator size="small" color="#4f46e5" style={{marginVertical: 20}} /> : null}
              keyExtractor={keyExtractor}
              renderItem={renderMessageItem}
              ListEmptyComponent={
                  <View className="flex-1 items-center justify-center py-32">
                     <View className="w-14 h-14 bg-white rounded-full items-center justify-center mb-4 border border-gray-50 shadow-sm">
                       <Icons.Messages size={24} color="#e2e8f0" />
                     </View>
                     <Text style={{ textAlign: "center", opacity: 0.6 }} className="text-[12px] font-medium text-gray-500 font-inter">
                        Start a conversation 👋
                      </Text>
                  </View>
              }
          />

          <Animated.View 
            className="p-3 bg-white border-t border-gray-100 flex-row items-center space-x-2 shadow-2xl"
            style={{ 
              paddingBottom: Animated.add(keyboardHeight, Math.max(insets.bottom, 12)),
              marginBottom: 0
            }}
          >
            <TouchableOpacity 
              onPress={handlePlusAction}
              className="p-2.5 bg-gray-100 rounded-full mr-2"
            >
              <Icons.Plus size={20} color="#6b7280"/>
            </TouchableOpacity>
            
            <View className="flex-1 flex-row bg-gray-100 rounded-3xl items-center px-4 py-1 mr-2">
              <TextInput 
                value={msgInput} 
                onChangeText={setMsgInput} 
                className="flex-1 py-2 text-gray-800 text-sm font-inter-regular" 
                placeholder="Institutional message..." 
                placeholderTextColor="#6b7280"
                multiline
              />
            </View>

            <TouchableOpacity 
              onPress={onSend}
              className={`p-3 rounded-full items-center justify-center ${msgInput.trim() && !isSending && !isUploading ? 'bg-indigo-600 shadow-xl' : 'bg-gray-200'}`}
              disabled={(!msgInput.trim() && !isUploading) || isSending || isUploading}
            >
              {isSending || isUploading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Icons.Messages size={20} color="white" />
              )}
            </TouchableOpacity>
          </Animated.View>
        </View>
      )}

      <AttachmentModal 
        visible={showAttachModal}
        onClose={() => setShowAttachModal(false)}
        onSelect={onAttachmentSelect}
      />

      <Modal visible={showLinkModal} transparent animationType="fade" onRequestClose={() => setShowLinkModal(false)}>
          <View className="flex-1 justify-center bg-black/40 px-6">
              <View className="bg-white rounded-[32px] p-6 shadow-2xl">
                  <View className="w-12 h-12 rounded-2xl bg-emerald-50 items-center justify-center mb-4 border border-emerald-100">
                      <Icons.Globe size={24} color={AppTheme.colors.success} />
                  </View>
                  <Text className="text-[18px] font-black text-gray-900 font-inter-black mb-2">Share Link</Text>
                  <Text className="text-[12px] font-bold text-gray-400 mb-6">Enter an academic or institutional URL.</Text>
                  
                  <TextInput 
                      value={linkInput}
                      onChangeText={setLinkInput}
                      placeholder="https://"
                      placeholderTextColor="#94a3b8"
                      className="w-full h-14 bg-gray-50 border border-gray-100 rounded-[20px] px-5 text-[14px] text-gray-900 font-black mb-6 font-inter-black"
                      autoCapitalize="none"
                      autoCorrect={false}
                  />

                  <View className="flex-row justify-end space-x-3">
                      <TouchableOpacity 
                          onPress={() => setShowLinkModal(false)}
                          className="px-6 py-4 rounded-xl"
                      >
                          <Text className="text-[12px] font-black text-gray-400 font-inter-black">Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                          onPress={() => {
                              if (linkInput.trim()) {
                                  const urlStr = linkInput.trim().startsWith('http') ? linkInput.trim() : `https://${linkInput.trim()}`;
                                  try {
                                      new URL(urlStr);
                                      onSendDirect('LINK', undefined, undefined, { url: urlStr });
                                      setLinkInput('');
                                      setShowLinkModal(false);
                                  } catch (_) {
                                      Alert.alert("Invalid URL", "Please enter a valid website URL.");
                                  }
                              }
                          }}
                          className="px-6 py-4 bg-emerald-500 rounded-xl shadow-lg shadow-emerald-200"
                      >
                          <Text className="text-[12px] font-black text-white font-inter-black">Share Link</Text>
                      </TouchableOpacity>
                  </View>
              </View>
          </View>
      </Modal>

      <Modal visible={showAssignModal} transparent animationType="slide" onRequestClose={() => setShowAssignModal(false)}>
          <View className="flex-1 justify-end">
              <Pressable className="absolute inset-0 bg-black/40" onPress={() => setShowAssignModal(false)} />
              <View 
                className="bg-white rounded-t-[40px] px-6 pt-8 shadow-2xl h-[60%] z-10"
                style={{ paddingBottom: Math.max(insets.bottom, 24) }}
              >
                  <View className="w-12 h-1.5 bg-gray-100 rounded-full self-center mb-6" />
                  <Text className="text-[18px] font-black text-gray-900 font-inter-black mb-6">Share Assignment</Text>
                  
                  <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
                      {(assignments || []).map((assignment: any) => (
                          <TouchableOpacity 
                              key={assignment.id}
                              className="mb-4 p-5 rounded-[24px] border border-gray-50 bg-[#fffbeb] flex-row items-center"
                              onPress={() => {
                                  onSendDirect('ASSIGNMENT', undefined, undefined, {
                                      title: assignment.title,
                                      max_marks: assignment.max_marks || 100,
                                      assignment_id: assignment.id
                                  });
                                  setShowAssignModal(false);
                              }}
                          >
                              <View className="w-10 h-10 rounded-xl bg-white items-center justify-center shadow-sm">
                                  <Icons.Edit size={20} color="#f59e0b" />
                              </View>
                              <View className="ml-4 flex-1">
                                  <Text className="text-[14px] font-black text-gray-900 font-inter-black" numberOfLines={1}>{assignment.title}</Text>
                                  <Text className="text-[10px] font-bold text-gray-400 mt-1">Max Marks: {assignment.max_marks || 100}</Text>
                              </View>
                          </TouchableOpacity>
                      ))}
                      {(!assignments || assignments.length === 0) && (
                          <Text className="text-center text-gray-400 font-bold mt-10">No assignments available to share.</Text>
                      )}
                  </ScrollView>
              </View>
          </View>
      </Modal>
    </View>
  );
});
