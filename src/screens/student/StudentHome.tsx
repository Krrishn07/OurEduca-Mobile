import React, { useMemo, useRef } from 'react';
import { Animated, Image, ScrollView, Text, TouchableOpacity, View, Platform, RefreshControl, Linking, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Icons } from '@components/common/Icons';
import { CalendarWidget } from '@components/common/CalendarWidget';
import { User } from '@/types';
import { AppCard, AppTheme, SectionHeader, StatCard, AppTypography, StatusPill, AppRow, AnnouncementCard } from '@components/common';
import { QuickActionsGrid } from '@components/dashboard/QuickActionsGrid';
import { formatGreetingName } from '@utils/nameUtils';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { triggerHaptic } from '@utils/haptics';

const StyledLinearGradient = LinearGradient || View;

const HEADER_MIN_HEIGHT = Platform.OS === 'ios' ? 100 : 80;

interface StudentHomeProps {
  currentUser: User;
  studentMaterials: any[];
  studentAssignments: any[];
  studentPrimaryClass: any | null;
  announcements: any[];
  allStudentClasses?: any[];
  onNavigate: (tab: string) => void;
  onQuickCapture?: (assignmentId: string) => void;
  onShowHistory?: () => void;
  currentSchool?: any;
  attendanceRate?: string;
  onRefresh?: () => void;
  refreshing?: boolean;
  studentSubmissions?: any[];
}

