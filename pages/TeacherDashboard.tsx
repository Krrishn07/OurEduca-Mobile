import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { Icons } from '../components/Icons';
import { useSchoolData } from '../contexts/SchoolDataContext';
import { supabase } from '../lib/supabase';
import { useMockAuth } from '../contexts/MockAuthContext';
import { UserRole, User, ChatMessage } from '../types';
import { RestrictedAccessView } from '../components/RestrictedAccessView';

// Modular Screens
import { TeacherHome } from '../src/features/teacher/screens/TeacherHome';
import { TeacherClasses } from '../src/features/teacher/screens/TeacherClasses';
import { TeacherVideos } from '../src/features/teacher/screens/TeacherVideos';
import { TeacherMessages } from '../src/features/teacher/screens/TeacherMessages';
import { TeacherProfile } from '../src/features/teacher/screens/TeacherProfile';
import { TeacherMaterials } from '../src/features/teacher/screens/TeacherMaterials';

// Modular Modals
import { UploadMaterialModal } from '../src/features/teacher/modals/UploadMaterialModal';
import { UploadVideoModal } from '../src/features/headmaster/modals/UploadVideoModal';
import { VideoPlayerModal } from '../src/features/headmaster/modals/VideoPlayerModal';
import { Video as VideoType } from '../contexts/SchoolDataContext';
import { AnnouncementModal } from '../src/features/teacher/modals/AnnouncementModal';
import { AnnouncementHistoryModal } from '../src/features/teacher/modals/AnnouncementHistoryModal';
// GoLiveModal removed - implementation consolidated in TeacherVideos
import { AddStudentModal } from '../src/features/teacher/modals/AddStudentModal';
import { EditProfileModal } from '../src/features/teacher/modals/EditProfileModal';
import { GradeQuizModal } from '../src/features/teacher/modals/GradeQuizModal';
import { ReportModal } from '../src/features/teacher/modals/ReportModal';

