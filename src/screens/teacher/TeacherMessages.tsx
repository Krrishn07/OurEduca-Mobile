import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Keyboard, Platform, Alert, Modal, Pressable, FlatList, KeyboardAvoidingView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, { FadeIn, FadeOut, Layout, useSharedValue, withSpring, withTiming, useAnimatedStyle, FadeInDown, FadeOutUp, SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icons } from '@components/common/Icons';
import { PlatinumHeader } from '@components/common';
import { User, ChatMessage, UserRole } from '@/types';
import { isSameDay, formatDetailedDate } from '@utils/timeUtils';
import { triggerHaptic, HapticPatterns } from '@utils/haptics';
import { SPRING_CONFIG, DURATIONS, EASING_PLATINUM } from '@constants/motion';
import { SHADOWS } from '@constants/shadows';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';

interface TeacherMessagesProps {
  currentUser?: User;
  displayContacts: User[];
  chatMessages: ChatMessage[];
  handleSendMessage: (type: 'text' | 'image' | 'document', url?: string, name?: string, content?: string, targetId?: string) => Promise<void>;
  selectedChat: string | null;
  setSelectedChat: (id: string | null) => void;
  markMessagesAsRead: (senderId: string, receiverId: string) => Promise<void>;
  uploadMessageFile: (schoolId: string, fileUri: string, fileName: string, mimeType?: string) => Promise<string>;
  fetchMoreMessages?: (schoolId: string, partnerId: string, offset: number) => Promise<void>;
  assignments?: any[];
  initialMessage?: string | null;
  onMessageInjected?: () => void;
  currentSchoolId?: string;
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

export const TeacherMessages: React.FC<TeacherMessagesProps> = ({
  currentUser,
  displayContacts,
  chatMessages,
  handleSendMessage,
  selectedChat,
  setSelectedChat,
  markMessagesAsRead,
  uploadMessageFile,
  fetchMoreMessages,
  assignments,
  initialMessage,
  onMessageInjected,
  currentSchoolId
}) => {
  const insets = useSafeAreaInsets();
  const [msgInput, setMsgInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const [showAssignmentPicker, setShowAssignmentPicker] = useState(false);
  const [isContentVisible, setIsContentVisible] = useState(false);

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
  
  const [stickyDate, setStickyDate] = useState<string>('');
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const searchRef = useRef<TextInput>(null);

  // --- Animation Shared Values ---
  const chatSlide = useSharedValue(50);
  const chatOpacity = useSharedValue(0);
  const inboxSlide = useSharedValue(0);
  const inboxOpacity = useSharedValue(1);

  useEffect(() => {
    // Chat layer animation
    chatSlide.value = withSpring(selectedChat ? 0 : 50, { damping: 20, stiffness: 120 });
    chatOpacity.value = withSpring(selectedChat ? 1 : 0, { damping: 25 });
    
    // Inbox layer animation
    inboxSlide.value = withSpring(selectedChat ? -20 : 0, { damping: 20, stiffness: 120 });
    chatSlide.value = withSpring(selectedChat ? 0 : 50, SPRING_CONFIG);
    chatOpacity.value = withTiming(selectedChat ? 1 : 0, { duration: DURATIONS.screen, easing: EASING_PLATINUM });
  }, [selectedChat]);

  const chatAnimStyle = useAnimatedStyle(() => ({
    opacity: chatOpacity.value,
    transform: [{ translateX: chatSlide.value }]
  }));

  useEffect(() => {
    if (selectedChat) {
      inboxOpacity.value = withTiming(0, { duration: DURATIONS.screen, easing: EASING_PLATINUM });
      inboxSlide.value = withSpring(-50, SPRING_CONFIG);
    } else {
      inboxOpacity.value = withTiming(1, { duration: DURATIONS.screen, easing: EASING_PLATINUM });
      inboxSlide.value = withSpring(0, SPRING_CONFIG);
    }
  }, [selectedChat]);

  const inboxAnimStyle = useAnimatedStyle(() => ({
    opacity: inboxOpacity.value,
    transform: [{ translateX: inboxSlide.value }, { scale: withSpring(selectedChat ? 0.96 : 1, SPRING_CONFIG) }]
  }));

  const stickyOpacity = useSharedValue(0);
  useEffect(() => {
    stickyOpacity.value = withSpring(stickyDate ? 1 : 0, SPRING_CONFIG);
  }, [stickyDate]);

  const stickyAnimStyle = useAnimatedStyle(() => ({
    opacity: stickyOpacity.value,
    transform: [{ translateY: withSpring(stickyDate ? 0 : -10, SPRING_CONFIG) }]
  }));

  // Handle injected message templates (e.g. from Reports)
  useEffect(() => {
    if (initialMessage && !msgInput) {
      setMsgInput(initialMessage);
      onMessageInjected?.();
    }
  }, [initialMessage]);

  // PERSISTENT READ SYNC: Update database status when chat is selected
  useEffect(() => {
    setStickyDate(''); // Reset sticky date on chat switch
    if (selectedChat && currentUser?.id && markMessagesAsRead) {
      markMessagesAsRead(selectedChat, currentUser.id);
    }
  }, [selectedChat, currentUser?.id, markMessagesAsRead]);

  const hasContent = useSharedValue(0);

  useEffect(() => {
    hasContent.value = withSpring(msgInput.trim() ? 1 : 0, { damping: 12, stiffness: 150 });
  }, [msgInput]);

  const sendButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + hasContent.value * 0.02 }]
  }));

  const toggleSearch = () => {
    HapticPatterns.selection();
    setIsSearchVisible(!isSearchVisible);
    if (!isSearchVisible) {
      setTimeout(() => searchRef.current?.focus(), 100);
    } else {
      setSearchQuery('');
      Keyboard.dismiss();
    }
  };

  const activeContact = useMemo(() => 
    displayContacts.find(c => c.id === selectedChat),
    [displayContacts, selectedChat]
  );

  const { lastMessagesMap, unreadCountsMap } = useMemo(() => {
    const lastMap = new Map<string, ChatMessage>();
    const unreadMap = new Map<string, number>();

    (chatMessages || []).forEach(msg => {
      const otherId = msg.sender_id === currentUser?.id ? msg.receiver_id : msg.sender_id;
      
      // Last message sync
      const existing = lastMap.get(otherId);
      if (!existing || new Date(msg.created_at) > new Date(existing.created_at)) {
        lastMap.set(otherId, msg);
      }

      // Unread count sync
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
    if (msg.message_type === 'assignment') return '📋 Assignment shared';
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
  }, [msgInput, selectedChat, handleSendMessage]);

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
  }, [uploadMessageFile, selectedChat, handleSendMessage]);

  const handleAttachmentPress = async (type: 'camera' | 'gallery' | 'document') => {
    handleHideAttachments();
    await new Promise(r => setTimeout(r, 400));
    try {
      if (type === 'camera') {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          Alert.alert('Permission Required', 'Camera access is needed to take photos.');
          return;
        }
        const result = await ImagePicker.launchCameraAsync({ 
          mediaTypes: ImagePicker.MediaTypeOptions.Images, 
          quality: 0.7,
          allowsEditing: true
        });
        if (!result.canceled) {
          await sendFile(result.assets[0].uri, 'image');
        }

      } else if (type === 'gallery') {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
          Alert.alert('Permission Required', 'Photo library access is needed.');
          return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({ 
          mediaTypes: ImagePicker.MediaTypeOptions.Images, 
          quality: 0.7 
        });
        if (!result.canceled) {
          await sendFile(result.assets[0].uri, 'image');
        }

      } else if (type === 'document') {
        const result = await DocumentPicker.getDocumentAsync({ 
          type: [
            'application/pdf', 
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          ] 
        });
        if (!result.canceled) await sendFile(result.assets[0].uri, 'document', result.assets[0].name);
      }
    } catch (err) {
      HapticPatterns.error();
      Alert.alert('Error', 'Could not open picker.');
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
        <Animated.View 
          entering={FadeInDown.springify()} 
          layout={Layout.springify()}
          className={`mb-3 flex-row w-full ${isMine ? 'justify-end' : 'justify-start'}`}
        >
          {isMine ? (
            <LinearGradient
              colors={['#5B4CF0', '#4F46E5']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ alignSelf: 'flex-end', maxWidth: '72%', minWidth: 90, paddingVertical: 8, paddingHorizontal: 16 }}
              className="rounded-tl-3xl rounded-tr-md rounded-bl-3xl rounded-br-3xl shadow-sm"
            >
              {msg.message_type === 'image' && msg.attachment_url && (
                <View className="mb-2 rounded-2xl overflow-hidden border border-white/20">
                  <Animated.Image 
                    source={{ uri: msg.attachment_url }} 
                    className="w-full h-40" 
                    resizeMode="cover"
                  />
                </View>
              )}

              {msg.message_type === 'document' && (
                <View className="flex-row items-center bg-white/10 p-3 rounded-2xl mb-2 border border-white/10">
                  <View className="w-10 h-10 bg-white/20 rounded-xl items-center justify-center mr-3">
                    <Icons.FileText size={20} color="white" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-white text-[12px] font-bold" numberOfLines={1}>
                      {msg.attachment_name || 'Document'}
                    </Text>
                    <Text className="text-indigo-100 text-[10px] font-medium uppercase">Download PDF</Text>
                  </View>
                </View>
              )}

              {msg.content && (
                <Text className="text-[14px] font-medium leading-relaxed text-white">{msg.content}</Text>
              )}
              
              <View className="flex-row items-center justify-end mt-1.5 space-x-1.5 opacity-70">
                <Text className="text-[9px] font-black uppercase text-indigo-100">
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
                <MessageStatusIcon status={msg.status || 'sent'} />
              </View>
            </LinearGradient>
          ) : (
            <View 
              style={{ alignSelf: 'flex-start', maxWidth: '72%', minWidth: 90, paddingVertical: 8, paddingHorizontal: 16 }}
              className="rounded-tl-md rounded-tr-3xl rounded-bl-3xl rounded-br-3xl bg-white border border-gray-100 shadow-sm"
            >
              {msg.message_type === 'image' && msg.attachment_url && (
                <View className="mb-2 rounded-2xl overflow-hidden border border-gray-50">
                  <Animated.Image 
                    source={{ uri: msg.attachment_url }} 
                    className="w-full h-40" 
                    resizeMode="cover"
                  />
                </View>
              )}

              {msg.message_type === 'document' && (
                <View className="flex-row items-center bg-gray-50 p-3 rounded-2xl mb-2 border border-gray-100">
                  <View className="w-10 h-10 bg-indigo-50 rounded-xl items-center justify-center mr-3">
                    <Icons.FileText size={20} color="#4f46e5" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-800 text-[12px] font-bold" numberOfLines={1}>
                      {msg.attachment_name || 'Document'}
                    </Text>
                    <Text className="text-gray-400 text-[10px] font-medium uppercase">Shared File</Text>
                  </View>
                </View>
              )}

              {msg.content && (
                <Text className="text-[14px] font-medium leading-relaxed text-gray-800">{msg.content}</Text>
              )}
              
              <View className="flex-row items-center justify-start mt-1.5 space-x-1.5 opacity-70">
                <Text className="text-[9px] font-black uppercase text-gray-400">
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            </View>
          )}
        </Animated.View>
      </View>
    );
  }, [filteredMessages, currentUser?.id]);

  const renderContactItem = useCallback(({ item: contact }: { item: User }) => {
    const lastMsg = lastMessagesMap.get(contact.id);
    const rawUnreadCount = unreadCountsMap.get(contact.id) || 0;
    const isUnread = rawUnreadCount > 0;

    const handleSelectContact = () => {
      HapticPatterns.selection();
      setSelectedChat(contact.id);
    };

    return (
      <Pressable 
        onPress={handleSelectContact} 
        style={({ pressed }) => ({
          opacity: pressed ? 0.92 : 1,
          transform: [{ scale: pressed ? 0.99 : 1 }],
          ...SHADOWS.level1
        })}
        className={`flex-row items-center px-4 py-3 bg-white rounded-2xl mb-2 border ${isUnread ? 'border-indigo-100/30' : 'border-gray-50'} w-full`}
      >
        <View className="w-12 h-12 rounded-2xl items-center justify-center mr-4 bg-indigo-50 border border-indigo-100/20 overflow-hidden">
          {contact.avatar ? (
            <Animated.Image source={{ uri: contact.avatar }} className="w-full h-full" />
          ) : (
            <Text className="font-black text-xl text-indigo-600">{contact.name.charAt(0)}</Text>
          )}
        </View>
        <View className="flex-1">
          <View className="flex-row justify-between items-center mb-1">
            <Text className={`text-[15px] ${isUnread ? 'font-black text-gray-900' : 'font-bold text-gray-600'}`} numberOfLines={1}>{contact.name}</Text>
            <View className="flex-row items-center space-x-2">
              {lastMsg && (
                <Text className="text-[10px] font-bold text-gray-400">
                  {new Date(lastMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              )}
              {isUnread && (
                <View className="bg-indigo-600 px-2 py-0.5 rounded-full min-w-[20px] items-center">
                  <Text className="text-white text-[10px] font-bold">{rawUnreadCount}</Text>
                </View>
              )}
            </View>
          </View>
          <Text className={`text-[13px] ${isUnread ? 'text-gray-700 font-bold' : 'text-gray-400 font-medium'}`} numberOfLines={1}>
            {getLastMsgPreview(lastMsg)}
          </Text>
        </View>
      </Pressable>
    );
  }, [lastMessagesMap, unreadCountsMap, getLastMsgPreview]);

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 }).current;
  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      const topItem = viewableItems[viewableItems.length - 1].item;
      if (topItem?.created_at) setStickyDate(formatDetailedDate(new Date(topItem.created_at)));
    }
  }).current;

  return (
    <View className="flex-1 bg-gray-50 w-full">
      <View className="flex-1 relative w-full">
        <Animated.View 
          className="absolute inset-0 z-10 w-full h-full" 
          pointerEvents={selectedChat ? 'none' : 'auto'}
          style={inboxAnimStyle}
        >
          <PlatinumHeader 
            title="Messages" subtitle="Institutional Sync"
            icon={<View className="w-9 h-9 rounded-full bg-indigo-50 items-center justify-center border border-indigo-100/30"><Icons.Messages size={18} color="#4f46e5" /></View>}
            rightAction={
              <Pressable 
                onPress={toggleSearch} 
                style={({ pressed }) => ({
                  transform: [{ scale: pressed ? 0.94 : 1 }],
                  opacity: pressed ? 0.7 : 1,
                  ...SHADOWS.level1
                })}
                className="w-10 h-10 items-center justify-center rounded-xl bg-white border border-gray-100"
              >
                <Icons.Search size={20} color="#4f46e5" />
              </Pressable>
            }
          />
          <View className="flex-1 w-full">
            {isSearchVisible && (
              <Animated.View entering={FadeInDown} exiting={FadeOutUp} className="px-4 pt-4">
                <View className="flex-row bg-white rounded-2xl items-center px-4 py-3 w-full shadow-sm border border-gray-100">
                  <Icons.Search size={18} color="#4f46e5" />
                  <TextInput ref={searchRef} placeholder="Search contacts..." value={searchQuery} onChangeText={setSearchQuery} className="flex-1 ml-3 text-[14px] font-bold text-gray-800" />
                </View>
              </Animated.View>
            )}
            <FlatList 
              data={filteredContacts}
              keyExtractor={(item) => item.id}
              renderItem={renderContactItem}
              className="flex-1 mt-4 px-4 w-full"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 120, width: '100%' }}
              initialNumToRender={15}
              maxToRenderPerBatch={10}
              windowSize={5}
              removeClippedSubviews={Platform.OS === 'android'}
              ListEmptyComponent={
                <View className="items-center py-20">
                  <Icons.Users size={32} color="#cbd5e1" />
                  <Text className="text-gray-400 font-black text-[12px] mt-3 uppercase tracking-[1px]">
                    {searchQuery ? `No contacts match "${searchQuery}"` : 'No contacts yet'}
                  </Text>
                  {searchQuery && (
                    <TouchableOpacity onPress={() => setSearchQuery('')} className="mt-3">
                      <Text className="text-indigo-500 text-[11px] font-bold">Clear search</Text>
                    </TouchableOpacity>
                  )}
                </View>
              }
            />
          </View>
        </Animated.View>

        <Animated.View 
          className="absolute inset-0 z-20 w-full h-full" 
          pointerEvents={selectedChat ? 'auto' : 'none'}
          style={chatAnimStyle}
        >
          {selectedChat && (
            <View className="flex-1 bg-gray-50 w-full">
              <PlatinumHeader 
                title={activeContact?.name || 'Chat'} 
                onBack={() => setSelectedChat(null)} 
                icon={
                  <View className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 border border-gray-200">
                    {activeContact?.avatar ? (
                      <Animated.Image source={{ uri: activeContact.avatar }} className="w-full h-full" />
                    ) : (
                      <View className="flex-1 items-center justify-center bg-indigo-50">
                        <Text className="text-indigo-600 font-black text-[10px]">{activeContact?.name?.charAt(0)}</Text>
                      </View>
                    )}
                  </View>
                }
              />
              
              <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 96 : 0}
              >
                {stickyDate && (
                  <Animated.View 
                    className="absolute top-24 left-0 right-0 z-20 items-center"
                    style={stickyAnimStyle}
                  >
                    <BlurView intensity={70} tint="light" className="px-4 py-2 rounded-full border border-white/20 overflow-hidden">
                      <Text className="text-[10px] font-bold text-indigo-600 uppercase tracking-[1px]">{stickyDate}</Text>
                    </BlurView>
                  </Animated.View>
                )}
                <Animated.FlatList 
                  data={filteredMessages} keyExtractor={(item) => item.id ?? `${item.sender_id}_${item.created_at}`}
                  className="flex-1 px-4 pt-4 w-full" inverted
                  onViewableItemsChanged={onViewableItemsChanged} viewabilityConfig={viewabilityConfig}
                  renderItem={renderMessageItem}
                  onEndReached={handleLoadMoreMessages}
                  onEndReachedThreshold={0.5}
                  ListFooterComponent={
                    isFetchingMore ? <ActivityIndicator size="small" color="#4f46e5" style={{ marginVertical: 16 }} /> : null
                  }
                />
                <View className="px-4 py-3 bg-white border-t border-gray-100 flex-row items-end w-full" style={{ paddingBottom: Math.max(insets.bottom, 12) }}>
                  <Pressable 
                    onPress={handleShowAttachments}
                    style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.94 : 1 }] })}
                    className="w-10 h-10 bg-indigo-50 rounded-xl items-center justify-center mr-2 border border-indigo-100/50"
                  >
                    <Icons.Plus size={20} color="#4f46e5" />
                  </Pressable>
                  <TextInput 
                    value={msgInput} 
                    onChangeText={setMsgInput} 
                    placeholder="Type message..." 
                    multiline
                    style={{ maxHeight: 120 }}
                    textAlignVertical="top"
                    className="flex-1 bg-gray-50 rounded-xl px-4 py-2 border border-gray-100 font-bold text-[14px]" 
                  />
                  <Pressable 
                    onPress={onSend}
                    style={({ pressed }) => ({ 
                      transform: [{ scale: (pressed || msgInput.trim()) ? 1.05 : 1 }],
                      opacity: msgInput.trim() ? 1 : 0.5,
                      ...SHADOWS.level2
                    })}
                    disabled={!msgInput.trim()}
                    className="ml-2 w-10 h-10 bg-indigo-600 rounded-xl items-center justify-center"
                  >
                    <Icons.Send size={18} color="white" />
                  </Pressable>
                </View>
              </KeyboardAvoidingView>
            </View>
          )}
        </Animated.View>

        <Modal transparent visible={showAttachments} animationType="fade">
          <Pressable className="flex-1 justify-end" onPress={handleHideAttachments}>
            {isContentVisible && (
              <Animated.View 
                entering={FadeIn.duration(DURATIONS.modal).easing(EASING_PLATINUM)} 
                exiting={FadeOut.duration(DURATIONS.screen).easing(EASING_PLATINUM)} 
                className="absolute inset-0"
              >
                <BlurView intensity={30} tint="dark" className="absolute inset-0" />
                <View className="absolute inset-0 bg-black/20" />
              </Animated.View>
            )}
            {isContentVisible && (
              <Animated.View 
                entering={SlideInDown.springify().damping(SPRING_CONFIG.damping).stiffness(SPRING_CONFIG.stiffness).mass(SPRING_CONFIG.mass)} 
                exiting={SlideOutDown.springify().damping(SPRING_CONFIG.damping).stiffness(SPRING_CONFIG.stiffness).mass(SPRING_CONFIG.mass)} 
                className="bg-white rounded-t-[32px] px-8 py-10"
                style={SHADOWS.level3}
              >
                <View className="flex-row justify-evenly mb-8">
                  <Pressable 
                    onPress={() => handleAttachmentPress('camera')} 
                    style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.97 : 1 }] })}
                    className="items-center"
                  >
                    <View className="w-14 h-14 bg-indigo-600 rounded-3xl items-center justify-center mb-3">
                      <Icons.Camera size={22} color="white" />
                    </View>
                    <Text className="text-[10px] font-black uppercase">Camera</Text>
                  </Pressable>
                  <Pressable 
                    onPress={() => handleAttachmentPress('gallery')} 
                    style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.97 : 1 }] })}
                    className="items-center"
                  >
                    <View className="w-14 h-14 bg-indigo-50 rounded-3xl items-center justify-center mb-3">
                      <Icons.Layers size={22} color="#4f46e5" />
                    </View>
                    <Text className="text-[10px] font-black uppercase">Photos</Text>
                  </Pressable>
                  <Pressable 
                    onPress={() => handleAttachmentPress('document')} 
                    style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.97 : 1 }] })}
                    className="items-center"
                  >
                    <View className="w-14 h-14 bg-emerald-50 rounded-3xl items-center justify-center mb-3">
                      <Icons.FileText size={22} color="#10b981" />
                    </View>
                    <Text className="text-[10px] font-black uppercase">Files</Text>
                  </Pressable>
                  {assignments && (
                    <Pressable 
                      onPress={() => { handleHideAttachments(); setTimeout(() => setShowAssignmentPicker(true), 450); }} 
                      style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.97 : 1 }] })}
                      className="items-center"
                    >
                      <View className="w-14 h-14 bg-amber-50 rounded-3xl items-center justify-center mb-3">
                        <Icons.BookOpen size={22} color="#d97706" />
                      </View>
                      <Text className="text-[10px] font-black uppercase">Assign</Text>
                    </Pressable>
                  )}
                </View>
                <Pressable 
                  onPress={handleHideAttachments}
                  style={({ pressed }) => ({
                    transform: [{ scale: pressed ? 0.97 : 1 }],
                    opacity: pressed ? 0.8 : 1
                  })}
                  className="bg-gray-100 h-[56px] justify-center rounded-2xl items-center"
                >
                  <Text className="text-[11px] font-semibold text-gray-500 uppercase tracking-[0.5px]">Dismiss</Text>
                </Pressable>
              </Animated.View>
            )}
          </Pressable>
        </Modal>
      </View>

      {/* --- ASSIGNMENT PICKER MODAL --- */}
      <Modal transparent visible={showAssignmentPicker} animationType="slide" onRequestClose={() => setShowAssignmentPicker(false)}>
        <View className="flex-1 justify-end">
          <BlurView intensity={70} tint="dark" className="absolute inset-0" />
          <View className="absolute inset-0 bg-black/35" />
          <View 
            className="bg-white rounded-t-[32px] px-6 py-10 h-[70%]"
            style={SHADOWS.level3}
          >
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-[24px] font-black text-gray-900 tracking-tighter">Share Assignment</Text>
              <TouchableOpacity onPress={() => setShowAssignmentPicker(false)} className="p-2 bg-gray-100 rounded-full">
                <Icons.Close size={20} color="#64748b" />
              </TouchableOpacity>
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
              {assignments && assignments.length > 0 ? (
                assignments.map((item: any, idx: number) => (
                  <Pressable 
                    key={idx} 
                    onPress={async () => {
                      HapticPatterns.selection();
                      setShowAssignmentPicker(false);
                      await handleSendMessage('assignment', undefined, item.title, `Assignment: ${item.title} (Deadline: ${item.dueDate || 'TBD'})`, selectedChat!);
                    }}
                    style={({ pressed }) => ({
                      opacity: pressed ? 0.92 : 1,
                      transform: [{ scale: pressed ? 0.98 : 1 }]
                    })}
                    className="p-4 bg-gray-50 rounded-2xl mb-3 border border-gray-100 flex-row items-center"
                  >
                    <View className="w-10 h-10 bg-amber-50 rounded-xl items-center justify-center mr-4">
                      <Icons.FileText size={20} color="#d97706" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-[14px] font-bold text-gray-800">{item.title}</Text>
                      <Text className="text-[10px] text-gray-400 uppercase tracking-tighter">{item.subject} • {item.grade}</Text>
                    </View>
                    <Icons.ChevronRight size={18} color="#cbd5e1" />
                  </Pressable>
                ))
              ) : (
                <View className="flex-1 items-center justify-center py-20">
                  <View className="w-20 h-20 bg-gray-50 rounded-full items-center justify-center mb-4">
                    <Icons.BookOpen size={40} color="#cbd5e1" />
                  </View>
                  <Text className="text-gray-900 font-bold text-lg">No Assignments</Text>
                  <Text className="text-gray-400 text-sm text-center px-8 mt-2">
                    Create assignments in the Classes tab to share them with students here.
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};
