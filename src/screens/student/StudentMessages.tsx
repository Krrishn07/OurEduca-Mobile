import React, { useMemo, useRef, useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Keyboard, Modal, Pressable, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Icons } from '@components/common/Icons';
import { User, ChatMessage } from '@/types';
import { AppTheme, AppTypography } from '@components/common';
import { formatAcademicTime, isSameDay, formatDetailedDate } from '@utils/timeUtils';
import Animated, { FadeInDown, Layout, FadeIn, FadeOut, withSpring, useSharedValue, useAnimatedStyle, SlideInDown, SlideOutDown, FadeOutUp } from 'react-native-reanimated';
import { PlatinumHeader } from '@components/common';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { triggerHaptic } from '@utils/haptics';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';

const StyledLinearGradient = LinearGradient || View;

interface StudentMessagesProps {
  currentUser?: User;
  displayContacts: User[];
  chatMessages: ChatMessage[];
  handleSendMessage: (type?: string, url?: string, name?: string, customContent?: string) => Promise<void>;
  selectedChat: string | null;
  setSelectedChat: (id: string | null) => void;
  markMessagesAsRead: (senderId: string, receiverId: string) => Promise<void>;
  msgInput: string;
  setMsgInput: (val: string) => void;
  uploadMessageFile: (file: { uri: string; type: string; name?: string }) => Promise<string>;
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

export const StudentMessages: React.FC<StudentMessagesProps> = ({
  currentUser,
  displayContacts,
  chatMessages,
  handleSendMessage,
  selectedChat,
  setSelectedChat,
  markMessagesAsRead,
  msgInput,
  setMsgInput,
  uploadMessageFile
}) => {
  const insets = useSafeAreaInsets();

  const sendButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(msgInput.trim() ? 1.02 : 1, { damping: 12, stiffness: 150 }) }]
  }));
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const [isContentVisible, setIsContentVisible] = useState(false);

  const handleShowAttachments = () => {
    setShowAttachments(true);
    setTimeout(() => setIsContentVisible(true), 50);
  };

  const handleHideAttachments = () => {
    setIsContentVisible(false);
    setTimeout(() => setShowAttachments(false), 400);
  };

  const [stickyDate, setStickyDate] = useState<string>('');
  const searchRef = useRef<TextInput>(null);

  // PERSISTENT READ SYNC: Update database status when chat is selected
  useEffect(() => {
    if (selectedChat && currentUser?.id && markMessagesAsRead) {
      // 1. Trigger database update for all messages from this sender
      markMessagesAsRead(selectedChat, currentUser.id);
    }
  }, [selectedChat, currentUser?.id, markMessagesAsRead]);



  const toggleSearch = () => {
    setIsSearchVisible(!isSearchVisible);
    if (!isSearchVisible) {
      setTimeout(() => searchRef.current?.focus(), 100);
    } else {
      setSearchQuery('');
    }
  };

  const activeContact = useMemo(() => 
    displayContacts?.find(c => c.id === selectedChat),
    [displayContacts, selectedChat]
  );

  const lastMessagesMap = useMemo(() => {
    const map = new Map();
    (chatMessages || []).forEach(msg => {
      const otherId = msg.sender_id === currentUser.id ? msg.receiver_id : msg.sender_id;
      if (!map.has(otherId) || new Date(msg.created_at) > new Date(map.get(otherId).created_at)) {
        map.set(otherId, msg);
      }
    });
    return map;
  }, [chatMessages, currentUser.id]);

  const unreadCountsMap = useMemo(() => {
    const map = new Map<string, number>();
    (chatMessages || []).forEach(msg => {
      if (msg.sender_id !== currentUser?.id && msg.status !== 'read') {
        const otherId = msg.sender_id;
        map.set(otherId, (map.get(otherId) || 0) + 1);
      }
    });
    return map;
  }, [chatMessages, currentUser?.id]);

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
    if (!selectedChat) return [];
    return (chatMessages || []).filter(m => 
      (m.sender_id === currentUser.id && m.receiver_id === selectedChat) ||
      (m.sender_id === selectedChat && m.receiver_id === currentUser.id)
    ).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [chatMessages, selectedChat, currentUser.id]);

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 }).current;
  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      const topItem = viewableItems[viewableItems.length - 1].item;
      if (topItem?.created_at) {
        setStickyDate(formatDetailedDate(new Date(topItem.created_at)));
      }
    }
  }).current;

  const sendFile = async (uri: string, type: 'image' | 'document', name?: string) => {
    if (!uploadMessageFile) return;
    setIsSending(true);
    triggerHaptic();
    try {
      const uploadedUrl = await uploadMessageFile({ uri, type, name });
      await handleSendMessage(type, uploadedUrl, name);
    } catch {
      Alert.alert('Upload Failed', 'Could not send the file. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleAttachmentPress = async (type: 'camera' | 'gallery' | 'document') => {
    handleHideAttachments();
    await new Promise(r => setTimeout(r, 400)); // wait for modal close animation

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
          allowsEditing: true,
        });
        
        const asset = result.assets?.[0];
        const uri = asset?.uri || (result as any).uri;

        if (!result.canceled && uri) {
          await sendFile(uri, 'image');
        }

      } else if (type === 'gallery') {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
          Alert.alert('Permission Required', 'Photo library access is needed.');
          return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.7,
        });

        const asset = result.assets?.[0];
        const uri = asset?.uri || (result as any).uri;

        if (!result.canceled && uri) {
          await sendFile(uri, 'image');
        }

      } else if (type === 'document') {
        const result = await DocumentPicker.getDocumentAsync({
          type: ['application/pdf', 'application/msword',
                 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
          copyToCacheDirectory: true,
        });
        
        const asset = result.assets?.[0];
        const uri = asset?.uri || (result as any).uri;
        const name = asset?.name || (result as any).name;

        if (!result.canceled && uri) {
          await sendFile(uri, 'document', name);
        }
      }
    } catch (err) {
      Alert.alert('Error', 'Could not open the picker. Please try again.');
    }
  };

  const onSend = async () => {
    if (!msgInput.trim()) return;
    triggerHaptic();
    try {
      await handleSendMessage('text', undefined, undefined, msgInput.trim());
      setMsgInput(''); // clear input after send
    } catch (err) {
      Alert.alert('Send Failed', 'Message could not be delivered. Please try again.');
    }
  };

  const renderMessageItem = ({ item: msg, index }: { item: any, index: number }) => {
    const isMine = msg.sender_id === currentUser.id;
    const nextMsg = filteredMessages[index + 1];
    const showDateDivider = !nextMsg || !isSameDay(new Date(msg.created_at), new Date(nextMsg.created_at));

    return (
      <View className="w-full">
        {showDateDivider && (
          <View className="items-center my-4 w-full">
            <View className="bg-gray-200/50 px-4 py-1.5 rounded-full border border-gray-100">
              <Text className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                {formatDetailedDate(new Date(msg.created_at))}
              </Text>
            </View>
          </View>
        )}
        <Animated.View 
          entering={FadeInDown.springify()} 
          layout={Layout.springify()}
          className={`mb-3 w-full ${isMine ? 'items-end' : 'items-start'}`}
        >
          {isMine ? (
            <LinearGradient
                colors={['#5B4CF0', '#4F46E5']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ 
                    alignSelf: 'flex-end', 
                    maxWidth: '72%', 
                    minWidth: 90,
                    paddingVertical: 8,
                    paddingHorizontal: 16
                }}
                className="rounded-tl-3xl rounded-tr-md rounded-bl-3xl rounded-br-3xl shadow-sm"
            >
                <Text className="text-[13px] font-bold text-white">{msg.content}</Text>
                <View className="flex-row items-center justify-end mt-2 space-x-1.5 opacity-60">
                    <Text className="text-[9px] font-black uppercase text-indigo-100">
                        {formatAcademicTime(msg.created_at)}
                    </Text>
                    <MessageStatusIcon status={msg.status || 'sent'} />
                </View>
            </LinearGradient>
          ) : (
            <View 
                style={{ 
                    alignSelf: 'flex-start', 
                    maxWidth: '72%', 
                    minWidth: 90,
                    paddingVertical: 8,
                    paddingHorizontal: 16
                }}
                className="rounded-tl-md rounded-tr-3xl rounded-bl-3xl rounded-br-3xl bg-white border border-gray-100 shadow-sm"
            >
                <Text className="text-[13px] font-bold text-gray-800">{msg.content}</Text>
                <View className="flex-row items-center justify-end mt-2 space-x-1.5 opacity-60">
                    <Text className="text-[9px] font-black uppercase text-gray-400">
                        {formatAcademicTime(msg.created_at)}
                    </Text>
                </View>
            </View>
          )}
        </Animated.View>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-[#f5f7ff] w-full">
      <View className="flex-1 relative w-full">
        
        {/* 1. INBOX LAYER */}
        <Animated.View 
          className="absolute inset-0 z-10 w-full h-full"
          style={{ 
            opacity: selectedChat ? 0 : 1,
            pointerEvents: selectedChat ? 'none' : 'auto',
            transform: [{ scale: selectedChat ? 0.95 : 1 }]
          }}
        >
          <PlatinumHeader 
            title="Messages"
            subtitle="Scholar Hub"
            icon={
              <View className="w-9 h-9 rounded-full bg-indigo-50 items-center justify-center border border-indigo-100/30">
                <Icons.Messages size={18} color="#4f46e5" />
              </View>
            }
            rightAction={
                <TouchableOpacity 
                    activeOpacity={0.7} 
                    onPress={() => {
                        triggerHaptic();
                        toggleSearch();
                    }}
                    className={`w-10 h-10 rounded-full items-center justify-center border ${isSearchVisible ? 'bg-indigo-50 border-indigo-100 shadow-inner' : 'bg-white border-gray-100 shadow-sm'}`}
                >
                    <Icons.Search size={18} color={isSearchVisible ? "#4f46e5" : "#6b7280"} />
                </TouchableOpacity>
            }
          />

          <View className="flex-1 w-full">
            {isSearchVisible && (
                <Animated.View 
                    entering={FadeInDown} 
                    exiting={FadeOutUp}
                    className="px-4 pt-4"
                >
                    <View className="flex-row bg-white rounded-2xl items-center px-4 py-3 w-full shadow-sm border border-gray-100">
                        <Icons.Search size={18} color="#4f46e5" />
                        <TextInput 
                            ref={searchRef}
                            placeholder="Search contacts..." 
                            placeholderTextColor="#94a3b8"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            className="flex-1 ml-3 text-[14px] font-bold text-gray-800" 
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <Icons.Close size={16} color="#94a3b8" />
                            </TouchableOpacity>
                        )}
                    </View>
                </Animated.View>
            )}

            <ScrollView 
                className="flex-1 mt-4 px-4 w-full" 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 120, width: '100%' }}
            >
                {(filteredContacts || []).map((contact, idx) => {
                    const lastMsg = lastMessagesMap.get(contact.id);
                    const rawUnreadCount = unreadCountsMap.get(contact.id) || 0;
                    const isUnread = rawUnreadCount > 0;
                    
                    return (
                        <TouchableOpacity 
                            key={contact.id} 
                            onPress={() => setSelectedChat(contact.id)}
                            className={`flex-row items-center px-4 py-3 bg-white rounded-2xl mb-2 border ${isUnread ? 'border-indigo-100 shadow-md' : 'border-gray-100 shadow-sm'} w-full`}
                        >
                            <Animated.View 
                                sharedTransitionTag={`avatar.${contact.id}`}
                                layout={Layout.springify().damping(15).stiffness(100)}
                                className={`w-12 h-12 rounded-2xl items-center justify-center mr-4 border ${isUnread ? 'bg-indigo-600 border-indigo-500 shadow-lg shadow-indigo-200' : 'bg-indigo-50 border-indigo-100/50'}`}
                            >
                                <Text className={`font-black text-xl ${isUnread ? 'text-white' : 'text-indigo-600'}`}>{contact.name.charAt(0)}</Text>
                            </Animated.View>
                            
                            <View className="flex-1">
                                <View className="flex-row justify-between items-center mb-1">
                                    <Animated.View 
                                        sharedTransitionTag={`name.${contact.id}`}
                                        layout={Layout.springify().damping(15).stiffness(100)} 
                                        className="flex-1"
                                    >
                                        <Text className={`text-[14px] ${isUnread ? 'font-black text-gray-900' : 'font-bold text-gray-600'} tracking-tight`} numberOfLines={1}>{contact.name}</Text>
                                    </Animated.View>
                                    <View className="flex-row items-center space-x-2">
                                        {lastMsg && (
                                            <Text className={`text-[9px] font-black uppercase tracking-widest ${isUnread ? 'text-indigo-600' : 'text-gray-400'}`}>
                                                {new Date(lastMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </Text>
                                        )}
                                        {isUnread && (
                                            <View className="bg-indigo-600 px-2 py-0.5 rounded-full shadow-sm shadow-indigo-200 min-w-[20px] items-center justify-center">
                                                <Text className="text-white text-[9px] font-black">{rawUnreadCount}</Text>
                                            </View>
                                        )}
                                    </View>
                                </View>
                                <Text className={`text-[12px] leading-tight ${isUnread ? 'text-gray-800 font-bold' : 'text-gray-400 font-medium'}`} numberOfLines={1}>
                                    {lastMsg?.content || "Tap to open dispatch..."}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
          </View>
        </Animated.View>

        {/* 2. CHAT LAYER */}
        <Animated.View 
          className="absolute inset-0 z-20 w-full h-full"
          style={{ 
            opacity: selectedChat ? 1 : 0,
            pointerEvents: selectedChat ? 'auto' : 'none',
            transform: [{ translateX: selectedChat ? 0 : 50 }]
          }}
        >
          {selectedChat && (
            <View className="flex-1 bg-gray-50 w-full">
              <PlatinumHeader 
                title={activeContact?.name || 'Academic Chat'}
                subtitle="SCHOLAR INTERFACE"
                onBack={() => setSelectedChat(null)}
                titleTag={`name.${activeContact?.id}`}
                iconTag={`avatar.${activeContact?.id}`}
                icon={
                  <View className="w-10 h-10 rounded-xl bg-indigo-50 items-center justify-center border border-indigo-100">
                    <Text className="text-indigo-600 font-inter-black text-[14px]">
                      {activeContact?.name?.charAt(0) || '?'}
                    </Text>
                  </View>
                }
              />

              {/* STICKY DATE OVERLAY */}
              {stickyDate && (
                  <Animated.View 
                      entering={FadeIn} 
                      exiting={FadeOut}
                      className="absolute top-24 self-center px-4 py-2 rounded-full bg-black/60 z-50 shadow-xl backdrop-blur-md border border-white/10"
                  >
                      <Text className="text-white text-[10px] font-black uppercase tracking-widest">
                          {stickyDate}
                      </Text>
                  </Animated.View>
              )}

              <Animated.FlatList 
                data={filteredMessages}
                keyExtractor={(item) => item.id ?? `${item.sender_id}_${item.created_at}`}
                className="flex-1 px-4 pt-4 w-full"
                inverted
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={viewabilityConfig}
                renderItem={renderMessageItem}
              />

              {/* ATTACHMENT MODAL */}
                <Modal
                    transparent
                    visible={showAttachments}
                    animationType="none"
                    onRequestClose={handleHideAttachments}
                >
                    <Pressable 
                        className="flex-1 justify-end"
                        onPress={handleHideAttachments}
                    >
                        {isContentVisible && (
                            <Animated.View 
                                entering={FadeIn.duration(400)}
                                exiting={FadeOut.duration(300)}
                                className="absolute inset-0"
                            >
                                <BlurView intensity={40} tint="dark" className="absolute inset-0" />
                                <View className="absolute inset-0 bg-black/25" />
                            </Animated.View>
                        )}
                        {isContentVisible && (
                            <View style={{ height: '36%', width: '100%', overflow: 'visible' }}>
                                <Animated.View 
                                    entering={SlideInDown.springify().damping(28).stiffness(160)}
                                    exiting={SlideOutDown.springify().damping(28).stiffness(160)}
                                    className="h-full bg-white rounded-t-[32px] px-8 pt-6 pb-12 shadow-xl"
                                >
                                    <View className="flex-row justify-evenly mb-6">
                                        <TouchableOpacity 
                                            onPress={() => { triggerHaptic(); handleAttachmentPress('camera'); }} 
                                            className="items-center active:scale-95 active:opacity-80"
                                        >
                                            <View className="w-16 h-16 bg-indigo-600 rounded-3xl items-center justify-center shadow-lg shadow-indigo-200 mb-3">
                                                <Icons.Camera size={24} color="white" />
                                            </View>
                                            <Text className="text-[11px] font-black text-gray-900 uppercase tracking-widest">Camera</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity 
                                            onPress={() => { triggerHaptic(); handleAttachmentPress('gallery'); }} 
                                            className="items-center active:scale-95 active:opacity-80"
                                        >
                                            <View className="w-16 h-16 bg-indigo-50 rounded-3xl items-center justify-center border border-indigo-100 mb-3">
                                                <Icons.Layers size={24} color="#4f46e5" />
                                            </View>
                                            <Text className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Gallery</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity 
                                            onPress={() => { triggerHaptic(); handleAttachmentPress('document'); }} 
                                            className="items-center active:scale-95 active:opacity-80"
                                        >
                                            <View className="w-16 h-16 bg-gray-50 rounded-3xl items-center justify-center border border-gray-100 mb-3">
                                                <Icons.FileText size={24} color="#64748b" />
                                            </View>
                                            <Text className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Document</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <TouchableOpacity 
                                        onPress={() => { triggerHaptic(); handleHideAttachments(); }}
                                        className="bg-gray-100/80 h-[56px] justify-center rounded-2xl items-center border border-gray-100 active:scale-95 active:opacity-70"
                                    >
                                        <Text className="text-[12px] font-bold text-gray-500 uppercase tracking-widest">Dismiss</Text>
                                    </TouchableOpacity>
                                </Animated.View>
                            </View>
                        )}
                    </Pressable>
                </Modal>

              <View 
                className="px-4 py-3 bg-white border-t border-gray-100 flex-row items-center w-full"
                style={{ paddingBottom: Math.max(insets.bottom, 12) }}
              >
                <TouchableOpacity 
                  onPress={handleShowAttachments}
                  className="p-2 bg-indigo-50 rounded-xl mr-2 border border-indigo-100/50 active:scale-95"
                >
                  <Icons.Plus size={18} color="#4f46e5"/>
                </TouchableOpacity>
                <TextInput 
                  value={msgInput} 
                  onChangeText={setMsgInput} 
                  placeholder="Dispatch message..." 
                  className="flex-1 bg-gray-50 rounded-xl px-4 py-2 border border-gray-100 font-bold text-[14px]"
                />
                <Animated.View style={sendButtonStyle}>
                  <TouchableOpacity 
                    onPress={onSend}
                    activeOpacity={0.8}
                    className={`ml-2 w-10 h-10 rounded-xl items-center justify-center shadow-md ${msgInput.trim() ? 'bg-indigo-600 shadow-indigo-200' : 'bg-gray-200'}`}
                    disabled={!msgInput.trim()}
                  >
                    <Icons.Send size={18} color={msgInput.trim() ? "white" : "#94a3b8"} />
                  </TouchableOpacity>
                </Animated.View>
              </View>
            </View>
          )}
        </Animated.View>
      </View>
    </View>
  );
};
