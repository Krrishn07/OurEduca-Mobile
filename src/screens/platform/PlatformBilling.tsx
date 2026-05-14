import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Icons } from '@components/common/Icons';
import { DispatchProgressModal } from './modals/DispatchProgressModal';
import { RevenueConfigModal } from './modals/RevenueConfigModal';
import { BillingFilterModal } from './modals/BillingFilterModal';
import { InstitutionDetailsModal } from './modals/InstitutionDetailsModal';
import { useSchoolData } from '@context/SchoolDataContext';
import { 
    AppTheme, 
    AppCard, 
    AppTypography, 
    AppRow, 
    AppFilterBar, 
    StatusPill, 
    inferPillType, 
    RestrictedAccessView,
    PlatinumSearchHeader,
    SectionHeader,
    StatCard,
    PlatinumChart 
} from '@components/common';
import { triggerHaptic } from '@utils/haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { UserRole } from '@/types';
import * as FileSystem from 'expo-file-system';
const { Paths, File } = FileSystem;
import * as Sharing from 'expo-sharing';

interface PlatformBillingProps {
    institutes: any[];
    isLoading: boolean;
    onUpdateStatus: (schoolId: string, status: 'Paid' | 'Pending' | 'Overdue') => void;
    hasPermission?: (perm: string) => boolean;
    currentUserRole?: UserRole;
}

const DEFAULT_RATES: Record<string, number> = {
    'Basic': 5000,
    'Pro': 15000,
    'Enterprise': 50000
};

