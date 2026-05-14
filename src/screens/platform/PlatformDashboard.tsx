import React from 'react';
import { Animated, Text, TouchableOpacity, View, Platform, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSchoolData } from '@context/SchoolDataContext';
import { useSystemStatus } from '@context/SystemStatusContext';
import { Icons } from '@components/common/Icons';
import { SystemHealthModal } from './modals/SystemHealthModal';
import { ActionTile, AppCard, AppTheme, SectionHeader, StatCard, AppRow, StatusPill, inferPillType, CalendarWidget, PlatinumChart } from '@components/common';
import { formatGreetingName } from '@utils/nameUtils';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const StyledLinearGradient = LinearGradient || View;

interface PlatformDashboardProps {
  institutes: any[];
  registrationMessages?: any[];
  isLoadingInquiries?: boolean;
  users: any[];
  currentUser: any;
  onVerify?: (id: string) => void;
  onReview?: (inst: any) => void;
  onNavigate?: (tab: string) => void;
  onRefresh?: () => void;
  refreshing?: boolean;
}

export const PlatformDashboard: React.FC<PlatformDashboardProps> = ({
  institutes,
  registrationMessages = [],
  isLoadingInquiries = false,
  users,
  currentUser,
  onReview,
  onNavigate,
  onRefresh,
  refreshing = false,
}) => {
  const { systemLogs, fetchSystemLogs } = useSchoolData();
  const { systemStatus } = useSystemStatus();
  const [isHealthModalVisible, setIsHealthModalVisible] = React.useState(false);
  const insets = useSafeAreaInsets();

  const HEADER_MIN_HEIGHT = Platform.OS === 'ios' ? 100 : 80;
  const HEADER_MAX_HEIGHT = insets.top + 260;
  const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;
  const scrollY = React.useRef(new Animated.Value(0)).current;

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

  const systemStatusLabel = systemStatus.health === 'Optimal' ? 'Stable' : 'Attention';
  const onboardingSubtitle = pendingInstitutes.length > 0 ? `${pendingInstitutes.length} pending review` : 'Queue is clear';

  const stats = [
    {
      label: 'New Inquiries',
      value: isLoadingInquiries ? '...' : newInquiries.length,
      toneClassName: 'bg-indigo-50',
      icon: <Icons.Inbox size={22} color={AppTheme.colors.primary} />,
      onPress: () => onNavigate?.('leads'),
      trend: newInquiries.length > 0 ? 'Action' : 'Cleared',
      trendType: newInquiries.length > 0 ? 'up' : 'neutral' as const,
    },
    {
      label: 'Billing Audit',
      value: autoOverdueCount > 0 ? `${autoOverdueCount} Flagged` : 'Cleared',
      toneClassName: autoOverdueCount > 0 ? 'bg-amber-50' : 'bg-emerald-50',
      icon: <Icons.Shield size={22} color={autoOverdueCount > 0 ? AppTheme.colors.warning : AppTheme.colors.success} />,
      onPress: () => onNavigate?.('billing'),
      trend: autoOverdueCount > 0 ? 'Urgent' : 'Stable',
      trendType: autoOverdueCount > 0 ? 'down' : 'neutral' as const,
    },
    {
      label: 'Active Institutes',
      value: activeInstitutes.length,
      toneClassName: 'bg-indigo-50',
      icon: <Icons.School size={22} color={AppTheme.colors.primary} />,
      onPress: () => onNavigate?.('institutes'),
      trend: activeInstitutes.length > 0 ? 'Live' : 'Zero',
      trendType: 'up' as const,
    },
    {
      label: 'Active Users',
      value: activeCount,
      toneClassName: 'bg-emerald-50',
      icon: <Icons.Users size={22} color={AppTheme.colors.success} />,
      onPress: () => onNavigate?.('roles'),
      trend: activeCount > 0 ? 'Online' : 'Offline',
      trendType: 'up' as const,
    },
    {
      label: 'System Health',
      value: systemStatusLabel,
      toneClassName: 'bg-emerald-50',
      icon: <Icons.Signal size={22} color={AppTheme.colors.success} />,
      onPress: () => setIsHealthModalVisible(true),
      trend: systemStatus.health === 'Optimal' ? 'Peak' : 'Review',
      trendType: systemStatus.health === 'Optimal' ? 'up' : 'down' as const,
    },
    {
      label: 'DB Latency',
      value: `${systemStatus.latency || 0}ms`,
      toneClassName: 'bg-indigo-50',
      icon: <Icons.Activity size={22} color={AppTheme.colors.primary} />,
      onPress: () => setIsHealthModalVisible(true),
      trend: (systemStatus.latency || 0) < 100 ? 'Fast' : 'Delayed',
      trendType: (systemStatus.latency || 0) < 100 ? 'up' : 'down' as const,
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

  const getDynamicGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning,';
    if (hour < 17) return 'Good afternoon,';
    if (hour < 22) return 'Good evening,';
    return 'Working late? Hello,';
  };

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
                <Icons.Shield size={20} color="white" />
              </Animated.View>
              <View className="flex-1">
                <Text className="text-[18px] text-white tracking-tighter leading-6 font-inter-black" numberOfLines={1}>
                  Command Center
                </Text>
                <Text className="text-white text-[9px] uppercase tracking-[2px] opacity-90 font-inter-black">OurEduca Global</Text>
              </View>
            </View>

            <TouchableOpacity 
                onPress={() => onNavigate?.('audit')}
                className="w-10 h-10 rounded-full bg-white/10 items-center justify-center border border-white/20 flex-none"
            >
                <Icons.Notifications size={16} color="white" />
            </TouchableOpacity>
          </Animated.View>

          <Animated.View style={{ opacity: greetingOpacity }} className="relative z-10 mt-3">
            <View>
                <Text className="text-white/90 text-[9px] uppercase tracking-[2px] mb-0.5 font-inter-black">Platform Workflow</Text>
                <Text className="text-white text-[20px] tracking-tighter leading-7 font-inter-black">{getDynamicGreeting()}</Text>
                <Text className="text-[26px] text-brand-accent tracking-tighter leading-8 font-inter-black">
                    {formatGreetingName(currentUser?.name, 'Admin')}!
                </Text>
                
                {/* Natural Language Status Sentence with Dynamic Highlighting */}
                <Text 
                    className="text-[14px] text-white mt-2.5 leading-6 font-inter-medium opacity-95"
                    style={{ maxWidth: '95%' }}
                >
                    Currently overseeing <Text className="text-brand-accent font-inter-black">{activeInstitutes.length}</Text> institutes, 
                    <Text className="text-brand-accent font-inter-black"> {pendingInstitutes.length}</Text> pending reviews, 
                    and <Text className="text-brand-accent font-inter-black">{newInquiries.length}</Text> new inquiries.
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
        <View className="flex-row flex-wrap justify-between mb-4">
          {stats.map((stat, idx) => {
            const mappedTone = 
              stat.toneClassName === 'bg-indigo-50' ? 'indigo' :
              stat.toneClassName === 'bg-emerald-50' ? 'emerald' :
              stat.toneClassName === 'bg-amber-50' ? 'amber' : 'indigo';

            return (
              <View key={`platform-stat-${idx}`} className="w-[48.2%] mb-4">
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
            <PlatinumChart 
                data={growthData.map(d => ({ label: d.month, value: d.value }))}
                height={176}
            />
          </AppCard>
        </View>

        {/* Personal Schedule Section */}
        <View className="mb-10">
          <SectionHeader 
            title="MY SCHEDULE" 
            subtitle="SYSTEM REMINDERS"
            className="mb-4 px-2"
          />
          <AppCard className="p-5 border border-white shadow-xl shadow-indigo-100/30">
            <CalendarWidget compact={true} canAddEvents={true} />
          </AppCard>
        </View>
      </Animated.ScrollView>

      <SystemHealthModal visible={isHealthModalVisible} onClose={() => setIsHealthModalVisible(false)} />
    </View>
  );
};
