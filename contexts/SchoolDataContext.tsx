
import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { User, UserRole, Fee, FeeTransaction, CameraNode } from '../types';
import { supabase } from '../lib/supabase';
import { dbRoleToUserRole, userRoleToDbRole } from '../src/utils/roleUtils';
import { useMockAuth } from './MockAuthContext';
import { PERMISSION_MAP, getRequiredPermission } from '../constants/permissions';

export interface Announcement {
  id: string;
  title: string;
  message: string;
  date: string;
  sender: string;
  audience: 'ALL' | 'STUDENT' | 'STAFF';
}

export interface SystemLog {
  id: string;
  school_id?: string;
  user_id?: string;
  category: 'INSTITUTION' | 'BILLING' | 'SECURITY' | 'SYSTEM';
  title: string;
  icon: string;
  color: string;
  created_at: string;
}

export interface Meeting {
  id: string;
  title: string;
  date: string; // "YYYY-MM-DD"
  time: string; // "HH:MM"
  targetClassId?: string; // If null, general staff meeting
  targetClassName?: string;
  description: string;
}

// New Types
export interface PlatformSettings {
  platformName: string;
  supportEmail: string;
  supportPhone: string;
  maintenanceMode?: boolean;
}

export interface PaymentConfig {
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  upiId: string;
  qrCodeUrl: string;
}

export interface PaymentNotification {
    id: string;
    schoolName: string;
    amount: number;
    date: string;
    status: 'Pending' | 'Verified';
}



export interface ChatMessage {
    id: string;
    sender_id: string;
    receiver_id: string;
    content: string;
    created_at: string;
    is_read: boolean;
    timestamp?: string; // Formatted mirror for UI usage
}

export interface AcademicSession {
  id: string;
  name: string;
  is_active: boolean;
}

export interface Video {
  id: string;
  school_id: string;
  class_id?: string;
  section?: string;
  created_by: string;
  title: string;
  subject?: string;
  video_url: string;
  thumbnail_url?: string;
  duration?: string;
  is_public: boolean;
  created_at: string;
}

export interface LiveStream {
  id: string;
  school_id: string;
  created_by: string;
  class_id?: string;
  section?: string;
  title: string;
  subject?: string;
  stream_url: string;
  is_active: boolean;
  created_at: string;
}

export interface RegistrationMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  institute_name: string;
  address: string;
  status: 'NEW' | 'REVIEWED' | 'CONTACTED' | 'ONBOARDED';
  created_at: string;
}

export interface DbRolePermission {
  role: string;
  permissions: string[];
  school_id?: string | null;
  updated_at?: string;
}

export interface SchoolDataContextType {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  addUser: (user: User) => void;
  updateUser: (user: User) => void;
  deleteUser: (userId: string) => void;
  announcements: Announcement[];
  meetings: Meeting[];
  platformSettings: PlatformSettings;
  updatePlatformSettings: (settings: PlatformSettings) => void;
  fetchPlatformSettings: () => Promise<void>;
  schoolDetails: any; // School identity from 'schools' table
  paymentConfig: PaymentConfig;
  updatePaymentConfig: (config: PaymentConfig) => void;
  paymentNotifications: PaymentNotification[];
  studentPaymentLink: string;
  institutes: any[];
  isLoadingInstitutes: boolean;
  fetchInstitutes: () => Promise<void>;
  registerInstitute: (details: { name: string, phone: string, email: string, institute_name: string, address: string }) => Promise<void>;
  sendChatMessage: (schoolId: string, senderId: string, receiverId: string, content: string) => Promise<void>;
  syncBillingAudit: (overdueSchoolIds: string[]) => Promise<void>;
  
  // Inquiries / Leads (Stage 1)
  registrationMessages: RegistrationMessage[];
  isLoadingInquiries: boolean;
  fetchRegistrationMessages: () => Promise<void>;
  updateRegistrationStatus: (id: string, status: 'NEW' | 'REVIEWED' | 'CONTACTED' | 'ONBOARDED') => Promise<void>;
  deleteRegistrationMessage: (id: string) => Promise<void>;
  
  // Finance Hub Methods
  dbFees: Fee[];
  dbTransactions: FeeTransaction[];
  fetchStudentFees: (studentId: string) => Promise<void>;
  fetchSchoolTransactions: (schoolId: string) => Promise<void>;
  initiateFeePayment: (feeId: string, studentId: string, amount: number, schoolId: string) => Promise<void>;
  verifyFeeTransaction: (transactionId: string, feeId: string, verifierId: string) => Promise<void>;
  issueBulkFee: (schoolId: string, studentIds: string[], title: string, amount: number, dueDate: string) => Promise<void>;
  settleManualPayment: (feeId: string, studentId: string, amount: number, schoolId: string, verifierId: string) => Promise<void>;
  sendInstitutionalReminders: (schoolId: string, senderId: string) => Promise<number>;
  
  systemLogs: SystemLog[];
  fetchSystemLogs: (schoolId?: string) => Promise<void>;
  fetchMessages: (schoolId: string, force?: boolean) => Promise<void>;
  logSystemActivity: (schoolId: string | null | undefined, title: string, icon: string, color: string, userId?: string, category?: SystemLog['category']) => Promise<void>;
  
  // Health Monitoring
  healthStatus: 'Optimal' | 'Degraded' | 'Offline';
  dbLatency: number;
  checkSystemHealth: () => Promise<void>;
  
  // Roster Management (Supabase Sync)
  dbRoster: any[];
  fetchRoster: (schoolId: string) => Promise<void>;
  setGlobalMentorRoster: (roster: any[]) => void;
  mentorAttendanceMap: Record<string, string>;
  setGlobalAttendanceMap: (map: Record<string, string>) => void;
  mentorMaterials: any[];
  setGlobalMentorMaterials: (mats: any[]) => void;
  mentorVideos: any[];
  setGlobalMentorVideos: (vids: any[]) => void;
  mentorAssignedClassId: string | null;
  mentorAssignedSection: string | null;
  setGlobalMentorAssignedClassId: (id: string | null, section?: string | null) => void;

  // Video Management Methods
  dbVideos: Video[];
  teacherClasses: any[];
  fetchVideos: (schoolId: string, classId?: string) => Promise<void>;
  uploadVideo: (video: Omit<Video, 'id' | 'created_at'>) => Promise<void>;
  deleteVideo: (videoId: string, schoolId: string) => Promise<void>;
  
