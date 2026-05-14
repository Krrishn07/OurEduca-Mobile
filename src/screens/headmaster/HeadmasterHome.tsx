import React, { useRef } from 'react';
import { Animated, Image, Text, TouchableOpacity, View, Platform, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { styled } from 'nativewind';
import { Icons } from '@components/common/Icons';
import { UserRole } from '@/types';
import { ActionTile, AppCard, AppRow, AppTheme, SectionHeader, StatCard, StatusPill, AnnouncementCard, CalendarWidget, PlatinumChart } from '@components/common';
import { PlatformStatusBadge } from '@screens/platform/components/PlatformStatusBadge';
import { formatGreetingName } from '@utils/nameUtils';
import { UnifiedActivityFeed } from '@components/dashboard/UnifiedActivityFeed';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


const StyledLinearGradient = styled(LinearGradient || View);

const HEADER_MIN_HEIGHT = Platform.OS === 'ios' ? 100 : 80;

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
  onShowActivityLog?: () => void;
  currentUser: any;
  userName?: string;
  onRefresh?: () => void;
  refreshing?: boolean;
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
  onShowActivityLog,
  onDeleteNotice,
  currentUser,
  userName = 'Principal',
  onRefresh,
  refreshing = false
}) => {
  const insets = useSafeAreaInsets();
  const HEADER_MAX_HEIGHT = insets.top + 260;
  const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

  const scrollY = useRef(new Animated.Value(0)).current;

  const getDynamicGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning,';
    if (hour < 17) return 'Good afternoon,';
    if (hour < 22) return 'Good evening,';
    return 'Working late? Hello,';
  };

  const facultyCount = dbStaff.filter((u) => u.role === UserRole.TEACHER || u.role === UserRole.ADMIN_TEACHER).length;

  const stats = [
    {
      label: 'Students',
      value: dbStudents.length,
      toneClassName: 'bg-indigo-50',
      icon: <Icons.GraduationCap size={22} color={AppTheme.colors.primary} />,
      onPress: () => onNavigate?.('manage'),
      trend: dbStudents.length > 0 ? 'Tracking' : 'Empty',
      trendType: 'neutral' as const,
    },
    {
      label: 'Faculty',
      value: facultyCount,
      toneClassName: 'bg-orange-50',
      icon: <Icons.Users size={22} color="#ea580c" />,
      onPress: () => onNavigate?.('manage'),
      trend: facultyCount > 0 ? 'Active' : 'Missing',
      trendType: 'neutral' as const,
    },
    {
      label: 'Classes',
      value: dbClasses.length,
      toneClassName: 'bg-emerald-50',
      icon: <Icons.BookOpen size={22} color={AppTheme.colors.success} />,
      onPress: () => onNavigate?.('manage'),
      trend: dbClasses.length > 0 ? 'Synced' : 'None',
      trendType: 'up' as const,
    },
    {
      label: 'Attendance',
      value: attendanceRate,
      toneClassName: 'bg-blue-50',
      icon: <Icons.Calendar size={22} color={AppTheme.colors.info} />,
      onPress: undefined,
      trend: parseFloat(attendanceRate) > 90 ? 'Optimal' : parseFloat(attendanceRate) < 75 ? 'Review' : 'Stable',
      trendType: parseFloat(attendanceRate) > 90 ? 'up' : parseFloat(attendanceRate) < 75 ? 'down' : 'neutral' as const,
    },
  ];

  const headerHeight = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
    extrapolate: 'clamp',
  });

  const headerZindex = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [10, 100],
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
      <Animated.View
        style={{
          height: headerHeight,
          zIndex: headerZindex,
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          paddingHorizontal: 16,
          paddingTop: insets.top + 8,
        }}
      >
        <StyledLinearGradient
          colors={AppTheme.colors.gradients.brand}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="flex-1 rounded-[16px] p-5 shadow-xl shadow-indigo-200 relative overflow-hidden"
        >
          <Animated.View style={{ transform: [{ translateY: brandTranslate }] }} className="flex-row items-center justify-between relative z-10">
            <View className="flex-row items-center flex-1 mr-4">
              <Animated.View style={{ transform: [{ scale: logoScale }] }} className="w-14 h-14 bg-white/20 rounded-2xl items-center justify-center mr-4 border border-white/30 flex-none">
                {currentSchool?.logo_url ? (
                  <Image
                    source={{ uri: currentSchool.logo_url }}
                    style={{ width: '100%', height: '100%', borderRadius: 16 }}
                    resizeMode="cover"
                  />
                ) : (
                  <Icons.School size={20} color="white" />
                )}
              </Animated.View>
              <View className="flex-1">
                <Text className="text-[18px] text-white tracking-tighter leading-6 font-inter-black" numberOfLines={1}>
                  {currentSchool?.name || 'Headmaster Portal'}
                </Text>
                <Text className="text-white text-[9px] uppercase tracking-[2px] opacity-90 font-inter-black">Institutional Command</Text>
              </View>
            </View>

            <TouchableOpacity 
                onPress={() => onShowHistory?.()}
                className="w-10 h-10 rounded-full bg-white/10 items-center justify-center border border-white/20 flex-none"
            >
                <Icons.Notifications size={16} color="white" />
            </TouchableOpacity>
          </Animated.View>

          <Animated.View style={{ opacity: greetingOpacity }} className="relative z-10 mt-3">
            <View>
                <Text className="text-white/90 text-[9px] uppercase tracking-[2px] mb-0.5 font-inter-black">Academy Workflow</Text>
                <Text className="text-white text-[20px] tracking-tighter leading-7 font-inter-black">{getDynamicGreeting()}</Text>
                <Text className="text-[26px] text-brand-accent tracking-tighter leading-8 font-inter-black">
                    {formatGreetingName(currentUser?.name || userName, 'Principal')}!
                </Text>
                
                {/* Natural Language Status Sentence with Dynamic Highlighting */}
                <Text 
                    className="text-[14px] text-white mt-2.5 leading-6 font-inter-medium opacity-95"
                    style={{ maxWidth: '95%' }}
                >
                    Currently managing <Text className="text-brand-accent font-inter-black">{dbStudents.length}</Text> students, 
                    <Text className="text-brand-accent font-inter-black"> {facultyCount}</Text> faculty members, 
                    and <Text className="text-brand-accent font-inter-black">{announcements.length}</Text> active bulletins.
                </Text>
            </View>
          </Animated.View>

          <View style={{ position: 'absolute', right: -40, bottom: -30, opacity: 0.05, transform: [{ rotate: '12deg' }] }}>
            <Icons.Shield size={140} color="white" />
          </View>
        </StyledLinearGradient>
      </Animated.View>

      <Animated.ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
        contentContainerStyle={{ paddingTop: HEADER_MAX_HEIGHT + 24, paddingHorizontal: 16, paddingBottom: 60 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={AppTheme.colors.primary}
            colors={[AppTheme.colors.primary]}
            progressViewOffset={HEADER_MAX_HEIGHT}
          />
        }
      >
        {/* Quick Actions Row */}
        <View className="flex-row gap-3 mb-6">
          <ActionTile
            label="Post Notice"
            icon={<Icons.Plus size={18} color="white" />}
            toneClassName="bg-indigo-600 border-indigo-500 shadow-lg shadow-indigo-100/50"
            iconShellClassName="bg-white/15 border-white/20"
            textClassName="text-white"
            className="py-4"
            onPress={onPostNotice}
          />
          <ActionTile
            label="View Activities"
            icon={<Icons.Activity size={18} color="#4f46e5" />}
            toneClassName="bg-white border-gray-100 shadow-md shadow-indigo-100/20"
            iconShellClassName="bg-indigo-50 border-indigo-100"
            textClassName="text-indigo-700"
            className="py-4"
            onPress={onShowActivityLog}
          />
        </View>

        <View className="flex-row flex-wrap justify-between mb-4 gap-y-4">
          {stats.map((stat, idx) => {
            const mappedTone = 
              stat.toneClassName === 'bg-indigo-50' ? 'indigo' :
              stat.toneClassName === 'bg-orange-50' ? 'amber' :
              stat.toneClassName === 'bg-emerald-50' ? 'emerald' :
              stat.toneClassName === 'bg-blue-50' ? 'blue' : 'indigo';

            return (
              <View key={`headmaster-stat-${idx}`} className="w-[48%]">
                <StatCard
                  index={idx}
                  value={stat.value}
                  label={stat.label}
                  icon={stat.icon}
                  tone={mappedTone as any}
                  trend={(stat as any).trend}
                  trendType={(stat as any).trendType}
                  onPress={stat.onPress}
                />
              </View>
            );
          })}
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
            {announcements.slice(0, 3).map((a: any, idx: number) => {
              const diff = Date.now() - new Date(a.date || Date.now()).getTime();
              const isNew = diff < 24 * 60 * 60 * 1000;

              return (
                <AnnouncementCard
                  key={a.id}
                  index={idx}
                  title={a.title}
                  message={a.message}
                  date={a.date}
                  category={a.category || 'general'}
                  isNew={isNew}
                  showDelete={!!onDeleteNotice}
                  onDelete={() => onDeleteNotice && onDeleteNotice(a.id)}
                  onPress={() => onShowNoticeDetail?.(a)}
                />
              );
            })}

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

        {/* Section: Institutional Activity */}
        <View className="mb-6">
          <UnifiedActivityFeed 
            limit={5} 
            onViewAll={onShowActivityLog}
            emptyMessage="No institutional activity recorded yet."
          />
        </View>

        {/* Section: Growth Overview */}
        <View className="mb-6">
          <SectionHeader
            title="GROWTH OVERVIEW"
            className="px-2"
            rightElement={<PlatformStatusBadge status={attendanceRate} label={attendanceRate} type="success" />}
          />
          <AppCard className="p-5">
            <PlatinumChart 
                data={[0.6, 0.8, 0.4, 0.9, 0.7, 0.85, 0.95].map((val, i) => ({ 
                    label: ['M', 'T', 'W', 'T', 'F', 'S', 'S'][i], 
                    value: val * 100 
                }))}
                height={176}
            />
          </AppCard>
        </View>
        
        {/* Section: Academic Calendar */}
        <View className="mb-10">
          <SectionHeader
            title="MY SCHEDULE"
            className="px-2"
            rightElement={
                <TouchableOpacity 
                    className="flex-row items-center bg-white px-3 py-1.5 rounded-full border border-gray-100 shadow-sm"
                    onPress={() => onNavigate?.('management')}
                >
                    <Icons.Calendar size={12} color="#4f46e5" />
                    <Text className="text-[10px] font-black text-indigo-600 uppercase tracking-widest ml-1.5">Manage</Text>
                </TouchableOpacity>
            }
          />
          <AppCard className="p-5 border border-white shadow-xl shadow-indigo-100/30">
            <CalendarWidget compact={true} />
          </AppCard>
        </View>

      </Animated.ScrollView>
    </View>
  );
};
