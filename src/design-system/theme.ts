export const AppColors = {
  primary: '#4f46e5',
  primarySoft: '#6366f1',
  primary_5: 'rgba(79, 70, 229, 0.05)',
  primary_10: 'rgba(79, 70, 229, 0.1)',
  primary_20: 'rgba(79, 70, 229, 0.2)',
  highlight: '#fde047',
  success: '#10b981',
  success_10: 'rgba(16, 185, 129, 0.1)',
  warning: '#f59e0b',
  error: '#ef4444',
  error_10: 'rgba(239, 68, 68, 0.1)',
  info: '#3b82f6',
  info_10: 'rgba(59, 130, 246, 0.1)',
  text: {
    strong: '#111827',
    body: '#4b5563',
    muted: '#9ca3af',
    inverse: '#ffffff',
  },
  background: {
    app: '#f8fafc',
    surface: '#ffffff',
    subtle: '#f5f7ff',
    muted: '#f8fafc',
  },
  border: {
    subtle: '#f3f4f6',
    strong: '#e5e7eb',
  },
  gradients: {
    brand: ['#6366f1', '#4f46e5', '#3730a3'] as const,
    soft: ['#f8fafc', '#f1f5f9'] as const,
    success: ['#ecfdf5', '#d1fae5'] as const,
  },
};

export const AppSpacing = {
  screenX: 'px-4',
  sectionGap: 'mb-5',
  cardPadding: 'p-4',
  cardPaddingLg: 'p-5',
  stackGap: 'gap-3',
  contentBottom: 64,
};

export const AppRadius = {
  card: 'rounded-[20px]',
  panel: 'rounded-[16px]',
  control: 'rounded-[14px]',
  pill: 'rounded-full',
  hero: 'rounded-[24px]',
};

export const AppTypography = {
  heroTitle: 'text-2xl font-black tracking-[-1.5px] leading-7 font-inter-black',
  screenTitle: 'text-xl font-black tracking-tight text-gray-900 font-inter-black',
  sectionTitle: 'text-[15px] font-black tracking-tight text-gray-900 font-inter-black',
  cardTitle: 'text-[15px] font-black tracking-tight text-gray-900 font-inter-black',
  eyebrow: 'text-[10px] font-black uppercase tracking-[2.5px] font-inter-black',
  meta: 'text-[9px] font-black uppercase tracking-widest font-inter-black',
  statValue: 'text-xl font-black tracking-tighter text-gray-900 font-inter-black',
  body: 'text-[13px] font-medium leading-relaxed text-gray-500 font-inter-medium',
};

export const AppShadows = {
  soft: 'shadow-lg shadow-indigo-100/30',
  card: 'shadow-xl shadow-indigo-100/30',
  action: 'shadow-md shadow-indigo-100/20',
};

export const AppTheme = {
  colors: AppColors,
  spacing: AppSpacing,
  radius: AppRadius,
  typography: AppTypography,
  shadows: AppShadows,
  card: {
    base: `bg-white border border-gray-100 ${AppRadius.card} shadow-md shadow-indigo-100/20`,
    interactive: `bg-white border border-gray-100 ${AppRadius.card} shadow-sm shadow-gray-100/50`,
  },
};
