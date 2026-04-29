import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Icons } from '../../../../components/Icons';
import {
  AppTheme, AppCard, AppTypography,
  AppRow, AppFilterBar, StatusPill, SectionHeader,
} from '../../../design-system';

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
  paymentNotifications,
  onVerify,
  onSettleManual,
  onCreateFee,
  onSendReminder,
  onViewLedger,
  onViewReport,
  collectionTrends,
  totalCollected,
  pendingVerification,
}) => {
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'Verify Now' | 'Verified'>('ALL');

  const counts = {
    ALL:        paymentNotifications.length,
    'Verify Now': paymentNotifications.filter(p => p.status === 'Verify Now').length,
    Verified:   paymentNotifications.filter(p => p.status === 'Verified').length,
  };

  const filterChips = [
    { label: 'All',     value: 'ALL'        as const, count: counts.ALL         },
    { label: 'Pending', value: 'Verify Now' as const, count: counts['Verify Now'] },
    { label: 'Settled', value: 'Verified'   as const, count: counts.Verified    },
  ];

  const filteredNotifications = paymentNotifications.filter(pay =>
    activeFilter === 'ALL' || pay.status === activeFilter
  );

  const stats = [
    { label: 'Collected', value: `₹${(totalCollected / 100000).toFixed(1)}L`, icon: 'Payment', color: '#10b981', bg: 'bg-emerald-50 border-emerald-100' },
    { label: 'Approval Pool', value: `₹${(pendingVerification / 1000).toFixed(1)}K`, icon: 'Alert', color: '#f43f5e', bg: 'bg-rose-50 border-rose-100' },
    { label: 'To Verify', value: counts['Verify Now'].toString(), icon: 'Clock', color: '#4f46e5', bg: 'bg-indigo-50 border-indigo-100' },
  ];

  return (
    <View className="flex-1 bg-[#f5f7ff]">
      {/* Platinum Fee Header — 140px Sync */}
      <LinearGradient
        colors={AppTheme.colors.gradients.brand}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        className="h-[140px] px-6 pt-5 rounded-b-[40px] shadow-xl shadow-indigo-200/50 relative z-30"
      >
        <View className="absolute right-[-20] bottom-[-20] opacity-10 transform rotate-12">
          <Icons.Payment size={140} color="white" />
        </View>
        <View className="flex-row justify-between items-start mb-4 relative z-10">
          <View className="flex-1 mr-4">
            <Text className={`${AppTypography.heroTitle} text-white font-inter-black`} numberOfLines={1}>Fee Management</Text>
          </View>
          <TouchableOpacity
            onPress={onCreateFee}
            className="w-10 h-10 bg-white/10 rounded-2xl items-center justify-center border border-white/20 active:scale-95"
          >
            <Icons.Plus size={16} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 20, paddingHorizontal: 16, paddingBottom: 100 }}
      >
        {/* Stats Grid */}
        <View className="flex-row gap-3 mb-5">
          {stats.map((stat, i) => {
            const IconComp = (Icons as any)[stat.icon] || Icons.Payment;
            return (
              <AppCard key={i} className="flex-1 p-3.5 border-white shadow-xl shadow-indigo-100/30">
                <View className={`w-8 h-8 rounded-xl ${stat.bg} items-center justify-center mb-2.5 border shadow-sm`}>
                  <IconComp size={14} color={stat.color} />
                </View>
                <Text className={`${AppTypography.meta} text-gray-400 mb-0.5`}>{stat.label}</Text>
                <Text className={`${AppTypography.statValue} text-slate-900`} numberOfLines={1}>{stat.value}</Text>
              </AppCard>
            );
          })}
        </View>

        {/* Section: Collection History */}
        <View className="mb-5">
          <SectionHeader 
            title="COLLECTION HISTORY"
            className="px-2"
            rightElement={
              <View className="flex-row items-center bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                <Icons.Activity size={10} color="#10b981" />
                <Text className="text-[8px] font-black text-emerald-600 uppercase tracking-widest ml-1 font-inter-black">+12.4%</Text>
              </View>
            }
          />
          <AppCard className="p-5 border-white shadow-xl shadow-indigo-100/30">
            <View className="h-28 flex-row items-end justify-between px-1 relative">
              <View className="absolute left-0 right-0 h-[1px] border-t border-dashed border-gray-200 z-0 top-[30%]" />
              {collectionTrends.map((d, i) => {
                const isLast = i === collectionTrends.length - 1;
                return (
                  <View key={i} className="items-center z-10 flex-1">
                    <View className="relative w-full items-center">
                      <LinearGradient
                        colors={isLast ? AppTheme.colors.gradients.brand : ['#e0e7ff', '#c7d2fe']}
                        className="w-6 rounded-t-xl shadow-sm"
                        style={{ height: `${d.value}%` }}
                      />
                    </View>
                    <Text className={`text-[8px] font-black mt-2 uppercase tracking-widest font-inter-black ${isLast ? 'text-indigo-600' : 'text-gray-400'}`}>
                      {d.month}
                    </Text>
                  </View>
                );
              })}
            </View>
          </AppCard>
        </View>

        {/* Section: Quick Actions */}
        <View className="mb-5">
          <SectionHeader 
            title="QUICK ACTIONS"
            className="px-2"
          />
          <View className="flex-row flex-wrap justify-between">
            {[
              { title: 'New Invoice',   icon: 'Plus',   color: '#4f46e5', bg: 'bg-indigo-50 border-indigo-100', action: onCreateFee   },
              { title: 'Send Reminder', icon: 'Bell',   color: '#f43f5e', bg: 'bg-rose-50 border-rose-100',     action: onSendReminder },
              { title: 'Fee Ledger',    icon: 'Users',  color: '#10b981', bg: 'bg-emerald-50 border-emerald-100', action: onViewLedger },
              { title: 'Report View',   icon: 'Report',  color: '#9333ea', bg: 'bg-purple-50 border-purple-100', action: onViewReport  },
            ].map((a, i) => {
              const IconComp = (Icons as any)[a.icon] || Icons.Plus;
              return (
                <TouchableOpacity
                  key={i}
                  onPress={a.action}
                  activeOpacity={0.75}
                  className="w-[48.2%] bg-white p-3.5 rounded-[24px] border border-white items-start shadow-xl shadow-indigo-100/30 mb-4 active:scale-95"
                >
                  <View className={`w-8 h-8 rounded-xl ${a.bg} items-center justify-center mb-2.5 border shadow-sm`}>
                    <IconComp size={15} color={a.color} />
                  </View>
                  <Text className="font-black text-slate-900 text-[12px] tracking-tight font-inter-black">{a.title}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Section: Recent Payments */}
        <View className="mb-6">
          <SectionHeader 
            title="RECENT PAYMENTS"
            className="px-2"
            rightElement={
              counts['Verify Now'] > 0 && (
                <StatusPill 
                  label={`${counts['Verify Now']} Pending`} 
                  type="warning" 
                />
              )
            }
          />
          <AppCard className="p-0 overflow-hidden border-white shadow-xl shadow-indigo-100/30">
            <AppFilterBar
              chips={filterChips}
              active={activeFilter}
              onChange={setActiveFilter}
              className="border-b border-gray-50 bg-gray-50/30"
            />

            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((pay: any, idx) => {
                const isSettled = pay.status === 'Verified';
                return (
                  <AppRow
                    key={pay.id || idx}
                    title={pay.schoolName || 'Scholar'}
                    subtitle={`₹${pay.amount} · ${pay.date || 'N/A'}`}
                    statusDot={isSettled ? 'active' : 'pending'}
                    avatarIcon={<Icons.Student size={16} color={isSettled ? '#10b981' : '#4f46e5'} />}
                    avatarBg={isSettled ? '#f0fdf4' : '#eef2ff'}
                    pills={
                      <StatusPill
                        label={pay.status}
                        type={isSettled ? 'success' : 'warning'}
                      />
                    }
                    showBorder={idx < filteredNotifications.length - 1}
                    swipeAction={!isSettled ? {
                      label: 'Verify',
                      bgColor: 'bg-indigo-500',
                      icon: <Icons.Check size={18} color="white" />,
                      onPress: () => onVerify(pay.id, pay.feeId),
                    } : undefined}
                    className="px-0"
                    rightElement={
                      !isSettled ? (
                        <View className="flex-row gap-1.5">
                          <TouchableOpacity
                            onPress={() => onVerify(pay.id, pay.feeId)}
                            className="bg-indigo-600 px-2.5 py-1.5 rounded-xl shadow-sm active:scale-95"
                          >
                            <Text className="text-white text-[9px] font-black uppercase font-inter-black">Verify</Text>
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <Icons.Check size={14} color="#10b981" />
                      )
                    }
                  />
                );
              })
            ) : (
              <View className="py-16 items-center">
                <View className="w-14 h-14 bg-gray-50 rounded-2xl items-center justify-center mb-4 border border-gray-100">
                  <Icons.Clock size={28} color="#e5e7eb" />
                </View>
                <Text className="text-[13px] font-black text-gray-400 font-inter-black">No Matching Entries</Text>
              </View>
            )}

            {filteredNotifications.length > 0 && (
              <TouchableOpacity
                onPress={onViewLedger}
                className="py-4 border-t border-gray-50 items-center bg-gray-50/30"
              >
                <Text className="text-[10px] font-black text-indigo-600 uppercase tracking-widest font-inter-black">
                  View Full Ledger
                </Text>
              </TouchableOpacity>
            )}
          </AppCard>
        </View>

        {/* Security Node */}
        <LinearGradient
          colors={['#0f172a', '#1e293b']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          className="rounded-[24px] p-5 flex-row items-center shadow-lg mb-4"
        >
          <View className="flex-1">
            <Text className="text-white font-black text-[15px] mb-1 tracking-tight font-inter-black">Security Node</Text>
            <Text className="text-slate-500 text-[9px] uppercase tracking-widest font-black font-inter-black">Payment Protection Active</Text>
          </View>
          <View className="bg-white/10 p-3 rounded-xl ml-4">
            <Icons.Shield size={18} color="white" />
          </View>
        </LinearGradient>
      </ScrollView>
    </View>
  );
};
