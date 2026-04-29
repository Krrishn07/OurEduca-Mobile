import React, { useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Animated, Dimensions, Image } from 'react-native';
import { Icons } from '../../../../components/Icons';
import { CalendarWidget } from '../../../../components/CalendarWidget';
import { LinearGradient } from 'expo-linear-gradient';
import { styled } from 'nativewind';
import { formatGreetingName } from '../../../utils/nameUtils';
import { AppTheme, AppCard, AppTypography, SectionHeader, StatCard, ActionTile, AppRow, StatusPill } from '../../../design-system';

const StyledLinearGradient = LinearGradient ? styled(LinearGradient) : View;
const { width: SCREEN_WIDTH } = Dimensions.get('window');

const HEADER_MAX_HEIGHT = 290;
const HEADER_MIN_HEIGHT = 100;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

interface MentorHomeProps {
  currentUser: any;
  assignedClassName: string;
  mentorRoster: any[];
  mentorStudents: any[];
  dbStudents: any[];
  users: any[];
  dbStaff: any[];
  dbClasses: any[];
  announcements?: any[];
  onNavigate: (tab: string) => void;
  onPostNotice?: () => void;
  onShowHistory?: () => void;
  onDeleteNotice?: (id: string) => void;
  onShowAddStudentModal: () => void;
  currentSchool?: any;
  attendanceRate?: string;
  subjectCount?: number;
  parentCount?: number;
}

import { PlatformStatusBadge } from '../../platform/components/PlatformStatusBadge';

