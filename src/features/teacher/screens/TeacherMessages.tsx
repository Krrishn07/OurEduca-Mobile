import React, { useMemo, useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, Modal, Pressable, Image, Linking, FlatList } from 'react-native';
import { BlurView } from 'expo-blur';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
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
  handleSendMessage: (type?: string, url?: string, name?: string, customContent?: string) => void;
  uploadMessageFile: (schoolId: string, uri: string, name: string) => Promise<string>;
  assignments?: any[];
}

const AttachmentModal: React.FC<{
    visible: boolean;
    onClose: () => void;
    onSelect: (type: string) => void;
}> = ({ visible, onClose, onSelect }) => {
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
                
                <View className="bg-white rounded-t-[40px] px-6 pt-8 pb-12 shadow-2xl z-10">
                    <View className="w-12 h-1.5 bg-gray-100 rounded-full self-center mb-8" />
                    
                    <Text className="text-[18px] font-black text-gray-900 font-inter-black mb-2">Share Content</Text>
                    <Text className="text-[11px] font-black text-gray-400 uppercase tracking-widest font-inter-black mb-8">Select Institutional Resource</Text>
                    
                    <View className="flex-row flex-wrap justify-between">
                        {[
                            { id: 'DOC', label: 'Document', sub: 'PDF, Word, Excel', icon: 'FileText', color: '#4f46e5', bg: '#f5f7ff' },
                            { id: 'MEDIA', label: 'Media', sub: 'Photos & Videos', icon: 'Camera', color: '#ec4899', bg: '#fff1f2' },
                            { id: 'LINK', label: 'Link', sub: 'Academic URL', icon: 'Globe', color: '#10b981', bg: '#f0fdf4' },
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

export const TeacherMessages: React.FC<TeacherMessagesProps> = ({
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
  const [searchQuery, setSearchQuery] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showAttachModal, setShowAttachModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkInput, setLinkInput] = useState('');
  const [showAssignModal, setShowAssignModal] = useState(false);

  const filteredContacts = useMemo(() => {
    if (!searchQuery.trim()) return displayContacts || [];
    return (displayContacts || []).filter(c => 
      c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.role?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [displayContacts, searchQuery]);

  const filteredMessages = useMemo(() => {
    if (!selectedChat) return [];
    return (chatMessages || [])
      .filter(m => 
        (m.sender_id === currentUser.id && m.receiver_id === selectedChat) ||
        (m.sender_id === selectedChat && m.receiver_id === currentUser.id)
      )
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }, [chatMessages, selectedChat, currentUser.id]);

  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
      setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
  }, [filteredMessages]);

  const activeContact = (displayContacts || []).find(c => c.id === selectedChat);

  const onSend = async () => {
    if (!msgInput.trim() || isSending) return;
    setIsSending(true);
    try {
      await handleSendMessage();
    } finally {
      setIsSending(false);
    }
  };

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
          const publicUrl = await uploadMessageFile(currentUser.school_id || '', uri, name, mimeType);
          await handleSendMessage(msgType, publicUrl, name);
      } catch (err: any) {
          Alert.alert("Upload Error", err.message);
      } finally {
          setIsUploading(false);
      }
  };

  return (
    <View className="flex-1 bg-gray-50">
      {!selectedChat ? (
        <View className="flex-1 bg-gray-50">
          <View className="bg-white/90 p-4 pt-12 flex-row items-center justify-between shadow-sm shrink-0 border-b border-gray-100 z-10">
              <View className="flex-row items-center space-x-3">
                <View className="w-10 h-10 rounded-full bg-indigo-50 items-center justify-center mr-3">
                  <Icons.Messages size={20} color="#4f46e5" />
                </View>
                <View>
                  <Text className="font-black text-gray-900 text-[15px] leading-tight font-inter-black">Messages</Text>
                  <Text className="text-[11px] text-indigo-600 font-medium font-inter-medium">Academic Exchange</Text>
                </View>
              </View>
              
              <View className="flex-row bg-gray-100 rounded-3xl items-center px-4 py-2 w-1/2">
                 <Icons.Search size={16} color="#9ca3af" />
                 <TextInput 
                    placeholder="Search..." 
                    placeholderTextColor="#9ca3af"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    className="flex-1 ml-2 text-[12px] text-gray-800 font-inter" 
                 />
              </View>
          </View>

          <ScrollView 
            className="flex-1 p-4 bg-gray-50" 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
          >
              {filteredContacts.map((contact, idx) => {
                const history = (chatMessages || []).filter(m => 
                  (m.sender_id === contact.id && m.receiver_id === currentUser.id) || 
                  (m.sender_id === currentUser.id && m.receiver_id === contact.id)
                ).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
                
                const lastMsg = history[history.length - 1];
                return (
                  <TouchableOpacity
                    key={contact.id}
                    onPress={() => setSelectedChat(contact.id)}
                    className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm mb-3 flex-row items-center justify-between"
                  >
                    <View className="flex-row items-center flex-1">
                      <View className="w-10 h-10 rounded-full bg-indigo-50 items-center justify-center mr-3">
                         <Text className="text-indigo-600 font-bold font-inter">{contact.name?.charAt(0) || '?'}</Text>
                      </View>
                      <View className="flex-1 pr-2">
                        <Text className="font-black text-gray-900 text-[14px] font-inter-black">{contact.name}</Text>
                        <Text className="text-[12px] text-gray-500 mt-1 font-inter" numberOfLines={1}>
                          {lastMsg?.content || "No message history..."}
                        </Text>
                      </View>
                    </View>
                    <View className="items-end justify-center">
                       {lastMsg && (
                          <Text className="text-[10px] text-gray-400 font-inter font-bold mb-2">
                             {new Date(lastMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </Text>
                       )}
                       <View className="px-2 py-1 bg-gray-100 rounded-full">
                          <Text className="text-[9px] text-gray-600 uppercase tracking-widest font-inter-black">{contact.role?.toUpperCase() || 'STAFF'}</Text>
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
          <View className="bg-white/90 p-4 pt-12 flex-row items-center shadow-sm shrink-0 border-b border-gray-100 z-10">
            <TouchableOpacity 
              onPress={() => setSelectedChat(null)} 
              className="p-2 bg-gray-50 rounded-full mr-3"
            >
              <Icons.ChevronRight size={20} color="#9ca3af" style={{transform:[{rotate:'180deg'}]}}/>
            </TouchableOpacity>
            
            <View className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center mr-3">
              <Text className="font-bold text-[16px] text-indigo-600 font-inter">{activeContact?.name?.charAt(0) || '?'}</Text>
            </View>
            
            <View className="flex-1">
              <Text className="font-black text-gray-900 text-[15px] leading-tight font-inter-black" numberOfLines={1}>{activeContact?.name}</Text>
              <Text className="text-[11px] text-indigo-600 font-medium font-inter-medium mt-0.5">
                  {activeContact?.role}
              </Text>
            </View>
          </View>

          <FlatList
              ref={flatListRef}
              className="flex-1 p-4 bg-gray-50"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
              data={filteredMessages || []}
              keyExtractor={(item, index) => item.id || String(index)}
              renderItem={({ item: msg, index: idx }) => {
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
                         <TouchableOpacity 
                             activeOpacity={(msg.attachment_url || msg.content?.includes('[LINK]:')) ? 0.7 : 1}
                             onPress={() => {
                                 if (msg.attachment_url) {
                                     Linking.openURL(msg.attachment_url).catch(() => Alert.alert('Error', 'Could not open attachment.'));
                                 } else if (msg.content?.includes('[LINK]:')) {
                                     const extractedUrl = msg.content.split('[LINK]:')[1]?.trim();
                                     if (extractedUrl) {
                                         Linking.openURL(extractedUrl).catch(() => Alert.alert('Error', 'Could not open link.'));
                                     }
                                 }
                             }}
                             className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${
                                 isMine ? 'bg-indigo-600' : 'bg-white border border-gray-100'
                             }`}
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

                             <Text style={{ fontFamily: 'Inter_400Regular' }} className={`text-[14px] leading-relaxed ${isMine ? 'text-white' : 'text-gray-800'}`}>
                                 {msg.content}
                             </Text>
                             <View className="flex-row items-center justify-end mt-1" style={{ opacity: 0.6 }}>
                                 <Text style={{ fontSize: 9 }} className={`font-medium font-inter-medium ${isMine ? 'text-white' : 'text-gray-500'}`}>
                                     {msg.timestamp || (msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now')}
                                 </Text>
                                 {isMine && <Icons.Check size={10} color="white" style={{marginLeft: 4}} />}
                             </View>
                         </TouchableOpacity>
                     </View>
                  );
              }}
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

          <View className="p-3 bg-white border-t border-gray-100 flex-row items-center space-x-2 pb-safe-area shadow-2xl">
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
                className="flex-1 py-2 text-gray-800 text-sm" 
                style={{ fontFamily: 'Inter_400Regular' }}
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
          </View>
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
                      <Icons.Globe size={24} color="#10b981" />
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
                                  handleSendMessage('TEXT', undefined, undefined, `[LINK]: ${linkInput}`);
                                  setLinkInput('');
                                  setShowLinkModal(false);
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
              <View className="bg-white rounded-t-[40px] px-6 pt-8 pb-12 shadow-2xl h-[60%] z-10">
                  <View className="w-12 h-1.5 bg-gray-100 rounded-full self-center mb-6" />
                  <Text className="text-[18px] font-black text-gray-900 font-inter-black mb-6">Share Assignment</Text>
                  
                  <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
                      {(assignments || []).map((assignment: any) => (
                          <TouchableOpacity 
                              key={assignment.id}
                              className="mb-4 p-5 rounded-[24px] border border-gray-50 bg-[#fffbeb] flex-row items-center"
                              onPress={() => {
                                  handleSendMessage('TEXT', undefined, undefined, `[ASSIGNMENT] Please review: ${assignment.title}`);
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
};