  // Streaming & Cameras
  liveStreams: LiveStream[];
  dbCameraNodes: CameraNode[];
  fetchLiveStreams: (schoolId: string) => Promise<void>;
  fetchCameraNodes: (schoolId: string) => Promise<void>;
  registerCameraNode: (node: Omit<CameraNode, 'id' | 'created_at' | 'status'>) => Promise<void>;
  deleteCameraNode: (nodeId: string, schoolId: string) => Promise<void>;
  startLiveStream: (data: Omit<LiveStream, 'id' | 'created_at' | 'is_active'>) => Promise<string | undefined>;
  endLiveStream: (streamId: string, schoolId: string) => Promise<void>;
  
  // Session Persistence
  isLiveSessionActive: boolean;
  setIsLiveSessionActive: (active: boolean) => void;
  activeSessionData: any;
  setActiveSessionData: (data: any) => void;
  
  // Classes
  dbClasses: any[];
  fetchClasses: (schoolId: string) => Promise<void>;
  fetchTeacherClasses: (teacherId: string) => Promise<void>;

  // Centralized User Fetching
  fetchUsers: (role: UserRole, school_id?: string) => Promise<void>;
  fetchSchoolData: (schoolId: string) => Promise<void>;

  // Material Management
  fetchMaterials: (schoolId: string, classId?: string) => Promise<void>;
  uploadMaterial: (material: any) => Promise<void>;
  deleteMaterial: (materialId: string, schoolId: string) => Promise<void>;
  
  // RBAC Engine
  dbRolePermissions: DbRolePermission[];
  fetchRolePermissions: (role: string, schoolId?: string | null) => Promise<void>;
  hasPermission: (permissionName: string, role?: string, schoolId?: string | null) => boolean;
  clearInstitutionalData: () => void;
  isLiveSessionActive: boolean;
  setIsLiveSessionActive: (active: boolean) => void;
}

const SchoolDataContext = createContext<SchoolDataContextType | undefined>(undefined);