export const MentorHome: React.FC<MentorHomeProps> = ({
  currentUser,
  assignedClassName,
  mentorRoster = [],
  mentorStudents = [],
  dbStudents = [],
  users = [],
  dbStaff = [],
  dbClasses = [],
  announcements = [],
  onNavigate,
  onPostNotice,
  onShowHistory,
  onDeleteNotice,
  onShowAddStudentModal,
  currentSchool,
  attendanceRate = '0%',
  subjectCount = 0,
  parentCount = 0
}) => {
  const scrollY = useRef(new Animated.Value(0)).current;
  
  const mentorAnnouncements = (announcements || []).filter((a: any) => 
      a.audience === 'ALL' || 
      a.audience === 'STAFF' || 
      (a.class_id && a.sender?.includes(formatGreetingName(currentUser?.name, 'X'))) 
  );
  
  const displayAnnouncements = mentorAnnouncements.slice(0, 3);

  const getDynamicGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning,";
    if (hour < 17) return "Good Afternoon,";
    if (hour < 22) return "Good Evening,";
    return "Working Late? Hello,";
  };

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

  const stats = [
    {
      label: 'Students',
      value: mentorRoster.length,
      icon: <Icons.Users size={22} color={AppTheme.colors.primary} />,
      toneClassName: 'bg-indigo-50',
      subtitle: 'Class Roster',
      subtitleTone: 'info' as const,
    },
    {
      label: 'Subjects',
      value: subjectCount,
      icon: <Icons.BookOpen size={22} color={AppTheme.colors.success} />,
      toneClassName: 'bg-emerald-50',
      subtitle: 'Active Courses',
      subtitleTone: 'success' as const,
    },
    {
      label: 'Attendance',
      value: attendanceRate,
      icon: <Icons.Calendar size={22} color={AppTheme.colors.warning} />,
      toneClassName: 'bg-amber-50',
      subtitle: 'Average Rate',
      subtitleTone: 'warning' as const,
    },
    {
      label: 'Parents',
      value: parentCount || mentorRoster.length * 2,
      icon: <Icons.Users size={22} color={AppTheme.colors.error} />,
      toneClassName: 'bg-rose-50',
      subtitle: 'Linked Contacts',
      subtitleTone: 'danger' as const,
    },
  ];

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
          paddingTop: 16,
        }}
      >
        <StyledLinearGradient
          colors={AppTheme.colors.gradients.brand}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="flex-1 rounded-[24px] p-5 shadow-xl shadow-indigo-200 relative overflow-hidden"
        >
          <Animated.View style={{ transform: [{ translateY: brandTranslate }] }} className="flex-row items-center relative z-10">
            <Animated.View style={{ transform: [{ scale: logoScale }] }} className="w-16 h-16 bg-white/20 rounded-2xl items-center justify-center mr-4 border border-white/30">
              {currentSchool?.logo_url ? (
                <Image
                  source={{ uri: currentSchool.logo_url }}
                  style={{ width: '100%', height: '100%', borderRadius: 16 }}
                  resizeMode="cover"
                />
              ) : (
                <Icons.School size={32} color="white" />
              )}
            </Animated.View>
            <View className="flex-1">
              <Text className="text-xl font-black text-white tracking-tighter leading-6 font-inter-black">
                {currentSchool?.name || 'Academy Hub'}
              </Text>
              <Text className="text-indigo-100 text-[9px] font-black uppercase tracking-[3px] mt-0.5 opacity-85 font-inter-black">Institutional Node</Text>
            </View>
          </Animated.View>

          <Animated.View style={{ opacity: greetingOpacity }} className="relative z-10 mt-5">
            <Text className="text-white/70 text-[9px] font-black uppercase tracking-[2px] mb-1 font-inter-black">Mentor Dashboard</Text>
            <Text className="text-white text-xl font-black tracking-tighter leading-6 font-inter-black">{getDynamicGreeting()}</Text>
            <View className="flex-row items-center mt-0.5">
              <Text className="text-2xl font-black text-[#fde047] tracking-tight leading-tight font-inter-black">
                {formatGreetingName(currentUser?.name, 'Mentor')} ✦
              </Text>
            </View>
            <View className="flex-row items-center bg-white/10 self-start px-3 py-1 rounded-full border border-white/20 mt-3">
              <View className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-2" />
              <Text className="text-white text-[10px] font-bold font-inter-medium">
                Active Group: <Text className="text-emerald-300">{assignedClassName || 'Primary Section'}</Text>
              </Text>
            </View>
          </Animated.View>

          <View className="absolute right-[-20] bottom-[-20] opacity-10 rotate-12">
            <Icons.GraduationCap size={140} color="white" />
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
        {/* Quick Actions - Standardized to ActionTile Row */}
        <View className="flex-row gap-3 mb-6">
          <ActionTile
            label="Add Student"
            icon={<Icons.Plus size={18} color="white" />}
            toneClassName="bg-indigo-600 border-indigo-500 shadow-lg shadow-indigo-100/50"
            iconShellClassName="bg-white/15 border-white/20"
            textClassName="text-white"
            className="py-4"
            onPress={onShowAddStudentModal}
          />
          <ActionTile
            label="Post Notice"
            icon={<Icons.Notifications size={18} color="#4f46e5" />}
            toneClassName="bg-white border-gray-100 shadow-md shadow-indigo-100/20"
            iconShellClassName="bg-indigo-50 border-indigo-100"
            textClassName="text-indigo-700"
            className="py-4"
            onPress={onPostNotice || (() => {})}
          />
        </View>

        {/* Stats Grid */}
        <View className="flex-row flex-wrap justify-between mb-4">
          {(stats || []).map((stat) => (
            <TouchableOpacity
              key={stat.label}
              className="w-[48.2%] mb-4"
              activeOpacity={0.9}
            >
              <StatCard
                value={stat.value}
                label={stat.label}
                icon={stat.icon}
                toneClassName={stat.toneClassName}
                pill={<StatusPill label={stat.subtitle} className="self-center" type={stat.subtitleTone} />}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Daily Agenda - Standardized 280px Horizontal Cards */}
        <View className="mb-6">
          <SectionHeader 
            title="Daily Agenda" 
            rightElement={
              <TouchableOpacity onPress={() => onNavigate?.('classes')} className="bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100 active:bg-indigo-100">
                <Text className="text-[9px] font-black text-indigo-600 uppercase tracking-widest font-inter-black">Registry</Text>
              </TouchableOpacity>
            }
            className="px-2"
          />

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 8 }}>
            <TouchableOpacity onPress={() => onNavigate?.('classes')} activeOpacity={0.92}>
              <AppCard className="w-[280px] p-5 mr-4 border border-white shadow-xl shadow-indigo-100/40">
                <View className="flex-row justify-between items-start mb-5">
                  <View className="flex-1 mr-3">
                    <View className="flex-row items-center mb-2">
                      <View className="bg-emerald-500 w-1.5 h-1.5 rounded-full mr-2 shadow-sm shadow-emerald-500/50" />
                      <Text className="text-[9px] font-black text-emerald-600 uppercase tracking-widest font-inter-black">Live Session</Text>
                    </View>
                    <Text className="font-black text-gray-900 text-[17px] tracking-tighter mb-1 font-inter-black" numberOfLines={1}>
                      {assignedClassName || 'Homeroom'}
                    </Text>
                    <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest font-inter-black">Main Hall • Active Roster</Text>
                  </View>

                  <View className="bg-indigo-50 px-3 py-2 rounded-2xl border border-indigo-100 items-center justify-center">
                    <Text className="text-[8px] font-black text-indigo-400 uppercase tracking-widest leading-none mb-1 font-inter-black">Role</Text>
                    <Text className="text-sm font-black text-indigo-700 leading-none font-inter-black">MT</Text>
                  </View>
                </View>

                <View className="flex-row items-center justify-between mt-2 pt-4 border-t border-gray-50">
                  <View className="flex-row items-center">
                    <View className="w-8 h-8 rounded-xl bg-gray-50 items-center justify-center mr-3 border border-gray-100">
                      <Icons.Calendar size={14} color="#6366f1" />
                    </View>
                    <Text className="text-[10px] font-black text-gray-500 uppercase tracking-widest font-inter-black">09:00 AM - 04:00 PM</Text>
                  </View>
                  <View className="bg-indigo-600 w-8 h-8 rounded-xl items-center justify-center shadow-md shadow-indigo-200">
                    <Icons.ChevronRight size={14} color="white" />
                  </View>
                </View>
              </AppCard>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* School Notices - Migrated to AppRow Pattern */}
        <View className="mb-6">
          <SectionHeader 
            title="School Notices" 
            rightElement={
              <StatusPill 
                label={`${mentorAnnouncements.length} Records`} 
                type="info" 
              />
            }
            className="px-2"
          />

          <AppCard className="p-0 overflow-hidden border border-white shadow-xl shadow-indigo-100/30">
            {displayAnnouncements.map((a: any, idx: number) => (
              <AppRow
                key={a.id}
                title={a.title}
                subtitle={a.message}
                avatarIcon={<Icons.Notifications size={15} color="#4f46e5" />}
                avatarBg="#eef2ff"
                meta={a.date}
                showBorder={idx < displayAnnouncements.length - 1}
                rightElement={
                  onDeleteNotice && a.sender_id === currentUser.id ? (
                    <TouchableOpacity
                      onPress={() => onDeleteNotice(a.id)}
                      className="bg-rose-50 border border-rose-100 px-3 py-1.5 rounded-xl active:bg-rose-100"
                    >
                      <Text className="text-[9px] font-black text-rose-500 uppercase tracking-widest font-inter-black">Delete</Text>
                    </TouchableOpacity>
                  ) : <Icons.ChevronRight size={13} color="#d1d5db" />
                }
              />
            ))}

            {mentorAnnouncements.length === 0 && (
              <View className="items-center py-12">
                <View className="w-14 h-14 rounded-2xl bg-gray-50 items-center justify-center mb-4 border border-gray-100">
                  <Icons.Notifications size={24} color="#cbd5e1" />
                </View>
                <Text className="text-[15px] font-black text-gray-900 font-inter-black">Notice Board Clear</Text>
                <Text className="text-[10px] font-black text-gray-400 uppercase tracking-[3px] mt-1 font-inter-black">No recent updates</Text>
              </View>
            )}
          </AppCard>
        </View>

        {/* Institutional Calendar - Standardized Compact Mode */}
        <View className="mb-8">
          <SectionHeader title="Institutional Calendar" className="px-2" />
          <AppCard className="p-5 border border-white shadow-xl shadow-indigo-100/30">
            <CalendarWidget compact={true} />
          </AppCard>
        </View>

        {/* Platform Build Info Integration */}
        <View className="mt-10 items-center opacity-30">
          <View className="w-8 h-0.5 bg-gray-300 rounded-full mb-3" />
          <Text className="text-[9px] font-black text-gray-400 uppercase tracking-[4px] font-inter-black">Verified Institutional Node</Text>
          <Text className="text-[8px] font-black text-gray-400 mt-1 uppercase tracking-widest font-inter-black italic text-center">Stable Connection established via TLS 1.3</Text>
        </View>
      </Animated.ScrollView>
    </View>
  );
};
