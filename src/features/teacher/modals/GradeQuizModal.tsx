import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Icons } from '../../../../components/Icons';
import { ModalShell, AppCard, AppTheme } from '../../../design-system';

interface GradeQuizModalProps {
  visible: boolean;
  onClose: () => void;
  assignedSections: any[];
  onSelectClass: (cls: any) => void;
}

export const GradeQuizModal: React.FC<GradeQuizModalProps> = ({
  visible,
  onClose,
  assignedSections = [],
  onSelectClass,
}) => {
  return (
    <ModalShell
      visible={visible}
      onClose={onClose}
      title="Grading Launcher"
      subtitle="Select a class to begin evaluation"
      headerGradient={AppTheme.colors.gradients.brand}
    >
      <ScrollView showsVerticalScrollIndicator={false} className="max-h-[500px] py-4">
        <Text className="text-[9px] font-black text-indigo-400 uppercase tracking-[2px] mb-4 px-1 font-inter-black">Institutional Roster Targets</Text>
        
        {assignedSections.map((item, idx) => (
          <TouchableOpacity 
            key={idx} 
            onPress={() => {
              onSelectClass(item);
              onClose();
            }}
            activeOpacity={0.8}
            className="mb-4"
          >
            <AppCard className="p-5 border border-gray-100 shadow-sm flex-row items-center bg-gray-50/30">
              <View className="w-12 h-12 bg-white rounded-2xl items-center justify-center mr-4 border border-gray-100 shadow-sm">
                <Icons.Classes size={22} color="#4f46e5" />
              </View>
              <View className="flex-1">
                <Text className="font-black text-gray-900 text-[15px] font-inter-black">{item.subject}</Text>
                <Text className="text-[9px] font-black text-gray-400 uppercase tracking-widest font-inter-black">{item.name} • SEC {item.section || 'A'}</Text>
              </View>
              <View className="bg-indigo-600 w-8 h-8 rounded-xl items-center justify-center shadow-md shadow-indigo-200">
                <Icons.ChevronRight size={14} color="white" />
              </View>
            </AppCard>
          </TouchableOpacity>
        ))}

        {assignedSections.length === 0 && (
          <View className="py-10 items-center">
            <Icons.AlertCircle size={32} color="#cbd5e1" />
            <Text className="text-gray-400 text-[11px] font-black uppercase mt-4 tracking-widest font-inter-black">No active classes found</Text>
          </View>
        )}
      </ScrollView>
      
      <View className="mt-4 pt-4 border-t border-gray-50 items-center">
         <Text className="text-[9px] font-black text-gray-400 uppercase tracking-[3px] font-inter-black italic">Stable Evaluation Node v2.0</Text>
      </View>
    </ModalShell>
  );
};
