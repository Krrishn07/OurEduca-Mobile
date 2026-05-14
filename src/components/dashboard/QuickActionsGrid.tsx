import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Icons } from '@components/common/Icons';
import { SectionHeader } from '@components/common';
import * as Haptics from 'expo-haptics';

interface ActionItem {
  label: string;
  icon: React.ReactNode;
  bg: string;
  text: string;
  action: string;
  subtitle?: string;
}

interface QuickActionsGridProps {
  role: 'teacher' | 'mentor' | 'admin' | string;
  onAction: (action: string) => void;
  title?: string;
  className?: string;
}

export const QuickActionsGrid: React.FC<QuickActionsGridProps> = ({ 
  role, 
  onAction, 
  title = "QUICK ACTIONS",
  className = "" 
}) => {
  const triggerHaptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const getActions = (): ActionItem[] => {
    const baseActions: ActionItem[] = [
      { label: 'Add Lesson', icon: <Icons.Plus size={24} color="#4f46e5" />, bg: 'bg-indigo-50', text: 'text-indigo-900', action: 'Upload Material' },
      { label: 'Notice', icon: <Icons.Notifications size={24} color="#f59e0b" />, bg: 'bg-amber-50', text: 'text-amber-900', action: 'Post Announcement' },
      { label: 'Assignment', icon: <Icons.Plus size={24} color="#8b5cf6" />, bg: 'bg-violet-50', text: 'text-violet-900', action: 'Create Assignment' },
      { label: 'Grade Work', icon: <Icons.Check size={24} color="#10b981" />, bg: 'bg-emerald-50', text: 'text-emerald-900', action: 'Grade Quiz' },
      { label: 'Performance Analytics', icon: <Icons.BarChart2 size={24} color="#0ea5e9" />, bg: 'bg-sky-50', text: 'text-sky-900', action: 'View Report', subtitle: 'Deep-Dive Institutional Insights' },
    ];

    if (role.toLowerCase() === 'mentor' || role.toLowerCase() === 'admin_teacher') {
      return [
        { label: 'Class Roster', icon: <Icons.Users size={24} color="#6366f1" />, bg: 'bg-indigo-50', text: 'text-indigo-900', action: 'Class Roster' },
        { label: 'Attendance Hub', icon: <Icons.CheckCircle size={24} color="#10b981" />, bg: 'bg-emerald-50', text: 'text-emerald-900', action: 'Attendance Hub' },
        { label: 'Post Notice', icon: <Icons.Notifications size={24} color="#f59e0b" />, bg: 'bg-amber-50', text: 'text-amber-900', action: 'Post Announcement' },
        { label: 'Share Material', icon: <Icons.Plus size={24} color="#4f46e5" />, bg: 'bg-indigo-50', text: 'text-indigo-900', action: 'Upload Material' },
        { label: 'Assignment', icon: <Icons.Plus size={24} color="#8b5cf6" />, bg: 'bg-violet-50', text: 'text-violet-900', action: 'Create Assignment' },
        { label: 'Grade Work', icon: <Icons.Check size={24} color="#10b981" />, bg: 'bg-emerald-50', text: 'text-emerald-900', action: 'Grade Quiz' },
        { label: 'Verification Hub', icon: <Icons.ShieldCheck size={24} color="#6366f1" />, bg: 'bg-indigo-50', text: 'text-indigo-900', action: 'Verification Hub' },
        { label: 'Class Reports', icon: <Icons.FileText size={24} color="#0ea5e9" />, bg: 'bg-sky-50', text: 'text-sky-900', action: 'View Report', subtitle: 'Generate Institutional Analytics' },
      ];
    }

    if (role.toLowerCase() === 'student') {
      return [
        { label: 'Submit Task', icon: <Icons.Plus size={24} color="#8b5cf6" />, bg: 'bg-violet-50', text: 'text-violet-900', action: 'quick_submit' },
        { label: 'Ask Question', icon: <Icons.MessageSquare size={24} color="#4f46e5" />, bg: 'bg-indigo-50', text: 'text-indigo-900', action: 'quick_query' },
        { label: 'Settle Fees', icon: <Icons.Report size={24} color="#ef4444" />, bg: 'bg-rose-50', text: 'text-rose-900', action: 'quick_pay' },
        { label: 'Academic Standing', icon: <Icons.Verified size={24} color="#0ea5e9" />, bg: 'bg-sky-50', text: 'text-sky-900', action: 'reports', subtitle: 'Personal Growth & Progress' },
      ];
    }

    return baseActions;
  };

  const actions = getActions();

  return (
    <View className={`${className}`}>
      <SectionHeader title={title} className="" />
      <View className="flex-row flex-wrap justify-between gap-y-4">
        {actions.map((item, idx) => {
          // In the teacher/mentor grid, usually the last item is featured or items are paired.
          // For Mentor (7 items): Row 1 (2), Row 2 (2), Row 3 (2), Row 4 (1 full)
          // For Teacher (5 items): Row 1 (2), Row 2 (2), Row 3 (1 full)
          const isFullWidth = actions.length % 2 !== 0 && idx === actions.length - 1; 

          return (
            <TouchableOpacity
              key={`${role}-action-${idx}`}
              onPress={() => {
                triggerHaptic();
                onAction(item.action);
              }}
              activeOpacity={0.7}
              className={`${isFullWidth ? 'w-full py-6 flex-row' : 'w-[48%] aspect-square flex-col'} justify-center items-center ${item.bg} rounded-[16px] border border-white shadow-sm active:scale-95`}
            >
              <View className={`bg-white/90 p-3 rounded-2xl shadow-md shadow-indigo-100/20 ${isFullWidth ? 'mr-4' : 'mb-3'}`}>
                {item.icon}
              </View>
              <View className={isFullWidth ? 'items-start' : 'items-center'}>
                <Text className={`text-[10px] font-inter-bold ${item.text} uppercase tracking-[1px] text-center px-2`}>
                  {item.label}
                </Text>
                {isFullWidth && item.subtitle && (
                  <Text className="text-[10px] text-gray-400 uppercase tracking-[1px] mt-1 font-inter-bold">
                    {item.subtitle}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};
