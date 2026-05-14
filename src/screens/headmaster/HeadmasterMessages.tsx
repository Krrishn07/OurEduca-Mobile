import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Keyboard, Platform, Alert, Modal, Pressable, FlatList, KeyboardAvoidingView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, { FadeIn, FadeOut, Layout, useSharedValue, withSpring, withTiming, useAnimatedStyle, FadeInDown, SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icons } from '@components/common/Icons';
import { PlatinumHeader, PlatinumSearchHeader } from '@components/common';
import { User, ChatMessage } from '@/types';
import { isSameDay, formatDetailedDate } from '@utils/timeUtils';
import { HapticPatterns } from '@utils/haptics';
import { SPRING_CONFIG, DURATIONS, EASING_PLATINUM } from '@constants/motion';
import { SHADOWS } from '@constants/shadows';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';

interface HeadmasterMessagesProps {
  currentUser?: User;
  displayContacts: User[];
  chatMessages: ChatMessage[];
  handleSendMessage: (type: 'text' | 'image' | 'document', url?: string, name?: string, content?: string, targetId?: string) => Promise<void>;
  selectedChat: string | null;
  setSelectedChat: (id: string | null) => void;
  markMessagesAsRead: (senderId: string, receiverId: string) => Promise<void>;
  uploadMessageFile?: (schoolId: string, fileUri: string, fileName: string, mimeType?: string) => Promise<string>;
  fetchMoreMessages?: (schoolId: string, partnerId: string, offset: number) => Promise<void>;
  currentSchoolId?: string;
  msgInput: string;
  setMsgInput: (text: string) => void;
}

const MessageStatusIcon = ({ status }: { status: string }) => {
  switch (status) {
    case "sending": return <Icons.Clock size={12} color="#e0e7ff" />;
    case "sent": return <Icons.Check size={12} color="#e0e7ff" />;
    case "delivered": return <Icons.CheckCheck size={12} color="#e0e7ff" />;
    case "read": return <Icons.CheckCheck size={12} color="#6366f1" />;
    case "failed": return <Icons.AlertCircle size={12} color="#ef4444" />;
    default: return <Icons.Check size={12} color="#e0e7ff" />;
  }
};

