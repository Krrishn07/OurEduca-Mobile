import React, { useState, useRef, useCallback, useEffect } from 'react';
import { View, ActivityIndicator, Linking, Text, InteractionManager } from 'react-native';
import { UserRole, User, ChatMessage } from '@/types';
import { useSchoolData } from '@context/SchoolDataContext';
import { supabase } from '@lib/supabase';
import { useMockAuth } from '@context/MockAuthContext';
import { Icons } from '@components/common/Icons';
import { RestrictedAccessView } from '@components/common/RestrictedAccessView';

// Modular Screens
import { StudentHome } from '@screens/student/StudentHome';
import { StudentClasses } from '@screens/student/StudentClasses';
import { StudentVideos } from '@screens/student/StudentVideos';
import { StudentFees } from '@screens/student/StudentFees';
import { PaymentGatewayModal, VideoPlayerModal } from '@components/modals';
import { RazorpayCheckout } from '@components/payment/RazorpayCheckout';
import { StudentMessages } from '@screens/student/StudentMessages';
import { StudentProfile } from '@screens/student/StudentProfile';
import { StudentAssignments } from '@screens/student/StudentAssignments';
import { StudentReports } from '@screens/student/StudentReports';
import { StudentMaterials } from '@screens/student/StudentMaterials';
import { AnnouncementsScreen } from '@components/common';
import { QuickSubmitModal } from './modals/QuickSubmitModal';
import { Video as VideoType } from '@context/SchoolDataContext';

