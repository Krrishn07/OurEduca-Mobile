import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Icons } from '../../../../components/Icons';
import { AppTheme, ModalShell, AppButton, AppTypography } from '../../../design-system';

interface ReportModalProps {
  visible: boolean;
  onClose: () => void;
  onShowToast: (msg: string) => void;
  assignedSections: any[];
  dbRoster: any[];
}

export const ReportModal: React.FC<ReportModalProps> = ({
  visible,
  onClose,
  onShowToast,
  assignedSections,
  dbRoster
}) => {
  // Logic: Calculate metrics from real roster
  const totalStudents = dbRoster.length;
  const criticalStudents = dbRoster.slice(0, 3).map(s => ({
      name: s.users?.name || 'Academic Node',
      issue: s.grade_score ? `Grade: ${s.grade_score}` : 'Pending Evaluation',
      color: s.grade_score ? 'text-emerald-600' : 'text-rose-600',
      bg: s.grade_score ? 'bg-emerald-50' : 'bg-rose-50'
  }));

  const subjectPerformance = [
    { name: 'Core', value: 88, color: '#4f46e5' },
    { name: 'Labs', value: 72, color: '#06b6d4' },
    { name: 'Tests', value: 94, color: '#10b981' },
    { name: 'Avg', value: 81, color: '#f59e0b' },
  ];

  return (
    <ModalShell
      visible={visible}
      onClose={onClose}
      title="Class Analytics"
      subtitle="Global Performance Node"
      headerGradient={AppTheme.colors.gradients.brand}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Summary Metrics */}
        <View className="flex-row gap-4 mb-8">
            <View className="flex-1 bg-indigo-50 p-5 rounded-[28px] border border-indigo-100/50">
                <Text className="text-[8px] font-black uppercase text-indigo-500 tracking-widest mb-1.5">Students</Text>
                <Text className="text-2xl font-black text-indigo-900 leading-tight">{totalStudents}</Text>
            </View>
            <View className="flex-1 bg-emerald-50 p-5 rounded-[28px] border border-emerald-100/50">
                <Text className="text-[8px] font-black uppercase text-emerald-500 tracking-widest mb-1.5">Sections</Text>
                <Text className="text-2xl font-black text-emerald-900 leading-tight">{assignedSections.length}</Text>
            </View>
            <View className="flex-1 bg-blue-50 p-5 rounded-[28px] border border-blue-100/50">
                <Text className="text-[8px] font-black uppercase text-blue-500 tracking-widest mb-1.5">Accuracy</Text>
                <Text className="text-2xl font-black text-blue-900 leading-tight">98<Text className="text-[10px] text-blue-400">%</Text></Text>
            </View>
        </View>

        {/* Accuracy Chart */}
        <View className="mb-10">
            <Text className={`${AppTypography.eyebrow} text-gray-400 mb-4 ml-1 uppercase`}>Institutional Benchmarks</Text>
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
            <Text className={`${AppTypography.eyebrow} text-gray-400 mb-4 ml-1 uppercase`}>Recent Roster Activity</Text>
            <View className="gap-4">
                {criticalStudents.length > 0 ? criticalStudents.map((node, i) => (
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
                        <TouchableOpacity 
                            onPress={() => onShowToast(`Initiating private node with ${node.name}`)}
                            className="bg-white p-3 rounded-xl border border-black/5 shadow-sm active:scale-90"
                        >
                            <Icons.Messages size={16} color="#4f46e5" />
                        </TouchableOpacity>
                    </View>
                )) : (
                    <View className="p-8 items-center justify-center bg-gray-50 rounded-[32px] border border-dashed border-gray-200">
                        <Text className="text-gray-400 font-black text-[10px] uppercase tracking-widest">No Active Roster Data</Text>
                    </View>
                )}
            </View>
        </View>

        <View className="gap-4 mb-8">
            <AppButton 
                label="Export Analysis"
                onPress={() => { onClose(); onShowToast("Generating Institutional PDF..."); }}
                className="py-5"
            />
            <AppButton 
                label="Dismiss"
                variant="outline"
                onPress={onClose}
                className="py-5"
            />
        </View>
      </ScrollView>
    </ModalShell>
  );
};