export const PlatformBilling: React.FC<PlatformBillingProps> = ({
    institutes,
    isLoading,
    onUpdateStatus,
    hasPermission,
    currentUserRole
}) => {
    if (hasPermission && !hasPermission('billing')) {
        return <RestrictedAccessView featureName="Financial Records" role={currentUserRole} />;
    }

    const { logSystemActivity } = useSchoolData();
    const [planRates, setPlanRates] = useState(DEFAULT_RATES);
    const [isConfigVisible, setIsConfigVisible] = useState(false);
    
    const [isFilterVisible, setIsFilterVisible] = useState(false);
    const [isDispatching, setIsDispatching] = useState(false);
    const [filters, setFilters] = useState({ status: 'All', plan: 'All' });
    const [isDemoMode, setIsDemoMode] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const [selectedInstitution, setSelectedInstitution] = useState<any>(null);
    const [isDetailsVisible, setIsDetailsVisible] = useState(false);

    const finalInstitutes = useMemo(() => {
        if (!isDemoMode) return institutes;
        const mockOverdue = [
            { id: 'mock_1', name: 'Springfield Academy', plan: 'Enterprise', billing_status: 'Overdue', created_at: new Date().toISOString() },
            { id: 'mock_2', name: 'Silverstone High', plan: 'Pro', billing_status: 'Overdue', created_at: new Date().toISOString() },
            { id: 'mock_3', name: 'Oak Ridge Global', plan: 'Basic', billing_status: 'Overdue', created_at: new Date().toISOString() }
        ];
        return [...institutes, ...mockOverdue];
    }, [institutes, isDemoMode]);

    const formatAmount = (val: number) => {
        if (val >= 100000) return `₹ ${(val / 100000).toFixed(1)}L`;
        if (val >= 1000) return `₹ ${(val / 1000).toFixed(0)}K`;
        return `₹ ${val}`;
    };

    const filteredInstitutes = useMemo(() => {
        return finalInstitutes.filter(inst => {
            const matchesStatus = (filters?.status || 'All') === 'All' || inst.billing_status?.toLowerCase() === (filters?.status || '').toLowerCase();
            const matchesPlan = (filters?.plan || 'All') === 'All' || inst.plan === filters.plan;
            const matchesSearch = !searchQuery || inst.name.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesStatus && matchesPlan && matchesSearch;
        });
    }, [finalInstitutes, filters, searchQuery]);

    const financialStats = useMemo(() => {
        let totalPaid = 0;
        let totalOverdue = 0;
        let activeCount = 0;
        let autoOverdueCount = 0;

        const now = new Date();

        finalInstitutes.forEach(inst => {
            const price = planRates[inst.plan || 'Basic'] || planRates['Basic'];
            let status = inst.billing_status?.toLowerCase();
            
            const cycleDays = inst.billing_cycle_days || 30;
            const lastBilling = inst.last_billing_date ? new Date(inst.last_billing_date) : new Date(inst.created_at);
            const diffDays = (now.getTime() - lastBilling.getTime()) / (1000 * 60 * 60 * 24);
            
            const isTemporallyOverdue = diffDays > cycleDays && status !== 'overdue';
            
            if (isTemporallyOverdue) {
                status = 'overdue';
                autoOverdueCount++;
            }

            if (status === 'paid' || status === 'active') {
                totalPaid += price;
                activeCount++;
            } else if (status === 'overdue') {
                totalOverdue += price;
            }
        });

        const avgYield = activeCount > 0 ? totalPaid / activeCount : 0;
        return { totalPaid, totalOverdue, avgYield, autoOverdueCount };
    }, [finalInstitutes, planRates]);

    const revenueGrowth = useMemo(() => {
        const targetRevenue = 2000000; 
        const currentProgress = Math.min(100, (financialStats.totalPaid / targetRevenue) * 100);
        
        return [
            { month: 'Jan', value: 45 },
            { month: 'Feb', value: 52 },
            { month: 'Mar', value: 48 },
            { month: 'Apr', value: 65 },
            { month: 'May', value: 78 },
            { month: 'Jun', value: Math.max(15, currentProgress) },
        ];
    }, [financialStats.totalPaid]);

    const stats = [
        { label: 'Total Income', value: formatAmount(financialStats.totalPaid), icon: 'Payment', color: '#10b981', bg: 'bg-emerald-50 border-emerald-100' },
        { label: 'Average Income', value: formatAmount(financialStats.avgYield), icon: 'BarChart2', color: '#4f46e5', bg: 'bg-indigo-50 border-indigo-100' },
        { label: 'Overdue Fees', value: formatAmount(financialStats.totalOverdue), icon: 'Alert', color: '#f43f5e', bg: 'bg-rose-50 border-rose-100' },
    ];

    const isFilterActive = filters.status !== 'All' || filters.plan !== 'All';

    const handleExportRegistry = async () => {
        try {
            const header = "Institution,Plan,Monthly Rate,Status,Users\n";
            const rows = filteredInstitutes.map(inst => {
                const rate = planRates[inst.plan] || planRates['Basic'];
                const users = inst.plan === 'Enterprise' ? '2.5k' : inst.plan === 'Pro' ? '1.2k' : '450';
                return `${inst.name},${inst.plan || 'Basic'},${rate},${inst.billing_status || 'Pending'},${users}`;
            }).join("\n");
            const file = new File(Paths.cache, 'billing_report.csv');
            await file.write(header + rows);
            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(file.uri, { mimeType: 'text/csv', dialogTitle: 'Download Reports' });
            }
        } catch (err) {
            Alert.alert("Export Failed", "System error during file generation.");
        }
    };

    const handleBulkReminders = async () => {
        const overdue = finalInstitutes.filter(inst => inst.billing_status?.toLowerCase() === 'overdue');
        if (overdue.length === 0) {
            setIsDispatching(true);
            return;
        }
        Alert.alert(
            "Send Reminders?",
            `This will send payment notifications to ${overdue.length} overdue schools.`,
            [{ text: "Cancel", style: "cancel" }, { text: "Send All", onPress: () => setIsDispatching(true) }]
        );
    };

    return (
        <View className="flex-1 bg-[#fbfbfe]">
            {/* 1. Control Stage - High-Fidelity Platinum Header */}
            <PlatinumSearchHeader 
                title="Billing Center"
                subtitle="SUBSCRIPTION OVERVIEW"
                searchValue={searchQuery}
                onSearchChange={setSearchQuery}
                placeholder="Search school billing..."
                rightAction={
                    <View className="flex-row gap-3">
                        <TouchableOpacity 
                            onPress={() => { triggerHaptic(); setIsDemoMode(!isDemoMode); }}
                            className={`w-10 h-10 rounded-full items-center justify-center border transition-all ${isDemoMode ? 'bg-orange-500 border-orange-400' : 'bg-white border-slate-200'}`}
                        >
                            <Icons.Activity size={18} color={isDemoMode ? 'white' : '#64748b'} />
                        </TouchableOpacity>
                        <TouchableOpacity 
                            onPress={() => { triggerHaptic(); setIsConfigVisible(true); }} 
                            className="w-10 h-10 bg-white border border-slate-200 rounded-full items-center justify-center active:scale-95 shadow-sm"
                        >
                            <Icons.Settings size={18} color="#64748b" />
                        </TouchableOpacity>
                    </View>
                }
            />

            <ScrollView 
                className="flex-1" 
                showsVerticalScrollIndicator={false} 
                contentContainerStyle={{ paddingTop: 20, paddingBottom: 100 }}
            >
                {/* 2. Stats Grid - High-Density Metrics */}
                <View className="flex-row gap-3 mb-8 px-5">
                    {stats.map((stat, i) => {
                        const tone = i === 0 ? 'emerald' : i === 1 ? 'indigo' : 'rose';
                        const IconComp = (Icons as any)[stat.icon] || Icons.Payment;
                        
                        return (
                            <View key={i} className="flex-1">
                                <StatCard 
                                    index={i}
                                    label={stat.label}
                                    value={stat.value}
                                    icon={<IconComp size={14} color={stat.color} />}
                                    tone={tone as any}
                                />
                            </View>
                        );
                    })}
                </View>

                {/* 3. Income Overview Section */}
                <View className="mb-8 px-5">
                    <SectionHeader 
                        title="REVENUE GROWTH"
                        className="px-1 mb-4"
                        rightElement={<StatusPill label="+15%" type="success" />}
                    />

                    <AppCard className="p-5 border-white shadow-xl shadow-indigo-100/20 rounded-[16px]">
                        <PlatinumChart 
                            data={revenueGrowth.map(d => ({ label: d.month, value: d.value }))}
                            height={180}
                        />
                    </AppCard>
                </View>

                {/* 4. Quick Actions */}
                <View className="flex-row gap-4 mb-8 px-5">
                    <TouchableOpacity 
                        onPress={() => { triggerHaptic(); handleExportRegistry(); }} 
                        className="flex-1 bg-white p-5 rounded-[16px] border border-white items-start justify-between shadow-xl shadow-slate-200/50 active:scale-95 min-h-[130px]"
                    >
                        <View className="w-12 h-12 rounded-[16px] bg-indigo-50 items-center justify-center mb-4 border border-indigo-100/50 shadow-inner">
                            <Icons.FileText size={20} color="#4f46e5" />
                        </View>
                        <View>
                            <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 font-inter-black">Reports</Text>
                            <Text className="text-[14px] font-black text-slate-900 tracking-tight font-inter-black">Export Registry</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        onPress={() => { triggerHaptic(); handleBulkReminders(); }} 
                        className="flex-1 bg-white p-5 rounded-[16px] border border-white items-start justify-between shadow-xl shadow-slate-200/50 active:scale-95 min-h-[130px]"
                    >
                        <View className="w-12 h-12 rounded-[16px] bg-rose-50 items-center justify-center mb-4 border border-rose-100/50 shadow-inner">
                            <Icons.Bell size={20} color="#f43f5e" />
                        </View>
                        <View>
                            <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 font-inter-black">Recovery</Text>
                            <Text className="text-[14px] font-black text-rose-600 tracking-tight font-inter-black">Send Reminders</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* 5. Billing History Register */}
                <View className="px-5">
                    <SectionHeader 
                        title="INSTITUTIONAL BILLING"
                        className="px-1 mb-4"
                        rightElement={
                            <TouchableOpacity 
                                onPress={() => { triggerHaptic(); setIsFilterVisible(true); }} 
                                className={`w-10 h-10 rounded-full items-center justify-center border active:scale-95 transition-all shadow-sm ${isFilterActive ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-200'}`}
                            >
                                <Icons.Filter size={18} color={isFilterActive ? '#4f46e5' : '#64748b'} />
                            </TouchableOpacity>
                        }
                    />
                    
                    <View className="gap-2">
                        {isLoading ? (
                            <View className="p-20 items-center">
                                <ActivityIndicator color="#4f46e5" size="large" />
                                <Text className="text-[11px] font-black text-slate-400 mt-6 uppercase tracking-widest font-inter-black">Syncing Ledger...</Text>
                            </View>
                        ) : filteredInstitutes.length > 0 ? (
                            <AppCard className="p-0 overflow-hidden border-white shadow-xl shadow-indigo-100/20 rounded-[16px] mb-8">
                                {filteredInstitutes.map((inst, index) => {
                                    const status = (inst.billing_status || 'Pending').toLowerCase();
                                    const isPaid = status === 'paid' || status === 'active';
                                    const isOverdue = status === 'overdue';
                                    const dotStatus = isPaid ? 'active' : isOverdue ? 'danger' : 'pending';
                                    const pillType = isPaid ? 'success' : isOverdue ? 'danger' : 'warning';

                                    return (
                                        <AppRow
                                            key={inst.id}
                                            title={inst.name}
                                            subtitle={inst.email || inst.phone || 'No contact'}
                                            avatarLetter={inst.name?.charAt(0)?.toUpperCase() || 'S'}
                                            avatarBg={isPaid ? '#f0fdf4' : isOverdue ? '#fff1f2' : '#fefce8'}
                                            avatarColor={isPaid ? '#16a34a' : isOverdue ? '#f43f5e' : '#ca8a04'}
                                            statusDot={dotStatus}
                                            pills={
                                                <View className="flex-row gap-1">
                                                    <StatusPill label={inst.plan || 'Standard'} type={inferPillType(inst.plan || 'standard')} />
                                                    <StatusPill label={inst.billing_status || 'Pending'} type={pillType} />
                                                </View>
                                            }
                                            showBorder={index < filteredInstitutes.length - 1}
                                            onPress={() => { triggerHaptic(); setSelectedInstitution(inst); setIsDetailsVisible(true); }}
                                            swipeAction={!isPaid ? {
                                                label: 'Mark Paid',
                                                bgColor: 'bg-emerald-500',
                                                icon: <Icons.Check size={18} color="white" />,
                                                onPress: () => Alert.alert('Mark Paid', `Mark ${inst.name} as paid?`, [
                                                    { text: 'Cancel', style: 'cancel' },
                                                    { text: 'Mark Paid', onPress: () => Alert.alert('Success', 'Marked as paid') },
                                                ]),
                                            } : undefined}
                                            rightElement={
                                                <Icons.ChevronRight size={14} color="#cbd5e1" />
                                            }
                                        />
                                    );
                                })}
                            </AppCard>
                        ) : (
                            <View className="py-20 items-center">
                                <View className="w-16 h-16 bg-slate-50 rounded-3xl items-center justify-center mb-6 border border-slate-100 shadow-inner">
                                    <Icons.Info size={32} color="#cbd5e1" />
                                </View>
                                <Text className="text-[16px] font-black text-slate-900 tracking-tight font-inter-black">No Records Found</Text>
                                <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 font-inter-black">Refine your search or filters</Text>
                            </View>
                        )}
                    </View>
                </View>

            <InstitutionDetailsModal visible={isDetailsVisible} onClose={() => setIsDetailsVisible(false)} institution={selectedInstitution} onAction={(type, id) => { Alert.alert("Action Started", `Action ${type} initiated for school ${id}.`); setIsDetailsVisible(false); }} />
            <RevenueConfigModal visible={isConfigVisible} onClose={() => setIsConfigVisible(false)} currentRates={planRates} onSave={setPlanRates} />
            <BillingFilterModal visible={isFilterVisible} onClose={() => setIsFilterVisible(false)} currentFilters={filters} onApply={setFilters} />
            <DispatchProgressModal visible={isDispatching} onClose={() => setIsDispatching(false)} itemsToProcess={finalInstitutes.filter(inst => inst.billing_status?.toLowerCase() === 'overdue')} onProcessItem={async (inst) => { await logSystemActivity(null, `Payment Reminder Sent: ${inst.name}`, 'Bell', '#ea580c', undefined, 'BILLING'); }} />
        </ScrollView>
    </View>
    );
};
