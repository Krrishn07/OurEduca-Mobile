import React from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, Platform, KeyboardAvoidingView } from 'react-native';
import { Icons } from '../../../../components/Icons';

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
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 justify-end bg-black/60">
        <View className="bg-white rounded-t-[40px] p-6 max-h-[85%]">
            {/* Platinum Institutional Header */}
            <View className="flex-row justify-between items-center mb-8">
                <View>
                    <Text className="text-2xl font-black text-gray-900 tracking-tighter">Grading Hub</Text>
                    <Text className="text-[9px] text-emerald-600 font-black uppercase tracking-[2px] mt-1">Institutional Exam Registry</Text>
                </View>
                <TouchableOpacity onPress={onClose} className="p-2.5 bg-gray-50 rounded-full border border-gray-100">
                    <Icons.Close size={20} color="#94a3b8" />
                </TouchableOpacity>
            </View>

            <ScrollView className="space-y-4" showsVerticalScrollIndicator={false}>
                <View className="bg-emerald-50/50 p-4 rounded-[24px] border border-emerald-100/50 flex-row items-center mb-6">
                    <View className="w-10 h-10 bg-white rounded-xl items-center justify-center mr-4 shadow-sm border border-emerald-100/50">
                        <Icons.Check size={20} color="#10b981" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-[9px] font-black text-emerald-600 uppercase tracking-widest leading-none mb-1">Queue Status</Text>
                        <Text className="text-xs font-bold text-emerald-900">{gradingQueue.length} Pending Assessments</Text>
                    </View>
                </View>

                <View className="mb-4">
                    <Text className="text-[10px] font-black text-gray-400 mb-4 uppercase tracking-[2px] ml-1">Grading Queue</Text>
                    
                    {gradingQueue.map((item) => (
                        <TouchableOpacity 
                            key={item.id}
                            onPress={() => { 
                                onClose(); 
                                onShowToast(`Accessing ${item.subject} Roster`); 
                            }}
                            activeOpacity={0.7}
                            className="bg-gray-50/50 p-5 rounded-[24px] border border-gray-100/50 flex-row items-center mb-3 active:bg-indigo-50 active:border-indigo-100"
                        >
                            <View className="w-12 h-12 bg-white rounded-2xl items-center justify-center mr-4 shadow-sm border border-gray-100">
                                <Icons.Classes size={22} color="#4f46e5" />
                            </View>
                            
                            <View className="flex-1">
                                <View className="flex-row items-center mb-1">
                                    <Text className="font-bold text-gray-900 text-[15px] tracking-tight">{item.subject}</Text>
                                    <View className={`ml-2 px-1.5 py-0.5 rounded-md ${
                                        item.status === 'Priority' ? 'bg-rose-50' : 'bg-gray-100'
                                    }`}>
                                        <Text className={`text-[8px] font-black uppercase ${
                                            item.status === 'Priority' ? 'text-rose-600' : 'text-gray-400'
                                        }`}>{item.status}</Text>
                                    </View>
                                </View>
                                <Text className="text-[11px] font-bold text-gray-400">{item.section} • {item.time}</Text>
                            </View>

                            <View className="bg-white px-3 py-2 rounded-xl border border-gray-100 items-center justify-center shadow-sm">
                                <Text className="text-[14px] font-black text-indigo-600 mb-0.5">{item.count}</Text>
                                <Text className="text-[7px] font-black text-gray-400 uppercase tracking-widest">Left</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Batch Action Footer */}
                <TouchableOpacity 
                    className="w-full py-5 rounded-[24px] bg-indigo-600 shadow-xl shadow-indigo-100 flex-row items-center justify-center mt-4"
                    onPress={() => { onClose(); onShowToast("Automating grade sync..."); }}
                >
                    <Icons.Refresh size={18} color="white" />
                    <Text className="text-white font-black ml-3 text-[13px] uppercase tracking-[2px]">Sync All Grades</Text>
                </TouchableOpacity>

                <View className="h-10" />
            </ScrollView>
        </View>
      </View>
    </Modal>
  );
};
