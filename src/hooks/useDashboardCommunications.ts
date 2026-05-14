import { useState, useCallback, useMemo } from 'react';
import { Platform } from 'react-native';
import { User, UserRole } from '@/types';
import { supabase } from '@lib/supabase';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';

/**
 * Hook to manage dashboard communications, contact resolution, 
 * and message transformation.
 */
export const useDashboardCommunications = (
  currentUser: User,
  role: UserRole,
  dbStaff: any[],
  dbStudents: any[],
  chatMessages: any[],
  sendChatMessage: (schoolId: string, senderId: string, receiverId: string, content: string) => Promise<void>,
  markMessagesAsRead: (senderId: string, receiverId: string) => Promise<void>,
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void,
  mockAuthUser: any
) => {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [msgInput, setMsgInput] = useState('');

  const uploadMessageFile = useCallback(async (file: { uri: string; type: string; name?: string }) => {
    console.log('[UPLOAD_DEBUG] Received file request:', { uri: file.uri, type: file.type, name: file.name });
    
    if (!file.uri) {
      console.error('[UPLOAD_ERROR] File URI is null or undefined');
      throw new Error('File URI is missing');
    }

    try {
      const schoolId = mockAuthUser?.school_id || mockAuthUser?.schoolId || 'general';
      const fileExt = file.uri.split('.').pop()?.split('?')[0] || (file.type === 'image' ? 'jpg' : 'bin');
      const fileName = `${schoolId}/${Date.now()}_${file.name?.replace(/\s+/g, '_') || `attachment.${fileExt}`}`;
      
      console.log('[UPLOAD_DEBUG] Prepared fileName:', fileName);

      // Ensure URI is properly formatted for Native Bridge
      let cleanUri = file.uri;
      if (Platform.OS === 'android' && !cleanUri.startsWith('file://') && !cleanUri.startsWith('content://')) {
        cleanUri = `file://${cleanUri}`;
      }

      console.log('[UPLOAD_DEBUG] Calling FileSystem.readAsStringAsync with:', cleanUri);

      // Read file as base64 using Expo FileSystem (The most stable method on Android/iOS)
      const base64 = await FileSystem.readAsStringAsync(cleanUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      console.log('[UPLOAD_DEBUG] File read successful, length:', base64.length);

      // Convert base64 to ArrayBuffer for Supabase Storage
      const arrayBuffer = decode(base64);

      const { data, error } = await supabase.storage
        .from('messages')
        .upload(fileName, arrayBuffer, {
          contentType: file.type === 'image' ? 'image/jpeg' : 'application/octet-stream',
          upsert: true
        });

      if (error) {
        console.error('[UPLOAD_ERROR] Supabase Storage error:', error);
        throw error;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('messages')
        .getPublicUrl(fileName);

      console.log('[UPLOAD_SUCCESS] Public URL:', publicUrl);
      return publicUrl;
    } catch (err: any) {
      console.error('[UPLOAD_CRITICAL_ERROR]:', err);
      throw err;
    }
  }, [mockAuthUser]);

  const getDisplayContacts = useCallback(() => {
    let potentialContacts: User[] = [];
    const allUsers = [...(dbStaff || []), ...(dbStudents || [])];
    
    if (role === UserRole.PLATFORM_ADMIN) {
      potentialContacts = allUsers.filter((u: User) => u.role === UserRole.SUPER_ADMIN);
    } else if (role === UserRole.SUPER_ADMIN) {
      potentialContacts = allUsers.filter((u: User) => 
        u.id !== currentUser.id && 
        (u.role === UserRole.PLATFORM_ADMIN || u.role === UserRole.TEACHER || u.role === UserRole.ADMIN_TEACHER || u.role === UserRole.SUPER_ADMIN || u.role === UserRole.STUDENT || u.role === UserRole.PARENT)
      );
    } else if (role === UserRole.ADMIN_TEACHER) {
      potentialContacts = allUsers.filter((u: User) => 
        u.id !== currentUser.id && 
        (u.role === UserRole.SUPER_ADMIN || u.role === UserRole.STUDENT || u.role === UserRole.PARENT || u.role === UserRole.TEACHER)
      );
    } else if (role === UserRole.STUDENT || role === UserRole.PARENT) {
      potentialContacts = allUsers.filter((u: User) => 
        u.id !== currentUser.id && 
        (u.role === UserRole.ADMIN_TEACHER || u.role === UserRole.TEACHER || u.role === UserRole.SUPER_ADMIN)
      );
    }

    const myConversations = new Set<string>();
    chatMessages.forEach((msg: any) => {
      if (msg.sender_id === currentUser.id) myConversations.add(msg.receiver_id);
      if (msg.receiver_id === currentUser.id) myConversations.add(msg.sender_id);
    });
    
    const recognizedContacts = allUsers.filter((u: User) => 
      u.id !== currentUser.id && 
      (myConversations.has(u.id) || potentialContacts.find(pc => pc.id === u.id))
    );

    const mysteryChatIds = Array.from(myConversations).filter(id => !allUsers.find(u => u.id === id));
    const mysteryContacts: User[] = mysteryChatIds.map(id => ({
      id,
      name: 'External Communication',
      role: UserRole.PLATFORM_ADMIN,
      status: 'Active'
    } as User));

    return [...recognizedContacts, ...mysteryContacts];
  }, [role, dbStaff, dbStudents, chatMessages, currentUser.id]);

  const handleSendMessage = useCallback(async (type: string = 'text', url?: string, name?: string, customContent?: string, targetId?: string) => {
    const finalChat = targetId || selectedChat;
    const finalContent = customContent || msgInput;
    if (!finalChat) return;
    if (type === 'text' && !finalContent.trim()) return;
    
    const schoolId = mockAuthUser?.school_id || mockAuthUser?.schoolId;
    const senderId = currentUser.id || mockAuthUser?.id;

    if (schoolId && senderId) {
      try {
        await sendChatMessage(schoolId, senderId, finalChat, finalContent, type, url, name);
        if (!customContent) setMsgInput('');
      } catch (err: any) {
        console.error('Failed to send message:', err.message);
        showToast(`Send failed: ${err.message || 'Check database permissions'}`, 'error');
      }
    } else {
      showToast('Identity error: Missing school ID', 'error');
    }
  }, [msgInput, selectedChat, currentUser.id, mockAuthUser, sendChatMessage, showToast]);

  const transformedChatMessages: any[] = useMemo(() => {
    return chatMessages.map(msg => ({
      ...msg,
      senderId: msg.sender_id,
      receiverId: msg.receiver_id,
      message: msg.content,
      timestamp: msg.created_at 
        ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : 'Just now'
    }));
  }, [chatMessages]);

  return {
    selectedChat,
    setSelectedChat,
    msgInput,
    setMsgInput,
    getDisplayContacts,
    displayContacts: getDisplayContacts(),
    transformedChatMessages,
    handleSendMessage,
    markMessagesAsRead,
    uploadMessageFile
  };
};
