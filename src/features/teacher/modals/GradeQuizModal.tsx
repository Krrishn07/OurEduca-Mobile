import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Icons } from '../../../../components/Icons';
import { AppTheme, ModalShell, AppButton, AppTypography } from '../../../design-system';

interface GradeQuizModalProps {
  visible: boolean;
  onClose: () => void;
  onShowToast: (msg: string) => void;
  assignedSections: any[];
  dbRoster: any[];
}

export const GradeQuizModal: React.FC<GradeQuizModalProps> = ({
  visible,
  onClose,
  onShowToast,
  assignedSections,
  dbRoster
}) => {
  // Logic: Each assigned section is a potential "Grading Task"
  const gradingQueue = assignedSections.map((section, idx) => {
    // Count students in this specific section/class
    const studentsInNode = dbRoster.filter(s => 
      s.class_id === section.class_id && 
      (s.section || 'A') === (section.section || 'A')
    ).length;

    return {
      id: section.id || section.rosterId,
      subject: section.subject || 'Academic Session',
      section: `${section.name} - ${section.section || 'A'}`,
      count: studentsInNode,
      time: idx === 0 ? 'Priority' : 'Active',
      status: idx === 0 ? 'Priority' : 'Pending'
    };
  });

  return (
    <ModalShell
      visible={visible}
      onClose={onClose}
      title="Grading Hub"
      subtitle="Institutional Exam Registry"
      headerGradient={AppTheme.colors.gradients.brand}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="bg-emerald-50 p-6 rounded-[32px] border border-emerald-100 flex-row items-center mb-8">
            <View className="w-12 h-12 bg-white rounded-2xl items-center justify-center mr-4 shadow-sm border border-emerald-100">
                <Icons.Check size={24} color="#10b981" />
            </View>
            <View className="flex-1">
                <Text className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Queue Status</Text>
                <Text className="text-sm font-black text-emerald-900">{gradingQueue.length} Assigned Sections for Review</Text>
            </View>
        </View>

        <View className="mb-6">
            <Text className={`${AppTypography.eyebrow} text-gray-400 mb-4 ml-1 uppercase`}>Active Grading Nodes</Text>
            <View className="gap-4">
                {gradingQueue.length > 0 ? gradingQueue.map((item) => (
                    <TouchableOpacity 
                        key={item.id}
                        onPress={() => { 
                            onClose(); 
                            onShowToast(`Opening Gradebook for ${item.subject}`); 
                        }}
                        activeOpacity={0.7}
                        className="bg-white p-5 rounded-[28px] border border-gray-100 shadow-sm flex-row items-center active:bg-gray-50"
                    >
                        <View className="w-14 h-14 bg-gray-50 rounded-2xl items-center justify-center mr-4 border border-gray-100">
                            <Icons.Classes size={24} color="#4f46e5" />
                        </View>
                        
                        <View className="flex-1">
                            <View className="flex-row items-center mb-1 flex-wrap gap-2">
                                <Text className="font-black text-gray-900 text-[15px] tracking-tight">{item.subject}</Text>
                                <View className={`px-2 py-0.5 rounded-lg ${
                                    item.status === 'Priority' ? 'bg-rose-100' : 'bg-gray-100'
                                }`}>
                                    <Text className={`text-[8px] font-black uppercase tracking-widest ${
                                        item.status === 'Priority' ? 'text-rose-600' : 'text-gray-400'
                                    }`}>{item.status}</Text>
                                </View>
                            </View>
                            <Text className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
                                {item.section}
                            </Text>
                        </View>

                        <View className="bg-indigo-50 px-4 py-2 rounded-2xl border border-indigo-100 items-center justify-center shadow-inner">
                            <Text className="text-lg font-black text-indigo-600 leading-tight">{item.count}</Text>
                            <Text className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">Roster</Text>
                        </View>
                    </TouchableOpacity>
                )) : (
                    <View className="p-10 items-center justify-center bg-gray-50 rounded-[32px] border border-dashed border-gray-200">
                        <Icons.Alert size={32} color="#94a3b8" />
                        <Text className="text-gray-400 font-black text-[12px] mt-4 uppercase tracking-widest font-inter-black">No Active Sections</Text>
                    </View>
                )}
            </View>
        </View>

        <AppButton 
            label="Automate Grade Sync"
            onPress={() => { onClose(); onShowToast("Synchronizing institutional marks..."); }}
            className="py-5 mb-6"
        />
      </ScrollView>
    </ModalShell>
  );
};
