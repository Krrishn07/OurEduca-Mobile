import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Icons } from '../../../../components/Icons';
import { AppTheme, ModalShell, AppButton, AppTypography } from '../../../design-system';

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
    <ModalShell
      visible={visible}
      onClose={onClose}
      title="Class Analytics"
      subtitle="Global Performance Node"
      headerGradient={AppTheme.colors.gradients.brand}
    >
      <View>
        {/* Summary Metrics */}
        <View className="flex-row gap-4 mb-8">
            <View className="flex-1 bg-indigo-50 p-5 rounded-[28px] border border-indigo-100/50">
                <Text className="text-[8px] font-black uppercase text-indigo-500 tracking-widest mb-1.5">Attendance</Text>
                <Text className="text-2xl font-black text-indigo-900 leading-tight">92%</Text>
            </View>
            <View className="flex-1 bg-emerald-50 p-5 rounded-[28px] border border-emerald-100/50">
                <Text className="text-[8px] font-black uppercase text-emerald-500 tracking-widest mb-1.5">Avg Grade</Text>
                <Text className="text-2xl font-black text-emerald-900 leading-tight">B+</Text>
            </View>
            <View className="flex-1 bg-blue-50 p-5 rounded-[28px] border border-blue-100/50">
                <Text className="text-[8px] font-black uppercase text-blue-500 tracking-widest mb-1.5">Submission</Text>
                <Text className="text-2xl font-black text-blue-900 leading-tight">80<Text className="text-[10px] text-blue-400">%</Text></Text>
            </View>
        </View>

        {/* Accuracy Chart */}
        <View className="mb-10">
            <Text className={`${AppTypography.eyebrow} text-gray-400 mb-4 ml-1`}>Subject Accuracy Node</Text>
            <View className="bg-white p-8 rounded-[40px] border border-gray-50 shadow-sm">
                <View className="h-40 flex-row items-end justify-between px-2 mb-6">
                    {subjectPerformance.map((s, i) => (
                        <View key={i} className="items-center flex-1">
                            <View className="bg-gray-50 w-3.5 h-full rounded-full overflow-hidden justify-end border border-gray-100">
                                <View 
                                    className="w-full rounded-full" 
                                    style={{ height: `${s.value}%`, backgroundColor: s.color }} 
                                />
                            </View>
                            <Text className="text-[9px] font-black text-gray-400 mt-3 uppercase tracking-tighter">{s.name}</Text>
                        </View>
                    ))}
                </View>
                <View className="pt-6 border-t border-gray-50 flex-row items-center justify-center">
                    <View className="w-2 h-2 bg-indigo-500 rounded-full mr-3" />
                    <Text className="text-[11px] font-black text-gray-500 italic">Consistency within institutional baseline</Text>
                </View>
            </View>
        </View>

        {/* Critical Attention */}
        <View className="mb-10">
            <Text className={`${AppTypography.eyebrow} text-gray-400 mb-4 ml-1`}>Integrity Monitoring</Text>
            <View className="gap-4">
                {[
                    { name: 'John Doe', issue: 'Missing Physics Lab', color: 'text-rose-600', bg: 'bg-rose-50' },
                    { name: 'Sarah Wilson', issue: 'Attendance Alert', color: 'text-amber-600', bg: 'bg-amber-50' }
                ].map((node, i) => (
                    <View key={i} className={`${node.bg} p-5 rounded-[28px] border border-black/5 flex-row items-center justify-between`}>
                        <View className="flex-row items-center">
                            <View className="w-10 h-10 rounded-2xl bg-white items-center justify-center mr-4 shadow-sm border border-black/5">
                                <Icons.Profile size={18} color="#64748b" />
                            </View>
                            <View>
                                <Text className="font-black text-gray-900 text-sm tracking-tight">{node.name}</Text>
                                <Text className={`text-[9px] font-black uppercase tracking-[2px] mt-1 ${node.color}`}>{node.issue}</Text>
                            </View>
                        </View>
                        <TouchableOpacity className="bg-white p-3 rounded-xl border border-black/5 shadow-sm active:scale-90">
                            <Icons.Messages size={16} color="#4f46e5" />
                        </TouchableOpacity>
                    </View>
                ))}
            </View>
        </View>

        <View className="gap-4 mb-8">
            <AppButton 
                label="Export Full Analysis"
                onPress={() => { onClose(); onShowToast("Generating PDF Report..."); }}
                className="py-5"
            />
            <AppButton 
                label="Dismiss Report"
                variant="outline"
                onPress={onClose}
                className="py-5"
            />
        </View>
      </View>
    </ModalShell>
  );
};
