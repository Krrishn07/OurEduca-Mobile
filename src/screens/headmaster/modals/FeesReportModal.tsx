import React, { useMemo, useState } from 'react';
import { View, Text } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Icons } from '@components/common/Icons';
import { AppTheme, ModalShell, AppButton, AppTypography, StatusPill } from '@components/common';
import { triggerHaptic } from '@utils/haptics';

interface FeesReportModalProps {
    visible: boolean;
    onClose: () => void;
    fees: any[];
}

export const FeesReportModal: React.FC<FeesReportModalProps> = ({ visible, onClose, fees = [] }) => {
    const [generating, setGenerating] = useState(false);
    const [exportSuccess, setExportSuccess] = useState(false);
    
    const stats = useMemo(() => {
        const totalProjected = fees.reduce((acc, f) => acc + Number(f.amount), 0);
        const totalCollected = fees
            .filter(f => f.status === 'PAID')
            .reduce((acc, f) => acc + Number(f.amount), 0);
        const totalPending = fees
            .filter(f => f.status === 'PENDING')
            .reduce((acc, f) => acc + Number(f.amount), 0);
        const totalOverdue = fees
            .filter(f => f.status === 'OVERDUE')
            .reduce((acc, f) => acc + Number(f.amount), 0);
        
        const efficiency = totalProjected > 0 ? (totalCollected / totalProjected) * 100 : 0;

        return {
            totalProjected,
            totalCollected,
            totalPending,
            totalOverdue,
            efficiency: efficiency.toFixed(1)
        };
    }, [fees]);

    const handleExport = () => {
        triggerHaptic();
        setGenerating(true);
        setTimeout(() => {
            setGenerating(false);
            setExportSuccess(true);
            triggerHaptic();
            setTimeout(() => setExportSuccess(false), 3000);
        }, 2000);
    };

    return (
        <ModalShell
            visible={visible}
            onClose={onClose}
            title="Financial Audit"
            subtitle="INSTITUTIONAL STATUS REPORT"
        >
            <View>
                {/* Executive Summary Card */}
                <Animated.View entering={FadeInDown.delay(100)} className="bg-indigo-950 rounded-[36px] p-8 mb-8 shadow-2xl relative overflow-hidden">
                    <View className="absolute -top-10 -right-10 opacity-10">
                        <Icons.Activity size={180} color="white" />
                    </View>
                    
                    <View className="mb-8">
                        <Text className="text-indigo-300 text-[10px] font-black uppercase tracking-[2px] mb-2 font-inter-black">Verified Institutional Revenue</Text>
                        <Text className="text-4xl font-black text-white tracking-tighter font-inter-black">₹{stats.totalCollected.toLocaleString()}</Text>
                    </View>

                    <View className="flex-row items-center justify-between border-t border-white/10 pt-6">
                        <View>
                            <Text className="text-indigo-300/60 text-[9px] font-black uppercase tracking-[1px] mb-1 font-inter-black">Total Projected</Text>
                            <Text className="text-[18px] font-black text-white font-inter-black">₹{stats.totalProjected.toLocaleString()}</Text>
                        </View>
                        <View className="items-end">
                            <Text className="text-emerald-400 text-[9px] font-black uppercase tracking-[1px] mb-1 font-inter-black">Collection Rate</Text>
                            <Text className="text-[18px] font-black text-emerald-400 font-inter-black">{stats.efficiency}%</Text>
                        </View>
                    </View>
                </Animated.View>

                {/* Metrics Grid */}
                <View className="flex-row gap-4 mb-8">
                    <Animated.View entering={FadeInDown.delay(200)} className="flex-1 bg-white p-6 rounded-[32px] border border-gray-50 shadow-sm">
                        <View className="w-10 h-10 bg-orange-50 rounded-2xl items-center justify-center mb-4 border border-orange-100">
                            <Icons.Clock size={18} color="#ea580c" />
                        </View>
                        <Text className="text-slate-900 font-black text-[17px] tracking-tight font-inter-black">₹{stats.totalPending.toLocaleString()}</Text>
                        <Text className="text-gray-400 text-[9px] font-black uppercase tracking-[1px] mt-1.5 font-inter-black">Pending</Text>
                    </Animated.View>
                    
                    <Animated.View entering={FadeInDown.delay(300)} className="flex-1 bg-white p-6 rounded-[32px] border border-gray-50 shadow-sm">
                        <View className="w-10 h-10 bg-rose-50 rounded-2xl items-center justify-center mb-4 border border-rose-100">
                            <Icons.Alert size={18} color="#e11d48" />
                        </View>
                        <Text className="text-slate-900 font-black text-[17px] tracking-tight font-inter-black">₹{stats.totalOverdue.toLocaleString()}</Text>
                        <Text className="text-gray-400 text-[9px] font-black uppercase tracking-[1px] mt-1.5 font-inter-black">Overdue</Text>
                    </Animated.View>
                </View>

                {/* Efficiency Progress */}
                <Animated.View entering={FadeInDown.delay(400)} className="bg-gray-50/50 rounded-[32px] p-6 mb-10 border border-gray-100 shadow-inner">
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-[10px] font-black text-gray-900 uppercase tracking-[1px] font-inter-black">Recovery Index</Text>
                        <StatusPill label={`${stats.efficiency}%`} type={Number(stats.efficiency) > 80 ? 'success' : 'info'} size="small" />
                    </View>
                    <View className="h-3 w-full bg-white rounded-full overflow-hidden border border-gray-100 p-[2px]">
                        <View 
                            className="h-full bg-indigo-600 rounded-full" 
                            style={{ width: `${stats.efficiency}%` }} 
                        />
                    </View>
                    <Text className="text-[10px] text-gray-400 mt-4 leading-4 font-inter-medium italic opacity-70">
                        * The recovery index reflects the aggregate percentage of verified tuition fees successfully collected against the projected school-wide ledger.
                    </Text>
                </Animated.View>

                {/* Export Action */}
                <AppButton 
                    label={exportSuccess ? 'AUDIT EXPORTED' : 'GENERATE OFFICIAL AUDIT'}
                    onPress={handleExport}
                    loading={generating}
                    className="py-5 mb-6"
                />
            </View>
        </ModalShell>
    );
};
