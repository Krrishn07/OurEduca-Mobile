import React, { useState, useRef, useCallback, useEffect } from 'react';
import { View, ActivityIndicator, Linking, Text } from 'react-native';
import { UserRole, User, ChatMessage } from '../types';
import { useSchoolData } from '../contexts/SchoolDataContext';
import { supabase } from '../lib/supabase';
import { useMockAuth } from '../contexts/MockAuthContext';
import { Icons } from '../components/Icons';
import { RestrictedAccessView } from '../components/RestrictedAccessView';

// Modular Screens
import { StudentHome } from '../src/features/student/screens/StudentHome';
import { StudentClasses } from '../src/features/student/screens/StudentClasses';
import { StudentVideos } from '../src/features/student/screens/StudentVideos';
import { StudentFees } from '../src/features/student/screens/StudentFees';
import { PaymentGatewayModal } from '../src/features/student/modals/PaymentGatewayModal';
import { RazorpayCheckout } from '../src/features/student/components/RazorpayCheckout';
import { StudentMessages } from '../src/features/student/screens/StudentMessages';
import { StudentProfile } from '../src/features/student/screens/StudentProfile';
import { AnnouncementHistoryModal } from '../src/features/teacher/modals/AnnouncementHistoryModal';
import { VideoPlayerModal } from '../src/features/headmaster/modals/VideoPlayerModal';
import { Video as VideoType } from '../contexts/SchoolDataContext';

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

  // Video Hub State
  const [videoTab, setVideoTab] = useState<'STREAM' | 'LIBRARY' | 'GALLERY'>('STREAM');
  const [videoSearch, setVideoSearch] = useState('');
  const [playingVideo, setPlayingVideo] = useState<VideoType | null>(null);
  const [showVideoPlayerModal, setShowVideoPlayerModal] = useState(false);

  const { 
    announcements, fetchAnnouncements, fetchSchoolDetails, studentPaymentLink, chatMessages, sendChatMessage, fetchMessages,
    dbFees, fetchStudentFees, initiateFeePayment, paymentConfig,
    dbVideos, fetchVideos, uploadVideo, 
    liveStreams, fetchLiveStreams,
    hasPermission
  } = useSchoolData();
  
  // Messages State
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [msgInput, setMsgInput] = useState('');
  const [dbPrincipals, setDbPrincipals] = useState<User[]>([]);
  const [dbFaculty, setDbFaculty] = useState<User[]>([]);
  const [toast, setToast] = useState<{show: boolean, message: string}>({show: false, message: ''});
  const [isPayModalVisible, setIsPayModalVisible] = useState(false);
  const [feeForPayment, setFeeForPayment] = useState<any>(null);

  // Derived user
  const currentUser = (mockAuthUser || {
      id: 'S-101',
      name: 'Student User',
      role: UserRole.STUDENT,
      grade: '10',
      section: 'A'
  }) as User;

  // --- Supabase: Fetch Student Data ---
  const fetchStudentData = useCallback(async () => {
    if (!mockAuthUser?.id) return;
    setIsLoading(true);
    try {
        // 1. Fetch Student's Class Assignments
        const { data: rosterData, error: rosterError } = await supabase
            .from('class_roster')
            // GLOBAL SYNC FIX: Explicitly request 'section' metadata for precise privacy gating
            .select('id, class_id, section, grade_score, classes(name, subject, teacher_name, class_time, last_topic)')
            .eq('user_id', mockAuthUser.id)
            .eq('role_in_class', 'student');
        
        if (rosterError) throw rosterError;

        if (rosterData && (rosterData || []).length > 0) {
            const classIds = (rosterData || []).map(r => r.class_id);

            // 2. Resolve Real Teacher Names from class_roster for these classes
            const { data: facultyData, error: facultyError } = await supabase
                .from('class_roster')
                .select('class_id, role_in_class, section, subject, users!inner(id, name, role, avatar)')
                .in('class_id', classIds)
                .in('role_in_class', ['teacher', 'mentor']);
            
            if (facultyError) throw facultyError;

            // 3. Fetch Materials
            const { data: materials, error: materialsError } = await supabase
                .from('materials')
                .select('*')
                .in('class_id', classIds)
                .order('created_at', { ascending: false });
            
            if (materialsError) throw materialsError;
            
            // 4. Privacy Filtering: Strict Section-Aware Logic
            const filteredMaterials = (materials || []).filter((m: any) => {
                if (m.is_public) return true; // CONFIRMED: Public content visible to everyone
                
                // Find what section the student is in for this specific material's class
                const enrollment = rosterData?.find(r => r.class_id === m.class_id);
                if (!enrollment) return false;

                // Match: Material has NO section (class-wide) OR matches student's specific section
                return !m.section || m.section === enrollment.section;
            });

            setStudentMaterials(filteredMaterials);

            // 4. Personnel Enrichment Transformation: EXPANDED 1:M Mapping
            const flattenedClasses: any[] = [];
            
            (rosterData || []).forEach((r: any) => {
                const studentSection = (r.section || 'A').toString().toUpperCase().trim();
                
                // Find all faculty assigned to this specific class
                const classFaculty = (facultyData || []).filter(f => {
                    const facultySection = (f.section || '').toString().toUpperCase().trim();
                    // Match: Exact section OR teacher is assigned to 'ALL' sections (empty or 'ALL')
                    return f.class_id === r.class_id && (facultySection === studentSection || facultySection === '' || facultySection === 'ALL');
                });

                if (classFaculty.length > 0) {
                    classFaculty.forEach(f => {
                        const u = Array.isArray(f.users) ? f.users[0] : f.users;
                        
                        // SKIP: Only skip if it's a PURE mentor role with no subject. 
                        // If they are a subject teacher (even if they also mentor), they should show up.
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
                    // Fallback
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
            // Ensure unique cards per (Class, Subject, Teacher)
            const uniqueClasses = Array.from(new Map(flattenedClasses.map(c => [`${c.class_id}_${c.subject}_${c.teacher_id}`, c])).values());
            setStudentClasses(uniqueClasses);

            // 5. Fetch Essential Institutional Contacts (Principal)
            const { data: principalData } = await supabase
                .from('users')
                .select('id, name, role, avatar')
                .eq('school_id', mockAuthUser.school_id)
                .eq('role', 'super_admin');

            if (principalData) {
                setDbPrincipals(principalData as User[]);
            }

            // Sync faculty data from the roster
            // ARMOR: Strictly filter faculty to match only whose (Class ID, Section) pairs match the student's enrollment
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
            
            // 6. Fetch Personal Attendance Rate
            console.log(`[STUDENT_DASHBOARD_PULSE] Syncing attendance for: ${mockAuthUser.id}`);
            const { data: attData, error: attError } = await supabase
                .from('attendance')
                .select('status')
                .eq('student_id', mockAuthUser.id);
            
            if (!attError && attData && attData.length > 0) {
                const total = attData.length;
                const present = attData.filter((r: any) => (r.status || '').toUpperCase() === 'PRESENT').length;
                const rate = Math.round((present / total) * 100);
                setAttendanceRate(`${rate}%`);
                console.log(`[STUDENT_SYNC_SUCCESS] Personal Rate: ${rate}%`);
            } else {
                setAttendanceRate('0%');
                console.log(`[STUDENT_SYNC_EMPTY] No history for student ${mockAuthUser.id}`);
            }

        }
    } catch (err: any) {
        console.error('fetchStudentData error:', err.message);
    } finally {
        setIsLoading(false);
    }
  }, [mockAuthUser?.id]);

  // Financial Circuit Breaker: Decouple from Pulse to prevent sync loops
  useEffect(() => {
    if (mockAuthUser?.id) {
        fetchStudentFees(mockAuthUser.id);
    }
  }, [mockAuthUser?.id, fetchStudentFees]);

  // Optimized contact lookup (Memoized to prevent sync loops)
  const displayContacts = React.useMemo(() => {
    const uniqueContactsMap = new Map();
    
    // 1. Add Headmasters
    dbPrincipals.forEach(u => {
        if (u.id !== mockAuthUser?.id) uniqueContactsMap.set(u.id, u);
    });

    // 2. Add Faculty from roster
    dbFaculty.forEach(u => {
        if (u.id !== mockAuthUser?.id) uniqueContactsMap.set(u.id, u);
    });

    // 3. Add anyone we have a conversation with
    const myConversations = new Set<string>();
    (chatMessages || []).forEach((msg: any) => {
        if (msg.sender_id === mockAuthUser?.id) myConversations.add(msg.receiver_id);
        if (msg.receiver_id === mockAuthUser?.id) myConversations.add(msg.sender_id);
    });
    
    return Array.from(uniqueContactsMap.values()) as User[];
  }, [dbPrincipals, dbFaculty, chatMessages, mockAuthUser?.id]);
  const showToast = (msg: string) => {
    setToast({ show: true, message: msg });
    setTimeout(() => setToast({ show: false, message: '' }), 3000);
  };

  useEffect(() => {
    fetchStudentData();
    if (mockAuthUser?.school_id) {
        fetchSchoolDetails(mockAuthUser.school_id);
        fetchAnnouncements(mockAuthUser.school_id);
        fetchMessages(mockAuthUser.school_id, true);
        fetchVideos(mockAuthUser.school_id);
        fetchLiveStreams(mockAuthUser.school_id);
    }
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
        setIsPayModalVisible(false); // Close simulation modal

        // Trigger real Razorpay Checkout
        if (orderData && orderData.id) {
            setActiveRazorpayOrder({
                ...orderData,
                name: mockAuthUser.name,
                email: mockAuthUser.email,
                contact: mockAuthUser.phone || ''
            });
        } else {
            throw new Error("Invalid order data received");
        }
    } catch (err: any) {
        setIsPaymentProcessing(false);
        showToast("Payment initiation failed: " + err.message);
    }
  };

  const handleRazorpaySuccess = async (paymentId: string, orderId: string, signature: string) => {
    console.log('[RAZORPAY_FLOW] Payment Successful:', paymentId);
    setActiveRazorpayOrder(null);
    setShowPaymentSuccess(true);
    setTimeout(() => setShowPaymentSuccess(false), 5000);
    
    if (mockAuthUser?.id) {
        // Refresh local student fees to show the 'Processing' status while webhook processes
        fetchStudentFees(mockAuthUser.id);
    }
    showToast("Payment Successful! Verifying records...");
  };

  const handleLinkPress = (url: string) => {
    Linking.openURL(url).catch(err => console.error("Couldn't load page", err));
  };

  const handleSendMessage = async () => {
    if (!msgInput.trim() || !selectedChat) return;
    
    // Defensive ID lookup for students
    const schoolId = mockAuthUser?.school_id || mockAuthUser?.schoolId;
    const senderId = currentUser.id || mockAuthUser?.id;

    if (schoolId && senderId) {
        try {
            await sendChatMessage(schoolId, senderId, selectedChat, msgInput);
            setMsgInput('');
            // Success is handled by context Realtime listener
        } catch (err: any) {
            console.error('Student send error:', err.message);
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
      <View className="flex-1 bg-gray-50 p-2">
         {isLoading ? (
             <View className="flex-1 items-center justify-center">
                 <ActivityIndicator size="large" color="#4f46e5" />
             </View>
         ) : (
             <>
                {activeTab === 'home' && (
                    <StudentHome 
                      currentUser={currentUser}
                      studentMaterials={studentMaterials}
                      studentAssignments={studentAssignments}
                      studentPrimaryClass={studentClasses[0] || null}
                      allStudentClasses={studentClasses}
                      announcements={announcements}
                      onNavigate={onNavigate}
                      onShowHistory={() => setShowHistoryModal(true)}
                      currentSchool={currentSchool}
                      attendanceRate={attendanceRate}
                    />
                )}
                {activeTab === 'classes' && (
                  hasPermission('classes', role, currentSchool?.id) ? (
                    <StudentClasses 
                      studentPrimaryClass={studentClasses[0] || null} 
                      allStudentClasses={studentClasses}
                    />
                  ) : (
                    <RestrictedAccessView 
                        featureName="Class Access" 
                        onContactAdmin={() => onNavigate('messages')}
                        role={role}
                    />
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
                    <RestrictedAccessView 
                        featureName="Fee Access" 
                        onContactAdmin={() => onNavigate('messages')}
                        role={role}
                    />
                  )
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
                      studentClasses={studentClasses}
                    />
                  ) : (
                    <RestrictedAccessView 
                        featureName="Resource Access" 
                        onContactAdmin={() => onNavigate('messages')}
                        role={role}
                    />
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
                    msgInput={msgInput}
                    setMsgInput={setMsgInput}
                  />
                )}
                {activeTab === 'profile' && (
                  <StudentProfile 
                    currentUser={currentUser}
                    onShowEditProfileModal={() => {}}
                    onLogout={() => console.log('Logout')}
                  />
                )}
             </>
         )}

         <AnnouncementHistoryModal 
            visible={showHistoryModal}
            onClose={() => setShowHistoryModal(false)}
            announcements={announcements}
            currentUser={mockAuthUser}
         />

         <VideoPlayerModal 
            visible={showVideoPlayerModal}
            onClose={() => {
                setShowVideoPlayerModal(false);
                setPlayingVideo(null);
            }}
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
               onFailure={(err) => {
                   console.error('[RAZORPAY_FLOW] Payment Failed:', err);
                   setActiveRazorpayOrder(null);
                   showToast(`Payment failed: ${err.description || 'Verification Error'}`);
               }}
               onClose={() => setActiveRazorpayOrder(null)}
             />
         )}
      </View>
  );
};