export const StudentHome: React.FC<StudentHomeProps> = ({
  currentUser,
  studentMaterials = [],
  studentAssignments = [],
  studentPrimaryClass,
  announcements = [],
  allStudentClasses = [],
  onNavigate,
  onQuickCapture,
  onShowHistory,
  currentSchool,
  attendanceRate = '0%',
  onRefresh,
  refreshing = false,
  studentSubmissions = [],
}) => {
  const insets = useSafeAreaInsets();
  const HEADER_MAX_HEIGHT = insets.top + 260;
  const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

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

  const displayClasses = allStudentClasses.length > 0 ? allStudentClasses : (studentPrimaryClass ? [studentPrimaryClass] : []);

  const pendingAssignments = useMemo(() => {
    return (studentAssignments || []).filter(a => 
      !(studentSubmissions || []).some(s => s.assignment_id === a.id)
    );
  }, [studentAssignments, studentSubmissions]);

  const getDynamicGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning,';
    if (hour < 17) return 'Good afternoon,';
    if (hour < 22) return 'Good evening,';
    return 'Working late? Hello,';
  };

  const handleOpenMaterial = async (url?: string) => {
    if (!url) {
        onNavigate('materials');
        return;
    }
    try {
        const finalUrl = url.startsWith('http') ? url : `https://${url}`;
        const canOpen = await Linking.canOpenURL(finalUrl);
        if (canOpen) {
            await Linking.openURL(finalUrl);
        } else {
            onNavigate('materials');
        }
    } catch (e) {
        onNavigate('materials');
    }
  };

  const stats = [
    {
      label: 'Attendance',
      value: attendanceRate,
      toneClassName: 'bg-emerald-50',
      icon: <Icons.Check size={22} color={AppTheme.colors.success} />,
      trend: parseFloat(attendanceRate) > 90 ? 'Optimal' : parseFloat(attendanceRate) < 75 ? 'Warning' : 'Stable',
      trendType: parseFloat(attendanceRate) > 90 ? 'up' : parseFloat(attendanceRate) < 75 ? 'down' : 'neutral' as const,
    },
    {
      label: 'Materials',
      value: studentMaterials.length,
      toneClassName: 'bg-indigo-50',
      icon: <Icons.BookOpen size={22} color={AppTheme.colors.primary} />,
      trend: studentMaterials.length > 0 ? 'New' : 'Empty',
      trendType: studentMaterials.length > 0 ? 'up' : 'neutral' as const,
    },
    {
      label: 'Standing',
      value: studentPrimaryClass?.grade_score || 'A+',
      toneClassName: 'bg-amber-50',
      icon: <Icons.GraduationCap size={22} color={AppTheme.colors.warning} />,
      trend: (studentPrimaryClass?.grade_score || 'A').startsWith('A') ? 'Elite' : (studentPrimaryClass?.grade_score || 'B').startsWith('B') ? 'Good' : 'Focus',
      trendType: (studentPrimaryClass?.grade_score || 'A').startsWith('A') ? 'up' : (studentPrimaryClass?.grade_score || 'B').startsWith('B') ? 'neutral' : 'down' as const,
    },
    {
      label: 'Assignments',
      value: studentAssignments.length,
      toneClassName: 'bg-rose-50',
      icon: <Icons.Report size={22} color={AppTheme.colors.error} />,
      trend: studentAssignments.length > 5 ? 'Heavy' : studentAssignments.length > 0 ? 'Pending' : 'Clear',
      trendType: studentAssignments.length > 5 ? 'down' : studentAssignments.length > 0 ? 'neutral' : 'up' as const,
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
          className="flex-1 rounded-[24px] p-5 shadow-xl shadow-indigo-200 relative overflow-hidden"
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
                  {currentSchool?.name || 'Academy Hub'}
                </Text>
                <Text className="text-white text-[9px] uppercase tracking-[2px] opacity-90 font-inter-black">Institutional Portal</Text>
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
                <Text className="text-white/90 text-[9px] uppercase tracking-[2px] mb-0.5 font-inter-black">Scholar Workflow</Text>
                <Text className="text-white text-[20px] tracking-tighter leading-7 font-inter-black">{getDynamicGreeting()}</Text>
                <Text className="text-[26px] text-brand-accent tracking-tighter leading-8 font-inter-black">
                    {formatGreetingName(currentUser?.name, 'Student')}!
                </Text>
                
                <Text 
                    className="text-[14px] text-white mt-2.5 leading-6 font-inter-medium opacity-95"
                    style={{ maxWidth: '95%' }}
                >
                    You have <Text className="text-brand-accent font-inter-black">{studentAssignments.length}</Text> pending tasks, 
                    <Text className="text-brand-accent font-inter-black"> {studentMaterials.length}</Text> new resources, 
                    and <Text className="text-brand-accent font-inter-black">{studentAnnouncements.length}</Text> academy updates.
                </Text>
            </View>
          </Animated.View>

          <View style={{ position: 'absolute', right: -40, bottom: -30, opacity: 0.05, transform: [{ rotate: '12deg' }] }}>
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
        {/* 1. Stats Registry */}
        <View className="flex-row flex-wrap justify-between mb-8 gap-y-3.5">
          {stats.map((stat, idx) => {
            const mappedTone = 
              stat.toneClassName === 'bg-emerald-50' ? 'emerald' :
              stat.toneClassName === 'bg-indigo-50' ? 'indigo' :
              stat.toneClassName === 'bg-amber-50' ? 'amber' :
              stat.toneClassName === 'bg-rose-50' ? 'rose' : 'indigo';

            return (
              <View key={`student-stat-${idx}`} className="w-[48.2%]">
                <StatCard
                  index={idx}
                  value={stat.value}
                  label={stat.label}
                  icon={stat.icon}
                  tone={mappedTone as any}
                  trend={(stat as any).trend}
                  trendType={(stat as any).trendType}
                  onPress={() => {
                    if (stat.label === 'Materials') onNavigate?.('materials');
                    else if (stat.label === 'Assignments') onNavigate?.('assignments');
                  }}
                />
              </View>
            );
          })}
        </View>

        {/* 2. Assignments & Homework Registry (COMPACT CORE) */}
        <SectionHeader 
          title="ASSIGNMENTS DUE" 
          className="mb-4 px-1"
          rightElement={
            <TouchableOpacity onPress={() => onNavigate('assignments')} className="flex-row items-center">
                <Text className="text-[9px] font-black text-indigo-600 uppercase tracking-widest font-inter-black mr-1">Task Hub</Text>
                <Icons.ChevronRight size={10} color="#4f46e5" />
            </TouchableOpacity>
          }
        />
        <View className="mb-8">
          <AppCard className="p-0 overflow-hidden border border-white shadow-xl shadow-indigo-100/30">
            {pendingAssignments.length > 0 ? (
              pendingAssignments
                .sort((a, b) => new Date(a.due_date || 0).getTime() - new Date(b.due_date || 0).getTime())
                .slice(0, 3)
                .map((task, idx) => {
                  const isLast = idx === 2 || idx === pendingAssignments.length - 1;
                  const dueDate = task.due_date ? new Date(task.due_date) : null;
                  const isToday = dueDate?.toDateString() === new Date().toDateString();
                  const isTomorrow = dueDate?.toDateString() === new Date(Date.now() + 86400000).toDateString();
                  
                  let urgencyLabel = task.due_date ? new Date(task.due_date).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'No Date';
                  let urgencyType: 'error' | 'warning' | 'info' = 'info';

                  if (isToday) {
                    urgencyLabel = 'DUE TODAY';
                    urgencyType = 'error';
                  } else if (isTomorrow) {
                    urgencyLabel = 'TOMORROW';
                    urgencyType = 'warning';
                  }

                  return (
                    <View 
                      key={task.id || idx}
                      className={`flex-row items-center p-4 ${!isLast ? 'border-b border-gray-50' : ''}`}
                    >
                      <View className="w-10 h-10 rounded-xl bg-gray-50 items-center justify-center mr-4 border border-gray-100">
                         <Icons.Report size={18} color={isToday ? AppTheme.colors.error : AppTheme.colors.primary} />
                      </View>

                      <View className="flex-1 mr-3">
                        <Text className="font-black text-gray-900 text-[13px] tracking-tight font-inter-black" numberOfLines={1}>
                          {task.title}
                        </Text>
                        <View className="flex-row items-center mt-0.5">
                            <Text className="text-[9px] font-black text-gray-400 uppercase tracking-widest font-inter-black mr-2">
                                {task.subject || 'Academic'}
                            </Text>
                            <StatusPill label={urgencyLabel} type={urgencyType} className="scale-[0.8] origin-left" />
                        </View>
                      </View>

                      <TouchableOpacity 
                        onPress={() => onQuickCapture?.(task.id)}
                        className="w-10 h-10 bg-indigo-50 rounded-full items-center justify-center border border-indigo-100 active:bg-indigo-100"
                      >
                        <Icons.Camera size={16} color={AppTheme.colors.primary} />
                      </TouchableOpacity>
                    </View>
                  );
                })
            ) : (
              <View className="py-12 items-center">
                 <Icons.Check size={32} color="#e2e8f0" />
                 <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-4 font-inter-black">All Tasks Completed</Text>
              </View>
            )}
          </AppCard>
        </View>

        {/* 3. LATEST ACADEMIC MATERIALS (TEACHER-STYLED VERTICAL GRID) */}
        <SectionHeader 
          title="LATEST MATERIALS" 
          className="mb-4 px-1"
          rightElement={
            <TouchableOpacity onPress={() => onNavigate('materials')} className="flex-row items-center">
                <Text className="text-[9px] font-black text-indigo-600 uppercase tracking-widest font-inter-black mr-1">Study Hub</Text>
                <Icons.ChevronRight size={10} color="#4f46e5" />
            </TouchableOpacity>
          }
        />
        <View className="mb-8">
          <AppCard className="p-0 overflow-hidden border border-white shadow-xl shadow-indigo-100/30">
            {studentMaterials.length > 0 ? (
              studentMaterials.slice(0, 5).map((mat, idx) => {
                const isPDF = mat.type === 'PDF' || (mat.file_url && mat.file_url.toLowerCase().endsWith('.pdf'));
                const isVideo = mat.type === 'VIDEO' || (mat.file_url && (mat.file_url.includes('youtube') || mat.file_url.includes('vimeo')));
                
                return (
                  <AppRow
                    key={mat.id || idx}
                    title={mat.title}
                    titleProps={{ numberOfLines: 1, ellipsizeMode: 'tail' }}
                    subtitle={`${mat.subject || 'Academic Resource'} • By ${mat.teacher_name || 'Faculty'}`}
                    avatarIcon={
                      isPDF ? <Icons.FileText size={16} color="#4f46e5" /> : 
                      isVideo ? <Icons.Video size={16} color="#0ea5e9" /> :
                      <Icons.Globe size={16} color="#0ea5e9" />
                    }
                    avatarBg={isPDF ? '#eef2ff' : '#f0f9ff'}
                    showBorder={idx < Math.min(studentMaterials.length, 5) - 1}
                    onPress={() => {
                        triggerHaptic();
                        handleOpenMaterial(mat.url || mat.file_url);
                    }}
                    rightElement={
                       <View className={`px-2 py-1 rounded ${isPDF ? 'bg-indigo-50' : 'bg-sky-50'}`}>
                         <Text className={`text-[9px] font-inter-black uppercase tracking-tighter ${isPDF ? 'text-indigo-600' : 'text-sky-600'}`}>
                            {isPDF ? 'PDF' : isVideo ? 'VIDEO' : 'LINK'}
                         </Text>
                       </View>
                    }
                  />
                );
              })
            ) : (
              <View className="py-12 items-center">
                 <Icons.FileText size={32} color="#e2e8f0" />
                 <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-4 font-inter-black">No resources shared yet</Text>
              </View>
            )}
            
            {studentMaterials.length > 5 && (
              <TouchableOpacity 
                onPress={() => onNavigate('materials')}
                className="py-4 border-t border-gray-50 items-center bg-gray-50/30 active:bg-gray-50"
              >
                <Text className="text-[10px] font-black text-indigo-600 uppercase tracking-widest font-inter-black">Open Material Library</Text>
              </TouchableOpacity>
            )}
          </AppCard>
        </View>

        {/* 4. Daily Academic Timeline (HIGH FIDELITY) */}
        <SectionHeader 
          title="DAILY TIMELINE" 
          className="mb-4 px-1"
          rightElement={
            <TouchableOpacity onPress={() => onNavigate('classes')} className="bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100">
                <Text className="text-[9px] font-black text-indigo-600 uppercase tracking-wider font-inter-black">Full Table</Text>
            </TouchableOpacity>
          }
        />
        <View className="mb-8">
          {displayClasses.length > 0 ? (
            <AppCard className="p-0 overflow-hidden border border-white shadow-xl shadow-indigo-100/30">
              {displayClasses.slice(0, 2).map((item, idx) => {
                const isLast = idx === 1 || idx === displayClasses.length - 1;
                const classTime = item.class_time || `${9 + idx}:00 AM`;
                const isLive = idx === 0;

                return (
                  <TouchableOpacity 
                    key={item.id || idx} 
                    onPress={() => onNavigate('classes')} 
                    activeOpacity={0.7}
                    className={`flex-row p-5 ${!isLast ? 'border-b border-gray-50' : ''}`}
                  >
                    <View className="items-center mr-6">
                      <Text className="text-[10px] font-black text-indigo-600 font-inter-black uppercase tracking-tighter mb-1">
                        {classTime.split(' ')[0]}
                      </Text>
                      <Text className="text-[8px] font-black text-gray-400 font-inter-black uppercase">
                        {classTime.split(' ')[1] || 'AM'}
                      </Text>
                      <View className="w-0.5 flex-1 bg-indigo-50 my-2 relative">
                        {isLive && <View className="absolute top-0 left-[-3px] w-2 h-2 bg-emerald-500 rounded-full border-2 border-white" />}
                      </View>
                    </View>

                    <View className="flex-1">
                      <View className="flex-row justify-between items-start">
                        <View className="flex-1 mr-2">
                          <Text className={`font-black text-lg tracking-tighter font-inter-black ${isLive ? 'text-indigo-900' : 'text-gray-700'}`}>
                            {item.subject}
                          </Text>
                          <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5 font-inter-black">
                            {item.teacher_name || 'Academic Faculty'} • Rm {item.room_no || '302'}
                          </Text>
                        </View>
                        {isLive && (
                          <View className="bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100 flex-row items-center">
                            <View className="w-1 h-1 bg-emerald-500 rounded-full mr-1.5 animate-pulse" />
                            <Text className="text-[8px] font-black text-emerald-600 uppercase font-inter-black">LIVE</Text>
                          </View>
                        )}
                      </View>

                      {isLive && (
                        <View className="mt-3 flex-row items-center bg-indigo-600 self-start px-4 py-1.5 rounded-full shadow-lg shadow-indigo-200">
                          <Text className="text-white font-black text-[9px] uppercase tracking-widest font-inter-black mr-2">Join Session</Text>
                          <Icons.ChevronRight size={10} color="white" />
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </AppCard>
          ) : (
            <AppCard className="items-center py-12 border border-dashed border-gray-200">
              <View className="bg-gray-50 w-16 h-16 rounded-3xl items-center justify-center mb-6 border border-gray-100 shadow-inner">
                <Icons.Classes size={32} color="#e2e8f0" />
              </View>
              <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest font-inter-black text-center leading-5">No active sessions found.</Text>
            </AppCard>
          )}
        </View>

        {/* 5. Academy Notices (NEWS) */}
        <SectionHeader 
          title="ACADEMY NOTICES" 
          className="mb-4 px-1"
          rightElement={
            <StatusPill label={`${studentAnnouncements.length} New`} type="info" />
          }
        />
        <AppCard className="p-0 overflow-hidden border border-white shadow-xl shadow-indigo-100/30 mb-8">
            {studentAnnouncements.slice(0, 2).map((a: any, idx) => {
              const diff = Date.now() - new Date(a.date || Date.now()).getTime();
              const isNew = diff < 24 * 60 * 60 * 1000;

              return (
                <AnnouncementCard 
                  key={a.id || idx}
                  index={idx}
                  title={a.title}
                  message={a.message}
                  date={a.date}
                  category={a.category || 'general'}
                  isNew={isNew}
                  onPress={() => {}}
                />
              );
            })}
            <TouchableOpacity 
              onPress={onShowHistory}
              className="py-4 border-t border-gray-50 items-center bg-gray-50/30 active:bg-gray-50"
            >
              <Text className="text-[10px] font-black text-indigo-600 uppercase tracking-widest font-inter-black">Official Bulletins</Text>
            </TouchableOpacity>
        </AppCard>

        {/* 6. Quick Actions (UTILITY) */}
        <QuickActionsGrid 
          role="student"
          onAction={onNavigate}
          className="mb-8"
        />

        {/* 7. Institutional Calendar (SCHEDULE) */}
        <SectionHeader 
          title="INSTITUTIONAL CALENDAR" 
          className="mb-4 px-1"
        />
        <AppCard className="p-5 border border-white shadow-xl shadow-indigo-100/30">
          <CalendarWidget compact={true} canAddEvents={false} />
        </AppCard>

        <View className="h-10" />
      </Animated.ScrollView>
    </View>
  );
};
