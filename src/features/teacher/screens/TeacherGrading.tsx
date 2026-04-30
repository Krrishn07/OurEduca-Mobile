import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { Icons } from '../../../../components/Icons';
import { AppCard, SectionHeader, AppRow, StatusPill, AppButton } from '../../../design-system';
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
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'GRADED'>('ALL');
  const [pendingChanges, setPendingChanges] = useState<{[key: string]: string}>({});

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
        }
    } catch (err) {
        console.error('fetchRoster error:', err);
    } finally {
        setLoading(false);
    }
  };

  const handleSync = async () => {
    if (Object.keys(pendingChanges).length === 0) return;
    setSyncing(true);
    try {
        const updates = Object.entries(pendingChanges).map(([id, score]) => 
            supabase.from('class_roster').update({ grade_score: score }).eq('id', id)
        );
        
        await Promise.all(updates);
        setPendingChanges({});
        await fetchRoster();
        // Success Toast logic would go here
    } catch (err) {
        console.error('Sync error:', err);
    } finally {
        setSyncing(false);
    }
  };

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.users.name.toLowerCase().includes(searchQuery.toLowerCase());
    const score = pendingChanges[s.id] !== undefined ? pendingChanges[s.id] : s.grade_score;
    const isGraded = !!score;
    
    if (filter === 'PENDING') return matchesSearch && !isGraded;
    if (filter === 'GRADED') return matchesSearch && isGraded;
    return matchesSearch;
  });

  const getPendingCount = students.filter(s => !s.grade_score && pendingChanges[s.id] === undefined).length;

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
                    <Text className="text-[20px] font-black text-gray-900 tracking-tight font-inter-black">Performance Hub</Text>
                    <Text className="text-[9px] font-black text-indigo-400 uppercase tracking-[2px] font-inter-black">Academic Evaluation Node</Text>
                </View>
            </View>
            {selectedClass && (
                <TouchableOpacity 
                    onPress={() => { setSelectedClass(null); setStudents([]); }}
                    className="bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-100"
                >
                    <Text className="text-[10px] font-black text-gray-500 uppercase tracking-widest font-inter-black">Change Class</Text>
                </TouchableOpacity>
            )}
        </View>

        {selectedClass && (
            <View className="bg-gray-50 rounded-[24px] border border-gray-100 px-5 py-3.5 flex-row items-center">
                <Icons.Search size={18} color="#94a3b8" />
                <TextInput 
                    placeholder="Search students by name..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    className="flex-1 ml-4 text-[13px] font-black text-gray-900 font-inter-black p-0"
                    placeholderTextColor="#94a3b8"
                />
            </View>
        )}
      </View>

      {!selectedClass ? (
        <ScrollView className="flex-1 px-4 pt-6" showsVerticalScrollIndicator={false}>
            <Text className="text-[10px] font-black text-gray-400 uppercase tracking-[3px] mb-6 px-2 font-inter-black">Select Evaluation Target</Text>
            {assignedSections.map((item, idx) => (
                <TouchableOpacity 
                    key={idx} 
                    onPress={() => setSelectedClass(item)}
                    activeOpacity={0.9}
                    className="mb-4"
                >
                    <AppCard className="p-6 border border-white shadow-xl shadow-indigo-100/30 flex-row items-center">
                        <View className="w-14 h-14 bg-indigo-50 rounded-2xl items-center justify-center mr-5 border border-indigo-100/50">
                            <Icons.Classes size={26} color="#4f46e5" />
                        </View>
                        <View className="flex-1">
                            <Text className="font-black text-gray-900 text-lg tracking-tight font-inter-black">{item.subject}</Text>
                            <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest font-inter-black">{item.name} • SEC {item.section || 'A'}</Text>
                        </View>
                        <Icons.ChevronRight size={20} color="#cbd5e1" />
                    </AppCard>
                </TouchableOpacity>
            ))}
        </ScrollView>
      ) : (
        <View className="flex-1">
            {/* Filter Tabs */}
            <View className="flex-row px-4 py-4 gap-2">
                {[
                    { id: 'ALL', label: 'All Students' },
                    { id: 'PENDING', label: `Pending (${getPendingCount})` },
                    { id: 'GRADED', label: 'Evaluated' }
                ].map(t => (
                    <TouchableOpacity 
                        key={t.id}
                        onPress={() => setFilter(t.id as any)}
                        className={`px-5 py-3 rounded-full border ${filter === t.id ? 'bg-indigo-600 border-indigo-600 shadow-lg shadow-indigo-200' : 'bg-white border-gray-100'}`}
                    >
                        <Text className={`text-[9px] font-black uppercase tracking-widest font-inter-black ${filter === t.id ? 'text-white' : 'text-gray-400'}`}>{t.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {loading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator color="#4f46e5" />
                </View>
            ) : (
                <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
                    <AppCard className="p-0 overflow-hidden border border-white shadow-xl shadow-indigo-100/30 mb-20">
                        {filteredStudents.map((student, idx) => {
                            const currentScore = pendingChanges[student.id] !== undefined ? pendingChanges[student.id] : student.grade_score;
                            const isPending = !currentScore;
                            return (
                                <View 
                                    key={student.id} 
                                    className={`p-5 flex-row items-center justify-between ${idx < filteredStudents.length - 1 ? 'border-b border-gray-50' : ''}`}
                                >
                                    <View className="flex-row items-center flex-1">
                                        <View className="w-12 h-12 bg-gray-50 rounded-2xl items-center justify-center mr-4 border border-gray-100 shadow-inner">
                                            {student.users.avatar ? (
                                                <Icons.Profile size={24} color="#94a3b8" /> // Placeholder for real image
                                            ) : (
                                                <Icons.Profile size={24} color="#94a3b8" />
                                            )}
                                        </View>
                                        <View>
                                            <Text className="text-[15px] font-black text-gray-900 font-inter-black">{student.users.name}</Text>
                                            <View className="flex-row items-center mt-1">
                                                <View className={`w-1.5 h-1.5 rounded-full mr-2 ${isPending ? 'bg-rose-400' : 'bg-emerald-400'}`} />
                                                <Text className="text-[9px] font-black text-gray-400 uppercase tracking-widest font-inter-black">
                                                    {isPending ? 'Evaluation Required' : 'Evaluation Recorded'}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                    
                                    <View className="flex-row items-center">
                                        <TextInput 
                                            className={`w-20 h-12 rounded-2xl border px-3 text-center text-[15px] font-black font-inter-black ${
                                                pendingChanges[student.id] !== undefined ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-gray-50 border-gray-100 text-gray-900'
                                            }`}
                                            placeholder="--"
                                            value={currentScore || ''}
                                            onChangeText={(txt) => setPendingChanges({...pendingChanges, [student.id]: txt})}
                                            maxLength={3}
                                        />
                                    </View>
                                </View>
                            );
                        })}
                        {filteredStudents.length === 0 && (
                             <View className="py-20 items-center">
                                <Icons.Users size={40} color="#e2e8f0" />
                                <Text className="text-gray-400 font-black text-[11px] uppercase tracking-widest mt-4 font-inter-black">No Students Found</Text>
                             </View>
                        )}
                    </AppCard>
                </ScrollView>
            )}

            {Object.keys(pendingChanges).length > 0 && (
                <View className="absolute bottom-8 left-6 right-6">
                    <TouchableOpacity 
                        onPress={handleSync}
                        disabled={syncing}
                        className="bg-indigo-600 py-5 rounded-[24px] shadow-2xl shadow-indigo-500/50 flex-row items-center justify-center border border-indigo-500"
                    >
                        {syncing ? (
                            <ActivityIndicator color="white" size="small" />
                        ) : (
                            <>
                                <Icons.CheckCircle size={20} color="white" />
                                <Text className="text-white font-black uppercase tracking-[3px] text-[12px] font-inter-black ml-3">Sync {Object.keys(pendingChanges).length} Evaluation(s)</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            )}
        </View>
      )}
    </View>
  );
};
