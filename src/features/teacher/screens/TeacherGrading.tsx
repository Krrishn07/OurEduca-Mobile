import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { Icons } from '../../../../components/Icons';
import { AppCard, SectionHeader, AppRow, StatusPill, AppButton } from '../../../design-system';
import { supabase } from '../../../../lib/supabase';

interface TeacherGradingProps {
  assignedSections: any[];
  onBack: () => void;
}

export const TeacherGrading: React.FC<TeacherGradingProps> = ({
  assignedSections = [],
  onBack
}) => {
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [scores, setScores] = useState<{[key: string]: string}>({});

  useEffect(() => {
    if (selectedClass) {
        fetchRoster();
    }
  }, [selectedClass]);

  const fetchRoster = async () => {
    setLoading(true);
    try {
        const { data, error } = await supabase
            .from('class_roster')
            .select('id, grade_score, users!inner(id, name, avatar)')
            .eq('class_id', selectedClass.class_id)
            .eq('section', selectedClass.section || 'A')
            .eq('role_in_class', 'student');

        if (!error && data) {
            setStudents(data);
            const initialScores: any = {};
            data.forEach((s: any) => {
                initialScores[s.id] = s.grade_score || '';
            });
            setScores(initialScores);
        }
    } catch (err) {
        console.error('fetchRoster error:', err);
    } finally {
        setLoading(false);
    }
  };

  const handleUpdateGrade = async (rosterId: string) => {
    setSaving(true);
    try {
        const { error } = await supabase
            .from('class_roster')
            .update({ grade_score: scores[rosterId] })
            .eq('id', rosterId);

        if (!error) {
            // Success feedback could be added here
        }
    } catch (err) {
        console.error('handleUpdateGrade error:', err);
    } finally {
        setSaving(false);
    }
  };

  return (
    <View className="flex-1 bg-gray-50/50">
      {/* Header */}
      <View className="bg-white border-b border-gray-100 pt-12 pb-6 px-6 shadow-sm">
        <View className="flex-row items-center">
            <TouchableOpacity 
                onPress={onBack}
                className="bg-gray-50 p-2.5 rounded-xl border border-gray-100 mr-4 active:scale-90"
            >
                <Icons.ChevronLeft size={18} color="#4f46e5" />
            </TouchableOpacity>
            <View>
                <Text className="text-[17px] font-black text-gray-900 tracking-tighter font-inter-black uppercase tracking-widest">Performance Hub</Text>
                <Text className="text-[9px] font-black text-indigo-400 uppercase tracking-[3px] mt-0.5 font-inter-black">Grade Management</Text>
            </View>
        </View>
      </View>

      <View className="flex-1 px-4 pt-6">
        {!selectedClass ? (
            <ScrollView showsVerticalScrollIndicator={false}>
                <SectionHeader title="SELECT CLASS TO GRADE" className="mb-4 px-2" />
                {assignedSections.map((item, idx) => (
                    <TouchableOpacity 
                        key={idx} 
                        onPress={() => setSelectedClass(item)}
                        className="mb-4"
                    >
                        <AppCard className="p-5 border border-white shadow-lg shadow-indigo-100/30 flex-row items-center justify-between">
                            <View>
                                <Text className="font-black text-gray-900 text-lg font-inter-black">{item.subject}</Text>
                                <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest font-inter-black">{item.name} • Section {item.section || 'A'}</Text>
                            </View>
                            <Icons.ChevronRight size={18} color="#cbd5e1" />
                        </AppCard>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        ) : (
            <View className="flex-1">
                <View className="flex-row items-center justify-between mb-6 px-2">
                    <View>
                        <Text className="text-[15px] font-black text-gray-900 font-inter-black">{selectedClass.subject}</Text>
                        <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest font-inter-black">Grading Roster</Text>
                    </View>
                    <TouchableOpacity 
                        onPress={() => setSelectedClass(null)}
                        className="bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-100"
                    >
                        <Text className="text-[9px] font-black text-indigo-600 uppercase tracking-widest font-inter-black">Switch Class</Text>
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <View className="flex-1 items-center justify-center">
                        <ActivityIndicator color="#4f46e5" />
                    </View>
                ) : (
                    <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
                        <AppCard className="p-0 overflow-hidden border border-white shadow-xl shadow-indigo-100/30 mb-10">
                            {students.map((student, idx) => (
                                <View 
                                    key={student.id} 
                                    className={`p-4 flex-row items-center justify-between ${idx < students.length - 1 ? 'border-b border-gray-50' : ''}`}
                                >
                                    <View className="flex-row items-center flex-1">
                                        <View className="w-10 h-10 bg-indigo-50 rounded-xl items-center justify-center mr-3 border border-indigo-100">
                                            <Icons.Profile size={20} color="#4f46e5" />
                                        </View>
                                        <View>
                                            <Text className="text-[14px] font-black text-gray-900 font-inter-black">{student.users.name}</Text>
                                            <Text className="text-[9px] font-black text-gray-400 uppercase tracking-widest font-inter-black">Student ID: {student.users.id.slice(0, 8)}</Text>
                                        </View>
                                    </View>
                                    
                                    <View className="flex-row items-center">
                                        <TextInput 
                                            className="bg-gray-50 w-16 h-10 rounded-xl border border-gray-100 px-2 text-center text-[13px] font-black text-indigo-600 font-inter-black mr-2"
                                            placeholder="Grade"
                                            value={scores[student.id]}
                                            onChangeText={(txt) => setScores({...scores, [student.id]: txt})}
                                            onBlur={() => handleUpdateGrade(student.id)}
                                        />
                                        {saving && <ActivityIndicator size="small" color="#4f46e5" />}
                                    </View>
                                </View>
                            ))}
                        </AppCard>
                    </ScrollView>
                )}
            </View>
        )}
      </View>
    </View>
  );
};
