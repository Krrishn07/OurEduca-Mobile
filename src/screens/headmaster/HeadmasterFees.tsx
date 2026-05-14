import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Platform, TextInput } from 'react-native';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Icons } from '@components/common/Icons';
import {
  AppTheme, 
  AppCard, 
  AppTypography,
  AppRow, 
  AppFilterBar, 
  StatusPill, 
  SectionHeader,
  PlatinumHeader,
  StatCard,
  PlatinumChart
} from '@components/common';
import { triggerHaptic } from '@utils/haptics';
import { formatDetailedDate } from '@utils/timeUtils';

interface HeadmasterFeesProps {
  paymentNotifications: any[];
  onVerify: (transactionId: string, feeId: string) => Promise<void>;
  onSettleManual?: (feeId: string, studentId: string, amount: number) => Promise<void>;
  onCreateFee?: () => void;
  onSendReminder?: () => void;
  onViewLedger?: () => void;
  onViewReport?: () => void;
  collectionTrends: { month: string; value: number; raw: number }[];
  totalCollected: number;
  pendingVerification: number;
}

export const HeadmasterFees: React.FC<HeadmasterFeesProps> = ({
  paymentNotifications = [],
  onVerify,
  onCreateFee,
  onSendReminder,
  onViewLedger,
  onViewReport,
  collectionTrends = [],
  totalCollected = 0,
  pendingVerification = 0,
}) => {
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'Verify Now' | 'Verified'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const counts = useMemo(() => ({
    ALL:        paymentNotifications.length,
    'Verify Now': paymentNotifications.filter(p => p.status === 'Verify Now' || p.status === 'Flagged').length,
    Verified:   paymentNotifications.filter(p => p.status === 'Verified').length,
  }), [paymentNotifications]);

  const filterChips = [
    { label: 'ALL',     value: 'ALL'        as const, count: counts.ALL         },
    { label: 'PENDING', value: 'Verify Now' as const, count: counts['Verify Now'] },
    { label: 'SETTLED', value: 'Verified'   as const, count: counts.Verified    },
  ];

  const filteredNotifications = useMemo(() => {
    let list = paymentNotifications;
    
    // 1. Filter by Search Query
    if (searchQuery.trim().length > 0) {
        const query = searchQuery.toLowerCase().trim();
        list = list.filter(pay => 
            (pay.schoolName || '').toLowerCase().includes(query) ||
            (pay.studentName || '').toLowerCase().includes(query) ||
            (pay.feeTitle || '').toLowerCase().includes(query)
        );
    }

    // 2. Filter by Chip Status
    return list.filter(pay =>
        activeFilter === 'ALL' || pay.status === activeFilter || (activeFilter === 'Verify Now' && pay.status === 'Flagged')
    );
  }, [paymentNotifications, activeFilter, searchQuery]);

  const stats = [
    { 
        label: 'Collected', 
        value: `₹${(totalCollected / 100000).toFixed(1)}L`, 
        icon: <Icons.Payment size={14} color="#10b981" />, 
        tone: 'emerald' as const,
        trend: '+12.4%',
        trendType: 'up' as const
    },
    { 
        label: 'Approval Pool', 
        value: `₹${(pendingVerification / 1000).toFixed(1)}K`, 
        icon: <Icons.Alert size={14} color="#f43f5e" />, 
        tone: 'rose' as const,
        trend: 'Critical',
        trendType: 'down' as const,
        onPress: () => { triggerHaptic(); setActiveFilter('Verify Now'); }
    },
    { 
        label: 'To Verify', 
        value: counts['Verify Now'].toString(), 
        icon: <Icons.Clock size={14} color="#4f46e5" />, 
        tone: 'indigo' as const,
        trend: 'Action Required',
        trendType: 'neutral' as const
    },
  ];

  return (
    <View className="flex-1 bg-[#fbfbfe]">
      <PlatinumHeader 
        title="Fees & Accounts"
        subtitle="INSTITUTIONAL LEDGER"
        rightAction={
            <TouchableOpacity 
                onPress={() => { triggerHaptic(); onCreateFee?.(); }}
                className="w-9 h-9 bg-indigo-600 rounded-full items-center justify-center shadow-md shadow-indigo-200 active:scale-95"
            >
                <Icons.Plus size={18} color="white" />
            </TouchableOpacity>
        }
      />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 20, paddingHorizontal: 20, paddingBottom: 100 }}
      >
        {/* Stats Grid */}
        <View className="flex-row gap-3 mb-8">
          {stats.map((stat, i) => (
            <View key={i} className="flex-1">
                <StatCard 
                    index={i}
                    label={stat.label}
                    value={stat.value}
                    icon={stat.icon}
                    tone={stat.tone as any}
                    trend={stat.trend}
                    trendType={stat.trendType}
                    onPress={(stat as any).onPress}
                />
            </View>
          ))}
        </View>

        {/* Section: Collection History */}
        <View className="mb-8">
          <SectionHeader 
            title="COLLECTION TRENDS"
            className="px-1"
            rightElement={
                <TouchableOpacity onPress={() => { triggerHaptic(); onViewReport?.(); }} className="bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100 active:bg-indigo-100">
                  <Text className="text-[10px] text-indigo-600 uppercase tracking-[1px] font-inter-bold">Detailed Report</Text>
                </TouchableOpacity>
            }
          />
          <AppCard className="p-6 border border-white shadow-xl shadow-indigo-100/30">
            <PlatinumChart 
                data={collectionTrends.map(d => ({ label: d.month, value: d.value }))}
                height={160}
            />
          </AppCard>
        </View>

        {/* Section: Quick Management */}
        <View className="mb-8">
          <SectionHeader 
            title="QUICK ACTIONS"
            className="px-1"
          />
          <View className="flex-row flex-wrap justify-between">
            {[
              { title: 'New Invoice',   subtitle: 'Generate one-time bill', icon: <Icons.Plus size={16} color="#4f46e5" />,   tone: 'indigo', action: onCreateFee   },
              { title: 'Send Reminders', subtitle: 'Nudge pending students', icon: <Icons.Notifications size={16} color="#f43f5e" />,   tone: 'rose',     action: onSendReminder },
              { title: 'Scholar Ledger', subtitle: 'View student history', icon: <Icons.Profile size={16} color="#10b981" />,  tone: 'emerald', action: onViewLedger },
              { title: 'Audit Reports',  subtitle: 'Export monthly PDF', icon: <Icons.Report size={16} color="#9333ea" />,  tone: 'purple', action: onViewReport  },
            ].map((a, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => { triggerHaptic(); a.action?.(); }}
                  activeOpacity={0.8}
                  className="w-[48.2%] bg-white p-4 rounded-[28px] border border-white items-start shadow-xl shadow-indigo-100/20 mb-4 active:scale-95"
                >
                  <View className={`w-10 h-10 rounded-2xl bg-${a.tone}-50 items-center justify-center mb-3 border border-${a.tone}-100 shadow-sm`}>
                    {a.icon}
                  </View>
                  <Text className="font-black text-slate-900 text-[13px] tracking-tight font-inter-black">{a.title}</Text>
                  <Text className="text-[9px] text-gray-400 mt-1 uppercase font-inter-black">{a.subtitle}</Text>
                </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Section: Recent Transaction Stream */}
        <View className="mb-10">
          <SectionHeader 
            title="TRANSACTION STREAM"
            className="px-1"
            rightElement={
              counts['Verify Now'] > 0 && (
                <StatusPill 
                  label={`${counts['Verify Now']} TO VERIFY`} 
                  type="warning" 
                />
              )
            }
          />
          <AppCard className="p-0 overflow-hidden border border-white shadow-xl shadow-indigo-100/30 rounded-[28px]">
            {/* High-Fidelity Search Bar */}
            <View className="px-4 pt-4 pb-2">
                <View className="bg-gray-50/80 p-3 rounded-[20px] border border-gray-100 flex-row items-center">
                    <Icons.Search size={16} color="#94a3b8" />
                    <TextInput
                        className="flex-1 ml-3 text-[13px] font-inter-semibold text-gray-900"
                        placeholder="Search students, invoices..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholderTextColor="#94a3b8"
                        autoCapitalize="none"
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Icons.Close size={14} color="#94a3b8" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <AppFilterBar
              chips={filterChips}
              active={activeFilter}
              onChange={(f) => { triggerHaptic(); setActiveFilter(f); }}
              className="border-b border-gray-50 bg-gray-50/20"
            />

            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((pay: any, idx) => {
                const isSettled = pay.status === 'Verified';
                const isFlagged = pay.status === 'Flagged';
                const studentName = pay.users?.name || 'Scholar Registry';
                const feeTitle = pay.fees?.title || pay.title || 'Institutional Fee';
                
                // Format relative date
                let displayDate = 'N/A';
                const rawDate = pay.paid_at || pay.created_at || pay.date;
                if (rawDate && rawDate !== 'N/A') {
                    const d = new Date(rawDate);
                    if (!isNaN(d.getTime())) {
                        displayDate = formatDetailedDate(d);
                    }
                }

                return (
                  <Animated.View key={pay.id || idx} entering={FadeInDown.delay(idx * 50)} layout={Layout.springify()}>
                    <AppRow
                      title={studentName}
                      subtitle={`${feeTitle} · ${displayDate}`}
                      avatarIcon={<Icons.Profile size={16} color={isSettled ? '#10b981' : isFlagged ? '#f43f5e' : '#4f46e5'} />}
                      avatarBg={isSettled ? '#f0fdf4' : isFlagged ? '#fff1f2' : '#eef2ff'}
                      showBorder={idx < filteredNotifications.length - 1}
                      onPress={() => { triggerHaptic(); if (!isSettled) onVerify(pay.id, pay.feeId); }}
                      className="px-1"
                      innerClassName="bg-white"
                      rightElement={
                        <View className="items-end">
                            <Text className="text-[13px] font-black text-slate-900 font-inter-black mb-1.5">₹{pay.amount}</Text>
                            {!isSettled ? (
                            <TouchableOpacity
                                onPress={() => { triggerHaptic(); onVerify(pay.id, pay.feeId); }}
                                className="bg-indigo-600 px-3 py-1.5 rounded-xl shadow-md shadow-indigo-100 active:scale-95"
                            >
                                <Text className="text-white text-[9px] font-black uppercase tracking-[1px] font-inter-black">VERIFY</Text>
                            </TouchableOpacity>
                            ) : (
                            <View className="bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100 flex-row items-center">
                                <Icons.Check size={10} color="#10b981" />
                                <Text className="text-emerald-600 text-[8px] font-black uppercase tracking-wider ml-1 font-inter-black">SETTLED</Text>
                            </View>
                            )}
                        </View>
                      }
                    />
                  </Animated.View>
                );
              })
            ) : (
              <View className="py-20 items-center">
                <View className="w-16 h-16 bg-gray-50 rounded-[20px] items-center justify-center mb-4 border border-gray-100 shadow-inner">
                  <Icons.Payment size={32} color="#e5e7eb" />
                </View>
                <Text className="text-[14px] font-black text-gray-900 font-inter-black">Clear Ledger</Text>
                <Text className="text-[10px] font-black text-gray-400 uppercase tracking-[2px] mt-2 font-inter-black">No matching entries found</Text>
              </View>
            )}

            {filteredNotifications.length > 0 && (
              <TouchableOpacity
                onPress={() => { triggerHaptic(); onViewLedger?.(); }}
                className="py-4 border-t border-gray-50 items-center bg-gray-50/20 active:bg-gray-100"
              >
                <Text className="text-[10px] font-black text-indigo-600 uppercase tracking-[2px] font-inter-black">
                  OPEN FULL INSTITUTIONAL LEDGER
                </Text>
              </TouchableOpacity>
            )}
          </AppCard>
        </View>

        {/* Security Assurance Banner */}
        <Animated.View entering={FadeInDown.delay(300)} layout={Layout.springify()}>
            <LinearGradient
                colors={['#1e1b4b', '#312e81']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                className="rounded-[32px] p-6 flex-row items-center shadow-2xl shadow-indigo-200 relative overflow-hidden"
            >
                <View className="flex-1 relative z-10">
                    <Text className="text-white font-black text-[16px] mb-1 tracking-tight font-inter-black">Financial Node Active</Text>
                    <Text className="text-indigo-200 text-[9px] uppercase tracking-[2px] font-black font-inter-black opacity-80">Payment Encryption Level: TLS 1.3</Text>
                </View>
                <View className="bg-white/10 p-3 rounded-[20px] ml-4 border border-white/20">
                    <Icons.Shield size={22} color="white" />
                </View>
                <View className="absolute right-[-20] bottom-[-20] opacity-5 rotate-12">
                    <Icons.Activity size={120} color="white" />
                </View>
            </LinearGradient>
        </Animated.View>
      </ScrollView>
    </View>
  );
};
