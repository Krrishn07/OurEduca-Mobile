import React from 'react';
import { Text, View, ViewProps } from 'react-native';

type PillType =
  | 'success'   // emerald — Active, Paid, Online
  | 'warning'   // amber   — Pending, Review
  | 'danger'    // rose    — Overdue, Error, Offline
  | 'info'      // blue    — informational
  | 'enterprise'// amber   — Enterprise plan
  | 'pro'       // indigo  — Pro plan
  | 'neutral';  // gray    — Basic, default

interface StatusPillProps extends ViewProps {
  label: string;
  type?: PillType;
  className?: string;
}

const PILL_STYLES: Record<PillType, { bg: string; border: string; text: string }> = {
  success:    { bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-700' },
  warning:    { bg: 'bg-amber-50',   border: 'border-amber-100',   text: 'text-amber-700'   },
  danger:     { bg: 'bg-rose-50',    border: 'border-rose-100',    text: 'text-rose-700'    },
  info:       { bg: 'bg-blue-50',    border: 'border-blue-100',    text: 'text-blue-700'    },
  enterprise: { bg: 'bg-amber-50',   border: 'border-amber-100',   text: 'text-amber-600'   },
  pro:        { bg: 'bg-indigo-50',  border: 'border-indigo-100',  text: 'text-indigo-600'  },
  neutral:    { bg: 'bg-gray-50',    border: 'border-gray-200',    text: 'text-gray-500'    },
};

export const StatusPill: React.FC<StatusPillProps> = ({
  label,
  type = 'neutral',
  className = '',
  ...props
}) => {
  const { bg, border, text } = PILL_STYLES[type];
  return (
    <View
      className={`px-2 py-0.5 rounded-full border self-start ${bg} ${border} ${className}`}
      {...props}
    >
      <Text className={`text-[8px] font-black uppercase tracking-widest ${text} font-inter-black`}>
        {label}
      </Text>
    </View>
  );
};

/** Infer pill type from a raw status string */
export const inferPillType = (status: string): PillType => {
  const s = status?.toLowerCase() ?? '';
  if (['active', 'paid', 'online', 'verified'].includes(s))   return 'success';
  if (['pending', 'review', 'new'].includes(s))                return 'warning';
  if (['overdue', 'error', 'offline', 'suspended'].includes(s)) return 'danger';
  if (['enterprise'].includes(s))                              return 'enterprise';
  if (['pro'].includes(s))                                     return 'pro';
  return 'neutral';
};
