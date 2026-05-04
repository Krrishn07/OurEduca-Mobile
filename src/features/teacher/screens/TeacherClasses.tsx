import React, { useMemo, useState, useEffect, useRef } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View, Animated, RefreshControl, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Icons } from '../../../../components/Icons';
import { AppButton, AppCard, AppTheme, AppTypography, SectionHeader, AppRow, StatusPill, PlatinumHeader } from '../../../design-system';
import { useMockAuth } from '../../../../contexts/MockAuthContext';

interface TeacherClassesProps {
  assignedSections: any[];
  onNavigateToClass: (cls: any) => void;
  dbRoster?: any[];
  onShowUploadModal: () => void;
  onUploadToClass?: (cls: any) => void;
  onGradeClass?: (cls: any) => void;
  onShowReports?: (cls: any) => void;
  onRefresh?: () => void;
  refreshing?: boolean;
}

export const TeacherClasses: React.FC<TeacherClassesProps> = ({
  assignedSections = [],
  onNavigateToClass,
  dbRoster = [],
  onShowUploadModal,
  onUploadToClass,
  onGradeClass,
  onShowReports,
  onRefresh,
  refreshing = false
}) => {
  const { currentUser } = useMockAuth();
  const insets = useSafeAreaInsets();
  const [selectedClass, setSelectedClass] = useState<any | null>(null);
  const [studentSearch, setStudentSearch] = useState('');
  const [classSearch, setClassSearch] = useState('');
  const pulseAnim = useRef(new Animated.Value(0.6)).current;

  const triggerHaptic = (style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(style);
    }
  };

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
      <PlatinumHeader 
        title={selectedClass ? 'Class Roster' : 'My Classes'}
        subtitle={`${currentUser?.school_name || 'Academy'} Node`}
        onBack={selectedClass ? () => { triggerHaptic(); setSelectedClass(null); } : undefined}
        rightAction={
          <>
            <TouchableOpacity 
              className="p-2 bg-gray-50 rounded-full border border-gray-100"
              onPress={() => { /* Toggle Search in future */ }}
            >
              <Icons.Search size={18} color="#6b7280" />
            </TouchableOpacity>
            
            {!selectedClass && (
              <TouchableOpacity 
                onPress={() => { triggerHaptic(); onShowUploadModal(); }} 
                className="bg-indigo-600 px-4 py-2 rounded-xl shadow-lg shadow-indigo-200 active:scale-95"
              >
                <Text className="text-white text-[11px] font-inter-black uppercase">Add</Text>
              </TouchableOpacity>
            )}
          </>
        }
      />

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
                    <TouchableOpacity 
                      onPress={() => { triggerHaptic(); }}
                      className="w-10 h-10 bg-indigo-50 items-center justify-center rounded-xl border border-indigo-100 active:scale-95 shadow-sm"
                    >
                      <Icons.Messages size={16} color="#4f46e5" />
                    </TouchableOpacity>
                  }
                />
              ))}

              {(currentClassStudents || []).length === 0 && (
                <View className="py-24 items-center">
                  <View className="w-16 h-16 bg-white rounded-2xl items-center justify-center mb-6 border border-gray-50 shadow-xl shadow-indigo-100/50">
                    <Icons.Users size={20} color="#e2e8f0" />
                  </View>
                  <Text className="text-[9px] text-gray-400 uppercase tracking-[2px] font-inter-black">No matching records found</Text>
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
          contentContainerStyle={{ paddingTop: 24, paddingBottom: 100, flexGrow: 1 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={AppTheme.colors.primary}
              colors={[AppTheme.colors.primary]}
            />
          }
        >
          {filteredClasses.length > 0 ? (
            filteredClasses.map((r, idx) => (
              <TouchableOpacity 
                key={r.rosterId || r.id || idx}
                className={`bg-white border ${selectedClass?.id === r.id ? 'border-indigo-200 bg-indigo-50/30' : 'border-gray-100'} rounded-[28px] p-4 mb-3 flex-row items-center shadow-sm shadow-indigo-100/10`}
                onPress={() => { triggerHaptic(); setSelectedClass(r); onNavigateToClass(r); }}
              >
                {/* The Icon Node */}
                <View className="w-12 h-12 bg-indigo-50 rounded-2xl items-center justify-center mr-4 border border-indigo-100">
                  <Icons.Classes size={20} color="#4f46e5" />
                </View>

                <View className="flex-1">
                  <Text className="text-gray-900 font-inter-black text-[15px]">{r.subject}</Text>
                  <View className="flex-row items-center mt-1">
                    <Text className="text-gray-400 text-[10px] font-inter-bold uppercase tracking-widest">{r.name}</Text>
                    <View className="w-1 h-1 rounded-full bg-gray-200 mx-2" />
                    <Text className="text-emerald-600 text-[10px] font-inter-bold uppercase tracking-widest">Ongoing</Text>
                  </View>
                </View>

                {/* Right Metrics */}
                <View className="items-end">
                   <View className="bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
                      <Text className="text-[12px] font-inter-black text-indigo-600">{getStudentCountForClass(r.class_id, r.section)}</Text>
                      <Text className="text-[6px] font-inter-bold text-gray-400 uppercase text-center">👤</Text>
                   </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View className="flex-1 justify-center items-center px-8">
               <View className="w-24 h-24 bg-slate-100 rounded-3xl items-center justify-center mb-8 border border-slate-200/50 shadow-2xl shadow-slate-200/30">
                 <Icons.Classes size={24} color="#94a3b8" />
               </View>
               <Text className="text-slate-900 font-inter-black text-xl text-center">Institutional Roster Clear</Text>
               <Text className="text-slate-400 text-sm text-center mt-3 font-inter-medium leading-5">
                 We couldn't find any active classroom nodes matching your current query or assignment ledger.
               </Text>
               <TouchableOpacity 
                 onPress={() => setClassSearch('')}
                 className="mt-8 bg-indigo-50 px-8 py-3 rounded-2xl border border-indigo-100 active:bg-indigo-100"
               >
                 <Text className="text-indigo-600 text-[10px] uppercase tracking-[2px] font-inter-black">Reset Discovery</Text>
               </TouchableOpacity>
             </View>
          )}

          {/* Platform Build Info Integration */}
          <View className="mt-16 items-center opacity-30">
              <View className="w-8 h-0.5 bg-gray-300 rounded-full mb-4" />
              <Text className="text-[9px] text-gray-400 uppercase tracking-[4px] font-inter-black">Verified Institutional Node</Text>
              <Text className="text-[8px] text-gray-400 mt-1 uppercase tracking-widest font-inter-black italic">Stable Connection established via TLS 1.3</Text>
          </View>
        </ScrollView>
      )}
    </View>
  );
};
