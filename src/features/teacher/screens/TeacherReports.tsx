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
  const [selectedRosterId, setSelectedRosterId] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportStep, setExportStep] = useState(0);

  // Filter logic
  const filteredRoster = selectedRosterId 
    ? dbRoster.filter(s => (s.class_id === selectedRosterId || s.rosterId === selectedRosterId))
    : dbRoster;

  // Real Data Intelligence
  const totalStudents = filteredRoster.length;
  
  // Calculate Weak Students (e.g. score < 50 or Grade C/D/F)
  const weakStudents = filteredRoster.filter(s => {
      const score = s.grade_score;
      if (!score) return false;
      const numericScore = parseFloat(score);
      if (!isNaN(numericScore)) return numericScore < 50;
      return ['C', 'D', 'F', 'C-', 'D-'].includes(score.toUpperCase());
  });

  // Calculate Average Score
  const gradedStudents = filteredRoster.filter(s => s.grade_score && !isNaN(parseFloat(s.grade_score)));
  const averageScore = gradedStudents.length > 0 
    ? Math.round(gradedStudents.reduce((acc, s) => acc + parseFloat(s.grade_score), 0) / gradedStudents.length)
    : 0;

  const handleExport = async () => {
    setIsExporting(true);
    setExportStep(1); // Preparing data
    
    // Simulate complex PDF generation / Backend Sync
    setTimeout(() => setExportStep(2), 1000); // Compiling
    setTimeout(() => setExportStep(3), 2000); // Finalizing
    
    setTimeout(() => {
        setIsExporting(false);
        setExportStep(0);
        onShowToast("Institutional Performance Report Exported (PDF)");
    }, 3000);
  };

  return (
    <View className="flex-1 bg-gray-50/50">
      {/* Platinum Header */}
      <View className="bg-white pt-14 pb-6 px-6 shadow-sm border-b border-gray-100">
        <View className="flex-row items-center justify-between mb-6">
            <View className="flex-row items-center">
                <TouchableOpacity 
                    onPress={onBack}
                    className="bg-indigo-50 p-3 rounded-2xl border border-indigo-100 mr-4"
                >
                    <Icons.ChevronLeft size={20} color="#4f46e5" />
                </TouchableOpacity>
                <View>
                    <Text className="text-[20px] font-black text-gray-900 tracking-tight font-inter-black">Class Reports</Text>
                    <Text className="text-[9px] font-black text-indigo-400 uppercase tracking-[2px] font-inter-black">Institutional Intelligence Hub</Text>
                </View>
            </View>
        </View>

        {/* Class Filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-2">
            <TouchableOpacity 
                onPress={() => setSelectedRosterId(null)}
                className={`px-5 py-2.5 rounded-xl border mr-2 ${!selectedRosterId ? 'bg-indigo-600 border-indigo-600' : 'bg-gray-50 border-gray-100'}`}
            >
                <Text className={`text-[9px] font-black uppercase tracking-widest font-inter-black ${!selectedRosterId ? 'text-white' : 'text-gray-400'}`}>All Segments</Text>
            </TouchableOpacity>
            {assignedSections.map((item, idx) => {
                const uniqueId = item.class_id || item.rosterId;
                const isSelected = selectedRosterId === uniqueId;
                return (
                    <TouchableOpacity 
                        key={idx} 
                        onPress={() => setSelectedRosterId(uniqueId)}
                        className={`px-5 py-2.5 rounded-xl border mr-2 ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'bg-gray-50 border-gray-100'}`}
                    >
                        <Text className={`text-[9px] font-black uppercase tracking-widest font-inter-black ${isSelected ? 'text-white' : 'text-gray-400'}`}>
                            {item.name || item.subject} {item.section || 'A'}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </ScrollView>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* KPI Cards */}
        <View className="flex-row px-4 pt-8 gap-3">
            <View className="flex-1 bg-white p-6 rounded-[32px] border border-white shadow-xl shadow-indigo-100/20">
                <Text className="text-[32px] font-black text-gray-900 font-inter-black">{totalStudents}</Text>
                <Text className="text-[9px] font-black uppercase text-gray-400 tracking-widest mt-1">Total Students</Text>
            </View>
            <View className="flex-1 bg-white p-6 rounded-[32px] border border-white shadow-xl shadow-indigo-100/20">
                <Text className="text-[32px] font-black text-gray-900 font-inter-black">{averageScore}<Text className="text-sm font-black text-gray-300">%</Text></Text>
                <Text className="text-[9px] font-black uppercase text-gray-400 tracking-widest mt-1">Average Score</Text>
            </View>
        </View>

        <View className="px-4 pt-4">
            <View className="bg-rose-50 p-6 rounded-[32px] border border-rose-100 shadow-xl shadow-rose-100/20">
                <Text className="text-[32px] font-black text-rose-600 font-inter-black">{weakStudents.length}</Text>
                <Text className="text-[9px] font-black uppercase text-rose-400 tracking-widest mt-1">Weak Students</Text>
            </View>
        </View>

        {/* performance summary / Weak students list */}
        <View className="px-6 pt-10">
            <Text className="text-[10px] font-black text-gray-400 uppercase tracking-[3px] mb-6 font-inter-black">Performance Summary</Text>
            
            <View className="bg-white p-8 rounded-[40px] border border-white shadow-2xl shadow-indigo-100/20 mb-20">
                {weakStudents.length > 0 ? (
                    <View>
                        <Text className="text-[11px] font-black text-gray-900 uppercase tracking-widest mb-6 font-inter-black">Priority Action Nodes</Text>
                        {weakStudents.slice(0, 5).map((s, i) => (
                            <View key={i} className="flex-row items-center justify-between mb-5">
                                <View className="flex-row items-center">
                                    <View className="w-10 h-10 rounded-xl bg-rose-50 items-center justify-center mr-4 border border-rose-100">
                                        <Icons.Profile size={16} color="#ef4444" />
                                    </View>
                                    <View>
                                        <Text className="text-[14px] font-black text-gray-900 font-inter-black">{s.users?.name || 'Student'}</Text>
                                        <Text className="text-[9px] font-black text-rose-400 uppercase tracking-widest">Score: {s.grade_score}</Text>
                                    </View>
                                </View>
                                <TouchableOpacity className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                                    <Icons.Messages size={14} color="#64748b" />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                ) : (
                    <View className="py-10 items-center">
                        <Icons.CheckCircle size={40} color="#10b981" />
                        <Text className="text-emerald-600 font-black text-[11px] uppercase tracking-widest mt-4 font-inter-black">All Scholars above baseline</Text>
                    </View>
                )}
            </View>
        </View>
      </ScrollView>

      {/* Export FAB */}
      <View className="absolute bottom-10 left-6 right-6">
        <TouchableOpacity 
            onPress={handleExport}
            disabled={isExporting}
            activeOpacity={0.9}
            className={`py-5 rounded-[24px] flex-row items-center justify-center border ${
                isExporting 
                    ? 'bg-gray-100 border-gray-200' 
                    : 'bg-indigo-600 border-indigo-500 shadow-2xl shadow-indigo-500/30'
            }`}
        >
            {isExporting ? (
                <View className="flex-row items-center">
                    <ActivityIndicator color="#4f46e5" size="small" />
                    <Text className="text-indigo-600 font-black uppercase tracking-[3px] text-[11px] font-inter-black ml-4">
                        {exportStep === 1 && "Analyzing Data..."}
                        {exportStep === 2 && "Compiling PDF..."}
                        {exportStep === 3 && "Finalizing..."}
                    </Text>
                </View>
            ) : (
                <>
                    <Icons.Notifications size={18} color="white" />
                    <Text className="text-white font-black uppercase tracking-[3px] text-[12px] font-inter-black ml-4">Export Analysis Report</Text>
                </>
            )}
        </TouchableOpacity>
      </View>
    </View>
  );
};
