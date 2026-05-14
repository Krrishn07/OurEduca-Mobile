import React, { createContext, useContext, useState, ReactNode, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@lib/supabase';
import { UserRole } from '@/types';
import { dbRoleToUserRole, DbRole } from '@utils/roleUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

// ============================================================
// TYPES
// ============================================================
export interface DbUser {
  id: string;
  school_id: string | null;
  role: DbRole;
  name: string;
  email: string | null;
  phone?: string | null;
  isMentor?: boolean; 
  office?: string | null;
  grade?: string | null;
  section?: string | null;
  roll_number?: string | null;
  rollNumber?: string | null;
  schoolId?: string | null;
  expo_push_token?: string | null;
}

export interface DbSchool {
  id: string;
  name: string;
}

export type OnboardingStatus = 'pending' | 'approved' | 'rejected' | 'none';

interface MockAuthContextType {
  currentUser: DbUser | null;
  currentSchool: DbSchool | null;
  isLoading: boolean;
  onboardingStatus: OnboardingStatus;
  pendingRequest: any | null;
  
  // Auth Methods
  setSession: (userId: string) => Promise<void>;
  setMockUser: (role: string) => Promise<void>;
  updatePushToken: (token: string) => Promise<void>;
  clearSession: () => void;
  
  // Production Auth
  signInWithOtp: (phone: string) => Promise<{ error: any }>;
  verifyOtp: (phone: string, token: string) => Promise<{ error: any; status: OnboardingStatus }>;
  
  // Metadata
  currentUserRole: UserRole | null;
  simulateStudentLogin: (name: string, phone: string, schoolId: string, classId: string, section: string, schoolName?: string) => void;
}

const SESSION_KEY = '@oureiduca_simulation_session';

const MockAuthContext = createContext<MockAuthContextType | undefined>(undefined);

export const MockAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<DbUser | null>(null);
  const [currentSchool, setCurrentSchool] = useState<DbSchool | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [onboardingStatus, setOnboardingStatus] = useState<OnboardingStatus>('none');
  const [pendingRequest, setPendingRequest] = useState<any | null>(null);

  // Initialize: Load session from storage
  useEffect(() => {
    const loadSession = async () => {
      try {
        if (AsyncStorage) {
          const savedUserId = await AsyncStorage.getItem(SESSION_KEY);
          if (savedUserId) {
            await setSession(savedUserId, false);
          }
        }
      } catch (err: any) {
        console.warn('Simulation session not loaded:', err.message);
      } finally {
        setIsLoading(false);
      }
    };
    loadSession();
  }, []);

  const setSession = useCallback(async (userId: string, persist: boolean = true) => {
    setIsLoading(true);
    try {
      // 1. Fetch the user record live from Supabase
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (userError || !user) throw userError || new Error('User not found');

      const { count: mentorCount } = await supabase
        .from('class_roster')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('role_in_class', 'mentor');

      setCurrentUser({
        ...user,
        schoolId: user.school_id,
        rollNumber: user.roll_number,
        isMentor: (mentorCount || 0) > 0
      } as any);

      // 2. If the user has a school_id, fetch the school record
      if (user.school_id) {
        const { data: school, error: schoolError } = await supabase
          .from('schools')
          .select('*')
          .eq('id', user.school_id)
          .single();
        
        if (!schoolError && school) {
          setCurrentSchool(school as DbSchool);
        }
      } else {
        setCurrentSchool(null);
      }

      // 3. Persist session if requested
      if (persist && AsyncStorage) {
        await AsyncStorage.setItem(SESSION_KEY, userId);
      }
      
      setOnboardingStatus('none');
      setPendingRequest(null);
    } catch (err) {
      console.error('Error setting simulation session:', err);
      clearSession();
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearSession = useCallback(async () => {
    setCurrentUser(null);
    setCurrentSchool(null);
    setOnboardingStatus('none');
    setPendingRequest(null);
    try {
      if (AsyncStorage) {
        await AsyncStorage.removeItem(SESSION_KEY);
      }
    } catch (err: any) {
      console.warn('Simulation session storage restricted:', err.message);
    }
  }, []);

  // PRODUCTION AUTH METHODS
  const signInWithOtp = async (phone: string) => {
    setIsLoading(true);
    try {
      // In production, we'd use: const { error } = await supabase.auth.signInWithOtp({ phone });
      // For now, we simulate the success if it's a known phone or a valid pattern
      console.log(`[AUTH] Sending OTP to ${phone}`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { error: null };
    } catch (err) {
      return { error: err };
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async (phone: string, token: string) => {
    setIsLoading(true);
    try {
      // 1. Resolve Identity
      // First check if user is an official user
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('phone', phone)
        .maybeSingle();
      
      if (user) {
        await setSession(user.id);
        return { error: null, status: 'none' as OnboardingStatus };
      }

      // 2. Not a user, check onboarding requests
      const { data: request, error: reqError } = await supabase
        .from('student_onboarding_requests')
        .select('*, schools(name), classes(name)')
        .eq('phone', phone)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (request) {
        setPendingRequest(request);
        setOnboardingStatus(request.status as OnboardingStatus);
        
        // If pending or rejected, we don't set a currentUser
        // We just return the status so the UI can show the correct screen
        return { error: null, status: request.status as OnboardingStatus };
      }

      // 3. Neither user nor request exists
      return { error: null, status: 'none' as OnboardingStatus };
    } catch (err) {
      return { error: err, status: 'none' as OnboardingStatus };
    } finally {
      setIsLoading(false);
    }
  };

  const currentUserRole = useMemo(() => {
    if (!currentUser) return null;
    if (currentUser.role === 'teacher' && currentUser.isMentor) return UserRole.ADMIN_TEACHER;
    return dbRoleToUserRole(currentUser.role);
  }, [currentUser]);

  const setMockUser = useCallback(async (role: string) => {
    setIsLoading(true);
    try {
      const { data: rosterUser } = await supabase
        .from('class_roster')
        .select('user_id, users!inner(role)')
        .eq('users.role', role)
        .limit(1)
        .single();
      
      const targetUserId = rosterUser?.user_id;

      if (targetUserId) {
        await setSession(targetUserId);
      } else {
        const { data } = await supabase
          .from('users')
          .select('id')
          .eq('role', role)
          .limit(1)
          .single();
        
        if (data?.id) {
          await setSession(data.id);
        } else {
          clearSession();
        }
      }
    } catch (err) {
      clearSession();
    } finally {
      setIsLoading(false);
    }
  }, [setSession, clearSession]);

  const simulateStudentLogin = useCallback((name: string, phone: string, schoolId: string, classId: string, section: string, schoolName?: string) => {
    setIsLoading(true);
    const mockId = `sim_${Date.now()}`;
    const mockUser: DbUser = {
        id: mockId,
        name,
        phone,
        school_id: schoolId,
        schoolId: schoolId,
        role: 'student' as DbRole,
        grade: classId,
        section,
        rollNumber: 'SIM-001'
    };
    
    setCurrentSchool({
        id: schoolId,
        name: schoolName || 'Institutional Academy'
    });

    setCurrentUser(mockUser);
    setIsLoading(false);
  }, []);

  const updatePushToken = useCallback(async (token: string) => {
    if (!currentUser) return;
    try {
      await supabase
        .from('users')
        .update({ expo_push_token: token })
        .eq('id', currentUser.id);
      setCurrentUser(prev => prev ? { ...prev, expo_push_token: token } : null);
    } catch (err) {}
  }, [currentUser?.id]);

  const contextValue = useMemo(() => ({
    currentUser,
    currentSchool,
    isLoading,
    onboardingStatus,
    pendingRequest,
    setSession,
    setMockUser,
    updatePushToken,
    clearSession,
    signInWithOtp,
    verifyOtp,
    currentUserRole,
    simulateStudentLogin
  }), [currentUser, currentSchool, isLoading, onboardingStatus, pendingRequest, setSession, setMockUser, updatePushToken, clearSession, currentUserRole, simulateStudentLogin]);

  return (
    <MockAuthContext.Provider value={contextValue}>
      {children}
    </MockAuthContext.Provider>
  );
};

export const useMockAuth = (): MockAuthContextType => {
  const ctx = useContext(MockAuthContext);
  if (!ctx) throw new Error('useMockAuth must be used inside <MockAuthProvider>');
  return ctx;
};
