import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { styled } from 'nativewind';
import { Icons } from '../../../../components/Icons';
import { AppTheme, AppCard, AppTypography, SectionHeader, AppRow, StatusPill } from '../../../design-system';

const StyledLinearGradient = LinearGradient ? styled(LinearGradient) : View;

interface MentorClassesProps {
  assignedClassName: string;
  assignedSection?: string;
  mentorRoster: any[];
  sectionFaculty?: any[];
  attendanceMap: Record<string, 'PRESENT' | 'ABSENT' | 'UNMARKED'>;
  isSavingAttendance: boolean;
  onSaveAttendance: (attendance: Record<string, 'PRESENT' | 'ABSENT' | 'UNMARKED'>) => void;
  onSyncToggle: (attendance: Record<string, 'PRESENT' | 'ABSENT' | 'UNMARKED'>) => void;
  onShowAddStudentModal: () => void;
}

export const MentorClasses: React.FC<MentorClassesProps> = ({
  assignedClassName,
  assignedSection = 'A',
  mentorRoster = [],
  sectionFaculty = [],
  attendanceMap,
  isSavingAttendance,
  onSaveAttendance,
  onSyncToggle,
  onShowAddStudentModal,
}) => {
  const [attendanceMode, setAttendanceMode] = React.useState(false);
  const [tempAttendance, setTempAttendance] = React.useState<Record<string, 'PRESENT' | 'ABSENT' | 'UNMARKED'>>(attendanceMap);
  const [studentSearch, setStudentSearch] = React.useState('');

  React.useEffect(() => {
    setTempAttendance(attendanceMap);
  }, [attendanceMap]);

  const toggleStatus = (studentId: string) => {
    setTempAttendance(prev => {
        const current = prev[studentId] || 'UNMARKED';
        let nextStatus: 'PRESENT' | 'ABSENT' | 'UNMARKED';
        
        if (current === 'UNMARKED') nextStatus = 'PRESENT';
        else if (current === 'PRESENT') nextStatus = 'ABSENT';
        else nextStatus = 'PRESENT'; 

        const newState = { ...prev, [studentId]: nextStatus };
        onSyncToggle(newState); 
        return newState;
    });
  };

  const handleSave = () => {
    onSaveAttendance(tempAttendance);
    setAttendanceMode(false);
  };

  const filteredRoster = mentorRoster
    .filter(s => s.name?.toLowerCase().includes(studentSearch.toLowerCase()))
    .map(s => ({
      ...s,
      currentStatus: tempAttendance[s.id] || 'UNMARKED'
    }));

  return (
    <View className="flex-1 bg-[#f5f7ff]">
      {/* Platinum Hero Header */}
      <StyledLinearGradient 
        colors={AppTheme.colors.gradients.brand} 
        start={{x: 0, y: 0}} end={{x: 1, y: 1}} 
        className="px-6 pt-5 pb-10 rounded-b-[40px] shadow-xl shadow-indigo-200/50 z-20"
      >
        <View className="absolute right-[-20] bottom-[-20] opacity-10 rotate-12">
          <Icons.Classes size={140} color="white" />
        </View>

        <View className="flex-row justify-between items-start relative z-10 mb-5">
          <View className="flex-1 mr-4">
            <Text className={`${AppTypography.heroTitle} text-white`} numberOfLines={1}>
              {assignedClassName}
            </Text>
            <Text className={`${AppTypography.eyebrow} text-white/60 mt-1.5`}>
              Section {assignedSection} — Class Mentor
            </Text>
          </View>
          <TouchableOpacity 
            onPress={onShowAddStudentModal}
            className="w-12 h-12 bg-white/10 rounded-2xl items-center justify-center border border-white/20 active:scale-95"
          >
            <Icons.Plus size={22} color="white" />
          </TouchableOpacity>
        </View>

        <View className="bg-white/10 border border-white/20 rounded-2xl px-5 py-3.5 flex-row items-center backdrop-blur-md relative z-10">
          <Icons.Search size={18} color="white" opacity={0.8} />
          <TextInput
            placeholder="Search roster registry..."
            value={studentSearch}
            onChangeText={setStudentSearch}
            placeholderTextColor="rgba(255, 255, 255, 0.4)"
            className="flex-1 ml-3 text-[13px] font-black text-white p-0 font-inter-black"
          />
        </View>
      </StyledLinearGradient>

      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 24, paddingBottom: 100 }}
      >
        {/* Subject Teachers - Horizontal Platinum Cards */}
        <View className="mb-8">
          <SectionHeader title="Subject Teachers" className="px-2" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 4 }}>
            {sectionFaculty.length > 0 ? sectionFaculty.map((f, idx) => (
              <AppCard 
                key={`faculty_${f.id || idx}`}
                className="mr-4 w-[240px] p-5 border border-white shadow-xl shadow-indigo-100/20"
              >
                <View className="flex-row items-center mb-5">
                  <View className="w-12 h-12 rounded-2xl bg-indigo-50 items-center justify-center border border-indigo-100/50">
                    <Icons.Profile size={20} color="#4f46e5" />
                  </View>
                  <View className="ml-4 flex-1">
                    <Text className="text-sm font-black text-gray-900 tracking-tight font-inter-black" numberOfLines={1}>{f.name}</Text>
                    <StatusPill label={f.role_in_class === 'mentor' ? 'MENTOR' : 'FACULTY'} type={f.role_in_class === 'mentor' ? 'success' : 'neutral'} />
                  </View>
                </View>
                
                <View className="bg-gray-50/80 p-4 rounded-2xl border border-gray-100">
                  <Text className="text-[9px] font-black text-gray-400 uppercase tracking-[2px] mb-1 font-inter-black">SUBJECT</Text>
                  <Text className="text-sm font-black text-gray-800 tracking-tight font-inter-black" numberOfLines={1}>{f.subject || 'Institutional Assignment'}</Text>
                </View>
              </AppCard>
            )) : (
              <AppCard className="w-full py-12 items-center border border-white shadow-xl shadow-indigo-100/20">
                <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest font-inter-black italic">Awaiting Assignments</Text>
              </AppCard>
            )}
          </ScrollView>
        </View>

        {/* Attendance Controls */}
        <View className="mb-8 px-2">
            {!attendanceMode ? (
              <TouchableOpacity 
                onPress={() => setAttendanceMode(true)}
                className="bg-indigo-600 p-5 rounded-[24px] flex-row items-center justify-between shadow-xl shadow-indigo-200/50"
              >
                <View className="flex-row items-center">
                  <View className="w-10 h-10 bg-white/20 rounded-xl items-center justify-center mr-4 border border-white/30">
                    <Icons.Calendar size={20} color="white" />
                  </View>
                  <View>
                    <Text className="text-white font-black text-[15px] font-inter-black">Log Attendance</Text>
                    <Text className="text-indigo-100/60 text-[9px] font-black uppercase tracking-widest mt-0.5 font-inter-black">Institutional Roster Mark</Text>
                  </View>
                </View>
                <Icons.ChevronRight size={18} color="white" />
              </TouchableOpacity>
            ) : (
              <View className="bg-amber-600 p-6 rounded-[28px] flex-row items-center justify-between shadow-2xl shadow-amber-200/40">
                <View className="flex-1 mr-4">
                  <Text className="text-[14px] font-black text-white font-inter-black">Attendance Mode Active</Text>
                  <Text className="text-[9px] font-black uppercase tracking-[2px] text-amber-100 mt-1 font-inter-black">TAP STATUS PILLS TO TOGGLE</Text>
                </View>
                <View className="flex-row gap-2">
                  <TouchableOpacity onPress={() => setAttendanceMode(false)} className="bg-white/10 w-10 h-10 rounded-xl items-center justify-center border border-white/20">
                    <Icons.Close size={18} color="white" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={handleSave}
                    disabled={isSavingAttendance}
                    className="bg-white px-5 py-3 rounded-xl shadow-lg active:scale-95"
                  >
                    <Text className="text-amber-700 text-[10px] font-black uppercase tracking-[2px] font-inter-black">
                      {isSavingAttendance ? 'SAVING...' : 'SAVE'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
        </View>

        {/* Student Roster - Platinum AppRow Pattern */}
        <View className="mb-6">
          <SectionHeader title="Student Roster" className="px-2" />
          <AppCard className="p-0 overflow-hidden border border-white shadow-xl shadow-indigo-100/30">
            {filteredRoster.length > 0 ? filteredRoster.map((item, idx) => (
              <AppRow
                key={item.id}
                title={item.name}
                subtitle={`Roll No: ${item.roll} • ID: ${item.id.substring(0, 8)}`}
                avatarLetter={item.name?.charAt(0) || '?'}
                avatarBg="#f0f2ff"
                avatarColor="#4f46e5"
                showBorder={idx < filteredRoster.length - 1}
                rightElement={
                  <TouchableOpacity 
                    disabled={!attendanceMode}
                    onPress={() => toggleStatus(item.id)}
                    className="items-end min-w-[100px]"
                  >
                    <StatusPill 
                      label={item.currentStatus || 'UNMARKED'} 
                      type={
                        item.currentStatus === 'PRESENT' ? 'success' : 
                        item.currentStatus === 'ABSENT' ? 'danger' : 'neutral'
                      }
                    />
                    {attendanceMode && (
                      <Text className="text-[8px] font-black text-indigo-500 uppercase tracking-widest mt-1.5 font-inter-black">TAP TO TOGGLE</Text>
                    )}
                  </TouchableOpacity>
                }
              />
            )) : (
              <View className="py-24 items-center">
                <View className="w-16 h-16 bg-white rounded-2xl items-center justify-center mb-6 border border-gray-50 shadow-xl shadow-indigo-100/50">
                  <Icons.Student size={32} color="#e2e8f0" />
                </View>
                <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest font-inter-black">No records found</Text>
              </View>
            )}
          </AppCard>
        </View>

        {/* Platform Build Info Integration */}
        <View className="mt-16 items-center opacity-30">
            <View className="w-8 h-0.5 bg-gray-300 rounded-full mb-4" />
            <Text className="text-[9px] font-black text-gray-400 uppercase tracking-[4px] font-inter-black">Institutional Roster Node v2.0</Text>
            <Text className="text-[8px] font-black text-gray-400 mt-1 uppercase tracking-widest font-inter-black italic text-center">Stable Connection established via TLS 1.3</Text>
        </View>
      </ScrollView>
    </View>
  );
};