export const SchoolDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { currentUser, currentUserRole, currentSchool } = useMockAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [schoolDetails, setSchoolDetails] = useState<any>(null);
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings>({
      platformName: 'Oureduca',
      supportEmail: 'support@oureduca.com',
      supportPhone: '+1 (555) 000-0000',
  });
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig>({
      bankName: 'Global Bank',
      accountNumber: '**** **** 1234',
      ifscCode: 'GLOB0001',
      upiId: 'oureduca@upi',
      qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=oureduca@upi'
  });
  const [paymentNotifications, setPaymentNotifications] = useState<PaymentNotification[]>([]);
  const [studentPaymentLink, setStudentPaymentLink] = useState('https://oureduca.pmt/desk/S101');
  const [institutes, setInstitutes] = useState<any[]>([]);
  const [isLoadingInstitutes, setIsLoadingInstitutes] = useState(false);
  const [registrationMessages, setRegistrationMessages] = useState<RegistrationMessage[]>([]);
  const [isLoadingInquiries, setIsLoadingInquiries] = useState(false);

  
  // System Logs Persistent State
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>([]);

  // Roster Persistent State
  const [dbRoster, setDbRoster] = useState<any[]>([]);
  const [mentorAttendanceMap, setMentorAttendanceMap] = useState<Record<string, string>>({});
  const [mentorMaterials, setMentorMaterials] = useState<any[]>([]);
  const [mentorVideos, setMentorVideos] = useState<any[]>([]);
  const [mentorAssignedClassId, setMentorAssignedClassId] = useState<string | null>(null);
  const [mentorAssignedSection, setMentorAssignedSection] = useState<string | null>(null);

  // Chat Messages State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [dbFees, setDbFees] = useState<Fee[]>([]);
  const [dbTransactions, setDbTransactions] = useState<FeeTransaction[]>([]);
  const [dbVideos, setDbVideos] = useState<Video[]>([]);
  const [liveStreams, setLiveStreams] = useState<LiveStream[]>([]);
  const [dbClasses, setDbClasses] = useState<any[]>([]);
  const [teacherClasses, setTeacherClasses] = useState<any[]>([]);
  const [dbCameraNodes, setDbCameraNodes] = useState<CameraNode[]>([]);
  const [dbRolePermissions, setDbRolePermissions] = useState<DbRolePermission[]>([]);
  const [isLiveSessionActive, setIsLiveSessionActive] = useState(false);
  const [activeSessionData, setActiveSessionData] = useState<any>(null);

  const addUser = useCallback((user: User) => {
      setUsers(prev => [...prev, user]);
  }, []);

  const updateUser = useCallback((user: User) => {
      setUsers(prev => prev.map(u => u.id === user.id ? user : u));
  }, []);

  const deleteUser = useCallback((userId: string) => {
      setUsers(prev => prev.filter(u => u.id !== userId));
  }, []);

  const addAnnouncement = useCallback(async (announcement: any) => {
      try {
          const { error } = await supabase
              .from('announcements')
              .insert({
                  school_id: announcement.school_id,
                  sender_id: announcement.sender_id,
                  title: announcement.title,
                  message: announcement.message,
                  audience: announcement.audience
              });
          
          if (error) throw error;
          await logSystemActivity(announcement.school_id, `Institutional Notice Posted: ${announcement.title}`, 'Bell', '#6366f1', announcement.sender_id, 'INSTITUTION');
          fetchAnnouncements(announcement.school_id);
      } catch (err: any) {
          console.error('addAnnouncement error:', err.message);
      }
  }, [fetchAnnouncements, logSystemActivity]);

  const deleteAnnouncement = useCallback(async (id: string, schoolId: string) => {
      try {
          const { error } = await supabase
              .from('announcements')
              .delete()
              .eq('id', id);
          if (error) throw error;
          await logSystemActivity(schoolId, `Institutional Notice Deleted (ID: ${id})`, 'Trash', '#ef4444', undefined, 'SECURITY');
          fetchAnnouncements(schoolId);
      } catch (err: any) {
          console.error('deleteAnnouncement error:', err.message);
      }
  }, [fetchAnnouncements, logSystemActivity]);

  const fetchAnnouncements = useCallback(async (schoolId: string) => {
      if (!schoolId) return; // Guard: prevent UUID error from undefined schoolId
      try {
          const { data, error } = await supabase
              .from('announcements')
              .select('*')
              .or(`school_id.eq.${schoolId},school_id.is.null`)
              .order('created_at', { ascending: false });
          
          if (error) throw error;
          
          const mapped = (data || []).map((a: any) => ({
              id: a.id,
              title: a.title,
              message: a.message,
              date: new Date(a.created_at).toLocaleDateString(),
              sender: 'Administration',
              audience: a.audience
          }));

          // TACTICAL DEDUPLICATION: Ensure unique announcement IDs
          const uniqueData = Array.from(new Map(mapped.map(item => [item.id, item])).values());
          setAnnouncements(uniqueData);
      } catch (err: any) {
          console.error('fetchAnnouncements error:', err.message);
      }
  }, []);

  const fetchSchoolDetails = useCallback(async (schoolId: string) => {
    try {
        const { data, error } = await supabase
            .from('schools')
            .select('*')
            .eq('id', schoolId)
            .single();
        if (error) throw error;
        setSchoolDetails(data);
    } catch (err: any) {
        console.error('fetchSchoolDetails error:', err.message);
    }
  }, []);

  const updateSchoolDetails = useCallback(async (schoolId: string, details: any) => {
      try {
          const { error } = await supabase
              .from('schools')
              .update(details)
              .eq('id', schoolId);
          if (error) throw error;
          fetchSchoolDetails(schoolId);
      } catch (err: any) {
          console.error('updateSchoolDetails error:', err.message);
      }
  }, [fetchSchoolDetails]);

  const fetchSystemLogs = useCallback(async (schoolId?: string) => {
    try {
        let query = supabase
            .from('system_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50);
        
        if (schoolId) {
            query = query.eq('school_id', schoolId);
        }

        const { data, error } = await query;
        if (error) throw error;
        setSystemLogs(data || []);
    } catch (err: any) {
        console.error('fetchSystemLogs error:', err.message);
    }
  }, []);

  const logSystemActivity = useCallback(async (
      schoolId: string | null | undefined, 
      title: string, 
      icon: string, 
      color: string, 
      userId?: string,
      category: SystemLog['category'] = 'SYSTEM'
  ) => {
    try {
        await supabase
            .from('system_logs')
            .insert({ 
                school_id: schoolId || null, 
                user_id: userId || null,
                category,
                title, 
                icon, 
                color 
            });
        fetchSystemLogs(schoolId || undefined);
    } catch (err: any) {
        console.error('logSystemActivity error:', err.message);
    }
  }, [fetchSystemLogs]);

  const fetchMessages = useCallback(async (schoolId: string, force = false) => {
    if (!schoolId) return;
    try {
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .eq('school_id', schoolId)
            .order('created_at', { ascending: true });
        
        if (error) throw error;
        setChatMessages(data || []);
    } catch (err: any) {
        console.error('fetchMessages error:', err.message);
    }
  }, []);

  const clearInstitutionalData = useCallback(() => {
      setAnnouncements([]);
      setMeetings([]);
      setSchoolDetails(null);
      setPaymentNotifications([]);
      setChatMessages([]);

      setDbRoster([]);
      setMentorAttendanceMap({});
      setMentorMaterials([]);
      setMentorVideos([]);
      setMentorAssignedClassId(null);
      setMentorAssignedSection(null);
      setDbCameraNodes([]);
  }, []);

  const scheduleMeeting = useCallback((meeting: Omit<Meeting, 'id'>) => {
      const newMeeting: Meeting = { ...meeting, id: `meet_${Date.now()}` };
      setMeetings(prev => [...prev, newMeeting]);
  }, []);

  const fetchPlatformSettings = useCallback(async () => {
      try {
          const { data, error } = await supabase
              .from('platform_settings')
              .select('value')
              .eq('key', 'global')
              .maybeSingle();
          
          if (error) throw error;
          if (data?.value) {
              setPlatformSettings(data.value as PlatformSettings);
          }
      } catch (err: any) {
          console.error('fetchPlatformSettings error:', err.message);
      }
  }, []);

  const updatePlatformSettings = async (settings: PlatformSettings) => {
      try {
          setPlatformSettings(settings); // Optimistic UI
          
          const { error } = await supabase
              .from('platform_settings')
              .upsert({ 
                  key: 'global', 
                  value: settings,
                  updated_at: new Date().toISOString()
              });
          
          if (error) throw error;
      } catch (err: any) {
          console.error('updatePlatformSettings DB error:', err.message);
          throw err;
      }
  };

  const updatePaymentConfig = (config: PaymentConfig) => {
      setPaymentConfig(config);
  };

  const addPaymentNotification = (notif: Omit<PaymentNotification, 'id' | 'date' | 'status'>) => {
      const newNotif: PaymentNotification = {
          ...notif,
          id: `notif_${Date.now()}`,
          date: new Date().toLocaleDateString(),
          status: 'Pending'
      };
      setPaymentNotifications(prev => [...prev, newNotif]);
  };

  const updateStudentPaymentLink = useCallback((link: string) => {
      setStudentPaymentLink(link);
  }, []);

  const fetchRegistrationMessages = useCallback(async () => {
    setIsLoadingInquiries(true);
    try {
        const { data, error } = await supabase
            .from('registration_inquiries')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) throw error;
        setRegistrationMessages(data || []);
    } catch (err: any) {
        console.error('fetchRegistrationMessages error:', err.message);
    } finally {
        setIsLoadingInquiries(false);
    }
  }, []);

  const updateRegistrationStatus = useCallback(async (id: string, status: 'NEW' | 'REVIEWED' | 'CONTACTED' | 'ONBOARDED') => {
      try {
          const { error } = await supabase
              .from('registration_inquiries')
              .update({ status })
              .eq('id', id);
          if (error) throw error;
          await fetchRegistrationMessages();
      } catch (err: any) {
          console.error('updateRegistrationStatus error:', err.message);
          throw err;
      }
  }, [fetchRegistrationMessages]);

  const deleteRegistrationMessage = useCallback(async (id: string) => {
      try {
          const { error } = await supabase
              .from('registration_inquiries')
              .delete()
              .eq('id', id);
          if (error) throw error;
          await fetchRegistrationMessages();
      } catch (err: any) {
          console.error('deleteRegistrationMessage error:', err.message);
          throw err;
      }
  }, [fetchRegistrationMessages]);

  const syncBillingAudit = useCallback(async (overdueSchoolIds: string[]) => {
    if (overdueSchoolIds.length === 0) return;
    
    try {
        const { error } = await supabase
            .from('schools')
            .update({ billing_status: 'Overdue' })
            .in('id', overdueSchoolIds);

        if (error) throw error;
        
        await logSystemActivity(null, `Bulk Audit Complete: ${overdueSchoolIds.length} schools flagged`, 'Shield', '#e11d48', undefined, 'BILLING');
        await fetchInstitutes();
    } catch (err: any) {
        console.error('syncBillingAudit error:', err.message);
        throw err;
    }
  }, [fetchInstitutes]);

  const fetchInstitutes = useCallback(async () => {
      setIsLoadingInstitutes(true);
      try {
          const { data, error } = await supabase
              .from('schools')
              .select('*')
              .order('created_at', { ascending: false });
          if (error) throw error;
          setInstitutes(data || []);
      } catch (err: any) {
          console.error('fetchInstitutes error:', err.message);
      } finally {
          setIsLoadingInstitutes(false);
      }
  }, []);

  const registerInstitute = useCallback(async (details: { name: string, phone: string, email: string, institute_name: string, address: string }) => {
      try {
          // 1. Create the inquiry record (Stage 1)
          const { error } = await supabase
              .from('registration_inquiries')
              .insert({
                  institute_name: details.institute_name,
                  name: details.name,
                  phone: details.phone,
                  email: details.email,
                  address: details.address,
                  status: 'NEW'
              });
          
          if (error) throw error;

          // Sync local state
          await fetchRegistrationMessages();
          await logSystemActivity(null, `New Inquiry Received: ${details.institute_name}`, 'Inbox', '#4f46e5', undefined, 'INSTITUTION');
      } catch (err: any) {
          console.error('registerInstitute error:', err.message);
          throw err;
      }
  }, [fetchRegistrationMessages]);


  const sendChatMessage = useCallback(async (schoolId: string, senderId: string, receiverId: string, content: string) => {
      try {
          if (!schoolId || !senderId || !receiverId) {
              console.warn('[Messaging] Missing required IDs:', { schoolId, senderId, receiverId });
              return;
          }

          const { error } = await supabase
              .from('messages')
              .insert({
                  school_id: schoolId,
                  sender_id: senderId,
                  receiver_id: receiverId,
                  content: content
              });
          
          if (error) {
              console.error('sendChatMessage DB error:', error.message);
              throw error;
          }
      } catch (err: any) {
          console.error('sendChatMessage catch error:', err.message);
          throw err;
      }
  }, []);

  const fetchStudentFees = useCallback(async (studentId: string) => {
    try {
        const { data, error } = await supabase
            .from('fees')
            .select('*')
            .eq('student_id', studentId)
            .order('due_date', { ascending: true });
        if (error) throw error;
        setDbFees(data || []);
    } catch (err: any) {
        console.error('fetchStudentFees error:', err.message);
    }
  }, []);

  const fetchSchoolTransactions = useCallback(async (schoolId: string) => {
    if (!schoolId) return;
    try {
        const { data, error } = await supabase
            .from('fee_transactions')
            .select('*, users:student_id(id, name, avatar, role)')
            .eq('school_id', schoolId)
            .order('paid_at', { ascending: false });
        
        // Graceful handling of missing tables (PostgREST 404/400 for schema cache issues)
        if (error) {
            if (error.code === 'PGRST116' || error.message.includes('schema cache')) {
                console.warn('[FINANCE_SYNC_WAIT] Financial tables not found in schema cache. Re-run fees_schema.sql.');
                setDbTransactions([]);
                return;
            }
            throw error;
        }
        setDbTransactions(data || []);
    } catch (err: any) {
        console.error('fetchSchoolTransactions error:', err.message);
    }
  }, []);

  const initiateFeePayment = async (feeId: string, studentId: string, amount: number, schoolId: string) => {
    try {
        console.log(`[RAZORPAY_GATEWAY] Creating order for Fee: ${feeId} (₹${amount})`);
        
        // 1. Call Edge Function to create Razorpay Order
        const { data, error } = await supabase.functions.invoke('create-razorpay-order', {
            body: {
                amount: amount,
                currency: 'INR',
                receipt: `fee_${feeId.substring(0, 8)}`
            }
        });

        if (error) {
            console.error('[RAZORPAY_INVOKE_ERROR]', error);
            const errorMsg = error.context?.message || error.message || 'Failed to create payment order';
            throw new Error(errorMsg);
        }
        
        if (data?.error) {
            console.error('[RAZORPAY_DATA_ERROR]', data.error);
            throw new Error(data.error);
        }
        
        const orderId = data.id;
        console.log(`[RAZORPAY_GATEWAY_SUCCESS] Order ID: ${orderId}`);

        // 2. Create a PENDING transaction record in Supabase
        const { error: txError } = await supabase
            .from('fee_transactions')
            .insert({
                fee_id: feeId,
                student_id: studentId,
                school_id: schoolId,
                amount: amount,
                payment_method: 'RAZORPAY',
                transaction_ref: orderId, // Store Razorpay Order ID as reference
                status: 'PENDING_VERIFICATION'
            });

        if (txError) {
            console.warn('[RAZORPAY_SYNC_WARNING] Order created but local transaction log failed:', txError.message);
        }
        
        // 3. Update the fee status to 'PENDING' (since PENDING_VERIFICATION is not in fees table schema)
        await supabase
            .from('fees')
            .update({ status: 'PENDING' })
            .eq('id', feeId);

        // 4. Return the full order object for the Razorpay Checkout
        return {
            ...data,
            key_id: process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_SgY7Fhmho6INGt'
        };
    } catch (err: any) {
        console.error('initiateFeePayment error:', err.message);
        throw err;
    }
  };

  const verifyFeeTransaction = async (transactionId: string, feeId: string, verifierId: string) => {
    try {
        // 1. Update Transaction
        const { error: txError } = await supabase
            .from('fee_transactions')
            .update({
                status: 'VERIFIED',
                verified_by: verifierId,
                verified_at: new Date().toISOString()
            })
            .eq('id', transactionId);
        if (txError) throw txError;

        // 2. Update Fee status to PAID
        const { error: feeError } = await supabase
            .from('fees')
            .update({ status: 'PAID' })
            .eq('id', feeId);
        if (feeError) throw feeError;

        // 3. Log the activity
        await logSystemActivity(schoolDetails?.id, 'Fee Transaction Verified', 'Payment', '#16a34a', verifierId, 'BILLING');
        
        // Refresh local data
        if (schoolDetails?.id) fetchSchoolTransactions(schoolDetails.id);
    } catch (err: any) {
        console.error('verifyFeeTransaction error:', err.message);
        throw err;
    }
  };

  const issueBulkFee = useCallback(async (schoolId: string, studentIds: string[], title: string, amount: number, dueDate: string) => {
    try {
        const feesToInsert = studentIds.map(sid => ({
            school_id: schoolId,
            student_id: sid,
            title: title,
            amount: amount,
            due_date: dueDate,
            status: 'PENDING'
        }));

        const { error } = await supabase
            .from('fees')
            .insert(feesToInsert);
        
        if (error) throw error;
        await logSystemActivity(schoolId, `Bulk Fees Issued: ${title}`, 'Payment', '#4f46e5', undefined, 'BILLING');
    } catch (err: any) {
        console.error('issueBulkFee error:', err.message);
        throw err;
    }
  }, [logSystemActivity]);

  const settleManualPayment = useCallback(async (feeId: string, studentId: string, amount: number, schoolId: string, verifierId: string) => {
    try {
        // 1. Create a transaction marked as VERIFIED immediately (Manual/Cash)
        const { data: tx, error: txError } = await supabase
            .from('fee_transactions')
            .insert({
                fee_id: feeId,
                student_id: studentId,
                school_id: schoolId,
                amount: amount,
                payment_method: 'Cash',
                status: 'VERIFIED',
                verified_by: verifierId,
                verified_at: new Date().toISOString()
            })
            .select()
            .single();
        if (txError) throw txError;

        // 2. Update Fee status to PAID
        const { error: feeError } = await supabase
            .from('fees')
            .update({ status: 'PAID' })
            .eq('id', feeId);
        if (feeError) throw feeError;
        
        await logSystemActivity(schoolId, `Manual Fee Settlement: ${amount}`, 'Payment', '#16a34a', verifierId, 'BILLING');
        if (schoolId) fetchSchoolTransactions(schoolId);
    } catch (err: any) {
        console.error('settleManualPayment error:', err.message);
        throw err;
    }
  }, [logSystemActivity, fetchSchoolTransactions]);

  const sendInstitutionalReminders = useCallback(async (schoolId: string, senderId: string) => {
    try {
        const { data, error } = await supabase
            .from('fees')
            .select('student_id, title, status')
            .eq('school_id', schoolId)
            .in('status', ['PENDING', 'OVERDUE']);
        
        if (error) throw error;
        if (!data || data.length === 0) return 0;

        // Group by student to send one consolidated message per student
        const studentFeeCount: Record<string, number> = {};
        data.forEach(f => {
            studentFeeCount[f.student_id] = (studentFeeCount[f.student_id] || 0) + 1;
        });

        const messagesToInsert = Object.entries(studentFeeCount).map(([sid, count]) => ({
            school_id: schoolId,
            sender_id: senderId,
            receiver_id: sid,
            content: `[OUREDUCA FINANCE] Notification: You have ${count} outstanding invoice(s) marked as PENDING or OVERDUE. Please visit your Fee Desk to settle institutional dues immediately.`,
            created_at: new Date().toISOString()
        }));

        const { error: msgError } = await supabase
            .from('messages')
            .insert(messagesToInsert);
        
        if (msgError) throw msgError;

        await logSystemActivity(schoolId, `Debt Reminders Dispatched: ${messagesToInsert.length} Notification(s)`, 'Bell', '#ea580c');
        return messagesToInsert.length;
    } catch (err: any) {
        console.error('sendInstitutionalReminders error:', err.message);
        throw err;
    }
  }, [logSystemActivity]);

  const fetchVideos = useCallback(async (schoolId: string, classId?: string) => {
    if (!schoolId) return;
    try {
        let query = supabase
            .from('videos')
            .select('*')
            .eq('school_id', schoolId);
        
        const { data, error } = await query.order('created_at', { ascending: false });
        if (error) throw error;
        // TACTICAL DEDUPLICATION: Ensure unique video IDs
        const uniqueData = Array.from(new Map((data || []).map(item => [item.id, item])).values());
        setDbVideos(uniqueData);
    } catch (err: any) {
        console.error('fetchVideos error:', err.message);
    }
  }, []);

  const uploadVideo = useCallback(async (video: Omit<Video, 'id' | 'created_at'>) => {
    try {
        const { error } = await supabase
            .from('videos')
            .insert(video);
        if (error) throw error;
        await logSystemActivity(video.school_id, `Lecture Content Uploaded: ${video.title}`, 'Video', '#ec4899', video.created_by, 'SYSTEM');
        fetchVideos(video.school_id);
    } catch (err: any) {
        console.error('uploadVideo error:', err.message);
        throw err;
    }
  }, [fetchVideos, logSystemActivity]);

  const deleteVideo = useCallback(async (videoId: string, schoolId: string) => {
    try {
        const { error } = await supabase
            .from('videos')
            .delete()
            .eq('id', videoId);
        if (error) throw error;
        fetchVideos(schoolId);
    } catch (err: any) {
        console.error('deleteVideo error:', err.message);
        throw err;
    }
  }, [fetchVideos]);

  const fetchLiveStreams = useCallback(async (schoolId: string) => {
    if (!schoolId) return;
    try {
        const { data, error } = await supabase
            .from('live_streams')
            .select('*')
            .eq('school_id', schoolId)
            .eq('is_active', true)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        // TACTICAL DEDUPLICATION: Ensure unique stream IDs
        const uniqueData = Array.from(new Map((data || []).map(item => [item.id, item])).values());
        setLiveStreams(uniqueData);
    } catch (err: any) {
        console.error('fetchLiveStreams error:', err.message);
    }
  }, []);

  const startLiveStream = useCallback(async (data: Omit<LiveStream, 'id' | 'created_at' | 'is_active'>) => {
    try {
        const { data: newStream, error } = await supabase
            .from('live_streams')
            .insert({ ...data, is_active: true })
            .select()
            .single();
        
        if (error) throw error;
        await fetchLiveStreams(data.school_id);
        
        const type = data.class_id ? 'Classroom feed' : 'General announcement';
        await logSystemActivity(data.school_id, `LIVE NOW: ${data.title} (${type})`, 'Radio', '#dc2626', data.created_by, 'SYSTEM');
        
        return newStream.id;
    } catch (err: any) {
        console.error('startLiveStream error:', err.message);
        throw err;
    }
  }, [fetchLiveStreams, logSystemActivity]);

  const endLiveStream = useCallback(async (streamId: string, schoolId: string) => {
    try {
        const { error } = await supabase
            .from('live_streams')
            .update({ is_active: false })
            .eq('id', streamId);
        
        if (error) throw error;
        await fetchLiveStreams(schoolId);
    } catch (err: any) {
        console.error('endLiveStream error:', err.message);
        throw err;
    }
  }, [fetchLiveStreams]);

  const fetchClasses = useCallback(async (schoolId: string) => {
    if (!schoolId) return;
    try {
        const { data, error } = await supabase
            .from('classes')
            .select('*')
            .eq('school_id', schoolId)
            .order('name', { ascending: true });
        
        if (error) throw error;
        setDbClasses(data || []);
    } catch (err: any) {
        console.error('fetchClasses error:', err.message);
    }
  }, []);

  const fetchRoster = useCallback(async (schoolId: string) => {
    if (!schoolId) return;
    try {
        const { data: schoolClasses } = await supabase.from('classes').select('id').eq('school_id', schoolId);
        const classIds = (schoolClasses || []).map(c => c.id);
        
        if (classIds.length === 0) {
            setDbRoster([]);
            return;
        }

        const { data: roster, error: rosterError } = await supabase
            .from('class_roster')
            .select('*, users:user_id(id, name, role, avatar)')
            .in('class_id', classIds);
        
        // Auto-detect Mentor Assignment for current user
        if (currentUser?.id && currentUserRole === UserRole.ADMIN_TEACHER) {
            const assignment = (roster || []).find(r => r.user_id === currentUser.id && r.role_in_class === 'mentor');
            if (assignment) {
                setMentorAssignedClassId(assignment.class_id);
                setMentorAssignedSection(assignment.section || 'A');
            } else {
                setMentorAssignedClassId(null);
                setMentorAssignedSection(null);
            }
        } else {
            setMentorAssignedClassId(null);
            setMentorAssignedSection(null);
        }

        // TACTICAL FLATTENING: Map nested users into top-level props for UI consistency (fixes question marks)
        const flattened = (roster || []).map((r: any) => {
            const u = Array.isArray(r.users) ? r.users[0] : r.users;
            return {
                ...r,
                name: u?.name || 'Unknown',
                role: u?.role || 'student',
                avatar: u?.avatar
            };
        });

        // TACTICAL DEDUPLICATION: Prevent duplicate roster entries if data is joined across multiple subjects/sections
        const uniqueFlattened = Array.from(new Map(flattened.map((r: any) => [r.id, r])).values());
        setDbRoster(uniqueFlattened);
    } catch (err: any) {
        console.error('fetchRoster error:', err.message);
    }
  }, [currentUser, currentUserRole]);
  
  const fetchTeacherClasses = useCallback(async (teacherId: string, schoolId?: string) => {
    if (!teacherId) return;
    try {
        let query = supabase
            .from('class_roster')
            .select('id, section, subject, classes!inner(*)')
            .eq('user_id', teacherId);
        
        if (schoolId) {
            query = query.eq('classes.school_id', schoolId);
        }

        const { data, error } = await query;
        if (error) throw error;
        
        // Flatten and merge roster-level metadata (section/subject) into class objects
        const flattened = (data || []).map((item: any) => {
            if (!item.classes) return null;
            const className = item.classes.name || 'Unnamed Class';
            const section = item.section || (Array.isArray(item.classes.sections) ? item.classes.sections[0] : 'A');
            return {
                ...item.classes,
                class_id: item.classes.id, 
                section: section,
                subject: item.subject || item.classes.subject || 'General',
                displayName: `${className}-${section}${item.subject ? ` (${item.subject})` : ''}`,
                rosterId: item.id
            };
        }).filter(Boolean);

        const uniqueAssignments = Array.from(new Map(flattened.map((c: any) => [`${c.class_id}_${c.section}_${c.subject}`, c])).values());
        setTeacherClasses(uniqueAssignments);
    } catch (err: any) {
        console.error('fetchTeacherClasses error:', err.message);
    }
  }, []);

  const fetchCameraNodes = useCallback(async (schoolId: string) => {
    if (!schoolId) return;
    try {
        const { data, error } = await supabase
            .from('camera_nodes')
            .select('*')
            .eq('school_id', schoolId)
            .order('name', { ascending: true });
        
        if (error) throw error;
        // TACTICAL DEDUPLICATION: Ensure unique node IDs
        const uniqueData = Array.from(new Map((data || []).map(item => [item.id, item])).values());
        setDbCameraNodes(uniqueData);
    } catch (err: any) {
        console.error('fetchCameraNodes error:', err.message);
    }
  }, []);

  const registerCameraNode = useCallback(async (node: Omit<CameraNode, 'id' | 'created_at' | 'status'>) => {
    try {
        const { error } = await supabase
            .from('camera_nodes')
            .insert({ 
                school_id: node.school_id,
                name: node.name,
                stream_url: node.stream_url,
                target_class_id: node.target_class_id,
                target_section: node.target_section,
                status: 'ONLINE' 
            });
        if (error) throw error;
        fetchCameraNodes(node.school_id);
    } catch (err: any) {
        console.error('registerCameraNode error:', err.message);
        throw err;
    }
  }, [fetchCameraNodes]);

  const deleteCameraNode = useCallback(async (nodeId: string, schoolId: string) => {
    try {
        const { error } = await supabase
            .from('camera_nodes')
            .delete()
            .eq('id', nodeId);
        if (error) throw error;
        fetchCameraNodes(schoolId);
    } catch (err: any) {
        console.error('deleteCameraNode error:', err.message);
        throw err;
    }
  }, [fetchCameraNodes]);

  const fetchMaterials = useCallback(async (schoolId: string, classId?: string) => {
    if (!schoolId) return;
    try {
        let query = supabase
            .from('materials')
            .select('*, users:created_by(id, name, avatar)')
            .eq('school_id', schoolId);
        
        if (classId) {
            query = query.eq('class_id', classId);
        }

        const { data, error } = await query.order('created_at', { ascending: false });
        if (error) throw error;
        
        // TACTICAL DEDUPLICATION: Ensure unique material IDs
        const uniqueData = Array.from(new Map((data || []).map(item => [item.id, item])).values());
        setMentorMaterials(uniqueData);
    } catch (err: any) {
        console.error('fetchMaterials error:', err.message);
    }
  }, []);

  const uploadMaterial = useCallback(async (material: any) => {
    try {
        const { error } = await supabase
            .from('materials')
            .insert(material);
        if (error) throw error;
        await logSystemActivity(material.school_id, `Resource Published: ${material.title}`, 'File', '#6366f1', material.created_by, 'SYSTEM');
        fetchMaterials(material.school_id);
    } catch (err: any) {
        console.error('uploadMaterial error:', err.message);
        throw err;
    }
  }, [fetchMaterials, logSystemActivity]);

  const deleteMaterial = useCallback(async (materialId: string, schoolId: string) => {
    try {
        const { error } = await supabase
            .from('materials')
            .delete()
            .eq('id', materialId);
        if (error) throw error;
        fetchMaterials(schoolId);
    } catch (err: any) {
        console.error('deleteMaterial error:', err.message);
        throw err;
    }
  }, [fetchMaterials]);

  const setGlobalMentorRoster = (data: any[]) => setDbRoster(data);

  const setGlobalAttendanceMap = (data: Record<string, string>) => setMentorAttendanceMap(data);
  const setGlobalMentorMaterials = (data: any[]) => setMentorMaterials(data);
  const setGlobalMentorVideos = (data: any[]) => setMentorVideos(data);
  const setGlobalMentorAssignedClassId = (id: string | null, section: string | null = null) => {
    setMentorAssignedClassId(id);
    setMentorAssignedSection(section);
  };

  const [healthStatus, setHealthStatus] = useState<'Optimal' | 'Degraded' | 'Offline'>('Optimal');
  const [dbLatency, setDbLatency] = useState<number>(0);

  const checkSystemHealth = useCallback(async () => {
    const start = Date.now();
    try {
        // Lightweight heartbeat check: just ping the schools table for a count
        const { error } = await supabase.from('schools').select('id', { count: 'exact', head: true }).limit(1);
        const end = Date.now();
        setDbLatency(end - start);
        
        if (error) throw error;
        setHealthStatus('Optimal');
    } catch (err: any) {
        console.warn('[HEALTH_CHECK_FAILED]', err);
        const isNetworkError = err?.message?.toLowerCase().includes('fetch') || 
                               err?.message?.toLowerCase().includes('network') ||
                               !err;
        setHealthStatus(isNetworkError ? 'Offline' : 'Degraded');
        setDbLatency(Date.now() - start);
    }
  }, []);

  // Periodic Heartbeat & Live Sync
  useEffect(() => {
    checkSystemHealth();
    if (currentSchool?.id) {
        fetchLiveStreams(currentSchool.id);
    }
    const interval = setInterval(() => {
        checkSystemHealth();
        if (currentSchool?.id) {
            fetchLiveStreams(currentSchool.id);
        }
    }, 30000); // Sync every 30s
    return () => clearInterval(interval);
  }, [checkSystemHealth, fetchLiveStreams, currentSchool?.id]);

  const fetchUsers = useCallback(async (role: UserRole, schoolId?: string) => {
    try {
        // Use loose comparison to handle potential casing/enum mismatches
        const isPlatform = String(role).toUpperCase() === 'PLATFORM_ADMIN' || String(role).toLowerCase() === 'platform';
        
        let query = supabase.from('users').select('*');
        if (!isPlatform && schoolId) {
            query = query.eq('school_id', schoolId);
        }

        const { data, error } = await query;
        if (error) {
            const isNetworkError = error?.message?.toLowerCase().includes('fetch') || 
                                   error?.message?.toLowerCase().includes('network');
            setHealthStatus(isNetworkError ? 'Offline' : 'Degraded');
            throw error;
        }

        const mapped = (data || []).map((u: any) => ({
            ...u,
            schoolId: u.school_id,
            rollNumber: u.roll_number,
            role: dbRoleToUserRole(u.role),
            status: u.status || 'Active'
        } as User));

        setUsers(mapped);
        setHealthStatus('Optimal');
    } catch (err: any) {
        console.error('fetchUsers error:', err.message);
        const isNetworkError = err?.message?.toLowerCase().includes('fetch') || 
                               err?.message?.toLowerCase().includes('network') ||
                               !err;
        setHealthStatus(isNetworkError ? 'Offline' : 'Degraded');
    }
  }, []);

  const fetchSchoolData = useCallback(async (schoolId?: string) => {
    const targetId = schoolId || currentSchool?.id;
    if (!targetId) return;

    // TACTICAL RESET: Clear faculty state to prevent data leakage during role simulation
    setMentorAssignedClassId(null);
    setTeacherClasses([]);

    const tasks: Promise<any>[] = [
        fetchUsers(UserRole.TEACHER, targetId),
        fetchUsers(UserRole.STUDENT, targetId),
        fetchClasses(targetId),
        fetchRoster(targetId),
        fetchSystemLogs(targetId),
        fetchAnnouncements(targetId)
    ];

    if (currentUser?.id && (currentUserRole === UserRole.TEACHER || currentUserRole === UserRole.ADMIN_TEACHER)) {
        tasks.push(fetchTeacherClasses(currentUser.id, targetId));
    }

    await Promise.all(tasks);
  }, [fetchUsers, fetchClasses, fetchRoster, fetchSystemLogs, fetchAnnouncements, fetchTeacherClasses, currentSchool, currentUser, currentUserRole]);

  // --- Scoped RBAC Engine ---
  // Now fetches a global snapshot to eliminate per-click latency
  const fetchRolePermissions = useCallback(async (role?: string, schoolId: string | null = null) => {
    try {
        let query = supabase.from('role_permissions').select('*');
        
        // If a specific role/school is provided, we still filter for targeted refresh
        if (role) {
            query = query.eq('role', role);
        }
        
        const { data, error } = await query;
        if (error) throw error;

        const allPermissions = data || [];

        // Merger Logic
        setDbRolePermissions(prev => {
            if (!role) return allPermissions; // Full snapshot replacement
            
            const filtered = prev.filter(p => {
                const sameRole = p.role === role;
                const sameScope = schoolId === null ? p.school_id === null : p.school_id === schoolId;
                return !(sameRole && sameScope);
            });
            return [...filtered, ...allPermissions];
        });
    } catch (err: any) {
        console.error('fetchRolePermissions error:', err.message);
    }
  }, []);

  // Initial Bootstrap Pulse
  useEffect(() => {
    fetchRolePermissions(); // Fetch every role's global permissions once
    fetchPlatformSettings(); // Fetch global platform branding/config
  }, [fetchRolePermissions, fetchPlatformSettings]);

  useEffect(() => {
    if (currentUserRole) {
        const dbRoleId = userRoleToDbRole(currentUserRole);
        // Reactive pulse for current school context only
        fetchRolePermissions(dbRoleId, currentSchool?.id || null);
    }
  }, [currentUserRole, currentSchool?.id, fetchRolePermissions]);

  const hasPermission = useCallback((permissionNameOrFeatureId: string, activeRole?: string, activeSchoolId: string | null = null) => {
    // 1. Context-Aware Resolution: Use simulation context if specific args are missing
    const effectiveRole = activeRole || currentUserRole;
    const effectiveSchoolId = (activeRole === undefined) ? (currentSchool?.id || null) : activeSchoolId;

    if (!effectiveRole) return false; // Fail-safe: Deny if role unknown
    
    // 1.5 Role-Aware Mapping: Resolve feature ID to actual DB permission string
    const targetPermissionName = getRequiredPermission(permissionNameOrFeatureId, effectiveRole);
    
    // If feature is not mapped, it's NOT gated (Allow by default for home, profile, etc.)
    if (!targetPermissionName) return true;

    // Normalize UI Enum (e.g. TEACHER, SUPER_ADMIN) to DB ID (e.g. teacher, headmaster)
    const dbRoleId = Object.values(UserRole).includes(effectiveRole as UserRole) 
        ? userRoleToDbRole(effectiveRole as UserRole) 
        : effectiveRole;

    // 3. Find the best match record
    const scoped = dbRolePermissions.find(p => p.role === dbRoleId && p.school_id === effectiveSchoolId);
    const global = dbRolePermissions.find(p => p.role === dbRoleId && p.school_id === null);
    
    const target = scoped || global;

    // 3.5 Default Fallback: If no DB record exists yet, use hardcoded defaults
    // These match PERMISSION_CATEGORIES + PERMISSION_MAP exactly
    const DEFAULT_PERMISSIONS: Record<string, string[]> = {
        'platform':    ['Global Control', 'Manage Institutes', 'Billing Management', 'System Settings'],
        'headmaster':  ['School Settings', 'Staff Management', 'Fee Management', 'School Messaging'],
        'teacher':     ['Classroom Access', 'Resource Access', 'Messaging Access'],
        'mentor':      ['Classroom Access', 'Resource Access', 'Messaging Access', 'Security Monitor'],
        'student':     ['View Classes', 'View Resources', 'Pay Fees'],
    };

    const effectivePermissions = target?.permissions || DEFAULT_PERMISSIONS[dbRoleId] || [];

    // 4. Legacy Safety Net: Maps NEW unified tokens → OLD strings that may still exist in DB
    // This can be removed once all role_permissions rows are migrated to the new strings
    const legacyMap: Record<string, string[]> = {
        // Platform tokens
        'Global Control':     ['Global Control', 'System Analytics'],
        'Manage Institutes':  ['Institutional Control', 'Manage Institutes', 'Onboarding Access'],
        'Billing Management': ['Billing Access', 'Billing Management', 'Fee Management'],
        'System Settings':    ['Global Settings', 'System Settings'],

        // Headmaster tokens
        'School Settings':    ['School Settings', 'School Management'],
        'Staff Management':   ['Staff Management', 'Class Roster'],
        'Fee Management':     ['Fee Management', 'Financial Overview', 'Finances', 'Pay Fees', 'Billing Management'],
        'School Messaging':   ['School Communication', 'Student Messaging', 'Institutional Control'],

        // Teacher / Mentor tokens
        'Classroom Access':   ['Classroom Management', 'Group Management', 'Attendance', 'Class Roster', 'Gradebook', 'View Lessons', 'Performance Tracking', 'View Materials'],
        'Resource Access':    ['Resource Management', 'Materials Upload', 'Videos', 'Live Sessions', 'Materials', 'View Lessons', 'Submit Assignments', 'View Materials'],
        'Messaging Access':   ['Messaging', 'Direct Messaging', 'Counseling', 'Student Messaging', 'Student Support', 'Messages', 'School Communication'],
        'Live Streaming':     ['Live Sessions'],
        'Security Monitor':   ['Security Surveillance', 'Surveillance', 'Monitor Attendance'],

        // Student / Parent tokens
        'View Classes':       ['View Materials', 'View Lessons', 'Resource Management', 'Classroom Management'],
        'View Resources':     ['View Materials', 'View Lessons', 'Resource Management', 'Materials', 'Videos', 'Submit Assignments'],
        'Pay Fees':           ['Fees Payment', 'Pay Fees', 'Fee Management', 'View Fees'],
        'School Communication': ['School Communication', 'Messaging', 'Student Messaging'],
    };

    const alts = legacyMap[targetPermissionName] || [];
    
    return effectivePermissions.includes(targetPermissionName) || 
           alts.some(alt => effectivePermissions.includes(alt));
  }, [dbRolePermissions, currentUserRole, currentSchool?.id]);

  return (
    <SchoolDataContext.Provider value={{ 
        users, setUsers, addUser, updateUser, deleteUser,
        announcements, meetings, platformSettings, schoolDetails, paymentConfig, paymentNotifications, studentPaymentLink, chatMessages,
        dbFees, dbTransactions, fetchStudentFees, fetchSchoolTransactions, initiateFeePayment, verifyFeeTransaction,
        issueBulkFee, settleManualPayment,
        addAnnouncement,
        deleteAnnouncement,
        fetchAnnouncements,
        fetchSchoolDetails,
        updateSchoolDetails,
        clearInstitutionalData,
        scheduleMeeting,
        updatePlatformSettings,
        fetchPlatformSettings,
        updatePaymentConfig,
        addPaymentNotification,
        updateStudentPaymentLink,
        institutes,
        isLoadingInstitutes,
        fetchInstitutes,
        registerInstitute,
        sendChatMessage,
        
        dbRolePermissions,
        fetchRolePermissions, hasPermission, clearInstitutionalData,
        fetchMaterials, uploadMaterial, deleteMaterial,

        systemLogs,
        fetchSystemLogs,
        fetchMessages,
        logSystemActivity,
        dbRoster, fetchRoster, setGlobalMentorRoster,
        mentorAttendanceMap, setGlobalAttendanceMap,
        mentorMaterials, setGlobalMentorMaterials,
        mentorVideos, setGlobalMentorVideos,
        mentorAssignedClassId, mentorAssignedSection, setGlobalMentorAssignedClassId,
        dbVideos, fetchVideos, uploadVideo, deleteVideo,
        liveStreams, fetchLiveStreams, startLiveStream, endLiveStream,
        dbCameraNodes, fetchCameraNodes, registerCameraNode, deleteCameraNode,
        dbClasses, fetchClasses,
        fetchTeacherClasses, teacherClasses,
        fetchUsers, fetchSchoolData,
        healthStatus,
        dbLatency,
        checkSystemHealth,
        registrationMessages,
        isLoadingInquiries,
        fetchRegistrationMessages,
        updateRegistrationStatus,
        deleteRegistrationMessage,
        syncBillingAudit,
        clearInstitutionalData,
        isLiveSessionActive,
        setIsLiveSessionActive,
        activeSessionData,
        setActiveSessionData
    }}>
      {children}
    </SchoolDataContext.Provider>
  );
};

export const useSchoolData = () => {
  const context = useContext(SchoolDataContext);
  if (context === undefined) {
    throw new Error('useSchoolData must be used within a SchoolDataProvider');
  }
  return context;
};
