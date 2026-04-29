import React from 'react';
import { Animated, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { styled } from 'nativewind';
import { useSchoolData } from '../../../../contexts/SchoolDataContext';
import { Icons } from '../../../../components/Icons';
import { SystemHealthModal } from '../modals/SystemHealthModal';
import { ActionTile, AppCard, AppTheme, SectionHeader, StatCard, AppRow, StatusPill, inferPillType } from '../../../design-system';
import { formatGreetingName } from '../../../utils/nameUtils';

const StyledLinearGradient = LinearGradient ? styled(LinearGradient) : View;

interface PlatformHomeProps {
  institutes: any[];
  registrationMessages?: any[];
  isLoadingInquiries?: boolean;
  users: any[];
  currentUser: any;
  onVerify?: (id: string) => void;
  onReview?: (inst: any) => void;
  onNavigate?: (tab: string) => void;
}

export const PlatformHome: React.FC<PlatformHomeProps> = ({
  institutes,
  registrationMessages = [],
  isLoadingInquiries = false,
  users,
  currentUser,
  onReview,
  onNavigate,
}) => {
  const { systemLogs, fetchSystemLogs, healthStatus, dbLatency } = useSchoolData();
  const [isHealthModalVisible, setIsHealthModalVisible] = React.useState(false);

  const HEADER_MAX_HEIGHT = 290;
  const HEADER_MIN_HEIGHT = 100;
  const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;
  const scrollY = React.useRef(new Animated.Value(0)).current;

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

  React.useEffect(() => {
    fetchSystemLogs();
  }, [fetchSystemLogs]);

  const pendingInstitutes = (institutes || []).filter((i) => (i.status || '').toUpperCase() === 'PENDING');
  const activeInstitutes = (institutes || []).filter((i) => (i.status || '').toUpperCase() === 'ACTIVE');
  const activeCount = (users || []).filter((u) =>
    !u.status ||
    u.status?.toLowerCase() === 'active' ||
    u.status?.toLowerCase() === 'stable' ||
    u.status === 'Active'
  ).length;
  const onlineNow = (users || []).length > 0 ? Math.max(1, Math.floor((users || []).length * 0.15)) : 0;

  const criticalAuditLogs = (systemLogs || []).filter((log) => {
    const isRecent = (Date.now() - new Date(log.created_at).getTime()) < 24 * 60 * 60 * 1000;
    const isCritical = log.color === '#ef4444' || log.category === 'SECURITY' || log.icon === 'Alert';
    return isRecent && isCritical;
  });

  const securityStatus = criticalAuditLogs.length > 0 ? 'Review Required' : 'Protected';
  const newInquiries = (registrationMessages || []).filter((m) => m.status === 'NEW');

  const autoOverdueCount = (institutes || []).reduce((acc, inst) => {
    const now = new Date();
    const cycleDays = inst.billing_cycle_days || 30;
    const lastBilling = inst.last_billing_date ? new Date(inst.last_billing_date) : new Date(inst.created_at);
    const diffDays = (now.getTime() - lastBilling.getTime()) / (1000 * 60 * 60 * 24);
    const isTemporallyOverdue = diffDays > cycleDays && inst.billing_status?.toLowerCase() !== 'overdue';
    return isTemporallyOverdue ? acc + 1 : acc;
  }, 0);

  const systemStatusLabel = healthStatus === 'Optimal' ? 'Stable' : 'Attention';
  const onboardingSubtitle = pendingInstitutes.length > 0 ? `${pendingInstitutes.length} pending review` : 'Queue is clear';

  const stats = [
    {
      label: 'New Inquiries',
      value: isLoadingInquiries ? '...' : newInquiries.length,
      toneClassName: 'bg-indigo-50',
      icon: <Icons.Inbox size={22} color={AppTheme.colors.primary} />,
      onPress: () => onNavigate?.('leads'),
      subtitle: newInquiries.length > 0 ? `${newInquiries.length} new` : 'Up to date',
      subtitleTone: 'info' as const,
    },
    {
      label: 'Billing Audit',
      value: autoOverdueCount > 0 ? `${autoOverdueCount} Flagged` : 'Cleared',
      toneClassName: autoOverdueCount > 0 ? 'bg-amber-50' : 'bg-emerald-50',
      icon: <Icons.Shield size={22} color={autoOverdueCount > 0 ? AppTheme.colors.warning : AppTheme.colors.success} />,
      onPress: () => onNavigate?.('billing'),
      subtitle: autoOverdueCount > 0 ? 'Action required' : 'Synced',
      subtitleTone: autoOverdueCount > 0 ? 'warning' as const : 'success' as const,
    },
    {
      label: 'Active Institutes',
      value: activeInstitutes.length,
      toneClassName: 'bg-indigo-50',
      icon: <Icons.School size={22} color={AppTheme.colors.primary} />,
      onPress: () => onNavigate?.('institutes'),
      subtitle: `${institutes.length} total`,
      subtitleTone: 'info' as const,
    },
    {
      label: 'Active Users',
      value: activeCount,
      toneClassName: 'bg-emerald-50',
      icon: <Icons.Users size={22} color={AppTheme.colors.success} />,
      onPress: () => onNavigate?.('roles'),
      subtitle: `${onlineNow} online now`,
      subtitleTone: 'success' as const,
    },
    {
      label: 'System Health',
      value: systemStatusLabel,
      toneClassName: 'bg-emerald-50',
      icon: <Icons.Signal size={22} color={AppTheme.colors.success} />,
      onPress: () => setIsHealthModalVisible(true),
      subtitle: healthStatus || 'Optimal',
      subtitleTone: healthStatus === 'Optimal' ? 'success' as const : 'warning' as const,
    },
    {
      label: 'DB Latency',
      value: `${dbLatency || 0}ms`,
      toneClassName: 'bg-indigo-50',
      icon: <Icons.Activity size={22} color={AppTheme.colors.primary} />,
      onPress: () => setIsHealthModalVisible(true),
      subtitle: (dbLatency || 0) < 100 ? 'Peak' : 'Fair',
      subtitleTone: (dbLatency || 0) < 100 ? 'success' as const : 'warning' as const,
    },
  ];

  const growthData = [
    { month: 'Jan', value: 45 },
    { month: 'Feb', value: 52 },
    { month: 'Mar', value: 48 },
    { month: 'Apr', value: 65 },
    { month: 'May', value: 78 },
    { month: 'Jun', value: institutes.length > 0 ? Math.min(100, (institutes.length * 10) + 40) : 0 },
  ];

  return (
    <View className="flex-1 bg-[#f5f7ff]">
      <Animated.View style={{ height: headerHeight, zIndex: headerZindex, position: 'absolute', top: 0, left: 0, right: 0, paddingHorizontal: 16, paddingTop: 16 }}>
        <StyledLinearGradient colors={AppTheme.colors.gradients.brand} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} className="flex-1 rounded-[24px] p-5 shadow-xl shadow-indigo-200 relative overflow-hidden">
          <Animated.View style={{ transform: [{ translateY: brandTranslate }] }} className="flex-row items-center relative z-10">
            <Animated.View style={{ transform: [{ scale: logoScale }] }} className="w-12 h-12 bg-white/20 rounded-[16px] items-center justify-center mr-3 border border-white/30">
              <Icons.Shield size={24} color="white" />
            </Animated.View>
            <View className="flex-1">
              <Text className="text-xl font-black text-white tracking-tighter leading-6 font-inter-black">Command Center</Text>
              <Text className="text-indigo-100 text-[9px] font-black uppercase tracking-[3px] mt-0.5 opacity-85 font-inter-black">OurEduca Global</Text>
            </View>
          </Animated.View>

          <Animated.View style={{ opacity: greetingOpacity }} className="relative z-10 mt-5">
            <Text className="text-white/70 text-[9px] font-black uppercase tracking-[2px] mb-1 font-inter-black">Platform Administration</Text>
            <Text className="text-white text-xl font-black tracking-tighter leading-6 font-inter-black">Welcome back,</Text>
            <Text className="text-2xl font-black text-white tracking-tight leading-tight mt-0.5 font-inter-black">{formatGreetingName(currentUser?.name, 'Admin')} ✦</Text>
            <View className="flex-row items-center bg-white/10 self-start px-3 py-1 rounded-full border border-white/20 mt-3">
              <View className={`w-1.5 h-1.5 rounded-full mr-2 ${healthStatus === 'Optimal' ? 'bg-emerald-400' : 'bg-amber-300'}`} />
              <Text className="text-white text-[10px] font-bold font-inter-medium">
                System Status: <Text className={healthStatus === 'Optimal' ? 'text-emerald-300' : 'text-amber-200'}>{systemStatusLabel}</Text>
              </Text>
            </View>
          </Animated.View>

          <View className="absolute right-[-20] bottom-[-20] opacity-10 rotate-12">
            <Icons.Shield size={120} color="white" />
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
                pill={
                  <StatusPill
                    label={stat.subtitle}
                    className="self-center"
                    type={stat.subtitleTone === 'success' ? 'success' : stat.subtitleTone === 'warning' ? 'warning' : 'neutral'}
                  />
                }
              />
            </TouchableOpacity>
          ))}
        </View>
        


        {/* Institutional Onboarding Section — Profile-consistent Compactness */}
        <View className="mb-5">
          <View className="flex-row items-center mb-3 px-2">
            <View className="w-1 h-4 bg-indigo-500 rounded-full mr-2" />
            <Text className="text-[10px] font-black text-gray-900 uppercase tracking-[2px] font-inter-black">Institutional Onboarding</Text>
            {pendingInstitutes.length > 0 && (
              <View className="bg-amber-500 px-2 py-0.5 rounded-full ml-2">
                <Text className="text-white text-[8px] font-black tracking-widest">{pendingInstitutes.length}</Text>
              </View>
            )}
          </View>

          <AppCard className="p-0 overflow-hidden">
            {pendingInstitutes.length > 0 ? (
              <View>
                {pendingInstitutes.slice(0, 3).map((inst, index) => {
                  return (
                    <AppRow
                      key={inst.id}
                      title={inst.name}
                      subtitle={inst.plan || 'Standard'}
                      avatarLetter={inst.name?.charAt(0)?.toUpperCase() || 'S'}
                      avatarBg="#eef2ff"
                      avatarColor="#4f46e5"
                      showBorder={index < Math.min(pendingInstitutes.length, 3) - 1}
                      onPress={() => onReview?.(inst)}
                      rightElement={
                        <View className="flex-row items-center bg-indigo-50 border border-indigo-100 rounded-xl px-3 py-1.5">
                          <Text className="text-[9px] font-black text-indigo-600 uppercase tracking-wider mr-1 font-inter-black">Review</Text>
                          <Icons.ChevronRight size={10} color="#4f46e5" />
                        </View>
                      }
                    />
                  );
                })}
              </View>
            ) : (
              <View className="items-center py-8">
                <View className="w-12 h-12 rounded-2xl bg-emerald-50 items-center justify-center mb-3 border border-emerald-100">
                  <Icons.Check size={20} color={AppTheme.colors.success} />
                </View>
                <Text className="text-[13px] font-black text-gray-900 font-inter-black">Queue is clear</Text>
                <Text className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1 font-inter-black">No pending reviews</Text>
              </View>
            )}

            <TouchableOpacity
              onPress={() => onNavigate?.('institutes_pending')}
              className="flex-row items-center justify-center py-3.5 border-t border-gray-50 bg-gray-50/30 active:bg-gray-100/50"
            >
              <Text className="text-[9px] font-black text-indigo-600 uppercase tracking-widest font-inter-black">View All Institutes</Text>
              <Icons.ChevronRight size={11} color="#4f46e5" className="ml-1" />
            </TouchableOpacity>
          </AppCard>
        </View>

        {/* Growth Overview Section — Compact Eyebrow Style */}
        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-3 px-2">
            <View className="flex-row items-center">
              <View className="w-1 h-4 bg-indigo-500 rounded-full mr-2" />
              <Text className="text-[10px] font-black text-gray-900 uppercase tracking-[2px] font-inter-black">Growth Overview</Text>
            </View>
            <StatusPill label="+12.4%" type="success" className="self-center" />
          </View>

          <AppCard className="p-5">
            <View className="h-52 flex-row items-end justify-between px-2 relative">
              <View className="absolute inset-0 h-40 justify-between py-1 opacity-5">
                {[1, 2, 3, 4].map((i) => <View key={i} className="h-[1px] bg-gray-900 w-full" />)}
              </View>

              {growthData.map((d) => (
                <View key={d.month} className="items-center flex-1">
                  <View className="relative w-8 items-center justify-end h-40">
                    <View className="absolute inset-0 bg-gray-50/80 rounded-t-2xl w-full" />
                    <StyledLinearGradient
                      colors={AppTheme.colors.gradients.brand}
                      className="rounded-t-2xl w-full shadow-lg shadow-indigo-100"
                      style={{ height: `${d.value}%` }}
                    />
                  </View>
                  <Text className="text-[9px] font-black mt-4 uppercase text-gray-400 tracking-widest">{d.month}</Text>
                </View>
              ))}
            </View>
          </AppCard>
        </View>

        {/* Activity Log Section — Compact Eyebrow Style */}
        <View className="mb-8">
          <View className="flex-row items-center mb-3 px-2">
            <View className="w-1 h-4 bg-indigo-500 rounded-full mr-2" />
            <Text className="text-[10px] font-black text-gray-900 uppercase tracking-[2px] font-inter-black">Activity Log</Text>
          </View>

          <AppCard className="p-0 overflow-hidden">

          {/* Activity Log — AppRow timeline */}
          <View>
            {systemLogs.slice(0, 5).map((item, index) => {
              const IconComp = (Icons as any)[item.icon] || Icons.Activity;
              const category = item.category || 'SYSTEM';
              const catPillType =
                category === 'SECURITY'    ? 'danger'  :
                category === 'BILLING'     ? 'warning' :
                category === 'INSTITUTION' ? 'info'    : 'neutral';
              const timeStr = new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              const dateStr = new Date(item.created_at).toLocaleDateString([], { month: 'short', day: '2-digit' });

              return (
                <AppRow
                  key={item.id}
                  title={item.title}
                  subtitle={`${dateStr} · ${timeStr}`}
                  statusDot={
                    category === 'SECURITY' ? 'danger' :
                    category === 'BILLING'  ? 'pending' : 'none'
                  }
                  avatarIcon={<IconComp size={14} color={item.color || AppTheme.colors.primary} />}
                  avatarBg={item.color ? `${item.color}18` : '#eef2ff'}
                  pills={
                    <StatusPill label={category} type={catPillType} />
                  }
                  showBorder={index < Math.min(systemLogs.length, 5) - 1}
                  rightElement={
                    <Icons.ChevronRight size={13} color="#d1d5db" />
                  }
                />
              );
            })}

            {systemLogs.length === 0 && (
              <View className="items-center py-10">
                <View className="w-12 h-12 rounded-2xl bg-gray-50 items-center justify-center mb-3 border border-gray-100">
                  <Icons.Database size={22} color="#cbd5e1" />
                </View>
                <Text className="text-[13px] font-black text-gray-900 font-inter-black">No activity recorded</Text>
                <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1 font-inter-black">The ledger is currently quiet</Text>
              </View>
            )}

            <TouchableOpacity
              onPress={() => onNavigate?.('AuditTrail')}
              className="flex-row items-center justify-center py-3.5 border-t border-gray-50 bg-gray-50/30 active:bg-gray-100/50"
            >
              <Text className="text-[9px] font-black text-indigo-600 uppercase tracking-widest font-inter-black">View All Activity</Text>
              <Icons.ChevronRight size={11} color="#4f46e5" className="ml-1" />
            </TouchableOpacity>
          </View>
        </AppCard>
      </View>
      </Animated.ScrollView>

      <SystemHealthModal visible={isHealthModalVisible} onClose={() => setIsHealthModalVisible(false)} />
    </View>
  );
};
