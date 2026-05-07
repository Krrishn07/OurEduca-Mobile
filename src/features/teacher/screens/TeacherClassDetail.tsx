import * as React from 'react';
import { useState, useMemo, useRef, useEffect } from 'react';
import { View, Text, FlatList, Platform, Pressable, Animated, Dimensions, TextInput, RefreshControl } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icons } from '../../../../components/Icons';
import { SectionHeader, AppRow, StatusPill, PlatinumHeader } from '../../../design-system';

function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

const saveToCache = async (classId: string, key: string, data: any) => {
  try {
    await AsyncStorage.setItem(`cache_${classId}_${key}`, JSON.stringify(data));
  } catch (e) {
    console.error('Cache Save Error:', e);
  }
};

const loadFromCache = async (classId: string, key: string) => {
  try {
    const val = await AsyncStorage.getItem(`cache_${classId}_${key}`);
    return val ? JSON.parse(val) : [];
  } catch (e) {
    return [];
  }
};

const HighlightText = ({ text, query, baseClass = "text-gray-800" }: { text: string; query: string; baseClass?: string }) => {
  if (!query.trim()) return <Text className={baseClass}>{text}</Text>;
  const parts = text.split(new RegExp(`(${query})`, 'gi'));
  return (
    <Text className={baseClass}>
      {parts.map((part: string, i: number) => (
        <Text
          key={`highlight-${i}`}
          className={part.toLowerCase() === query.toLowerCase() ? "text-indigo-600 font-inter-black" : baseClass}
        >
          {part}
        </Text>
      ))}
    </Text>
  );
};

interface TeacherClassDetailProps {
  selectedClass: any;
  students: any[];
  materials: any[];
  onBack: () => void;
  onUploadMaterial: () => void;
  onAddStudent: () => void;
  schoolName?: string;
  assignments?: any[];
  onGradeAssignment?: (assignment: any) => void;
  onAddAssignment?: (classId?: string) => void;
  onRefresh?: () => void;
  refreshing?: boolean;
}

