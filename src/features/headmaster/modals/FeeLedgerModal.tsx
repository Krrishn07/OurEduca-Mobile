import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TextInput } from 'react-native';
import { Icons } from '../../../../components/Icons';
import { AppTheme, ModalShell, AppTypography } from '../../../design-system';

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

export const FeeLedgerModal: React.FC<FeeLedgerModalProps> = ({ visible, onClose, students, fees }) => {
    const [searchQuery, setSearchQuery] = useState('');

    const ledgerData = useMemo(() => {
        return (students || []).map(student => {
            const studentFees = (fees || []).filter(f => f.student_id === student.id);
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
            title="Institutional Ledger"
            subtitle={`School Outstanding: ₹${totalSchoolOutstanding.toLocaleString()}`}
            headerGradient={AppTheme.colors.gradients.brand}
        >
            <View>
                {/* Search Bar */}
                <View className="bg-white rounded-2xl flex-row items-center px-5 py-3 mb-6 border border-gray-100 shadow-sm">
                    <Icons.Search size={16} color="#6366f1" opacity={0.6} />
                    <TextInput 
                        placeholder="Search student ledger..."
                        placeholderTextColor="#9ca3af"
                        className="flex-1 ml-3 text-sm font-black text-gray-900 h-8"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                {/* Ledger List */}
                <View className="gap-3">
                    {ledgerData.map((entry) => (
                        <View key={entry.id} className="bg-white p-5 rounded-[24px] border border-gray-50 shadow-sm flex-row items-center justify-between">
                            <View className="flex-1 mr-4">
                                <Text className="text-sm font-black text-gray-900 tracking-tight mb-1">{entry.studentName}</Text>
                                <View className="flex-row items-center">
                                    <View className={`px-2 py-0.5 rounded-full mr-2 ${entry.totalOutstanding > 0 ? 'bg-orange-50' : 'bg-emerald-50'}`}>
                                        <Text className={`text-[8px] font-black uppercase tracking-widest ${entry.totalOutstanding > 0 ? 'text-orange-600' : 'text-emerald-600'}`}>
                                            {entry.totalOutstanding > 0 ? `${entry.outstandingCount} Dues` : 'Clear'}
                                        </Text>
                                    </View>
                                    <Text className="text-[10px] text-gray-400 font-black uppercase tracking-widest">₹{entry.totalInvoiced.toLocaleString()}</Text>
                                </View>
                            </View>
                            
                            <View className="items-end">
                                <Text className={`text-[15px] font-black tracking-tighter ${entry.totalOutstanding > 0 ? 'text-orange-600' : 'text-gray-900'}`}>
                                    ₹{entry.totalOutstanding.toLocaleString()}
                                </Text>
                                <Text className="text-[8px] text-gray-400 font-black uppercase tracking-widest mt-1">Due</Text>
                            </View>
                        </View>
                    ))}
                    
                    {ledgerData.length === 0 && (
                        <View className="py-20 items-center justify-center">
                            <Icons.Search size={40} color="#d1d5db" />
                            <Text className="text-gray-400 text-sm mt-4 font-black tracking-tight">No matching records</Text>
                        </View>
                    )}
                </View>
            </View>
        </ModalShell>
    );
};
