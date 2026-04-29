import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Icons } from '../../../../components/Icons';
import { DispatchProgressModal } from '../modals/DispatchProgressModal';
import { RevenueConfigModal } from '../modals/RevenueConfigModal';
import { BillingFilterModal } from '../modals/BillingFilterModal';
import { InstitutionDetailsModal } from '../modals/InstitutionDetailsModal';
import { useSchoolData } from '../../../../contexts/SchoolDataContext';
import { AppTheme, AppCard, AppTypography, AppRow, AppFilterBar, StatusPill, inferPillType } from '../../../design-system';
import { RestrictedAccessView } from '../../../../components/RestrictedAccessView';
import { UserRole } from '../../../../types';
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
        <View className="flex-1 bg-[#f5f7ff]">
            {/* 1. Control Stage - High-Fidelity Hero Header */}
            <LinearGradient 
                colors={AppTheme.colors.gradients.brand} 
                start={{x: 0, y: 0}} 
                end={{x: 1, y: 1}} 
                className="px-6 pt-5 pb-10 rounded-b-[40px] shadow-2xl shadow-indigo-200 z-20"
            >
                <View className="absolute right-[-20] bottom-[-20] opacity-10 transform rotate-12">
                    <Icons.Payment size={160} color="white" />
                </View>
                <View className="flex-row justify-between items-center relative z-10 mb-5">
                    <View className="flex-1 mr-4">
                        <Text className={`${AppTypography.heroTitle} text-white`} numberOfLines={1}>Billing Center</Text>
                        <Text className={`${AppTypography.eyebrow} text-white/60 mt-1.5`}>Subscription Overview</Text>
                    </View>
                    <View className="items-end gap-3 flex-row">
                        <TouchableOpacity 
                            onPress={() => { setIsDemoMode(!isDemoMode); Alert.alert(!isDemoMode ? "Test Mode Active" : "Live Data Active", !isDemoMode ? "Mock records injected for testing." : "Real-time records synced."); }}
                            className={`px-4 py-2.5 rounded-2xl border active:scale-95 transition-all ${isDemoMode ? 'bg-orange-500 border-orange-400 shadow-lg' : 'bg-white/10 border-white/20'}`}
                        >
                            <Text className={`text-[10px] font-black uppercase tracking-widest ${isDemoMode ? 'text-white' : 'text-white'}`}>{isDemoMode ? 'Testing' : 'Test Mode'}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setIsConfigVisible(true)} className="w-10 h-10 bg-white/10 rounded-2xl items-center justify-center border border-white/20 active:scale-95">
                            <Icons.Settings size={18} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>
            </LinearGradient>

            <ScrollView 
                className="flex-1 px-6 pt-8" 
                showsVerticalScrollIndicator={false} 
                contentContainerStyle={{ paddingBottom: 100 }}
            >
                {/* 2. Stats Grid - High-Density Metrics */}
                <View className="flex-row gap-3 mb-5">
                    {stats.map((stat, i) => {
                        const IconComp = (Icons as any)[stat.icon] || Icons.Payment;
                        return (
                            <AppCard key={i} className="flex-1 p-3.5 border border-gray-100 shadow-sm">
                                <View className={`w-9 h-9 rounded-[12px] ${stat.bg} items-center justify-center mb-3 border shadow-sm`}>
                                    <IconComp size={16} color={stat.color} />
                                </View>
                                <Text className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">{stat.label}</Text>
                                <Text className="text-[15px] font-black text-gray-900 tracking-tighter" numberOfLines={1} adjustsFontSizeToFit>{stat.value}</Text>
                            </AppCard>
                        );
                    })}
                </View>

                {/* Income Overview Section — Compact Dashboard Consistency */}
                <View className="mb-6">
                    <View className="flex-row items-center justify-between mb-3 px-2">
                        <View className="flex-row items-center">
                            <View className="w-1 h-4 bg-indigo-500 rounded-full mr-2" />
                            <Text className="text-[10px] font-black text-gray-900 uppercase tracking-[2px] font-inter-black">Income Overview</Text>
                        </View>
                        <StatusPill label="+15%" type="success" className="self-center" />
                    </View>

                    <AppCard className="p-5 border border-gray-100">
                    <View className="h-40 flex-row items-end justify-between px-2">
                        {revenueGrowth.map((d, i) => {
                            const isCurrent = i === revenueGrowth.length - 1;
                            return (
                                <View key={i} className="items-center flex-1">
                                    <LinearGradient 
                                        colors={isCurrent ? AppTheme.colors.gradients.brand : ['#e0e7ff', '#c7d2fe']} 
                                        className="rounded-t-2xl w-8 shadow-sm" 
                                        style={{ height: `${d.value}%` }} 
                                    />
                                    <Text className={`text-[9px] font-black mt-3 uppercase tracking-widest ${isCurrent ? 'text-indigo-600' : 'text-gray-400'}`}>{d.month}</Text>
                                </View>
                            );
                        })}
                    </View>
                </AppCard>
            </View>

                {/* 4. Quick Actions */}
                <View className="flex-row gap-3 mb-5">
                    <TouchableOpacity onPress={handleExportRegistry} className="flex-1 bg-white p-4 rounded-[20px] border border-gray-100 items-start justify-between shadow-sm active:scale-95 transition-all min-h-[110px]">
                        <View className="w-10 h-10 rounded-xl bg-indigo-50 items-center justify-center mb-3 border border-indigo-100/50 shadow-sm">
                            <Icons.FileText size={18} color="#4f46e5" />
                        </View>
                        <View>
                            <Text className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Reports</Text>
                            <Text className="text-[13px] font-black text-gray-900 tracking-tight">Download Data</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleBulkReminders} className="flex-1 bg-white p-4 rounded-[20px] border border-gray-100 items-start justify-between shadow-sm active:scale-95 transition-all min-h-[110px]">
                        <View className="w-10 h-10 rounded-xl bg-rose-50 items-center justify-center mb-3 border border-rose-100/50 shadow-sm">
                            <Icons.Bell size={18} color="#f43f5e" />
                        </View>
                        <View>
                            <Text className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Reminders</Text>
                            <Text className="text-[13px] font-black text-rose-600 tracking-tight">Send Reminders</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* 5. Billing History Register */}
                <View className="mb-4">
                    {/* Billing Eyebrow — Compactness consistent with dashboard */}
                    <View className="flex-row items-center justify-between mb-3 px-2">
                        <View className="flex-row items-center">
                            <View className="w-1 h-4 bg-indigo-500 rounded-full mr-2" />
                            <Text className="text-[10px] font-black text-gray-900 uppercase tracking-[2px] font-inter-black">Billing Records</Text>
                        </View>
                        <TouchableOpacity onPress={() => setIsFilterVisible(true)} className={`w-9 h-9 rounded-xl items-center justify-center border active:scale-95 transition-all shadow-sm ${isFilterActive ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-gray-100'}`}>
                            <Icons.Filter size={16} color={isFilterActive ? '#4f46e5' : '#64748b'} />
                        </TouchableOpacity>
                    </View>
                    
                    <View className="bg-gray-50/50 flex-row items-center px-4 py-3 rounded-[20px] border border-gray-100 mb-6 shadow-inner">
                        <Icons.Search size={18} color="#94a3b8" />
                        <TextInput className="flex-1 ml-3 text-sm font-bold text-gray-800 p-0" placeholder="Search school list..." placeholderTextColor="#94a3b8" value={searchQuery} onChangeText={setSearchQuery} />
                    </View>

                    <View className="gap-2">
                        {isLoading ? (
                            <View className="p-10 items-center">
                                <ActivityIndicator color={AppTheme.colors.primary} size="small" />
                                <Text className="text-[10px] text-gray-400 mt-4 font-black uppercase tracking-widest font-inter-black">Updating List...</Text>
                            </View>
                        ) : filteredInstitutes.length > 0 ? (
                            <AppCard className="p-0 overflow-hidden">
                                {filteredInstitutes.map((inst, index) => {
                                    const status = (inst.billing_status || 'Pending').toLowerCase();
                                    const isPaid = status === 'paid' || status === 'active';
                                    const isOverdue = status === 'overdue';
                                    const dotStatus = isPaid ? 'active' : isOverdue ? 'danger' : 'pending';
                                    const pillType = isPaid ? 'success' : isOverdue ? 'danger' : 'warning';
                                    const dueDate = inst.due_date
                                        ? new Date(inst.due_date).toLocaleDateString([], { month: 'short', day: 'numeric' })
                                        : null;

                                    return (
                                        <AppRow
                                            key={inst.id}
                                            title={inst.name}
                                            subtitle={inst.email || inst.phone || 'No contact'}
                                            avatarLetter={inst.name?.charAt(0)?.toUpperCase() || 'S'}
                                            avatarBg="#f0fdf4"
                                            avatarColor="#16a34a"
                                            statusDot={dotStatus}
                                            pills={
                                                <>
                                                    <StatusPill label={inst.plan || 'Standard'} type={inferPillType(inst.plan || 'standard')} />
                                                    <StatusPill label={inst.billing_status || 'Pending'} type={pillType} />
                                                </>
                                            }
                                            showBorder={index < filteredInstitutes.length - 1}
                                            onPress={() => { setSelectedInstitution(inst); setIsDetailsVisible(true); }}
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
                                                <Icons.ChevronRight size={14} color="#d1d5db" />
                                            }
                                        />
                                    );
                                })}
                            </AppCard>
                        ) : (
                            <View className="py-20 items-center">
                                <View className="w-16 h-16 bg-gray-50 rounded-2xl items-center justify-center mb-4 border border-gray-100">
                                    <Icons.Info size={32} color="#94a3b8" />
                                </View>
                                <Text className="text-sm font-black text-gray-400 uppercase tracking-widest font-inter-black">No Schools Found</Text>
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
