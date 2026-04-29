import React, { useRef } from 'react';
import { Animated, Image, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { styled } from 'nativewind';
import { Icons } from '../../../../components/Icons';
import { UserRole } from '../../../../types';
import { ActionTile, AppCard, AppRow, AppTheme, SectionHeader, StatCard, StatusPill } from '../../../design-system';
import { PlatformStatusBadge } from '../../platform/components/PlatformStatusBadge';
import { formatGreetingName } from '../../../utils/nameUtils';

const StyledLinearGradient = styled(LinearGradient);

const HEADER_MAX_HEIGHT = 220;
const HEADER_MIN_HEIGHT = 100;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

interface HeadmasterHomeProps {
  dbStudents: any[];
  users: any[];
  dbStaff: any[];
  dbClasses: any[];
  announcements: any[];
  onPostNotice?: () => void;
  onShowHistory?: () => void;
  onDeleteNotice?: (id: string) => void;
  onShowNoticeDetail?: (notice: any) => void;
  currentSchool?: any;
  attendanceRate?: string;
  systemLogs?: any[];
  onNavigate?: (tab: string) => void;
  userName?: string;
}

export const HeadmasterHome: React.FC<HeadmasterHomeProps> = ({
  dbStudents = [],
  dbStaff = [],
  dbClasses = [],
  announcements = [],
  onPostNotice,
  onShowHistory,
  onShowNoticeDetail,
  currentSchool,
  attendanceRate = '0%',
  systemLogs = [],
  onNavigate,
  userName = 'Principal',
}) => {
  const scrollY = useRef(new Animated.Value(0)).current;

  const getDynamicGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning,';
    if (hour < 17) return 'Good afternoon,';
    if (hour < 22) return 'Good evening,';
    return 'Working late? Hello,';
  };

  const facultyCount = dbStaff.filter((u) => u.role === UserRole.TEACHER || u.role === UserRole.ADMIN_TEACHER).length;
  const recentActivity = (systemLogs || []).slice(0, 4);
  const openNotices = announcements.length;

  const stats = [
    {
      label: 'Students',
      value: dbStudents.length,
      toneClassName: 'bg-indigo-50',
      icon: <Icons.GraduationCap size={22} color={AppTheme.colors.primary} />,
      onPress: () => onNavigate?.('manage'),
      subtitle: 'School roster',
      subtitleTone: 'info' as const,
    },
    {
      label: 'Faculty',
      value: facultyCount,
      toneClassName: 'bg-orange-50',
      icon: <Icons.Users size={22} color="#ea580c" />,
      onPress: () => onNavigate?.('manage'),
      subtitle: 'Teaching staff',
      subtitleTone: 'warning' as const,
    },
    {
      label: 'Classes',
      value: dbClasses.length,
      toneClassName: 'bg-emerald-50',
      icon: <Icons.BookOpen size={22} color={AppTheme.colors.success} />,
      onPress: () => onNavigate?.('manage'),
      subtitle: 'Class units',
      subtitleTone: 'success' as const,
    },
    {
      label: 'Attendance',
      value: attendanceRate,
      toneClassName: 'bg-blue-50',
      icon: <Icons.Calendar size={22} color={AppTheme.colors.info} />,
      onPress: undefined,
      subtitle: 'Live rate',
      subtitleTone: 'info' as const,
    },
  ];

  const headerHeight = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
    extrapolate: 'clamp',
  });

  const headerZindex = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [0, 1000],
    extrapolate: 'clamp',
  });

  const greetingOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
    outputRange: [1, 0.45, 0],
    extrapolate: 'clamp',
  });

  const logoScale = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [1, 0.8],
    extrapolate: 'clamp',
  });

  const brandTranslate = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [0, -10],
    extrapolate: 'clamp',
  });

  return (
    <View className="flex-1 bg-[#f5f7ff]">
      <Animated.View style={{ height: headerHeight, zIndex: headerZindex, position: 'absolute', top: 0, left: 0, right: 0, paddingHorizontal: 16, paddingTop: 16 }}>
        <StyledLinearGradient
          colors={AppTheme.colors.gradients.brand}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="flex-1 rounded-[28px] p-6 shadow-xl shadow-indigo-100 relative overflow-hidden"
        >
          <Animated.View style={{ transform: [{ translateY: brandTranslate }] }} className="flex-row items-center relative z-10">
            <Animated.View style={{ transform: [{ scale: logoScale }] }} className="w-16 h-16 bg-white/20 rounded-2xl items-center justify-center mr-4 border border-white/30">
              {currentSchool?.logo_url ? (
                <Image source={{ uri: currentSchool.logo_url }} style={{ width: '100%', height: '100%', borderRadius: 16 }} resizeMode="cover" />
              ) : (
                <Icons.School size={32} color="white" />
              )}
            </Animated.View>
            <View className="flex-1">
              <Text className="text-2xl font-black text-white tracking-tighter leading-7 font-inter-black">
                {currentSchool?.name || 'School Dashboard'}
              </Text>
              <Text className="text-indigo-100 text-[10px] font-black uppercase tracking-[3px] mt-1 opacity-85 font-inter-black">Principal&apos;s Office</Text>
            </View>
          </Animated.View>

          <Animated.View style={{ opacity: greetingOpacity }} className="relative z-10 mt-6">
            <Text className="text-white text-xl font-black tracking-tighter leading-8 font-inter-black">{getDynamicGreeting()}</Text>
            <Text className="text-3xl font-black text-yellow-300 tracking-tight leading-none mt-1 font-inter-black">{formatGreetingName(userName, 'Principal')}!</Text>
          </Animated.View>

          <View className="absolute right-[-20] bottom-[-20] opacity-10 rotate-12">
            <Icons.Shield size={160} color="white" />
          </View>
        </StyledLinearGradient>
      </Animated.View>

      <Animated.ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
        contentContainerStyle={{ paddingTop: HEADER_MAX_HEIGHT + 24, paddingHorizontal: 16, paddingBottom: 60 }}
      >
        <View className="flex-row flex-wrap justify-between mb-4">
          {stats.map((stat) => (
            <TouchableOpacity key={stat.label} onPress={stat.onPress} className="w-[48.2%] mb-4">
              <StatCard
                value={stat.value}
                label={stat.label}
                icon={stat.icon}
                toneClassName={stat.toneClassName}
                pill={<StatusPill label={stat.subtitle} type={stat.subtitleTone} className="self-center" />}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Section: School Notices */}
        <View className="mb-6">
          <SectionHeader
            title="SCHOOL NOTICES"
            className="px-2"
            rightElement={
              <StatusPill 
                label={`${announcements.length} Total`} 
                type="info" 
              />
            }
          />
          <AppCard className="p-0 overflow-hidden border border-white shadow-xl shadow-indigo-100/30">
            {announcements.slice(0, 3).map((a, idx) => (
              <AppRow
                key={a.id || idx}
                title={a.title}
                subtitle={a.message || 'No description provided'}
                meta={a.date}
                avatarIcon={<Icons.Notifications size={15} color="#4f46e5" />}
                avatarBg="#eef2ff"
                onPress={() => onShowNoticeDetail?.(a)}
                showBorder={idx < announcements.slice(0, 3).length - 1}
                className="px-0"
              />
            ))}

            {announcements.length === 0 ? (
              <View className="items-center py-10">
                <View className="w-14 h-14 rounded-full bg-gray-50 items-center justify-center mb-4 border border-gray-100">
                  <Icons.Notifications size={24} color="#cbd5e1" />
                </View>
                <Text className="text-sm font-black text-gray-900 font-inter-black">No active bulletins</Text>
                <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1 font-inter-black">The notice board is clear</Text>
              </View>
            ) : (
              <TouchableOpacity 
                onPress={onShowHistory}
                className="py-4 border-t border-gray-50 items-center bg-gray-50/30"
              >
                <Text className="text-[10px] font-black text-indigo-600 uppercase tracking-widest font-inter-black">View All Notices</Text>
              </TouchableOpacity>
            )}
          </AppCard>
        </View>

        {/* Section: Growth Overview */}
        <View className="mb-6">
          <SectionHeader
            title="GROWTH OVERVIEW"
            className="px-2"
            rightElement={<PlatformStatusBadge status={attendanceRate} label={attendanceRate} type="success" />}
          />
          <AppCard className="p-5">
            <View className="h-44 flex-row items-end justify-between px-2 relative mt-2">
              <View className="absolute inset-0 justify-between py-1 opacity-5">
                {[1, 2, 3, 4].map((i) => <View key={i} className="h-[1px] bg-gray-900 w-full" />)}
              </View>

              {[0.6, 0.8, 0.4, 0.9, 0.7, 0.85, 0.95].map((val, i) => (
                <View key={i} className="items-center flex-1">
                  <View className="relative w-8 items-center justify-end h-full">
                    <View className="absolute inset-0 bg-gray-50/80 rounded-t-2xl w-full" />
                    <StyledLinearGradient
                      colors={i === 6 ? AppTheme.colors.gradients.brand : ['#e0e7ff', '#c7d2fe']}
                      className="w-8 rounded-t-2xl shadow-lg shadow-indigo-100"
                      style={{ height: `${val * 100}%` }}
                    />
                  </View>
                  <Text className="text-[9px] text-gray-400 font-black mt-4 uppercase tracking-tighter font-inter-black">{['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}</Text>
                </View>
              ))}
            </View>
          </AppCard>
        </View>

        {/* Section: Activity Log */}
        <View className="mb-10">
          <SectionHeader
            title="ACTIVITY LOG"
            className="px-2"
            rightElement={
              <StatusPill 
                label={`${recentActivity.length} Recent`} 
                type="neutral" 
              />
            }
          />
          <AppCard className="p-0 overflow-hidden border border-white shadow-xl shadow-indigo-100/30">
            {recentActivity.map((item, idx) => {
              const ActivityIcon = (Icons as any)[item.icon] || Icons.Activity;
              const category = item.category || 'SYSTEM';
              const catPillType = 
                category === 'SECURITY' ? 'danger' : 
                category === 'BILLING' ? 'warning' : 
                category === 'ACADEMIC' ? 'info' : 'neutral';
              
              const timeStr = item.created_at ? new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now';
              const dateStr = item.created_at ? new Date(item.created_at).toLocaleDateString([], { month: 'short', day: '2-digit' }) : 'Today';

              return (
                <AppRow
                  key={item.id || idx}
                  title={item.title}
                  subtitle={`${dateStr} · ${timeStr}`}
                  statusDot={
                    category === 'SECURITY' ? 'danger' :
                    category === 'BILLING'  ? 'pending' : 'none'
                  }
                  avatarIcon={<ActivityIcon size={14} color={item.color || AppTheme.colors.primary} />}
                  avatarBg={item.color ? `${item.color}18` : '#eef2ff'}
                  pills={<StatusPill label={category} type={catPillType} />}
                  rightElement={<Icons.ChevronRight size={13} color="#d1d5db" />}
                  showBorder={idx < recentActivity.length - 1}
                  className="px-0"
                />
              );
            })}

            {recentActivity.length === 0 ? (
              <View className="items-center py-10">
                <View className="w-14 h-14 rounded-full bg-gray-50 items-center justify-center mb-4 border border-gray-100">
                  <Icons.Activity size={24} color="#cbd5e1" />
                </View>
                <Text className="text-sm font-black text-gray-900 font-inter-black">No recent activity</Text>
                <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1 font-inter-black">School operations are quiet</Text>
              </View>
            ) : (
              <TouchableOpacity 
                onPress={() => onNavigate?.('settings')}
                className="py-4 border-t border-gray-50 items-center bg-gray-50/30"
              >
                <Text className="text-[10px] font-black text-indigo-600 uppercase tracking-widest font-inter-black">View All Activity</Text>
              </TouchableOpacity>
            )}
          </AppCard>
        </View>
      </Animated.ScrollView>
    </View>
  );
};
