import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Icons } from '../../../../components/Icons';
import { AppCard, AppButton } from '../../../design-system';
import { supabase } from '../../../../lib/supabase';
import { useMockAuth } from '../../../../contexts/MockAuthContext';

interface TeacherGradingProps {
  assignedSections: any[];
  onBack: () => void;
  initialClass?: any;
}

export const TeacherGrading: React.FC<TeacherGradingProps> = ({
  assignedSections = [],
  onBack,
  initialClass
}) => {
  const { currentUser } = useMockAuth();
  const [selectedClass, setSelectedClass] = useState<any>(initialClass || null);
  const [students, setStudents] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [grid, setGrid] = useState<{[key: string]: {[key: string]: string}}>({});
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddAssignment, setShowAddAssignment] = useState(false);
  const [newAssignmentTitle, setNewAssignmentTitle] = useState('');

  useEffect(() => {
    if (selectedClass) {
        fetchGridData();
    }
  }, [selectedClass]);

  const fetchGridData = async () => {
    setLoading(true);
    try {
        const classId = selectedClass.class_id || selectedClass.id;
        const [rosterRes, assignmentRes] = await Promise.all([
            supabase.from('class_roster').select('user_id, users(id, name, roll_number)').eq('class_id', classId).eq('role_in_class', 'student'),
            supabase.from('assignments').select('*').eq('class_id', classId)
        ]);

        if (rosterRes.data) setStudents(rosterDataNormalization(rosterRes.data));
        if (assignmentRes.data) setAssignments(assignmentRes.data);

        if (assignmentRes.data && assignmentRes.data.length > 0) {
            const assignmentIds = assignmentRes.data.map(a => a.id);
            const { data: gradesData } = await supabase
                .from('grades')
                .select('*')
                .in('assignment_id', assignmentIds);
            
            if (gradesData) {
                const gradeMap: any = {};
                gradesData.forEach(g => {
                    if (!gradeMap[g.student_id]) gradeMap[g.student_id] = {};
                    gradeMap[g.student_id][g.assignment_id] = g.marks.toString();
                });
                setGrid(gradeMap);
            }
        } else {
            setGrid({});
        }
    } catch (err) {
        console.error('Fetch error:', err);
    } finally {
        setLoading(false);
    }
  };

  const rosterDataNormalization = (data: any[]) => {
      return data.map(item => ({
          ...item,
          displayName: item.users?.name || 'Student',
          rollNumber: item.users?.roll_number || 'N/A'
      }));
  };

  const handleCreateAssignment = async () => {
    if (!newAssignmentTitle.trim()) return;
    setSyncing(true);
    try {
        const classId = selectedClass.class_id || selectedClass.id;
        const { data, error } = await supabase
            .from('assignments')
            .insert({
                title: newAssignmentTitle.trim(),
                class_id: classId,
                created_by: currentUser?.id
            })
            .select()
            .single();

        if (error) throw error;
        setAssignments(prev => [...prev, data]);
        setNewAssignmentTitle('');
        setShowAddAssignment(false);
    } catch (err: any) {
        Alert.alert("Error", err.message);
    } finally {
        setSyncing(false);
    }
  };

  const handleSaveAll = async () => {
    setSyncing(true);
    try {
        const classId = selectedClass.class_id || selectedClass.id;
        const payload: any[] = [];
        Object.entries(grid).forEach(([studentId, assignmentGrades]) => {
            Object.entries(assignmentGrades).forEach(([assignmentId, marks]) => {
                if (marks !== "") {
                    payload.push({
                        student_id: studentId,
                        assignment_id: assignmentId,
                        class_id: classId,
                        marks: Number(marks),
                    });
                }
            });
        });

        if (payload.length === 0) {
            setSyncing(false);
            return;
        }

        const { error } = await supabase
            .from('grades')
            .upsert(payload, { onConflict: 'student_id,assignment_id' });

        if (error) throw error;
        Alert.alert("Success", "Grades saved successfully.");
        fetchGridData();
    } catch (err: any) {
        Alert.alert("Error", err.message);
    } finally {
        setSyncing(false);
    }
  };

  const filteredStudents = students.filter(s => {
    const name = s.displayName || '';
    const roll = s.rollNumber || '';
    return name.toLowerCase().includes(searchQuery.toLowerCase()) || 
           roll.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const canSave = Object.keys(grid).length > 0;

  return (
    <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1 bg-gray-50/50"
    >
      {/* Header */}
      <View className="bg-white pt-12 pb-4 px-5 border-b border-gray-100 shadow-sm">
        <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center">
                <TouchableOpacity onPress={onBack} className="bg-gray-50 p-2.5 rounded-xl border border-gray-100 mr-3">
                    <Icons.ChevronLeft size={18} color="#4f46e5" />
                </TouchableOpacity>
                <View>
                    <Text className="text-[17px] font-black text-gray-900 tracking-tight font-inter-black">Gradebook Hub</Text>
                    <Text className="text-[8px] font-black text-indigo-400 uppercase tracking-[2px] font-inter-black">Academic Grading Center</Text>
                </View>
            </View>
            {selectedClass && (
                <View className="flex-row gap-2">
                    <TouchableOpacity onPress={() => setShowAddAssignment(!showAddAssignment)} className="bg-indigo-50 p-2.5 rounded-xl border border-indigo-100">
                        <Icons.Plus size={18} color="#4f46e5" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setSelectedClass(null)} className="bg-gray-50 px-3 py-2 rounded-xl border border-gray-100 items-center justify-center">
                        <Text className="text-[9px] font-black text-gray-400 uppercase tracking-widest font-inter-black">Switch</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>

        {selectedClass && (
            <View className="gap-2">
                {showAddAssignment && (
                    <View className="bg-indigo-50/50 p-3 rounded-2xl border border-indigo-100 mb-1">
                        <View className="flex-row items-center">
                            <TextInput 
                                placeholder="Assignment Title"
                                value={newAssignmentTitle}
                                onChangeText={setNewAssignmentTitle}
                                className="flex-1 bg-white border border-indigo-100 rounded-xl px-3 py-2 text-[12px] font-black text-gray-900 font-inter-black"
                            />
                            <TouchableOpacity 
                                onPress={handleCreateAssignment}
                                disabled={syncing || !newAssignmentTitle.trim()}
                                className="ml-2 bg-indigo-600 px-4 py-2 rounded-xl"
                            >
                                <Text className="text-white font-black text-[9px] uppercase tracking-widest">Add</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
                <View className="bg-gray-50 rounded-xl border border-gray-100 px-4 py-2.5 flex-row items-center">
                    <Icons.Search size={16} color="#94a3b8" />
                    <TextInput 
                        placeholder="Search student names..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        className="flex-1 ml-3 text-[12px] font-black text-gray-900 font-inter-black p-0"
                        placeholderTextColor="#94a3b8"
                    />
                </View>
            </View>
        )}
      </View>

      {!selectedClass ? (
        <ScrollView className="flex-1 px-4 pt-4">
            <Text className="text-[9px] font-black text-gray-400 uppercase tracking-[3px] mb-4 px-2 font-inter-black">All Classes</Text>
            {assignedSections.map((item, idx) => (
                <TouchableOpacity key={idx} onPress={() => setSelectedClass(item)} className="mb-3">
                    <AppCard className="p-4 bg-white border-white shadow-lg shadow-indigo-100/20 flex-row items-center">
                        <View className="w-11 h-11 bg-indigo-50 rounded-xl items-center justify-center mr-4 border border-indigo-100">
                            <Icons.Classes size={20} color="#4f46e5" />
                        </View>
                        <View className="flex-1">
                            <Text className="font-black text-gray-900 text-base font-inter-black">{item.subject}</Text>
                            <Text className="text-[9px] font-black text-gray-400 uppercase tracking-widest font-inter-black">{item.name} • SEC {item.section || 'A'}</Text>
                        </View>
                        <Icons.ChevronRight size={16} color="#cbd5e1" />
                    </AppCard>
                </TouchableOpacity>
            ))}
        </ScrollView>
      ) : (
        <View className="flex-1">
            {loading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator color="#4f46e5" />
                    <Text className="mt-3 text-[9px] font-black text-gray-400 uppercase tracking-widest font-inter-black">Loading Gradebook...</Text>
                </View>
            ) : assignments.length === 0 ? (
                <View className="flex-1 items-center justify-center px-12">
                    <Icons.FileText size={40} color="#cbd5e1" />
                    <Text className="text-gray-900 font-black text-base mt-4 font-inter-black text-center">No Assignments Found</Text>
                    <Text className="text-gray-400 text-center text-[10px] mt-2 font-inter-black leading-4">This class segment has no assignments registered. Create one to begin grading.</Text>
                    <TouchableOpacity 
                        onPress={() => setShowAddAssignment(true)}
                        className="mt-6 bg-indigo-600 px-6 py-3 rounded-2xl"
                    >
                        <Text className="text-white font-black text-[10px] uppercase tracking-widest font-inter-black">Create First Assignment</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={{ minWidth: '100%' }}>
                        <View className="flex-row bg-white border-b border-gray-100 py-3 px-5">
                            <Text style={{ width: 180 }} className="text-[9px] font-black text-gray-400 uppercase tracking-widest font-inter-black">Student Name</Text>
                            {assignments.map((a, idx) => (
                                <View key={a.id} style={{ width: 100 }} className="items-center px-2">
                                    <Text numberOfLines={1} className="text-[9px] font-black text-gray-900 uppercase tracking-widest font-inter-black text-center">{a.title}</Text>
                                    <Text className="text-[7px] font-black text-indigo-400 uppercase tracking-widest font-inter-black mt-0.5">MAX 100</Text>
                                </View>
                            ))}
                        </View>

                        <ScrollView className="flex-1">
                            {filteredStudents.map((student, sIdx) => {
                                const sId = student.user_id || student.users?.id;
                                return (
                                    <View key={sId} className={`flex-row px-5 py-3 items-center border-b border-gray-50/50 ${sIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50/10'}`}>
                                        <View style={{ width: 180 }}>
                                            <Text className="text-gray-900 font-black text-[12px] font-inter-black" numberOfLines={1}>{student.displayName}</Text>
                                            <Text className="text-[8px] font-black text-gray-400 uppercase tracking-widest font-inter-black">Roll: {student.rollNumber}</Text>
                                        </View>

                                        {assignments.map((a, idx) => (
                                            <View key={a.id} style={{ width: 100 }} className="px-2">
                                                <TextInput
                                                    style={{
                                                        backgroundColor: "white",
                                                        borderWidth: 1,
                                                        borderColor: grid[sId]?.[a.id] ? "#818cf8" : "#f1f5f9",
                                                        borderRadius: 10,
                                                        paddingVertical: 7,
                                                        color: "#1e293b",
                                                        fontWeight: "900",
                                                        fontSize: 13,
                                                        textAlign: "center"
                                                    }}
                                                    keyboardType="numeric"
                                                    placeholder="-"
                                                    placeholderTextColor="#cbd5e1"
                                                    value={grid[sId]?.[a.id] || ""}
                                                    onChangeText={(val) => {
                                                        if (/^\d*$/.test(val)) {
                                                            setGrid(prev => ({
                                                                ...prev,
                                                                [sId]: {
                                                                    ...prev[sId],
                                                                    [a.id]: val
                                                                }
                                                            }));
                                                        }
                                                    }}
                                                />
                                            </View>
                                        ))}
                                    </View>
                                );
                            })}
                            <View className="h-32" />
                        </ScrollView>
                    </View>
                </ScrollView>
            )}

            {canSave && !loading && assignments.length > 0 && (
                <View className="absolute bottom-6 left-6 right-6">
                    <AppButton 
                        label={syncing ? "Saving..." : "Save Gradebook"}
                        onPress={handleSaveAll}
                        disabled={syncing}
                        className="py-4 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-200"
                    />
                </View>
            )}
        </View>
      )}
    </KeyboardAvoidingView>
  );
};
