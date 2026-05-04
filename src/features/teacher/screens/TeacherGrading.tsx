import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { Icons } from '../../../../components/Icons';
import { AppCard, AppButton, SkeletonCard, SkeletonRow, PlatinumHeader } from '../../../design-system';
import { CreateAssignmentModal } from '../modals/CreateAssignmentModal';
import { supabase } from '../../../../lib/supabase';
import { useMockAuth } from '../../../../contexts/MockAuthContext';
import { useSchoolData } from '../../../../contexts/SchoolDataContext';

interface TeacherGradingProps {
  assignedSections: any[];
  onBack: () => void;
  initialClass?: any;
  initialAssignment?: any;
  onAddAssignment?: (classId?: string) => void;
}

export const TeacherGrading: React.FC<TeacherGradingProps> = ({
  assignedSections = [],
  onBack,
  initialClass,
  initialAssignment,
  onAddAssignment
}) => {
  const { currentUser } = useMockAuth();
  const { assignments: globalAssignments, gradeAssignment, addAssignment } = useSchoolData();
  const [selectedClass, setSelectedClass] = useState<any>(initialClass || null);
  
  const assignments = React.useMemo(() => {
    if (!selectedClass) return [];
    const classId = selectedClass.class_id || selectedClass.id;
    const filtered = globalAssignments.filter(a => String(a.class_id) === String(classId));
    console.log(`[GRADING_SYNC] Class: ${classId}, Found: ${filtered.length}/${globalAssignments.length}`);
    return filtered;
  }, [globalAssignments, selectedClass]);
  
  const insets = useSafeAreaInsets();
  const [selectedAssignment, setSelectedAssignment] = useState<any>(initialAssignment || null);
  const [students, setStudents] = useState<any[]>([]);
  const [grid, setGrid] = useState<{[key: string]: string}>({});
  const [syncedGrades, setSyncedGrades] = useState<{[key: string]: boolean}>({});
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const triggerHaptic = (style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(style);
    }
  };

  useEffect(() => {
    if (selectedClass) {
        fetchGridData();
    }
  }, [selectedClass, selectedAssignment]);

  // PERSIST TO LEDGER: Save to AsyncStorage with Debounce to prevent race conditions
  useEffect(() => {
    if (selectedAssignment && Object.keys(grid).length > 0) {
        const timeoutId = setTimeout(() => {
            const cacheKey = `ledger_${selectedAssignment.id}`;
            AsyncStorage.setItem(cacheKey, JSON.stringify({ grid, syncedGrades }));
        }, 800); // 800ms debounce
        return () => clearTimeout(timeoutId);
    }
  }, [grid, syncedGrades, selectedAssignment]);

  const fetchGridData = async () => {
    setLoading(true);
    try {
        const classId = selectedClass.class_id || selectedClass.id;
        const [rosterRes] = await Promise.all([
            supabase.from('class_roster').select('user_id, users(id, name, roll_number)').eq('class_id', classId).eq('role_in_class', 'student')
        ]);
        if (rosterRes.data) setStudents(rosterDataNormalization(rosterRes.data));

        if (selectedAssignment) {
            // 1. Load from Server
            const { data: gradesData } = await supabase
                .from('grades')
                .select('*')
                .eq('assignment_id', selectedAssignment.id);
            
            const serverMap: any = {};
            const serverSynced: any = {};
            if (gradesData) {
                gradesData.forEach(g => {
                    serverMap[g.student_id] = g.marks.toString();
                    serverSynced[g.student_id] = true;
                });
            }

            // 2. Cross-reference with Local Ledger
            const cacheKey = `ledger_${selectedAssignment.id}`;
            const cached = await AsyncStorage.getItem(cacheKey);
            if (cached) {
                const { grid: cachedGrid, syncedGrades: cachedSynced } = JSON.parse(cached);
                // Merge logic: Local (Unsynced) overwrites Server
                const mergedGrid = { ...serverMap, ...cachedGrid };
                const mergedSynced = { ...serverSynced, ...cachedSynced };
                setGrid(mergedGrid);
                setSyncedGrades(mergedSynced);
            } else {
                setGrid(serverMap);
                setSyncedGrades(serverSynced);
            }
        } else {
            setGrid({});
            setSyncedGrades({});
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

  const handleSaveAll = async () => {
    if (!selectedAssignment) return;
    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
    setSyncing(true);
    try {
        const classId = selectedClass.class_id || selectedClass.id;
        const unsyncedIds = Object.keys(grid).filter(id => !syncedGrades[id]);
        
        if (unsyncedIds.length === 0) {
            setSyncing(false);
            Alert.alert("Up to Date", "All grades are already synchronized.");
            return;
        }

        const syncResults: {[key: string]: boolean} = { ...syncedGrades };
        let failCount = 0;

        for (const studentId of unsyncedIds) {
            const marks = grid[studentId];
            if (marks !== "") {
                try {
                    await gradeAssignment({
                        student_id: studentId,
                        assignment_id: selectedAssignment.id,
                        class_id: classId,
                        marks: Number(marks),
                    });
                    syncResults[studentId] = true;
                } catch (err) {
                    console.warn(`Sync failed for ${studentId}:`, err);
                    failCount++;
                }
            }
        }

        setSyncedGrades(syncResults);
        
        if (failCount === 0) {
            const cacheKey = `ledger_${selectedAssignment.id}`;
            await AsyncStorage.removeItem(cacheKey);
            Alert.alert("Success", "Institutional Ledger synchronized successfully. Local cache cleared.");
        } else {
            Alert.alert("Partial Sync", `Synchronized ${unsyncedIds.length - failCount} records. ${failCount} records saved locally due to connection.`);
        }
    } catch (err: any) {
        Alert.alert("Error", "Critical sync failure. Local ledger remains intact.");
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

  const canSave = Object.keys(grid).some(id => !syncedGrades[id]);

  return (
    <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1 bg-gray-50/50"
    >
      {/* THE PLATINUM "ONE-LINE" HEADER */}
      <PlatinumHeader 
        title="Student Scores"
        subtitle={selectedClass ? `${selectedClass.name} • ${selectedClass.subject}` : 'Marking Hub'}
        onBack={() => { triggerHaptic(); onBack(); }}
        rightAction={
          <View className="flex-row items-center gap-2">
            <TouchableOpacity className="p-2 bg-gray-50 rounded-full border border-gray-100">
              <Icons.Search size={18} color="#6b7280" />
            </TouchableOpacity>
            
            {selectedClass && (
              <TouchableOpacity 
                onPress={() => { 
                  if (canSave) {
                    triggerHaptic(Haptics.ImpactFeedbackStyle.Heavy); 
                    handleSaveAll();
                  } else {
                    if (onAddAssignment) {
                      const cid = selectedClass?.class_id || selectedClass?.id;
                      onAddAssignment(cid); 
                    }
                  }
                }} 
                className={`${canSave ? 'bg-indigo-600' : 'bg-indigo-600'} px-4 py-2 rounded-xl shadow-lg active:scale-95`}
              >
                <Text className="text-white text-[10px] font-inter-black uppercase">
                  {canSave ? 'Sync' : 'Add'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />

        {selectedClass && (
            <View className="gap-2">
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
                <ScrollView className="flex-1 px-5 pt-6">
                    <SkeletonCard className="mb-4" />
                    <SkeletonCard className="mb-4" />
                    <SkeletonRow />
                    <SkeletonRow />
                    <SkeletonRow />
                </ScrollView>
            ) : assignments.length === 0 ? (
                <View className="flex-1 items-center justify-center px-12">
                    <Icons.FileText size={40} color="#cbd5e1" />
                    <Text className="text-gray-900 font-black text-base mt-4 font-inter-black text-center">No Assignments Found</Text>
                    <Text className="text-gray-400 text-center text-[10px] mt-2 font-inter-black leading-4">This class segment has no assignments registered. Create one to begin grading.</Text>
                    <TouchableOpacity 
                        onPress={() => { 
                          if (onAddAssignment) {
                            const cid = selectedClass?.class_id || selectedClass?.id;
                            onAddAssignment(cid);
                          }
                        }}
                        className="mt-6 bg-indigo-600 px-6 py-3 rounded-2xl"
                    >
                        <Text className="text-white font-black text-[10px] uppercase tracking-widest font-inter-black">Create First Assignment</Text>
                    </TouchableOpacity>
                </View>
            ) : !selectedAssignment ? (
                <ScrollView className="flex-1 px-5 pt-6">
                    <Text className="text-[9px] font-black text-gray-400 uppercase tracking-[3px] mb-4 font-inter-black">Select Assignment to Grade</Text>
                    {assignments.map((a, idx) => (
                        <TouchableOpacity 
                            key={a.id} 
                            onPress={() => setSelectedAssignment(a)}
                            className="mb-3"
                        >
                            <AppCard className="p-4 bg-white border-white shadow-lg shadow-indigo-100/10 flex-row items-center">
                                <View className="w-10 h-10 bg-indigo-50 rounded-xl items-center justify-center mr-4 border border-indigo-100">
                                    <Icons.Edit size={16} color="#4f46e5" />
                                </View>
                                <View className="flex-1">
                                    <Text className="font-black text-gray-900 text-[14px] font-inter-black">{a.title}</Text>
                                    <Text className="text-[8px] font-black text-indigo-400 uppercase tracking-widest font-inter-black">{`Max Marks: ${a.max_marks}`}</Text>
                                </View>
                                <Icons.ChevronRight size={14} color="#cbd5e1" />
                            </AppCard>
                        </TouchableOpacity>
                    ))}
                    <TouchableOpacity 
                        onPress={() => { 
                          if (onAddAssignment) {
                            const cid = selectedClass?.class_id || selectedClass?.id;
                            onAddAssignment(cid);
                          }
                        }}
                        className="py-4 border border-dashed border-indigo-200 rounded-2xl items-center justify-center mt-2"
                    >
                        <Text className="text-indigo-600 font-black text-[9px] uppercase tracking-widest">+ Create New Assignment</Text>
                    </TouchableOpacity>
                </ScrollView>
            ) : (
                <View className="flex-1">
                    <View className="bg-indigo-600 px-5 py-4 flex-row items-center justify-between">
                        <View>
                            <Text className="text-white font-black text-[14px] font-inter-black">{selectedAssignment.title}</Text>
                            <Text className="text-indigo-200 font-black text-[8px] uppercase tracking-widest font-inter-black">{`Grading ${filteredStudents.length} Students`}</Text>
                        </View>
                        <TouchableOpacity 
                            onPress={() => setSelectedAssignment(null)}
                            className="bg-white/10 px-3 py-1.5 rounded-lg border border-white/20"
                        >
                            <Text className="text-white text-[8px] font-black uppercase tracking-widest font-inter-black">Change</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView className="flex-1 px-4 pt-4">
                        {filteredStudents.map((student, sIdx) => {
                            const sId = student.user_id || student.users?.id;
                            const isPassing = (grid[sId] ? Number(grid[sId]) : 0) >= 40;

                            return (
                                <View key={sId} className="mb-3">
                                    <AppCard className="p-4 bg-white border-white shadow-lg shadow-indigo-100/10">
                                        <View className="flex-row items-center justify-between">
                                            <View className="flex-1 mr-4">
                                                <Text 
                                                    className="text-gray-900 font-inter-black text-[14px]" 
                                                    numberOfLines={1}
                                                >
                                                    {student.displayName}
                                                </Text>
                                                <Text className="text-[9px] text-gray-400 uppercase tracking-widest font-inter-bold mt-0.5">
                                                    {`Roll No: ${student.rollNumber}`}
                                                </Text>
                                            </View>
                                            
                                            {/* Improved Input Container */}
                                            <View 
                                                className={`flex-row items-center bg-gray-50 rounded-2xl border px-3 py-1 relative ${syncedGrades[sId] ? 'border-emerald-100' : 'border-amber-200'}`}
                                                style={{ flexGrow: 0 }}
                                            >
                                                <TextInput
                                                    style={{
                                                        width: 70,
                                                        height: 40,
                                                        color: syncedGrades[sId] ? "#10b981" : "#4f46e5",
                                                        fontFamily: 'Inter_900Black',
                                                        fontSize: 18,
                                                        textAlign: "right"
                                                    }}
                                                    keyboardType="numeric"
                                                    placeholder="0"
                                                    placeholderTextColor="#cbd5e1"
                                                    value={grid[sId] || ""}
                                                    onChangeText={(val) => {
                                                        if (/^\d*$/.test(val)) {
                                                            setGrid(prev => ({ ...prev, [sId]: val }));
                                                            setSyncedGrades(prev => ({ ...prev, [sId]: false }));
                                                        }
                                                    }}
                                                />
                                                <Text className="ml-1.5 text-gray-400 font-inter-bold text-[10px]">
                                                    {`/ 100`}
                                                </Text>
                                                
                                                {!syncedGrades[sId] && grid[sId] !== "" && (
                                                    <View className="absolute -top-1 -right-1 bg-amber-400 w-4 h-4 rounded-full border-2 border-white items-center justify-center shadow-sm">
                                                        <Icons.Clock size={8} color="white" />
                                                    </View>
                                                )}
                                            </View>
                                        </View>
                                    </AppCard>
                                </View>
                            );
                        })}
                        <View className="h-32" />
                    </ScrollView>
                </View>
            )}

            {canSave && !loading && selectedAssignment && (
                <View className="absolute bottom-6 left-6 right-6">
                    <AppButton 
                        label={syncing ? "Saving..." : "Save Grades"}
                        onPress={() => { triggerHaptic(Haptics.ImpactFeedbackStyle.Heavy); handleSaveAll(); }}
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
