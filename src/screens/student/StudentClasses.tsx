import React, { useMemo, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Pressable, Animated } from 'react-native';
import { Icons } from '@components/common/Icons';
import { AppTheme, AppCard, StatusPill, PlatinumSearchHeader } from '@components/common';
import { triggerHaptic } from '@utils/haptics';

interface ClassListItemProps {
  item: any;
  onPress: (item: any) => void;
  materialCount: number;
  assignmentCount: number;
}

const ClassListItem = React.memo(({ item, onPress, materialCount, assignmentCount }: ClassListItemProps) => {
  const [pressed, setPressed] = useState(false);

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
      {/* LEFT: ICON */}
      <View className={`w-14 h-14 rounded-2xl items-center justify-center mr-4 ${pressed ? 'bg-indigo-200' : 'bg-indigo-50'}`}>
        <Icons.Classes size={24} color="#4f46e5" />
      </View>
 
      {/* CENTER: DETAILS */}
      <View className="flex-1 justify-center">
        <Text className="text-[18px] font-inter-black text-gray-900 tracking-tight mb-1" numberOfLines={1}>
          {item.subject}
        </Text>
        
        <Text className="text-[13px] font-inter-bold text-gray-500 mb-2.5">
          {item.teacher_name || 'Academic Faculty'}
        </Text>
 
        <View className="flex-row items-center">
          <View className="flex-row items-center px-2.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100/50 mr-2">
            <View className="w-1.5 h-1.5 rounded-full mr-1.5 bg-indigo-500" />
            <Text className="text-[9px] font-inter-black uppercase tracking-[0.5px] text-indigo-600">
               {item.class_time || '9:00 AM'}
            </Text>
          </View>
          
          {(materialCount > 0 || assignmentCount > 0) && (
            <View className="flex-row items-center opacity-40">
               {materialCount > 0 && <View className="flex-row items-center mr-2"><Icons.BookOpen size={10} color="#6366f1" /><Text className="text-[9px] font-inter-black ml-1">{materialCount}</Text></View>}
               {assignmentCount > 0 && <View className="flex-row items-center"><Icons.Report size={10} color="#8b5cf6" /><Text className="text-[9px] font-inter-black ml-1">{assignmentCount}</Text></View>}
            </View>
          )}
        </View>
      </View>
 
      {/* RIGHT: STANDING */}
      <View className="items-end justify-center ml-2">
        <View className="bg-indigo-50/50 px-3 py-1.5 rounded-xl border border-indigo-100/30">
          <Text className="text-[11px] font-inter-black text-indigo-600">
            {(() => {
              const score = String(item.grade_score || '').trim();
              if (!score) return 'A+';
              // Check if it's a number (including those with decimals)
              if (/^\d+(\.\d+)?$/.test(score)) return `GPA ${score}`;
              return score;
            })()}
          </Text>
        </View>
        <Icons.ChevronRight size={18} color="#cbd5e1" className="mt-2" />
      </View>
    </Pressable>
  );
});

import { SubjectHubModal } from './modals/SubjectHubModal';

interface StudentClassesProps {
  studentPrimaryClass: any;
  allStudentClasses: any[];
  studentMaterials: any[];
  studentAssignments: any[];
  onNavigate: (tab: string) => void;
  onAction: (tab: string) => void;
  onFilterNavigate: (tab: string, filter?: string) => void;
}

export const StudentClasses: React.FC<StudentClassesProps> = ({ 
  allStudentClasses = [],
  studentMaterials = [],
  studentAssignments = [],
  onNavigate,
  onAction,
  onFilterNavigate
}) => {
  const [classSearch, setClassSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<any>(null);
  const [isHubVisible, setIsHubVisible] = useState(false);
  
  const filteredClasses = useMemo(() => {
    return (allStudentClasses || []).filter(c => 
      (c.subject || '').toLowerCase().includes(classSearch.toLowerCase()) ||
      (c.name || '').toLowerCase().includes(classSearch.toLowerCase())
    );
  }, [allStudentClasses, classSearch]);

  const handleClassPress = (cls: any) => {
    triggerHaptic();
    setSelectedSubject(cls);
    setIsHubVisible(true);
  };

  const handleHubAction = (type: string) => {
    setIsHubVisible(false);
    if (type === 'live') {
      onNavigate('videos');
    } else if (type === 'chat') {
      onAction('quick_query'); 
    } else if (type === 'materials') {
      onFilterNavigate('materials', selectedSubject?.subject || 'ALL');
    } else {
      onNavigate(type);
    }
  };

  return (
    <View className="flex-1 bg-[#f8faff]">
      <PlatinumSearchHeader
        title="My Classes"
        subtitle={`${allStudentClasses.length} Active Enrollments`}
        searchValue={classSearch}
        onSearchChange={setClassSearch}
        placeholder="Search by subject or class..."
      />
 
      <ScrollView 
          className="flex-1 mt-4 relative z-20"
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 4, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
      >
        <View className="pt-4">
          {filteredClasses.length > 0 ? filteredClasses.map((cls, idx) => {
            const mCount = studentMaterials.filter(m => m.class_id === cls.class_id || m.class_id === cls.id).length;
            const aCount = studentAssignments.filter(a => a.class_id === cls.class_id || a.class_id === cls.id).length;
            
            return (
              <ClassListItem 
                key={cls.facultyRosterId || `class_${idx}`} 
                item={cls} 
                onPress={handleClassPress}
                materialCount={mCount}
                assignmentCount={aCount}
              />
            );
          }) : (
            <View className="py-20 items-center">
                <View className="w-16 h-16 bg-white rounded-3xl items-center justify-center mb-6 border border-gray-100 shadow-xl shadow-indigo-100/50">
                    <Icons.Classes size={32} color="#e5e7eb" />
                </View>
                <Text className="text-[10px] font-black text-gray-400 uppercase tracking-[2px] font-inter-black text-center">No subject enrollment detected</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <SubjectHubModal 
        visible={isHubVisible}
        onClose={() => setIsHubVisible(false)}
        subject={selectedSubject}
        materials={studentMaterials}
        assignments={studentAssignments}
        onAction={handleHubAction}
      />
    </View>
  );
};
