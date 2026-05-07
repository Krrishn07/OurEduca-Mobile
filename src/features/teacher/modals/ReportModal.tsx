import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Icons } from '../../../../components/Icons';
import { ModalShell } from '../../../design-system';

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
      maxHeight="92%"
    >
      <View className="p-1">
        {/* Top-Tier Summary Metrics */}
        <View className="flex-row gap-3 mb-8">
          <View className="flex-1 bg-indigo-50/50 p-5 rounded-[24px] border border-indigo-100/30">
            <Text className="text-[8px] font-inter-black uppercase text-indigo-500 tracking-[1px] mb-1">Attendance</Text>
            <Text className="text-[20px] font-inter-black text-indigo-900">{`92%`}</Text>
          </View>
          <View className="flex-1 bg-emerald-50/50 p-5 rounded-[24px] border border-emerald-100/30">
            <Text className="text-[8px] font-inter-black uppercase text-emerald-500 tracking-[1px] mb-1">Avg Grade</Text>
            <Text className="text-[20px] font-inter-black text-emerald-900">B+</Text>
          </View>
          <View className="flex-1 bg-blue-50/50 p-5 rounded-[24px] border border-blue-100/30">
            <Text className="text-[8px] font-inter-black uppercase text-blue-500 tracking-[1px] mb-1">Submission</Text>
            <Text className="text-[20px] font-inter-black text-blue-900">{`80`}<Text className="text-[10px] text-blue-400">%</Text></Text>
          </View>
        </View>

        {/* Distribution Analytics */}
        <View className="mb-8">
          <View className="flex-row justify-between items-center mb-5 px-1">
            <Text className="text-[9px] font-inter-black text-gray-400 uppercase tracking-[2px]">Subject Accuracy</Text>
            <View className="bg-gray-100 px-2 py-0.5 rounded-md">
              <Text className="text-[7px] font-inter-black text-gray-500 uppercase">Live Stats</Text>
            </View>
          </View>
          
          <View className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
            <View className="h-32 flex-row items-end justify-between px-2 mb-4">
              {subjectPerformance.map((s, i) => (
                <View key={i} className="items-center flex-1">
                  <View className="bg-gray-50 w-3 h-full rounded-full overflow-hidden justify-end border border-gray-100/50">
                    <View 
                      className="w-full rounded-full" 
                      style={{ height: `${s.value}%`, backgroundColor: s.color }} 
                    />
                  </View>
                  <Text className="text-[8px] font-inter-black text-gray-400 mt-2 uppercase tracking-tighter">{s.name}</Text>
                </View>
              ))}
            </View>
            <View className="pt-4 border-t border-gray-100 flex-row items-center justify-center">
              <View className="w-1.5 h-1.5 bg-indigo-500 rounded-full mr-2" />
              <Text className="text-[10px] font-inter-medium text-gray-500 italic">Median accuracy consistent with school average</Text>
            </View>
          </View>
        </View>

        {/* Critical Attention */}
        <View className="mb-8">
          <Text className="text-[9px] font-inter-black text-gray-400 mb-5 uppercase tracking-[2px] ml-1">Critical Attention</Text>
          <View>
            {[
              { name: 'John Doe', issue: 'Missing Physics Lab', color: 'text-rose-500', bg: 'bg-rose-50/50' },
              { name: 'Sarah Wilson', issue: 'Attendance Alert', color: 'text-amber-500', bg: 'bg-amber-50/50' }
            ].map((node, i) => (
              <View key={i} className={`${node.bg} p-4 rounded-[20px] border border-white/50 flex-row items-center justify-between mb-3`}>
                <View className="flex-row items-center">
                  <View className="w-9 h-9 rounded-full bg-white items-center justify-center mr-3 shadow-sm border border-gray-50">
                    <Icons.Profile size={16} color="#64748b" />
                  </View>
                  <View>
                    <Text className="font-inter-bold text-gray-900 text-xs">{node.name}</Text>
                    <Text className={`text-[9px] font-inter-black uppercase tracking-[1px] mt-0.5 ${node.color}`}>{node.issue}</Text>
                  </View>
                </View>
                <TouchableOpacity className="bg-white w-9 h-9 rounded-xl border border-gray-50 shadow-sm items-center justify-center active:scale-90">
                  <Icons.Messages size={16} color="#4f46e5" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* Institutional Actions */}
        <View className="mt-4">
          <TouchableOpacity 
            onPress={() => { onClose(); onShowToast("Generating PDF Report..."); }} 
            className="bg-indigo-600 py-5 rounded-2xl flex-row items-center justify-center shadow-xl shadow-indigo-100 active:scale-[0.98]"
          >
            <Icons.Download size={18} color="white" />
            <Text className="text-white font-inter-black ml-3 text-[12px] uppercase tracking-[2px]">Export Full Analysis</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={onClose} 
            className="mt-4 py-4 items-center justify-center"
          >
            <Text className="text-gray-400 font-inter-black text-[9px] uppercase tracking-[3px]">Dismiss Report</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ModalShell>
  );
};
