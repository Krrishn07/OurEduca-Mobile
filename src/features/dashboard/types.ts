import { User, UserRole, ChatMessage, Fee, FeeTransaction, CameraNode } from '../../../types';

export interface DashboardDomainBundles {
    mentor: {
        data: {
            assignedClassName: string;
            assignedClassId: string;
            assignedSection: string;
            mentorRoster: any[];
            dbStudents: User[];
            dbStaff: User[];
            dbClasses: any[];
            announcements: any[];
            attendanceMap: Record<string, 'PRESENT' | 'ABSENT' | 'UNMARKED'>;
            isSavingAttendance: boolean;
            classAttendanceRate: string;
            actualSubjectCount: number;
            actualParentCount: number;
            dbSectionFaculty: any[];
            dbVideos: any[];
            mentorVideoTab: 'PUBLIC' | 'PRIVATE' | 'MY_CONTENT';
            mentorVideoSearch: string;
            isMentorLiveStreamActive: boolean;
        };
        actions: {
            setMentorVideoTab: (tab: any) => void;
            setMentorVideoSearch: (search: string) => void;
            // setShowMentorGoLiveModal removed
            setShowUploadVideoModal: (show: boolean) => void;
            setPlayingVideo: (video: any) => void;
            setShowVideoPlayerModal: (show: boolean) => void;
            handleSaveAttendance: (map: any) => Promise<void>;
            setAttendanceMap: (map: any) => void;
            setShowAnnouncementModal: (show: boolean) => void;
            setShowAnnouncementHistoryModal: (show: boolean) => void;
            handleDeleteAnnouncement: (id: string) => Promise<void>;
            setShowAddStudentModal: (show: boolean) => void;
            setEditingUserId: (id: string | null) => void;
            // handleToggleMentorLiveStream removed
        };
    };
    platform: {
        data: {
            institutes: any[];
            registrationMessages: any[];
            isLoadingInquiries: boolean;
            users: User[];
            activeInstituteTab: 'ACTIVE' | 'PENDING' | 'SUSPENDED';
            instSearch: string;
            instViewMode: 'LIST' | 'DETAILS';
            selectedInst: any;
            isLoadingLeads: boolean;
        };
        actions: {
            handleVerifyInstitute: (id: string) => Promise<void>;
            handleOpenReview: (inst: any) => void;
            setActiveInstituteTab: (tab: any) => void;
            setInstSearch: (search: string) => void;
            setInstViewMode: (mode: any) => void;
            setSelectedInst: (inst: any) => void;
            handleInstituteAction: (type: string, inst: any, reviewCb: any) => Promise<void>;
        };
    };
    teacher: {
        data: {
            teacherAssignedSections: any[];
            teacherMaterials: any[];
            teacherTotalStudents: number;
            announcements: any[];
            meetings: any[];
            dbVideos: any[];
            teacherVideoTab: 'PUBLIC' | 'PRIVATE' | 'MY_CONTENT';
            teacherVideoSearch: string;
            isTeacherLiveStreamActive: boolean;
            dbRoster: any[];
        };
        actions: {
            setTeacherVideoTab: (tab: any) => void;
            setTeacherVideoSearch: (search: string) => void;
            setShowUploadVideoModal: (show: boolean) => void;
            setPlayingVideo: (video: any) => void;
            setShowVideoPlayerModal: (show: boolean) => void;
            setShowUploadModal: (show: boolean) => void;
            setShowAnnouncementModal: (show: boolean) => void;
            handleDeleteMaterial: (id: string) => Promise<void>;
            deleteVideo: (id: string, schoolId: string) => Promise<void>;
        };
    };
    student: {
        data: {
            studentPrimaryClass: any;
            allStudentClasses: any[];
            studentMaterials: any[];
            studentAssignments: any[];
            studentAttendanceRate: string;
            announcements: any[];
            dbVideos: any[];
            studentVideoTab: 'CLASSROOM' | 'LIBRARY' | 'GALLERY';
            studentVideoSearch: string;
            dbFees: any[];
            studentPaymentLink: string;
            dbRoster: any[];
        };
        actions: {
            setStudentVideoTab: (tab: any) => void;
            setManageSearch: (search: string) => void;
            setPlayingVideo: (video: any) => void;
            setShowVideoPlayerModal: (show: boolean) => void;
            initiateFeePayment: (id: string, userId: string, amount: number, schoolId: string) => Promise<void>;
            setShowAnnouncementHistoryModal: (show: boolean) => void;
            setShowEditProfileModal: (show: boolean) => void;
        };
    };
    headmaster: {
        data: {
            dbStudents: User[];
            users: User[];
            dbStaff: User[];
            dbClasses: any[];
            dbRoster: any[];
            announcements: any[];
            attendanceRate: string;
            systemLogs: any[];
            dbTransactions: any[];
        };
        actions: {
            setShowAnnouncementModal: (show: boolean) => void;
            setShowAnnouncementHistoryModal: (show: boolean) => void;
            handleDeleteAnnouncement: (id: string) => Promise<void>;
            handleShowNoticeDetail: (notice: any) => void;
            setShowAddClassModal: (show: boolean) => void;
            setShowAddTeacherModal: (show: boolean) => void;
            setShowAddStudentModal: (show: boolean) => void;
            handleEditStaff: (user: any) => void;
            handleDeleteStaff: (id: string) => Promise<void>;
            handleDeleteClass: (id: string) => Promise<void>;
            handleDeleteStudent: (id: string) => Promise<void>;
            handleAssignToRoster: (classId: string, section: string, user: User, subject?: string, type?: string) => Promise<void>;
            handleRemoveFromRoster: (id: string) => Promise<void>;
            issueBulkFee: (schoolId: string, studentIds: string[], title: string, amount: number, due: string) => Promise<void>;
            setEditingClassId: (id: string | null) => void;
            setNewClassName: (name: string) => void;
            setClassSections: (sections: string) => void;
            setUserForm: (form: any) => void;
            setUserModalType: (type: any) => void;
            setUserModalMode: (mode: any) => void;
            setStudentForm: (form: any) => void;
            setEditingUserId: (id: string | null) => void;
        };
    };
    common: {
        currentUser: User | null;
        currentUserRole: UserRole;
        activeTab: string;
        currentSchool: any;
        onNavigate: (tab: string) => void;
        onLogout: () => void;
        showToast: (msg: string, type?: any) => void;
        hasPermission: (feature: string, role?: UserRole, schoolId?: string) => boolean;
        getDisplayContacts: () => any[];
        transformedChatMessages: ChatMessage[];
        handleSendMessage: (text: string) => Promise<void>;
        selectedChat: string | null;
        setSelectedChat: (id: string | null) => void;
        msgInput: string;
        setMsgInput: (text: string) => void;
        rolePermissions?: any[];
    };
}
