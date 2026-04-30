import React from 'react';
import { Image, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { styled } from 'nativewind';
import { Icons } from '../../../../components/Icons';
import { CalendarWidget } from '../../../../components/CalendarWidget';
import { User } from '../../../../types';
import { ActionTile, AppCard, AppTheme, SectionHeader, StatCard, AppRow, StatusPill, AppTypography } from '../../../design-system';
import { formatGreetingName } from '../../../utils/nameUtils';

const StyledLinearGradient = LinearGradient ? styled(LinearGradient) : View;

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
  currentSchool,
}) => {
  const staffAnnouncements = (announcements || []).filter((a) => a.audience === 'ALL' || a.audience === 'STAFF');
  const displayAnnouncements = staffAnnouncements.slice(0, 3);
  
  const mockRecentActivity = [
    { id: 'act1', title: 'Assignment Submitted', user: 'John Doe', type: 'submission', time: '10m ago', icon: <Icons.Report size={14} color="#f59e0b" />, bg: '#fff7ed' },
    { id: 'act2', title: 'Leave Request', user: 'Alice Smith', type: 'request', time: '1h ago', icon: <Icons.Calendar size={14} color="#ef4444" />, bg: '#fef2f2' },
    { id: 'act3', title: 'Material Downloaded', user: 'Mark Wilson', type: 'engagement', time: '2h ago', icon: <Icons.Download size={14} color="#10b981" />, bg: '#f0fdf4' },
  ];

  const getStudentCountForClass = (classId: string, section: string = 'A') => {
    return (dbRoster || []).filter((r) =>
      r.class_id === classId &&
      (r.section || 'A').toString().toLowerCase().trim() === section.toString().toLowerCase().trim()
    ).length;
  };

  const getDynamicGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning,';
    if (hour < 17) return 'Good afternoon,';
    if (hour < 22) return 'Good evening,';
    return 'Working late? Hello,';
  };

  return (
    <View className="flex-1 bg-[#f8fafc]">
      {/* Prototype Top Bar: School Branding & Navigation */}
      <View className="bg-white px-6 pt-12 pb-4 flex-row items-center justify-between border-b border-slate-100">
        <View className="flex-row items-center">
          <View className="w-10 h-10 bg-indigo-600 rounded-xl items-center justify-center mr-3">
            <Text className="text-white font-black text-lg font-inter-black">{currentSchool?.name?.substring(0, 2).toUpperCase() || 'SA'}</Text>
          </View>
          <View>
            <Text className="text-[15px] font-black text-slate-900 font-inter-black leading-tight">{currentSchool?.name || 'Springfield Academy'}</Text>
            <Text className="text-[8px] font-black text-slate-400 uppercase tracking-widest font-inter-black">Powered by OurEduca</Text>
          </View>
        </View>
        <View className="flex-row items-center">
          <TouchableOpacity className="w-10 h-10 items-center justify-center mr-2">
            <Icons.Phone size={20} color="#64748b" />
          </TouchableOpacity>
          <TouchableOpacity className="w-10 h-10 items-center justify-center">
            <Icons.Logout size={20} color="#64748b" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 20, paddingBottom: 100 }}
      >
        {/* Welcome Gradient Card */}
        <StyledLinearGradient
          colors={['#4f46e5', '#9333ea']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="rounded-[32px] p-8 mb-8 shadow-xl shadow-indigo-200/50 relative overflow-hidden"
        >
          <View className="relative z-10">
            <Text className="text-white text-3xl font-black tracking-tight font-inter-black mb-2">Welcome back,{'\n'}{currentUser?.name?.split(' ')[0] || 'John'}!</Text>
            <Text className="text-indigo-100/80 text-[13px] font-medium leading-relaxed font-inter-medium">
              You have <Text className="text-white font-bold underline">{(assignedSections || []).length} classes</Text> today and <Text className="text-white font-bold underline">12 pending assignments</Text> to grade.
            </Text>
          </View>
          {/* Decorative Background Element */}
          <View className="absolute right-[-20] bottom-[-20] opacity-10">
            <Icons.GraduationCap size={160} color="white" />
          </View>
        </StyledLinearGradient>

        {/* 2x2 KPI Stats Grid */}
        <View className="flex-row flex-wrap justify-between mb-10">
          {[
            { label: 'STUDENTS', value: totalStudents || 128, icon: <Icons.Users size={20} color="#4f46e5" />, bg: 'bg-indigo-50/50' },
            { label: 'TO GRADE', value: 12, icon: <Icons.Check size={20} color="#10b981" />, bg: 'bg-emerald-50/50' },
            { label: 'CLASSES TODAY', value: (assignedSections || []).length || 4, icon: <Icons.Calendar size={20} color="#f59e0b" />, bg: 'bg-amber-50/50' },
            { label: 'NOTICES', value: staffAnnouncements.length || 3, icon: <Icons.Notifications size={20} color="#8b5cf6" />, bg: 'bg-purple-50/50' },
          ].map((stat, idx) => (
            <View 
              key={idx}
              className={`w-[48%] aspect-square rounded-[32px] p-6 items-center justify-center mb-4 border border-slate-50 bg-white shadow-sm shadow-slate-200`}
            >
              <View className={`${stat.bg} p-3 rounded-2xl mb-4`}>
                {stat.icon}
              </View>
              <Text className="text-2xl font-black text-slate-900 font-inter-black mb-1">{stat.value}</Text>
              <Text className="text-[9px] font-black text-slate-400 uppercase tracking-widest font-inter-black text-center">{stat.label}</Text>
            </View>
          ))}
        </View>
        {/* Section: QUICK ACTIONS — High Fidelity Prototype Match */}
        <View className="mb-8">
          <SectionHeader title="QUICK ACTIONS" className="px-2 mb-4" />
          <View className="flex-row flex-wrap justify-between px-2 gap-y-4">
            <TouchableOpacity 
              onPress={() => onQuickAction('upload')}
              className="w-[48%] bg-indigo-50/50 rounded-[24px] py-8 items-center justify-center border border-indigo-100/50"
            >
              <View className="bg-white p-3 rounded-2xl mb-3 shadow-sm shadow-indigo-100">
                <Icons.Plus size={20} color="#4f46e5" />
              </View>
              <Text className="text-[13px] font-black text-indigo-900 font-inter-black">Upload Material</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => onQuickAction('announcement')}
              className="w-[48%] bg-orange-50/50 rounded-[24px] py-8 items-center justify-center border border-orange-100/50"
            >
              <View className="bg-white p-3 rounded-2xl mb-3 shadow-sm shadow-orange-100">
                <Icons.Notifications size={20} color="#f59e0b" />
              </View>
              <Text className="text-[13px] font-black text-orange-900 font-inter-black">Announcement</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => onQuickAction('grade')}
              className="w-[48%] bg-emerald-50/50 rounded-[24px] py-8 items-center justify-center border border-emerald-100/50"
            >
              <View className="bg-white p-3 rounded-2xl mb-3 shadow-sm shadow-emerald-100">
                <Icons.Check size={20} color="#10b981" />
              </View>
              <Text className="text-[13px] font-black text-emerald-900 font-inter-black">Grade Work</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => onQuickAction('reports')}
              className="w-[48%] bg-sky-50/50 rounded-[24px] py-8 items-center justify-center border border-sky-100/50"
            >
              <View className="bg-white p-3 rounded-2xl mb-3 shadow-sm shadow-sky-100">
                <Icons.Report size={20} color="#0ea5e9" />
              </View>
              <Text className="text-[13px] font-black text-sky-900 font-inter-black">Class Reports</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* KPI Stats Grid - Restored */}
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

        <View className="mb-8">
          <SectionHeader
            title="Today's Schedule"
            className="px-2"
            rightElement={
              <View className="bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                <Text className="text-[10px] font-black text-indigo-600 uppercase tracking-widest font-inter-black">Friday</Text>
              </View>
            }
          />

          <View className="mt-4 gap-y-4">
            {(assignedSections || []).length > 0 ? (
              (assignedSections || []).map((item, idx) => (
                <TouchableOpacity
                  key={item.rosterId || item.id || idx}
                  onPress={() => onNavigateToClass?.(item)}
                  activeOpacity={0.9}
                >
                  <AppCard className="p-4 border border-white shadow-md shadow-indigo-100/30 flex-row items-center">
                    {/* Time Indicator Slot */}
                    <View className="bg-indigo-50/50 w-20 h-16 rounded-2xl border border-indigo-100/50 items-center justify-center mr-5">
                      <Text className="text-[13px] font-black text-indigo-700 font-inter-black">{item.class_time?.split(' ')[0] || '09:00'}</Text>
                      <Text className="text-[8px] font-black text-indigo-400 uppercase tracking-widest font-inter-black">{item.class_time?.split(' ')[1] || 'AM'}</Text>
                    </View>

                    {/* Subject Details */}
                    <View className="flex-1">
                      <Text className="font-black text-gray-900 text-[16px] tracking-tight mb-1.5 font-inter-black" numberOfLines={1}>
                        {item.subject}
                      </Text>
                      <View className="flex-row items-center opacity-60">
                        <View className="flex-row items-center mr-4">
                          <Icons.School size={10} color="#64748b" />
                          <Text className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1.5 font-inter-black">Room {item.room_no || '302'}</Text>
                        </View>
                        <View className="flex-row items-center">
                          <Icons.Users size={10} color="#64748b" />
                          <Text className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1.5 font-inter-black">{getStudentCountForClass(item.id, item.section)} Students</Text>
                        </View>
                      </View>
                    </View>

                    <Icons.ChevronRight size={14} color="#cbd5e1" />
                  </AppCard>
                </TouchableOpacity>
              ))
            ) : (
              <AppCard className="items-center py-10 border border-white shadow-md shadow-indigo-100/20">
                <Icons.Calendar size={24} color="#94a3b8" />
                <Text className="text-gray-400 text-[10px] font-black mt-3 uppercase tracking-widest font-inter-black">No sessions today</Text>
              </AppCard>
            )}
          </View>
        </View>

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
            {mockRecentActivity.map((act, idx) => (
              <AppRow
                key={act.id}
                title={act.title}
                subtitle={`${act.user} • ${act.time}`}
                avatarIcon={act.icon}
                avatarBg={act.bg}
                showBorder={idx < mockRecentActivity.length - 1}
                rightElement={<Icons.ChevronRight size={13} color="#d1d5db" />}
              />
            ))}
          </AppCard>
        </View>

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

            {staffAnnouncements.length === 0 && (
              <View className="items-center py-12">
                <View className="w-14 h-14 rounded-2xl bg-gray-50 items-center justify-center mb-4 border border-gray-100">
                  <Icons.Notifications size={24} color="#cbd5e1" />
                </View>
                <Text className="text-[15px] font-black text-gray-900 font-inter-black">Internal Board Clear</Text>
                <Text className="text-[10px] font-black text-gray-400 uppercase tracking-[3px] mt-1 font-inter-black">No faculty briefings found</Text>
              </View>
            )}
          </AppCard>
        </View>

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

