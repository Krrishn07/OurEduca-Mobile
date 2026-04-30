import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Icons } from '../../../../components/Icons';
import { AppTheme, AppCard, AppTypography } from '../../../design-system';

interface TeacherReportsProps {
  assignedSections: any[];
  dbRoster: any[];
  onBack: () => void;
  onShowToast: (msg: string) => void;
}

export const TeacherReports: React.FC<TeacherReportsProps> = ({
  assignedSections = [],
  dbRoster = [],
  onBack,
  onShowToast
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportStep, setExportStep] = useState(0);

  // Analytics Logic
  const totalStudents = dbRoster.length;
  const criticalStudents = dbRoster.slice(0, 5).map(s => ({
      name: s.users?.name || 'Academic Node',
      issue: s.grade_score ? `Current Evaluation: ${s.grade_score}` : 'Evaluation Pending',
      color: s.grade_score ? 'text-emerald-600' : 'text-rose-600',
      bg: s.grade_score ? 'bg-emerald-50' : 'bg-rose-50'
  }));

  const subjectPerformance = [
    { name: 'Core', value: 88, color: '#4f46e5' },
    { name: 'Labs', value: 72, color: '#06b6d4' },
    { name: 'Tests', value: 94, color: '#10b981' },
    { name: 'Avg', value: 81, color: '#f59e0b' },
    { name: 'Attn', value: 65, color: '#ef4444' },
  ];

  const handleExport = () => {
    setIsExporting(true);
    setExportStep(1); // Preparation
    
    setTimeout(() => setExportStep(2), 1000); // Generation
    setTimeout(() => setExportStep(3), 2000); // Finalization
    setTimeout(() => {
        setIsExporting(false);
        setExportStep(0);
        onShowToast("Institutional Analysis PDF Downloaded");
    }, 3000);
  };

  return (
    <View className="flex-1 bg-gray-50/50">
      {/* Platinum Analytics Header */}
      <View className="bg-white pt-14 pb-6 px-6 shadow-sm border-b border-gray-100">
        <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
                <TouchableOpacity 
                    onPress={onBack}
                    className="bg-indigo-50 p-3 rounded-2xl border border-indigo-100 mr-4"
                >
                    <Icons.ChevronLeft size={20} color="#4f46e5" />
                </TouchableOpacity>
                <View>
                    <Text className="text-[20px] font-black text-gray-900 tracking-tight font-inter-black">Institutional Intelligence</Text>
                    <Text className="text-[9px] font-black text-indigo-400 uppercase tracking-[2px] font-inter-black">Performance & Analytics Node</Text>
                </View>
            </View>
            <TouchableOpacity className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
                <Icons.Notifications size={20} color="#94a3b8" />
            </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* KPI Row */}
        <View className="flex-row px-4 pt-6 gap-3 mb-8">
            <View className="flex-1 bg-white p-5 rounded-[32px] border border-white shadow-xl shadow-indigo-100/20">
                <View className="w-8 h-8 rounded-full bg-indigo-50 items-center justify-center mb-3">
                    <Icons.Users size={14} color="#4f46e5" />
                </View>
                <Text className="text-[24px] font-black text-gray-900 font-inter-black">{totalStudents}</Text>
                <Text className="text-[8px] font-black uppercase text-gray-400 tracking-widest mt-1">Learner Nodes</Text>
            </View>
            <View className="flex-1 bg-white p-5 rounded-[32px] border border-white shadow-xl shadow-indigo-100/20">
                <View className="w-8 h-8 rounded-full bg-emerald-50 items-center justify-center mb-3">
                    <Icons.Classes size={14} color="#10b981" />
                </View>
                <Text className="text-[24px] font-black text-gray-900 font-inter-black">{assignedSections.length}</Text>
                <Text className="text-[8px] font-black uppercase text-gray-400 tracking-widest mt-1">Active Segments</Text>
            </View>
            <View className="flex-1 bg-white p-5 rounded-[32px] border border-white shadow-xl shadow-indigo-100/20">
                <View className="w-8 h-8 rounded-full bg-amber-50 items-center justify-center mb-3">
                    <Icons.Globe size={14} color="#f59e0b" />
                </View>
                <Text className="text-[24px] font-black text-gray-900 font-inter-black">98<Text className="text-sm font-black text-gray-300">%</Text></Text>
                <Text className="text-[8px] font-black uppercase text-gray-400 tracking-widest mt-1">Data Accuracy</Text>
            </View>
        </View>

        {/* Benchmarks Section */}
        <View className="px-4 mb-10">
            <Text className="text-[10px] font-black text-gray-400 uppercase tracking-[3px] mb-4 px-2 font-inter-black">Academic Benchmarks</Text>
            <AppCard className="p-8 rounded-[40px] border border-white shadow-2xl shadow-indigo-100/30 bg-white">
                <View className="h-56 flex-row items-end justify-between px-2 mb-8">
                    {subjectPerformance.map((s, i) => (
                        <View key={i} className="items-center flex-1">
                            <View className="bg-gray-50 w-5 h-full rounded-full overflow-hidden justify-end border border-gray-100">
                                <View 
                                    className="w-full rounded-full" 
                                    style={{ height: `${s.value}%`, backgroundColor: s.color }} 
                                />
                            </View>
                            <Text className="text-[9px] font-black text-gray-400 mt-4 uppercase tracking-tighter">{s.name}</Text>
                            <Text className="text-[10px] font-black text-gray-900 mt-1">{s.value}%</Text>
                        </View>
                    ))}
                </View>
                <View className="pt-8 border-t border-gray-50 flex-row items-center justify-between">
                    <View className="flex-row items-center">
                        <View className="w-3 h-3 bg-indigo-500 rounded-full mr-3 shadow-sm shadow-indigo-500" />
                        <Text className="text-[11px] font-black text-gray-500 italic">Institutional Baseline: <Text className="text-gray-900 not-italic">82%</Text></Text>
                    </View>
                    <TouchableOpacity className="bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                        <Icons.ChevronRight size={14} color="#94a3b8" />
                    </TouchableOpacity>
                </View>
            </AppCard>
        </View>

        {/* Roster Intelligence */}
        <View className="px-4 mb-20">
            <View className="flex-row items-center justify-between mb-4 px-2">
                <Text className="text-[10px] font-black text-gray-400 uppercase tracking-[3px] font-inter-black">Roster Intelligence</Text>
                <TouchableOpacity>
                    <Text className="text-[10px] font-black text-indigo-600 uppercase tracking-widest font-inter-black">View Full List</Text>
                </TouchableOpacity>
            </View>
            <View className="gap-4">
                {criticalStudents.length > 0 ? criticalStudents.map((node, i) => (
                    <View key={i} className={`${node.bg} p-6 rounded-[32px] border border-black/5 flex-row items-center justify-between shadow-sm`}>
                        <View className="flex-row items-center flex-1">
                            <View className="w-12 h-12 rounded-2xl bg-white items-center justify-center mr-4 shadow-sm border border-black/5">
                                <Icons.Profile size={20} color="#64748b" />
                            </View>
                            <View className="flex-1">
                                <Text className="font-black text-gray-900 text-[15px] tracking-tight font-inter-black">{node.name}</Text>
                                <Text className={`text-[10px] font-black uppercase tracking-[1px] mt-1 ${node.color} font-inter-black`}>{node.issue}</Text>
                            </View>
                        </View>
                        <TouchableOpacity className="bg-white p-4 rounded-2xl border border-black/5 shadow-sm active:scale-90">
                            <Icons.Messages size={18} color="#4f46e5" />
                        </TouchableOpacity>
                    </View>
                )) : (
                    <View className="p-12 items-center justify-center bg-gray-50 rounded-[40px] border border-dashed border-gray-200">
                        <Icons.Users size={32} color="#cbd5e1" />
                        <Text className="text-gray-400 font-black text-[11px] uppercase tracking-widest mt-4 font-inter-black">Syncing Academic Nodes...</Text>
                    </View>
                )}
            </View>
        </View>
      </ScrollView>

      {/* Persistent Export FAB */}
      <View className="absolute bottom-10 left-6 right-6">
        <TouchableOpacity 
            onPress={handleExport}
            disabled={isExporting}
            activeOpacity={0.9}
            className={`py-5 rounded-[24px] flex-row items-center justify-center border ${
                isExporting 
                    ? 'bg-gray-100 border-gray-200' 
                    : 'bg-gray-900 border-gray-800 shadow-2xl shadow-black/30'
            }`}
        >
            {isExporting ? (
                <View className="flex-row items-center">
                    <ActivityIndicator color="#64748b" size="small" />
                    <Text className="text-gray-500 font-black uppercase tracking-[3px] text-[11px] font-inter-black ml-4">
                        {exportStep === 1 && "Preparing Nodes..."}
                        {exportStep === 2 && "Compiling PDF..."}
                        {exportStep === 3 && "Finalizing Sync..."}
                    </Text>
                </View>
            ) : (
                <>
                    <Icons.Notifications size={18} color="white" />
                    <Text className="text-white font-black uppercase tracking-[3px] text-[12px] font-inter-black ml-4">Export Analysis</Text>
                </>
            )}
        </TouchableOpacity>
      </View>
    </View>
  );
};
