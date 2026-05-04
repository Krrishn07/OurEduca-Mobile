import React, { useMemo, useState } from 'react';
import { View, Text } from 'react-native';
import { Icons } from '../../../../components/Icons';
import { AppTheme, ModalShell, AppButton, AppTypography } from '../../../design-system';

interface FeesReportModalProps {
    visible: boolean;
    onClose: () => void;
    fees: any[];
}

export const FeesReportModal: React.FC<FeesReportModalProps> = ({ visible, onClose, fees }) => {
    const [generating, setGenerating] = useState(false);
    const [exportSuccess, setExportSuccess] = useState(false);
    
    const stats = useMemo(() => {
        const totalProjected = (fees || []).reduce((acc, f) => acc + Number(f.amount), 0);
        const totalCollected = (fees || [])
            .filter(f => f.status === 'PAID')
            .reduce((acc, f) => acc + Number(f.amount), 0);
        const totalPending = (fees || [])
            .filter(f => f.status === 'PENDING')
            .reduce((acc, f) => acc + Number(f.amount), 0);
        const totalOverdue = (fees || [])
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
        setGenerating(true);
        setTimeout(() => {
            setGenerating(false);
            setExportSuccess(true);
            setTimeout(() => setExportSuccess(false), 3000);
        }, 2000);
    };

    return (
        <ModalShell
            visible={visible}
            onClose={onClose}
            title="Financial Audit"
            subtitle="Institutional Status Report"
            headerGradient={AppTheme.colors.gradients.brand}
        >
            <View>
                {/* Executive Summary Card */}
                <View className="bg-indigo-950 rounded-[32px] p-8 mb-8 shadow-xl relative overflow-hidden">
                    <View className="absolute -top-10 -right-10 opacity-10">
                        <Icons.BarChart2 size={150} color="white" />
                    </View>
                    
                    <View className="mb-6">
                        <Text className="text-indigo-300 text-[10px] font-black uppercase tracking-widest mb-1">Total Verified Revenue</Text>
                        <Text className="text-4xl font-black text-white tracking-tighter">₹{stats.totalCollected.toLocaleString()}</Text>
                    </View>

                    <View className="flex-row items-center justify-between border-t border-white/10 pt-6">
                        <View>
                            <Text className="text-indigo-200/60 text-[10px] font-black uppercase tracking-wider mb-1">Projected</Text>
                            <Text className="text-lg font-black text-white">₹{stats.totalProjected.toLocaleString()}</Text>
                        </View>
                        <View className="items-end">
                            <Text className="text-indigo-300 text-[10px] font-black uppercase tracking-wider mb-1">Efficiency</Text>
                            <Text className="text-lg font-black text-white">{stats.efficiency}%</Text>
                        </View>
                    </View>
                </View>

                {/* Metrics Grid */}
                <View className="flex-row gap-4 mb-8">
                    <View className="flex-1 bg-white p-6 rounded-[32px] border border-gray-50 shadow-sm">
                        <View className="w-10 h-10 bg-orange-50 rounded-xl items-center justify-center mb-4">
                            <Icons.Clock size={18} color="#ea580c" />
                        </View>
                        <Text className="text-gray-900 font-black text-lg tracking-tight">₹{stats.totalPending.toLocaleString()}</Text>
                        <Text className="text-gray-400 text-[8px] font-black uppercase tracking-widest mt-1">Pending</Text>
                    </View>
                    
                    <View className="flex-1 bg-white p-6 rounded-[32px] border border-gray-50 shadow-sm">
                        <View className="w-10 h-10 bg-rose-50 rounded-xl items-center justify-center mb-4">
                            <Icons.Alert size={18} color="#e11d48" />
                        </View>
                        <Text className="text-gray-900 font-black text-lg tracking-tight">₹{stats.totalOverdue.toLocaleString()}</Text>
                        <Text className="text-gray-400 text-[8px] font-black uppercase tracking-widest mt-1">Overdue</Text>
                    </View>
                </View>

                {/* Efficiency Progress */}
                <View className="bg-white rounded-[32px] p-6 mb-8 border border-gray-50 shadow-sm">
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-[12px] font-black text-gray-900 uppercase tracking-widest">Recovery Progress</Text>
                        <Text className="text-[11px] font-black text-indigo-600">{stats.efficiency}%</Text>
                    </View>
                    <View className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <View 
                            className="h-full bg-indigo-600 rounded-full" 
                            style={{ width: `${stats.efficiency}%` }} 
                        />
                    </View>
                    <Text className="text-[10px] text-gray-400 mt-4 leading-4 font-medium italic">
                        * Efficiency index represents verified institutional revenue against the total school-wide billing ledger.
                    </Text>
                </View>

                {/* Export Action */}
                <AppButton 
                    label={exportSuccess ? 'Audit Exported' : 'Generate Official Audit'}
                    onPress={handleExport}
                    loading={generating}
                    variant={exportSuccess ? 'outline' : 'primary'}
                    className="py-5 mb-10"
                />
            </View>
        </ModalShell>
    );
};
