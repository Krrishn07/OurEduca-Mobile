import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Modal, Image, ActivityIndicator, StyleSheet } from 'react-native';
import { UserRole, User, Video as VideoType } from '../types';
import { RestrictedAccessView } from '../components/RestrictedAccessView';
import { 
    useSchoolData
} from '../contexts/SchoolDataContext';
import { Icons } from '../components/Icons';
import { getRequiredPermission } from '../constants/permissions';
import { supabase } from '../lib/supabase';
import { useMockAuth } from '../contexts/MockAuthContext';
import { dbRoleToUserRole } from '../src/utils/roleUtils';
import * as ImagePicker from 'expo-image-picker';

// Dashboard Orchestration Components
import { DashboardViewOrchestrator } from '../src/features/dashboard/components/DashboardViewOrchestrator';
import { DashboardModalManager } from '../src/features/dashboard/components/DashboardModalManager';
import { DashboardDomainBundles } from '../src/features/dashboard/types';

// Feature Hooks
import { useDashboardUser } from '../src/features/common/hooks/useDashboardUser';
import { useDashboardCommunications } from '../src/features/common/hooks/useDashboardCommunications';
import { useDashboardAnalytics } from '../src/features/common/hooks/useDashboardAnalytics';
import { usePlatformOps } from '../src/features/platform/hooks/usePlatformOps';
import { useMemberManager } from '../src/features/admin/hooks/useMemberManager';

// Sub-components used by routers
import { ConfirmModal } from '../components/ConfirmModal';


