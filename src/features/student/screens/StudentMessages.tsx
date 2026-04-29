import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { styled } from 'nativewind';
import { Icons } from '../../../../components/Icons';
import { User, ChatMessage } from '../../../../types';
import { AppTheme, AppCard, AppTypography, SectionHeader, AppRow, StatusPill } from '../../../design-system';

const StyledLinearGradient = LinearGradient ? styled(LinearGradient) : View;

interface StudentMessagesProps {
  currentUser: User;
  displayContacts: User[];
  chatMessages: ChatMessage[];
  handleSendMessage: () => void;
  selectedChat: string | null;
  setSelectedChat: (id: string | null) => void;
  msgInput: string;
  setMsgInput: (text: string) => void;
}

export const StudentMessages: React.FC<StudentMessagesProps> = ({
  currentUser,
  displayContacts = [],
  chatMessages,
  handleSendMessage,
  selectedChat,
  setSelectedChat,
  msgInput,
  setMsgInput
}) => {
  const activeContact = displayContacts?.find(c => c.id === selectedChat);

  const filteredMessages = useMemo(() => {
    if (!selectedChat) return [];
    return (chatMessages || []).filter(m => 
      (m.sender_id === currentUser.id && m.receiver_id === selectedChat) ||
      (m.sender_id === selectedChat && m.receiver_id === currentUser.id)
    );
  }, [chatMessages, selectedChat, currentUser.id]);

  return (
    <View className="flex-1 bg-[#f5f7ff]">
      {!selectedChat ? (
        <View className="flex-1">
          {/* Platinum Messages Hero — 140px Sync */}
          <StyledLinearGradient 
            colors={AppTheme.colors.gradients.brand} 
            start={{x: 0, y: 0}} end={{x: 1, y: 1}} 
            className="h-[140px] px-6 pt-5 rounded-b-[40px] shadow-2xl shadow-indigo-200/50 relative z-30"
          >
            <View className="absolute right-[-15] bottom-[-15] opacity-10 rotate-12">
                <Icons.Messages size={130} color="white" />
            </View>

            <View className="relative z-10 flex-row justify-between items-start mb-8">
                <View className="flex-1 mr-4">
                    <Text className={`${AppTypography.heroTitle} text-white`}>Messages</Text>
                </View>
                <View className="bg-white/10 px-4 py-2 rounded-2xl border border-white/20 backdrop-blur-md">
                    <Text className="text-[10px] font-black text-white uppercase tracking-widest font-inter-black">Recent Chats</Text>
                </View>
            </View>
          </StyledLinearGradient>
 
          <ScrollView 
            className="flex-1 mt-4 relative z-30" 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 4, paddingBottom: 100 }}
          >
            <SectionHeader title="RECENT CHATS" className="mb-4 px-2" />
            
            <AppCard className="p-0 overflow-hidden border border-white shadow-xl shadow-indigo-100/30">
                {(displayContacts || []).map((contact, idx) => {
                    const lastMsg = (chatMessages || []).filter(m => m.sender_id === contact.id || m.receiver_id === contact.id).pop();
                    return (
                        <AppRow
                            key={contact.id}
                            title={contact.name}
                            subtitle={lastMsg?.content || "Tap to start chatting..."}
                            avatarLetter={contact.name?.charAt(0) || '?'}
                            avatarBg="#f0f2ff"
                            avatarColor="#4f46e5"
                            meta={lastMsg ? new Date(lastMsg.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined}
                            pills={<StatusPill label={contact.role?.toUpperCase() || 'MEMBER'} type="info" />}
                            showBorder={idx < (displayContacts || []).length - 1}
                            onPress={() => setSelectedChat(contact.id)}
                            rightElement={<Icons.ChevronRight size={14} color="#d1d5db" />}
                        />
                    );
                })}

                {(displayContacts || []).length === 0 && (
                    <View className="items-center justify-center py-20">
                        <View className="w-16 h-16 bg-white rounded-2xl items-center justify-center mb-6 shadow-xl shadow-indigo-100/50 border border-gray-50">
                            <Icons.Messages size={32} color="#e5e7eb" />
                        </View>
                        <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest font-inter-black">No messages yet</Text>
                    </View>
                )}
            </AppCard>
          </ScrollView>
        </View>
      ) : (
        <View className="flex-1 bg-[#f5f7ff]">
          {/* Chat Header — Platinum Standards */}
          <View className="pt-12 pb-5 px-4 border-b border-gray-100 flex-row items-center bg-white shadow-sm z-20">
            <TouchableOpacity 
              onPress={() => setSelectedChat(null)} 
              className="w-10 h-10 bg-gray-50 rounded-2xl items-center justify-center mr-4 border border-gray-100 active:scale-95 shadow-sm"
            >
              <Icons.ChevronRight size={18} color="#64748b" style={{transform:[{rotate:'180deg'}]}}/>
            </TouchableOpacity>
            
            <View className="w-11 h-11 rounded-2xl bg-indigo-50 flex items-center justify-center border border-indigo-100 shadow-sm">
              <Text className="font-black text-lg text-indigo-600 font-inter-black">{activeContact?.name?.charAt(0) || '?'}</Text>
            </View>
            
            <View className="ml-4 flex-1">
              <Text className="font-black text-gray-900 text-[15px] tracking-tighter leading-tight font-inter-black" numberOfLines={1}>{activeContact?.name}</Text>
              <View className="flex-row items-center mt-1">
                <View className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2 shadow-sm shadow-emerald-500/50" />
                <Text className="text-[9px] text-gray-400 font-black uppercase tracking-[2px] font-inter-black">ONLINE • SECURE</Text>
              </View>
            </View>
          </View>
 
          <ScrollView 
            className="flex-1 px-4 pt-6" 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 120 }}
          >
            {(filteredMessages || []).map((msg, idx) => {
              const isMine = msg.sender_id === currentUser.id;
              return (
                <View key={idx} className={`mb-6 ${isMine ? 'items-end' : 'items-start'}`}>
                  <View className={`max-w-[85%] px-5 py-4 rounded-[28px] shadow-2xl shadow-indigo-100/40 ${
                    isMine ? 'bg-indigo-600 rounded-tr-none' : 'bg-white rounded-tl-none border border-gray-50'
                  }`}>
                    <Text className={`text-[13px] font-bold leading-relaxed font-inter-medium ${isMine ? 'text-white' : 'text-gray-800'}`}>
                      {msg.content}
                    </Text>
                    <View className="flex-row items-center justify-end mt-2.5 opacity-60">
                      <Text className={`text-[9px] font-black uppercase tracking-widest font-inter-black ${isMine ? 'text-indigo-100' : 'text-gray-400'}`}>
                        {msg.timestamp || 'Just now'}
                      </Text>
                      {isMine && <Icons.Check size={10} color="white" style={{marginLeft: 6}} />}
                    </View>
                  </View>
                </View>
              );
            })}
          </ScrollView>
 
          {/* Input Bar */}
          <View className="w-full px-4 py-4 pb-10 bg-white border-t border-gray-100 flex-row items-center shadow-2xl shadow-indigo-100/50">
            <TouchableOpacity className="w-12 h-12 bg-gray-50 rounded-2xl items-center justify-center mr-3 border border-gray-100 active:scale-95 shadow-sm">
              <Icons.Plus size={18} color="#94a3b8"/>
            </TouchableOpacity>
            
            <View className="flex-1 h-12 justify-center">
              <TextInput 
                value={msgInput} 
                onChangeText={setMsgInput} 
                className="w-full h-11 bg-gray-50 border border-gray-100 rounded-[20px] px-5 text-[13px] text-gray-900 font-black shadow-inner font-inter-black" 
                placeholder="Type a message..." 
                placeholderTextColor="#94a3b8"
              />
            </View>
            
            <TouchableOpacity 
              onPress={handleSendMessage}
              className={`ml-3 w-12 h-12 rounded-2xl items-center justify-center shadow-xl ${msgInput.trim() ? 'bg-indigo-600 shadow-indigo-200 active:scale-95' : 'bg-gray-200'}`}
              disabled={!msgInput.trim()}
            >
              <Icons.Send size={18} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};
