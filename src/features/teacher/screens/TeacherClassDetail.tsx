import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icons } from '../../../../components/Icons';
import { useMockAuth } from '../../../../contexts/MockAuthContext';
import { AppCard, SectionHeader, AppRow, StatusPill, PlatinumHeader } from '../../../design-system';

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
  selectedClass,
  students = [],
  materials = [],
  onBack,
  onUploadMaterial,
  onAddStudent,
  assignments = [],
  onGradeAssignment,
  onAddAssignment
}) => {
  const { currentUser } = useMockAuth();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<'ROSTER' | 'MATERIALS' | 'ASSIGNMENTS'>('ROSTER');

  // Performance Fix: Memoize filtered data
  const classStudents = useMemo(() => 
    students.filter(s => s.class_id === selectedClass.class_id && (s.section === selectedClass.section || !s.section)),
    [students, selectedClass]
  );

  const classMaterials = useMemo(() => 
    materials.filter(m => m.class_id === selectedClass.class_id),
    [materials, selectedClass]
  );

  const classAssignments = useMemo(() => 
    assignments.filter(a => a.class_id === selectedClass.class_id),
    [assignments, selectedClass]
  );

  return (
    <View className="flex-1 bg-gray-50/50">
      <PlatinumHeader 
        title={selectedClass.subject}
        subtitle={`${currentUser?.school_name || 'Academy'} Node • SEC ${selectedClass.section || 'A'}`}
        onBack={onBack}
        rightAction={
          <>
            <TouchableOpacity className="p-2 bg-gray-50 rounded-full border border-gray-100">
              <Icons.Search size={18} color="#6b7280" />
            </TouchableOpacity>
            
            <TouchableOpacity 
                onPress={onUploadMaterial} 
                className="bg-indigo-600 px-4 py-2 rounded-xl shadow-lg shadow-indigo-200 active:scale-95"
            >
                <Text className="text-white text-[11px] font-inter-black uppercase">Add</Text>
            </TouchableOpacity>
          </>
        }
      />

      {/* Optimized Tab Bar */}
      <View className="flex-row px-4 mt-6 mb-4">
        {[
          { id: 'ROSTER', label: 'Roster' },
          { id: 'MATERIALS', label: 'Resources' },
          { id: 'ASSIGNMENTS', label: 'Grading' }
        ].map((tab, i) => (
          <React.Fragment key={tab.id}>
            <TouchableOpacity 
              onPress={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-3 items-center rounded-2xl border ${activeTab === tab.id ? 'bg-indigo-600 border-indigo-700 shadow-md' : 'bg-white border-gray-100'}`}
            >
              <Text className={`text-[10px] uppercase tracking-widest font-inter-black ${activeTab === tab.id ? 'text-white' : 'text-gray-500'}`}>
                {tab.label}
              </Text>
            </TouchableOpacity>
            {i < 2 && <View className="w-3" />}
          </React.Fragment>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-4">
        {activeTab === 'ROSTER' ? (
            <View>
                <SectionHeader 
                    title="STUDENT DIRECTORY" 
                    className="mb-4"
                    rightElement={
                        <TouchableOpacity onPress={onAddStudent}>
                            <Text className="text-[9px] text-indigo-600 uppercase tracking-widest font-inter-black">+ Add Student</Text>
                        </TouchableOpacity>
                    }
                />
                <AppCard className="p-0 overflow-hidden border border-white shadow-xl shadow-indigo-100/30 mb-10">
                    {classStudents.map((s, idx) => {
                        const user = Array.isArray(s.users) ? s.users[0] : s.users;
                        return (
                            <AppRow
                                key={s.id || `student-${idx}`}
                                title={user?.name || 'Unknown Student'}
                                subtitle={`Roll No: ${user?.roll_number || 'N/A'}`}
                                avatarIcon={<Icons.Profile size={15} color="#4f46e5" />}
                                avatarBg="#eef2ff"
                                showBorder={idx < classStudents.length - 1}
                                rightElement={<StatusPill label={s.grade_score || 'B+'} type="neutral" />}
                            />
                        );
                    })}
                    {classStudents.length === 0 && (
                        <View className="items-center py-20">
                            <Icons.Users size={32} color="#cbd5e1" />
                            <Text className="text-gray-400 text-[10px] uppercase tracking-[3px] mt-4 font-inter-black">No scholars registered</Text>
                        </View>
                    )}
                </AppCard>
            </View>
        ) : activeTab === 'MATERIALS' ? (
            <View>
                <SectionHeader title="LECTURE MATERIALS" className="mb-4" />
                <AppCard className="p-0 overflow-hidden border border-white shadow-xl shadow-indigo-100/30 mb-10">
                    {classMaterials.map((m, idx) => (
                        <AppRow
                            key={m.id || `material-${idx}`}
                            title={m.title}
                            subtitle={m.type}
                            avatarIcon={m.type === 'PDF' ? <Icons.FileText size={15} color="#4f46e5" /> : <Icons.Globe size={15} color="#0ea5e9" />}
                            avatarBg={m.type === 'PDF' ? '#eef2ff' : '#f0f9ff'}
                            showBorder={idx < classMaterials.length - 1}
                            rightElement={<Icons.ChevronRight size={13} color="#d1d5db" />}
                        />
                    ))}
                    {classMaterials.length === 0 && (
                        <View className="items-center py-20">
                            <Icons.FileText size={32} color="#cbd5e1" />
                            <Text className="text-gray-400 text-[10px] uppercase tracking-[3px] mt-4 font-inter-black">No resources shared</Text>
                        </View>
                    )}
                </AppCard>
            </View>
        ) : (
            <View>
                <SectionHeader 
                    title="ASSIGNMENTS & EXAMS" 
                    className="mb-4"
                    rightElement={
                        <TouchableOpacity onPress={() => onAddAssignment?.(selectedClass.class_id || selectedClass.id)}>
                            <Text className="text-[9px] text-indigo-600 uppercase tracking-widest font-inter-black">+ New Assignment</Text>
                        </TouchableOpacity>
                    }
                />
                <AppCard className="p-0 overflow-hidden border border-white shadow-xl shadow-indigo-100/30 mb-10">
                    {classAssignments.map((a, idx) => (
                        <AppRow
                            key={a.id || `assign-${idx}`}
                            title={a.title}
                            subtitle={`Max Marks: ${a.max_marks} • Due: ${a.due_date || 'No Deadline'}`}
                            avatarIcon={<Icons.Edit size={15} color="#8b5cf6" />}
                            avatarBg="#f5f3ff"
                            showBorder={idx < classAssignments.length - 1}
                            rightElement={
                                <TouchableOpacity 
                                    onPress={() => onGradeAssignment?.(a)}
                                    className="bg-indigo-600 px-4 py-2 rounded-xl"
                                >
                                    <Text className="text-white text-[9px] font-black uppercase tracking-widest font-inter-black">Grade</Text>
                                </TouchableOpacity>
                            }
                        />
                    ))}
                    {classAssignments.length === 0 && (
                        <View className="items-center py-20">
                            <Icons.Report size={32} color="#cbd5e1" />
                            <Text className="text-gray-400 text-[10px] uppercase tracking-[3px] mt-4 font-inter-black">No assignments tracked</Text>
                        </View>
                    )}
                </AppCard>
            </View>
        )}
        <View className="h-20" />
      </ScrollView>
    </View>
  );
};
