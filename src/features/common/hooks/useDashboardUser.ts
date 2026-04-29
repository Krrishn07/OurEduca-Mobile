import { useState, useMemo } from 'react';
import { User, UserRole } from '../../../../types';
import { dbRoleToUserRole } from '../../../utils/roleUtils';

/**
 * Hook to manage the active dashboard user's identity and mapping.
 * Handles the translation between Supabase DB roles and UI UserRoles,
 * and maintains role-specific context like the student's primary class.
 */
export const useDashboardUser = (mockAuthUser: any, role: UserRole) => {
  // Student Specific Identity Context
  const [studentPrimaryClass, setStudentPrimaryClass] = useState<any | null>(null);

  const currentUser: User = useMemo(() => {
    if (!mockAuthUser) {
      // System fallback for unauthenticated states during transitions
      return {
        id: '00000000-0000-0000-0000-000000000000',
        name: 'System Admin',
        role: role,
        email: 'admin@oureduca.com',
        status: 'Active',
        phone: 'N/A',
        office: 'HQ'
      } as User;
    }

    // Map DB role to UI role via centralized utility (respecting passed role prop for hybrid states)
    const liveRole = role || dbRoleToUserRole(mockAuthUser.role);

    return {
      ...mockAuthUser,
      id: mockAuthUser.id,
      name: mockAuthUser.name,
      role: liveRole,
      status: 'Active',
      email: mockAuthUser.email || '',
      phone: mockAuthUser.phone || 'No phone provided',
      office: mockAuthUser.office || (liveRole === UserRole.PLATFORM_ADMIN ? 'HQ' : 'Not assigned'),
      rollNumber: mockAuthUser.rollNumber || mockAuthUser.roll_number || undefined,
      instituteId: mockAuthUser.school_id || undefined,
      class_id: mockAuthUser.class_id || (studentPrimaryClass as any)?.id // Synchronize Roster ID for students
    } as User;
  }, [mockAuthUser, role, studentPrimaryClass]);

  return { 
    currentUser, 
    studentPrimaryClass, 
    setStudentPrimaryClass 
  };
};
