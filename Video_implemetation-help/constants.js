// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
export const C = {
  navy:    '#0d1f3c',
  navyMid: '#1a3560',
  blue:    '#1d4ed8',
  indigo:  '#4f46e5',
  teal:    '#0d9488',
  amber:   '#f59e0b',
  red:     '#ef4444',
  green:   '#22c55e',
  slate:   '#64748b',
  light:   '#f1f5f9',
  white:   '#ffffff',
  black:   '#000000',
};

// ─── MOCK DATA ─────────────────────────────────────────────────────────────────
export const LIVE_ROOMS = [
  { id:'r1', subject:'Mathematics', class:'10-A', teacher:'Mrs. Kavitha R.', avatar:'KR', status:'live',  viewers:12, startedAt:'09:00 AM' },
  { id:'r2', subject:'Physics',     class:'10-A', teacher:'Mr. Arjun Nair',  avatar:'AN', status:'live',  viewers:8,  startedAt:'10:30 AM' },
  { id:'r3', subject:'English',     class:'9-B',  teacher:'Ms. Priya Das',   avatar:'PD', status:'ended', viewers:0,  startedAt:'08:00 AM' },
];

export const RECORDED = [
  { id:'v1', subject:'Mathematics', title:'Quadratic Equations – Part 2',   teacher:'Mrs. Kavitha R.', duration:'48:22', date:'Apr 20', thumb:'🔢', views:34 },
  { id:'v2', subject:'Physics',     title:"Laws of Motion – Newton's 3rd",  teacher:'Mr. Arjun Nair',  duration:'51:05', date:'Apr 19', thumb:'⚛️',  views:28 },
  { id:'v3', subject:'Chemistry',   title:'Periodic Table Deep Dive',       teacher:'Ms. Ritu Mehta',  duration:'39:17', date:'Apr 18', thumb:'🧪', views:41 },
  { id:'v4', subject:'English',     title:'Shakespeare – Macbeth Act III',  teacher:'Ms. Priya Das',   duration:'44:50', date:'Apr 17', thumb:'📖', views:19 },
];

export const STAFF = [
  { id:'u1', name:'Mrs. Kavitha R.', role:'Math Teacher',    avatar:'KR', online:true  },
  { id:'u2', name:'Mr. Arjun Nair',  role:'Physics Teacher', avatar:'AN', online:true  },
  { id:'u3', name:'Ms. Priya Das',   role:'English Teacher', avatar:'PD', online:false },
  { id:'u4', name:'Mr. Dev Sharma',  role:'Mentor',          avatar:'DS', online:true  },
  { id:'u5', name:'Ms. Ritu Mehta',  role:'Chemistry',       avatar:'RM', online:false },
];

export const SUBJECTS_TEACHER = [
  { subject:'Mathematics', class:'10-A', nextAt:'Tomorrow 9:00 AM' },
  { subject:'Mathematics', class:'9-B',  nextAt:'Tomorrow 11:00 AM' },
];
