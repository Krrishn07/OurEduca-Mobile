import React, { useMemo, useRef } from 'react';
import { Animated, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { styled } from 'nativewind';
import { Icons } from '../../../../components/Icons';
import { CalendarWidget } from '../../../../components/CalendarWidget';
import { User } from '../../../../types';
import { ActionTile, AppCard, AppTheme, SectionHeader, StatCard, AppTypography, StatusPill, AppRow } from '../../../design-system';
import { formatGreetingName } from '../../../utils/nameUtils';

const StyledLinearGradient = LinearGradient ? styled(LinearGradient) : View;

const HEADER_MAX_HEIGHT = 280;
const HEADER_MIN_HEIGHT = 100;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

interface StudentHomeProps {
  currentUser: User;
  studentMaterials: any[];
  studentAssignments: any[];
  studentPrimaryClass: any | null;
  announcements: any[];
  allStudentClasses?: any[];
  onNavigate: (tab: string) => void;
  onShowHistory?: () => void;
  currentSchool?: any;
  attendanceRate?: string;
}

export const StudentHome: React.FC<StudentHomeProps> = ({
  currentUser,
  studentMaterials = [],
  studentAssignments = [],
  studentPrimaryClass,
  announcements = [],
  allStudentClasses = [],
  onNavigate,
  onShowHistory,
  currentSchool,
  attendanceRate = '0%',
}) => {
  const scrollY = useRef(new Animated.Value(0)).current;

  const studentAnnouncements = useMemo(() => {
    const filtered = (announcements || []).filter((a) => {
      const isInstitutional = !a.class_id;
      const isMyClass = (studentPrimaryClass?.class_id === a.class_id &&
        (studentPrimaryClass?.section === a.section || !a.section)) ||
        (allStudentClasses || []).some((c: any) =>
          c.class_id === a.class_id && (c.section === a.section || !a.section)
        );

      const audienceMatches = a.audience === 'ALL' || a.audience === 'STUDENT';
      return (isInstitutional || isMyClass) && audienceMatches;
    });

    if (filtered.length === 0) {
      filtered.push({
        id: 'welcome_notice',
        title: 'Welcome to OurEduca!',
        message: 'Keep an eye on this section for school-wide updates and institutional notices.',
        date: new Date().toLocaleDateString(),
        sender: 'Academy Office',
        audience: 'ALL',
      });
    }
    return filtered;
  }, [announcements, studentPrimaryClass, allStudentClasses]);

  const displayAnnouncements = studentAnnouncements.slice(0, 5);
  const displayClasses = allStudentClasses.length > 0 ? allStudentClasses : (studentPrimaryClass ? [studentPrimaryClass] : []);

  const learningSubjects = useMemo(() => {
    const subjects = new Set<string>();
    allStudentClasses?.forEach((c) => c.subject && subjects.add(c.subject));
    studentMaterials?.forEach((m) => m.subject && subjects.add(m.subject));
    studentAssignments?.forEach((a) => a.subject && subjects.add(a.subject));
    return Array.from(subjects).slice(0, 5);
  }, [allStudentClasses, studentMaterials, studentAssignments]);

  const getDynamicGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning,';
    if (hour < 17) return 'Good afternoon,';
    if (hour < 22) return 'Good evening,';
    return 'Working late? Hello,';
  };

  const stats = [
    {
      label: 'Attendance',
      value: attendanceRate,
      toneClassName: 'bg-emerald-50',
      icon: <Icons.Check size={22} color={AppTheme.colors.success} />,
      subtitle: 'Verified Record',
      subtitleTone: 'success' as const,
    },
    {
      label: 'Materials',
      value: studentMaterials.length,
      toneClassName: 'bg-indigo-50',
      icon: <Icons.BookOpen size={22} color={AppTheme.colors.primary} />,
      subtitle: 'Resource Vault',
      subtitleTone: 'info' as const,
    },
    {
      label: 'Standing',
      value: studentPrimaryClass?.grade_score || 'A+',
      toneClassName: 'bg-amber-50',
      icon: <Icons.GraduationCap size={22} color={AppTheme.colors.warning} />,
      subtitle: 'Academic Rank',
      subtitleTone: 'warning' as const,
    },
    {
      label: 'Assignments',
      value: studentAssignments.length,
      toneClassName: 'bg-rose-50',
      icon: <Icons.Report size={22} color={AppTheme.colors.error} />,
      subtitle: 'Pending Tasks',
      subtitleTone: 'danger' as const,
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
      {/* Platinum Animated Hero */}
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
          className="flex-1 rounded-[40px] p-6 shadow-2xl shadow-indigo-200/50 relative overflow-hidden"
        >
          <Animated.View style={{ transform: [{ translateY: brandTranslate }] }} className="flex-row items-center relative z-10">
            <Animated.View style={{ transform: [{ scale: logoScale }] }} className="w-16 h-16 bg-white/20 rounded-2xl items-center justify-center mr-4 border border-white/30 backdrop-blur-md">
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
              <Text className="text-2xl font-black text-white tracking-tighter leading-tight font-inter-black">
                {currentSchool?.name || 'Academy Hub'}
              </Text>
              <Text className="text-white/60 text-[10px] font-black uppercase tracking-[3px] mt-1 font-inter-black">Institutional Portal</Text>
            </View>
          </Animated.View>

          <Animated.View style={{ opacity: greetingOpacity }} className="relative z-10 mt-8">
            <Text className="text-white/70 text-[9px] font-black uppercase tracking-[2px] mb-1 font-inter-black">Scholar Dashboard</Text>
            <Text className="text-white text-xl font-black tracking-tighter leading-6 font-inter-black">{getDynamicGreeting()}</Text>
            <View className="flex-row items-center mt-0.5">
              <Text className="text-3xl font-black text-[#fde047] tracking-tight leading-tight font-inter-black">
                {formatGreetingName(currentUser?.name, 'Student')} ✦
              </Text>
            </View>
            <View className="flex-row items-center bg-white/10 self-start px-3 py-1.5 rounded-full border border-white/20 mt-5 backdrop-blur-sm">
              <View className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-2" />
              <Text className="text-white text-[10px] font-black font-inter-black">
                Focus Today: <Text className="text-emerald-300">{studentMaterials.length} Study Items</Text>
              </Text>
            </View>
          </Animated.View>

          <View className="absolute right-[-30] bottom-[-30] opacity-10 -rotate-12">
            <Icons.GraduationCap size={180} color="white" />
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
        {/* Quick Actions — Platinum Row */}
        <View className="flex-row gap-3 mb-6">
          <ActionTile
            title="Classes"
            subtitle="My Schedule"
            icon={Icons.Classes}
            type="brand"
            onPress={() => onNavigate('classes')}
          />
          <ActionTile
            title="Study Hub"
            subtitle="Resource Vault"
            icon={Icons.Video}
            type="neutral"
            onPress={() => onNavigate('videos')}
          />
        </View>

        {/* Stats Registry */}
        <View className="flex-row flex-wrap justify-between mb-4 gap-y-4">
          {stats.map((stat, idx) => (
            <TouchableOpacity 
              key={`stat-${stat.label.replace(/\s+/g, '-')}-${idx}`} 
              className="w-[48%]" 
              activeOpacity={0.9}
            >
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

        {/* Institutional Announcements */}
        <SectionHeader 
          title="ACADEMY NOTICES" 
          subtitle={`${studentAnnouncements.length} Active Records`}
          className="mb-4"
          rightElement={
            <StatusPill 
              label={`${studentAnnouncements.length} New`} 
              type="info" 
            />
          }
        />
        <AppCard className="p-0 overflow-hidden border border-white shadow-xl shadow-indigo-100/30 mb-8">
            {displayAnnouncements.map((a: any, idx) => (
                <AppRow 
                    key={a.id || idx}
                    title={a.title}
                    subtitle={a.message}
                    meta={a.date}
                    avatarIcon={<Icons.Notifications size={15} color="#4f46e5" />}
                    avatarBg="#eef2ff"
                    onPress={() => {}}
                    showBorder={idx < displayAnnouncements.length - 1}
                />
            ))}
        </AppCard>

        {/* Today's Schedule Registry */}
        <SectionHeader 
          title="ACTIVE SCHEDULE" 
          subtitle="REAL-TIME SESSIONS"
          className="mb-4"
          rightElement={
            <TouchableOpacity onPress={() => onNavigate('classes')} className="bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100">
                <Text className="text-[9px] font-black text-indigo-600 uppercase tracking-wider font-inter-black">Full Table</Text>
            </TouchableOpacity>
          }
        />
        <View className="mb-8">
          {displayClasses.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 8 }}>
              {displayClasses.map((item, idx) => (
                <TouchableOpacity key={item.id || idx} onPress={() => onNavigate('classes')} activeOpacity={0.92}>
                  <AppCard className="w-[280px] p-5 mr-4 border border-white shadow-xl shadow-indigo-100/30">
                    <View className="flex-row justify-between items-start mb-4">
                      <View className="flex-1 mr-3">
                        <View className="flex-row items-center mb-1.5">
                          <View className="bg-emerald-500 w-1.5 h-1.5 rounded-full mr-2 shadow-sm shadow-emerald-500/50" />
                          <Text className="text-[9px] font-black text-emerald-600 uppercase tracking-widest font-inter-black">Live Session</Text>
                        </View>
                        <Text className="font-black text-gray-900 text-lg tracking-tighter mb-1 font-inter-black" numberOfLines={1}>
                          {item.subject}
                        </Text>
                        <View className="flex-row items-center opacity-60">
                            <Icons.Profile size={10} color="#64748b" />
                            <Text className="text-[10px] font-black text-gray-500 ml-1.5 font-inter-black">{item.teacher_name || 'Academic Faculty'}</Text>
                        </View>
                      </View>

                      <View className="bg-indigo-50 px-3 py-2 rounded-2xl border border-indigo-100 items-center justify-center">
                        <Text className="text-[14px] text-indigo-700 font-black tracking-tighter font-inter-black">{item.grade_score || 'A+'}</Text>
                      </View>
                    </View>

                    <View className="bg-gray-50/80 p-3 rounded-2xl mb-4 border border-gray-100 flex-row items-center">
                      <Icons.Classes size={12} color="#4f46e5" />
                      <Text className="text-[10px] font-black text-indigo-900 ml-2 font-inter-black" numberOfLines={1}>
                        Topic: {item.last_topic || 'Institutional Introduction'}
                      </Text>
                    </View>

                    <TouchableOpacity onPress={() => onNavigate('classes')} className="w-full bg-indigo-600 py-3.5 rounded-2xl items-center justify-center shadow-xl shadow-indigo-200 active:scale-95">
                      <View className="flex-row items-center">
                        <Text className="text-white font-black uppercase tracking-[1.5px] text-[10px] mr-2 font-inter-black">Join Session</Text>
                        <Icons.ChevronRight size={12} color="white" />
                      </View>
                    </TouchableOpacity>
                  </AppCard>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <AppCard className="items-center py-12 border border-dashed border-gray-200">
              <View className="bg-gray-50 w-16 h-16 rounded-3xl items-center justify-center mb-6 border border-gray-100 shadow-inner">
                <Icons.Classes size={32} color="#e2e8f0" />
              </View>
              <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest font-inter-black text-center leading-5">No active sessions found.{'\n'}Review portal schedule for updates.</Text>
            </AppCard>
          )}
        </View>

        {/* Learning Snapshot & Snapshot */}
        <SectionHeader title="ACADEMIC SNAPSHOT" subtitle="CURRENT PERFORMANCE" className="mb-4" />
        <View className="flex-row gap-3 mb-8">
            <AppCard className="flex-1 p-5 border border-white shadow-xl shadow-indigo-100/30">
                <Text className="text-[9px] text-emerald-600 font-black uppercase tracking-[2px] mb-1.5 font-inter-black">Attendance</Text>
                <Text className="text-2xl font-black text-gray-900 font-inter-black">{attendanceRate}</Text>
                <View className="h-1 bg-emerald-100 rounded-full mt-3 overflow-hidden">
                    <View className="h-full bg-emerald-500 rounded-full" style={{ width: attendanceRate }} />
                </View>
            </AppCard>
            <AppCard className="flex-1 p-5 border border-white shadow-xl shadow-indigo-100/30">
                <Text className="text-[9px] text-amber-600 font-black uppercase tracking-[2px] mb-1.5 font-inter-black">Curriculum</Text>
                <Text className="text-2xl font-black text-gray-900 font-inter-black">{learningSubjects.length}</Text>
                <Text className="text-[8px] text-gray-400 font-black uppercase tracking-widest mt-2 font-inter-black">Active Courses</Text>
            </AppCard>
        </View>

        {/* Institutional Resource Link */}
        <StyledLinearGradient colors={AppTheme.colors.gradients.brand} className="p-8 rounded-[40px] shadow-2xl shadow-indigo-200/50 mb-12 relative overflow-hidden">
            <View className="relative z-10">
                <Text className="text-white font-black text-xl mb-2 font-inter-black">Institutional Vault</Text>
                <Text className="text-indigo-100 text-[11px] leading-5 mb-8 font-inter-medium opacity-80">
                    Access your full academic transcript, official report cards, and comprehensive learning history.
                </Text>
                <TouchableOpacity className="bg-white self-start px-6 py-3.5 rounded-2xl shadow-xl active:scale-95">
                    <Text className="text-indigo-600 font-black text-[10px] uppercase tracking-widest font-inter-black">Open Archive</Text>
                </TouchableOpacity>
            </View>
            <View className="absolute right-[-20] bottom-[-20] opacity-10">
                <Icons.Verified size={160} color="white" />
            </View>
        </StyledLinearGradient>

        <View className="h-10" />
      </Animated.ScrollView>
    </View>
  );
};
