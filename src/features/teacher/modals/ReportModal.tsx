import React from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { styled } from 'nativewind';
import { Icons } from '../../../../components/Icons';

const StyledLinearGradient = styled(LinearGradient);

interface ReportModalProps {
  visible: boolean;
  onClose: () => void;
  onShowToast: (msg: string) => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  visible,
  onClose,
  onShowToast,
}) => {
  const subjectPerformance = [
    { name: 'Algebra', value: 88, color: '#4f46e5' },
    { name: 'Physics', value: 72, color: '#06b6d4' },
    { name: 'Biology', value: 94, color: '#10b981' },
    { name: 'History', value: 81, color: '#f59e0b' },
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 justify-end bg-black/60">
        <View className="bg-white rounded-t-[40px] p-6 max-h-[92%]">
            {/* 1. Institutional Header */}
            <View className="flex-row justify-between items-center mb-8">
                <View>
                    <Text className="text-2xl font-black text-gray-900 tracking-tighter">Class Analytics</Text>
                    <Text className="text-[9px] text-indigo-600 font-black uppercase tracking-[2px] mt-1">Global Performance Node</Text>
                </View>
                <TouchableOpacity onPress={onClose} className="p-2.5 bg-gray-50 rounded-full border border-gray-100">
                    <Icons.Close size={20} color="#94a3b8" />
                </TouchableOpacity>
            </View>

            <ScrollView className="space-y-8" showsVerticalScrollIndicator={false}>
                {/* 2. Top-Tier Summary Metrics */}
                <View className="flex-row gap-3">
                    <View className="flex-1 bg-indigo-50/50 p-5 rounded-[24px] border border-indigo-100/30">
                        <Text className="text-[8px] font-black uppercase text-indigo-500 tracking-widest mb-1">Attendance</Text>
                        <Text className="text-2xl font-black text-indigo-900">92%</Text>
                    </View>
                    <View className="flex-1 bg-emerald-50/50 p-5 rounded-[24px] border border-emerald-100/30">
                        <Text className="text-[8px] font-black uppercase text-emerald-500 tracking-widest mb-1">Avg Grade</Text>
                        <Text className="text-2xl font-black text-emerald-900">B+</Text>
                    </View>
                    <View className="flex-1 bg-blue-50/50 p-5 rounded-[24px] border border-blue-100/30">
                        <Text className="text-[8px] font-black uppercase text-blue-500 tracking-widest mb-1">Submission</Text>
                        <Text className="text-2xl font-black text-blue-900">80<Text className="text-[10px] text-blue-400">%</Text></Text>
                    </View>
                </View>

                {/* 3. Distribution Analytics - PLATINUM CHART UPGRADE */}
                <View>
                    <View className="flex-row justify-between items-center mb-5 px-1">
                        <Text className="text-[10px] font-black text-gray-400 uppercase tracking-[2px]">Subject Accuracy</Text>
                        <View className="bg-gray-100 px-2 py-0.5 rounded-md">
                            <Text className="text-[8px] font-black text-gray-500 uppercase">Live Stats</Text>
                        </View>
                    </View>
                    
                    <View className="bg-gray-50/50 p-6 rounded-[32px] border border-gray-100">
                        <View className="h-32 flex-row items-end justify-between px-2 mb-4">
                            {subjectPerformance.map((s, i) => (
                                <View key={i} className="items-center flex-1">
                                    <View className="bg-white w-3 h-full rounded-full overflow-hidden justify-end border border-gray-100/50">
                                        <View 
                                            className="w-full rounded-full" 
                                            style={{ height: `${s.value}%`, backgroundColor: s.color }} 
                                        />
                                    </View>
                                    <Text className="text-[8px] font-black text-gray-400 mt-2 uppercase tracking-tighter">{s.name}</Text>
                                </View>
                            ))}
                        </View>
                        <View className="pt-4 border-t border-gray-100 flex-row items-center justify-center">
                            <View className="w-2 h-2 bg-indigo-500 rounded-full mr-2" />
                            <Text className="text-[10px] font-bold text-gray-500 italic">Median accuracy consistent with school average</Text>
                        </View>
                    </View>
                </View>

                {/* 4. Integrity Tracking - Missing Assessments */}
                <View>
                    <Text className="text-[10px] font-black text-gray-400 mb-4 uppercase tracking-[2px] ml-1">Critical Attention</Text>
                    <View className="space-y-3">
                        {[
                            { name: 'John Doe', issue: 'Missing Physics Lab', color: 'text-rose-500', bg: 'bg-rose-50/50' },
                            { name: 'Sarah Wilson', issue: 'Attendance Alert', color: 'text-amber-500', bg: 'bg-amber-50/50' }
                        ].map((node, i) => (
                            <View key={i} className={`${node.bg} p-4 rounded-2xl border border-gray-100 flex-row items-center justify-between`}>
                                <View className="flex-row items-center">
                                    <View className="w-8 h-8 rounded-full bg-white items-center justify-center mr-3 shadow-sm">
                                        <Icons.Profile size={14} color="#64748b" />
                                    </View>
                                    <View>
                                        <Text className="font-bold text-gray-900 text-xs">{node.name}</Text>
                                        <Text className={`text-[9px] font-black uppercase tracking-widest mt-0.5 ${node.color}`}>{node.issue}</Text>
                                    </View>
                                </View>
                                <TouchableOpacity className="bg-white p-2 rounded-xl border border-gray-100 shadow-sm">
                                    <Icons.Messages size={14} color="#4f46e5" />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                </View>

                {/* 5. Institutional Actions */}
                <View className="pt-2">
                    <TouchableOpacity 
                        onPress={() => { onClose(); onShowToast("Generating PDF Report..."); }} 
                        className="bg-indigo-600 py-5 rounded-[24px] flex-row items-center justify-center shadow-xl shadow-indigo-100 active:scale-[0.98] transition-all"
                    >
                        <Icons.Download size={18} color="white" />
                        <Text className="text-white font-black ml-3 text-[13px] uppercase tracking-[2px]">Export Full Analysis</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        onPress={onClose} 
                        className="mt-3 py-4 rounded-[24px] items-center justify-center"
                    >
                        <Text className="text-gray-400 font-black text-[10px] uppercase tracking-[3px]">Dismiss Report</Text>
                    </TouchableOpacity>
                </View>

                <View className="h-10" />
            </ScrollView>
        </View>
      </View>
    </Modal>
  );
};
