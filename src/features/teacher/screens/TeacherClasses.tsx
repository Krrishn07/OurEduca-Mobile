import React, { useMemo, useState, useEffect, useRef } from 'react';
import { FlatList, Text, TextInput, TouchableOpacity, View, Animated, RefreshControl, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icons } from '../../../../components/Icons';
import { AppCard, AppTheme, AppRow, StatusPill, PlatinumHeader } from '../../../design-system';
import { useMockAuth } from '../../../../contexts/MockAuthContext';

interface TeacherClassesProps {
  assignedSections: any[];
  onNavigateToClass: (cls: any) => void;
  dbRoster?: any[];
  onShowUploadModal: () => void;
  onRefresh?: () => void;
  refreshing?: boolean;
}

export const TeacherClasses: React.FC<TeacherClassesProps> = ({
  assignedSections = [],
  onNavigateToClass,
  dbRoster = [],
  onShowUploadModal,
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
    if (Platform.OS !== 'web') Haptics.impactAsync(style);
  };

  // PLATINUM FIX: Cleaned up animation memory leak
  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.6, duration: 1000, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  const filteredClasses = useMemo(() => {
    return (assignedSections || []).filter(c =>
      c.subject?.toLowerCase().includes(classSearch.toLowerCase()) ||
      c.name?.toLowerCase().includes(classSearch.toLowerCase())
    );
  }, [assignedSections, classSearch]);

  // PLATINUM FIX: Pre-calculate counts O(N) once, instead of inside the render map O(N*M)
  const classStudentCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    (dbRoster || []).forEach(r => {
      const key = `${r.class_id}::${r.section || 'A'}`;
      counts[key] = (counts[key] || 0) + 1;
    });
    return counts;
  }, [dbRoster]);

  const currentClassStudents = useMemo(() => {
    if (!selectedClass) return [];
    const targetClassId = (selectedClass.class_id || selectedClass.id)?.toString().toLowerCase().trim();
    const targetSection = (selectedClass.section || 'A').toString().toLowerCase().trim();

    return (dbRoster || [])
      .filter((r) => r.class_id?.toString().toLowerCase().trim() === targetClassId && (r.section || 'A').toString().toLowerCase().trim() === targetSection)
      .map((r) => {
        const u = Array.isArray(r.users) ? r.users[0] : r.users;
        return { ...u, id: u?.id || r.user_id };
      })
      .filter((u) => u?.name?.toLowerCase().includes(studentSearch.toLowerCase()));
  }, [selectedClass, dbRoster, studentSearch]);

  return (
    <View className="flex-1 bg-[#f5f7ff]">
      <PlatinumHeader
        title={selectedClass ? 'Class Roster' : 'My Classes'}
        subtitle={`${currentUser?.school_name || 'Academy'} Node`}
        onBack={selectedClass ? () => { triggerHaptic(); setSelectedClass(null); } : undefined}
        rightAction={
          <>
            <TouchableOpacity activeOpacity={0.7} className="p-2 bg-gray-50 rounded-full border border-gray-100">
              <Icons.Search size={18} color="#6b7280" />
            </TouchableOpacity>
            {!selectedClass && (
              <TouchableOpacity activeOpacity={0.7} onPress={() => { triggerHaptic(); onShowUploadModal(); }} className="bg-indigo-600 px-4 py-2 rounded-xl shadow-lg shadow-indigo-200">
                <Text className="text-white text-[11px] font-inter-black uppercase">Add</Text>
              </TouchableOpacity>
            )}
          </>
        }
      />

      {selectedClass ? (
        // PLATINUM FIX: FlatList for memory recycling
        <FlatList
          data={currentClassStudents}
          keyExtractor={(item) => item.id?.toString()}
          contentContainerStyle={{ paddingTop: 24, paddingBottom: 100, paddingHorizontal: 16 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="py-24 items-center">
              <View className="w-16 h-16 bg-white rounded-2xl items-center justify-center mb-6 border border-gray-50 shadow-xl shadow-indigo-100/50">
                <Icons.Users size={20} color="#e2e8f0" />
              </View>
              <Text className="text-[9px] text-gray-400 uppercase tracking-[2px] font-inter-black">No matching records found</Text>
            </View>
          }
          renderItem={({ item: student, index }) => (
            <View className={`bg-white px-4 py-1 ${index === 0 ? 'rounded-t-[28px] pt-4' : ''} ${index === currentClassStudents.length - 1 ? 'rounded-b-[28px] pb-4 mb-4 shadow-xl shadow-indigo-100/30' : ''} border border-white`}>
              <AppRow
                title={student.name}
                titleProps={{ numberOfLines: 1 }} // PLATINUM FIX: Layout protection
                subtitle="Active Roster Identity"
                avatarLetter={student.name?.charAt(0) || '?'}
                avatarBg="#f0f2ff"
                avatarColor="#4f46e5"
                pills={<StatusPill label="VERIFIED" type="success" />}
                showBorder={index < currentClassStudents.length - 1}
                rightElement={
                  <TouchableOpacity activeOpacity={0.7} className="w-10 h-10 bg-indigo-50 items-center justify-center rounded-xl border border-indigo-100 shadow-sm">
                    <Icons.Messages size={16} color="#4f46e5" />
                  </TouchableOpacity>
                }
              />
            </View>
          )}
        />
      ) : (
        <FlatList
          data={filteredClasses}
          keyExtractor={(item, idx) => item.id?.toString() || idx.toString()}
          contentContainerStyle={{ paddingTop: 24, paddingBottom: 100, paddingHorizontal: 16, flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View className="flex-1 justify-center items-center px-8 mt-20">
              <View className="w-24 h-24 bg-slate-100 rounded-3xl items-center justify-center mb-8 border border-slate-200/50">
                <Icons.Classes size={24} color="#94a3b8" />
              </View>
              <Text className="text-slate-900 font-inter-black text-xl text-center">Institutional Roster Clear</Text>
            </View>
          }
          renderItem={({ item: r }) => {
            const countKey = `${r.class_id}::${r.section || 'A'}`;
            return (
              <TouchableOpacity
                activeOpacity={0.7}
                className="bg-white border border-gray-100 rounded-[28px] p-4 mb-3 flex-row items-center shadow-sm shadow-indigo-100/10"
                onPress={() => { triggerHaptic(); setSelectedClass(r); onNavigateToClass(r); }}
              >
                <View className="w-12 h-12 bg-indigo-50 rounded-2xl items-center justify-center mr-4 border border-indigo-100">
                  <Icons.Classes size={20} color="#4f46e5" />
                </View>
                <View className="flex-1 mr-2">
                  <Text className="text-gray-900 font-inter-black text-[15px]" numberOfLines={1}>{r.subject}</Text>
                  <View className="flex-row items-center mt-1">
                    <Text className="text-gray-400 text-[10px] font-inter-bold uppercase tracking-widest">{r.name}</Text>
                    <View className="w-1 h-1 rounded-full bg-gray-200 mx-2" />
                    <Text className="text-emerald-600 text-[10px] font-inter-bold uppercase tracking-widest">Ongoing</Text>
                  </View>
                </View>
                <View className="flex-row items-center">
                  <View className="items-end mr-3">
                    <View className="bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100 items-center">
                      <Text className="text-[12px] font-inter-black text-indigo-600">{classStudentCounts[countKey] || 0}</Text>
                    </View>
                    <Text className="text-[7px] font-inter-black text-gray-400 uppercase tracking-widest mt-1">Manage</Text>
                  </View>
                  <Icons.ChevronRight size={14} color="#d1d5db" />
                </View>
              </TouchableOpacity>
            )
          }}
        />
      )}
    </View>
  );
};