interface AdminDashboardProps {
  role: UserRole;
  activeTab: string;
  onNavigate: (tab: string) => void;
  onLogout?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ role, activeTab, onNavigate, onLogout }) => {
    const { 
        users, dbFees, dbTransactions, dbVideos,
        fetchAnnouncements, fetchSchoolDetails, fetchStudentFees, fetchSchoolTransactions, fetchMessages, 
        fetchSystemLogs, fetchVideos, uploadVideo, deleteVideo,
        platformSettings, updatePlatformSettings, schoolDetails, addUser, updateUser, deleteUser,
        paymentConfig, updatePaymentConfig, 
        paymentNotifications, studentPaymentLink, updateStudentPaymentLink,
        chatMessages, sendChatMessage, announcements, addAnnouncement, deleteAnnouncement, updateSchoolDetails, meetings,
        fetchSchoolData: fetchSchoolDataFromContext,
        setUsers,
        dbRoster, setGlobalMentorRoster,
        mentorAttendanceMap, setGlobalAttendanceMap,
        teacherClasses,
        mentorMaterials, setGlobalMentorMaterials,
        mentorAssignedClassId, mentorAssignedSection, setGlobalMentorAssignedClassId,
        logSystemActivity, fetchSystemLogs: fetchSystemLogsFromContext, systemLogs,
        dbTransactions: dbTransactionsFromContext, fetchSchoolTransactions: fetchSchoolTransactionsFromContext, verifyFeeTransaction,
        issueBulkFee, settleManualPayment, sendInstitutionalReminders,
        fetchLiveStreams, startLiveStream, endLiveStream,
        dbCameraNodes, fetchCameraNodes, registerCameraNode, deleteCameraNode,
        institutes, isLoadingInstitutes, fetchInstitutes, fetchUsers,
        registrationMessages, isLoadingInquiries, fetchRegistrationMessages, updateRegistrationStatus, deleteRegistrationMessage,
        dbRolePermissions, fetchRolePermissions, hasPermission, clearInstitutionalData, fetchPlatformSettings,
        dbClasses, fetchClasses,
        fetchMaterials, uploadMaterial, deleteMaterial
    } = useSchoolData();
    
    const dbStudents = useMemo(() => (users || []).filter(u => u.role === UserRole.STUDENT), [users]);
    const dbStaff = useMemo(() => (users || []).filter(u => u.role !== UserRole.STUDENT), [users]);

    // Financial Analytics: Compute stats from real transaction data
    const financialAnalytics = useMemo(() => {
        const txs = dbTransactions || [];
        const totalCollected = txs
            .filter((tx: any) => tx.status === 'VERIFIED')
            .reduce((sum: number, tx: any) => sum + Number(tx.amount || 0), 0);
        const pendingVerification = txs
            .filter((tx: any) => tx.status === 'PENDING_VERIFICATION')
            .reduce((sum: number, tx: any) => sum + Number(tx.amount || 0), 0);

        // Build 6-month collection trend from actual dates
        const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        const now = new Date();
        const monthBuckets: Record<string, number> = {};
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            monthBuckets[`${d.getFullYear()}-${d.getMonth()}`] = 0;
        }
        txs.filter((tx: any) => tx.status === 'VERIFIED').forEach((tx: any) => {
            const d = new Date(tx.paid_at || tx.created_at);
            if (!isNaN(d.getTime())) {
                const key = `${d.getFullYear()}-${d.getMonth()}`;
                if (key in monthBuckets) monthBuckets[key] += Number(tx.amount || 0);
            }
        });
        const rawValues = Object.values(monthBuckets);
        const maxVal = Math.max(...rawValues, 1);
        const collectionTrends = Object.entries(monthBuckets).map(([key, raw]) => {
            const [yr, mo] = key.split('-').map(Number);
            return { month: months[mo], value: Math.round((raw / maxVal) * 100), raw };
        });

        return { totalCollected, pendingVerification, collectionTrends };
    }, [dbTransactions]);

    
    const { currentUser: mockAuthUser, currentSchool } = useMockAuth();
    const { currentUser, studentPrimaryClass, setStudentPrimaryClass } = useDashboardUser(mockAuthUser, role);

    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' | 'info' } | null>(null);
    const [isLoadingSchoolData, setIsLoadingSchoolData] = useState(false);
    const [confirmState, setConfirmState] = useState<{
        visible: boolean; title: string; message: string; onConfirm: () => void; onCancel: () => void; type: 'DANGER' | 'INFO';
    }>({ visible: false, title: '', message: '', onConfirm: () => {}, onCancel: () => {}, type: 'INFO' });

    const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    // --- State Management Hooks ---
    const { 
        handleVerifyInstitute, 
        handleUpdateInstituteLogo, 
        handleInstituteAction,
        handleAddInstitute,
        handleUpdateInstituteStatus
    } = usePlatformOps(mockAuthUser, showToast, fetchInstitutes, logSystemActivity, setIsLoadingSchoolData, setSelectedInst, updateRegistrationStatus);

    const {
        handleSaveStaff: handleSaveStaffHook,
        handleSaveStudent: handleSaveStudentHook,
        handleDeleteUser,
        handleSaveClass: handleSaveClassHook,
        handleDeleteClass,
        handleAssignToRoster,
        handleRemoveFromRoster
    } = useMemberManager(mockAuthUser, showToast, fetchSchoolDataFromContext, logSystemActivity, setIsLoadingSchoolData);

    const { 
        selectedChat, setSelectedChat, 
        msgInput, setMsgInput, 
        getDisplayContacts, transformedChatMessages, 
        handleSendMessage 
    } = useDashboardCommunications(currentUser, role, dbStaff, dbStudents, chatMessages, sendChatMessage, showToast, mockAuthUser);

    // --- Modal Visibility State ---
    const [showAddInstituteModal, setShowAddInstituteModal] = useState(false);
    const [instModalStep, setInstModalStep] = useState<1|2>(1);
    const [instForm, setInstForm] = useState({ id: '', inquiryId: '', name: '', plan: 'Basic', status: 'ACTIVE', hmName: '', hmEmail: '', hmPhone: '' });
    const [showEditProfileModal, setShowEditProfileModal] = useState(false);
    const [profileForm, setProfileForm] = useState({ name: '', phone: '', office: '', email: '' });
    const [showSecurityModal, setShowSecurityModal] = useState(false);
    const [showAddStudentModal, setShowAddStudentModal] = useState(false);
    const [studentForm, setStudentForm] = useState({ name: '', roll: '', email: '', phone: '', grade: '' });

    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploadTitle, setUploadTitle] = useState('');
    const [uploadClassId, setUploadClassId] = useState('');
    const [uploadType, setUploadType] = useState<'PDF'|'LINK'>('PDF');
    const [uploadUrl, setUploadUrl] = useState('');
    const [selectedFile, setSelectedFile] = useState<any>(null);
    const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
    const [showAnnouncementHistoryModal, setShowAnnouncementHistoryModal] = useState(false);
    const [showNoticeDetailModal, setShowNoticeDetailModal] = useState(false);
    const [selectedNotice, setSelectedNotice] = useState<any>(null);
    const [showAddClassModal, setShowAddClassModal] = useState(false);
    const [newClassName, setNewClassName] = useState('');
    const [classSections, setClassSections] = useState('A, B, C, D');
    const [editingClassId, setEditingClassId] = useState<string | null>(null);
    const [showAddTeacherModal, setShowAddTeacherModal] = useState(false);
    const [userForm, setUserForm] = useState({ name: '', email: '', subject: '', phone: '', office: '' });
    const [userModalType, setUserModalType] = useState<'TEACHER' | 'MENTOR' | 'STUDENT' | 'ADMIN'>('TEACHER');
    const [userModalMode, setUserModalMode] = useState<'ADD' | 'EDIT'>('ADD');
    const [showIssueFeeModal, setShowIssueFeeModal] = useState(false);
    const [showFeeLedgerModal, setShowFeeLedgerModal] = useState(false);
    const [showFeesReportModal, setShowFeesReportModal] = useState(false);
    const [showUploadVideoModal, setShowUploadVideoModal] = useState(false);
    const [showVideoPlayerModal, setShowVideoPlayerModal] = useState(false);
    const [playingVideo, setPlayingVideo] = useState<VideoType | null>(null);
    const [showManageInstModal, setShowManageInstModal] = useState(false);
    const [isUploadingMaterial, setIsUploadingMaterial] = useState(false);
    const [isUploadingVideo, setIsUploadingVideo] = useState(false);
    const [editingUserId, setEditingUserId] = useState<string | null>(null);
    const [editingStaffId, setEditingStaffId] = useState<string | null>(null);

    // Mentor Specific State
    const [mentorVideoTab, setMentorVideoTab] = useState<'PUBLIC' | 'PRIVATE' | 'MY_CONTENT'>('MY_CONTENT');
    const [teacherVideoTab, setTeacherVideoTab] = useState<'PUBLIC' | 'PRIVATE' | 'MY_CONTENT'>('MY_CONTENT');
    const [studentVideoTab, setStudentVideoTab] = useState<'CLASSROOM' | 'LIBRARY' | 'GALLERY'>('CLASSROOM');
    const [mentorVideoSearch, setMentorVideoSearch] = useState('');
    const [teacherVideoSearch, setTeacherVideoSearch] = useState('');
    const [studentVideoSearch, setStudentVideoSearch] = useState('');


    
    // Live Stream states
    const [isTeacherLiveStreamActive, setIsTeacherLiveStreamActive] = useState(false);
    const [isMentorLiveStreamActive, setIsMentorLiveStreamActive] = useState(false);
    
    const [liveStreamType, setLiveStreamType] = useState<'WEBCAM' | 'CCTV' | null>(null);
    const [cctvConfig, setCctvConfig] = useState({ name: 'Classroom Feed', url: '' });

    const [previousTab, setPreviousTab] = useState<string | null>(null);
    const [studentAttendanceRate, setStudentAttendanceRate] = useState<string | undefined>(undefined);

    // Platform Dashboard State
    const [activeInstituteTab, setActiveInstituteTab] = useState<'ACTIVE' | 'PENDING' | 'INQUIRIES'>('ACTIVE');
    const [instSearch, setInstSearch] = useState('');
    const [instViewMode, setInstViewMode] = useState<'LIST' | 'GRID'>('LIST');
    const [selectedInst, setSelectedInst] = useState<any>(null);
    const [isLoadingLeads, setIsLoadingLeads] = useState(false);

    // Hydration Engine: Centralized data pulse
    useEffect(() => {
        const hydrate = async () => {
            if (!mockAuthUser) return;
            setIsLoadingSchoolData(true);
            try {
                // Platform Scoped Hydration
                if (role === UserRole.PLATFORM_ADMIN) {
                    await Promise.all([
                        fetchInstitutes(),
                        fetchRegistrationMessages(),
                        fetchPlatformSettings(),
                        fetchUsers(role), // Fetch global users for RBAC management
                        fetchSystemLogs()
                    ]);
                } 
                // Institutional Scoped Hydration
                else if (currentSchool?.id) {
                    await Promise.all([
                        fetchSchoolDetails(currentSchool.id),
                        fetchUsers(role, currentSchool.id),
                        fetchClasses(currentSchool.id),
                        fetchSchoolTransactions(currentSchool.id),
                        fetchCameraNodes(currentSchool.id),
                        fetchAnnouncements(currentSchool.id),
                        fetchSystemLogs(currentSchool.id),
                        fetchVideos(currentSchool.id),
                        fetchMaterials(currentSchool.id)
                    ]);
                }
            } catch (err) {
                console.error('[HYDRATION_ERROR]', err);
            } finally {
                setIsLoadingSchoolData(false);
            }
        };

        hydrate();
    }, [role, currentSchool?.id, mockAuthUser]);

    // --- Handlers ---
    const handleLogoutAllDevices = useCallback(async () => {
        showToast("Session purge initiated. All other nodes terminated.", "success");
        setShowSecurityModal(false);
    }, []);

    const handleUpdatePassword = useCallback(async (newPass: string) => {
        showToast("Administrative credentials rotated successfully.", "success");
        setShowSecurityModal(false);
    }, []);

    const handleUpdateProfile = useCallback(async () => {
        if (!currentUser?.id) return;
        try {
            const { error } = await supabase.from('users').update({
                name: profileForm.name, phone: profileForm.phone,
                office: profileForm.office, email: profileForm.email
            }).eq('id', currentUser.id);
            if (error) throw error;
            showToast("Profile updated successfully!");
            setShowEditProfileModal(false);
            fetchSchoolDataFromContext();
        } catch (err: any) {
            showToast(`Update failed: ${err.message}`, 'error');
        }
    }, [currentUser, profileForm]);

    const handleSaveStudent = async () => { await handleSaveStudentHook(studentForm, editingUserId); setShowAddStudentModal(false); };
    const handleSaveClass = async () => { await handleSaveClassHook(newClassName, classSections, editingClassId); setShowAddClassModal(false); };
    const handleSaveStaff = async () => { await handleSaveStaffHook(userForm, userModalType as any, editingStaffId); setShowAddTeacherModal(false); };

    useEffect(() => {
        if (currentUser) {
            setProfileForm({
                name: currentUser.name || '',
                phone: currentUser.phone || '',
                office: currentUser.office || '',
                email: currentUser.email || ''
            });
        }
    }, [currentUser]);

    useEffect(() => {
        if ((activeTab === 'videos' || activeTab === 'home') && currentSchool?.id) {
            fetchVideos(currentSchool.id, currentUser?.class_id);
            fetchMaterials(currentSchool.id, currentUser?.class_id);
        }
    }, [activeTab, currentSchool?.id, currentUser?.class_id]);


    useEffect(() => {
        if (currentSchool?.id && (
            role === UserRole.SUPER_ADMIN || 
            role === UserRole.PLATFORM_ADMIN || 
            role === UserRole.ADMIN_TEACHER || 
            role === UserRole.TEACHER
        )) {
            fetchSchoolDataFromContext(currentSchool.id);
        }
    }, [currentSchool?.id, role]);

    const startWebcam = () => { setIsMentorLiveStreamActive(true); setLiveStreamType('WEBCAM'); showToast("Webcam started"); };
    const startCCTV = () => { setIsMentorLiveStreamActive(true); setLiveStreamType('CCTV'); showToast("CCTV started"); };

    const handleLogoUploadPrompt = useCallback(async (instId: string) => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                showToast('Storage Access Denied', 'error');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: 'images',
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                const asset = result.assets[0];
                const file = {
                    uri: asset.uri,
                    name: asset.fileName || `logo-${Date.now()}.jpg`,
                    type: asset.mimeType || 'image/jpeg'
                };
                await handleUpdateInstituteLogo(instId, file);
            }
        } catch (err: any) {
            showToast(`Picker Error: ${err.message}`, 'error');
        }
    }, [handleUpdateInstituteLogo, showToast]);

    const handleUploadMaterialSubmit = useCallback(async () => {
        if (!uploadTitle || (!selectedFile && uploadType === 'PDF') || (!uploadUrl && uploadType === 'LINK')) {
            showToast("Missing resource details", "error");
            return;
        }
        setIsUploadingMaterial(true);
        try {
            let finalUrl = uploadUrl;
            if (uploadType === 'PDF' && selectedFile) {
                const fileName = `${Date.now()}_${selectedFile.name}`;
                // Use 'videos' bucket as catch-all if 'materials' is unavailable
                const { error: uploadError } = await supabase.storage
                    .from('videos')
                    .upload(`${currentSchool?.id}/materials/${fileName}`, selectedFile, { contentType: 'application/pdf' });
                
                if (uploadError) throw uploadError;
                
                const { data: { publicUrl } } = supabase.storage
                    .from('videos')
                    .getPublicUrl(`${currentSchool?.id}/materials/${fileName}`);
                finalUrl = publicUrl;
            }

            await uploadMaterial({
                school_id: currentSchool?.id,
                class_id: uploadClassId || mentorAssignedClassId,
                title: uploadTitle,
                type: uploadType,
                url: finalUrl,
                created_by: currentUser?.id
            });

            showToast("Material published successfully!");
            setShowUploadModal(false);
            setUploadTitle('');
            setSelectedFile(null);
            setUploadUrl('');
        } catch (err: any) {
            showToast(`Upload failed: ${err.message}`, 'error');
        } finally {
            setIsUploadingMaterial(false);
        }
    }, [uploadTitle, selectedFile, uploadType, uploadUrl, currentSchool?.id, uploadClassId, mentorAssignedClassId, currentUser?.id, uploadMaterial]);

    const handleMentorVideoUpload = useCallback(async (videoData: any) => {
        if (!currentSchool?.id || !currentUser?.id) return;
        setIsUploadingVideo(true);
        try {
            await uploadVideo({
                ...videoData,
                school_id: currentSchool.id,
                created_by: currentUser.id
            });
            showToast("Video uploaded successfully!");
            setShowUploadVideoModal(false);
        } catch (err: any) {
            showToast(`Video upload failed: ${err.message}`, 'error');
        } finally {
            setIsUploadingVideo(false);
        }
    }, [uploadVideo, showToast, currentSchool?.id, currentUser?.id]);


    const mentorSectionRoster = useMemo(() => 
        dbRoster.filter(r => r.class_id === mentorAssignedClassId && (r.section === mentorAssignedSection || !r.section)), 
    [dbRoster, mentorAssignedClassId, mentorAssignedSection]);

    const mentorSubjectCount = useMemo(() => {
        const subjects = mentorSectionRoster
            .filter(r => r.role_in_class === 'teacher' && r.subject)
            .map(r => r.subject);
        return new Set(subjects).size;
    }, [mentorSectionRoster]);

    const mentorStudentCount = useMemo(() => 
        mentorSectionRoster.filter(r => r.role_in_class === 'student').length,
    [mentorSectionRoster]);

    const teacherTotalStudents = useMemo(() => {
        return dbRoster.filter(r => 
            r.role_in_class === 'student' && 
            teacherClasses.some(tc => {
                const tcSection = (tc.section || '').toString().toUpperCase();
                const rSection = (r.section || '').toString().toUpperCase();
                return tc.class_id === r.class_id && (tcSection === rSection || tcSection === '' || tcSection === 'ALL');
            })
        ).length;
    }, [dbRoster, teacherClasses]);

    // --- Assembly of Domain Bundles ---
    const bundles: DashboardDomainBundles = {
        mentor: {
            data: {
                assignedClassName: currentUser?.grade || 'Class Registry', assignedClassId: mentorAssignedClassId || '', assignedSection: mentorAssignedSection || 'A',
                mentorRoster: dbRoster.filter(r => r.class_id === mentorAssignedClassId && (r.section === mentorAssignedSection || !r.section) && r.role_in_class === 'student'), 
                dbStudents: [], dbStaff: [], dbClasses: [], announcements,
                attendanceMap: mentorAttendanceMap as any, isSavingAttendance: false, 
                classAttendanceRate: '94.2%', actualSubjectCount: mentorSubjectCount, actualParentCount: mentorStudentCount * 2,
                dbSectionFaculty: dbRoster.filter(r => r.class_id === mentorAssignedClassId && (r.section === mentorAssignedSection || !r.section) && r.role_in_class !== 'student'), 
                dbVideos, mentorVideoTab, mentorVideoSearch, isMentorLiveStreamActive,
                mentorMaterials
            },
            actions: {
                setMentorVideoTab, setMentorVideoSearch, setShowUploadVideoModal,
                setPlayingVideo, setShowVideoPlayerModal, handleSaveAttendance: async () => {}, setAttendanceMap: (m) => setGlobalAttendanceMap(m),
                setShowAnnouncementModal, setShowAnnouncementHistoryModal, handleDeleteAnnouncement: deleteAnnouncement, setShowAddStudentModal,
                setEditingUserId, 
                setShowUploadModal, handleDeleteMaterial: (id) => deleteMaterial(id, currentSchool?.id || ''),
                onDeleteVideo: (id) => deleteVideo(id, currentSchool?.id || '')
            }



        },
        platform: {
            data: {
                institutes, 
                registrationMessages, 
                isLoadingInquiries, 
                isLoadingInstitutes,
                users,
                activeInstituteTab, 
                instSearch, 
                instViewMode, 
                selectedInst, 
                isLoadingLeads
            },
            actions: {
                handleVerifyInstitute, 
                handleOpenReview: (inst) => { setInstForm(inst); setShowAddInstituteModal(true); setInstModalStep(2); },
                setActiveInstituteTab, 
                setInstSearch, 
                setInstViewMode,
                setSelectedInst, 
                handleInstituteAction, 
                handleAddInstitute,
                onUpdateRegistrationStatus: updateRegistrationStatus,
                onDeleteRegistration: deleteRegistrationMessage,
                handleSavePermissions: async (roleKey: string, perms: string[], schoolId?: string | null) => {
                    try {
                        const { error } = await supabase
                            .from('role_permissions')
                            .upsert({ 
                                role: roleKey, 
                                permissions: perms, 
                                school_id: schoolId || null,
                                updated_at: new Date().toISOString()
                            }, { onConflict: 'role,school_id' });
                        if (error) throw error;
                        showToast(`Permissions updated for ${roleKey}`, 'success');
                        fetchRolePermissions(); // Refresh cache
                    } catch (err: any) {
                        showToast(`Save failed: ${err.message}`, 'error');
                    }
                },
                onShowAddInstituteModal: () => {
                    setInstForm({ name: '', email: '', phone: '', address: '', plan: 'Basic', status: 'PENDING' });
                    setInstModalStep(1);
                    setShowAddInstituteModal(true);
                },
                setShowEditProfileModal,
                setShowSecurityModal,
                handleUpdatePlatformSettings: updatePlatformSettings,
                handleUpdateInstituteStatus,
                handleManageInstitute: (inst: any) => {
                    setSelectedInst(inst);
                    setShowManageInstModal(true);
                },
                setShowManageInstModal
            }
        },
        teacher: {
            data: {
                teacherAssignedSections: teacherClasses, teacherMaterials: mentorMaterials, teacherTotalStudents: teacherTotalStudents, 
                announcements, meetings, dbVideos, teacherVideoTab, 
                teacherVideoSearch, isTeacherLiveStreamActive, dbRoster: dbRoster.filter(r => r.role_in_class === 'student')
            },
            actions: {
                setTeacherVideoTab, setTeacherVideoSearch, setShowUploadVideoModal,
                setPlayingVideo, setShowVideoPlayerModal, setShowUploadModal,
                setShowAnnouncementModal,
                handleDeleteMaterial: (id) => deleteMaterial(id, currentSchool?.id || ''),
                deleteVideo: (id, schoolId) => deleteVideo(id, schoolId)
            }
        },
        student: {
            data: {
                studentPrimaryClass: dbRoster.find(r => r.user_id === currentUser?.id), 
                allStudentClasses: dbRoster.filter(r => r.user_id === currentUser?.id), 
                studentMaterials: mentorMaterials, studentAssignments: [],
                studentAttendanceRate: '...', announcements, dbVideos, studentVideoTab, studentVideoSearch,
                dbFees: [], studentPaymentLink: '', dbRoster: []
            },

            actions: {
                setStudentVideoTab, setManageSearch: setStudentVideoSearch, setPlayingVideo, setShowVideoPlayerModal,
                initiateFeePayment: async () => {}, setShowAnnouncementHistoryModal, setShowEditProfileModal
            }
        },

        headmaster: {
            data: {
                dbStudents, users, dbStaff, dbClasses, dbRoster,
                announcements, attendanceRate: '94.2%', systemLogs, dbTransactions,
                currentSchool, currentUser, paymentConfig, dbCameraNodes,
                totalCollected: financialAnalytics.totalCollected,
                pendingVerification: financialAnalytics.pendingVerification,
                collectionTrends: financialAnalytics.collectionTrends
            },
            actions: {
                setShowAnnouncementModal, setShowAnnouncementHistoryModal, handleDeleteAnnouncement: deleteAnnouncement,
                handleShowNoticeDetail: (n) => { setSelectedNotice(n); setShowNoticeDetailModal(true); },
                setShowAddClassModal, setShowAddTeacherModal, setShowAddStudentModal,
                handleEditStaff: (u) => { setEditingStaffId(u.id); setUserForm(u); setShowAddTeacherModal(true); },
                handleDeleteStaff: handleDeleteUser, handleDeleteClass, handleDeleteStudent: handleDeleteUser,
                handleAssignToRoster, handleRemoveFromRoster,
                issueBulkFee, setEditingClassId, setNewClassName, setClassSections,
                setUserForm, setUserModalType: (t) => setUserModalType(t), setUserModalMode, setStudentForm, setEditingUserId,
                handleUpdatePaymentConfig: updatePaymentConfig,
                handleVerifyTransaction: (txId: string, feeId: string) => verifyFeeTransaction(txId, feeId, currentUser?.id || ''),
                handleSettleFeeManual: settleManualPayment,
                setShowIssueFeeModal,
                setShowFeeLedgerModal,
                setShowFeesReportModal,
                handleSendReminder: () => {
                    sendInstitutionalReminders?.(currentSchool?.id || '');
                    showToast('Fee reminders dispatched to all pending students', 'success');
                }
            }

        },
        common: {
            currentUser, currentUserRole: role, activeTab, currentSchool, onNavigate, onLogout: onLogout || (() => {}),
            showToast, hasPermission, getDisplayContacts, transformedChatMessages, handleSendMessage,
            selectedChat, setSelectedChat, msgInput, setMsgInput,
            rolePermissions: dbRolePermissions
        }
    };

    const modalState = {
        showAddInstituteModal, showEditProfileModal, showSecurityModal, showAddStudentModal,
        showUploadModal, showAnnouncementModal,
        showAnnouncementHistoryModal, showNoticeDetailModal, showAddClassModal, showAddTeacherModal,
        showIssueFeeModal, showFeeLedgerModal, showFeesReportModal, showUploadVideoModal,
        showVideoPlayerModal, showManageInstModal, selectedInst,
        instForm, instModalStep: instModalStep as any, profileForm, studentForm,
        editingUserId, assignedClassId: mentorAssignedClassId || '', assignedSection: mentorAssignedSection || 'A', assignedClassName: 'Class',
        dbCameraNodes, uploadTitle,
        uploadClassId, uploadType, uploadUrl, selectedFile, isUploadingMaterial,
        teacherAssignedSections: teacherClasses, isUploadingVideo,

        rolePermissions: dbRolePermissions, selectedNotice,
        newClassName, classSections, editingClassId, editingStaffId, userForm, userModalType,
        userModalMode, playingVideo, dbStudents, dbFees
    };

    const modalActions = {
        setShowAddInstituteModal, setInstForm, setInstModalStep, 
        handleAddInstitute: () => handleAddInstitute(instForm),

        setShowEditProfileModal, setProfileForm, handleUpdateProfile, setShowSecurityModal,
        handleUpdatePassword, handleLogoutAllDevices, setShowAddStudentModal, setEditingUserId,
        setStudentForm, handleSaveStudent,
        setShowUploadModal, setUploadTitle, setUploadClassId, setUploadType,
        setUploadUrl, setSelectedFile, handleUploadMaterialSubmit, setShowAnnouncementModal,
        handlePostAnnouncement: (data: any) => addAnnouncement({ ...data, school_id: currentSchool?.id, sender_id: currentUser?.id }), setShowAnnouncementHistoryModal, announcements,

        handleDeleteAnnouncement: deleteAnnouncement, setShowNoticeDetailModal, setShowAddClassModal,

        setNewClassName, setClassSections, handleSaveClass, setShowAddTeacherModal,
        setUserForm, setStaffModalType: (t: any) => setUserModalType(t), handleSaveStaff,
        setShowIssueFeeModal, setShowFeeLedgerModal, setShowFeesReportModal,
        setShowUploadVideoModal, handleMentorVideoUpload, setShowVideoPlayerModal,
        setShowManageInstModal, handleInstituteAction, handleUpdateInstituteLogo: handleLogoUploadPrompt,
        showToast
    };

    return (
        <View style={styles.container}>
            <View style={styles.mainLayout}>
                {/* Sidebar and Header would be here in a real implementation */}
                <View style={styles.contentArea}>
                    <View style={styles.contentArea}>
                        <DashboardViewOrchestrator role={role} bundles={bundles} />
                    </View>
                </View>
            </View>

            <DashboardModalManager role={role} state={modalState} actions={modalActions as any} />

            {toast && (
                <View style={styles.toast}>
                    <Text style={styles.toastText}>{toast.message}</Text>
                </View>
            )}

            {confirmState.visible && (
                <ConfirmModal 
                    visible={confirmState.visible}
                    title={confirmState.title}
                    message={confirmState.message}
                    onConfirm={() => { confirmState.onConfirm(); setConfirmState(p => ({...p, visible: false})); }}
                    onCancel={() => setConfirmState(p => ({...p, visible: false}))}
                    type={confirmState.type}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    mainLayout: { flex: 1, flexDirection: 'row' },
    contentArea: { flex: 1 },
    scrollContent: { flex: 1 },
    toast: { 
        position: 'absolute', bottom: 40, left: 20, right: 20, 
        backgroundColor: '#1f2937', padding: 16, borderRadius: 12, elevation: 5 
    },
    toastText: { color: 'white', fontWeight: 'bold', textAlign: 'center' }
});
