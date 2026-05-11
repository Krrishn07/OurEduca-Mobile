export interface PermissionCategory {
  title: string;
  description: string;
  permissions: string[];
  isSensitive?: boolean;
  /** Which role IDs this category applies to. If omitted, applies to all roles. */
  applicableRoles?: string[];
}

export const PERMISSION_CATEGORIES: PermissionCategory[] = [
  {
    title: 'Platform Administration',
    description: 'High-stakes permissions for platform-wide control and system health.',
    isSensitive: true,
    permissions: ['Global Control', 'Manage Institutes', 'Billing Management', 'System Settings'],
    applicableRoles: ['platform']
  },
  {
    title: 'School Administration',
    description: 'Administrative powers for school leads and headmasters.',
    permissions: ['School Settings', 'Staff Management', 'Fee Management', 'School Messaging'],
    applicableRoles: ['headmaster']
  },
  {
    title: 'Teaching & Mentoring',
    description: 'Core daily functions for teachers and mentors.',
    permissions: ['Classroom Access', 'Resource Access', 'Messaging Access', 'Live Streaming', 'Security Monitor'],
    applicableRoles: ['teacher', 'mentor']
  },
  {
    title: 'Student & Parent Access',
    description: 'Standard access for learners and guardians.',
    permissions: ['View Classes', 'View Resources', 'Pay Fees', 'School Communication'],
    applicableRoles: ['student', 'parent']
  }
];

// Flat list for backward compatibility with existing components
export const MASTER_PERMISSIONS = PERMISSION_CATEGORIES.flatMap(cat => cat.permissions);

/**
 * Reverse-lookup: maps OLD DB strings → NEW unified string.
 * Used to translate legacy permission records so the UI stays consistent.
 */
const LEGACY_TO_UNIFIED: Record<string, string> = {
    // Old Platform strings
    'System Analytics':       'Global Control',
    'Institutional Control':  'Manage Institutes',
    'Onboarding Access':      'Manage Institutes',
    'Billing Access':         'Billing Management',
    'Global Settings':        'System Settings',

    // Old Headmaster strings
    'School Management':      'School Settings',
    'Financial Overview':     'Fee Management',
    'Finances':               'Fee Management',
    'Academic Oversight':     'School Settings',

    // Old Teacher/Mentor strings
    'Classroom Management':   'Classroom Access',
    'Group Management':       'Classroom Access',
    'Attendance':             'Classroom Access',
    'Class Roster':           'Classroom Access',
    'Gradebook':              'Classroom Access',
    'Performance Tracking':   'Classroom Access',
    'Resource Management':    'Resource Access',
    'Materials Upload':       'Resource Access',
    'Materials':              'Resource Access',
    'Videos':                 'Resource Access',
    'View Materials':         'Resource Access',
    'Messaging':              'Messaging Access',
    'Direct Messaging':       'Messaging Access',
    'Counseling':             'Messaging Access',
    'Student Messaging':      'Messaging Access',
    'Student Support':        'Messaging Access',
    'Messages':               'Messaging Access',
    'Live Sessions':          'Live Streaming',
    'Security Surveillance':  'Security Monitor',
    'Surveillance':           'Security Monitor',
    'Monitor Attendance':     'Security Monitor',
    'Management':             'Classroom Access',

    // Old Student/Parent strings
    'View Lessons':           'View Classes',
    'Submit Assignments':     'View Classes',
    'View Grades':            'View Classes',
    'Time Table':             'View Classes',
    'Fees Payment':           'Pay Fees',
    'View Fees':              'Pay Fees',
    'View Ward Performance':  'View Resources',
};

/**
 * Translates an array of (potentially old) permission strings into the unified format.
 * Strings that are already unified pass through unchanged. Duplicates are removed.
 */
export const normalizePermissions = (permissions: string[]): string[] => {
    const normalized = (permissions || []).map(p => {
        // If it's already a valid unified string, keep it
        if (MASTER_PERMISSIONS.includes(p)) return p;
        // Otherwise translate from legacy
        return LEGACY_TO_UNIFIED[p] || null;
    }).filter((p): p is string => p !== null);

    // Deduplicate
    return [...new Set(normalized)];
};

export const AVAILABLE_COLORS = [
  '#4f46e5', // Indigo
  '#9333ea', // Purple
  '#2563eb', // Blue
  '#16a34a', // Green
  '#ea580c', // Orange
  '#db2777', // Pink
  '#e11d48', // Rose
  '#0891b2', // Cyan
  '#4b5563', // Gray
];

export const AVAILABLE_ICONS = [
  { name: 'Shield', label: 'Security' },
  { name: 'Admin', label: 'Admin' },
  { name: 'Users', label: 'Users' },
  { name: 'Sparkles', label: 'Premium' },
  { name: 'Classes', label: 'Education' },
  { name: 'Payment', label: 'Finance' },
  { name: 'Messages', label: 'Communication' },
  { name: 'Phone', label: 'Support' },
  { name: 'Check', label: 'Verification' },
];