export const TeacherClassDetail = React.memo<TeacherClassDetailProps>(({
  selectedClass, 
  students = [], 
  materials = [], 
  onBack, 
  onUploadMaterial, 
  onAddStudent, 
  schoolName = 'Academy', 
  assignments = [], 
  onGradeAssignment, 
  onAddAssignment, 
  onRefresh, 
  refreshing = false
}) => {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<'ROSTER' | 'MATERIALS' | 'ASSIGNMENTS'>('ROSTER');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = useDebounce(searchQuery);
  const [localStudents, setLocalStudents] = useState<any[]>([]);
  const [localMaterials, setLocalMaterials] = useState<any[]>([]);
  const [localAssignments, setLocalAssignments] = useState<any[]>([]);

  // Offline Cache Synchronization
  useEffect(() => {
    const initCache = async () => {
      const classId = selectedClass?.id || selectedClass?.class_id;
      if (!classId) return;

      const [cStudents, cMaterials, cAssignments] = await Promise.all([
        loadFromCache(classId, 'students'),
        loadFromCache(classId, 'materials'),
        loadFromCache(classId, 'assignments')
      ]);

      if (cStudents.length > 0) setLocalStudents(cStudents);
      if (cMaterials.length > 0) setLocalMaterials(cMaterials);
      if (cAssignments.length > 0) setLocalAssignments(cAssignments);
    };
    initCache();
  }, [selectedClass?.id, selectedClass?.class_id]);

  useEffect(() => {
    const classId = selectedClass?.id || selectedClass?.class_id;
    if (students.length > 0 && classId) {
      setLocalStudents(students);
      saveToCache(classId, 'students', students);
    }
  }, [students, selectedClass?.id]);

  useEffect(() => {
    const classId = selectedClass?.id || selectedClass?.class_id;
    if (materials.length > 0 && classId) {
      setLocalMaterials(materials);
      saveToCache(classId, 'materials', materials);
    }
  }, [materials, selectedClass?.id]);

  useEffect(() => {
    const classId = selectedClass?.id || selectedClass?.class_id;
    if (assignments.length > 0 && classId) {
      setLocalAssignments(assignments);
      saveToCache(classId, 'assignments', assignments);
    }
  }, [assignments, selectedClass?.id]);
  
  // Animation Logic
  const [containerWidth, setContainerWidth] = useState(0);
  const TAB_WIDTH = containerWidth > 0 ? (containerWidth - 8) / 3 : 0; // -8 for container padding p-1 = 4*2
  const translateX = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    contentAnim.setValue(0);
    Animated.timing(contentAnim, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [activeTab]);

  const contentTranslateY = contentAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [10, 0],
  });
  
  const handleTabChange = (tab: 'ROSTER' | 'MATERIALS' | 'ASSIGNMENTS', index: number) => {
    setActiveTab(tab);
    Animated.spring(translateX, {
      toValue: index * TAB_WIDTH,
      useNativeDriver: true,
      friction: 8,
      tension: 40
    }).start();
  };

  const classStudents = useMemo(() => students.filter(s => s.class_id === selectedClass?.class_id && (s.section ?? 'A') === (selectedClass?.section ?? 'A')), [students, selectedClass]);
  const classMaterials = useMemo(() => materials.filter(m => m.class_id === selectedClass?.class_id), [materials, selectedClass]);
  const classAssignments = useMemo(() => assignments.filter(a => a.class_id === selectedClass?.class_id), [assignments, selectedClass]);

  const activeData = useMemo(() => {
    let data = activeTab === 'ROSTER' ? localStudents : activeTab === 'MATERIALS' ? localMaterials : localAssignments;
    if (!debouncedQuery) return data;
    const q = debouncedQuery.toLowerCase();
    return data.filter(item => {
      let targetText = '';
      if (activeTab === 'ROSTER') {
        const user = Array.isArray(item.users) ? item.users[0] : item.users;
        targetText = user?.name || item.name || '';
      } else {
        targetText = item.title || item.name || '';
      }
      return targetText.toLowerCase().includes(q);
    });
  }, [activeTab, debouncedQuery, classStudents, classMaterials, classAssignments]);

  const tabConfigs = {
    ROSTER: {
      title: "STUDENT DIRECTORY",
      rightElement: (
        <Pressable 
          onPress={onAddStudent}
          style={({ pressed }) => [{ opacity: pressed ? 0.92 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] }]}
          className="bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100 items-center justify-center"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text className="text-[9px] text-indigo-700 uppercase tracking-[1px] font-inter-black">+ Add Student</Text>
        </Pressable>
      )
    },
    MATERIALS: {
      title: "LECTURE RESOURCES",
      rightElement: null
    },
    ASSIGNMENTS: {
      title: "ACADEMIC GRADING",
      rightElement: (
        <Pressable 
          onPress={() => onAddAssignment?.(selectedClass?.class_id || selectedClass?.id)}
          style={({ pressed }) => [{ opacity: pressed ? 0.92 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] }]}
          className="bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100 items-center justify-center"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text className="text-[9px] text-indigo-700 uppercase tracking-[1px] font-inter-black">+ New Assignment</Text>
        </Pressable>
      )
    }
  };

  return (
    <View className="flex-1 bg-[#f8faff]">
      <PlatinumHeader
        title={selectedClass?.subject ?? 'Untitled Class'}
        subtitle={`${schoolName} Node • SEC ${selectedClass?.section || 'A'}`.replace(' • ', '•')}
        onBack={onBack}
        rightAction={
          <Pressable 
            onPress={onUploadMaterial} 
            style={({ pressed }) => [{ opacity: pressed ? 0.92 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] }]}
            className="bg-indigo-600 px-4 py-2 rounded-xl shadow-lg shadow-indigo-200"
          >
            <Text className="text-white text-[11px] font-inter-black uppercase tracking-[1px]">Add</Text>
          </Pressable>
        }
      />

      <Animated.View 
        className="flex-1"
        style={{ opacity: contentAnim, transform: [{ translateY: contentTranslateY }] }}
      >
        <FlatList
          data={activeData}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        stickyHeaderIndices={[0]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#6366f1"
            colors={["#6366f1"]}
          />
        }
        contentContainerStyle={{ 
          paddingBottom: insets.bottom + 100 
        }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View className="bg-gray-50/50 pt-2">
            {/* Animated Tabs */}
            <View className="px-4 mt-4 mb-4">
              <View 
                onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
                className="relative flex-row bg-gray-100/80 rounded-[20px] p-1 border border-gray-200/50"
              >
                
                {/* Sliding Indicator */}
                <Animated.View
                  style={{
                    width: TAB_WIDTH,
                    transform: [{ translateX }],
                  }}
                  className="absolute top-1 bottom-1 bg-indigo-600 rounded-[16px] shadow-sm shadow-indigo-200"
                />

                {[
                  { id: 'ROSTER', label: 'ROSTER', count: classStudents.length }, 
                  { id: 'MATERIALS', label: 'RESOURCES', count: classMaterials.length }, 
                  { id: 'ASSIGNMENTS', label: 'GRADING', count: classAssignments.length }
                ].map((tab, index) => {
                  const isActive = activeTab === tab.id;

                  return (
                    <Pressable
                      key={tab.id}
                      onPress={() => handleTabChange(tab.id as any, index)}
                      className="flex-1 items-center justify-center py-3 flex-row"
                    >
                      <Text
                        className={`text-[11px] font-inter-black tracking-[1px] ${
                          isActive ? "text-white" : "text-gray-500"
                        }`}
                      >
                        {tab.label}
                      </Text>

                      <View
                        className={`ml-2 px-2.5 py-[1px] rounded-lg items-center justify-center ${
                          isActive ? "bg-white/20" : "bg-white border border-gray-200"
                        }`}
                      >
                        <Text
                          className={`text-[9px] font-inter-black ${
                            isActive ? "text-white" : "text-indigo-600"
                          }`}
                        >
                          {tab.count}
                        </Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Search Filter */}
            <View className="px-6 mb-4">
              <View className="flex-row bg-white rounded-xl px-4 py-2.5 border border-gray-200 items-center shadow-sm shadow-gray-100">
                <Icons.Search size={16} color="#94a3b8" />
                <TextInput
                    placeholder={`Search ${activeTab.toLowerCase()}...`}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    className="flex-1 ml-3 text-[13px] text-gray-800 font-inter-medium"
                    placeholderTextColor="#9ca3af"
                />
                {searchQuery.length > 0 && (
                  <Pressable 
                    onPress={() => setSearchQuery('')}
                    style={({ pressed }) => [{ opacity: pressed ? 0.92 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] }]}
                  >
                      <Icons.Plus size={16} color="#94a3b8" style={{ transform: [{ rotate: '45deg' }] }} />
                  </Pressable>
                )}
              </View>
            </View>

            <View className="px-6">
              <SectionHeader
                title={tabConfigs[activeTab].title}
                className="mb-4"
                rightElement={tabConfigs[activeTab].rightElement}
              />
            </View>
          </View>
        }
        ItemSeparatorComponent={() => <View className="h-[1px] bg-gray-100" />}
        initialNumToRender={8}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={Platform.OS === 'android'} // Usually more impactful on Android
        ListEmptyComponent={
          <View className="mx-6 items-center py-12 px-6 bg-white rounded-2xl border border-white shadow-sm shadow-gray-100 mt-4">
              <View className="w-14 h-14 rounded-2xl bg-indigo-50 items-center justify-center mb-4 border border-indigo-100">
                {activeTab === 'ROSTER' ? <Icons.Profile size={28} color="#4f46e5" /> : 
                 activeTab === 'MATERIALS' ? <Icons.FileText size={28} color="#4f46e5" /> : 
                 <Icons.Edit size={28} color="#4f46e5" />}
              </View>

              <Text className="text-gray-800 text-[15px] font-inter-black mb-0.5 uppercase tracking-tight">
                No {activeTab.toLowerCase()} yet
              </Text>

              <Text className="text-gray-400 text-[12px] text-center mb-6 font-inter-medium leading-relaxed">
                {activeTab === 'ROSTER' ? "Start building your student directory to track progress and performance." :
                 activeTab === 'MATERIALS' ? "Upload lecture notes, PDFs, or external resources for your class." :
                 "Create assignments or exams to start capturing academic performance."}
              </Text>

              <Pressable 
                onPress={() => {
                  if (activeTab === 'ROSTER') onAddStudent();
                  else if (activeTab === 'MATERIALS') onUploadMaterial();
                  else onAddAssignment?.(selectedClass?.class_id || selectedClass?.id);
                }}
                style={({ pressed }) => [{ opacity: pressed ? 0.92 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] }]}
                className="bg-indigo-600 px-6 py-3 rounded-xl shadow-lg shadow-indigo-200"
              >
                <Text className="text-white text-[12px] font-inter-black uppercase tracking-[1px]">
                  {activeTab === 'ROSTER' ? "Add Student" : activeTab === 'MATERIALS' ? "Upload Material" : "New Assignment"}
                </Text>
              </Pressable>
            </View>
          }
          renderItem={({ item, index }) => {
            const isRoster = activeTab === 'ROSTER';
            const isMaterials = activeTab === 'MATERIALS';
            const user = isRoster ? (Array.isArray(item.users) ? item.users[0] : item.users) : null;

            const isFirst = index === 0;
            const isLast = index === activeData.length - 1;

            return (
              <View className={`bg-white ${isFirst ? 'rounded-t-2xl shadow-sm' : ''} ${isLast ? 'rounded-b-2xl shadow-sm mb-4' : ''} overflow-hidden`}>
                <Pressable 
                  style={({ pressed }) => [
                    {
                      opacity: pressed ? 0.92 : 1,
                      transform: [{ scale: pressed ? 0.97 : 1 }],
                      backgroundColor: pressed ? '#f9fafb' : 'white'
                    }
                  ]}
                >
                  <View className={`flex-row items-center justify-between px-4 py-3.5`}>
                    {/* LEFT SECTION */}
                    <View className="flex-row items-center flex-1">
                      <View 
                        style={{ backgroundColor: isRoster ? '#eef2ff' : isMaterials ? (item.type === 'PDF' ? '#eef2ff' : '#f0f9ff') : '#f5f3ff' }}
                        className="w-11 h-11 rounded-xl items-center justify-center mr-3"
                      >
                        {isRoster ? <Icons.Profile size={16} color="#4f46e5" /> : isMaterials ? (item.type === 'PDF' ? <Icons.FileText size={16} color="#4f46e5" /> : <Icons.Globe size={16} color="#0ea5e9" />) : <Icons.Edit size={16} color="#8b5cf6" />}
                      </View>

                      <View className="flex-1">
                        <HighlightText 
                          text={isRoster ? (user?.name || item.name || 'Unknown') : (item.title || item.name || '')} 
                          query={debouncedQuery}
                          baseClass="text-[14px] font-inter-semibold text-gray-800 leading-tight"
                        />
                        <Text className="text-[12px] text-gray-500 mt-0.5">
                          {isRoster ? `Roll No: ${user?.roll_number || 'N/A'}` : isMaterials ? item.type : `Max Marks: ${item.max_marks} • Due: ${item.due_date || 'No Deadline'}`}
                        </Text>
                      </View>
                    </View>

                    {/* RIGHT SECTION */}
                    <View className="ml-3">
                      {isRoster ? (
                        <View className="px-2.5 py-[3px] rounded-full border border-gray-300 bg-gray-50 min-w-[40px] items-center">
                          <Text className="text-[11px] font-inter-semibold text-gray-700">{item.grade_score || 'B+'}</Text>
                        </View>
                      ) : isMaterials ? (
                        <Icons.ChevronRight size={16} color="#d1d5db" />
                      ) : (
                        <Pressable 
                          onPress={() => onGradeAssignment?.(item)} 
                          style={({ pressed }) => [{ opacity: pressed ? 0.92 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] }]}
                          className="bg-indigo-600 px-4 py-2 rounded-xl"
                        >
                          <Text className="text-white text-[9px] font-black uppercase tracking-[1px] font-inter-black">Grade</Text>
                        </Pressable>
                      )}
                    </View>
                  </View>
                </Pressable>
              </View>
            );
          }}
        />
      </Animated.View>
    </View>
  );
});
