import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Pressable, Animated, Platform, FlatList, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { styled } from 'nativewind';
import { Icons } from '@components/common/Icons';
import { AppTheme } from '@constants/Theme';
import { triggerHaptic } from '@utils/haptics';
import { 
  AppCard, 
  AppTypography, 
  SectionHeader, 
  AppRow, 
  StatusPill,
  PlatinumSearchHeader,
  SkeletonCard
} from '@components/common';

const StyledLinearGradient = styled(LinearGradient || View);

interface MentorClassesProps {
  assignedClassName: string;
  assignedSection?: string;
  mentorRoster: any[];
  dbRoster?: any[];
  dbClasses?: any[];
  teacherAssignedSections?: any[];
  dbMaterials?: any[];
  assignments?: any[];
  sectionFaculty?: any[];
  attendanceMap: Record<string, 'PRESENT' | 'ABSENT' | 'UNMARKED'>;
  isSavingAttendance: boolean;
  onSaveAttendance: (attendance: Record<string, 'PRESENT' | 'ABSENT' | 'UNMARKED'>) => void;
  onSyncToggle: (attendance: Record<string, 'PRESENT' | 'ABSENT' | 'UNMARKED'>) => void;
  onShowAddStudentModal: () => void;
}

const AnimatedCount = React.memo(({ value, isEmpty }: { value: number; isEmpty: boolean }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(scale, { toValue: 0.8, duration: 120, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.5, duration: 120, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.spring(scale, { toValue: 1, friction: 4, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 120, useNativeDriver: true }),
      ]),
    ]).start();
  }, [value]);

  return (
    <Animated.Text
      style={{ transform: [{ scale }], opacity }}
      className={`ml-1 text-[13px] font-inter-medium ${isEmpty ? "text-gray-400" : "text-indigo-600"}`}
    >
      {value}
    </Animated.Text>
  );
});

const ClassListItem = React.memo(({ item, onPress, count }: { item: any; onPress: (item: any) => void; count: number }) => {
  const [pressed, setPressed] = useState(false);
  const isEmpty = count === 0;

  const isMentored = item.role === 'MENTOR';
  const isMonitoring = item.role === 'MONITOR';

  // Use subject if available, otherwise name, otherwise fallback
  const displaySubject = item.subject || (isMentored ? 'Class Registry' : item.name) || 'General Session';
  const displayName = isMentored ? item.name : (item.name || 'Standard Section');

  return (
    <Pressable
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      onPress={() => onPress(item)}
      style={({ pressed: isPressed }) => ({
        transform: [{ scale: isPressed ? 0.985 : 1 }],
      })}
      className={`w-full bg-white rounded-[24px] p-5 flex-row items-center mb-4 border border-gray-100/50 shadow-xl shadow-indigo-100/20
        ${pressed ? "bg-indigo-50/30" : "bg-white"}
      `}
    >
      <View className={`w-14 h-14 rounded-2xl items-center justify-center mr-4 ${isMentored ? 'bg-amber-50' : (isMonitoring ? 'bg-slate-50' : (pressed ? 'bg-indigo-200' : 'bg-indigo-50'))}`}>
        <Icons.Classes size={24} color={isMentored ? '#d97706' : (isMonitoring ? '#64748b' : '#4f46e5')} />
      </View>

      <View className="flex-1 justify-center">
        <View className="flex-row items-center mb-1">
          <Text className="text-[16px] font-inter-black text-gray-900 tracking-tight" numberOfLines={1}>
            {displaySubject}
          </Text>
          <View className={`ml-2 px-2 py-0.5 rounded-full border ${isMentored ? 'bg-amber-50 border-amber-100/30' : (isMonitoring ? 'bg-slate-50 border-slate-200' : 'bg-indigo-50 border-indigo-100/30')}`}>
            <Text className={`text-[9px] font-inter-black uppercase ${isMentored ? 'text-amber-600' : (isMonitoring ? 'text-slate-500' : 'text-indigo-600')}`}>Sec {item.section || 'A'}</Text>
          </View>
        </View>
        
        <Text className="text-[12px] font-inter-bold text-gray-500 mb-2">
          {displayName} • {item.room_no ? `Room ${item.room_no}` : 'Room 302'}
        </Text>

        <View className="flex-row items-center">
          <View className={`flex-row items-center px-2.5 py-1 rounded-full ${isMentored ? 'bg-amber-50' : (isMonitoring ? 'bg-slate-100' : (isEmpty ? 'bg-gray-100' : 'bg-emerald-50'))}`}>
            <View className={`w-1.5 h-1.5 rounded-full mr-1.5 ${isMentored ? 'bg-amber-500' : (isMonitoring ? 'bg-slate-400' : (isEmpty ? 'bg-gray-400' : 'bg-emerald-500'))}`} />
            <Text className={`text-[9px] font-inter-black uppercase tracking-[0.5px] ${isMentored ? 'text-amber-600' : (isMonitoring ? 'text-slate-500' : (isEmpty ? 'text-gray-400' : 'text-emerald-600'))}`}>
              {isMentored ? 'Primary Mentor' : (isMonitoring ? 'Audit Mode Only' : (isEmpty ? 'Standby Faculty' : 'Active Faculty'))}
            </Text>
          </View>
        </View>
      </View>

      <View className="items-end justify-center ml-2">
        <View className={`flex-row items-center px-3 py-1.5 rounded-xl ${isEmpty ? 'bg-gray-50' : 'bg-indigo-50/50'}`}>
          <Icons.Users size={14} color={isEmpty ? "#9ca3af" : "#6366f1"} />
          <AnimatedCount value={count} isEmpty={isEmpty} />
        </View>
        <Icons.ChevronRight size={18} color="#cbd5e1" className="mt-2" />
      </View>
    </Pressable>
  );
});

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

