import React, { createContext, useContext, useState, ReactNode, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { UserRole } from '../types';
import { dbRoleToUserRole, DbRole } from '../src/utils/roleUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

interface MockAuthContextType {
  currentUser: DbUser | null;
  currentSchool: DbSchool | null;
  isLoading: boolean;
  // This allows the Simulation Overlay to set the active identity
  setSession: (userId: string) => Promise<void>;
  setMockUser: (role: string) => Promise<void>;
  updatePushToken: (token: string) => Promise<void>;
  clearSession: () => void;
  // Metadata for the UI role system
  currentUserRole: UserRole | null;
}

const SESSION_KEY = '@oureiduca_simulation_session';

const MockAuthContext = createContext<MockAuthContextType | undefined>(undefined);

export const MockAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<DbUser | null>(null);
  const [currentSchool, setCurrentSchool] = useState<DbSchool | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  const setSession = async (userId: string, persist: boolean = true) => {
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
    } catch (err) {
      console.error('Error setting simulation session:', err);
      clearSession();
    } finally {
      setIsLoading(false);
    }
  };

  const clearSession = async () => {
    setCurrentUser(null);
    setCurrentSchool(null);
    try {
      if (AsyncStorage) {
        await AsyncStorage.removeItem(SESSION_KEY);
      }
    } catch (err: any) {
      console.warn('Simulation session storage restricted:', err.message);
    }
  };

  // Helper to map DB role to existing UI enum
  const currentUserRole = useMemo(() => {
    if (!currentUser) return null;
    // Hybrid Logic: If a teacher is assigned as a mentor in any class, elevate to ADMIN_TEACHER
    if (currentUser.role === 'teacher' && currentUser.isMentor) return UserRole.ADMIN_TEACHER;
    return dbRoleToUserRole(currentUser.role);
  }, [currentUser]);

  const setMockUser = async (role: string) => {
    setIsLoading(true);
    try {
      // 1. First, try to find a user with this role who ALSO has a roster entry
      const { data: rosterUser, error: rosterError } = await supabase
        .from('class_roster')
        .select('user_id, users!inner(role)')
        .eq('users.role', role)
        .limit(1)
        .single();
      
      const targetUserId = rosterUser?.user_id;

      if (targetUserId) {
        await setSession(targetUserId);
      } else {
        // 2. Fallback: Find the first user with this role regardless of roster
        const { data, error } = await supabase
          .from('users')
          .select('id')
          .eq('role', role)
          .limit(1)
          .single();
        
        if (data?.id) {
          await setSession(data.id);
        } else {
          console.warn(`No user found for role: ${role}`);
          clearSession();
        }
      }
    } catch (err) {
      console.error(`Failed to set mock user for role ${role}:`, err);
      clearSession();
    } finally {
      setIsLoading(false);
    }
  };

  const updatePushToken = async (token: string) => {
    if (!currentUser) return;
    try {
      const { error } = await supabase
        .from('users')
        .update({ expo_push_token: token })
        .eq('id', currentUser.id);
      
      if (error) throw error;
      
      console.log('[MOCK_AUTH] Push Token Synchronized with Supabase');
      setCurrentUser(prev => prev ? { ...prev, expo_push_token: token } : null);
    } catch (err) {
      console.warn('[MOCK_AUTH] Push Token Sync Failed:', err);
    }
  };

  return (
    <MockAuthContext.Provider value={{ 
      currentUser, 
      currentSchool, 
      isLoading, 
      setSession, 
      setMockUser,
      updatePushToken,
      clearSession,
      currentUserRole 
    }}>
      {children}
    </MockAuthContext.Provider>
  );
};

export const useMockAuth = (): MockAuthContextType => {
  const ctx = useContext(MockAuthContext);
  if (!ctx) throw new Error('useMockAuth must be used inside <MockAuthProvider>');
  return ctx;
};

