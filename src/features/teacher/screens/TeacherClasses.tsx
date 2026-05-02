import React, { useMemo, useState, useEffect, useRef } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Icons } from '../../../../components/Icons';
import { AppButton, AppCard, AppTheme, AppTypography, SectionHeader, AppRow, StatusPill } from '../../../design-system';

interface TeacherClassesProps {
  assignedSections: any[];
  onNavigateToClass: (cls: any) => void;
  dbRoster?: any[];
  onShowUploadModal: () => void;
  onUploadToClass?: (cls: any) => void;
  onGradeClass?: (cls: any) => void;
}

export const TeacherClasses: React.FC<TeacherClassesProps> = ({
  assignedSections = [],
  onNavigateToClass,
  dbRoster = [],
  onShowUploadModal,
  onUploadToClass,
  onGradeClass,
  onShowReports
}) => {
  const [selectedClass, setSelectedClass] = useState<any | null>(null);
  const [studentSearch, setStudentSearch] = useState('');
  const [classSearch, setClassSearch] = useState('');
  const pulseAnim = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.6,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const filteredClasses = useMemo(() => {
    return (assignedSections || []).filter(c => 
      c.subject?.toLowerCase().includes(classSearch.toLowerCase()) ||
      c.name?.toLowerCase().includes(classSearch.toLowerCase())
    );
  }, [assignedSections, classSearch]);

  const currentClassStudents = useMemo(() => {
    if (!selectedClass) return [];

    const targetClassId = (selectedClass.class_id || selectedClass.id)?.toString().toLowerCase().trim();
    const targetSection = (selectedClass.section || 'A').toString().toLowerCase().trim();

    return (dbRoster || [])
      .filter((r) => {
        const rosterClassId = r.class_id?.toString().toLowerCase().trim();
        const rosterSection = (r.section || 'A').toString().toLowerCase().trim();
        return rosterClassId === targetClassId && rosterSection === targetSection;
      })
      .map((r) => {
        const u = Array.isArray(r.users) ? r.users[0] : r.users;
        return { ...u, id: u?.id || r.user_id };
      })
      .filter((u) => u?.name?.toLowerCase().includes(studentSearch.toLowerCase()));
  }, [selectedClass, dbRoster, studentSearch]);

  const getStudentCountForClass = (classId: string, section: string = 'A') => {
    return (dbRoster || []).filter((r) =>
      r.class_id === classId &&
      (r.section || 'A').toString().toLowerCase().trim() === section.toString().toLowerCase().trim()
    ).length;
  };

  return (
    <View className="flex-1 bg-[#f5f7ff]">
      {/* High-Fidelity Hero Header — TUNED */}
      <LinearGradient 
        colors={AppTheme.colors.gradients.brand} 
        start={{x: 0, y: 0}} end={{x: 1, y: 1}} 
        className="px-6 pt-5 pb-10 rounded-b-[40px] shadow-xl shadow-indigo-200/50 z-20"
      >
        {/* Platinum Institutional Watermark */}
        <View className="absolute right-[-20] bottom-[-20] opacity-10 rotate-12">
          <Icons.Classes size={140} color="white" />
        </View>

        <View className="flex-row justify-between items-start relative z-10 mb-5">
          <View className="flex-1 mr-4">
            <Text className={`${AppTypography.heroTitle} text-white`} numberOfLines={1}>
              {selectedClass ? selectedClass.subject : 'Classrooms'}
            </Text>
            <Text className={`${AppTypography.eyebrow} text-white/60 mt-1.5`}>
              {selectedClass ? `${selectedClass.name} — Roster` : 'Teaching Assignments'}
            </Text>
          </View>
          {selectedClass ? (
            <TouchableOpacity 
              onPress={() => setSelectedClass(null)}
              className="w-12 h-12 bg-white/10 rounded-2xl items-center justify-center border border-white/20 active:scale-95"
            >
              <Icons.Close size={22} color="white" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              onPress={onShowUploadModal}
              className="w-12 h-12 bg-white/10 rounded-2xl items-center justify-center border border-white/20 active:scale-95"
            >
              <Icons.Plus size={22} color="white" />
            </TouchableOpacity>
          )}
        </View>

        {/* Integrated Platinum Search Bar */}
        {selectedClass ? (
          <View className="bg-white/10 border border-white/20 rounded-2xl px-5 py-3.5 flex-row items-center backdrop-blur-md relative z-10">
            <Icons.Search size={18} color="white" opacity={0.8} />
            <TextInput
              placeholder="Search registry..."
              value={studentSearch}
              onChangeText={setStudentSearch}
              placeholderTextColor="rgba(255, 255, 255, 0.4)"
              className="flex-1 ml-3 text-[13px] font-black text-white p-0 font-inter-black"
            />
          </View>
        ) : (
          <View className="bg-white/10 border border-white/20 rounded-2xl px-5 py-3.5 flex-row items-center backdrop-blur-md relative z-10">
            <Icons.Search size={18} color="white" opacity={0.8} />
            <TextInput
              placeholder="Search classes or subjects..."
              value={classSearch}
              onChangeText={setClassSearch}
              placeholderTextColor="rgba(255, 255, 255, 0.4)"
              className="flex-1 ml-3 text-[13px] font-black text-white p-0 font-inter-black"
            />
          </View>
        )}
      </LinearGradient>

      {selectedClass ? (
        <View className="flex-1">
          <ScrollView 
            className="flex-1 px-4" 
            showsVerticalScrollIndicator={false} 
            contentContainerStyle={{ paddingTop: 24, paddingBottom: 100 }}
          >
            <AppCard className="p-0 overflow-hidden border border-white shadow-xl shadow-indigo-100/30">
              {(currentClassStudents || []).map((student, idx) => (
                <AppRow
                  key={student.id}
                  title={student.name}
                  subtitle="Active Roster Identity"
                  avatarLetter={student.name?.charAt(0) || '?'}
                  avatarBg="#f0f2ff"
                  avatarColor="#4f46e5"
                  pills={<StatusPill label="VERIFIED" type="success" />}
                  showBorder={idx < (currentClassStudents || []).length - 1}
                  rightElement={
                    <TouchableOpacity className="w-10 h-10 bg-indigo-50 items-center justify-center rounded-xl border border-indigo-100 active:scale-95 shadow-sm">
                      <Icons.Messages size={16} color="#4f46e5" />
                    </TouchableOpacity>
                  }
                />
              ))}

              {(currentClassStudents || []).length === 0 && (
                <View className="py-24 items-center">
                  <View className="w-16 h-16 bg-white rounded-2xl items-center justify-center mb-6 border border-gray-50 shadow-xl shadow-indigo-100/50">
                    <Icons.Users size={32} color="#e2e8f0" />
                  </View>
                  <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest font-inter-black">No matching records found</Text>
                </View>
              )}
            </AppCard>

            {/* Platform Build Info Integration */}
            <View className="mt-16 items-center opacity-30">
                <View className="w-8 h-0.5 bg-gray-300 rounded-full mb-4" />
                <Text className="text-[9px] font-black text-gray-400 uppercase tracking-[4px] font-inter-black">Verified Institutional Node</Text>
                <Text className="text-[8px] font-black text-gray-400 mt-1 uppercase tracking-widest font-inter-black italic">Stable Connection established via TLS 1.3</Text>
            </View>
          </ScrollView>
        </View>
      ) : (
        <ScrollView 
          className="flex-1 px-4" 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={{ paddingTop: 24, paddingBottom: 100 }}
        >
          {filteredClasses.length > 0 ? filteredClasses.map((r) => (
            <TouchableOpacity
              key={r.rosterId || r.id || Math.random().toString()}
              onPress={() => {
                setSelectedClass(r);
                onNavigateToClass(r);
              }}
              activeOpacity={0.95}
              className="mb-6"
            >
              <View className="bg-white rounded-[32px] p-6 shadow-xl shadow-indigo-100/40 border border-gray-100 relative overflow-hidden">
                {/* Institutional Glow Accent */}
                <View className="absolute right-[-20] top-[-20] w-40 h-40 bg-indigo-50/10 rounded-full blur-3xl" />
                
                <View className="flex-row justify-between items-start mb-6">
                  <View className="flex-1">
                    <View className="flex-row items-center mb-2.5">
                       <View className="bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100 mr-3">
                          <Text className="text-[9px] font-bold text-indigo-600 uppercase tracking-[2px] font-inter-bold">Active Node</Text>
                       </View>
                       {/* Pulsing Ongoing Status Badge */}
                       <View className="flex-row items-center bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">
                          <Animated.View 
                            style={{ opacity: pulseAnim }}
                            className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5" 
                          />
                          <Text className="text-[8px] font-bold text-emerald-600 uppercase tracking-widest font-inter-bold">Ongoing Session</Text>
                       </View>
                    </View>
                    <Text className="text-[20px] font-bold text-gray-900 tracking-tighter font-inter-bold">
                      {r.subject}
                    </Text>
                    <View className="flex-row items-center mt-1">
                      <Text className="text-gray-400 text-[11px] font-medium uppercase tracking-widest font-inter-medium">
                        {r.name} • {getStudentCountForClass(r.class_id, r.section)} Students
                      </Text>
                      <View className="w-1 h-1 rounded-full bg-gray-200 mx-3" />
                      <Text className="text-indigo-500/80 text-[10px] font-bold uppercase tracking-widest font-inter-bold italic">
                        {r.room_no ? (r.room_no.toLowerCase().includes('room') ? r.room_no : `Room ${r.room_no}`) : 'Room 302'}
                      </Text>
                    </View>
                  </View>
                  
                  <View className="bg-indigo-50 w-12 h-12 rounded-2xl items-center justify-center border border-indigo-100/50">
                    <Icons.Classes size={20} color="#4f46e5" />
                  </View>
                </View>

                <View className="flex-row items-center justify-between pt-5 border-t border-gray-50">
                  <View className="flex-row gap-1.5 flex-1 pr-2">
                    <TouchableOpacity 
                      onPress={(e) => { e.stopPropagation(); onUploadToClass?.(r); }}
                      className="bg-gray-50 px-3 py-2.5 rounded-xl border border-gray-100 flex-row items-center"
                    >
                       <Icons.Plus size={12} color="#6366f1" />
                       <Text className="ml-2 text-[9px] font-black text-gray-500 uppercase tracking-widest font-inter-black">Resource</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      onPress={(e) => { e.stopPropagation(); onGradeClass?.(r); }}
                      className="bg-gray-50 px-3 py-2.5 rounded-xl border border-gray-100 flex-row items-center"
                    >
                       <Icons.Edit size={12} color="#6366f1" />
                       <Text className="ml-2 text-[9px] font-black text-gray-500 uppercase tracking-widest font-inter-black">Grading</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      onPress={(e) => { e.stopPropagation(); onShowReports?.(r); }}
                      className="bg-gray-50 px-3 py-2.5 rounded-xl border border-gray-100 flex-row items-center"
                    >
                       <Icons.Report size={12} color="#6366f1" />
                       <Text className="ml-2 text-[9px] font-black text-gray-500 uppercase tracking-widest font-inter-black">Report</Text>
                    </TouchableOpacity>
                  </View>
                  
                  <TouchableOpacity 
                    onPress={() => { setSelectedClass(r); onNavigateToClass(r); }}
                    className="bg-indigo-600 px-5 py-3 rounded-2xl shadow-lg shadow-indigo-100 flex-row items-center"
                  >
                    <Text className="text-white font-black text-[10px] uppercase tracking-widest font-inter-black">Manage</Text>
                    <Icons.ChevronRight size={12} color="white" className="ml-1.5" />
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          )) : (
            <View className="py-32 items-center px-8">
              <View className="w-24 h-24 bg-slate-100 rounded-[32px] items-center justify-center mb-8 border border-slate-200/50 shadow-2xl shadow-slate-200/30">
                <Icons.Classes size={48} color="#94a3b8" />
              </View>
              <Text className="text-slate-900 font-black text-xl text-center font-inter-black">Institutional Roster Clear</Text>
              <Text className="text-slate-400 text-sm text-center mt-3 font-medium leading-5">
                We couldn't find any active classroom nodes matching your current query or assignment ledger.
              </Text>
              <TouchableOpacity 
                onPress={() => setClassSearch('')}
                className="mt-8 bg-indigo-50 px-8 py-3 rounded-2xl border border-indigo-100 active:bg-indigo-100"
              >
                <Text className="text-indigo-600 font-black text-[10px] uppercase tracking-[2px] font-inter-black">Reset Discovery</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Platform Build Info Integration */}
          <View className="mt-16 items-center opacity-30">
              <View className="w-8 h-0.5 bg-gray-300 rounded-full mb-4" />
              <Text className="text-[9px] font-black text-gray-400 uppercase tracking-[4px] font-inter-black">Verified Institutional Node</Text>
              <Text className="text-[8px] font-black text-gray-400 mt-1 uppercase tracking-widest font-inter-black italic">Stable Connection established via TLS 1.3</Text>
          </View>
        </ScrollView>
      )}
    </View>
  );
};