interface TeacherDashboardProps {
  activeTab: string;
  onNavigate?: (tab: string) => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ activeTab, onNavigate }) => {
  // --- Modals State ---
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [showAnnouncementHistoryModal, setShowAnnouncementHistoryModal] = useState(false);
  const [showGradeQuizModal, setShowGradeQuizModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showVideoUploadModal, setShowVideoUploadModal] = useState(false);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  
  // Videos State
  const [videoTab, setVideoTab] = useState<'PUBLIC' | 'PRIVATE' | 'MY_CONTENT'>('MY_CONTENT');
  const [videoSearch, setVideoSearch] = useState('');
  // GoLive state moved into TeacherVideos Hub
  
  
  const [selectedClass, setSelectedClass] = useState<any | null>(null);
  const [playingVideo, setPlayingVideo] = useState<VideoType | null>(null);
  const [showVideoPlayerModal, setShowVideoPlayerModal] = useState(false);
  const [activeStreamId, setActiveStreamId] = useState<string | null>(null);
  const [isLiveStreamActive, setIsLiveStreamActive] = useState(false);
  const [toast, setToast] = useState<{show: boolean, message: string}>({show: false, message: ''});
  
  // --- Context & Supabase ---
  const { currentUser: mockAuthUser, currentSchool } = useMockAuth();
  const { 
    announcements, meetings, addAnnouncement, fetchAnnouncements, deleteAnnouncement, 
    chatMessages, sendChatMessage, fetchMessages,
    dbVideos, fetchVideos, uploadVideo, deleteVideo,
    liveStreams, fetchLiveStreams, startLiveStream, endLiveStream,
    dbCameraNodes, fetchCameraNodes,
    hasPermission
  } = useSchoolData();

  // Teacher Profile
  const teacherProfile = mockAuthUser ? {
      ...mockAuthUser,
      office: mockAuthUser.office || 'Staff Room 2',
      phone: mockAuthUser.phone || '+1 555-0199',
  } as User : { id: 'T-0', name: 'Loading...', role: UserRole.TEACHER } as User;
  
  // Form States
  const [uploadRosterId, setUploadRosterId] = useState<string | null>(null);
  const [uploadClassId, setUploadClassId] = useState('');
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadType, setUploadType] = useState<'PDF' | 'LINK'>('PDF');
  const [uploadUrl, setUploadUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<any>(null);

  const [editProfileName, setEditProfileName] = useState(teacherProfile.name);
  const [editProfilePhone, setEditProfilePhone] = useState(teacherProfile.phone || '');
  const [editProfileOffice, setEditProfileOffice] = useState(teacherProfile.office || '');

  // Message State
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [msgInput, setMsgInput] = useState('');
  // displayContacts is memoized below. chatMessages is from context.
  
  // --- Supabase State ---
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [teacherMaterials, setTeacherMaterials] = useState<any[]>([]);
  const [assignedSections, setAssignedSections] = useState<any[]>([]);
  const [classStudents, setClassStudents] = useState<any[]>([]); // Resolved Students Roster
  const [dbPrincipals, setDbPrincipals] = useState<User[]>([]);

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
          // 1. Fetch Teacher's Class Assignments
          const { data: rosterData, error: rosterError } = await supabase
              .from('class_roster')
              .select('id, class_id, section, subject, classes(name, subject, room_no)')
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
              room_no: r.classes?.room_no || 'Room 302',
              rosterId: r.id
          }));
          setAssignedSections(flattenedSections);
          
          if (rosterData && (rosterData || []).length > 0) {
              const classIds = (rosterData || []).map(r => r.class_id);

              // 2. Fetch Materials & Student Counts (Concurrent)
              const materialsPromise = supabase
                  .from('materials')
                  .select('*')
                  .in('class_id', classIds)
                  .order('created_at', { ascending: false });

              const studentCountPromise = supabase
                  .from('class_roster')
                  .select('class_id, section')
                  .in('class_id', classIds)
                  .eq('role_in_class', 'student');

              const studentsListPromise = supabase
                  .from('class_roster')
                  .select('class_id, section, users!inner(id, name, role, avatar)')
                  .in('class_id', classIds)
                  .eq('role_in_class', 'student');

              const [matRes, countRes, listRes] = await Promise.all([
                  materialsPromise, studentCountPromise, studentsListPromise
              ]);
              
              setTeacherMaterials(matRes.data || []);

              // Store resolved student list for Roster View
              // ARMOR: Strictly filter students to match the teacher's specific (Class ID, Section) pairs
              const resolvedStudents = (listRes.data || []).filter((s: any) => {
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
    if (assignedSections.length > 0 && (!uploadRosterId || !uploadClassId)) {
        const firstSection = assignedSections[0];
        setUploadRosterId(firstSection.id || firstSection.rosterId);
        setUploadClassId(firstSection.class_id);
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

  useEffect(() => {
      fetchTeacherData();
      if (mockAuthUser?.school_id) {
        fetchAnnouncements(mockAuthUser.school_id);
        fetchMessages(mockAuthUser.school_id, true);
        fetchVideos(mockAuthUser.school_id);
        fetchCameraNodes(mockAuthUser.school_id);
      }
  }, [fetchTeacherData, fetchAnnouncements, fetchMessages, fetchVideos, fetchCameraNodes, mockAuthUser?.school_id]);

  const showToast = (msg: string) => {
      setToast({ show: true, message: msg });
      setTimeout(() => setToast({ show: false, message: '' }), 3000);
  };

  const handleQuickAction = (action: string) => {
      if (action === 'Upload Material') setShowUploadModal(true);
      else if (action === 'Post Announcement') setShowAnnouncementModal(true);
      else if (action === 'Grade Quiz') setShowGradeQuizModal(true);
      else if (action === 'View Report') setShowReportModal(true);
  };

  const handleUpload = async () => {
    const selectedRoster = (assignedSections || []).find(s => (s.id || s.rosterId) === uploadRosterId);
    const targetClassId = selectedRoster?.class_id || uploadClassId;
    const targetSection = selectedRoster?.section;

    if (!uploadTitle || !targetClassId || !mockAuthUser?.id) { showToast("Missing info"); return; }
    setIsUploading(true);
    try {
        let finalUrl = uploadUrl;
        if (uploadType === 'LINK' && uploadUrl && !uploadUrl.startsWith('http')) {
            finalUrl = `https://${uploadUrl}`;
        }

        // --- Step 1: Handle File Upload if PDF ---
        if (uploadType === 'PDF' && selectedFile) {
            const fileExt = selectedFile.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `materials/${mockAuthUser.id}/${fileName}`;

            // React Native File Upload
            const formData = new FormData();
            formData.append('file', {
                uri: selectedFile.uri,
                name: selectedFile.name,
                type: 'application/pdf'
            } as any);

            const { error: uploadError } = await supabase.storage
                .from('videos') // Using existing public bucket
                .upload(filePath, formData);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('videos')
                .getPublicUrl(filePath);
            
            finalUrl = publicUrl;
        }

        // --- Step 2: Insert Database Record ---
        const { error } = await supabase.from('materials').insert({
            title: uploadTitle, 
            class_id: targetClassId, 
            school_id: mockAuthUser.school_id,
            section: targetSection,
            subject: selectedRoster?.subject || 'Lecture', 
            type: uploadType,
            url: finalUrl, 
            created_by: mockAuthUser.id
        });

        if (error) throw error;
        
        showToast("Material Synchronized!");
        setShowUploadModal(false);
        setUploadTitle('');
        setUploadUrl('');
        setSelectedFile(null);
        fetchTeacherData();
    } catch (err: any) {
        console.error('Upload Error:', err.message);
        showToast(`Sync Failed: ${err.message}`);
    } finally { 
        setIsUploading(false); 
    }
  };

  const handleToggleLiveStream = async (title: string, rosterId?: string, selectedCameraUrl?: string) => {
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
                stream_url: selectedCameraUrl || ''
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
  };

  const handleSendMessage = async () => {
      if (!msgInput.trim() || !selectedChat) return;
      
      const schoolId = mockAuthUser?.school_id || mockAuthUser?.schoolId;
      const senderId = teacherProfile.id || mockAuthUser?.id;

      if (schoolId && senderId) {
          try {
              await sendChatMessage(schoolId, senderId, selectedChat, msgInput);
              setMsgInput('');
              // Success is handled by context Realtime listener
          } catch (err: any) {
              console.error('Teacher send error:', err.message);
              showToast(`Send failed: ${err.message}`);
          }
      } else {
          showToast('Identification error. Try role-switching again.');
      }
  };

  const transformedChatMessages: any[] = (chatMessages || []).map(msg => ({
      ...msg,
      senderId: msg.sender_id,
      receiverId: msg.receiver_id,
      message: msg.content,
      timestamp: msg.created_at 
          ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : 'Just now'
  }));

  return (
    <View className="flex-1 bg-gray-50">
      {isLoading ? (
          <View className="flex-1 items-center justify-center"><ActivityIndicator size="large" color="#4f46e5" /></View>
      ) : (
          <>
            {activeTab === 'home' && (
              <TeacherHome 
                currentUser={teacherProfile}
                assignedSections={assignedSections}
                teacherMaterials={teacherMaterials || []}
                totalStudents={(classStudents || []).length}
                dbRoster={classStudents || []}
                announcements={announcements || []}
                meetings={meetings || []}
                onQuickAction={handleQuickAction}
                onNavigateToClass={(cls) => { onNavigate?.('classes'); }}
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
                currentSchool={currentSchool}
              />
            )}
            {activeTab === 'classes' && (
              hasPermission('classes', teacherProfile.role, currentSchool?.id) ? (
                <TeacherClasses 
                  assignedSections={assignedSections}
                  dbRoster={classStudents}
                  onNavigateToClass={(cls) => setSelectedClass(cls)}
                  onShowUploadModal={() => setShowUploadModal(true)}
                />
              ) : (
                <RestrictedAccessView 
                    featureName="Classroom Access" 
                    onContactAdmin={() => onNavigate?.('messages')}
                    role={teacherProfile.role}
                />
              )
            )}
            {activeTab === 'materials' && (
              <TeacherMaterials 
                materials={teacherMaterials}
                onDeleteMaterial={async (id) => {
                  try {
                    await supabase.from('materials').delete().eq('id', id);
                    showToast("Material Removed");
                    fetchTeacherData();
                  } catch (err) {
                    showToast("Delete Failed");
                  }
                }}
                onShowUploadModal={() => setShowUploadModal(true)}
              />
            )}
            {activeTab === 'videos' && (
              hasPermission('videos', teacherProfile.role, currentSchool?.id) ? (
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
                <RestrictedAccessView 
                    featureName="Resource Access" 
                    onContactAdmin={() => onNavigate?.('messages')}
                    role={teacherProfile.role}
                />
              )
            )}
            {activeTab === 'messages' && (
              hasPermission('messages', teacherProfile.role, currentSchool?.id) ? (
                <TeacherMessages 
                  selectedChat={selectedChat} setSelectedChat={setSelectedChat}
                  msgInput={msgInput} setMsgInput={setMsgInput}
                  displayContacts={displayContacts} chatMessages={transformedChatMessages}
                  currentUser={teacherProfile} handleSendMessage={handleSendMessage}
                />
              ) : (
                <RestrictedAccessView 
                    featureName="Messaging Access" 
                    onContactAdmin={() => console.log('Support requested')}
                    role={teacherProfile.role}
                />
              )
            )}
            {activeTab === 'profile' && (
              <TeacherProfile currentUser={teacherProfile} onLogout={() => {}} onEdit={() => setShowEditProfileModal(true)} />
            )}
          </>
      )}

      {/* Modals */}
      <UploadMaterialModal 
        visible={showUploadModal} onClose={() => setShowUploadModal(false)}
        onUpload={handleUpload} uploadTitle={uploadTitle} setUploadTitle={setUploadTitle}
        uploadRosterId={uploadRosterId} setUploadRosterId={setUploadRosterId}
        assignedSections={assignedSections} isUploading={isUploading}
        uploadType={uploadType} setUploadType={setUploadType}
        uploadUrl={uploadUrl} setUploadUrl={setUploadUrl}
        selectedFile={selectedFile} setSelectedFile={setSelectedFile}
      />

      <AnnouncementModal 
        visible={showAnnouncementModal} 
        onClose={() => setShowAnnouncementModal(false)}
        userRole={teacherProfile.role}
        assignedClasses={assignedSections}
        onSave={(data) => { 
          addAnnouncement({ 
            ...data, 
            school_id: mockAuthUser?.school_id,
            sender_id: mockAuthUser?.id
          }); 
          showToast("Notice Posted!"); 
        }}
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
      <EditProfileModal visible={showEditProfileModal} onClose={() => setShowEditProfileModal(false)} name={editProfileName} setName={setEditProfileName} phone={editProfilePhone} setPhone={setEditProfilePhone} office={editProfileOffice} setOffice={setEditProfileOffice} onSave={() => { setShowEditProfileModal(false); showToast("Saved!"); }} />
      <AddStudentModal visible={showAddStudentModal} onClose={() => setShowAddStudentModal(false)} studentName="" setStudentName={() => {}} studentEmail="" setStudentEmail={() => {}} onAdd={() => {}} />
      {/* GoLiveModal removed for Platinum Consolidation */}
      <GradeQuizModal 
        visible={showGradeQuizModal} 
        onClose={() => setShowGradeQuizModal(false)} 
        onShowToast={showToast}
        assignedSections={assignedSections}
        dbRoster={classStudents}
      />
      <ReportModal 
        visible={showReportModal} 
        onClose={() => setShowReportModal(false)} 
        onShowToast={showToast}
        assignedSections={assignedSections}
        dbRoster={classStudents}
      />
      
      <VideoPlayerModal 
        visible={showVideoPlayerModal}
        onClose={() => {
            setShowVideoPlayerModal(false);
            setPlayingVideo(null);
        }}
        video={playingVideo}
      />
    </View>
  );
};