import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Icons } from '../../../../components/Icons';
import { User, ChatMessage } from '../../../../types';
import { AppTheme, AppCard, AppTypography, AppRow, StatusPill, SectionHeader } from '../../../design-system';

interface TeacherMessagesProps {
  selectedChat: string | null;
  setSelectedChat: (id: string | null) => void;
  msgInput: string;
  setMsgInput: (text: string) => void;
  displayContacts: User[];
  chatMessages: ChatMessage[];
  currentUser: User;
  handleSendMessage: () => void;
}

export const TeacherMessages: React.FC<TeacherMessagesProps> = ({
  selectedChat,
  setSelectedChat,
  msgInput,
  setMsgInput,
  displayContacts,
  chatMessages,
  currentUser,
  handleSendMessage,
}) => {
  const filteredMessages = useMemo(() => {
    if (!selectedChat) return [];
    return (chatMessages || []).filter(m => 
      (m.sender_id === currentUser.id && m.receiver_id === selectedChat) ||
      (m.sender_id === selectedChat && m.receiver_id === currentUser.id)
    );
  }, [chatMessages, selectedChat, currentUser.id]);

  const activeContact = (displayContacts || []).find(c => c.id === selectedChat);

  const onSend = () => {
    if (!msgInput.trim()) return;
    handleSendMessage();
  };

  return (
    <View className="flex-1 bg-[#f5f7ff]">
      {!selectedChat ? (
        <View className="flex-1">
          <LinearGradient
            colors={AppTheme.colors.gradients.brand}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="px-6 pt-5 pb-10 rounded-b-[40px] shadow-xl shadow-indigo-200/50 z-20"
          >
            {/* Platinum Institutional Watermark */}
            <View className="absolute right-[-20] bottom-[-20] opacity-10 transform rotate-12">
                <Icons.Messages size={140} color="white" />
            </View>

            <View className="relative z-10 mb-5">
              <Text className={`${AppTypography.heroTitle} text-white`}>Faculty Chat</Text>
              <Text className={`${AppTypography.eyebrow} text-white/60 mt-1.5`}>Academic Exchange Hub</Text>
            </View>
            
            <View className="bg-white/10 border border-white/20 rounded-2xl px-5 py-4 flex-row items-center backdrop-blur-md relative z-10">
              <Icons.Search size={18} color="white" opacity={0.8} />
              <TextInput 
                placeholder="Search faculty or staff..." 
                placeholderTextColor="rgba(255, 255, 255, 0.4)"
                className="flex-1 ml-3 text-[13px] font-black text-white p-0 font-inter-black" 
              />
            </View>
          </LinearGradient>

          <ScrollView 
            className="flex-1 px-4 pt-6" 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
          >
            <AppCard className="p-0 overflow-hidden border border-white shadow-xl shadow-indigo-100/30">
              {(displayContacts || []).map((contact, idx) => {
                const lastMsg = (chatMessages || []).filter(m => m.sender_id === contact.id || m.receiver_id === contact.id).pop();
                return (
                  <AppRow
                    key={contact.id}
                    title={contact.name}
                    subtitle={lastMsg?.content || "No message history..."}
                    avatarLetter={contact.name?.charAt(0) || '?'}
                    avatarBg="#f0f2ff"
                    avatarColor="#4f46e5"
                    meta={lastMsg ? new Date(lastMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined}
                    pills={<StatusPill label={contact.role?.toUpperCase() || 'STAFF'} type="info" />}
                    showBorder={idx < (displayContacts || []).length - 1}
                    onPress={() => setSelectedChat(contact.id)}
                    rightElement={<Icons.ChevronRight size={14} color="#d1d5db" />}
                  />
                );
              })}

              {(displayContacts || []).length === 0 && (
                <View className="items-center justify-center py-20">
                  <View className="w-16 h-16 bg-white rounded-2xl items-center justify-center mb-6 shadow-xl shadow-indigo-100/50 border border-gray-50">
                    <Icons.Messages size={32} color="#e2e8f0" />
                  </View>
                  <Text className="text-[11px] font-black text-gray-400 uppercase tracking-widest font-inter-black">No Active Dialogues</Text>
                </View>
              )}
            </AppCard>
          </ScrollView>
        </View>
      ) : (
        <View className="flex-1 bg-[#f5f7ff]">
          {/* Chat Header — Platinum Standard */}
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
                <Text className="text-[9px] text-gray-400 font-black uppercase tracking-[2px] font-inter-black">{activeContact?.role} • Online</Text>
              </View>
            </View>
            
            <TouchableOpacity className="w-10 h-10 bg-gray-50 rounded-2xl items-center justify-center border border-gray-100">
               <Icons.Search size={18} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          <ScrollView 
            className="flex-1 px-4 pt-6" 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 120 }}
          >
             {(filteredMessages || []).map((msg, idx) => {
                 const isMine = msg.sender_id === currentUser.id;
                 return (
                    <View key={msg.id || idx} className={`mb-6 ${isMine ? 'items-end' : 'items-start'}`}>
                        <View className={`max-w-[85%] px-5 py-4 rounded-[28px] shadow-2xl shadow-indigo-100/40 ${
                            isMine ? 'bg-indigo-600 rounded-tr-none' : 'bg-white rounded-tl-none border border-gray-50'
                        }`}>
                            <Text className={`text-[13px] font-bold leading-relaxed font-inter-medium ${isMine ? 'text-white' : 'text-gray-800'}`}>
                                {msg.content}
                            </Text>
                            <View className="flex-row items-center justify-end mt-2.5 opacity-60">
                                <Text className={`text-[9px] font-black uppercase tracking-widest font-inter-black ${isMine ? 'text-indigo-100' : 'text-gray-400'}`}>
                                    {msg.timestamp || (msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now')}
                                </Text>
                                {isMine && <Icons.Check size={10} color="white" style={{marginLeft: 6}} />}
                            </View>
                        </View>
                    </View>
                 );
             })}
             
             {(filteredMessages || []).length === 0 && (
                 <View className="flex-1 items-center justify-center py-32">
                    <View className="w-16 h-16 bg-white rounded-2xl items-center justify-center mb-6 border border-gray-50 shadow-xl shadow-indigo-100/50">
                      <Icons.Messages size={32} color="#e2e8f0" />
                    </View>
                    <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest font-inter-black">Secure session started</Text>
                 </View>
             )}
          </ScrollView>

          {/* Platinum Input Bar */}
          <View className="w-full px-4 py-4 pb-10 bg-white border-t border-gray-100 flex-row items-center shadow-2xl shadow-indigo-100/50">
            <TouchableOpacity className="w-12 h-12 bg-gray-50 rounded-2xl items-center justify-center mr-3 border border-gray-100 active:scale-95 shadow-sm">
              <Icons.Plus size={18} color="#94a3b8"/>
            </TouchableOpacity>
            
            <View className="flex-1 h-12 justify-center">
              <TextInput 
                value={msgInput} 
                onChangeText={setMsgInput} 
                className="w-full h-11 bg-gray-50 border border-gray-100 rounded-[20px] px-5 text-[13px] text-gray-900 font-black shadow-inner font-inter-black" 
                placeholder="Institutional message..." 
                placeholderTextColor="#94a3b8"
                multiline={false}
              />
            </View>

            <TouchableOpacity 
              onPress={onSend}
              className={`ml-3 w-12 h-12 rounded-2xl items-center justify-center shadow-xl ${msgInput.trim() ? 'bg-indigo-600 shadow-indigo-200 active:scale-95' : 'bg-gray-200'}`}
              disabled={!msgInput.trim()}
            >
              <Icons.Messages size={18} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};
;
