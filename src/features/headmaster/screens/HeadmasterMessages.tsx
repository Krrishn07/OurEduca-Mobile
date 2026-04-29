import React, { useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { styled } from 'nativewind';
import { Icons } from '../../../../components/Icons';

const StyledLinearGradient = styled(LinearGradient);

interface HeadmasterMessagesProps {
  selectedChat: string | null;
  setSelectedChat: (id: string | null) => void;
  msgInput: string;
  setMsgInput: (text: string) => void;
  displayContacts: any[];
  chatMessages: any[];
  currentUser: any;
  handleSendMessage: () => void;
}

export const HeadmasterMessages: React.FC<HeadmasterMessagesProps> = ({
  selectedChat,
  setSelectedChat,
  msgInput,
  setMsgInput,
  displayContacts,
  chatMessages,
  currentUser,
  handleSendMessage,
}) => {
  const activeMessages = selectedChat 
    ? chatMessages.filter((m: any) => (m.sender_id === currentUser.id && m.receiver_id === selectedChat) || (m.sender_id === selectedChat && m.receiver_id === currentUser.id))
    : [];

  const activeContact = displayContacts.find((c: any) => c.id === selectedChat);

  // Animation Architecture
  const HEADER_MAX_HEIGHT = 140;
  const HEADER_MIN_HEIGHT = 80;
  const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;
  const scrollY = useRef(new Animated.Value(0)).current;

  // Animation Interpolations
  const headerHeight = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
    extrapolate: 'clamp',
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
    outputRange: [1, 0, 0],
    extrapolate: 'clamp',
  });

  const titleScale = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [1, 0.85],
    extrapolate: 'clamp',
  });

  const titleTranslateY = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [0, -8],
    extrapolate: 'clamp',
  });

  const subtextOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [1, 0.6],
    extrapolate: 'clamp',
  });

  return (
     <View className="flex-1 bg-gray-50">
      {!selectedChat ? (
        <View className="flex-1">
          {/* 1. Animated Platinum Broadcast Header */}
          <Animated.View 
            style={{ height: headerHeight, zIndex: 100 }}
            className="shadow-2xl shadow-indigo-300/50 rounded-b-[32px] bg-indigo-600 overflow-hidden"
          >
            <StyledLinearGradient
              colors={['#4f46e5', '#3730a3']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="absolute inset-0"
            />
            <View className="flex-1 justify-end px-6 pb-8">
                <Animated.View 
                    style={{ 
                        transform: [
                            { scale: titleScale },
                            { translateY: titleTranslateY }
                        ]
                    }}
                    className="flex-row justify-between items-end w-full"
                >
                    <View className="flex-1">
                        <Text className="text-2xl font-black text-white tracking-[-1.5px]">Leadership Exchange</Text>
                        <Animated.Text 
                            style={{ opacity: subtextOpacity }}
                            className="text-[10px] font-black uppercase tracking-[3px] text-indigo-100 mt-2"
                        >
                            Executive Dispatch
                        </Animated.Text>
                    </View>
                </Animated.View>
            </View>
          </Animated.View>

          {/* 2. Sticky Platinum Search Bar */}
          <View className="bg-white px-4 py-5 border-b border-gray-100 shadow-sm z-[90]">
            <View className="bg-slate-50 rounded-[24px] border border-slate-100 px-5 py-4 flex-row items-center shadow-inner">
                <Icons.Search size={18} color="#4f46e5" />
                <TextInput 
                    placeholder="Find Personnel..." 
                    placeholderTextColor="#94a3b8"
                    className="flex-1 ml-4 text-[15px] font-black text-gray-900 p-0" 
                />
            </View>
          </View>

          <Animated.ScrollView 
            className="flex-1 px-4" 
            showsVerticalScrollIndicator={false}
            scrollEventThrottle={16}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              { useNativeDriver: false }
            )}
            contentContainerStyle={{ paddingTop: 16, paddingBottom: 100 }}
          >
            {displayContacts.length > 0 ? displayContacts.map((contact: any) => {
              const lastMsg = chatMessages.filter((m: any) => (m.sender_id === contact.id && m.receiver_id === currentUser.id) || (m.sender_id === currentUser.id && m.receiver_id === contact.id)).pop();
              return (
                <TouchableOpacity 
                   key={contact.id} 
                   onPress={() => setSelectedChat(contact.id)} 
                   className="bg-white p-5 rounded-[32px] mb-4 flex-row items-center shadow-2xl shadow-indigo-100/40 border border-gray-100 active:scale-[0.98]"
                >
                  <View className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center border border-indigo-100 shadow-inner">
                    <Text className="font-black text-2xl text-indigo-600">{contact.name?.charAt(0) || '?'}</Text>
                    <View className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-[3px] border-white shadow-sm" />
                  </View>
                  
                  <View className="flex-1 ml-4 min-w-0">
                    <View className="flex-row justify-between items-center mb-1">
                      <Text className="font-black text-[15px] text-gray-900 truncate pr-2">{contact.name}</Text>
                      {lastMsg && <Text className="text-[10px] text-gray-400 font-bold uppercase">{lastMsg.timestamp}</Text>}
                    </View>
                    
                    <View className="flex-row items-center mb-2">
                       <View className="bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">
                         <Text className="text-[9px] font-bold text-indigo-600 uppercase tracking-tighter">{contact.role.replace('_', ' ')}</Text>
                       </View>
                    </View>

                    <Text className="text-sm text-gray-400 font-medium truncate" numberOfLines={1}>
                      {lastMsg ? lastMsg.message : 'Start a conversation...'}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            }) : (
              <View className="p-10 items-center justify-center">
                <Icons.Messages size={40} color="#cbd5e1" />
                <Text className="text-gray-400 text-sm font-bold mt-4 uppercase tracking-widest">No contacts found</Text>
              </View>
            )}
            <View className="h-20" />
          </Animated.ScrollView>
        </View>
      ) : (
        <View className="flex-1 bg-white">
          {/* Chat Header */}
          <View className="pt-12 pb-4 px-6 border-b border-gray-100 flex-row items-center bg-white shadow-sm z-10">
            <TouchableOpacity 
              onPress={() => setSelectedChat(null)} 
              className="w-10 h-10 bg-gray-50 rounded-xl items-center justify-center mr-3"
            >
              <Icons.ChevronRight size={20} color="#6b7280" style={{transform:[{rotate:'180deg'}]}}/>
            </TouchableOpacity>
            
            <View className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center border border-indigo-100">
              <Text className="font-bold text-lg text-indigo-600">{activeContact?.name?.charAt(0) || '?'}</Text>
            </View>
            
            <View className="ml-3 flex-1">
              <Text className="font-bold text-gray-900 text-lg leading-tight">{activeContact?.name}</Text>
              <View className="flex-row items-center mt-0.5">
                <View className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5" />
                <Text className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{activeContact?.role.replace('_', ' ')} • Online</Text>
              </View>
            </View>

            <TouchableOpacity className="p-2">
               <Icons.Radio size={20} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 px-4 pt-6" showsVerticalScrollIndicator={false}>
            {activeMessages.length > 0 ? activeMessages.map((msg: any) => (
              <View key={msg.id} className={`flex-row ${msg.senderId === currentUser.id ? 'justify-end' : 'justify-start'} mb-6`}>
                <View className={`max-w-[85%] px-5 py-4 rounded-[28px] shadow-sm ${
                  msg.sender_id === currentUser.id 
                    ? 'bg-indigo-600 rounded-tr-none' 
                    : 'bg-white rounded-tl-none border border-gray-100'
                }`}>
                  <Text className={`text-[15px] leading-6 font-bold ${msg.sender_id === currentUser.id ? 'text-white' : 'text-gray-900'}`}>
                    {msg.content}
                  </Text>
                  <View className="flex-row items-center justify-end mt-1.5 opacity-60">
                    <Text className={`text-[9px] font-bold uppercase tracking-tighter ${msg.sender_id === currentUser.id ? 'text-indigo-100' : 'text-gray-400'}`}>
                      {msg.timestamp}
                    </Text>
                    {msg.sender_id === currentUser.id && <Icons.Check size={10} color="white" style={{marginLeft: 4}} />}
                  </View>
                </View>
              </View>
            )) : (
              <View className="flex-1 items-center justify-center pt-20">
                 <View className="bg-indigo-50 w-20 h-20 rounded-[30px] items-center justify-center mb-4">
                    <Icons.Messages size={32} color="#4f46e5" />
                 </View>
                 <Text className="text-gray-400 text-[11px] font-black uppercase tracking-widest text-center">No institutional messages yet.{'\n'}Contact {activeContact?.name} directly.</Text>
              </View>
            )}
            <View className="h-10" />
          </ScrollView>

          {/* Action Bar */}
          <View className="px-6 py-5 bg-white border-t border-gray-100 flex-row items-center shadow-2xl shadow-indigo-100/50">
            <TouchableOpacity className="w-12 h-12 bg-slate-50 rounded-2xl items-center justify-center mr-3 border border-slate-100 shadow-inner">
              <Icons.Plus size={20} color="#6366f1"/>
            </TouchableOpacity>
            
            <View className="flex-1 relative">
              <TextInput 
                value={msgInput} 
                onChangeText={setMsgInput} 
                className="bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm text-gray-900 font-black" 
                placeholder="Compose Dispatch..." 
                placeholderTextColor="#94a3b8"
              />
            </View>

            <TouchableOpacity 
              onPress={handleSendMessage} 
              className={`ml-3 w-12 h-12 rounded-2xl items-center justify-center shadow-2xl ${msgInput.trim() ? 'bg-indigo-600 shadow-indigo-200' : 'bg-gray-200 shadow-none'}`}
              disabled={!msgInput.trim()}
            >
              <Icons.Messages size={22} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};
