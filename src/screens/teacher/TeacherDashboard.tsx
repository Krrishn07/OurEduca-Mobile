import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Platform, ActivityIndicator, Alert, TextInput, Pressable, RefreshControl, InteractionManager } from 'react-native';
import { Icons } from '@components/common/Icons';
import { HapticPatterns } from '@utils/haptics';
import { useSchoolData } from '@context/SchoolDataContext';
import { supabase } from '@lib/supabase';
import { useMockAuth } from '@context/MockAuthContext';
import { UserRole, User, ChatMessage, LiveStream as LiveStreamType } from '@/types';
import { RestrictedAccessView } from '@components/common/RestrictedAccessView';

// Modular Screens
import { TeacherHome } from '@screens/teacher/TeacherHome';
import { TeacherClasses } from '@screens/teacher/TeacherClasses';
import { TeacherVideos } from '@screens/teacher/TeacherVideos';
import { TeacherMessages } from '@screens/teacher/TeacherMessages';
import { TeacherProfile } from '@screens/teacher/TeacherProfile';
import { TeacherMaterials } from '@screens/teacher/TeacherMaterials';
import { TeacherNotices } from '@screens/teacher/TeacherNotices';
import { AnnouncementsScreen } from '@components/common';
import { TeacherGrading } from '@screens/teacher/TeacherGrading';
import { TeacherClassDetail } from '@screens/teacher/TeacherClassDetail';
import { TeacherReports } from '@screens/teacher/TeacherReports';

// Modular Modals
import { 
  UploadMaterialModal, 
  UploadVideoModal, 
  VideoPlayerModal, 
  AnnouncementModal, 
  AnnouncementHistoryModal, 
  AddStudentModal, 
  EditProfileModal,
  CreateAssignmentModal 
} from '@components/modals';
import { Video as VideoType } from '@context/SchoolDataContext';

