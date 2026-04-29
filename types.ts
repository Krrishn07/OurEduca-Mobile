
export enum UserRole {
  STUDENT = 'STUDENT',
  PARENT = 'PARENT',
  TEACHER = 'TEACHER',
  ADMIN_TEACHER = 'ADMIN_TEACHER',
  SUPER_ADMIN = 'SUPER_ADMIN',
  PLATFORM_ADMIN = 'PLATFORM_ADMIN'
}

export interface TeacherAssignment {
    grade: string;
    section: string;
    subject: string;
}

export interface ClassSection {
    grade: string;
    section: string;
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar?: string;
  schoolId?: string;
  email?: string;
  phone?: string;
  status?: 'Active' | 'Inactive';
  office?: string;
  // Student Specific
  grade?: string;
  section?: string;
  rollNumber?: string;
  // Teacher Specific
  assignments?: TeacherAssignment[];
  mentoredSection?: ClassSection;
  instituteId?: string;
}

export interface ClassItem {
  id: string;
  name: string;
  teacher: string;
  time: string;
  upcomingAssignment?: string;
  grade?: string;
}

export interface Message {
  id: string;
  sender: string;
  text: string;
  timestamp: Date;
  isMe: boolean;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'assignment' | 'grade' | 'announcement';
}

export interface StudentMetric {
  subject: string;
  score: number;
  fullMark: number;
}

export interface ChatMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  is_me?: boolean;
  timestamp?: string;
}

export interface Fee {
  id: string;
  school_id: string;
  student_id: string;
  title: string;
  amount: number;
  due_date: string;
  status: 'PENDING' | 'PAID' | 'OVERDUE';
  created_at?: string;
}

export interface FeeTransaction {
  id: string;
  fee_id: string;
  student_id: string;
  school_id: string;
  amount: number;
  payment_method: string;
  transaction_ref?: string;
  status: 'PENDING_VERIFICATION' | 'VERIFIED' | 'REJECTED';
  paid_at: string;
  verified_by?: string;
  verified_at?: string;
  // Join enrichment
  users?: User; 
}

export interface CameraNode {
  id: string;
  school_id: string;
  name: string;
  stream_url: string;
  target_class_id?: string;
  target_section?: string;
  status: 'ONLINE' | 'OFFLINE' | 'MAINTENANCE';
  created_at?: string;
}