export const HeadmasterMessages: React.FC<HeadmasterMessagesProps> = ({
  currentUser,
  displayContacts,
  chatMessages,
  handleSendMessage,
  selectedChat,
  setSelectedChat,
  markMessagesAsRead,
  uploadMessageFile,
  fetchMoreMessages,
  currentSchoolId,
  msgInput,
  setMsgInput
}) => {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const [isContentVisible, setIsContentVisible] = useState(false);
  const [stickyDate, setStickyDate] = useState<string>('');
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const handleShowAttachments = () => {
    HapticPatterns.modalOpen();
    setShowAttachments(true);
    setTimeout(() => setIsContentVisible(true), 50);
  };

  const handleHideAttachments = () => {
    HapticPatterns.selection();
    setIsContentVisible(false);
    setTimeout(() => setShowAttachments(false), 400);
  };
  
  // --- Animation Shared Values ---
  const chatSlide = useSharedValue(50);
  const chatOpacity = useSharedValue(0);
  const inboxSlide = useSharedValue(0);
  const inboxOpacity = useSharedValue(1);

  useEffect(() => {
    chatSlide.value = withSpring(selectedChat ? 0 : 50, SPRING_CONFIG);
    chatOpacity.value = withTiming(selectedChat ? 1 : 0, { duration: DURATIONS.screen, easing: EASING_PLATINUM });
    
    if (selectedChat) {
      inboxOpacity.value = withTiming(0, { duration: DURATIONS.screen, easing: EASING_PLATINUM });
      inboxSlide.value = withSpring(-50, SPRING_CONFIG);
    } else {
      inboxOpacity.value = withTiming(1, { duration: DURATIONS.screen, easing: EASING_PLATINUM });
      inboxSlide.value = withSpring(0, SPRING_CONFIG);
    }
  }, [selectedChat]);

  const chatAnimStyle = useAnimatedStyle(() => ({
    opacity: chatOpacity.value,
    transform: [{ translateX: chatSlide.value }]
  }));

  const inboxAnimStyle = useAnimatedStyle(() => ({
    opacity: inboxOpacity.value,
    transform: [{ translateX: inboxSlide.value }, { scale: withSpring(selectedChat ? 0.96 : 1, SPRING_CONFIG) }]
  }));

  useEffect(() => {
    setStickyDate('');
    if (selectedChat && currentUser?.id && markMessagesAsRead) {
      // Clear unread count when chat opens
      markMessagesAsRead(selectedChat, currentUser.id);
    }
  }, [selectedChat, currentUser?.id, markMessagesAsRead]);

  // Reactive mark as read: If new messages arrive while chat is open, mark them as read
  useEffect(() => {
    if (selectedChat && currentUser?.id && markMessagesAsRead && filteredMessages.length > 0) {
      const hasUnread = filteredMessages.some(m => m.sender_id === selectedChat && m.status !== 'read');
      if (hasUnread) {
        markMessagesAsRead(selectedChat, currentUser.id);
      }
    }
  }, [filteredMessages, selectedChat, currentUser?.id, markMessagesAsRead]);

  const activeContact = useMemo(() => 
    displayContacts.find(c => c.id === selectedChat),
    [displayContacts, selectedChat]
  );

  const { lastMessagesMap, unreadCountsMap } = useMemo(() => {
    const lastMap = new Map<string, ChatMessage>();
    const unreadMap = new Map<string, number>();

    (chatMessages || []).forEach(msg => {
      const otherId = msg.sender_id === currentUser?.id ? msg.receiver_id : msg.sender_id;
      const existing = lastMap.get(otherId);
      if (!existing || new Date(msg.created_at) > new Date(existing.created_at)) {
        lastMap.set(otherId, msg);
      }
      if (msg.sender_id !== currentUser?.id && msg.status !== 'read') {
        unreadMap.set(otherId, (unreadMap.get(otherId) || 0) + 1);
      }
    });

    return { lastMessagesMap: lastMap, unreadCountsMap: unreadMap };
  }, [chatMessages, currentUser?.id]);

  const getLastMsgPreview = useCallback((msg: ChatMessage | undefined): string => {
    if (!msg) return 'No messages yet';
    if (msg.message_type === 'image') return '📷 Photo';
    if (msg.message_type === 'document') return `📄 ${msg.attachment_name || 'Document'}`;
    return msg.content || 'No messages yet';
  }, []);

  const filteredContacts = useMemo(() => {
    return (displayContacts || []).filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase())
    ).sort((a, b) => {
      const lastA = lastMessagesMap.get(a.id)?.created_at || 0;
      const lastB = lastMessagesMap.get(b.id)?.created_at || 0;
      return new Date(lastB).getTime() - new Date(lastA).getTime();
    });
  }, [displayContacts, searchQuery, lastMessagesMap]);

  const filteredMessages = useMemo(() => {
    if (!selectedChat || !currentUser?.id) return [];
    return (chatMessages || [])
      .filter(m => 
        (m.sender_id === currentUser.id && m.receiver_id === selectedChat) ||
        (m.sender_id === selectedChat && m.receiver_id === currentUser.id)
      )
      .map(m => ({ ...m, _ts: new Date(m.created_at).getTime() }))
      .sort((a, b) => b._ts - a._ts);
  }, [chatMessages, selectedChat, currentUser?.id]);

  const handleLoadMoreMessages = useCallback(async () => {
    if (!selectedChat || !currentSchoolId || !fetchMoreMessages || isFetchingMore) return;
    if (filteredMessages.length < 50) return;
    setIsFetchingMore(true);
    try {
      await fetchMoreMessages(currentSchoolId, selectedChat, filteredMessages.length);
    } finally {
      setIsFetchingMore(false);
    }
  }, [selectedChat, currentSchoolId, fetchMoreMessages, isFetchingMore, filteredMessages.length]);

  const onSend = useCallback(async () => {
    if (!msgInput.trim() || !selectedChat) return;
    const content = msgInput.trim();
    setMsgInput('');
    HapticPatterns.send();
    try {
      await handleSendMessage('text', undefined, undefined, content, selectedChat);
    } catch (err) {
      HapticPatterns.error();
      setMsgInput(content);
      Alert.alert('Send Failed', 'Message could not be delivered.');
    }
  }, [msgInput, selectedChat, handleSendMessage, setMsgInput]);

  const sendFile = useCallback(async (uri: string, type: 'image' | 'document', name?: string) => {
    if (!uploadMessageFile || !selectedChat || !currentSchoolId) return;
    setIsSending(true);
    HapticPatterns.send();
    try {
      const fileName = name || `attachment_${Date.now()}.${type === 'image' ? 'jpg' : 'pdf'}`;
      const uploadedUrl = await uploadMessageFile(currentSchoolId, uri, fileName, type);
      await handleSendMessage(type, uploadedUrl, fileName, undefined, selectedChat);
    } catch {
      HapticPatterns.error();
      Alert.alert('Upload Failed', 'Could not send the file.');
    } finally {
      setIsSending(false);
    }
  }, [uploadMessageFile, selectedChat, handleSendMessage, currentSchoolId]);

  const handleAttachmentPress = async (type: 'camera' | 'gallery' | 'document') => {
    handleHideAttachments();
    await new Promise(r => setTimeout(r, 400));
    try {
      if (type === 'camera') {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) return;
        const result = await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7, allowsEditing: true });
        if (!result.canceled) await sendFile(result.assets[0].uri, 'image');
      } else if (type === 'gallery') {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) return;
        const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7 });
        if (!result.canceled) await sendFile(result.assets[0].uri, 'image');
      } else if (type === 'document') {
        const result = await DocumentPicker.getDocumentAsync({ type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'] });
        if (!result.canceled) await sendFile(result.assets[0].uri, 'document', result.assets[0].name);
      }
    } catch (err) {
      HapticPatterns.error();
    }
  };

  const renderMessageItem = useCallback(({ item: msg, index }: { item: ChatMessage, index: number }) => {
    const isMine = msg.sender_id === currentUser?.id;
    const nextMsg = filteredMessages[index + 1];
    const showDateDivider = !nextMsg || !isSameDay(new Date(msg.created_at), new Date(nextMsg.created_at));

    return (
      <View className="w-full">
        {showDateDivider && (
          <View className="items-center my-4 w-full">
            <View className="bg-gray-100 px-4 py-1.5 rounded-full border border-gray-50">
              <Text className="text-[10px] font-black text-gray-400 uppercase tracking-[1px]">
                {formatDetailedDate(new Date(msg.created_at))}
              </Text>
            </View>
          </View>
        )}
        <Animated.View entering={FadeInDown.springify()} layout={Layout.springify()} className={`mb-3 flex-row w-full ${isMine ? 'justify-end' : 'justify-start'}`}>
          {isMine ? (
            <LinearGradient
              colors={['#5B4CF0', '#4F46E5']}
              style={{ alignSelf: 'flex-end', maxWidth: '72%', minWidth: 90, paddingVertical: 8, paddingHorizontal: 16 }}
              className="rounded-tl-3xl rounded-tr-md rounded-bl-3xl rounded-br-3xl shadow-sm"
            >
              {msg.message_type === 'image' && msg.attachment_url && (
                <View className="mb-2 rounded-2xl overflow-hidden border border-white/20">
                  <Image source={{ uri: msg.attachment_url }} className="w-full h-40" resizeMode="cover" />
                </View>
              )}
              {msg.message_type === 'document' && (
                <View className="flex-row items-center bg-white/10 p-3 rounded-2xl mb-2 border border-white/10">
                  <View className="w-10 h-10 bg-white/20 rounded-xl items-center justify-center mr-3">
                    <Icons.FileText size={20} color="white" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-white text-[12px] font-bold" numberOfLines={1}>{msg.attachment_name || 'Document'}</Text>
                    <Text className="text-indigo-100 text-[10px] font-medium uppercase">Download PDF</Text>
                  </View>
                </View>
              )}
              {msg.content && <Text className="text-[14px] font-medium leading-relaxed text-white">{msg.content}</Text>}
              <View className="flex-row items-center justify-end mt-1.5 space-x-1.5 opacity-70">
                <Text className="text-[9px] font-black uppercase text-indigo-100">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                <MessageStatusIcon status={msg.status || 'sent'} />
              </View>
            </LinearGradient>
          ) : (
            <View style={{ alignSelf: 'flex-start', maxWidth: '72%', minWidth: 90, paddingVertical: 8, paddingHorizontal: 16 }} className="rounded-tl-md rounded-tr-3xl rounded-bl-3xl rounded-br-3xl bg-white border border-gray-100 shadow-sm">
              {msg.message_type === 'image' && msg.attachment_url && (
                <View className="mb-2 rounded-2xl overflow-hidden border border-gray-50">
                  <Image source={{ uri: msg.attachment_url }} className="w-full h-40" resizeMode="cover" />
                </View>
              )}
              {msg.message_type === 'document' && (
                <View className="flex-row items-center bg-gray-50 p-3 rounded-2xl mb-2 border border-gray-100">
                  <View className="w-10 h-10 bg-indigo-50 rounded-xl items-center justify-center mr-3">
                    <Icons.FileText size={20} color="#4f46e5" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-800 text-[12px] font-bold" numberOfLines={1}>{msg.attachment_name || 'Document'}</Text>
                    <Text className="text-gray-400 text-[10px] font-medium uppercase">Shared File</Text>
                  </View>
                </View>
              )}
              {msg.content && <Text className="text-[14px] font-medium leading-relaxed text-gray-800">{msg.content}</Text>}
              <View className="flex-row items-center justify-start mt-1.5 space-x-1.5 opacity-70">
                <Text className="text-[9px] font-black uppercase text-gray-400">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
              </View>
            </View>
          )}
        </Animated.View>
      </View>
    );
  }, [filteredMessages, currentUser?.id]);

  const renderContactItem = useCallback(({ item: contact }: { item: User }) => {
    const lastMsg = lastMessagesMap.get(contact.id);
    const unreadCount = unreadCountsMap.get(contact.id) || 0;
    const isUnread = unreadCount > 0;

    return (
      <Pressable 
        onPress={() => { HapticPatterns.selection(); setSelectedChat(contact.id); }} 
        style={({ pressed }) => ({ opacity: pressed ? 0.92 : 1, transform: [{ scale: pressed ? 0.99 : 1 }], ...SHADOWS.level1 })}
        className={`flex-row items-center px-4 py-3 bg-white rounded-2xl mb-2 border ${isUnread ? 'border-indigo-100/30' : 'border-gray-50'} w-full`}
      >
        <View className="w-12 h-12 rounded-2xl items-center justify-center mr-4 bg-indigo-50 border border-indigo-100/20 overflow-hidden">
          <Text className="font-black text-xl text-indigo-600">{contact.name.charAt(0)}</Text>
        </View>
        <View className="flex-1">
          <View className="flex-row justify-between items-center mb-1">
            <Text className={`text-[15px] ${isUnread ? 'font-black text-gray-900' : 'font-bold text-gray-600'}`} numberOfLines={1}>{contact.name}</Text>
            {isUnread && (
              <View className="bg-indigo-600 px-2 py-0.5 rounded-full min-w-[20px] items-center">
                <Text className="text-white text-[10px] font-bold">{unreadCount}</Text>
              </View>
            )}
          </View>
          <Text className={`text-[13px] ${isUnread ? 'text-gray-700 font-bold' : 'text-gray-400 font-medium'}`} numberOfLines={1}>
            {getLastMsgPreview(lastMsg)}
          </Text>
        </View>
      </Pressable>
    );
  }, [lastMessagesMap, unreadCountsMap, getLastMsgPreview, setSelectedChat]);

  return (
    <View className="flex-1 bg-gray-50 w-full">
      <View className="flex-1 relative w-full">
        <Animated.View className="absolute inset-0 z-10 w-full h-full" pointerEvents={selectedChat ? 'none' : 'auto'} style={inboxAnimStyle}>
          <PlatinumSearchHeader title="Leadership Sync" subtitle="Executive Dispatch" searchValue={searchQuery} onSearchChange={setSearchQuery} placeholder="Search personnel..." />
          <FlatList 
            data={filteredContacts} keyExtractor={(item) => item.id} renderItem={renderContactItem}
            className="flex-1 mt-4 px-4 w-full" showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 120 }}
          />
        </Animated.View>

        <Animated.View className="absolute inset-0 z-20 w-full h-full" pointerEvents={selectedChat ? 'auto' : 'none'} style={chatAnimStyle}>
          {selectedChat && (
            <View className="flex-1 bg-gray-50 w-full">
              <PlatinumHeader title={activeContact?.name || 'Chat'} onBack={() => setSelectedChat(null)} />
              <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }} keyboardVerticalOffset={Platform.OS === 'ios' ? 96 : 0}>
                <FlatList 
                  data={filteredMessages} keyExtractor={(item) => item.id ?? `${item.sender_id}_${item.created_at}`}
                  className="flex-1 px-4 pt-4 w-full" inverted
                  renderItem={renderMessageItem} onEndReached={handleLoadMoreMessages} onEndReachedThreshold={0.5}
                />
                <View className="px-4 py-3 bg-white border-t border-gray-100 flex-row items-end w-full" style={{ paddingBottom: Math.max(insets.bottom, 12) }}>
                  <Pressable onPress={handleShowAttachments} className="w-10 h-10 bg-indigo-50 rounded-xl items-center justify-center mr-2 border border-indigo-100/50">
                    <Icons.Plus size={20} color="#4f46e5" />
                  </Pressable>
                  <TextInput value={msgInput} onChangeText={setMsgInput} placeholder="Type message..." multiline style={{ maxHeight: 120 }} className="flex-1 bg-gray-50 rounded-xl px-4 py-2 border border-gray-100 font-bold text-[14px]" />
                  <Pressable onPress={onSend} disabled={!msgInput.trim()} className="ml-2 w-10 h-10 bg-indigo-600 rounded-xl items-center justify-center">
                    <Icons.Send size={18} color="white" />
                  </Pressable>
                </View>
              </KeyboardAvoidingView>
            </View>
          )}
        </Animated.View>

        <Modal transparent visible={showAttachments} animationType="fade">
          <Pressable className="flex-1 justify-end" onPress={handleHideAttachments}>
            {isContentVisible && <BlurView intensity={30} tint="dark" className="absolute inset-0" />}
            {isContentVisible && (
              <Animated.View entering={SlideInDown.springify()} exiting={SlideOutDown.springify()} className="bg-white rounded-t-[32px] px-8 py-10" style={SHADOWS.level3}>
                <View className="flex-row justify-evenly mb-8">
                  <Pressable onPress={() => handleAttachmentPress('camera')} className="items-center">
                    <View className="w-14 h-14 bg-indigo-600 rounded-3xl items-center justify-center mb-3"><Icons.Camera size={22} color="white" /></View>
                    <Text className="text-[10px] font-black uppercase">Camera</Text>
                  </Pressable>
                  <Pressable onPress={() => handleAttachmentPress('gallery')} className="items-center">
                    <View className="w-14 h-14 bg-indigo-50 rounded-3xl items-center justify-center mb-3"><Icons.Layers size={22} color="#4f46e5" /></View>
                    <Text className="text-[10px] font-black uppercase">Photos</Text>
                  </Pressable>
                  <Pressable onPress={() => handleAttachmentPress('document')} className="items-center">
                    <View className="w-14 h-14 bg-emerald-50 rounded-3xl items-center justify-center mb-3"><Icons.FileText size={22} color="#10b981" /></View>
                    <Text className="text-[10px] font-black uppercase">Files</Text>
                  </Pressable>
                </View>
                <Pressable onPress={handleHideAttachments} className="bg-gray-100 h-[56px] justify-center rounded-2xl items-center">
                  <Text className="text-[11px] font-semibold text-gray-500 uppercase tracking-[0.5px]">Dismiss</Text>
                </Pressable>
              </Animated.View>
            )}
          </Pressable>
        </Modal>
      </View>
    </View>
  );
};
