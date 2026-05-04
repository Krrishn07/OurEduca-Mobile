import { UserRole } from '../types';

export const PERMISSION_MAP: Record<string, Record<string, string>> = {
    'fees': {
        [UserRole.PLATFORM_ADMIN]: 'Billing Management',
        [UserRole.SUPER_ADMIN]:    'Fee Management',
        [UserRole.STUDENT]:        'Pay Fees',
        [UserRole.PARENT]:         'Pay Fees',
    },
    'manage': {
        [UserRole.SUPER_ADMIN]:    'Staff Management',
    },
    'classes': {
        [UserRole.SUPER_ADMIN]:    'Staff Management',
        [UserRole.ADMIN_TEACHER]:  'Classroom Access',
        [UserRole.TEACHER]:        'Classroom Access',
        [UserRole.STUDENT]:        'View Classes',
    },
    'videos': {
        [UserRole.ADMIN_TEACHER]:  'Resource Access',
        [UserRole.TEACHER]:        'Resource Access',
        [UserRole.STUDENT]:        'View Resources',
    },
    'messages': {
        [UserRole.ADMIN_TEACHER]:  'Messaging Access',
        [UserRole.TEACHER]:        'Messaging Access',
        [UserRole.SUPER_ADMIN]:    'School Messaging',
    },
    'monitor': {
        [UserRole.ADMIN_TEACHER]:  'Security Monitor',
    },
    'roles': {
        [UserRole.PLATFORM_ADMIN]: 'Global Control',
    },
    'institutes': {
        [UserRole.PLATFORM_ADMIN]: 'Manage Institutes',
    },
    'leads': {
        [UserRole.PLATFORM_ADMIN]: 'Manage Institutes',
    },
    'billing': {
        [UserRole.PLATFORM_ADMIN]: 'Billing Management',
    },
    'settings': {
        [UserRole.PLATFORM_ADMIN]: 'System Settings',
        [UserRole.SUPER_ADMIN]:    'School Settings',
    },
};

/**
 * Returns the relevant permission string for a role-feature combination
 */
export const getRequiredPermission = (featureId: string, role: string): string | null => {
    const feature = PERMISSION_MAP[featureId];
    if (!feature) return null;
    return feature[role] || null;
};