export const MentorClasses: React.FC<MentorClassesProps> = ({
  assignedClassName,
  assignedSection = 'A',
  mentorRoster = [],
  dbRoster = [],
  dbClasses = [],
  teacherAssignedSections = [],
  dbMaterials = [],
  assignments = [],
  sectionFaculty = [],
  attendanceMap,
  isSavingAttendance,
  onSaveAttendance,
  onSyncToggle,
  onShowAddStudentModal,
}) => {
  const [viewMode, setViewMode] = useState<'LIST' | 'DETAIL'>('LIST');
  const [selectedSection, setSelectedSection] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'ROSTER' | 'MATERIALS' | 'ASSIGNMENTS'>('ROSTER');
  const [attendanceMode, setAttendanceMode] = useState(false);
  const [tempAttendance, setTempAttendance] = useState<Record<string, 'PRESENT' | 'ABSENT' | 'UNMARKED'>>(attendanceMap);
  const [search, setSearch] = useState('');

  // Tab animation state
  const [containerWidth, setContainerWidth] = useState(0);
  const TAB_WIDTH = containerWidth > 0 ? (containerWidth - 8) / 3 : 0;
  const translateX = useRef(new Animated.Value(0)).current;

  const handleTabChange = (tab: 'ROSTER' | 'MATERIALS' | 'ASSIGNMENTS', index: number) => {
    triggerHaptic();
    setActiveTab(tab);
    Animated.spring(translateX, {
      toValue: index * TAB_WIDTH,
      useNativeDriver: true,
      friction: 8,
      tension: 40
    }).start();
  };

  // Hydrate local attendance when class changes or map updates
  useEffect(() => {
    setTempAttendance(attendanceMap);
  }, [attendanceMap, selectedSection]);

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

  const classStudentCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    (dbRoster || []).forEach(r => {
      const key = `${r.class_id}::${r.section || 'A'}`;
      counts[key] = (counts[key] || 0) + 1;
    });
    return counts;
  }, [dbRoster]);

  // Aggregate all classes: Mentored + Subject-assigned + Monitoring
  const allSections = useMemo(() => {
    const list = [...(teacherAssignedSections || [])].map(s => ({ ...s, role: 'FACULTY' }));
    
    // 1. Identify Primary Mentored Class
    const primaryExists = list.some(s => 
        s.name === assignedClassName && 
        (s.section || 'A') === (assignedSection || 'A')
    );
    
    let result = list.map(s => ({
        ...s,
        isMentored: s.name === assignedClassName && (s.section || 'A') === (assignedSection || 'A'),
        role: s.name === assignedClassName && (s.section || 'A') === (assignedSection || 'A') ? 'MENTOR' : 'FACULTY'
    }));

    if (!primaryExists && assignedClassName) {
        const classObj = (dbClasses || []).find(c => c.name === assignedClassName);
        result.push({
            id: classObj?.id || 'primary-mentored',
            class_id: classObj?.id || 'primary-mentored',
            name: assignedClassName,
            section: assignedSection || 'A',
            subject: 'Class Roster',
            room_no: classObj?.room_no || '302',
            isMentored: true,
            role: 'MENTOR'
        });
    }

    // 2. Identify "Monitoring" Classes (Where my students are, but I'm not the teacher)
    // Find all unique class/section/subject triplets in dbRoster where role is teacher,
    // and where students from my mentored class are present.
    const mentoredStudentIds = (dbRoster || [])
        .filter(r => r.class_id === (result.find(c => c.isMentored)?.class_id) && r.role_in_class === 'student')
        .map(r => r.user_id);

    const monitoringSections = (dbRoster || [])
        .filter(r => 
            r.role_in_class === 'teacher' && 
            !list.some(s => s.class_id === r.class_id && (s.section || 'A') === (r.section || 'A') && s.subject === r.subject) &&
            (dbRoster || []).some(sr => sr.user_id && mentoredStudentIds.includes(sr.user_id) && sr.class_id === r.class_id && (sr.section || 'A') === (r.section || 'A'))
        )
        .map(r => {
            const classObj = (dbClasses || []).find(c => c.id === r.class_id);
            return {
                id: `monitor-${r.id}`,
                class_id: r.class_id,
                name: classObj?.name || 'Academic Class',
                section: r.section || 'A',
                subject: r.subject || 'Institutional Subject',
                room_no: classObj?.room_no || '302',
                isMentored: false,
                role: 'MONITOR'
            };
        });

    // Deduplicate monitoring sections
    const uniqueMonitoring = Array.from(new Map(monitoringSections.map(s => [`${s.class_id}-${s.section}-${s.subject}`, s])).values());
    
    return [...result, ...uniqueMonitoring].sort((a, b) => {
        if (a.role === 'MENTOR') return -1;
        if (b.role === 'MENTOR') return 1;
        if (a.role === 'FACULTY' && b.role === 'MONITOR') return -1;
        if (a.role === 'MONITOR' && b.role === 'FACULTY') return 1;
        return 0;
    });
  }, [teacherAssignedSections, assignedClassName, assignedSection, dbClasses, dbRoster]);

  // Dynamic Data Memoization for Selected Section
  const classId = useMemo(() => selectedSection?.class_id || selectedSection?.id, [selectedSection]);
  const sectionKey = useMemo(() => selectedSection?.section || 'A', [selectedSection]);
  
  const classStudents = useMemo(() => {
    if (!classId) return [];
    return (dbRoster || []).filter(r => {
        const rClassId = r.class_id;
        const rSection = r.section || 'A';
        
        // Match by real UUID if available
        const idMatch = (rClassId === classId);
        // Fallback for stubs (primary-mentored)
        const stubMatch = (classId === 'primary-mentored' && r.role_in_class === 'student' && r.class_id && !idMatch); // This fallback is complex, maybe just ensure classId is real
        
        return idMatch && (rSection === sectionKey);
    });
  }, [dbRoster, classId, sectionKey]);

  const classFaculty = useMemo(() => {
    if (!classId) return [];
    return (dbRoster || []).filter(r => 
        r.class_id === classId && 
        (r.section || 'A') === sectionKey &&
        r.role_in_class !== 'student'
    );
  }, [dbRoster, classId, sectionKey]);

  const classMaterials = useMemo(() => {
    if (!classId) return [];
    return (dbMaterials || []).filter(m => (m.class_id || m.classId) === classId);
  }, [dbMaterials, classId]);

  const classAssignments = useMemo(() => {
    if (!classId) return [];
    return (assignments || []).filter(a => {
        const aClassId = a.class_id || a.classId;
        return aClassId === classId;
    });
  }, [assignments, classId]);

  const activeData = useMemo(() => {
    let data = activeTab === 'ROSTER' ? classStudents : activeTab === 'MATERIALS' ? classMaterials : classAssignments;
    if (!search) return data;
    const q = search.toLowerCase();
    return data.filter(item => {
        const user = item.users || {};
        const text = user.name || item.name || item.title || item.subject || '';
        return text.toLowerCase().includes(q);
    });
  }, [activeTab, search, classStudents, classMaterials, classAssignments]);

  const filteredSections = allSections.filter(s => 
    s.subject?.toLowerCase().includes(search.toLowerCase()) ||
    s.name?.toLowerCase().includes(search.toLowerCase())
  );

  if (viewMode === 'LIST') {
    return (
      <View className="flex-1 bg-[#f8faff]">
        <PlatinumSearchHeader
          title="Institutional Registry"
          subtitle="All Assigned Sections"
          searchValue={search}
          onSearchChange={setSearch}
          placeholder="Search subjects or classes..."
        />

        <FlatList
          data={filteredSections}
          keyExtractor={(item, idx) => `mentor-cls-${idx}`}
          contentContainerStyle={{ paddingTop: 32, paddingBottom: 120, paddingHorizontal: 20 }}
          renderItem={({ item }) => {
            const countKey = `${item.class_id}::${item.section || 'A'}`;
            return (
              <ClassListItem 
                item={item} 
                onPress={(cls) => {
                  triggerHaptic();
                  setSelectedSection(cls);
                  setViewMode('DETAIL');
                  setSearch('');
                  setActiveTab('ROSTER');
                }}
                count={classStudentCounts[countKey] || 0}
                isMentored={item.isMentored}
              />
            );
          }}
          ListEmptyComponent={
            <View className="flex-1 justify-center items-center mt-20">
               <Icons.Classes size={48} color="#cbd5e1" />
               <Text className="text-gray-400 mt-4 font-inter-bold">No assigned sections found</Text>
            </View>
          }
        />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#f8faff]">
      <PlatinumSearchHeader
        title={selectedSection?.subject || (selectedSection?.role === 'MENTOR' ? 'Class Registry' : selectedSection?.name)}
        subtitle={`SEC ${selectedSection?.section || 'A'} • ${selectedSection?.role === 'MENTOR' ? 'Mentor Workflow' : (selectedSection?.role === 'MONITOR' ? 'Audit Mode' : 'Faculty Workflow')}`.replace(' • ', '•')}
        onBack={() => setViewMode('LIST')}
        searchValue={search}
        onSearchChange={setSearch}
        placeholder={`Search ${activeTab.toLowerCase()}...`}
      />

      <FlatList
        data={activeData}
        keyExtractor={(item, idx) => `detail-${activeTab}-${item.id || idx}`}
        stickyHeaderIndices={[0]}
        contentContainerStyle={{ paddingBottom: 120 }}
        ListHeaderComponent={
          <View className="bg-gray-50/50 pt-2">
            {/* ROLE BANNER: MONITOR MODE */}
            {selectedSection?.role === 'MONITOR' && (
              <View className="px-4 mb-2">
                <View className="bg-slate-800 rounded-2xl p-4 flex-row items-center border border-slate-700 shadow-sm">
                  <View className="w-8 h-8 bg-slate-700 rounded-lg items-center justify-center mr-3">
                    <Icons.Shield size={16} color="#cbd5e1" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-white font-inter-black text-[11px] uppercase tracking-wider">Institutional Audit Mode</Text>
                    <Text className="text-slate-400 text-[9px] font-inter-medium mt-0.5">Read-only view of external faculty session</Text>
                  </View>
                  <View className="bg-slate-700 px-2 py-1 rounded-md">
                    <Text className="text-slate-300 text-[8px] font-inter-black">LOCKED</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Animated Platinum Tabs */}
            <View className="px-4 mt-4 mb-4">
              <View 
                onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
                className="relative flex-row bg-gray-100/80 rounded-[20px] p-1 border border-gray-200/50"
              >
                <Animated.View
                  style={{ width: TAB_WIDTH, transform: [{ translateX }] }}
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
                      <Text className={`text-[11px] font-inter-black tracking-[1px] ${isActive ? "text-white" : "text-gray-500"}`}>
                        {tab.label}
                      </Text>
                      <View className={`ml-2 px-2.5 py-[1px] rounded-lg items-center justify-center ${isActive ? "bg-white/20" : "bg-white border border-gray-200"}`}>
                        <Text className={`text-[9px] font-inter-black ${isActive ? "text-white" : "text-indigo-600"}`}>{tab.count}</Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Role-Specific Action Bar */}
            {activeTab === 'ROSTER' && (
              <View className="px-4 mb-4">
                 {selectedSection?.role === 'MENTOR' ? (
                   /* MENTOR RESPONSIBILITY: Institutional Attendance & Homeroom Management */
                   <View>
                    {!attendanceMode ? (
                      <TouchableOpacity 
                        onPress={() => { triggerHaptic(); setAttendanceMode(true); }}
                        className="bg-indigo-600 p-5 rounded-[24px] flex-row items-center justify-between shadow-xl shadow-indigo-200/50"
                      >
                        <View className="flex-row items-center">
                          <View className="w-10 h-10 bg-white/20 rounded-xl items-center justify-center mr-4 border border-white/30">
                            <Icons.Calendar size={20} color="white" />
                          </View>
                          <View>
                            <Text className="text-white font-inter-black text-[14px]">Institutional Attendance</Text>
                            <Text className="text-indigo-100/60 text-[9px] font-inter-black uppercase tracking-widest mt-0.5">Daily Homeroom Mark</Text>
                          </View>
                        </View>
                        <Icons.ChevronRight size={18} color="white" />
                      </TouchableOpacity>
                    ) : (
                      <View className="bg-amber-600 p-5 rounded-[24px] flex-row items-center justify-between shadow-xl shadow-amber-200/40">
                        <View className="flex-1 mr-2">
                          <Text className="text-white font-inter-black text-[13px]">Attendance Mode Active</Text>
                          <Text className="text-amber-100/60 text-[8px] font-inter-black uppercase tracking-widest mt-0.5">TAP STATUS PILLS TO TOGGLE</Text>
                        </View>
                        <View className="flex-row gap-2">
                            <TouchableOpacity onPress={() => setAttendanceMode(false)} className="bg-white/10 w-9 h-9 rounded-xl items-center justify-center border border-white/20">
                                <Icons.Close size={16} color="white" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleSave} className="bg-white px-4 py-2 rounded-xl">
                                <Text className="text-amber-700 text-[10px] font-inter-black">SAVE</Text>
                            </TouchableOpacity>
                        </View>
                      </View>
                    )}
                    
                    <View className="flex-row mt-3 gap-3">
                      <TouchableOpacity 
                        onPress={onShowAddStudentModal}
                        className="flex-1 bg-white border border-gray-200 p-4 rounded-2xl flex-row items-center justify-center shadow-sm"
                      >
                        <Icons.Plus size={16} color="#4f46e5" />
                        <Text className="text-indigo-600 font-inter-black text-[11px] ml-2 uppercase tracking-tight">Add Student</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        className="flex-1 bg-white border border-gray-200 p-4 rounded-2xl flex-row items-center justify-center shadow-sm"
                      >
                        <Icons.BarChart2 size={16} color="#64748b" />
                        <Text className="text-slate-600 font-inter-black text-[11px] ml-2 uppercase tracking-tight">Holistic View</Text>
                      </TouchableOpacity>
                    </View>
                   </View>
                 ) : selectedSection?.role === 'FACULTY' ? (
                   /* FACULTY RESPONSIBILITY: Session Engagement & Subject Teaching */
                   <TouchableOpacity 
                    onPress={() => { triggerHaptic(); setAttendanceMode(true); }}
                    className="bg-slate-800 p-5 rounded-[24px] flex-row items-center justify-between shadow-xl shadow-slate-200"
                  >
                    <View className="flex-row items-center">
                      <View className="w-10 h-10 bg-white/10 rounded-xl items-center justify-center mr-4 border border-white/10">
                        <Icons.Edit size={18} color="white" />
                      </View>
                      <View>
                        <Text className="text-white font-inter-black text-[14px]">Session Attendance</Text>
                        <Text className="text-slate-400 text-[9px] font-inter-black uppercase tracking-widest mt-0.5">Subject Engagement Log</Text>
                      </View>
                    </View>
                    <View className="bg-indigo-500 px-3 py-1.5 rounded-lg">
                       <Text className="text-white text-[9px] font-inter-black">LOG</Text>
                    </View>
                  </TouchableOpacity>
                 ) : (
                   /* MONITOR RESPONSIBILITY: Read-Only Audit */
                   <View className="bg-white border border-dashed border-gray-300 p-5 rounded-[24px] items-center justify-center">
                      <Icons.Lock size={20} color="#94a3b8" />
                      <Text className="text-slate-400 font-inter-bold text-[12px] mt-2 text-center px-4">
                        Attendance and records for this subject are managed by the assigned Faculty.
                      </Text>
                   </View>
                 )}
              </View>
            )}

            <View className="px-6 mb-4">
              <SectionHeader 
                title={activeTab === 'ROSTER' ? "STUDENT DIRECTORY" : activeTab === 'MATERIALS' ? "CLASS RESOURCES" : "ACADEMIC GRADING"} 
              />
            </View>
          </View>
        }
        renderItem={({ item, index }) => {
            const isRoster = activeTab === 'ROSTER';
            const isMaterials = activeTab === 'MATERIALS';
            const user = item.users || {};
            const displayTitle = isRoster ? (user.name || item.name || 'Unknown Student') : (item.title || item.name || 'Untitled');
            const displaySubtitle = isRoster ? `Roll: ${user.roll_number || item.roll || index+1}` : (isMaterials ? item.type : `Max: ${item.max_marks}`);
            
            return (
                <View className="bg-white px-4">
                    <AppRow
                        title={displayTitle}
                        subtitle={displaySubtitle}
                        avatarIcon={isRoster ? <Icons.Profile size={16} color="#4f46e5" /> : (isMaterials ? (item.type === 'PDF' ? <Icons.FileText size={16} color="#4f46e5" /> : <Icons.Globe size={16} color="#0ea5e9" />) : <Icons.Edit size={16} color="#8b5cf6" />)}
                        avatarBg={isRoster ? '#eef2ff' : (isMaterials ? (item.type === 'PDF' ? '#eef2ff' : '#f0f9ff') : '#f5f3ff')}
                        showBorder={index < activeData.length - 1}
                        rightElement={
                            isRoster ? (
                                <TouchableOpacity 
                                    disabled={!attendanceMode}
                                    onPress={() => toggleStatus(item.id)}
                                    className="items-end"
                                >
                                    <StatusPill 
                                        label={tempAttendance[item.id] || 'UNMARKED'} 
                                        type={tempAttendance[item.id] === 'PRESENT' ? 'success' : tempAttendance[item.id] === 'ABSENT' ? 'danger' : 'neutral'}
                                    />
                                </TouchableOpacity>
                            ) : <Icons.ChevronRight size={16} color="#cbd5e1" />
                        }
                    />
                </View>
            );
        }}
        ListEmptyComponent={
            <View className="py-20 items-center">
                <Icons.Classes size={40} color="#e2e8f0" />
                <Text className="text-gray-400 mt-4 font-inter-bold">No records found</Text>
            </View>
        }
      />
    </View>
  );
};
