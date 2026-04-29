import { useState, useCallback, useMemo } from 'react';
import { User, UserRole } from '../../../../types';

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
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void,
  mockAuthUser: any
) => {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [msgInput, setMsgInput] = useState('');

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

  const handleSendMessage = useCallback(async () => {
    if (!msgInput.trim() || !selectedChat) return;
    
    const schoolId = mockAuthUser?.school_id || mockAuthUser?.schoolId;
    const senderId = currentUser.id || mockAuthUser?.id;

    if (schoolId && senderId) {
      try {
        await sendChatMessage(schoolId, senderId, selectedChat, msgInput);
        setMsgInput('');
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
    handleSendMessage
  };
};
