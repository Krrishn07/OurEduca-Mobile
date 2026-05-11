import { UserRole, User, Fee, FeeTransaction, CameraNode, LiveStream, RosterSection, ChatMessage } from './index';

export interface DashboardDomainBundles {
    mentor: {
        data: any;
        actions: any;
    };
    platform: {
        data: any;
        actions: any;
    };
    teacher: {
        data: any;
        actions: any;
    };
    student: {
        data: any;
        actions: any;
    };
    headmaster: {
        data: any;
        actions: any;
    };
    common: {
        currentUser: User | null;
        currentUserRole: UserRole;
        activeTab: string;
        currentSchool: any;
        onNavigate: (tab: string) => void;
        onLogout: () => void;
        showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
        hasPermission: (permission: string) => boolean;
        getDisplayContacts: () => any[];
        transformedChatMessages: ChatMessage[];
        handleSendMessage: (content: string, type?: any, file?: any) => Promise<void>;
        markMessagesAsRead: (chatId: string) => void;
        selectedChat: any;
        setSelectedChat: (chat: any) => void;
        msgInput: string;
        setMsgInput: (msg: string) => void;
        rolePermissions: any;
    };
}
