import React, { useMemo, useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Icons } from '../../../../components/Icons';
import { AppButton, AppCard, AppTheme, AppTypography, SectionHeader, AppRow, StatusPill } from '../../../design-system';

interface TeacherClassesProps {
  assignedSections: any[];
  onNavigateToClass: (cls: any) => void;
  dbRoster?: any[];
  onShowUploadModal: () => void;
}

export const TeacherClasses: React.FC<TeacherClassesProps> = ({
  assignedSections = [],
  dbRoster = [],
  onShowUploadModal,
}) => {
  const [selectedClass, setSelectedClass] = useState<any | null>(null);
  const [studentSearch, setStudentSearch] = useState('');

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
        {selectedClass && (
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
          {(assignedSections || []).length > 0 ? (assignedSections || []).map((r) => (
            <AppCard
              key={r.rosterId || r.id || Math.random().toString()}
              onPress={() => setSelectedClass(r)}
              className="p-5 mb-5 overflow-hidden border border-white shadow-xl shadow-indigo-100/30"
            >
              <View className="flex-row items-start justify-between mb-6">
                <View className="flex-row items-center flex-1 pr-6">
                  <View className="w-12 h-12 bg-indigo-50 rounded-2xl items-center justify-center mr-4 border border-indigo-100/50 shadow-sm">
                    <Icons.Classes size={22} color="#4f46e5" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-[17px] font-black text-gray-900 tracking-tight font-inter-black" numberOfLines={1}>{r.subject}</Text>
                    <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1.5 font-inter-black" numberOfLines={1}>{r.name} · Section {r.section || 'A'}</Text>
                  </View>
                </View>
                <View className="bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-100">
                  <Text className="text-[10px] font-black text-indigo-500 uppercase tracking-widest font-inter-black">{r.room_no || 'TBA'}</Text>
                </View>
              </View>

              <View className="flex-row items-center bg-gray-50/50 p-4 rounded-2xl border border-gray-100/50">
                <View className="flex-1 flex-row items-center">
                  <View className="w-1.5 h-1.5 rounded-full bg-indigo-500 mr-2 shadow-sm shadow-indigo-200" />
                  <Text className="text-[11px] font-black text-gray-700 tracking-tight font-inter-black uppercase">
                    {getStudentCountForClass(r.class_id, r.section)} Active Students
                  </Text>
                </View>
                <View className="bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm">
                  <Text className="text-[9px] font-black text-indigo-600 uppercase tracking-widest font-inter-black">Open Roster</Text>
                </View>
              </View>
            </AppCard>
          )) : (
            <View className="py-24 items-center">
              <View className="w-16 h-16 bg-white rounded-2xl items-center justify-center mb-6 border border-gray-50 shadow-xl shadow-indigo-100/50">
                <Icons.Classes size={32} color="#e2e8f0" />
              </View>
              <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest font-inter-black">No sections assigned</Text>
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
