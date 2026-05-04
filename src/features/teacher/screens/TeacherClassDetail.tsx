import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { Icons } from '../../../../components/Icons';
import { useMockAuth } from '../../../../contexts/MockAuthContext';
import { SectionHeader, AppRow, StatusPill, PlatinumHeader } from '../../../design-system';

interface TeacherClassDetailProps {
  selectedClass: any;
  students: any[];
  materials: any[];
  onBack: () => void;
  onUploadMaterial: () => void;
  onAddStudent: () => void;
  assignments?: any[];
  onGradeAssignment?: (assignment: any) => void;
  onAddAssignment?: (classId?: string) => void;
}

export const TeacherClassDetail: React.FC<TeacherClassDetailProps> = ({
  selectedClass, students = [], materials = [], onBack, onUploadMaterial, onAddStudent, assignments = [], onGradeAssignment, onAddAssignment
}) => {
  const { currentUser } = useMockAuth();
  const [activeTab, setActiveTab] = useState<'ROSTER' | 'MATERIALS' | 'ASSIGNMENTS'>('ROSTER');

  const classStudents = useMemo(() => students.filter(s => s.class_id === selectedClass.class_id && (s.section === selectedClass.section || !s.section)), [students, selectedClass]);
  const classMaterials = useMemo(() => materials.filter(m => m.class_id === selectedClass.class_id), [materials, selectedClass]);
  const classAssignments = useMemo(() => assignments.filter(a => a.class_id === selectedClass.class_id), [assignments, selectedClass]);

  const activeData = activeTab === 'ROSTER' ? classStudents : activeTab === 'MATERIALS' ? classMaterials : classAssignments;

  return (
    <View className="flex-1 bg-gray-50/50">
      <PlatinumHeader
        title={selectedClass.subject}
        subtitle={`${currentUser?.school_name || 'Academy'} Node • SEC ${selectedClass.section || 'A'}`}
        onBack={onBack}
        rightAction={
          <TouchableOpacity activeOpacity={0.7} onPress={onUploadMaterial} className="bg-indigo-600 px-4 py-2 rounded-xl shadow-lg shadow-indigo-200">
            <Text className="text-white text-[11px] font-inter-black uppercase">Add</Text>
          </TouchableOpacity>
        }
      />

      <View className="flex-row px-4 mt-6 mb-4">
        {[{ id: 'ROSTER', label: 'Roster' }, { id: 'MATERIALS', label: 'Resources' }, { id: 'ASSIGNMENTS', label: 'Grading' }].map((tab, i) => (
          <React.Fragment key={tab.id}>
            <TouchableOpacity activeOpacity={0.7} onPress={() => setActiveTab(tab.id as any)} className={`flex-1 py-3 items-center rounded-2xl border ${activeTab === tab.id ? 'bg-indigo-600 border-indigo-700 shadow-md' : 'bg-white border-gray-100'}`}>
              <Text className={`text-[10px] uppercase tracking-widest font-inter-black ${activeTab === tab.id ? 'text-white' : 'text-gray-500'}`}>{tab.label}</Text>
            </TouchableOpacity>
            {i < 2 && <View className="w-3" />}
          </React.Fragment>
        ))}
      </View>

      {/* PLATINUM FIX: FlatList implementation for scalable rendering */}
      <FlatList
        data={activeData}
        keyExtractor={(item, idx) => item.id?.toString() || idx.toString()}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <SectionHeader
            title={activeTab === 'ROSTER' ? "STUDENT DIRECTORY" : activeTab === 'MATERIALS' ? "LECTURE MATERIALS" : "ASSIGNMENTS & EXAMS"}
            className="mb-4"
            rightElement={
              activeTab === 'ROSTER' ? (
                <TouchableOpacity activeOpacity={0.7} onPress={onAddStudent}><Text className="text-[9px] text-indigo-600 uppercase tracking-widest font-inter-black">+ Add Student</Text></TouchableOpacity>
              ) : activeTab === 'ASSIGNMENTS' ? (
                <TouchableOpacity activeOpacity={0.7} onPress={() => onAddAssignment?.(selectedClass.class_id || selectedClass.id)}><Text className="text-[9px] text-indigo-600 uppercase tracking-widest font-inter-black">+ New Assignment</Text></TouchableOpacity>
              ) : null
            }
          />
        }
        ListEmptyComponent={
          <View className="items-center py-20 bg-white rounded-[28px] border border-white shadow-xl shadow-indigo-100/30">
            <Icons.FileText size={32} color="#cbd5e1" />
            <Text className="text-gray-400 text-[10px] uppercase tracking-[3px] mt-4 font-inter-black">No records found</Text>
          </View>
        }
        renderItem={({ item, index }) => {
          const isRoster = activeTab === 'ROSTER';
          const isMaterials = activeTab === 'MATERIALS';
          const user = isRoster ? (Array.isArray(item.users) ? item.users[0] : item.users) : null;

          return (
            <View className={`bg-white px-4 py-1 ${index === 0 ? 'rounded-t-[28px] pt-4' : ''} ${index === activeData.length - 1 ? 'rounded-b-[28px] pb-4 shadow-xl shadow-indigo-100/30' : ''} border border-white`}>
              <AppRow
                title={isRoster ? (user?.name || 'Unknown') : item.title}
                titleProps={{ numberOfLines: 1, ellipsizeMode: 'tail' }} // PLATINUM FIX: Text truncation
                subtitle={isRoster ? `Roll No: ${user?.roll_number || 'N/A'}` : isMaterials ? item.type : `Max Marks: ${item.max_marks} • Due: ${item.due_date || 'No Deadline'}`}
                avatarIcon={isRoster ? <Icons.Profile size={15} color="#4f46e5" /> : isMaterials ? (item.type === 'PDF' ? <Icons.FileText size={15} color="#4f46e5" /> : <Icons.Globe size={15} color="#0ea5e9" />) : <Icons.Edit size={15} color="#8b5cf6" />}
                avatarBg={isRoster ? '#eef2ff' : isMaterials ? (item.type === 'PDF' ? '#eef2ff' : '#f0f9ff') : '#f5f3ff'}
                showBorder={index < activeData.length - 1}
                rightElement={
                  isRoster ? <StatusPill label={item.grade_score || 'B+'} type="neutral" /> :
                    isMaterials ? <Icons.ChevronRight size={13} color="#d1d5db" /> :
                      <TouchableOpacity activeOpacity={0.7} onPress={() => onGradeAssignment?.(item)} className="bg-indigo-600 px-4 py-2 rounded-xl"><Text className="text-white text-[9px] font-black uppercase tracking-widest font-inter-black">Grade</Text></TouchableOpacity>
                }
              />
            </View>
          );
        }}
      />
    </View>
  );
};