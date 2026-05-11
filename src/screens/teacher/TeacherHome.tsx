import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Animated, Image, Text, TouchableOpacity, View, ScrollView, Linking, Platform, RefreshControl, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';

import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icons } from '@components/common/Icons';
import { CalendarWidget } from '@components/common/CalendarWidget';
import { User } from '@/types';
import { 
  ActionTile, 
  AppCard, 
  SectionHeader, 
  StatCard, 
  AppRow, 
  StatusPill, 
  AppTypography, 
  Skeleton, 
  SkeletonCard, 
  SkeletonRow 
} from '@components/common';
import { AppTheme } from '@constants/Theme';
import { formatGreetingName } from '@utils/nameUtils';
import { formatAcademicTime } from '@utils/timeUtils';
import { SwipeableRow } from '@screens/teacher/components/SwipeableRow';

const StyledLinearGradient = LinearGradient;

const HEADER_MIN_HEIGHT = Platform.OS === 'ios' ? 100 : 80;

export interface Section {
  id: string;
  class_id?: string;
  rosterId?: string;
  subject: string;
  name: string;
  class_time: string | null;
  room_no?: string | number;
}

export interface Material {
  id: string;
  title: string;
  subject?: string;
  type: 'PDF' | 'LINK' | string;
  url?: string;
  created_at: string;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  audience: 'ALL' | 'STAFF' | 'STUDENT' | string;
  created_at?: string;
  date?: string;
}

export interface Assignment {
  id: string;
  title: string;
  due_date?: string;
  max_marks: number;
  class_id?: string;
}

interface TeacherHomeProps {
  currentUser: User;
  assignedSections: Section[];
  teacherMaterials: Material[];
  totalStudents?: number;
  announcements: Announcement[];
  onQuickAction: (action: string) => void;
  onNavigateToClass: (cls: Section) => void;
  onStatPress?: (target: string) => void;
  onDeleteMaterial?: (id: string) => void;
  onShowHistory?: () => void;
  onDeleteNotice?: (id: string) => void;
  currentSchool?: any;
  systemLogs?: any[];
  assignments?: Assignment[];
  onGradeAssignment?: (assignment: Assignment) => void;
  onAddAssignment?: () => void;
  onRefresh?: () => void;
  refreshing?: boolean;
  isLoading?: boolean;
  pendingGradesCount?: number;
}

