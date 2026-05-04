import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Modal, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { Icons } from './Icons';
import { UserRole } from '../types';
import { useSchoolData } from '../contexts/SchoolDataContext';

interface GlobalAIChatProps {
  role: UserRole;
}

export const GlobalAIChat: React.FC<GlobalAIChatProps> = ({ role }) => {
  const { platformSettings } = useSchoolData();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ id: string; text: string; isAi: boolean }[]>([
    { 
      id: 'welcome', 
      text: `Hi! I'm your ${platformSettings.platformName} AI assistant. I can help with ${role === UserRole.STUDENT ? 'homework' : role === UserRole.TEACHER ? 'lesson plans' : 'reports'} and platform navigation.`, 
      isAi: true 
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const scrollToBottom = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(scrollToBottom, 100);
    }
  }, [messages, isOpen]);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMsg = { 
        id: Date.now().toString(), 
        text: inputText, 
        isAi: false 
    };
    setMessages(prev => [...prev, userMsg]);
    
    setInputText('');
    Keyboard.dismiss();
    setIsTyping(true);

    setTimeout(() => {
        const responseText = "This is a mock AI response in React Native.";
        const aiMsg = { id: (Date.now() + 1).toString(), text: responseText, isAi: true };
        setMessages(prev => [...prev, aiMsg]);
        setIsTyping(false);
        setTimeout(scrollToBottom, 100);
    }, 1500);
  };

  const handleMicClick = () => {
    if (isListening) {
      setIsListening(false);
    } else {
      setIsListening(true);
      setTimeout(() => {
        setIsListening(false);
        setInputText("Summarize my upcoming assignments");
      }, 2000);
    }
  };

  return (
    <>
      {!isOpen && (
        <TouchableOpacity
          onPress={() => setIsOpen(true)}
          className="absolute bottom-20 right-4 z-50 w-14 h-14 rounded-full bg-indigo-600 shadow-xl items-center justify-center border-2 border-indigo-400"
        >
          <Icons.AI size={28} color="white" />
        </TouchableOpacity>
      )}

      <Modal visible={isOpen} transparent animationType="slide">
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1 justify-end bg-black/20"
        >
          <View className="flex-1 mt-20 bg-white rounded-t-3xl shadow-2xl overflow-hidden">
            
            <View className="bg-white/90 p-4 flex-row items-center justify-between shadow-sm shrink-0 border-b border-gray-100 z-10">
              <View className="flex-row items-center space-x-3">
                <View className="w-10 h-10 rounded-full bg-indigo-50 items-center justify-center mr-3">
                  <Icons.AI size={20} color="#4f46e5" />
                </View>
                <View>
                  <Text className="font-black text-gray-900 text-[15px] leading-tight font-inter-black">{platformSettings.platformName} AI</Text>
                  <Text className="text-[11px] text-indigo-600 font-medium font-inter-medium">with Gemini 3</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setIsOpen(false)} className="p-2 bg-gray-50 rounded-full">
                <Icons.Close size={20} color="#9ca3af" />
              </TouchableOpacity>
            </View>

            <ScrollView 
                ref={scrollViewRef}
                className="flex-1 p-4 bg-gray-50"
                contentContainerStyle={{ paddingBottom: 20 }}
            >
               <View className="items-center mb-4">
                 <View className="bg-gray-200 px-3 py-1 rounded-full">
                    <Text className="text-[10px] text-gray-600 uppercase tracking-wide font-medium font-inter-medium">Today</Text>
                 </View>
               </View>

              {messages.map((msg) => (
                <View key={msg.id} className={`flex-row mb-4 ${msg.isAi ? 'justify-start' : 'justify-end'}`}>
                  {msg.isAi && (
                    <View className="w-8 h-8 rounded-full bg-indigo-100 items-center justify-center mr-2 mt-auto">
                        <Icons.AI size={16} color="#4f46e5" />
                    </View>
                  )}
                  <View className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${
                    msg.isAi 
                      ? 'bg-white border border-gray-100' 
                      : 'bg-indigo-600'
                  }`}>
                    <Text style={{ color: msg.isAi ? '#1f2937' : 'white', fontSize: 14, fontFamily: 'Inter_400Regular' }}>{msg.text}</Text>
                  </View>
                </View>
              ))}
              
              {isTyping && (
                <View className="flex-row justify-start mb-4">
                  <View className="w-8 h-8 rounded-full bg-indigo-100 items-center justify-center mr-2 mt-auto">
                        <Icons.AI size={16} color="#4f46e5" />
                  </View>
                  <View className="bg-white px-4 py-3 rounded-2xl shadow-sm border border-gray-100 flex-row items-center space-x-1">
                    <Text className="text-gray-400 font-inter">Typing...</Text>
                  </View>
                </View>
              )}
            </ScrollView>

            <View className="p-3 bg-white border-t border-gray-100 flex-row items-center space-x-2 pb-safe-area">
              <TouchableOpacity className="p-2.5 bg-gray-100 rounded-full mr-2">
                <Icons.Plus size={20} color="#6b7280" />
              </TouchableOpacity>

              <View className="flex-1 flex-row bg-gray-100 rounded-3xl items-center px-4 py-1 mr-2">
                <TextInput
                  value={inputText}
                  onChangeText={setInputText}
                  placeholder={isListening ? "Listening..." : `Ask ${platformSettings.platformName} AI...`}
                  placeholderTextColor="#6b7280"
                  className="flex-1 py-2 text-gray-800 text-sm"
                  style={{ fontFamily: 'Inter_400Regular' }}
                  multiline
                />
              </View>

              {inputText.trim() ? (
                 <TouchableOpacity 
                   onPress={handleSendMessage}
                   disabled={isTyping}
                   className="p-3 bg-indigo-600 rounded-full items-center justify-center"
                 >
                   {isTyping ? <Icons.Loading size={20} color="white" /> : <Icons.Messages size={20} color="white" />}
                 </TouchableOpacity>
              ) : (
                 <TouchableOpacity 
                   onPress={handleMicClick}
                   className={`p-3 rounded-full items-center justify-center ${
                     isListening ? 'bg-red-500' : 'bg-gray-800'
                   }`}
                 >
                   <Icons.Mic size={20} color="white" />
                 </TouchableOpacity>
              )}
            </View>
            
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
};