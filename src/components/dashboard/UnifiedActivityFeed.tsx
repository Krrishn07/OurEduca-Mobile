import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Icons } from '@components/common/Icons';
import { useSchoolData, SystemLog } from '@context/SchoolDataContext';
import { useMockAuth } from '@context/MockAuthContext';
import { AppCard } from '@components/common/AppCard';

interface UnifiedActivityFeedProps {
  limit?: number;
  showTitle?: boolean;
  emptyMessage?: string;
  variant?: 'light' | 'dark';
  searchQuery?: string;
  activeCategory?: string;
  onViewAll?: () => void;
  enablePagination?: boolean;
}

const CATEGORY_LABELS: Record<string, string> = {
    'SYSTEM':      'System',
    'INSTITUTION': 'School',
    'ACADEMIC':    'Academic',
    'ATTENDANCE':  'Attendance',
    'FEES':        'Fees',
    'MESSAGES':    'Messages',
    'SECURITY':    'Security',
    'BILLING':     'Billing'
};

const ACTIVITY_ICON_MAP: Record<string, any> = {
    'Bell':        Icons.Bell,
    'FileText':    Icons.FileText,
    'CheckSquare': Icons.CheckSquare,
    'Users':       Icons.Users,
    'BookOpen':    Icons.BookOpen,
    'LogIn':       Icons.LogIn,
    'Video':       Icons.Video,
    'CreditCard':  Icons.CreditCard,
    'MessageSquare': Icons.MessageSquare,
    'Trash':       Icons.Trash,
    'Shield':      Icons.Shield,
    'Activity':    Icons.Activity,
    // Semantic mappings
    'notice':      Icons.Bell,
    'assignment':  Icons.FileText,
    'grade':       Icons.CheckSquare,
    'attendance':  Icons.Users,
    'material':    Icons.BookOpen,
    'fee':         Icons.CreditCard,
    'security':    Icons.Shield,
};

const formatLogTime = (isoString: string): string => {
    if (!isoString) return '--:--';
    const d = new Date(isoString);
    return d.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
    });
};

