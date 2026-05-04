import { ClassItem, Notification, StudentMetric, User, UserRole } from './types';

export const SCHOOL_CONFIG = {
  name: "Springfield Academy",
  logoUrl: "https://ui-avatars.com/api/?name=Springfield+Academy&background=4f46e5&color=fff&size=128&bold=true"
};

export const PLATFORM_CONFIG = {
  name: "OurEduca",
  // Placeholder logo representing the 'Lightbulb on Book' concept. 
  // In production, replace this with the actual URL of the uploaded asset.
  logoUrl: "https://cdn-icons-png.flaticon.com/512/265/265674.png" 
};

export const MOCK_USER: User = {
  id: 'u123',
  name: 'Alex Johnson',
  role: UserRole.STUDENT, // Default, will change
  avatar: 'https://picsum.photos/200',
  schoolId: 'sch_001'
};

export const MOCK_CLASSES: ClassItem[] = [
  { id: 'c1', name: 'Mathematics 101', teacher: 'Mr. Smith', time: '09:00 AM', upcomingAssignment: 'Algebra Quiz', grade: 'A-' },
  { id: 'c2', name: 'Physics Intro', teacher: 'Ms. Curie', time: '10:30 AM', upcomingAssignment: 'Lab Report', grade: 'B+' },
  { id: 'c3', name: 'World History', teacher: 'Mrs. Davis', time: '01:00 PM', upcomingAssignment: 'Essay Draft', grade: 'A' },
  { id: 'c4', name: 'English Lit', teacher: 'Mr. Poe', time: '02:30 PM', upcomingAssignment: 'Reading Log', grade: 'B' },
];

export const MOCK_NOTIFICATIONS: Notification[] = [
  { id: 'n1', title: 'Math Homework Due', message: 'Algebra Quiz is due tomorrow at 9 AM.', time: '2h ago', type: 'assignment' },
  { id: 'n2', title: 'New Grade Posted', message: 'Your Physics Lab Report has been graded.', time: '5h ago', type: 'grade' },
  { id: 'n3', title: 'School Closed', message: 'School will be closed this Friday for maintenance.', time: '1d ago', type: 'announcement' },
];

export const MOCK_GRADES: StudentMetric[] = [
  { subject: 'Math', score: 92, fullMark: 100 },
  { subject: 'Physics', score: 88, fullMark: 100 },
  { subject: 'History', score: 95, fullMark: 100 },
  { subject: 'English', score: 85, fullMark: 100 },
];
