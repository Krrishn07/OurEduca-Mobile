import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Icons } from '../../../../components/Icons';
import { AppCard, SectionHeader, AppRow, StatusPill } from '../../../design-system';

interface TeacherClassDetailProps {
  selectedClass: any;
  students: any[];
  materials: any[];
  onBack: () => void;
  onUploadMaterial: () => void;
  onAddStudent: () => void;
}

export const TeacherClassDetail: React.FC<TeacherClassDetailProps> = ({
  selectedClass,
  students = [],
  materials = [],
  onBack,
  onUploadMaterial,
  onAddStudent
}) => {
  const [activeTab, setActiveTab] = useState<'ROSTER' | 'MATERIALS'>('ROSTER');

  const classMaterials = materials.filter(m => m.class_id === selectedClass.class_id);
  const classStudents = students.filter(s => s.class_id === selectedClass.class_id && (s.section === selectedClass.section || !s.section));

  return (
    <View className="flex-1 bg-gray-50/50">
      {/* Header */}
      <View className="bg-white border-b border-gray-100 pt-12 pb-6 px-6 shadow-sm">
        <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
                <TouchableOpacity 
                    onPress={onBack}
                    className="bg-gray-50 p-2.5 rounded-xl border border-gray-100 mr-4 active:scale-90"
                >
                    <Icons.ChevronLeft size={18} color="#4f46e5" />
                </TouchableOpacity>
                <View>
                    <Text className="text-[17px] font-black text-gray-900 tracking-tighter font-inter-black uppercase tracking-widest">{selectedClass.subject}</Text>
                    <Text className="text-[9px] font-black text-indigo-400 uppercase tracking-[3px] mt-0.5 font-inter-black">{selectedClass.name} • Section {selectedClass.section || 'A'}</Text>
                </View>
            </View>
            
            <TouchableOpacity 
                onPress={onUploadMaterial}
                className="bg-indigo-600 w-10 h-10 rounded-xl shadow-lg shadow-indigo-100 items-center justify-center active:scale-95"
            >
                <Icons.Plus size={16} color="white" />
            </TouchableOpacity>
        </View>
      </View>

      {/* Tabs */}
      <View className="flex-row px-4 mt-6 mb-4">
        <TouchableOpacity 
            onPress={() => setActiveTab('ROSTER')}
            className={`flex-1 py-3 items-center rounded-2xl border ${activeTab === 'ROSTER' ? 'bg-indigo-600 border-indigo-700 shadow-md shadow-indigo-100' : 'bg-white border-gray-100'}`}
        >
            <Text className={`text-[10px] font-black uppercase tracking-widest font-inter-black ${activeTab === 'ROSTER' ? 'text-white' : 'text-gray-500'}`}>Class Roster</Text>
        </TouchableOpacity>
        <View className="w-3" />
        <TouchableOpacity 
            onPress={() => setActiveTab('MATERIALS')}
            className={`flex-1 py-3 items-center rounded-2xl border ${activeTab === 'MATERIALS' ? 'bg-indigo-600 border-indigo-700 shadow-md shadow-indigo-100' : 'bg-white border-gray-100'}`}
        >
            <Text className={`text-[10px] font-black uppercase tracking-widest font-inter-black ${activeTab === 'MATERIALS' ? 'text-white' : 'text-gray-500'}`}>Resources</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-4">
        {activeTab === 'ROSTER' ? (
            <View>
                <SectionHeader 
                    title="STUDENT DIRECTORY" 
                    className="mb-4 px-2"
                    rightElement={
                        <TouchableOpacity onPress={onAddStudent}>
                            <Text className="text-[9px] font-black text-indigo-600 uppercase tracking-widest font-inter-black">+ Add Student</Text>
                        </TouchableOpacity>
                    }
                />
                <AppCard className="p-0 overflow-hidden border border-white shadow-xl shadow-indigo-100/30 mb-10">
                    {classStudents.map((s, idx) => {
                        const user = Array.isArray(s.users) ? s.users[0] : s.users;
                        return (
                            <AppRow
                                key={s.id}
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
                            <Text className="text-gray-400 text-[10px] font-black uppercase tracking-[3px] mt-4">No scholars registered</Text>
                        </View>
                    )}
                </AppCard>
            </View>
        ) : (
            <View>
                <SectionHeader title="LECTURE MATERIALS" className="mb-4 px-2" />
                <AppCard className="p-0 overflow-hidden border border-white shadow-xl shadow-indigo-100/30 mb-10">
                    {classMaterials.map((m, idx) => (
                        <AppRow
                            key={m.id}
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
                            <Text className="text-gray-400 text-[10px] font-black uppercase tracking-[3px] mt-4">No resources shared</Text>
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
