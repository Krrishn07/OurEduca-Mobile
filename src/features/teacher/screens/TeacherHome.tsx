import React, { useRef } from 'react';
import { Animated, Image, Text, TouchableOpacity, View, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { styled } from 'nativewind';
import { Icons } from '../../../../components/Icons';
import { CalendarWidget } from '../../../../components/CalendarWidget';
import { User } from '../../../../types';
import { ActionTile, AppCard, AppTheme, SectionHeader, StatCard, AppRow, StatusPill, AppTypography } from '../../../design-system';
import { formatGreetingName } from '../../../utils/nameUtils';

const StyledLinearGradient = LinearGradient ? styled(LinearGradient) : View;

const HEADER_MAX_HEIGHT = 290;
const HEADER_MIN_HEIGHT = 100;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

interface TeacherHomeProps {
  currentUser: User;
  assignedSections: any[];
  teacherMaterials: any[];
  totalStudents?: number;
  dbRoster?: any[];
  announcements: any[];
  meetings: any[];
  onQuickAction: (action: string) => void;
  onNavigateToClass: (cls: any) => void;
  onStatPress?: (target: string) => void;
  onDeleteMaterial?: (id: string) => void;
  onShowHistory?: () => void;
  onDeleteNotice?: (id: string) => void;
  currentSchool?: any;
  systemLogs?: any[];
}

export const TeacherHome: React.FC<TeacherHomeProps> = ({
  currentUser,
  assignedSections = [],
  teacherMaterials = [],
  totalStudents = 0,
  dbRoster = [],
  announcements = [],
  meetings = [],
  onQuickAction,
  onNavigateToClass,
  onStatPress,
  onShowHistory,
  onDeleteNotice,
  onDeleteMaterial,
  currentSchool,
  systemLogs = [],
}) => {
  const scrollY = useRef(new Animated.Value(0)).current;

  const staffAnnouncements = (announcements || []).filter((a) => a.audience === 'ALL' || a.audience === 'STAFF');
  const displayAnnouncements = staffAnnouncements.slice(0, 3);
  
  // LIVE LOGIC: Calculate pending grades from roster
  const pendingGradesCount = (dbRoster || []).filter(s => !s.grade_score).length;

  const getRecentActivity = () => {
    return (systemLogs || []).slice(0, 5).map((act: any) => {
      const IconComp = (Icons as any)[act.icon] || Icons.Notifications;
      return {
        id: act.id,
        title: act.title,
        user: act.category || 'System',
        time: new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        icon: <IconComp size={16} color={act.color || '#4f46e5'} />,
        bg: `${act.color || '#4f46e5'}10`, // Subtle alpha background
      };
    });
  };

  const recentActivity = getRecentActivity();

  const getDynamicGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning,';
    if (hour < 17) return 'Good afternoon,';
    if (hour < 22) return 'Good evening,';
    return 'Working late? Hello,';
  };

  const stats = [
    {
      label: 'Students',
      value: totalStudents,
      target: 'classes',
      toneClassName: 'bg-indigo-50',
      icon: <Icons.Users size={22} color={AppTheme.colors.primary} />,
      subtitle: 'Class Roster',
      subtitleTone: 'info' as const,
    },
    {
      label: 'To Grade',
      value: pendingGradesCount,
      target: 'assignments',
      toneClassName: 'bg-amber-50',
      icon: <Icons.Report size={22} color={AppTheme.colors.warning} />,
      subtitle: 'Pending Work',
      subtitleTone: 'warning' as const,
    },
    {
      label: 'Sessions',
      value: (assignedSections || []).length,
      target: 'classes',
      toneClassName: 'bg-emerald-50',
      icon: <Icons.Classes size={22} color={AppTheme.colors.success} />,
      subtitle: "Today's Schedule",
      subtitleTone: 'success' as const,
    },
    {
      label: 'Announcements',
      value: staffAnnouncements.length,
      target: 'messages',
      toneClassName: 'bg-rose-50',
      icon: <Icons.Notifications size={22} color={AppTheme.colors.error} />,
      subtitle: 'Latest Updates',
      subtitleTone: 'danger' as const,
    },
    {
      label: 'Materials',
      value: teacherMaterials.length,
      target: 'materials',
      toneClassName: 'bg-blue-50',
      icon: <Icons.FileText size={22} color="#0ea5e9" />,
      subtitle: 'Resource Library',
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
          <Animated.View style={{ transform: [{ translateY: brandTranslate }] }} className="flex-row items-center justify-between relative z-10">
            <View className="flex-row items-center">
              <Animated.View style={{ transform: [{ scale: logoScale }] }} className="w-14 h-14 bg-white/20 rounded-2xl items-center justify-center mr-4 border border-white/30">
                {currentSchool?.logo_url ? (
                  <Image
                    source={{ uri: currentSchool.logo_url }}
                    style={{ width: '100%', height: '100%', borderRadius: 16 }}
                    resizeMode="cover"
                  />
                ) : (
                  <Icons.School size={28} color="white" />
                )}
              </Animated.View>
              <View>
                <Text className="text-lg font-black text-white tracking-tighter leading-5 font-inter-black">
                  {currentSchool?.name || 'Faculty Studio'}
                </Text>
                <Text className="text-indigo-100 text-[8px] font-black uppercase tracking-[3px] opacity-85 font-inter-black">OurEduca Node</Text>
              </View>
            </View>
            
            <View className="flex-row">
              <TouchableOpacity className="w-10 h-10 rounded-full bg-white/10 items-center justify-center border border-white/20 mr-2">
                <Icons.Search size={18} color="white" />
              </TouchableOpacity>
              <TouchableOpacity className="w-10 h-10 rounded-full bg-white/10 items-center justify-center border border-white/20">
                <Icons.Notifications size={18} color="white" />
              </TouchableOpacity>
            </View>
          </Animated.View>

          <Animated.View style={{ opacity: greetingOpacity }} className="relative z-10 mt-5">
            <Text className="text-white/70 text-[9px] font-black uppercase tracking-[2px] mb-1 font-inter-black">Teacher Workflow</Text>
            <Text className="text-white text-xl font-black tracking-tighter leading-6 font-inter-black">{getDynamicGreeting()}</Text>
            <View className="flex-row items-center mt-0.5">
              <Text className="text-2xl font-black text-[#fde047] tracking-tight leading-tight font-inter-black">
                {formatGreetingName(currentUser?.name, 'Teacher')} ✦
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
        {/* KPI Stats Grid - Top */}
        <View className="flex-row flex-wrap justify-between mb-8 gap-y-4">
          {(stats || []).map((stat, idx) => (
            <TouchableOpacity
              key={`stat-${stat.label.replace(/\s+/g, '-')}-${idx}`}
              className="w-[48%]"
              activeOpacity={stat.target ? 0.9 : 1}
              disabled={!stat.target}
              onPress={() => stat.target && onStatPress?.(stat.target)}
            >
              <StatCard
                value={stat.value}
                label={stat.label}
                icon={stat.icon}
                toneClassName={stat.toneClassName}
                pill={
                  <StatusPill
                    label={stat.subtitle}
                    className="self-center"
                    type={stat.subtitleTone === 'danger' ? 'danger' : stat.subtitleTone === 'success' ? 'success' : stat.subtitleTone === 'warning' ? 'warning' : 'neutral'}
                  />
                }
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* DAILY AGENDA */}
        <View className="mb-8">
          <SectionHeader
            title="DAILY AGENDA"
            className="px-2"
            rightElement={
              <TouchableOpacity onPress={() => onNavigateToClass?.({})} className="bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100 active:bg-indigo-100">
                <Text className="text-[9px] font-black text-indigo-600 uppercase tracking-widest font-inter-black">Registry</Text>
              </TouchableOpacity>
            }
          />

          {(assignedSections || []).length > 0 ? (
            <Animated.ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingRight: 8 }}
            >
              {(assignedSections || []).map((item, idx) => (
                <TouchableOpacity
                  key={item.rosterId || item.id || idx}
                  onPress={() => onNavigateToClass?.(item)}
                  activeOpacity={0.92}
                >
                  <AppCard className="w-[280px] p-5 mr-4 border border-white shadow-xl shadow-indigo-100/40">
                    <View className="flex-row justify-between items-start mb-5">
                      <View className="flex-1 mr-3">
                        <View className="flex-row items-center mb-2">
                          <View className="bg-emerald-500 w-1.5 h-1.5 rounded-full mr-2 shadow-sm shadow-emerald-500/50" />
                          <Text className="text-[9px] font-black text-emerald-600 uppercase tracking-widest font-inter-black">Live Session</Text>
                        </View>
                        <Text className="font-black text-gray-900 text-[17px] tracking-tighter mb-1 font-inter-black" numberOfLines={1}>
                          {item.subject}
                        </Text>
                        <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest font-inter-black">{item.name} • {item.section}</Text>
                      </View>

                      <View className="bg-indigo-50 px-3 py-2 rounded-2xl border border-indigo-100 items-center justify-center">
                        <Text className="text-[8px] font-black text-indigo-400 uppercase tracking-widest leading-none mb-1 font-inter-black">Hall</Text>
                        <Text className="text-sm font-black text-indigo-700 leading-none font-inter-black">{item.room_no || '302'}</Text>
                      </View>
                    </View>

                    <View className="flex-row items-center justify-between mt-2 pt-4 border-t border-gray-50">
                      <View className="flex-row items-center">
                        <View className="w-8 h-8 rounded-xl bg-gray-50 items-center justify-center mr-3 border border-gray-100">
                          <Icons.Calendar size={14} color="#6366f1" />
                        </View>
                        <Text className="text-[10px] font-black text-gray-500 uppercase tracking-widest font-inter-black">
                          {item.class_time || '09:00 AM'}
                        </Text>
                      </View>
                      <View className="bg-indigo-600 w-8 h-8 rounded-xl items-center justify-center shadow-md shadow-indigo-200">
                        <Icons.ChevronRight size={14} color="white" />
                      </View>
                    </View>
                  </AppCard>
                </TouchableOpacity>
              ))}
            </Animated.ScrollView>
          ) : (
            <AppCard className="items-center py-12 border border-white shadow-xl shadow-indigo-100/30">
              <View className="bg-indigo-50 w-14 h-14 rounded-2xl items-center justify-center mb-6 border border-indigo-100/50">
                <Icons.Calendar size={28} color="#6366f1" />
              </View>
              <Text className="text-gray-900 font-black text-[15px] font-inter-black">Institutional Roster Clear</Text>
              <Text className="text-gray-400 text-[10px] font-black mt-1 uppercase tracking-[3px] font-inter-black">No active sessions scheduled</Text>
            </AppCard>
          )}
        </View>

        {/* FACULTY NEWS - Below Daily Agenda */}
        <View className="mb-8">
          <SectionHeader
            title="FACULTY NEWS"
            className="px-2"
            rightElement={
              <StatusPill 
                label={`${staffAnnouncements.length} Total`} 
                type="neutral" 
              />
            }
          />

          <AppCard className="p-0 overflow-hidden border border-white shadow-xl shadow-indigo-100/30">
            {displayAnnouncements.map((a: any, idx: number) => (
              <AppRow
                key={a.id}
                title={a.title}
                subtitle={a.message}
                avatarIcon={<Icons.Notifications size={16} color="#4f46e5" />}
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

            {staffAnnouncements.length === 0 && (
              <View className="items-center py-12">
                <View className="w-14 h-14 rounded-2xl bg-gray-50 items-center justify-center mb-4 border border-gray-100">
                  <Icons.Notifications size={24} color="#cbd5e1" />
                </View>
                <Text className="text-[15px] font-black text-gray-900 font-inter-black">Internal Board Clear</Text>
                <Text className="text-[10px] font-black text-gray-400 uppercase tracking-[3px] mt-1 font-inter-black">No faculty briefings found</Text>
              </View>
            )}
            {staffAnnouncements.length > 0 && (
              <TouchableOpacity 
                onPress={() => onStatPress?.('notices')}
                className="py-4 items-center border-t border-gray-50 active:bg-gray-50"
              >
                <Text className="text-[10px] font-black text-indigo-600 uppercase tracking-widest font-inter-black">View All Faculty Briefings</Text>
              </TouchableOpacity>
            )}
          </AppCard>
        </View>

        {/* QUICK ACTIONS - Below Faculty News */}
        <View className="mb-8">
          <SectionHeader title="QUICK ACTIONS" className="px-2" />
          <View className="flex-row flex-wrap justify-between px-2 gap-y-4">
            {[
              { 
                label: 'Upload Material', 
                icon: <Icons.Plus size={22} color="#4f46e5" />, 
                bg: 'bg-[#eef2ff]', 
                text: 'text-indigo-700',
                action: 'Upload Material' 
              },
              { 
                label: 'Announcement', 
                icon: <Icons.Notifications size={22} color="#f59e0b" />, 
                bg: 'bg-[#fff7ed]', 
                text: 'text-amber-700',
                action: 'Post Announcement' 
              },
              { 
                label: 'Grade Work', 
                icon: <Icons.Check size={22} color="#10b981" />, 
                bg: 'bg-[#f0fdf4]', 
                text: 'text-emerald-700',
                action: 'Grade Quiz' 
              },
              { 
                label: 'Class Reports', 
                icon: <Icons.FileText size={22} color="#0ea5e9" />, 
                bg: 'bg-[#f0f9ff]', 
                text: 'text-sky-700',
                action: 'View Report' 
              },
            ].map((item, idx) => (
              <TouchableOpacity 
                key={idx} 
                onPress={() => onQuickAction(item.action)}
                className={`w-[48%] h-[120px] ${item.bg} rounded-[28px] items-center justify-center border border-white/60 shadow-sm active:scale-95`}
              >
                <View className="bg-white/90 p-2.5 rounded-2xl mb-3 shadow-sm">
                  {item.icon}
                </View>
                <Text className={`text-[12px] font-black ${item.text} font-inter-black`}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* MY UPLOADED MATERIALS */}
        <View className="mb-8">
          <SectionHeader
            title="MY UPLOADED MATERIALS"
            className="px-2"
            rightElement={
              <StatusPill 
                label={`${teacherMaterials.length} Nodes`} 
                type="neutral" 
              />
            }
          />
          <AppCard className="p-0 overflow-hidden border border-white shadow-xl shadow-indigo-100/30">
            {teacherMaterials.slice(0, 5).map((mat, idx) => (
              <AppRow
                key={mat.id}
                title={mat.title}
                subtitle={`${mat.type} • ${mat.subject || 'Academic Node'}`}
                avatarIcon={mat.type === 'PDF' ? <Icons.FileText size={16} color="#4f46e5" /> : <Icons.Globe size={16} color="#0ea5e9" />}
                avatarBg={mat.type === 'PDF' ? '#eef2ff' : '#f0f9ff'}
                meta={new Date(mat.created_at).toLocaleDateString()}
                showBorder={idx < Math.min(teacherMaterials.length, 5) - 1}
                onPress={() => {
                  if (!mat.url) {
                    console.warn(`[TEACHER_HOME] Material Node ${mat.id} has no valid transmission URL.`);
                    return;
                  }
                  const finalUrl = mat.url.startsWith('http') ? mat.url : `https://${mat.url}`;
                  Linking.openURL(finalUrl).catch(err => console.error("Linking Error:", err));
                }}
                rightElement={
                  onDeleteMaterial ? (
                    <TouchableOpacity
                      onPress={() => onDeleteMaterial(mat.id)}
                      className="bg-rose-50 border border-rose-100 px-3 py-1.5 rounded-xl active:bg-rose-100"
                    >
                      <Text className="text-[9px] font-black text-rose-500 uppercase tracking-widest font-inter-black">Delete</Text>
                    </TouchableOpacity>
                  ) : <Icons.ChevronRight size={13} color="#d1d5db" />
                }
              />
            ))}
            {teacherMaterials.length === 0 && (
              <View className="items-center py-10">
                <Icons.FileText size={24} color="#cbd5e1" />
                <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">No materials uploaded</Text>
              </View>
            )}
            {teacherMaterials.length > 0 && (
              <TouchableOpacity 
                onPress={() => onStatPress?.('materials')}
                className="py-4 items-center border-t border-gray-50 active:bg-gray-50"
              >
                <Text className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">View All Repository Nodes</Text>
              </TouchableOpacity>
            )}
          </AppCard>
        </View>

        {/* RECENT ACTIVITY - Just above Calendar */}
        <View className="mb-8">
          <SectionHeader
            title="RECENT ACTIVITY"
            className="px-2"
            rightElement={
              <StatusPill 
                label="LIVE FEED" 
                type="info" 
              />
            }
          />
          <AppCard className="p-0 overflow-hidden border border-white shadow-xl shadow-indigo-100/30">
            {recentActivity.length > 0 ? recentActivity.map((act, idx) => (
              <AppRow
                key={act.id}
                title={act.title}
                subtitle={`${act.user} • ${act.time}`}
                avatarIcon={act.icon}
                avatarBg={act.bg}
                showBorder={idx < recentActivity.length - 1}
                rightElement={<Icons.ChevronRight size={13} color="#d1d5db" />}
              />
            )) : (
                <View className="items-center py-10">
                    <Icons.Notifications size={24} color="#cbd5e1" />
                    <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">No recent system activity</Text>
                </View>
            )}
          </AppCard>
        </View>

        {/* INSTITUTIONAL CALENDAR */}
        <View className="mb-8">
          <SectionHeader
            title="INSTITUTIONAL CALENDAR"
            className="px-2"
          />
          <AppCard className="p-5 border border-white shadow-xl shadow-indigo-100/30">
            <CalendarWidget compact={true} />
          </AppCard>
        </View>

        <View className="mt-10 items-center opacity-30">
          <View className="w-8 h-0.5 bg-gray-300 rounded-full mb-3" />
          <Text className="text-[9px] font-black text-gray-400 uppercase tracking-[4px] font-inter-black">Verified Institutional Node</Text>
          <Text className="text-[8px] font-black text-gray-400 mt-1 uppercase tracking-widest font-inter-black italic">Stable Connection established via TLS 1.3</Text>
        </View>
      </Animated.ScrollView>
    </View>
  );
};
