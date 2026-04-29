import { UserRole } from '../../types';

export type DbRole = 'platform' | 'headmaster' | 'mentor' | 'teacher' | 'student';

export const dbRoleToUserRole = (role: string): UserRole => {
  const normalizedRole = role.toLowerCase();
  switch (normalizedRole) {
    case 'platform':   return UserRole.PLATFORM_ADMIN;
    case 'headmaster': return UserRole.SUPER_ADMIN;
    case 'mentor':     return UserRole.ADMIN_TEACHER;
    case 'teacher':    return UserRole.TEACHER;
    case 'student':    return UserRole.STUDENT;
    default:           return UserRole.STUDENT;
  }
};

export const userRoleToDbRole = (role: UserRole): DbRole => {
  switch (role) {
    case UserRole.PLATFORM_ADMIN: return 'platform';
    case UserRole.SUPER_ADMIN:    return 'headmaster';
    case UserRole.ADMIN_TEACHER:  return 'mentor';
    case UserRole.TEACHER:        return 'teacher';
    case UserRole.STUDENT:        return 'student';
    case UserRole.PARENT:         return 'student'; // Fallback for now
    default:                      return 'student';
  }
};
export const getRoleLabel = (role: UserRole | DbRole): string => {
  const norm = String(role).toLowerCase();
  if (norm.includes('headmaster') || norm === UserRole.SUPER_ADMIN.toLowerCase()) return 'Principal';
  if (norm.includes('platform') || norm === UserRole.PLATFORM_ADMIN.toLowerCase()) return 'Platform Admin';
  if (norm.includes('mentor') || norm === UserRole.ADMIN_TEACHER.toLowerCase()) return 'Class Mentor';
  if (norm.includes('teacher') || norm === UserRole.TEACHER.toLowerCase()) return 'Course Faculty';
  if (norm.includes('student') || norm === UserRole.STUDENT.toLowerCase()) return 'Student Learner';
  return norm.charAt(0).toUpperCase() + norm.slice(1);
};