export const TeacherHome = React.memo<TeacherHomeProps>(({
  currentUser,
  assignedSections = [],
  teacherMaterials = [],
  totalStudents = 0,
  announcements = [],
  onQuickAction,
  onNavigateToClass,
  onStatPress,
  onShowHistory,
  onDeleteNotice,
  onDeleteMaterial,
  currentSchool,
  systemLogs = [],
  assignments = [],
  onGradeAssignment,
  onAddAssignment,
  onRefresh,
  refreshing = false,
  isLoading = false,
  pendingGradesCount = 0
}) => {
  const insets = useSafeAreaInsets();
  const HEADER_MAX_HEIGHT = insets.top + 260;
  const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

  const scrollY = useRef(new Animated.Value(0)).current;

  const displayAnnouncements = (announcements || []).slice(0, 3);
  
  // LIVE LOGIC: Pending grades count is now passed as a prop from the optimized parent query

  const recentActivity = useMemo(() => {
    return (systemLogs || []).slice(0, 5).map((act: any) => {
      const IconComp = (Icons as any)[act.icon] || Icons.Notifications;
      return {
        id: act.id,
        title: act.title,
        user: act.category || 'System',
        time: formatAcademicTime(act.created_at),
        icon: <IconComp size={16} color={act.color || '#4f46e5'} />,
        bg: `${act.color || '#4f46e5'}10`, 
      };
    });
  }, [systemLogs]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning,';
    if (hour < 17) return 'Good afternoon,';
    if (hour < 22) return 'Good evening,';
    return 'Working late? Hello,';
  }, []);

  const formatRoom = (room: string | number) => {
    if (!room) return 'Room 302';
    const rStr = room.toString();
    return rStr.toLowerCase().includes('room') ? rStr : `Room ${rStr}`;
  };

  const triggerHaptic = (style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(style);
    }
  };


  const handleOpenMaterial = (url: string) => {
    if (!url) {
      onStatPress?.('materials');
      return;
    }
    const finalUrl = url.startsWith('http') ? url : `https://${url}`;
    Linking.openURL(finalUrl).catch(() => {
      Alert.alert(
        'Cannot Open File',
        'This resource may have been moved, deleted, or is in an unsupported format. Please contact your system administrator.',
        [{ text: 'Dismiss' }]
      );
    });
  };

  const parseTime = (timeStr: string) => {
    if (!timeStr) return 0;
    try {
      const [time, modifier] = timeStr.split(' ');
      let [hours, minutes] = time.split(':').map(Number);
      if (modifier === 'PM' && hours < 12) hours += 12;
      if (modifier === 'AM' && hours === 12) hours = 0;
      return hours * 60 + (minutes || 0);
    } catch (e) {
      return 0;
    }
  };

  const getSessionState = (timeStr: string | null, durationMinutes: number = 45) => {
    if (!timeStr) return 'UPCOMING';
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const sessionMinutes = parseTime(timeStr);
    
    if (currentMinutes > sessionMinutes + durationMinutes) return 'PAST'; 
    if (currentMinutes >= sessionMinutes && currentMinutes <= sessionMinutes + durationMinutes) return 'LIVE';
    return 'UPCOMING';
  };

  const sortedAgenda = useMemo(() => {
    return [...assignedSections].sort((a, b) => {
      return parseTime(a.class_time) - parseTime(b.class_time);
    });
  }, [assignedSections]);

  const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const stats = useMemo(() => [
    {
      label: 'Students',
      value: totalStudents,
      target: 'classes',
      tone: 'indigo' as const,
      icon: <Icons.Users size={20} color={AppTheme.colors.primary} />,
      trend: totalStudents > 0 ? 'Active' : 'None',
      trendType: 'neutral' as const,
    },
    {
      label: 'To Grade',
      value: pendingGradesCount,
      target: 'assignments',
      tone: 'amber' as const,
      icon: <Icons.Report size={20} color={AppTheme.colors.warning} />,
      trend: pendingGradesCount > 15 ? 'Critical' : pendingGradesCount > 5 ? 'Medium' : 'Normal',
      trendType: pendingGradesCount > 15 ? 'down' : pendingGradesCount > 5 ? 'down' : 'neutral' as const,
    },
    {
      label: 'Sessions',
      value: (assignedSections || []).length,
      target: 'classes',
      tone: 'emerald' as const,
      icon: <Icons.Classes size={20} color={AppTheme.colors.success} />,
      trend: (assignedSections || []).length > 0 ? 'Full' : 'None',
      trendType: 'neutral' as const,
    },
    {
      label: 'Announcements',
      value: (announcements || []).length,
      target: 'notices',
      tone: 'rose' as const,
      icon: <Icons.Notifications size={20} color={AppTheme.colors.error} />,
      trend: (announcements || []).some(a => {
        const diff = Date.now() - new Date(a.created_at || Date.now()).getTime();
        return diff < 24 * 60 * 60 * 1000; // 24 hours
      }) ? 'New' : undefined,
      trendType: 'up' as const,
    },
    {
      label: 'My Lessons',
      value: teacherMaterials.length,
      target: 'materials',
      tone: 'blue' as const,
      icon: <Icons.FileText size={20} color="#0ea5e9" />,
      trend: teacherMaterials.length > 0 ? 'Synced' : 'Empty',
      trendType: 'up' as const,
    },
  ], [totalStudents, pendingGradesCount, assignedSections.length, announcements.length, teacherMaterials.length]);

  const headerHeight = useMemo(() => scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
    extrapolate: 'clamp',
  }), [HEADER_SCROLL_DISTANCE, HEADER_MAX_HEIGHT]);

  const headerZindex = useMemo(() => scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [10, 100],
    extrapolate: 'clamp',
  }), [HEADER_SCROLL_DISTANCE]);

  const greetingOpacity = useMemo(() => scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
    outputRange: [1, 0.45, 0],
    extrapolate: 'clamp',
  }), [HEADER_SCROLL_DISTANCE]);

  const logoScale = useMemo(() => scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [1, 0.8],
    extrapolate: 'clamp',
  }), [HEADER_SCROLL_DISTANCE]);

  const brandTranslate = useMemo(() => scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [0, -10],
    extrapolate: 'clamp',
  }), [HEADER_SCROLL_DISTANCE]);

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
                  {currentSchool?.name || 'Faculty Studio'}
                </Text>
                <Text className="text-white text-[9px] uppercase tracking-[2px] opacity-90 font-inter-black">OurEduca Node</Text>
              </View>
            </View>
            
            <TouchableOpacity 
                onPress={() => { triggerHaptic(); onShowHistory?.(); }}
                className="w-10 h-10 rounded-full bg-white/10 items-center justify-center border border-white/20 flex-none"
            >
                <Icons.Notifications size={16} color="white" />
            </TouchableOpacity>
          </Animated.View>
 
          <Animated.View style={{ opacity: greetingOpacity }} className="relative z-10 mt-3">
            <View>
                <Text className="text-white/90 text-[9px] uppercase tracking-[2px] mb-0.5 font-inter-black">Teacher Workflow</Text>
                <Text className="text-white text-[20px] tracking-tighter leading-7 font-inter-black">{greeting}</Text>
                <Text className="text-[26px] text-brand-accent tracking-tighter leading-8 font-inter-black">
                    {formatGreetingName(currentUser?.name, 'Teacher')}!
                </Text>
                
                {/* Natural Language Status Sentence with Dynamic Highlighting */}
                <Text 
                    className="text-[14px] text-white mt-2.5 leading-6 font-inter-medium opacity-95"
                    style={{ maxWidth: '95%' }}
                >
                    You have <Text className="text-brand-accent font-inter-black">{pendingGradesCount}</Text> assignments to grade, 
                    <Text className="text-brand-accent font-inter-black"> {(assignedSections || []).length}</Text> classes today, 
                    and <Text className="text-brand-accent font-inter-black">{(announcements || []).length}</Text> new alerts.
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
        {/* KPI Stats Grid - Top */}
        <View className="flex-row flex-wrap justify-between mb-8">
          {(isLoading ? [1, 2, 3, 4] : stats).map((stat, idx) => (
            <View key={isLoading ? `skeleton-${idx}` : `stat-${idx}`} className="w-[48%] mb-4">
              <StatCard
                index={idx}
                isLoading={isLoading}
                value={(stat as any).value}
                label={(stat as any).label}
                icon={(stat as any).icon}
                tone={(stat as any).tone}
                trend={(stat as any).trend}
                trendType={(stat as any).trendType}
                onPress={() => (stat as any).target && onStatPress?.((stat as any).target)}
              />
            </View>
          ))}
        </View>

        {/* TODAY'S TIMELINE: AUTO-COLLAPSING ENGINE */}
        <View className="mb-10 px-0">
          <SectionHeader 
            title="TODAY'S TIMELINE" 
            rightElement={
              <View className="bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100 flex-row items-center">
                <Text className="text-[9px] text-indigo-600 font-inter-black uppercase tracking-[1px] leading-none">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long' })}
                </Text>
              </View>
            }
          />

          {isLoading ? (
            <SkeletonCard className="border-none shadow-none bg-white/50" />
          ) : sortedAgenda.length > 0 ? (
            <View className="bg-white rounded-[32px] p-6 border border-white shadow-xl shadow-indigo-100/20 relative overflow-hidden">
              {/* The Path Line - Removed absolute line to use dynamic item-level lines */}

              {sortedAgenda.map((item, idx) => {
                const state = getSessionState(item.class_time, item.duration_minutes);

                // --- STATE 1: COMPLETED (PAST) ---
                if (state === 'PAST') {
                  return (
                    <View key={item.rosterId || item.id || idx} className="flex-row items-center mb-3 opacity-30 px-1">
                      <View className="mx-3 items-center self-stretch py-2">
                        <Icons.Check size={10} color="#10b981" />
                        {idx < sortedAgenda.length - 1 && (
                          <View className="w-[1.5px] absolute top-6 bottom-[-12] bg-gray-100" />
                        )}
                      </View>
                      <Text className="text-[10px] font-inter-medium text-gray-400 line-through flex-1">
                        {item.subject} • Completed
                      </Text>
                    </View>
                  );
                }

                // --- STATE 2: ACTIVE (LIVE) ---
                if (state === 'LIVE') {
                  return (
                    <View key={item.rosterId || item.id || idx} className={`flex-row items-start ${idx < sortedAgenda.length - 1 ? 'mb-6' : ''}`}>
                      <View className="w-12 items-end pr-2 pt-2">
                        <Text className="text-[10px] font-inter-black text-indigo-600 tracking-tighter">{item.class_time || '--:--'}</Text>
                      </View>
                      <View className="mx-3 items-center self-stretch pt-3">
                        <View className="w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white shadow-sm z-10" />
                        {idx < sortedAgenda.length - 1 && (
                          <View className="w-[1.5px] bg-gray-100 absolute top-7 bottom-[-24]" />
                        )}
                      </View>
                      <View className="flex-1 bg-indigo-600 p-4 rounded-[28px] shadow-lg shadow-indigo-200">
                        {/* Top Area: Class Info */}
                        <TouchableOpacity 
                          activeOpacity={0.9}
                          onPress={() => onNavigateToClass(item)}
                          className="flex-row justify-between items-start"
                        >
                           <View className="flex-1">
                              <Text className="text-white font-inter-black text-[16px] tracking-tight">{item.subject}</Text>
                              <Text className="text-indigo-100 text-[9px] font-inter-black uppercase tracking-[1px] mt-1 opacity-90">
                                {item.name} • Room {item.room_no || '302'}
                              </Text>
                           </View>
                           <View className="bg-white/20 p-2 rounded-xl">
                             <Icons.ChevronRight size={14} color="white" />
                           </View>
                        </TouchableOpacity>

                        {/* Bottom Area: Action Button */}
                        <TouchableOpacity 
                          activeOpacity={0.8}
                          onPress={() => onQuickAction('Mark Attendance')}
                          className="mt-4 bg-white py-2.5 rounded-xl items-center shadow-sm"
                        >
                           <Text className="text-indigo-600 text-[10px] font-inter-black uppercase tracking-[1px]">Mark Attendance</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                }

                // --- STATE 3: UPCOMING ---
                return (
                  <TouchableOpacity 
                    key={item.rosterId || item.id || idx}
                    onPress={() => onNavigateToClass(item)}
                    activeOpacity={0.8}
                    className={`flex-row items-center ${idx < sortedAgenda.length - 1 ? 'mb-5' : ''}`}
                  >
                    <View className="w-12 items-end pr-2">
                      <Text className="text-[10px] font-inter-bold text-gray-400 tracking-tighter">{item.class_time || '--:--'}</Text>
                    </View>
                    <View className="mx-3 items-center self-stretch">
                      <View className="w-2.5 h-2.5 rounded-full bg-gray-200 border border-white" />
                      {idx < sortedAgenda.length - 1 && (
                        <View className="w-[1.5px] bg-gray-100 absolute top-4 bottom-[-20]" />
                      )}
                    </View>
                    <View className="flex-1 py-3 px-5 bg-gray-50/50 rounded-2xl border border-gray-100">
                      <Text className="text-gray-700 font-inter-bold text-[14px] tracking-tight">{item.subject}</Text>
                      <Text className="text-gray-400 text-[8px] font-inter-black uppercase tracking-[1px] mt-0.5">{item.name}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : (
            <AppCard className="items-center py-12 border border-white shadow-xl shadow-indigo-100/30">
              <View className="bg-indigo-50 w-14 h-14 rounded-2xl items-center justify-center mb-6 border border-indigo-100/50">
                <Icons.Calendar size={20} color="#6366f1" />
              </View>
              <Text className="text-gray-900 text-[18px] font-inter-bold">Institutional Roster Clear</Text>
              <Text className="text-gray-400 text-[10px] font-inter-bold mt-1 uppercase tracking-[1px]">No active sessions scheduled</Text>
            </AppCard>
          )}
        </View>

        {/* FACULTY NEWS - Below Daily Agenda */}
         <View className="mb-8">
           <SectionHeader
             title="FACULTY NEWS"
             className=""
             rightElement={
               <StatusPill 
                 label={`${(announcements || []).length} Updates`} 
                 type="neutral" 
               />
             }
           />

          <AppCard className="p-0 overflow-hidden border border-white shadow-xl shadow-indigo-100/30">
            {isLoading ? (
              <View>
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
              </View>
            ) : displayAnnouncements.map((a: any, idx: number) => {
              const isGlobal = a.audience === 'ALL';
              
              return (
                <SwipeableRow
                  key={a.id || idx}
                  canDelete={!!onDeleteNotice}
                  onDelete={() => {
                    triggerHaptic(Haptics.ImpactFeedbackStyle.Heavy);
                    Alert.alert(
                      'Remove Announcement',
                      `Are you sure you want to delete "${a.title}"? This will remove it from the institutional board permanently.`,
                      [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Delete', style: 'destructive', onPress: () => onDeleteNotice?.(a.id) }
                      ]
                    );
                  }}
                >
                  <View className="relative bg-white">
                    <View className={`absolute left-0 top-0 bottom-0 w-1 ${a.audience === 'ALL' ? 'bg-indigo-500' : 'bg-amber-500'}`} />
                    <AppRow
                      title={a.title}
                      subtitle={a.message}
                      subtitleProps={{ numberOfLines: 2 }}
                      avatarIcon={<Icons.Notifications size={16} color="#4f46e5" />}
                      avatarBg="#eef2ff"
                      meta={formatAcademicTime(a.created_at || a.date)}
                      showBorder={idx < displayAnnouncements.length - 1}
                      rightElement={<Icons.ChevronRight size={12} color="#d1d5db" />}
                    />
                  </View>
                </SwipeableRow>
              );
            })}

            {announcements.length === 0 && (
              <View className="items-center py-12">
                <View className="w-14 h-14 rounded-2xl bg-gray-50 items-center justify-center mb-4 border border-gray-100">
                  <Icons.Notifications size={20} color="#cbd5e1" />
                </View>
                <Text className="text-[18px] font-inter-bold text-gray-900">Internal Board Clear</Text>
                <Text className="text-[10px] font-inter-bold text-gray-400 uppercase tracking-[1px] mt-1">No faculty briefings found</Text>
              </View>
            )}
            
            {announcements.length > 0 && (
              <TouchableOpacity 
                onPress={() => onStatPress?.('notices')}
                className="py-4 items-center border-t border-gray-50 bg-gray-50/30 active:bg-gray-100"
              >
                <Text className="text-[10px] font-inter-bold text-indigo-600 uppercase tracking-[1px]">
                  View All Announcements
                </Text>
              </TouchableOpacity>
            )}
          </AppCard>
        </View>
        

        {/* ACTIVE ASSIGNMENTS */}
         <View className="mb-8">
             <SectionHeader
              title="ACTIVE ASSIGNMENTS"
              className=""
              rightElement={
                <TouchableOpacity onPress={onAddAssignment} className="bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100 active:bg-indigo-100">
                  <Text className="text-[10px] text-indigo-600 uppercase tracking-[1px] font-inter-bold">+ New</Text>
                </TouchableOpacity>
              }
            />
          <AppCard className="p-0 overflow-hidden border border-white shadow-xl shadow-indigo-100/30">
            {assignments.slice(0, 3).map((a: any, idx: number) => (
              <AppRow
                key={a.id || idx}
                title={a.title}
                subtitle={`Due: ${a.due_date || 'No Deadline'} • Max: ${a.max_marks}`}
                avatarIcon={<Icons.Edit size={16} color="#8b5cf6" />}
                avatarBg="#f5f3ff"
                showBorder={idx < Math.min(assignments.length, 3) - 1}
                onPress={() => onGradeAssignment?.(a)}
                rightElement={
                  <TouchableOpacity
                     onPress={() => {
                       triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
                       onGradeAssignment?.(a);
                     }}
                     className="bg-indigo-600 px-4 py-2 rounded-xl active:bg-indigo-700"
                   >
                     <Text className="text-white text-[10px] uppercase tracking-[1px] font-inter-bold">Grade</Text>
                   </TouchableOpacity>
                }
              />
            ))}
            {assignments.length === 0 && (
              <View className="items-center py-10">
                <Icons.Report size={20} color="#cbd5e1" />
                <Text className="text-[10px] font-black text-gray-400 uppercase tracking-[1px] mt-2">No active assignments</Text>
              </View>
            )}
            {assignments.length > 3 && (
              <TouchableOpacity 
                onPress={() => onStatPress?.('assignments')}
                className="py-4 items-center border-t border-gray-50 active:bg-gray-50"
              >
                <Text className="text-[10px] font-black text-indigo-600 uppercase tracking-[1px] font-inter-black">View All Assignments</Text>
              </TouchableOpacity>
            )}
          </AppCard>
        </View>

        {/* QUICK ACTIONS - Below Faculty News */}
         <View className="mb-8">
            <SectionHeader title="QUICK ACTIONS" className="" />
            <View className="flex-row flex-wrap justify-between gap-y-4">
              {[
                { label: 'Add Lesson', icon: <Icons.Plus size={24} color="#4f46e5" />, bg: 'bg-indigo-50', text: 'text-indigo-900', action: 'Upload Material' },
                { label: 'Notice', icon: <Icons.Notifications size={24} color="#f59e0b" />, bg: 'bg-amber-50', text: 'text-amber-900', action: 'Post Announcement' },
                { label: 'Assignment', icon: <Icons.Plus size={24} color="#8b5cf6" />, bg: 'bg-violet-50', text: 'text-violet-900', action: 'Create Assignment' },
                { label: 'Grade Work', icon: <Icons.Check size={24} color="#10b981" />, bg: 'bg-emerald-50', text: 'text-emerald-900', action: 'Grade Quiz' },
                { label: 'Class Reports', icon: <Icons.FileText size={24} color="#0ea5e9" />, bg: 'bg-sky-50', text: 'text-sky-900', action: 'View Report' },
              ].map((item, idx) => {
                const isFeatured = idx === 4;
                return (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => {
                      triggerHaptic();
                      onQuickAction(item.action);
                    }}
                    activeOpacity={0.7}
                    className={`${isFeatured ? 'w-full py-6 flex-row' : 'w-[48%] aspect-square flex-col'} justify-center items-center ${item.bg} rounded-[28px] border border-white shadow-sm active:scale-95`}
                  >
                    <View className={`bg-white/90 p-3 rounded-2xl shadow-md shadow-indigo-100/20 ${isFeatured ? 'mr-4' : 'mb-3'}`}>
                      {item.icon}
                    </View>
                    <View className={isFeatured ? 'items-start' : 'items-center'}>
                      <Text className={`text-[10px] font-inter-bold ${item.text} uppercase tracking-[1px] text-center px-2`}>
                        {item.label}
                      </Text>
                      {isFeatured && (
                        <Text className="text-[10px] text-gray-400 uppercase tracking-[1px] mt-1 font-inter-bold">Generate Analytics</Text>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
         </View>

        {/* MY UPLOADED MATERIALS */}
         <View className="mb-8">
          <SectionHeader
            title="MY LESSONS"
            rightElement={
              <StatusPill 
                label={`${teacherMaterials.length} Resources`} 
                type="neutral" 
              />
            }
          />
          <AppCard className="p-0 overflow-hidden border border-white shadow-xl shadow-indigo-100/30">
            {teacherMaterials.slice(0, 5).map((mat, idx) => {
              const isPDF = mat.type === 'PDF';
              
              return (
                <SwipeableRow
                  key={mat.id || idx}
                  canDelete={!!onDeleteMaterial}
                  onDelete={() => {
                    triggerHaptic(Haptics.ImpactFeedbackStyle.Heavy);
                    Alert.alert(
                      'Delete Material',
                      `Remove "${mat.title}" from the resource library? This cannot be undone.`,
                      [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Delete', style: 'destructive', onPress: () => onDeleteMaterial?.(mat.id) }
                      ]
                    );
                  }}
                >
                  <AppRow
                    title={mat.title}
                    titleProps={{ numberOfLines: 1, ellipsizeMode: 'middle' }}
                    subtitle={mat.subject || 'Class Resource'}
                    avatarIcon={
                      isPDF ? 
                      <Icons.FileText size={16} color="#4f46e5" /> : 
                      <Icons.Globe size={16} color="#0ea5e9" />
                    }
                    avatarBg={isPDF ? '#eef2ff' : '#f0f9ff'}
                    meta={formatAcademicTime(mat.created_at)} 
                    showBorder={idx < Math.min(teacherMaterials.length, 5) - 1}
                    onPress={() => handleOpenMaterial(mat.url)}
                    rightElement={
                       <View className={`px-2 py-1 rounded ${isPDF ? 'bg-indigo-50' : 'bg-sky-50'}`}>
                         <Text className={`text-[11px] font-inter-black ${isPDF ? 'text-indigo-600' : 'text-sky-600'}`}>
                            {mat.type}
                         </Text>
                       </View>
                    }
                  />
                </SwipeableRow>
              );
            })}
            {teacherMaterials.length === 0 && (
              <View className="items-center py-10">
                <Icons.FileText size={20} color="#cbd5e1" />
                <Text className="text-[10px] font-black text-gray-400 uppercase tracking-[1px] mt-2">No materials uploaded</Text>
              </View>
            )}
            {teacherMaterials.length > 5 && (
              <TouchableOpacity 
                onPress={() => onStatPress?.('materials')}
                className="py-4 items-center border-t border-gray-50 bg-gray-50/30 active:bg-gray-100"
              >
                <Text className="text-[10px] font-inter-black text-indigo-600 uppercase tracking-[1px]">
                  View My Lessons
                </Text>
              </TouchableOpacity>
            )}
          </AppCard>
        </View>

        {/* RECENT ACTIVITY - Just above Calendar */}
        <View className="mb-8">
          <SectionHeader
            title="RECENT ACTIVITY"
            className=""
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
                key={act.id || idx}
                title={act.title}
                subtitle={`${act.user} • ${act.time}`}
                avatarIcon={act.icon}
                avatarBg={act.bg}
                showBorder={idx < recentActivity.length - 1}
                rightElement={<Icons.ChevronRight size={12} color="#d1d5db" />}
              />
            )) : (
                <View className="items-center py-10">
                    <Icons.Notifications size={20} color="#cbd5e1" />
                    <Text className="text-[10px] font-black text-gray-400 uppercase tracking-[1px] mt-2">No recent system activity</Text>
                </View>
            )}
          </AppCard>
        </View>

         {/* INSTITUTIONAL CALENDAR */}
         <View className="mb-8">
           <SectionHeader
             title="INSTITUTIONAL CALENDAR"
             className=""
           />
          <AppCard className="p-2 border border-white shadow-xl shadow-indigo-100/30 overflow-hidden">
            <CalendarWidget compact={true} />
          </AppCard>
        </View>

         <View className="mt-10 items-center opacity-30">
           <View className="w-8 h-0.5 bg-gray-300 rounded-full mb-3" />
           <Text className="text-[9px] text-gray-400 uppercase tracking-[4px] font-inter-black">Verified Institutional Node</Text>
           <Text className="text-[8px] text-gray-400 mt-1 uppercase tracking-[1px] font-inter-black italic">Stable Connection established via TLS 1.3</Text>
         </View>
      </Animated.ScrollView>
    </View>
  );
});

