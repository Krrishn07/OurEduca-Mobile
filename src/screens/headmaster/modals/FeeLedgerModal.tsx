import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Icons } from '@components/common/Icons';
import { AppTheme, ModalShell, AppTypography, StatusPill } from '@components/common';
import { triggerHaptic } from '@utils/haptics';

interface StudentFeeLedgerEntry {
    id: string;
    student_id: string;
    studentName: string;
    totalInvoiced: number;
    totalPaid: number;
    totalOutstanding: number;
    outstandingCount: number;
}

interface FeeLedgerModalProps {
    visible: boolean;
    onClose: () => void;
    students: any[];
    fees: any[];
}

export const FeeLedgerModal: React.FC<FeeLedgerModalProps> = ({ visible, onClose, students = [], fees = [] }) => {
    const [searchQuery, setSearchQuery] = useState('');

    const ledgerData = useMemo(() => {
        return students.map(student => {
            const studentFees = fees.filter(f => f.student_id === student.id);
            const totalInvoiced = studentFees.reduce((acc, f) => acc + Number(f.amount), 0);
            const totalPaid = studentFees
                .filter(f => f.status === 'PAID')
                .reduce((acc, f) => acc + Number(f.amount), 0);
            const totalOutstanding = studentFees
                .filter(f => f.status === 'PENDING' || f.status === 'OVERDUE')
                .reduce((acc, f) => acc + Number(f.amount), 0);
            const outstandingCount = studentFees.filter(f => f.status === 'PENDING' || f.status === 'OVERDUE').length;

            return {
                id: student.id,
                student_id: student.id,
                studentName: student.name,
                totalInvoiced,
                totalPaid,
                totalOutstanding,
                outstandingCount
            };
        }).filter(entry => 
            entry.studentName.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [students, fees, searchQuery]);

    const totalSchoolOutstanding = useMemo(() => {
        return ledgerData.reduce((acc, curr) => acc + curr.totalOutstanding, 0);
    }, [ledgerData]);

    return (
        <ModalShell
            visible={visible}
            onClose={onClose}
            title="Scholar Ledger"
            subtitle={`INSTITUTIONAL DUE: ₹${totalSchoolOutstanding.toLocaleString()}`}
        >
            <View className="flex-1">
                {/* Search Bar */}
                <View className="bg-gray-50/80 rounded-[24px] flex-row items-center px-5 py-4 mb-6 border border-gray-100 shadow-sm">
                    <Icons.Search size={18} color="#6366f1" />
                    <TextInput 
                        placeholder="Search institutional ledger..."
                        placeholderTextColor="#94a3b8"
                        className="flex-1 ml-3 text-[14px] font-inter-black text-gray-900"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                {/* Ledger List */}
                <ScrollView 
                    className="max-h-[500px]" 
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 20 }}
                >
                    <View className="gap-4">
                        {ledgerData.map((entry, idx) => (
                            <Animated.View key={entry.id} entering={FadeInDown.delay(idx * 40)}>
                                <TouchableOpacity 
                                    onPress={() => triggerHaptic()}
                                    className="bg-white p-5 rounded-[28px] border border-gray-50 shadow-sm flex-row items-center justify-between"
                                >
                                    <View className="flex-1 mr-4">
                                        <Text className="text-[14px] font-black text-slate-900 tracking-tight mb-1.5 font-inter-black">{entry.studentName}</Text>
                                        <View className="flex-row items-center">
                                            <View className="mr-2">
                                                <StatusPill 
                                                    label={entry.totalOutstanding > 0 ? `${entry.outstandingCount} DUES` : 'CLEAR'} 
                                                    type={entry.totalOutstanding > 0 ? 'warning' : 'success'} 
                                                    size="small"
                                                />
                                            </View>
                                            <Text className="text-[9px] text-gray-400 font-black uppercase tracking-[1px] font-inter-black">Billed: ₹{entry.totalInvoiced.toLocaleString()}</Text>
                                        </View>
                                    </View>
                                    
                                    <View className="items-end">
                                        <Text className={`text-[16px] font-black tracking-tighter font-inter-black ${entry.totalOutstanding > 0 ? 'text-orange-600' : 'text-slate-900'}`}>
                                            ₹{entry.totalOutstanding.toLocaleString()}
                                        </Text>
                                        <Text className="text-[8px] text-gray-400 font-black uppercase tracking-[1px] mt-1 font-inter-black">Outstanding</Text>
                                    </View>
                                </TouchableOpacity>
                            </Animated.View>
                        ))}
                        
                        {ledgerData.length === 0 && (
                            <View className="py-24 items-center justify-center opacity-30">
                                <Icons.Payment size={48} color="#6366f1" />
                                <Text className="text-gray-900 text-[12px] mt-4 font-black uppercase tracking-[2px] font-inter-black">No Records Match</Text>
                            </View>
                        )}
                    </View>
                </ScrollView>
            </View>
        </ModalShell>
    );
};
