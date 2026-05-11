import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Icons } from './Icons';
import { AppRow } from './AppRow';
import { AppTheme, AppTypography } from '@constants/Theme';
import Animated, { FadeInDown } from 'react-native-reanimated';

export type AnnouncementCategory = 'urgent' | 'academic' | 'event' | 'general';

interface AnnouncementCardProps {
  id: string;
  title: string;
  message: string;
  date: string;
  category?: AnnouncementCategory;
  senderName?: string;
  isNew?: boolean;
  index?: number;
  onPress?: () => void;
  onDelete?: () => void;
  showDelete?: boolean;
}

const CATEGORY_CONFIG: Record<AnnouncementCategory, { icon: React.ReactNode, color: string, bg: string }> = {
  urgent: { 
    icon: <Icons.AlertCircle size={15} color="#e11d48" />, 
    color: '#e11d48', 
    bg: '#fff1f2' 
  },
  academic: { 
    icon: <Icons.BookOpen size={15} color="#4f46e5" />, 
    color: '#4f46e5', 
    bg: '#eef2ff' 
  },
  event: { 
    icon: <Icons.Calendar size={15} color="#059669" />, 
    color: '#059669', 
    bg: '#ecfdf5' 
  },
  general: { 
    icon: <Icons.Notifications size={15} color="#0ea5e9" />, 
    color: '#0ea5e9', 
    bg: '#f0f9ff' 
  },
};

/**
 * AnnouncementCard - The master component for institutional notices.
 * Standardizes layout, animations, and priority-based styling.
 */
export const AnnouncementCard: React.FC<AnnouncementCardProps> = ({
  title,
  message,
  date,
  category = 'general',
  senderName,
  isNew = false,
  index = 0,
  onPress,
  onDelete,
  showDelete = false,
}) => {
  const config = CATEGORY_CONFIG[category];

  return (
    <Animated.View 
      entering={FadeInDown.delay(index * 100).duration(500)}
    >
      <AppRow
        title={title}
        subtitle={
          <View className="mt-0.5">
            <Text 
              className="text-[11px] font-inter-medium text-gray-500 leading-relaxed"
              numberOfLines={2}
            >
              {message}
            </Text>
            {senderName && (
              <View className="flex-row items-center mt-1.5">
                <View className="bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100/50 flex-row items-center">
                  <Icons.User size={8} color="#6366f1" />
                  <Text className="text-[8px] font-inter-black text-indigo-600 uppercase tracking-tight ml-1">
                    Posted by {senderName}
                  </Text>
                </View>
              </View>
            )}
          </View>
        }
        meta={date}
        avatarIcon={config.icon}
        avatarBg={config.bg}
        onPress={onPress}
        rightElement={
          showDelete ? (
            <TouchableOpacity
              onPress={onDelete}
              className="bg-rose-50 border border-rose-100 px-3 py-1.5 rounded-xl active:bg-rose-100"
            >
              <Text className="text-[9px] font-black text-rose-500 uppercase tracking-widest font-inter-black">Delete</Text>
            </TouchableOpacity>
          ) : (
            <Icons.ChevronRight size={13} color="#d1d5db" />
          )
        }
      />
    </Animated.View>
  );
};
