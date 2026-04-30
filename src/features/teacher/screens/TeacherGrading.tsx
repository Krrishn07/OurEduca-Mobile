import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, FlatList, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Icons } from '../../../../components/Icons';
import { AppCard, AppButton } from '../../../design-system';
import { supabase } from '../../../../lib/supabase';

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
  const [selectedClass, setSelectedClass] = useState<any>(initialClass || null);
  const [students, setStudents] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<string | null>(null);
  const [grades, setGrades] = useState<{[key: string]: string}>({});
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (selectedClass) {
        fetchInitialData();
    }
  }, [selectedClass]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
        // Fetch Students
        const { data: rosterData } = await supabase
            .from('class_roster')
            .select('user_id, users(id, name, roll_number)')
            .eq('class_id', selectedClass.class_id || selectedClass.id)
            .eq('role_in_class', 'student');

        if (rosterData) setStudents(rosterData);

        // Fetch Assignments
        const { data: assignmentData } = await supabase
            .from('assignments')
            .select('*')
            .eq('class_id', selectedClass.class_id || selectedClass.id);

        if (assignmentData) {
            setAssignments(assignmentData);
            if (assignmentData.length > 0) setSelectedAssignment(assignmentData[0].id);
        }

        // Fetch Existing Grades if assignment selected
        if (assignmentData && assignmentData.length > 0) {
            fetchGrades(assignmentData[0].id);
        }
    } catch (err) {
        console.error('Fetch error:', err);
    } finally {
        setLoading(false);
    }
  };

  const fetchGrades = async (assignmentId: string) => {
      const { data } = await supabase
          .from('grades')
          .select('student_id, marks')
          .eq('assignment_id', assignmentId);
      
      if (data) {
          const gradeMap: any = {};
          data.forEach(g => {
              gradeMap[g.student_id] = g.marks.toString();
          });
          setGrades(gradeMap);
      } else {
          setGrades({});
      }
  };

  const handleSaveGrades = async () => {
    if (!selectedAssignment) {
        Alert.alert("Assignment Required", "Please select an evaluation target.");
        return;
    }
    setSyncing(true);
    try {
        const payload = Object.entries(grades).map(([studentId, score]) => ({
            student_id: studentId,
            assignment_id: selectedAssignment,
            marks: Number(score),
        }));

        if (payload.length === 0) {
            setSyncing(false);
            return;
        }

        const { error } = await supabase
            .from('grades')
            .upsert(payload, { onConflict: 'student_id,assignment_id' });

        if (error) throw error;
        Alert.alert("Success", "Grades synchronized to institutional ledger.");
    } catch (err: any) {
        console.error('Sync error:', err);
        Alert.alert("Sync Failed", err.message || "Could not save grades.");
    } finally {
        setSyncing(false);
    }
  };

  const filteredStudents = students.filter(s => {
    const name = s.users?.name || '';
    const roll = s.users?.roll_number || '';
    return name.toLowerCase().includes(searchQuery.toLowerCase()) || 
           roll.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const canSave = selectedAssignment && Object.keys(grades).length > 0;

  const renderStudentItem = ({ item, index }: { item: any, index: number }) => {
    const studentId = item.user_id || item.users?.id;
    const currentScore = grades[studentId] || "";

    return (
        <View style={{
            padding: 16,
            borderRadius: 20,
            backgroundColor: "#1e293b",
            marginBottom: 12,
            borderWidth: 1,
            borderColor: "#334155"
        }}>
            <View className="flex-row justify-between items-center mb-3">
                <View>
                    <Text className="text-white font-black text-[15px] font-inter-black">{item.users?.name || 'Student'}</Text>
                    <Text className="text-indigo-400 text-[9px] font-black uppercase tracking-widest font-inter-black">
                        Roll: {item.users?.roll_number || (index + 1)}
                    </Text>
                </View>
                <Icons.CheckCircle size={16} color={currentScore ? "#10b981" : "#475569"} />
            </View>

            <TextInput
                placeholder="Enter Marks"
                placeholderTextColor="#64748b"
                keyboardType="numeric"
                value={currentScore}
                onChangeText={(val) => {
                    if (/^\d*$/.test(val)) {
                        setGrades((prev) => ({ ...prev, [studentId]: val }));
                    }
                }}
                style={{
                    backgroundColor: "#0f172a",
                    borderWidth: 1,
                    borderColor: "#334155",
                    borderRadius: 12,
                    padding: 12,
                    color: "white",
                    fontWeight: "900",
                    fontSize: 16,
                    textAlign: 'center'
                }}
            />
        </View>
    );
  };

  return (
    <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1 bg-[#0f172a]"
    >
      {/* Dark Institutional Header */}
      <View className="bg-[#1e293b] pt-14 pb-6 px-6 border-b border-[#334155]">
        <View className="flex-row items-center justify-between mb-6">
            <View className="flex-row items-center">
                <TouchableOpacity 
                    onPress={onBack}
                    className="bg-[#0f172a] p-3 rounded-2xl border border-[#334155] mr-4"
                >
                    <Icons.ChevronLeft size={20} color="#6366f1" />
                </TouchableOpacity>
                <View>
                    <Text className="text-[20px] font-black text-white tracking-tight font-inter-black">Gradebook Hub</Text>
                    <Text className="text-[9px] font-black text-indigo-400 uppercase tracking-[2px] font-inter-black">Real-time Evaluation Node</Text>
                </View>
            </View>
            {selectedClass && (
                <TouchableOpacity 
                    onPress={() => setSelectedClass(null)}
                    className="bg-[#0f172a] px-4 py-2.5 rounded-xl border border-[#334155]"
                >
                    <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest font-inter-black">Switch</Text>
                </TouchableOpacity>
            )}
        </View>

        {selectedClass && (
            <View className="gap-4">
                {/* Assignment Selector (Custom Chip-based) */}
                <View>
                    <Text className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-3 ml-1">Select Evaluation Target</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                        {assignments.length > 0 ? assignments.map((a) => (
                            <TouchableOpacity
                                key={a.id}
                                onPress={() => {
                                    setSelectedAssignment(a.id);
                                    fetchGrades(a.id);
                                }}
                                className={`px-5 py-3 rounded-2xl border mr-3 ${
                                    selectedAssignment === a.id 
                                    ? 'bg-indigo-600 border-indigo-500 shadow-lg shadow-indigo-500/20' 
                                    : 'bg-[#0f172a] border-[#334155]'
                                }`}
                            >
                                <Text className={`text-[11px] font-black uppercase tracking-widest font-inter-black ${
                                    selectedAssignment === a.id ? 'text-white' : 'text-gray-400'
                                }`}>
                                    {a.title}
                                </Text>
                            </TouchableOpacity>
                        )) : (
                            <View className="px-5 py-3 rounded-2xl border border-[#334155] bg-[#0f172a]">
                                <Text className="text-[11px] font-black uppercase tracking-widest text-gray-600 font-inter-black">No Assignments Available</Text>
                            </View>
                        )}
                    </ScrollView>
                </View>

                {/* Search Bar */}
                <View className="bg-[#0f172a] rounded-2xl border border-[#334155] px-5 py-3.5 flex-row items-center">
                    <Icons.Search size={18} color="#64748b" />
                    <TextInput 
                        placeholder="Search student nodes..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        className="flex-1 ml-4 text-[13px] font-black text-white font-inter-black p-0"
                        placeholderTextColor="#64748b"
                    />
                </View>
            </View>
        )}
      </View>

      {!selectedClass ? (
        <ScrollView className="flex-1 px-4 pt-6" showsVerticalScrollIndicator={false}>
            <Text className="text-[10px] font-black text-gray-400 uppercase tracking-[3px] mb-6 px-2 font-inter-black">Select Class Node</Text>
            {assignedSections.map((item, idx) => (
                <TouchableOpacity 
                    key={idx} 
                    onPress={() => setSelectedClass(item)}
                    activeOpacity={0.9}
                    className="mb-4"
                >
                    <AppCard className="p-6 bg-[#1e293b] border-[#334155] shadow-2xl flex-row items-center">
                        <View className="w-14 h-14 bg-[#0f172a] rounded-2xl items-center justify-center mr-5 border border-[#334155]">
                            <Icons.Classes size={26} color="#6366f1" />
                        </View>
                        <View className="flex-1">
                            <Text className="font-black text-white text-lg tracking-tight font-inter-black">{item.subject}</Text>
                            <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest font-inter-black">{item.name} • SEC {item.section || 'A'}</Text>
                        </View>
                        <Icons.ChevronRight size={20} color="#475569" />
                    </AppCard>
                </TouchableOpacity>
            ))}
        </ScrollView>
      ) : (
        <View className="flex-1">
            {loading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator color="#6366f1" />
                    <Text className="mt-4 text-[10px] font-black text-gray-400 uppercase tracking-widest font-inter-black">Syncing Academic Ledger...</Text>
                </View>
            ) : (
                <FlatList 
                    data={filteredStudents}
                    keyExtractor={(item) => item.user_id || item.users?.id}
                    renderItem={renderStudentItem}
                    contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 20, paddingBottom: 120 }}
                    ListHeaderComponent={
                        <View className="flex-row items-center justify-between py-2 px-2 mb-2">
                            <Text className="text-[10px] font-black text-gray-400 uppercase tracking-[3px] font-inter-black">Institutional Roster</Text>
                            <Text className="text-[10px] font-black text-indigo-400 uppercase tracking-widest font-inter-black">{filteredStudents.length} Found</Text>
                        </View>
                    }
                    ListEmptyComponent={
                        <View className="py-20 items-center bg-[#1e293b] rounded-[32px] border border-[#334155] mx-1">
                            <Icons.Users size={40} color="#334155" />
                            <Text className="text-gray-400 font-black text-[11px] uppercase tracking-widest mt-4 font-inter-black">No scholars found in segment</Text>
                        </View>
                    }
                />
            )}

            {canSave && (
                <View className="absolute bottom-8 left-6 right-6">
                    <AppButton 
                        label={syncing ? "Synchronizing..." : `Finalize ${Object.keys(grades).length} Evaluated Node(s)`}
                        onPress={handleSaveGrades}
                        disabled={syncing}
                        className="py-5 bg-indigo-600 rounded-[24px]"
                    />
                </View>
            )}
        </View>
      )}
    </KeyboardAvoidingView>
  );
};