const getRelativeDateHeader = (dateString: string): string => {
    const d = new Date(dateString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (d.toDateString() === today.toDateString()) return 'TODAY';
    if (d.toDateString() === yesterday.toDateString()) return 'YESTERDAY';
    
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase();
};

/**
 * UnifiedActivityFeed - The Single Point of Control for all audit logs.
 */
export const UnifiedActivityFeed: React.FC<UnifiedActivityFeedProps> = ({ 
  limit,
  showTitle = true,
  emptyMessage = "No recent activity found.",
  variant = 'light',
  searchQuery = '',
  activeCategory = 'ALL',
  onViewAll,
  enablePagination = false
}) => {
  const { systemLogs, dbRoster, fetchSystemLogs } = useSchoolData();
  const { currentUser, currentSchool } = useMockAuth();
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const isDark = variant === 'dark';
  const handleLoadMore = async () => {
    if (isLoadingMore) return;
    setIsLoadingMore(true);
    try {
        await fetchSystemLogs(currentSchool?.id || undefined, systemLogs.length);
    } finally {
        setIsLoadingMore(false);
    }
  };
  const textColor = isDark ? 'text-white' : 'text-gray-900';
  const subtextColor = isDark ? 'text-slate-400' : 'text-gray-400';
  const cardBg = isDark ? 'bg-slate-800/50' : 'bg-white';
  const cardBorder = isDark ? 'border-slate-700' : 'border-white';

  const filteredLogs = useMemo(() => {
    if (!currentUser) return [];

    // TACTICAL Context Detection for Teachers
    const isTeacher = currentUser.role === 'teacher' || currentUser.role === 'mentor';
    let myClassIds: string[] = [];
    let myStudentIds: string[] = [];

    if (isTeacher) {
        // Find classes where current user is a teacher/mentor
        myClassIds = dbRoster
            .filter(r => r.user_id === currentUser.id && (r.role_in_class === 'teacher' || r.role_in_class === 'mentor'))
            .map(r => r.class_id);
        
        // Find students in those classes
        myStudentIds = dbRoster
            .filter(r => myClassIds.includes(r.class_id) && r.role_in_class === 'student')
            .map(r => r.user_id);
    }

    let logs = systemLogs.filter(log => {
      // A. Privacy Hierarchy
      const isPlatform = currentUser.role === 'platform';
      const isAdmin = currentUser.role === 'admin' || currentUser.role === 'headmaster';
      const isOwner = log.user_id === currentUser.id;
      const isMyStudentLog = isTeacher && myStudentIds.includes(log.user_id || '');

      // Teachers see their own logs + logs of students in their classes
      if (!isPlatform && !isAdmin && !isOwner && !isMyStudentLog) return false;

      // B. Search Filter
      if (searchQuery && !log.title?.toLowerCase().includes(searchQuery.toLowerCase())) {
          return false;
      }

      // C. Category Filter
      if (activeCategory !== 'ALL' && log.category !== activeCategory) {
          return false;
      }

      return true;
    });

    return limit ? logs.slice(0, limit) : logs;
  }, [systemLogs, currentUser, dbRoster, limit, searchQuery, activeCategory]);

  const groupedLogs = useMemo(() => {
    const groups: { dateKey: string; logs: SystemLog[] }[] = [];
    const map = new Map<string, SystemLog[]>();

    filteredLogs.forEach(log => {
      const d = new Date(log.created_at || Date.now());
      const key = d.toDateString();
      if (!map.has(key)) {
        map.set(key, []);
        groups.push({ dateKey: key, logs: map.get(key)! });
      }
      map.get(key)!.push(log);
    });

    return groups;
  }, [filteredLogs]);

  return (
    <View className="w-full">
      {showTitle && (
        <View className="flex-row items-center justify-between mb-5 px-2">
          <View>
            <Text className={`text-[11px] font-inter-black ${isDark ? 'text-slate-400' : 'text-gray-400'} uppercase tracking-[2px]`}>
              {currentUser?.role === 'admin' || currentUser?.role === 'headmaster' || currentUser?.role === 'platform' ? 'Institutional Audit' : 'Professional Activity'}
            </Text>
            <View className="h-1 w-8 bg-indigo-500 rounded-full mt-1" />
          </View>

          {onViewAll && (
            <TouchableOpacity 
              onPress={onViewAll}
              activeOpacity={0.7}
              className="flex-row items-center bg-indigo-600 px-4 py-2 rounded-xl shadow-sm shadow-indigo-200"
            >
              <Text className="text-[10px] font-inter-black text-white uppercase tracking-widest mr-1">View All</Text>
              <Icons.ChevronRight size={10} color="white" />
            </TouchableOpacity>
          )}
        </View>
      )}

      {filteredLogs.length === 0 ? (
        <View className="items-center justify-center py-12 px-6 bg-white/50 rounded-[32px] border border-dashed border-gray-200">
          <View className="w-14 h-14 bg-gray-50 rounded-2xl items-center justify-center mb-4 border border-gray-100">
            <Icons.Activity size={24} color="#cbd5e1" />
          </View>
          <Text className="text-gray-400 text-[10px] font-inter-black text-center uppercase tracking-widest leading-4 px-4">
            {emptyMessage}
          </Text>
        </View>
      ) : (
        <>
          {groupedLogs.map(({ dateKey, logs }) => (
        <View key={dateKey} className="mb-6">
          <View className="px-2 mb-3 flex-row items-center">
            <View className={`h-[1px] flex-1 ${isDark ? 'bg-slate-700' : 'bg-gray-100'}`} />
            <Text className={`mx-3 text-[9px] font-inter-black ${subtextColor} tracking-[2px]`}>
              {getRelativeDateHeader(dateKey)}
            </Text>
            <View className={`h-[1px] flex-1 ${isDark ? 'bg-slate-700' : 'bg-gray-100'}`} />
          </View>

          <AppCard className={`overflow-hidden ${cardBg} ${cardBorder} shadow-sm p-0`}>
            {logs.map((log, idx) => {
              const timeStr = formatLogTime(log.created_at);
              const IconComp = ACTIVITY_ICON_MAP[log.icon] || Icons.Activity;
              const isLast = idx === logs.length - 1;

              return (
                <View key={log.id}>
                  <TouchableOpacity 
                    className="flex-row items-center p-4 active:bg-gray-50/50"
                  >
                    <View 
                      className="w-10 h-10 rounded-xl items-center justify-center mr-4"
                      style={{ backgroundColor: `${log.color}${isDark ? '25' : '15'}` }}
                    >
                      <IconComp size={18} color={log.color} />
                    </View>
                    
                    <View className="flex-1">
                      <Text className={`${textColor} font-inter-bold text-[13px] mb-0.5`} numberOfLines={1}>
                        {log.title}
                      </Text>
                      <View className="flex-row items-center">
                        <Text className={`${subtextColor} text-[10px] font-inter-medium uppercase tracking-wider`}>
                          {CATEGORY_LABELS[log.category] ?? log.category} • {timeStr}
                        </Text>
                      </View>
                    </View>

                    <Icons.ChevronRight size={14} color={isDark ? '#475569' : '#cbd5e1'} />
                  </TouchableOpacity>
                  {!isLast && <View className={`h-[1px] mx-4 ${isDark ? 'bg-slate-700' : 'bg-gray-50'}`} />}
                </View>
              );
            })}
          </AppCard>
        </View>
        ))}

        {enablePagination && filteredLogs.length > 0 && (
            <TouchableOpacity 
                onPress={handleLoadMore}
                disabled={isLoadingMore}
                className={`mt-4 py-3 rounded-2xl items-center justify-center ${isDark ? 'bg-slate-800' : 'bg-white'} border ${isDark ? 'border-slate-700' : 'border-gray-100'}`}
            >
                {isLoadingMore ? (
                    <ActivityIndicator size="small" color="#6366f1" />
                ) : (
                    <Text className="text-[10px] font-inter-bold text-indigo-500 uppercase tracking-widest">Load More Activities</Text>
                )}
            </TouchableOpacity>
        )}
        </>
      )}
    </View>
  );
};
