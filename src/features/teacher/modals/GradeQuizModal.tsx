import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Icons } from '../../../../components/Icons';
import { AppTheme, ModalShell, AppButton, AppTypography } from '../../../design-system';

interface GradeQuizModalProps {
  visible: boolean;
  onClose: () => void;
  onShowToast: (msg: string) => void;
}

export const GradeQuizModal: React.FC<GradeQuizModalProps> = ({
  visible,
  onClose,
  onShowToast,
}) => {
  const gradingQueue = [
    { id: 1, subject: 'Algebra I', section: 'Grade 10-A', count: 5, time: '2h ago', status: 'Priority' },
    { id: 2, subject: 'Physics Lab', section: 'Grade 11-B', count: 12, time: '5h ago', status: 'Pending' },
    { id: 3, subject: 'Grammar Quiz', section: 'Grade 9-C', count: 8, time: 'Yesterday', status: 'Legacy' },
  ];

  return (
    <ModalShell
      visible={visible}
      onClose={onClose}
      title="Grading Hub"
      subtitle="Institutional Exam Registry"
      headerGradient={AppTheme.colors.gradients.brand}
    >
      <View>
        <View className="bg-emerald-50 p-6 rounded-[32px] border border-emerald-100 flex-row items-center mb-8">
            <View className="w-12 h-12 bg-white rounded-2xl items-center justify-center mr-4 shadow-sm border border-emerald-100">
                <Icons.Check size={24} color="#10b981" />
            </View>
            <View className="flex-1">
                <Text className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Queue Status</Text>
                <Text className="text-sm font-black text-emerald-900">{gradingQueue.length} Assessments Awaiting Review</Text>
            </View>
        </View>

        <View className="mb-6">
            <Text className={`${AppTypography.eyebrow} text-gray-400 mb-4 ml-1`}>Grading Queue</Text>
            <View className="gap-4">
                {gradingQueue.map((item) => (
                    <TouchableOpacity 
                        key={item.id}
                        onPress={() => { 
                            onClose(); 
                            onShowToast(`Accessing ${item.subject} Roster`); 
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
                                {item.section} • {item.time}
                            </Text>
                        </View>

                        <View className="bg-indigo-50 px-4 py-2 rounded-2xl border border-indigo-100 items-center justify-center shadow-inner">
                            <Text className="text-lg font-black text-indigo-600 leading-tight">{item.count}</Text>
                            <Text className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">Left</Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </View>
        </View>

        <AppButton 
            label="Sync All Grades"
            onPress={() => { onClose(); onShowToast("Automating grade sync..."); }}
            className="py-5 mb-6"
        />
      </View>
    </ModalShell>
  );
};