const isValidUrl = (value: string) => {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

interface TeacherDashboardProps {
  activeTab: string;
  onNavigate?: (tab: string) => void;
  navigation?: any;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ activeTab, onNavigate, navigation }) => {
  // --- Modals State ---
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [showAnnouncementHistoryModal, setShowAnnouncementHistoryModal] = useState(false);
  const [showReports, setShowReports] = useState(false);
  const [showVideoUploadModal, setShowVideoUploadModal] = useState(false);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showAllMaterials, setShowAllMaterials] = useState(false);
  const [showAllNotices, setShowAllNotices] = useState(false);
  const [showGrading, setShowGrading] = useState(false);
  const [showClassDetail, setShowClassDetail] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [modalInitialClassId, setModalInitialClassId] = useState<string | null>(null);
  
  // Videos State
  const [videoTab, setVideoTab] = useState<'PUBLIC' | 'PRIVATE' | 'MY_CONTENT'>('MY_CONTENT');
  const [videoSearch, setVideoSearch] = useState('');
  
  const [selectedClass, setSelectedClass] = useState<any | null>(null);
  const [playingVideo, setPlayingVideo] = useState<VideoType | null>(null);
  const [showVideoPlayerModal, setShowVideoPlayerModal] = useState(false);
  const [activeStreamId, setActiveStreamId] = useState<string | null>(null);
  const [isLiveStreamActive, setIsLiveStreamActive] = useState(false);
  const [toast, setToast] = useState<{show: boolean, message: string}>({show: false, message: ''});
  const [gradingInitialClass, setGradingInitialClass] = useState<any>(null);
  const [selectedAssignmentForGrading, setSelectedAssignmentForGrading] = useState<any>(null);
  const [uploadSaving, setUploadSaving] = useState(false);
  const [studentSaving, setStudentSaving] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [announcementSaving, setAnnouncementSaving] = useState(false);

  const [uploadError, setUploadError] = useState<string | null>(null);
  const [studentError, setStudentError] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [announcementError, setAnnouncementError] = useState<string | null>(null);

  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [studentStatus, setStudentStatus] = useState<string | null>(null);
  const [profileStatus, setProfileStatus] = useState<string | null>(null);
  
  // --- Context & Supabase ---
  const { currentUser: mockAuthUser, currentSchool, setSession } = useMockAuth();
  const { 
    announcements, meetings, addAnnouncement, fetchAnnouncements, deleteAnnouncement, 
    chatMessages, sendChatMessage, fetchMessages,
    dbVideos, fetchVideos, uploadVideo, deleteVideo,
    liveStreams, fetchLiveStreams, startLiveStream, endLiveStream,
    dbCameraNodes, fetchCameraNodes,
    hasPermission,
    systemLogs,
    fetchSystemLogs,
    assignments,
    fetchAssignments,
    addAssignment,
    gradeAssignment,
    uploadMessageFile,
    markMessagesAsRead,
    fetchMoreMessages,
    logSystemActivity
  } = useSchoolData();

  // Teacher Profile
  const teacherProfile = useMemo(() => {
    if (!mockAuthUser) return { id: 'T-0', name: 'Loading...', role: UserRole.TEACHER } as User;
    return {
        ...mockAuthUser,
        role: (mockAuthUser.role as unknown) as UserRole,
        office: mockAuthUser.office || 'Staff Room 2',
        phone: mockAuthUser.phone || '+1 555-0199',
    } as unknown as User;
  }, [mockAuthUser]);
  
  // Form States
  const [modalInitialRosterId, setModalInitialRosterId] = useState<string | null>(null);


  const [editProfileName, setEditProfileName] = useState('');
  const [editProfileEmail, setEditProfileEmail] = useState('');
  const [editProfilePhone, setEditProfilePhone] = useState('');
  const [editProfileOffice, setEditProfileOffice] = useState('');

  // --- Navigation & State Sync ---
  // RESET GATE: When the main tab changes, reset all internal sub-page flags
  // This prevents the dashboard from being "stuck" in a sub-view (like Materials)
  // when the user navigates between main tabs (Classes, Videos, etc.)
  useEffect(() => {
    setShowAllMaterials(false);
    setShowAllNotices(false);
    setShowGrading(false);
    setShowReports(false);
    setShowClassDetail(false);
    setSelectedClass(null);
  }, [activeTab]);

  // Hydration Guard: Keep edit state in sync with loaded profile
  useEffect(() => {
    if (teacherProfile && teacherProfile.id !== 'T-0') {
      setEditProfileName(teacherProfile.name || '');
      setEditProfileEmail(teacherProfile.email || '');
      setEditProfilePhone(teacherProfile.phone || '');
      setEditProfileOffice(teacherProfile.office || '');
    }
  }, [teacherProfile.id, teacherProfile.name, teacherProfile.email, teacherProfile.phone, teacherProfile.office]);

  // Message State
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [pendingMessageTemplate, setPendingMessageTemplate] = useState<string | null>(null);
  // displayContacts is memoized below. chatMessages is from context.
  
  // --- Supabase State ---
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [teacherMaterials, setTeacherMaterials] = useState<any[]>([]);
  const [teacherAssignments, setTeacherAssignments] = useState<any[]>([]);
  const [assignedSections, setAssignedSections] = useState<any[]>([]);
  const [classStudents, setClassStudents] = useState<any[]>([]); // Resolved Students Roster
  const [studentCounts, setStudentCounts] = useState<any[]>([]);
  const [dbPrincipals, setDbPrincipals] = useState<User[]>([]);
  const [pendingGradesCount, setPendingGradesCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const canAccessSection = (section: 'classes' | 'videos' | 'messages') => {
    // temporary safe fallback so tabs still open even if school context is missing
    if (!currentSchool?.id) return true;
    return hasPermission(section, teacherProfile.role, currentSchool.id);
  };

  const syncActiveStream = useCallback(async () => {
    if (!mockAuthUser?.id) return;
    try {
        const { data, error } = await supabase
            .from('live_streams')
            .select('id')
            .eq('created_by', mockAuthUser.id)
            .eq('is_active', true)
            .limit(1)
            .maybeSingle();
        
        if (!error && data) {
            setActiveStreamId(data.id);
            setIsLiveStreamActive(true);
            console.log(`[STREAM_RECOVERY] Restored session: ${data.id}`);
        }
    } catch (err) {
        console.error('syncActiveStream error:', err);
    }
  }, [mockAuthUser?.id]);

  // --- Supabase: Fetch Teacher Data ---
  const fetchTeacherData = useCallback(async () => {
      if (!mockAuthUser?.id) return;
      setIsLoading(true);
      try {
          await syncActiveStream();
          await fetchAssignments(currentSchool?.id || '');
          // 1. Fetch Teacher's Class Assignments
          const { data: rosterData, error: rosterError } = await supabase
              .from('class_roster')
              .select('id, class_id, section, subject, classes(name, subject, room_no, class_time, duration_minutes)')
              .eq('user_id', mockAuthUser.id)
              .in('role_in_class', ['teacher', 'mentor']);
          
          if (rosterError) throw rosterError;

          // Flatten for easier UI consumption with Metadata Recovery
          const flattenedSections = (rosterData || []).map((r: any) => ({
              ...r,
              ...r.classes,
              name: r.classes?.name || 'Class Section',
              section: r.section || 'A',
              displayName: `${r.classes?.name || 'Class'} - Section ${r.section || 'A'}`,
              subject: r.subject || r.classes?.subject || 'Direct Instruction',
              room_no: r.classes?.room_no || '302',
              class_time: r.classes?.class_time || null,
              rosterId: r.id
          }));
          setAssignedSections(flattenedSections);
          
          if (rosterData && (rosterData || []).length > 0) {
              const classIds = (rosterData || []).map(r => r.class_id);

              // 2. Fetch Materials & Student Counts (Concurrent)
              const materialsPromise = supabase
                  .from('materials')
                  .select('*, classes(name)')
                  .in('class_id', classIds)
                  .eq('created_by', mockAuthUser.id)
                  .order('created_at', { ascending: false })
                  .limit(100);

              const studentCountPromise = supabase
                  .from('class_roster')
                  .select('class_id, section')
                  .in('class_id', classIds)
                  .eq('role_in_class', 'student');

              const studentsListPromise = supabase
                  .from('class_roster')
                  .select('class_id, section, users!inner(id, name, role, avatar)')
                  .in('class_id', classIds)
                  .eq('role_in_class', 'student')
                  .limit(500); // Institutional cap for a teacher's total active student view

              // 3. Fetch Assignments specifically for these classes (Concurrent)
              const assignmentsPromise = supabase
                  .from('assignments')
                  .select('*')
                  .in('class_id', classIds)
                  .order('created_at', { ascending: false });

              const [materialsRes, studentCountRes, studentsListRes, assignmentsRes] = await Promise.all([
                  materialsPromise,
                  studentCountPromise,
                  studentsListPromise,
                  assignmentsPromise
              ]);
              
              if (!materialsRes.error) setTeacherMaterials(materialsRes.data || []);
              if (!studentCountRes.error) setStudentCounts(studentCountRes.data || []);
              if (!assignmentsRes.error && assignmentsRes.data) {
                  setTeacherAssignments(assignmentsRes.data);
              }
              
              // 3. Fetch Pending Grades Count directly (Optimization)
              const { count: pendingCount } = await supabase
                  .from('class_roster')
                  .select('*', { count: 'exact', head: true })
                  .eq('role_in_class', 'student')
                  .is('grade_score', null)
                  .in('class_id', classIds);
              
              setPendingGradesCount(pendingCount || 0);

              // Store resolved student list for Roster View
              // ARMOR: Strictly filter students to match the teacher's specific (Class ID, Section) pairs
              const resolvedStudents = (studentsListRes.data || []).filter((s: any) => {
                  return flattenedSections.some(sec => 
                    sec.class_id === s.class_id && 
                    (sec.section || 'A') === (s.section || 'A')
                  );
              });
              setClassStudents(resolvedStudents);

              // 4. Fetch Essential Institutional Contacts (Principal)
              const { data: principalData } = await supabase
                  .from('users')
                  .select('id, name, role, avatar')
                  .eq('school_id', mockAuthUser.school_id)
                  .eq('role', 'super_admin');
              
              if (principalData) {
                setDbPrincipals(principalData as User[]);
              }
              
              const targetSchoolId = mockAuthUser.school_id || mockAuthUser.schoolId;
              
              if (targetSchoolId) {
                fetchSystemLogs(targetSchoolId);
              }
          }
      } catch (err: any) {
          console.error('fetchTeacherData error:', err.message);
      } finally {
          setIsLoading(false);
      }
  }, [mockAuthUser?.id, mockAuthUser?.school_id]);

  // STABILIZATION GATE: Safely handle initial class selection for the Upload Modal
  // This occurs once assignedSections are loaded, preventing the "Select -> Re-fetch" infinite loop.
  useEffect(() => {
    if (assignedSections.length > 0 && !modalInitialRosterId) {
        const firstSection = assignedSections[0];
        setModalInitialRosterId(firstSection.id || firstSection.rosterId);
        console.log(`[TEACHER_DASHBOARD] Default Upload Context Locked: ${firstSection.name}`);
    }
  }, [assignedSections]);

  // Optimized contact lookup (Memoized to prevent sync loops)
  const displayContacts = React.useMemo(() => {
    const uniqueContactsMap = new Map();
    
    // 1. Add Headmasters
    dbPrincipals.forEach(u => {
        if (u.id !== mockAuthUser?.id) uniqueContactsMap.set(u.id, u);
    });

    // 2. Add Roster Students (Already armored in fetchTeacherData)
    classStudents.forEach(s => {
        const u = Array.isArray(s.users) ? s.users[0] : s.users;
        // The classStudents list is already filtered by fetchTeacherData, so we just map to User objects
        if (u && u.id && u.id !== mockAuthUser?.id) uniqueContactsMap.set(u.id, u);
    });

    // 3. Add anyone we have a conversation with
    const myConversations = new Set<string>();
    (chatMessages || []).forEach((msg: any) => {
        if (msg.sender_id === mockAuthUser?.id) myConversations.add(msg.receiver_id);
        if (msg.receiver_id === mockAuthUser?.id) myConversations.add(msg.sender_id);
    });

    // Final list: Exclusion of self (already handled)
    return Array.from(uniqueContactsMap.values()) as User[];
  }, [dbPrincipals, classStudents, chatMessages, mockAuthUser?.id]);

  const teacherRecentActivity = useMemo(() => {
    // TACTICAL SYNC: Merge institutional logs with teacher-specific ones
    const logs = (systemLogs || []).filter(log => {
      const isOwner = log.user_id === mockAuthUser?.id;
      const isRelevantSystemLog = log.category === 'SYSTEM' && 
                                  (log.title?.includes(mockAuthUser?.name || '') || 
                                   log.title?.includes('Resource') || 
                                   log.title?.includes('Graded'));
      return isOwner || isRelevantSystemLog;
    });
    
    return logs.slice(0, 5);
  }, [systemLogs, mockAuthUser?.id, mockAuthUser?.name]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
        await fetchTeacherData();
        if (mockAuthUser?.school_id) {
            await Promise.all([
                fetchAnnouncements(mockAuthUser.school_id, ['ALL', 'STAFF']),
                fetchMessages(mockAuthUser.school_id, true),
                fetchVideos(mockAuthUser.school_id),
                fetchSystemLogs(mockAuthUser.school_id)
            ]);
        }
        showToast("Dashboard synchronized with server");
    } catch (err) {
        showToast("Refresh failed. Check connection.");
    } finally {
        setRefreshing(false);
    }
  }, [fetchTeacherData, fetchAnnouncements, fetchMessages, fetchVideos, fetchSystemLogs, mockAuthUser?.school_id, mockAuthUser?.schoolId]);

  useEffect(() => {
      let isMounted = true;
      
      const initializeData = async () => {
        if (!isMounted) return;
        
        try {
          await fetchTeacherData();
          
          if (mockAuthUser?.school_id && isMounted) {
            // Institutional Feed Handshake
            await Promise.allSettled([
              fetchAnnouncements(mockAuthUser.school_id, ['ALL', 'STAFF']),
              fetchMessages(mockAuthUser.school_id, true),
              fetchVideos(mockAuthUser.school_id),
              fetchCameraNodes(mockAuthUser.school_id),
              fetchSystemLogs(mockAuthUser.school_id)
            ]);
          }
        } catch (err) {
          console.error('[TEACHER_INIT_ERROR] Data hydration failed:', err);
        }
      };

      InteractionManager.runAfterInteractions(() => {
        initializeData();
      });

      return () => {
        isMounted = false;
      };
  }, [fetchTeacherData, fetchAnnouncements, fetchMessages, fetchVideos, fetchCameraNodes, mockAuthUser?.school_id]);


  const showToast = (msg: string) => {
      setToast({ show: true, message: msg });
      setTimeout(() => setToast({ show: false, message: '' }), 3000);
  };

  const handleGradeAssignment = useCallback((assignment: any) => {
      const cls = (assignedSections || []).find(s => s.class_id === assignment.class_id);
      setGradingInitialClass(cls);
      setSelectedAssignmentForGrading(assignment);
      setShowGrading(true);
  }, [assignedSections]);

  const handleQuickAction = useCallback((action: string) => {
      switch (action) {
          case 'Upload Material':
              setShowUploadModal(true);
              break;
          case 'Post Announcement':
              setShowAnnouncementModal(true);
              break;
          case 'GRADE':
          case 'Grade Quiz':
              setGradingInitialClass(selectedClass);
              setSelectedAssignmentForGrading(null);
              setShowGrading(true);
              break;
          case 'REPORT':
          case 'View Report':
              setGradingInitialClass(selectedClass); 
              setShowReports(true);
              break;
          case 'Create Assignment':
              setModalInitialClassId(null);
              setShowAssignmentModal(true);
              break;
          default:
              console.log(`Action: ${action}`);
      }
  }, [selectedClass]);

  const [assignmentSaving, setAssignmentSaving] = useState(false);
  const handleCreateAssignment = useCallback(async (assignment: any) => {
    setAssignmentSaving(true);
    try {
      const targetSchoolId = currentSchool?.id || mockAuthUser?.school_id;
      
      if (!targetSchoolId) {
        throw new Error("Institutional context missing");
      }

        await addAssignment({
          ...assignment,
          school_id: targetSchoolId
        });

        // Log activity for Recent Activity feed
        await logSystemActivity(
            targetSchoolId, 
            `New Assignment: ${assignment.title}`, 
            'FileText', 
            '#4f46e5', 
            mockAuthUser?.id, 
            'SYSTEM'
        );

        showToast("Assignment Broadcasted");
        setShowAssignmentModal(false);
        fetchTeacherData();
    } catch (err: any) {
      console.error('[ASSIGNMENT_CREATION] Failure:', err.message);
      showToast(`Broadcast Failed: ${err.message}`);
    } finally {
      setAssignmentSaving(false);
    }
  }, [currentSchool?.id, mockAuthUser?.id, addAssignment, logSystemActivity, fetchTeacherData]);


  const handleUpload = useCallback(async (data: {
    title: string;
    rosterId: string;
    type: 'PDF' | 'LINK';
    url: string;
    file: any;
  }) => {
    setUploadError(null);
    const selectedRoster = (assignedSections || []).find(s => (s.id || s.rosterId) === data.rosterId);
    const targetClassId = selectedRoster?.class_id;
    const targetSection = selectedRoster?.section;

    if (!data.title.trim()) {
        setUploadError("Please enter a title.");
        return;
    }

    if (!targetClassId) {
        setUploadError("Please select a class.");
        return;
    }

    if (data.type === 'PDF' && !data.file) {
        setUploadError("Please choose a PDF file.");
        return;
    }

    if (data.type === 'LINK' && (!data.url.trim() || !isValidUrl(data.url))) {
        setUploadError("Please enter a valid web link.");
        return;
    }

    if (!mockAuthUser?.id) { showToast("Authentication Required"); return; }

    setUploadSaving(true);
    setUploadStatus("Preparing Node...");
    try {
        let finalUrl = data.url;
        if (data.type === 'LINK' && data.url && !data.url.startsWith('http')) {
            finalUrl = `https://${data.url}`;
        }
        if (data.type === 'PDF' && data.file) {
            const fileExt = data.file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `materials/${mockAuthUser.id}/${fileName}`;

            // React Native File Upload
            setUploadStatus("Uploading Document...");
            
            // OPTION B: fetch + blob (Memory Efficient)
            const response = await fetch(data.file.uri);
            const blob = await response.blob();

            const { error: uploadError } = await supabase.storage
                .from('materials') // Fixed: Should go to materials bucket
                .upload(filePath, blob, {
                    contentType: 'application/pdf',
                    upsert: false
                });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('videos') 
                .getPublicUrl(filePath);
            
            finalUrl = publicUrl;
        }

        // --- Step 2: Insert Database Record (Optimistic) ---
        const tempId = `temp-${Date.now()}`;
        const optimisticMaterial = {
            id: tempId,
            title: data.title,
            class_id: targetClassId,
            school_id: mockAuthUser.school_id,
            section: targetSection,
            subject: selectedRoster?.subject || 'Lecture',
            type: data.type,
            url: finalUrl,
            created_by: mockAuthUser.id,
            created_at: new Date().toISOString()
        };
        
        // LayoutAnimation.configureNext removed
        setTeacherMaterials(prev => [optimisticMaterial, ...prev]);
        setShowUploadModal(false);

        const { data: dbData, error } = await supabase.from('materials').insert({
            title: data.title, 
            class_id: targetClassId, 
            school_id: mockAuthUser.school_id,
            section: targetSection,
            subject: selectedRoster?.subject || 'Lecture', 
            type: data.type,
            url: finalUrl, 
            created_by: mockAuthUser.id
        }).select();

        if (error) {
            // Rollback
            setTeacherMaterials(prev => prev.filter(m => m.id !== tempId));
            throw error;
        }
        
        if (dbData && dbData[0]) {
            setTeacherMaterials(prev => prev.map(m => m.id === tempId ? dbData[0] : m));
        }

        // Log activity for Recent Activity feed
        await logSystemActivity(
            mockAuthUser.school_id || mockAuthUser.schoolId, 
            `Resource Published: ${data.title}`, 
            'FileText', 
            '#4f46e5', 
            mockAuthUser.id, 
            'SYSTEM'
        );

        showToast("Material Synchronized!");
    } catch (err: any) {
        console.error('Upload Error:', err.message);
        setUploadError(err.message ?? "Upload failed.");
    } finally { 
        setUploadSaving(false); 
        setUploadStatus(null);
    }
  }, [assignedSections, mockAuthUser, logSystemActivity, showToast]);


  const handleCloseUploadModal = () => {
    setShowUploadModal(false);
  };

  const handleAddStudent = useCallback(async (data: { name: string; email: string }) => {
    setStudentError(null);
    const targetClass = selectedClass;
    if (!data.name.trim()) {
        setStudentError("Student name is required.");
        return;
    }
    if (!data.email.trim()) {
        setStudentError("Student email is required.");
        return;
    }
    if (!mockAuthUser?.school_id || !targetClass) {
        showToast("Context Missing");
        return;
    }
    
    setStudentSaving(true);
    try {
        const email = data.email.trim();
        
        // Institutional Registry Sync
        setStudentStatus("Checking Registry...");
        let userId = '';
        const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('email', email)
            .maybeSingle();
        
        if (existingUser) {
            userId = existingUser.id;
        } else {
            const { data: newUser, error: createError } = await supabase
                .from('users')
                .insert({
                    name: data.name.trim(),
                    email: email,
                    role: 'student',
                    school_id: mockAuthUser.school_id,
                })
                .select('id')
                .single();
            
            if (createError) throw createError;
            userId = newUser.id;
        }
        
        // Roster Assignment
        setStudentStatus("Syncing Roster...");
        const { error: rosterError } = await supabase
            .from('class_roster')
            .insert({
                class_id: targetClass.class_id,
                user_id: userId,
                role_in_class: 'student',
                section: targetClass.section || 'A'
            });
        
        if (rosterError) throw rosterError;
        
        showToast("Student Registered & Synchronized!");
        setShowAddStudentModal(false);
        fetchTeacherData();
    } catch (err: any) {
        console.error('Registration Error:', err.message);
        setStudentError(err.message ?? "Could not add student.");
    } finally {
        setStudentSaving(false);
        setStudentStatus(null);
    }
  }, [selectedClass, mockAuthUser?.school_id, fetchTeacherData]);


  const handleSaveProfile = useCallback(async (data: { name: string; email: string; phone: string; office: string }) => {
    setProfileError(null);
    if (!data.name.trim()) {
        setProfileError("Display name is required");
        return;
    }

    setProfileSaving(true);
    setProfileStatus("Updating Identity...");
    try {
        const { error } = await supabase
            .from('users')
            .update({
                name: data.name.trim(),
                email: data.email.trim(),
                phone: data.phone.trim(),
                office: data.office.trim()
            })
            .eq('id', teacherProfile.id);

        if (error) throw error;

        // GLOBAL SYNC: Refresh the auth context so changes reflect everywhere immediately
        await setSession(teacherProfile.id);

        showToast("Identity Updates Synchronized");
        setShowEditProfileModal(false);
        fetchTeacherData(); // Refresh local profile
    } catch (err: any) {
        setProfileError(err.message ?? "Could not save profile.");
    } finally {
        setProfileSaving(false);
        setProfileStatus(null);
    }
  }, [teacherProfile.id, setSession, fetchTeacherData]);


  const handleToggleLiveStream = useCallback(async (title: string, rosterId?: string, selectedCameraUrl?: string) => {
    const schoolId = mockAuthUser?.school_id || mockAuthUser?.schoolId;
    if (!schoolId) return;

    if (isLiveStreamActive && activeStreamId) {
        try {
            await endLiveStream(activeStreamId, schoolId);
            setIsLiveStreamActive(false);
            setActiveStreamId(null);
            showToast("Educational stream ended");
        } catch (err: any) {
            showToast("Error ending stream");
        }
    } else {
        if (!title) { showToast("Enter stream title"); return; }
        try {
            const selectedRoster = rosterId ? assignedSections.find(s => s.rosterId === rosterId) : null;
            
            const streamId = await startLiveStream({
                school_id: schoolId,
                created_by: mockAuthUser?.id || '',
                title: title,
                class_id: selectedRoster?.class_id,
                section: selectedRoster?.section,
                subject: selectedRoster?.subject || 'Classroom Instruction',
                stream_url: selectedCameraUrl || '',
                source: 'CAMERA'
            });

            if (streamId) {
                setActiveStreamId(streamId);
                setIsLiveStreamActive(true);
                showToast("Now Broadcasting LIVE");
            }
        } catch (err: any) {
            showToast("Failed to start stream");
        }
    }
  }, [mockAuthUser, isLiveStreamActive, activeStreamId, assignedSections, endLiveStream, startLiveStream]);


  const handleMessageStudentFromReport = useCallback((studentId: string, template?: string) => {
    if (!studentId) return;
    setSelectedChat(studentId);
    if (template) setPendingMessageTemplate(template);
    onNavigate?.('messages');
    setShowReports(false);
    showToast("Intervention template prepared...");
  }, [onNavigate]);


  const handleSendMessage = useCallback(async (
    type: 'text' | 'image' | 'document' = 'text', 
    url?: string, 
    name?: string, 
    customContent?: string,
    targetChatId?: string
  ) => {
      const chatToUse = targetChatId || selectedChat;
      if (!chatToUse) return;

      const finalContent = customContent || '';
      if (!finalContent.trim() && !url && !name) return;
      
      const schoolId = mockAuthUser?.school_id || mockAuthUser?.schoolId;
      const senderId = teacherProfile.id || mockAuthUser?.id;

      if (schoolId && senderId) {
          try {
              await sendChatMessage(schoolId, senderId, chatToUse, finalContent, type as any, url, name);
              // Success is handled by context Realtime listener
          } catch (err: any) {
              console.error('Teacher send error:', err.message);
              showToast(`Send failed: ${err.message}`);
          }
      } else {
          showToast('Identification error. Try role-switching again.');
      }
  }, [mockAuthUser, teacherProfile.id, selectedChat, sendChatMessage]);
  const handleDeleteMaterial = useCallback(async (id: string) => {
    const originalMaterials = [...teacherMaterials];
    // LayoutAnimation.configureNext removed
    setTeacherMaterials(prev => prev.filter(m => m.id !== id));
    try {
      const { error } = await supabase.from('materials').delete().eq('id', id);
      if (error) throw error;
      showToast("Material Removed");
    } catch (err) {
      setTeacherMaterials(originalMaterials);
      showToast("Delete Failed");
    }
  }, [teacherMaterials, showToast]);

  const handleNavigateToClass = useCallback((cls: any) => { 
    // Deep navigation: Pass full context including classId, section, and subject
    setSelectedClass(cls);
    if (cls && Object.keys(cls).length > 0) {
      setShowClassDetail(true);
    } else {
      setShowClassDetail(false);
    }
    onNavigate?.('classes'); 
  }, [onNavigate]);


  const transformedChatMessages = useMemo(() => (chatMessages || []).map((msg: any) => ({
      ...msg,
      senderId: msg.sender_id,
      receiverId: msg.receiver_id,
      message: msg.content,
      timestamp: msg.created_at 
          ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : 'Just now'
  })), [chatMessages]);


  return (
    <View className="flex-1 bg-gray-50">
      <>
        {activeTab === 'home' && (
              showAllMaterials ? (
                <TeacherMaterials 
                  materials={teacherMaterials}
                  isLoading={isLoading}
                  onDeleteMaterial={handleDeleteMaterial}
                  onShowUploadModal={() => setShowUploadModal(true)}
                  onBack={() => setShowAllMaterials(false)}
                />

              ) : showAllNotices ? (
                <AnnouncementsScreen 
                  announcements={announcements as any}
                  currentUser={teacherProfile}
                  onDeleteNotice={(id) => deleteAnnouncement(id, mockAuthUser?.school_id || '')}
                  onBack={() => setShowAllNotices(false)}
                />
              ) : showGrading ? (
                <TeacherGrading 
                  assignedSections={assignedSections}
                  onBack={() => { 
                    setShowGrading(false); 
                    setGradingInitialClass(null); 
                    setSelectedAssignmentForGrading(null);
                    fetchTeacherData(); // Refresh activity feed on return
                  }}
                  initialClass={gradingInitialClass}
                  initialAssignment={selectedAssignmentForGrading}
                  onAddAssignment={(cid) => {
                    setModalInitialClassId(cid || null);
                    setShowAssignmentModal(true);
                  }}
                  logSystemActivity={logSystemActivity as any}
                />
              ) : showReports ? (
                <TeacherReports 
                  assignedSections={assignedSections}
                  onBack={() => setShowReports(false)}
                  onShowToast={showToast}
                  initialClassId={gradingInitialClass?.class_id || gradingInitialClass?.id}
                  onMessageStudent={handleMessageStudentFromReport}
                />
              ) : (
                <TeacherHome 
                  currentUser={teacherProfile}
                  assignedSections={assignedSections}
                  teacherMaterials={teacherMaterials || []}
                  totalStudents={(classStudents || []).length}
                  pendingGradesCount={pendingGradesCount}
                  announcements={announcements || []}
                  onQuickAction={handleQuickAction}
                  onNavigateToClass={handleNavigateToClass}

                  onGradeAssignment={handleGradeAssignment}
                  onAddAssignment={() => {
                    setModalInitialClassId(null);
                    setShowAssignmentModal(true);
                  }}
                  assignments={assignments}
                  onShowHistory={() => setShowAnnouncementHistoryModal(true)}
                  onDeleteNotice={(id) => deleteAnnouncement(id, mockAuthUser?.school_id || '')}
                  onDeleteMaterial={async (id) => {
                    try {
                      await supabase.from('materials').delete().eq('id', id);
                      showToast("Material Removed");
                      fetchTeacherData();
                    } catch (err) {
                      showToast("Delete Failed");
                    }
                  }}
                  onStatPress={(target) => {
                    // Context-Aware KPI Routing
                    if (target === 'materials') {
                      setShowAllMaterials(true);
                    }
                    else if (target === 'notices') {
                      setShowAllNotices(true);
                    }
                    else if (target === 'assignments') {
                      // Pass current class context to Grading if available
                      setGradingInitialClass(selectedClass);
                      setShowGrading(true);
                    }
                    else if (target === 'classes') {
                        // If a class is already focused, keep it, otherwise show list
                        if (!selectedClass) setShowClassDetail(false);
                        onNavigate?.('classes');
                    }
                    else onNavigate?.(target);
                  }}
                  currentSchool={currentSchool}
                  systemLogs={teacherRecentActivity}
                  isLoading={isLoading}
                  refreshing={refreshing}
                  onRefresh={handleRefresh}
                />
              )
            )}
            {activeTab === 'classes' && (
              canAccessSection('classes') ? (
                showClassDetail && selectedClass ? (
                  <TeacherClassDetail 
                    selectedClass={selectedClass}
                    students={classStudents}
                    materials={teacherMaterials}
                    onBack={() => setShowClassDetail(false)}
                    schoolName={currentSchool?.name || 'Academy'}
                    onUploadMaterial={() => {
                        // Pre-fill target based on selected class
                        setModalInitialRosterId(selectedClass.rosterId || selectedClass.id);
                        setShowUploadModal(true);
                    }}
                    onAddStudent={() => setShowAddStudentModal(true)}
                    assignments={Array.from(new Map([...assignments, ...teacherAssignments].map(a => [a.id, a])).values())}
                    onGradeAssignment={handleGradeAssignment}
                    onAddAssignment={(cid) => {
                      setModalInitialClassId(cid || null);
                      setShowAssignmentModal(true);
                    }}
                    onRefresh={handleRefresh}
                    refreshing={refreshing}
                  />
                ) : (
                  <TeacherClasses 
                    assignedSections={assignedSections}
                    dbRoster={classStudents}
                    onNavigateToClass={(cls: any) => {
                      setSelectedClass(cls);
                      setShowClassDetail(true);
                    }}
                    onShowUploadModal={() => setShowUploadModal(true)}
                    isLoading={isLoading}
                    refreshing={refreshing}
                    onRefresh={handleRefresh}
                  />
                )
              ) : (
                <View className="flex-1 items-center justify-center p-6 bg-white rounded-3xl m-4 shadow-sm border border-gray-100">
                  <View className="w-16 h-16 bg-gray-50 rounded-2xl items-center justify-center mb-4">
                    <Icons.Lock size={32} color="#94a3b8" />
                  </View>
                  <Text className="text-lg font-bold text-gray-900">Classes Unavailable</Text>
                  <Text className="text-sm text-gray-500 text-center mt-2 max-w-[280px]">
                    Institutional context or permissions are not yet synchronized for your account.
                  </Text>
                  <TouchableOpacity 
                    onPress={() => onNavigate?.('messages')}
                    className="mt-6 px-6 py-3 bg-indigo-600 rounded-xl"
                  >
                    <Text className="text-white font-bold">Contact Support</Text>
                  </TouchableOpacity>
                </View>
              )
            )}
            {activeTab === 'videos' && (
              canAccessSection('videos') ? (
                <TeacherVideos 
                  videoList={dbVideos}
                  videoTab={videoTab}
                  setVideoTab={setVideoTab}
                  videoSearch={videoSearch}
                  setVideoSearch={setVideoSearch}
                  onShowVideoUploadModal={() => setShowVideoUploadModal(true)}
                  isLiveStreamActive={liveStreams.length > 0}
                  onVideoPress={(v) => {
                      setPlayingVideo(v);
                      setShowVideoPlayerModal(true);
                  }}
                  currentUser={teacherProfile}
                  teacherAssignedSections={assignedSections}
                />
              ) : (
                <View className="flex-1 items-center justify-center p-6 bg-white rounded-3xl m-4 shadow-sm border border-gray-100">
                  <View className="w-16 h-16 bg-gray-50 rounded-2xl items-center justify-center mb-4">
                    <Icons.Video size={32} color="#94a3b8" />
                  </View>
                  <Text className="text-lg font-bold text-gray-900">Videos Unavailable</Text>
                  <Text className="text-sm text-gray-500 text-center mt-2 max-w-[280px]">
                    Resource access requires an active school affiliation which is currently pending.
                  </Text>
                </View>
              )
            )}
            {activeTab === 'messages' && (
              canAccessSection('messages') ? (
                <TeacherMessages 
                    currentUser={teacherProfile}
                    displayContacts={displayContacts}
                    chatMessages={transformedChatMessages}
                    handleSendMessage={handleSendMessage}
                    selectedChat={selectedChat}
                    setSelectedChat={setSelectedChat}
                    markMessagesAsRead={markMessagesAsRead}
                    uploadMessageFile={uploadMessageFile}
                    fetchMoreMessages={fetchMoreMessages}
                    assignments={assignments}
                    initialMessage={pendingMessageTemplate}
                    onMessageInjected={() => setPendingMessageTemplate(null)}
                    currentSchoolId={mockAuthUser?.school_id || mockAuthUser?.schoolId}
                  />
              ) : (
                <View className="flex-1 items-center justify-center p-6 bg-white rounded-3xl m-4 shadow-sm border border-gray-100">
                  <View className="w-16 h-16 bg-gray-50 rounded-2xl items-center justify-center mb-4">
                    <Icons.Messages size={32} color="#94a3b8" />
                  </View>
                  <Text className="text-lg font-bold text-gray-900">Messaging Unavailable</Text>
                  <Text className="text-sm text-gray-500 text-center mt-2 max-w-[280px]">
                    Direct communication is disabled until school context is verified.
                  </Text>
                </View>
              )
            )}
            {activeTab === 'profile' && (
              <TeacherProfile currentUser={teacherProfile} onLogout={() => {}} onEdit={() => setShowEditProfileModal(true)} />
            )}
        </>

      {/* Modals */}
      <UploadMaterialModal 
        visible={showUploadModal} 
        onClose={handleCloseUploadModal}
        onUpload={handleUpload} 
        assignedSections={assignedSections} 
        isUploading={uploadSaving}
        error={uploadError}
        status={uploadStatus}
        initialRosterId={modalInitialRosterId}
      />

      <AnnouncementModal 
        visible={showAnnouncementModal} 
        onClose={() => setShowAnnouncementModal(false)}
        userRole={teacherProfile.role}
        assignedClasses={assignedSections}
        onSave={async (data) => { 
          setAnnouncementError(null);
          setAnnouncementSaving(true);
          try {
            const targetSchoolId = mockAuthUser?.school_id || mockAuthUser?.schoolId;

            await addAnnouncement({ 
              ...data, 
              school_id: targetSchoolId,
              sender_id: mockAuthUser?.id
            }); 

            // Log activity for Recent Activity feed
            await logSystemActivity(
                targetSchoolId, 
                `Notice Posted: ${data.title}`, 
                'Bell', 
                '#ea580c', 
                mockAuthUser?.id, 
                'SYSTEM'
            );

            showToast("Notice Posted!"); 
            setShowAnnouncementModal(false);
            fetchTeacherData();
          } catch (err: any) {
            setAnnouncementError(err.message ?? "Could not post notice.");
          } finally {
            setAnnouncementSaving(false);
          }
        }}
        error={announcementError}
        loading={announcementSaving}
      />

      <AnnouncementHistoryModal 
        visible={showAnnouncementHistoryModal}
        onClose={() => setShowAnnouncementHistoryModal(false)}
        announcements={announcements}
        currentUser={mockAuthUser}
        onDeleteNotice={(id) => deleteAnnouncement(id, mockAuthUser?.school_id || '')}
      />

      <UploadVideoModal 
        visible={showVideoUploadModal} 
        onClose={() => setShowVideoUploadModal(false)} 
        onUpload={async (data) => {
            try {
                setIsUploading(true);
                await uploadVideo({
                    ...data,
                    school_id: mockAuthUser?.school_id || '',
                    created_by: mockAuthUser?.id || ''
                });
                showToast("Lecture Shared!");
                setShowVideoUploadModal(false);
            } catch (err: any) {
                showToast("Upload failed: " + err.message);
            } finally {
                setIsUploading(false);
            }
        }} 
        assignedSections={assignedSections}
        isUploading={isUploading}
      />
      <EditProfileModal 
        visible={showEditProfileModal} 
        onClose={() => setShowEditProfileModal(false)} 
        initialName={teacherProfile.name}
        initialEmail={teacherProfile.email || ''}
        initialPhone={teacherProfile.phone || ''}
        initialOffice={teacherProfile.office || ''}
        onSave={handleSaveProfile} 
        error={profileError}
      />
      

      <AddStudentModal 
        visible={showAddStudentModal} 
        onClose={() => setShowAddStudentModal(false)} 
        onAdd={handleAddStudent} 
        error={studentError}
        loading={studentSaving}
        status={studentStatus}
      />
      {/* GoLiveModal removed for Platinum Consolidation */}
      
      <VideoPlayerModal 
        visible={showVideoPlayerModal}
        onClose={() => {
            setShowVideoPlayerModal(false);
            setPlayingVideo(null);
        }}
        video={playingVideo}
      />

      <CreateAssignmentModal 
        visible={showAssignmentModal}
        onClose={() => { setShowAssignmentModal(false); setModalInitialClassId(null); }}
        onCreate={handleCreateAssignment}
        assignedSections={assignedSections}
        initialClassId={modalInitialClassId || selectedClass?.id}
        isCreating={assignmentSaving}
      />
    </View>
  );
};