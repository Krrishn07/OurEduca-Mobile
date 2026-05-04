import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Platform, ActivityIndicator } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icons } from '../../../../components/Icons';
import { SkeletonCard, SkeletonRow, PlatinumHeader } from '../../../design-system';
import { supabase } from '../../../../lib/supabase';
import { useSchoolData } from '../../../../contexts/SchoolDataContext';
import { useMockAuth } from '../../../../contexts/MockAuthContext';

interface TeacherReportsProps {
  assignedSections: any[];
  dbRoster: any[];
  onBack: () => void;
  onShowToast: (msg: string) => void;
  initialClassId?: string | null;
}

export const TeacherReports: React.FC<TeacherReportsProps> = ({
  assignedSections = [],
  dbRoster = [],
  onBack,
  onShowToast,
  initialClassId = null
}) => {
  const { currentUser } = useMockAuth();
  const insets = useSafeAreaInsets();
  const { assignments: globalAssignments } = useSchoolData();
  const [selectedClassId, setSelectedClassId] = useState<string | null>(initialClassId);
  const selectedClass = useMemo(() => 
    assignedSections.find(s => String(s.class_id || s.id) === String(selectedClassId)),
    [assignedSections, selectedClassId]
  );
  const [grades, setGrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportStep, setExportStep] = useState(0);

  useEffect(() => {
    fetchData();
  }, [selectedClassId]);

  const fetchData = async () => {
    setLoading(true);
    try {
        const classId = selectedClassId;
        let liveGrades = [];
        if (classId) {
            const { data } = await supabase.from('grades').select('*').eq('class_id', classId);
            liveGrades = data || [];
        } else {
            const classIds = assignedSections.map(s => s.class_id || s.id);
            const { data } = await supabase.from('grades').select('*').in('class_id', classIds);
            liveGrades = data || [];
        }
        setGrades(liveGrades);
    } catch (err) {
        console.error('Report fetch error:', err);
    } finally {
        setLoading(false);
    }
  };

  // PERFORMANCE FIX: Memoize statistical aggregates
  const assignments = useMemo(() => {
    if (selectedClassId) {
        const filtered = globalAssignments.filter(a => String(a.class_id) === String(selectedClassId));
        console.log(`[REPORTS_SYNC] Class: ${selectedClassId}, Found: ${filtered.length}`);
        return filtered;
    }
    const classIds = assignedSections.map(s => String(s.class_id || s.id));
    return globalAssignments.filter(a => classIds.includes(String(a.class_id)));
  }, [globalAssignments, selectedClassId, assignedSections]);

  const reportStats = useMemo(() => {
    const currentStudents = selectedClassId 
      ? dbRoster.filter(s => s.class_id === selectedClassId)
      : dbRoster;
      
    const studentIdsInView = currentStudents.map(s => s.user_id || s.users?.id);
    const gradesInView = grades.filter(g => studentIdsInView.includes(g.student_id));
    
    const allMarks = gradesInView.map(g => Number(g.marks));
    const calculatedAvg = allMarks.length > 0 
      ? (allMarks.reduce((a, b) => a + b, 0) / allMarks.length).toFixed(1)
      : "0.0";

    const studentStats = currentStudents.map(s => {
        const sId = s.user_id || s.users?.id;
        const sGrades = gradesInView.filter(g => g.student_id === sId);
        const totalMarks = sGrades.reduce((acc, g) => acc + Number(g.marks), 0);
        const avg = sGrades.length > 0 ? totalMarks / sGrades.length : 0;
        return { ...s, avg, count: sGrades.length };
    });

    const weakData = studentStats.filter(s => s.count > 0 && s.avg < 40);
    const topData = studentStats.filter(s => s.count > 0 && s.avg >= 80).sort((a, b) => b.avg - a.avg).slice(0, 5);

    const calculatedProgress = (assignments.length > 0 && currentStudents.length > 0)
      ? Math.min(100, Math.round((gradesInView.length / (currentStudents.length * assignments.length)) * 100))
      : 0;

    return { 
        total: currentStudents.length, 
        avg: calculatedAvg, 
        weak: weakData, 
        top: topData, 
        progress: calculatedProgress 
    };
  }, [selectedClassId, grades, dbRoster, assignments, assignedSections]);

  const triggerHaptic = (style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(style);
    }
  };

  const handleExport = async () => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
    setIsExporting(true);
    setExportStep(1);
    setTimeout(() => setExportStep(2), 1000);
    setTimeout(() => setExportStep(3), 2000);
    setTimeout(() => {
        setIsExporting(false);
        setExportStep(0);
        onShowToast("Class Report Exported (PDF)");
    }, 3000);
  };

  return (
    <View className="flex-1 bg-gray-50/50">
      {/* Header with Dynamic Safe Area */}
      {/* THE PLATINUM "ONE-LINE" HEADER */}
      <PlatinumHeader 
        title="Class Progress"
        subtitle={selectedClass ? `${selectedClass.name} • ${selectedClass.subject}` : 'Institutional Analytics'}
        onBack={() => { triggerHaptic(); onBack(); }}
        rightAction={
          <View className="flex-row items-center gap-2">
            <TouchableOpacity className="p-2 bg-gray-50 rounded-full border border-gray-100">
              <Icons.Search size={18} color="#6b7280" />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={handleExport} 
              className="bg-emerald-600 px-4 py-2 rounded-xl shadow-lg active:scale-95"
            >
              <Text className="text-white text-[10px] font-inter-black uppercase">Export</Text>
            </TouchableOpacity>
          </View>
        }
      />
      <View className="px-4">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-4">
            <TouchableOpacity 
                onPress={() => setSelectedClassId(null)}
                className={`px-4 py-2 rounded-xl border mr-2 ${!selectedClassId ? 'bg-indigo-600 border-indigo-600' : 'bg-gray-50 border-gray-100'}`}
            >
                <Text className={`text-[8px] font-black uppercase tracking-widest font-inter-black ${!selectedClassId ? 'text-white' : 'text-gray-400'}`}>All Classes</Text>
            </TouchableOpacity>
            {assignedSections.map((item, idx) => (
                <TouchableOpacity 
                    key={idx} 
                    onPress={() => setSelectedClassId(item.class_id || item.id)}
                    className={`px-4 py-2 rounded-xl border mr-2 ${selectedClassId === (item.class_id || item.id) ? 'bg-indigo-600 border-indigo-600' : 'bg-gray-50 border-gray-100'}`}
                >
                    <Text className={`text-[8px] font-black uppercase tracking-widest font-inter-black ${selectedClassId === (item.class_id || item.id) ? 'text-white' : 'text-gray-400'}`}>
                        {`${item.name}-${item.section || 'A'} • ${item.subject}`}
                    </Text>
                </TouchableOpacity>
            ))}
        </ScrollView>
      </View>

      {loading ? (
          <ScrollView className="flex-1 px-4 pt-6">
              <View className="flex-row gap-3 mb-3">
                  <SkeletonCard className="flex-1" />
                  <SkeletonCard className="flex-1" />
              </View>
              <View className="flex-row gap-3 mb-6">
                  <SkeletonCard className="flex-1" />
                  <SkeletonCard className="flex-1" />
              </View>
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
          </ScrollView>
      ) : (
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            {/* Metric Grid */}
            <View className="px-4 pt-6">
                <View className="flex-row gap-3 mb-3">
                    <View className="flex-1 bg-white p-5 rounded-2xl border border-white shadow-lg shadow-indigo-100/10">
                        <Icons.Profile size={16} color="#4f46e5" />
                        <Text 
                            className="text-[24px] text-gray-900 font-inter-black mt-2"
                            numberOfLines={1}
                            adjustsFontSizeToFit
                        >
                            {reportStats.total}
                        </Text>
                        <Text className="text-[8px] font-inter-bold uppercase text-gray-400 tracking-widest mt-0.5">Students</Text>
                    </View>
                    <View className="flex-1 bg-white p-5 rounded-2xl border border-white shadow-lg shadow-indigo-100/10">
                        <Icons.CheckCircle size={16} color="#10b981" />
                        <Text 
                            className="text-[24px] text-gray-900 font-inter-black mt-2"
                            numberOfLines={1}
                            adjustsFontSizeToFit
                        >
                            {`${reportStats.avg}%`}
                        </Text>
                        <Text className="text-[8px] font-inter-bold uppercase text-gray-400 tracking-widest mt-0.5">Avg Yield</Text>
                    </View>
                </View>
                <View className="flex-row gap-3">
                    <View className="flex-1 bg-rose-50 p-5 rounded-2xl border border-rose-100 shadow-lg shadow-rose-100/10">
                        <Icons.Alert size={16} color="#ef4444" />
                        <Text 
                            className="text-[24px] text-rose-600 font-inter-black mt-2"
                            numberOfLines={1}
                            adjustsFontSizeToFit
                        >
                            {reportStats.weak.length}
                        </Text>
                        <Text className="text-[8px] font-inter-bold uppercase text-rose-400 tracking-widest mt-0.5">Weak Students</Text>
                    </View>
                    <View className="flex-1 bg-indigo-50 p-5 rounded-2xl border border-indigo-100 shadow-lg shadow-indigo-100/10">
                        <Icons.Refresh size={16} color="#4f46e5" />
                        <Text 
                            className="text-[24px] text-indigo-600 font-inter-black mt-2"
                            numberOfLines={1}
                            adjustsFontSizeToFit
                        >
                            {reportStats.progress}%
                        </Text>
                        <Text className="text-[8px] font-inter-bold uppercase text-indigo-400 tracking-widest mt-0.5">Grading Progress</Text>
                    </View>
                </View>
            </View>

            {/* Top Performers */}
            {reportStats.top.length > 0 && (
                <View className="px-5 pt-4">
                    <Text className="text-[9px] font-black text-emerald-600 uppercase tracking-[3px] mb-4 font-inter-black text-center">Academic Excellence</Text>
                    <View className="bg-emerald-50 p-5 rounded-[28px] border border-emerald-100 shadow-xl shadow-emerald-100/20 mb-6">
                        {reportStats.top.map((s, i) => (
                            <View key={i} className="flex-row items-center justify-between mb-4 pb-4 border-b border-emerald-100/30 last:border-b-0">
                                <View className="flex-row items-center">
                                    <View className="w-10 h-10 rounded-xl bg-white items-center justify-center mr-3 border border-emerald-200">
                                        <Text className="text-[12px] font-black text-emerald-600 font-inter-black">#{i+1}</Text>
                                    </View>
                                    <View>
                                        <Text className="text-[14px] font-black text-gray-900 font-inter-black">{s.users?.name || 'Student'}</Text>
                                        <Text className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Performance Master: {s.avg.toFixed(1)}%</Text>
                                    </View>
                                </View>
                                <Icons.Star size={16} color="#10b981" />
                            </View>
                        ))}
                    </View>
                </View>
            )}

            {/* Student List */}
            <View className="px-5 pt-4">
                <Text className="text-[9px] font-black text-gray-400 uppercase tracking-[3px] mb-4 font-inter-black text-center">Intervention Required</Text>
                
                <View className="bg-white p-5 rounded-[28px] border border-white shadow-xl shadow-indigo-100/20 mb-32">
                    {reportStats.weak.length > 0 ? (
                        <View>
                            {reportStats.weak.map((s, i) => (
                                <View key={i} className="flex-row items-center justify-between mb-4 pb-4 border-b border-gray-50 last:border-b-0">
                                    <View className="flex-row items-center">
                                        <View className="w-10 h-10 rounded-xl bg-rose-50 items-center justify-center mr-3 border border-rose-100">
                                            <Icons.Profile size={16} color="#ef4444" />
                                        </View>
                                        <View>
                                            <Text className="text-[14px] font-black text-gray-900 font-inter-black">{s.users?.name || 'Student'}</Text>
                                            <Text className="text-[8px] font-black text-rose-400 uppercase tracking-widest">Avg: {s.avg.toFixed(1)}% • Action Needed</Text>
                                        </View>
                                    </View>
                                    <TouchableOpacity className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                                        <Icons.Messages size={14} color="#64748b" />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    ) : (
                        <View className="py-8 items-center">
                            <Icons.CheckCircle size={40} color="#10b981" />
                            <Text className="text-emerald-600 font-black text-[10px] uppercase tracking-widest mt-4 font-inter-black">All students above baseline</Text>
                        </View>
                    )}
                </View>
            </View>
        </ScrollView>
      )}

      {/* Export Action */}
      <View className="absolute bottom-6 left-6 right-6">
        <TouchableOpacity 
            onPress={handleExport}
            disabled={isExporting}
            className={`py-4 rounded-2xl flex-row items-center justify-center border ${
                isExporting 
                    ? 'bg-gray-100 border-gray-200' 
                    : 'bg-indigo-600 border-indigo-500 shadow-xl shadow-indigo-500/20'
            }`}
        >
            {isExporting ? (
                <View className="flex-row items-center">
                    <ActivityIndicator color="#4f46e5" size="small" />
                    <Text className="text-indigo-600 font-black uppercase tracking-[3px] text-[9px] font-inter-black ml-3">
                        {exportStep === 1 && "Analyzing Data..."}
                        {exportStep === 2 && "Compiling PDF..."}
                        {exportStep === 3 && "Finalizing..."}
                    </Text>
                </View>
            ) : (
                <>
                    <Icons.FileText size={16} color="white" />
                    <Text className="text-white font-black uppercase tracking-[3px] text-[10px] font-inter-black ml-3">Generate Report</Text>
                </>
            )}
        </TouchableOpacity>
      </View>
    </View>
  );
};