interface StudentDashboardProps {
  role: UserRole;
  activeTab: string;
  onNavigate: (tab: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ role, activeTab, onNavigate }) => {
  const { currentUser: mockAuthUser, currentSchool } = useMockAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [studentClasses, setStudentClasses] = useState<any[]>([]);
  const [studentMaterials, setStudentMaterials] = useState<any[]>([]);
  const [studentAssignments, setStudentAssignments] = useState<any[]>([]);

  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [attendanceRate, setAttendanceRate] = useState('0%');
  const [activeRazorpayOrder, setActiveRazorpayOrder] = useState<any>(null);
  const [studentSubmissions, setStudentSubmissions] = useState<any[]>([]);

  // Video Hub State
  const [videoTab, setVideoTab] = useState<'STREAM' | 'LIBRARY' | 'GALLERY'>('STREAM');
  const [videoSearch, setVideoSearch] = useState('');
  const [playingVideo, setPlayingVideo] = useState<VideoType | null>(null);
  const [showVideoPlayerModal, setShowVideoPlayerModal] = useState(false);
  const [showAllNotices, setShowAllNotices] = useState(false);
  const [materialFilter, setMaterialFilter] = useState('ALL');

  const handleTabNavigateWithFilter = (tab: string, filter?: string) => {
    if (filter) setMaterialFilter(filter);
    onNavigate(tab);
  };

  const { 
    announcements, fetchAnnouncements, fetchSchoolDetails, studentPaymentLink, chatMessages, sendChatMessage, fetchMessages,
    dbFees, fetchStudentFees, initiateFeePayment, paymentConfig,
    dbVideos, fetchVideos, uploadVideo, 
    liveStreams, fetchLiveStreams,
    assignments, fetchAssignments, submissions, fetchSubmissions, submitAssignment,
    dbGrades, fetchGrades,
    hasPermission, markMessagesAsRead, uploadMessageFile, fetchMoreMessages
  } = useSchoolData();
  
  // Messages State
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [msgInput, setMsgInput] = useState('');
  const [dbPrincipals, setDbPrincipals] = useState<User[]>([]);
  const [dbFaculty, setDbFaculty] = useState<User[]>([]);
  const [toast, setToast] = useState<{show: boolean, message: string}>({show: false, message: ''});
  const [isPayModalVisible, setIsPayModalVisible] = useState(false);
  const [feeForPayment, setFeeForPayment] = useState<any>(null);
  const [isQuickSubmitVisible, setIsQuickSubmitVisible] = useState(false);
  const [activeAssignmentId, setActiveAssignmentId] = useState<string | null>(null);

  // Derived user
  const currentUser = (mockAuthUser || {
      id: 'S-101',
      name: 'Student User',
      role: UserRole.STUDENT,
      grade: '10',
      section: 'A'
  }) as User;

  const handleTabNavigate = (tab: string) => {
    if (tab === 'quick_submit') {
      setActiveAssignmentId(null);
      setIsQuickSubmitVisible(true);
      return;
    }

    if (tab === 'quick_query') {
      const primaryClass = studentClasses[0];
      if (primaryClass?.teacher_id) {
        setSelectedChat(primaryClass.teacher_id);
        onNavigate('messages');
      } else {
        onNavigate('messages');
      }
      return;
    }

    if (tab === 'quick_pay') {
      const pendingFee = dbFees.find(f => f.status === 'PENDING' || f.status === 'OVERDUE');
      if (pendingFee) {
        setFeeForPayment(pendingFee);
        setIsPayModalVisible(true);
      } else {
        onNavigate('fees');
      }
      return;
    }

    onNavigate(tab);
  };

  const handleQuickCapture = (assignmentId: string) => {
    setActiveAssignmentId(assignmentId);
    setIsQuickSubmitVisible(true);
  };

  // --- Supabase: Fetch Student Data ---
  const fetchStudentData = useCallback(async () => {
    if (!mockAuthUser?.id) return;
    setIsLoading(true);
    try {
        const { data: rosterData, error: rosterError } = await supabase
            .from('class_roster')
            .select('id, class_id, section, grade_score, classes(name, subject, teacher_name, class_time, last_topic)')
            .eq('user_id', mockAuthUser.id)
            .eq('role_in_class', 'student');
        
        if (rosterError) throw rosterError;

        if (rosterData && (rosterData || []).length > 0) {
            const classIds = (rosterData || []).map(r => r.class_id);

            const { data: facultyData, error: facultyError } = await supabase
                .from('class_roster')
                .select('class_id, role_in_class, section, subject, users!inner(id, name, role, avatar)')
                .in('class_id', classIds)
                .in('role_in_class', ['teacher', 'mentor']);
            
            if (facultyError) throw facultyError;

            const { data: materials, error: materialsError } = await supabase
                .from('materials')
                .select('*, creator:users!created_by(name), classes(subject, teacher_name)')
                .in('class_id', classIds)
                .order('created_at', { ascending: false });
            
            if (materialsError) throw materialsError;
            
            await Promise.all([
              fetchAssignments(mockAuthUser.school_id || ''),
              fetchSubmissions(mockAuthUser.school_id || '', mockAuthUser.id),
              fetchGrades(mockAuthUser.id)
            ]);
            
            const filteredMaterials = (materials || [])
                .filter((m: any) => {
                    if (m.is_public) return true;
                    const enrollment = rosterData?.find(r => r.class_id === m.class_id);
                    if (!enrollment) return false;
                    return !m.section || m.section === enrollment.section;
                })
                .map((m: any) => ({
                    ...m,
                    subject: m.subject || m.classes?.subject || m.classes?.name || 'Academic Resource',
                    teacher_name: m.creator?.name || m.classes?.teacher_name || 'Academic Faculty'
                }));

            setStudentMaterials(filteredMaterials);

            const flattenedClasses: any[] = [];
            
            (rosterData || []).forEach((r: any) => {
                const studentSection = (r.section || 'A').toString().toUpperCase().trim();
                const classFaculty = (facultyData || []).filter(f => {
                    const facultySection = (f.section || '').toString().toUpperCase().trim();
                    return f.class_id === r.class_id && (facultySection === studentSection || facultySection === '' || facultySection === 'ALL');
                });

                if (classFaculty.length > 0) {
                    classFaculty.forEach(f => {
                        const u = Array.isArray(f.users) ? f.users[0] : f.users;
                        if (f.role_in_class === 'mentor' && !f.subject) return;

                        flattenedClasses.push({
                            ...r,
                            ...r.classes,
                            name: r.classes?.name || 'Class',
                            section: r.section,
                            subject: f.subject || r.classes?.subject || 'Academic Session',
                            teacher_name: u?.name || 'Assigned Faculty',
                            teacher_avatar: u?.avatar,
                            teacher_id: u?.id,
                            class_time: r.classes?.class_time || '9:00 AM - 10:30 AM',
                            rosterId: r.id,
                            facultyRosterId: f.id,
                            facultyRole: f.role_in_class
                        });
                    });
                } else {
                    flattenedClasses.push({
                        ...r,
                        ...r.classes,
                        name: r.classes?.name || 'Class',
                        section: r.section,
                        subject: r.classes?.subject || 'Academic Session',
                        teacher_name: r.classes?.teacher_name || 'Assigned Faculty',
                        class_time: r.classes?.class_time || '9:00 AM - 10:30 AM',
                        rosterId: r.id
                    });
                }
            });
            const uniqueClasses = Array.from(new Map(flattenedClasses.map(c => [`${c.class_id}_${c.subject}_${c.teacher_id}`, c])).values());
            setStudentClasses(uniqueClasses);

            const { data: principalData } = await supabase
                .from('users')
                .select('id, name, role, avatar')
                .eq('school_id', mockAuthUser.school_id)
                .eq('role', 'super_admin');

            if (principalData) {
                setDbPrincipals(principalData as User[]);
            }

            const facultyUsers: User[] = (facultyData || [])
                .filter((f: any) => {
                    return flattenedClasses.some(c => c.class_id === f.class_id && c.section === f.section);
                })
                .map((f: any) => {
                    const u = Array.isArray(f.users) ? f.users[0] : f.users;
                    return u as User;
                })
                .filter(u => u && u.id);
            setDbFaculty(facultyUsers);
            
            const { data: attData, error: attError } = await supabase
                .from('attendance')
                .select('status')
                .eq('student_id', mockAuthUser.id);
            
            if (!attError && attData && attData.length > 0) {
                const total = attData.length;
                const present = attData.filter((r: any) => (r.status || '').toUpperCase() === 'PRESENT').length;
                const rate = Math.round((present / total) * 100);
                setAttendanceRate(`${rate}%`);
            } else {
                setAttendanceRate('0%');
            }
        }
    } catch (err: any) {
        console.error('fetchStudentData error:', err.message);
    } finally {
        setIsLoading(false);
    }
  }, [mockAuthUser?.id, fetchAssignments, fetchSubmissions, fetchGrades]);

  useEffect(() => {
    if (mockAuthUser?.id) {
        fetchStudentFees(mockAuthUser.id);
    }
  }, [mockAuthUser?.id, fetchStudentFees]);

  const displayContacts = React.useMemo(() => {
    const uniqueContactsMap = new Map();
    dbPrincipals.forEach(u => {
        if (u.id !== mockAuthUser?.id) uniqueContactsMap.set(u.id, u);
    });
    dbFaculty.forEach(u => {
        if (u.id !== mockAuthUser?.id) uniqueContactsMap.set(u.id, u);
    });
    (chatMessages || []).forEach((msg: any) => {
        if (msg.sender_id === mockAuthUser?.id) uniqueContactsMap.set(msg.receiver_id, { id: msg.receiver_id, name: 'User' });
        if (msg.receiver_id === mockAuthUser?.id) uniqueContactsMap.set(msg.sender_id, { id: msg.sender_id, name: 'User' });
    });
    return Array.from(uniqueContactsMap.values()) as User[];
  }, [dbPrincipals, dbFaculty, chatMessages, mockAuthUser?.id]);

  const showToast = (msg: string) => {
    setToast({ show: true, message: msg });
    setTimeout(() => setToast({ show: false, message: '' }), 3000);
  };

  useEffect(() => {
    const hydrate = async () => {
        fetchStudentData();
        if (mockAuthUser?.school_id) {
            fetchSchoolDetails(mockAuthUser.school_id);
            fetchAnnouncements(mockAuthUser.school_id, ['ALL', 'STUDENT']);
            fetchMessages(mockAuthUser.school_id, true);
            fetchVideos(mockAuthUser.school_id);
            fetchLiveStreams(mockAuthUser.school_id);
        }
    };
    hydrate();
  }, [fetchStudentData, fetchAnnouncements, fetchSchoolDetails, fetchMessages, fetchVideos, fetchLiveStreams, mockAuthUser?.school_id]);

  const handlePayNow = async (feeId: string) => {
    const fee = dbFees.find(f => f.id === feeId);
    if (fee) {
        setFeeForPayment(fee);
        setIsPayModalVisible(true);
    }
  };


  const handleConfirmPayment = async (method: string) => {
    if (!mockAuthUser?.id || !feeForPayment) return;
    setIsPaymentProcessing(true);
    try {
        const schoolId = mockAuthUser.school_id || mockAuthUser.schoolId || '';
        const orderData = await initiateFeePayment(feeForPayment.id, mockAuthUser.id, feeForPayment.amount, schoolId);
        setIsPaymentProcessing(false);
        setIsPayModalVisible(false);
        if (orderData && orderData.id) {
            setActiveRazorpayOrder({
                ...orderData,
                name: mockAuthUser.name,
                email: mockAuthUser.email,
                contact: mockAuthUser.phone || ''
            });
        }
    } catch (err: any) {
        setIsPaymentProcessing(false);
        showToast("Payment failed: " + err.message);
    }
  };

  const handleRazorpaySuccess = async (paymentId: string, orderId: string, signature: string) => {
    setActiveRazorpayOrder(null);
    setShowPaymentSuccess(true);
    setTimeout(() => setShowPaymentSuccess(false), 5000);
    if (mockAuthUser?.id) fetchStudentFees(mockAuthUser.id);
    showToast("Payment Successful!");
  };

  const handleLinkPress = (url: string) => {
    Linking.openURL(url).catch(err => console.error("Couldn't load page", err));
  };

  const handleSendMessage = async (type: 'text'|'image'|'document' = 'text', url?: string, name?: string, content?: string, targetId?: string) => {
    const finalChat = targetId || selectedChat;
    if (!finalChat) return;
    const finalContent = content || msgInput.trim();
    if (type === 'text' && !finalContent) return;
    const schoolId = mockAuthUser?.school_id || mockAuthUser?.schoolId;
    const senderId = currentUser.id || mockAuthUser?.id;
    if (schoolId && senderId) {
        try {
            await sendChatMessage(schoolId, senderId, finalChat, finalContent, type, url, name);
            if (!content) setMsgInput('');
        } catch (err: any) {
            showToast(`Send failed: ${err.message}`);
        }
    }
  };

  const transformedChatMessages: any[] = (chatMessages || []).map(msg => ({
    ...msg,
    senderId: msg.sender_id,
    receiverId: msg.receiver_id,
    message: msg.content,
    timestamp: msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'
  }));

  return (
      <View className="flex-1 bg-gray-50 p-2">
         {isLoading ? (
             <View className="flex-1 items-center justify-center">
                 <ActivityIndicator size="large" color="#4f46e5" />
             </View>
         ) : (
             <>
                {activeTab === 'home' && (
                  showAllNotices ? (
                    <AnnouncementsScreen 
                      announcements={announcements}
                      currentUser={currentUser}
                      onBack={() => setShowAllNotices(false)}
                    />
                  ) : (
                    <StudentHome 
                      currentUser={currentUser}
                      studentMaterials={studentMaterials}
                      studentAssignments={assignments.filter(a => studentClasses.some(c => c.class_id === a.class_id))}
                      studentPrimaryClass={studentClasses[0] || null}
                      allStudentClasses={studentClasses}
                      announcements={announcements}
                      onNavigate={handleTabNavigate}
                      onQuickCapture={handleQuickCapture}
                      onShowHistory={() => setShowAllNotices(true)}
                      currentSchool={currentSchool}
                      attendanceRate={attendanceRate}
                      studentSubmissions={submissions}
                    />
                  )
                )}
                {activeTab === 'classes' && (
                  hasPermission('classes', role, currentSchool?.id) ? (
                    <StudentClasses 
                      studentPrimaryClass={studentClasses[0] || null} 
                      allStudentClasses={studentClasses}
                      studentMaterials={studentMaterials}
                      studentAssignments={assignments}
                      onNavigate={onNavigate}
                      onAction={handleTabNavigate}
                      onFilterNavigate={handleTabNavigateWithFilter}
                    />
                  ) : (
                    <RestrictedAccessView featureName="Class Access" onContactAdmin={() => onNavigate('messages')} role={role} />
                  )
                )}
                {activeTab === 'fees' && (
                  hasPermission('fees', role, currentSchool?.id) ? (
                    <StudentFees 
                       fees={(dbFees || []).map(f => ({
                           ...f,
                           due: f.due_date ? new Date(f.due_date).toLocaleDateString() : 'N/A',
                           status: f.status === 'PAID' ? 'Paid' : (f.status === 'PENDING_VERIFICATION' ? 'Processing' : 'Pending')
                       }))} 
                       studentName={mockAuthUser?.name || 'Student'}
                       studentPaymentLink={studentPaymentLink}
                       isPaymentProcessing={isPaymentProcessing}
                       showPaymentSuccess={showPaymentSuccess}
                       handlePayNow={handlePayNow}
                       handleLinkPress={handleLinkPress}
                     />
                  ) : (
                    <RestrictedAccessView featureName="Fee Access" onContactAdmin={() => onNavigate('messages')} role={role} />
                  )
                )}
                {activeTab === 'materials' && (
                  <StudentMaterials 
                    materials={studentMaterials}
                    isLoading={isLoading}
                    onBack={() => onNavigate('home')}
                    initialSubject={materialFilter}
                  />
                )}
                {activeTab === 'videos' && (
                  hasPermission('videos', role, currentSchool?.id) ? (
                    <StudentVideos
                      studentMaterials={(dbVideos || []).filter(v => {
                          if (v.is_public) return true;
                          const enrollment = studentClasses.find(c => c.class_id === v.class_id);
                          if (!enrollment) return false;
                          return !v.section || v.section === enrollment.section;
                      })}
                      onVideoPress={(v) => {
                          setPlayingVideo(v);
                          setShowVideoPlayerModal(true);
                      }}
                      isLiveStreamActive={(liveStreams || []).length > 0}
                      liveStreams={liveStreams || []}
                      studentClasses={studentClasses}
                      videoTab={videoTab}
                      setVideoTab={setVideoTab}
                      videoSearch={videoSearch}
                      setVideoSearch={setVideoSearch}
                    />
                  ) : (
                    <RestrictedAccessView featureName="Resource Access" onContactAdmin={() => onNavigate('messages')} role={role} />
                  )
                )}
                {activeTab === 'messages' && (
                  <StudentMessages 
                    currentUser={currentUser}
                    displayContacts={displayContacts}
                    chatMessages={transformedChatMessages}
                    handleSendMessage={handleSendMessage}
                    selectedChat={selectedChat}
                    setSelectedChat={setSelectedChat}
                    markMessagesAsRead={markMessagesAsRead}
                    uploadMessageFile={uploadMessageFile}
                    fetchMoreMessages={fetchMoreMessages}
                    currentSchoolId={currentSchool?.id}
                    msgInput={msgInput}
                    setMsgInput={setMsgInput}
                  />
                )}
                {activeTab === 'assignments' && (
                  hasPermission('assignments', role, currentSchool?.id) ? (
                    <StudentAssignments 
                      assignments={assignments.filter(a => studentClasses.some(c => c.class_id === a.class_id))}
                      submissions={submissions}
                      uploadFile={uploadMessageFile}
                      onSubmit={async (sub) => {
                        if (mockAuthUser?.id) {
                          await submitAssignment({
                            ...sub,
                            student_id: mockAuthUser.id,
                            school_id: mockAuthUser.school_id || ''
                          });
                          fetchSubmissions(mockAuthUser.school_id || '', mockAuthUser.id);
                        }
                      }}
                      isLoading={isLoading}
                    />
                  ) : (
                    <RestrictedAccessView featureName="Task Hub" onContactAdmin={() => onNavigate('messages')} role={role} />
                  )
                )}
                {activeTab === 'reports' && (
                  <StudentReports grades={dbGrades} isLoading={isLoading} />
                )}
                {activeTab === 'profile' && (
                  <StudentProfile currentUser={currentUser} onShowEditProfileModal={() => {}} onLogout={() => {}} />
                )}
             </>
         )}

         <VideoPlayerModal 
            visible={showVideoPlayerModal}
            onClose={() => { setShowVideoPlayerModal(false); setPlayingVideo(null); }}
            video={playingVideo}
         />

         <PaymentGatewayModal 
            visible={isPayModalVisible}
            onClose={() => setIsPayModalVisible(false)}
            onConfirm={handleConfirmPayment}
            amount={feeForPayment?.amount || 0}
            feeTitle={feeForPayment?.title || 'Fee Payment'}
            paymentConfig={paymentConfig}
         />

         {activeRazorpayOrder && (
             <RazorpayCheckout 
               order={activeRazorpayOrder}
               onSuccess={handleRazorpaySuccess}
               onFailure={() => setActiveRazorpayOrder(null)}
               onClose={() => setActiveRazorpayOrder(null)}
             />
         )}

          <QuickSubmitModal 
             visible={isQuickSubmitVisible}
             onClose={() => { setIsQuickSubmitVisible(false); setActiveAssignmentId(null); }}
             assignments={assignments.filter(a => studentClasses.some(c => c.class_id === a.class_id))}
             submissions={submissions}
             initialAssignmentId={activeAssignmentId}
             uploadFile={uploadMessageFile}
             onSubmit={async (sub) => {
               if (mockAuthUser?.id) {
                 await submitAssignment({
                   ...sub,
                   student_id: mockAuthUser.id,
                   school_id: mockAuthUser.school_id || ''
                 });
                 fetchSubmissions(mockAuthUser.school_id || '', mockAuthUser.id);
               }
             }}
           />
      </View>
  );
};
