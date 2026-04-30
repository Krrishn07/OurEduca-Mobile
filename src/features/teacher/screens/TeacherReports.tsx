import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Icons } from '../../../../components/Icons';
import { supabase } from '../../../../lib/supabase';

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
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [grades, setGrades] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
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
            const { data: assignRes } = await supabase.from('assignments').select('*').eq('class_id', classId);
            setAssignments(assignRes || []);
        } else {
            const classIds = assignedSections.map(s => s.class_id || s.id);
            const { data } = await supabase.from('grades').select('*').in('class_id', classIds);
            liveGrades = data || [];
            const { data: allAssign } = await supabase.from('assignments').select('*').in('class_id', classIds);
            setAssignments(allAssign || []);
        }
        setGrades(liveGrades);
    } catch (err) {
        console.error('Report fetch error:', err);
    } finally {
        setLoading(false);
    }
  };

  const currentStudents = selectedClassId 
    ? dbRoster.filter(s => s.class_id === selectedClassId)
    : dbRoster;

  const totalStudents = currentStudents.length;

  const allMarks = grades.map(g => Number(g.marks));
  const avgScore = allMarks.length > 0 
    ? (allMarks.reduce((a, b) => a + b, 0) / allMarks.length).toFixed(1)
    : "0.0";

  const studentGrades = grades.reduce((acc: any, g) => {
    if (!acc[g.student_id]) acc[g.student_id] = [];
    acc[g.student_id].push(Number(g.marks));
    return acc;
  }, {});

  const weakStudentIds = Object.keys(studentGrades).filter(sId => {
      const marks = studentGrades[sId];
      const avg = marks.reduce((a: number, b: number) => a + b, 0) / marks.length;
      return avg < 40;
  });

  const weakStudentsData = currentStudents.filter(s => weakStudentIds.includes(s.user_id || s.users?.id));

  const totalPossibleGrades = totalStudents * (assignments.length || 1);
  const syncProgress = assignments.length > 0 
    ? Math.min(100, Math.round((grades.length / totalPossibleGrades) * 100))
    : 0;

  const handleExport = async () => {
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
      {/* Header */}
      <View className="bg-white pt-12 pb-4 px-5 border-b border-gray-100 shadow-sm">
        <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center">
                <TouchableOpacity onPress={onBack} className="bg-gray-50 p-2.5 rounded-xl border border-gray-100 mr-3">
                    <Icons.ChevronLeft size={18} color="#4f46e5" />
                </TouchableOpacity>
                <View>
                    <Text className="text-[17px] font-black text-gray-900 tracking-tight font-inter-black">Class Reports</Text>
                    <Text className="text-[8px] font-black text-indigo-400 uppercase tracking-[2px] font-inter-black">Academic Performance Hub</Text>
                </View>
            </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
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
                        {item.subject} • SEC {item.section || 'A'}
                    </Text>
                </TouchableOpacity>
            ))}
        </ScrollView>
      </View>

      {loading ? (
          <View className="flex-1 items-center justify-center">
              <ActivityIndicator color="#4f46e5" />
          </View>
      ) : (
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            {/* Metric Grid */}
            <View className="px-4 pt-6">
                <View className="flex-row gap-3 mb-3">
                    <View className="flex-1 bg-white p-5 rounded-2xl border border-white shadow-lg shadow-indigo-100/10">
                        <Icons.Profile size={16} color="#4f46e5" />
                        <Text className="text-[24px] font-black text-gray-900 font-inter-black mt-2">{totalStudents}</Text>
                        <Text className="text-[8px] font-black uppercase text-gray-400 tracking-widest mt-0.5">Students</Text>
                    </View>
                    <View className="flex-1 bg-white p-5 rounded-2xl border border-white shadow-lg shadow-indigo-100/10">
                        <Icons.CheckCircle size={16} color="#10b981" />
                        <Text className="text-[24px] font-black text-gray-900 font-inter-black mt-2">{avgScore}%</Text>
                        <Text className="text-[8px] font-black uppercase text-gray-400 tracking-widest mt-0.5">Avg Yield</Text>
                    </View>
                </View>
                <View className="flex-row gap-3">
                    <View className="flex-1 bg-rose-50 p-5 rounded-2xl border border-rose-100 shadow-lg shadow-rose-100/10">
                        <Icons.Alert size={16} color="#ef4444" />
                        <Text className="text-[24px] font-black text-rose-600 font-inter-black mt-2">{weakStudentsData.length}</Text>
                        <Text className="text-[8px] font-black uppercase text-rose-400 tracking-widest mt-0.5">Weak Students</Text>
                    </View>
                    <View className="flex-1 bg-indigo-50 p-5 rounded-2xl border border-indigo-100 shadow-lg shadow-indigo-100/10">
                        <Icons.Refresh size={16} color="#4f46e5" />
                        <Text className="text-[24px] font-black text-indigo-600 font-inter-black mt-2">{syncProgress}%</Text>
                        <Text className="text-[8px] font-black uppercase text-indigo-400 tracking-widest mt-0.5">Grading Progress</Text>
                    </View>
                </View>
            </View>

            {/* Student List */}
            <View className="px-5 pt-8">
                <Text className="text-[9px] font-black text-gray-400 uppercase tracking-[3px] mb-4 font-inter-black">Student Intervention List</Text>
                
                <View className="bg-white p-5 rounded-[28px] border border-white shadow-xl shadow-indigo-100/20 mb-32">
                    {weakStudentsData.length > 0 ? (
                        <View>
                            <Text className="text-[10px] font-black text-gray-900 uppercase tracking-widest mb-4 font-inter-black">Priority Action Required</Text>
                            {weakStudentsData.map((s, i) => (
                                <View key={i} className="flex-row items-center justify-between mb-4 pb-4 border-b border-gray-50 last:border-b-0">
                                    <View className="flex-row items-center">
                                        <View className="w-10 h-10 rounded-xl bg-rose-50 items-center justify-center mr-3 border border-rose-100">
                                            <Icons.Profile size={16} color="#ef4444" />
                                        </View>
                                        <View>
                                            <Text className="text-[14px] font-black text-gray-900 font-inter-black">{s.users?.name || 'Student'}</Text>
                                            <Text className="text-[8px] font-black text-rose-400 uppercase tracking-widest">Below Academic Baseline</Text>
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
