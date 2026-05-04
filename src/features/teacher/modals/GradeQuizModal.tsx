import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Icons } from '../../../../components/Icons';
import { ModalShell } from '../../../design-system';

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
      maxHeight="85%"
    >
      <View className="p-1">
        <View className="bg-emerald-50/50 p-5 rounded-[24px] border border-emerald-100/50 flex-row items-center mb-8">
          <View className="w-10 h-10 bg-white rounded-xl items-center justify-center mr-4 shadow-sm border border-emerald-100/50">
            <Icons.Check size={20} color="#10b981" />
          </View>
          <View className="flex-1">
            <Text className="text-[9px] font-inter-black text-emerald-600 uppercase tracking-widest leading-none mb-1">Queue Status</Text>
            <Text className="text-[12px] font-inter-bold text-emerald-900">{gradingQueue.length} Pending Assessments</Text>
          </View>
        </View>

        <View className="mb-4">
          <Text className="text-[9px] font-inter-black text-gray-400 mb-5 uppercase tracking-[2px] ml-1">Grading Queue</Text>
          
          {gradingQueue.map((item) => (
            <TouchableOpacity 
              key={item.id}
              onPress={() => { 
                onClose(); 
                onShowToast(`Accessing ${item.subject} Roster`); 
              }}
              activeOpacity={0.7}
              className="bg-white p-5 rounded-[24px] border border-gray-100 shadow-sm flex-row items-center mb-4 active:bg-indigo-50"
            >
              <View className="w-12 h-12 bg-gray-50 rounded-2xl items-center justify-center mr-4 border border-gray-100">
                <Icons.Classes size={20} color="#4f46e5" />
              </View>
              
              <View className="flex-1">
                <View className="flex-row items-center mb-1">
                  <Text className="font-inter-bold text-gray-900 text-[15px] tracking-tight">{item.subject}</Text>
                  <View className={`ml-2 px-1.5 py-0.5 rounded-md ${
                    item.status === 'Priority' ? 'bg-rose-50' : 'bg-gray-100'
                  }`}>
                    <Text className={`text-[8px] font-inter-black uppercase ${
                      item.status === 'Priority' ? 'text-rose-600' : 'text-gray-400'
                    }`}>{item.status}</Text>
                  </View>
                </View>
                <Text className="text-[11px] font-inter-medium text-gray-400">{item.section} • {item.time}</Text>
              </View>

              <View className="bg-indigo-50 px-3 py-2 rounded-xl border border-indigo-100 items-center justify-center shadow-sm">
                <Text className="text-[14px] font-inter-black text-indigo-600 mb-0.5">{item.count}</Text>
                <Text className="text-[7px] font-inter-black text-gray-400 uppercase tracking-widest">Left</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Batch Action Footer */}
        <TouchableOpacity 
          className="w-full py-5 rounded-2xl bg-indigo-600 shadow-xl shadow-indigo-100 flex-row items-center justify-center mt-6"
          onPress={() => { onClose(); onShowToast("Automating grade sync..."); }}
        >
          <Icons.Refresh size={18} color="white" />
          <Text className="text-white font-inter-black ml-3 text-[12px] uppercase tracking-[2px]">Sync All Grades</Text>
        </TouchableOpacity>
      </View>
    </ModalShell>
  );
};
