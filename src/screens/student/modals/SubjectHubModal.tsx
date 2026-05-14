import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, Dimensions, Pressable } from 'react-native';
import { Icons } from '@components/common/Icons';
import { AppTheme, AppCard, StatusPill } from '@components/common';
import { BlurView } from 'expo-blur';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface SubjectHubModalProps {
  visible: boolean;
  onClose: () => void;
  subject: any;
  materials: any[];
  assignments: any[];
  onAction: (type: 'materials' | 'assignments' | 'chat' | 'live') => void;
}

export const SubjectHubModal: React.FC<SubjectHubModalProps> = ({
  visible,
  onClose,
  subject,
  materials = [],
  assignments = [],
  onAction
}) => {
  if (!subject) return null;

  const subjectMaterials = materials.filter(m => 
    m.class_id === subject.class_id || m.class_id === subject.id
  );
  const subjectAssignments = assignments.filter(a => 
    a.class_id === subject.class_id || a.class_id === subject.id
  );

  const colorMap: Record<string, string> = {
    emerald: AppTheme.colors.success,
    indigo: AppTheme.colors.primary,
    sky: '#0ea5e9',
    violet: '#8b5cf6',
  };

  const ActionButton = ({ icon: Icon, label, color, onPress, badge }: any) => (
    <TouchableOpacity 
      onPress={onPress}
      activeOpacity={0.7}
      className="w-[48%] bg-white rounded-3xl p-5 mb-4 border border-gray-100 shadow-sm items-center justify-center"
    >
      <View className={`w-12 h-12 rounded-2xl items-center justify-center mb-3`} style={{ backgroundColor: `${colorMap[color]}15` }}>
        <Icon size={24} color={colorMap[color] || color} />
      </View>
      <Text className="text-[11px] font-inter-black text-gray-900 uppercase tracking-widest">{label}</Text>
      {badge > 0 && (
        <View className="absolute top-3 right-3 bg-rose-500 min-w-[18px] h-[18px] rounded-full items-center justify-center px-1">
          <Text className="text-white text-[9px] font-inter-black">{badge}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end">
        <Pressable className="absolute inset-0 bg-black/40" onPress={onClose} />
        
        <View 
          className="bg-[#f8faff] rounded-t-[40px] overflow-hidden"
          style={{ height: SCREEN_HEIGHT * 0.85 }}
        >
          <View className="w-12 h-1.5 bg-gray-200 rounded-full self-center mt-4 mb-2" />
          
          <ScrollView 
            className="flex-1 px-6"
            showsVerticalScrollIndicator={false}
          >
            {/* Header Section */}
            <View className="mt-4 mb-8">
              <View className="flex-row justify-between items-start">
                <View className="flex-1 pr-4">
                  <Text className="text-[10px] font-inter-black text-indigo-600 uppercase tracking-[3px] mb-1">Subject Hub</Text>
                  <Text className="text-[32px] font-inter-black text-gray-900 tracking-tighter leading-9 mb-2">
                    {subject.subject}
                  </Text>
                  <View className="flex-row items-center">
                    <View className="w-8 h-8 rounded-full bg-indigo-100 items-center justify-center mr-2 border border-indigo-200">
                      <Icons.Profile size={14} color="#4f46e5" />
                    </View>
                    <Text className="text-[14px] font-inter-bold text-gray-600">
                      Prof. {subject.teacher_name || 'Faculty'}
                    </Text>
                  </View>
                </View>
                
                <TouchableOpacity 
                  onPress={onClose}
                  className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
                >
                  <Icons.Close size={20} color="#64748b" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Performance Snapshot */}
            <View className="flex-row justify-between mb-8">
              <AppCard className="w-[48%] p-4 border-white shadow-md shadow-indigo-100/20">
                <Text className="text-[10px] font-inter-black text-gray-400 uppercase tracking-widest mb-1">Academic Standing</Text>
                <Text className="text-[24px] font-inter-black text-indigo-600">
                  {(() => {
                    const score = String(subject.grade_score || '').trim();
                    if (!score) return 'A+';
                    if (/^\d+(\.\d+)?$/.test(score)) return `GPA ${score}`;
                    return score;
                  })()}
                </Text>
              </AppCard>
              <AppCard className="w-[48%] p-4 border-white shadow-md shadow-indigo-100/20">
                <Text className="text-[10px] font-inter-black text-gray-400 uppercase tracking-widest mb-1">Class Attendance</Text>
                <Text className="text-[24px] font-inter-black text-emerald-600">92%</Text>
              </AppCard>
            </View>

            {/* Action Matrix */}
            <View className="mb-8">
              <Text className="text-[12px] font-inter-black text-gray-900 uppercase tracking-[2px] mb-5 ml-1">Subject Actions</Text>
              <View className="flex-row flex-wrap justify-between">
                <ActionButton 
                  icon={Icons.Video} 
                  label="Join Live" 
                  color="emerald" 
                  onPress={() => onAction('live')} 
                />
                <ActionButton 
                  icon={Icons.MessageSquare} 
                  label="Message Prof" 
                  color="indigo" 
                  onPress={() => onAction('chat')} 
                />
                <ActionButton 
                  icon={Icons.BookOpen} 
                  label="Materials" 
                  color="sky" 
                  badge={subjectMaterials.length}
                  onPress={() => onAction('materials')} 
                />
                <ActionButton 
                  icon={Icons.Report} 
                  label="Tasks" 
                  color="violet" 
                  badge={subjectAssignments.length}
                  onPress={() => onAction('assignments')} 
                />
              </View>
            </View>

            {/* Timeline Segment */}
            <View className="mb-10">
              <View className="flex-row justify-between items-center mb-5 ml-1">
                <Text className="text-[12px] font-inter-black text-gray-900 uppercase tracking-[2px]">Upcoming Tasks</Text>
                <TouchableOpacity onPress={() => onAction('assignments')}>
                  <Text className="text-[10px] font-inter-black text-indigo-600 uppercase tracking-widest">View All</Text>
                </TouchableOpacity>
              </View>

              {subjectAssignments.length > 0 ? subjectAssignments.slice(0, 3).map((item, idx) => (
                <View key={item.id || idx} className="bg-white rounded-3xl p-4 mb-3 border border-gray-100 shadow-sm flex-row items-center">
                  <View className="w-10 h-10 rounded-xl bg-violet-50 items-center justify-center mr-4">
                    <Icons.Report size={18} color="#8b5cf6" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-[14px] font-inter-black text-gray-900" numberOfLines={1}>{item.title}</Text>
                    <Text className="text-[10px] font-inter-bold text-gray-400 mt-0.5">Due: {item.due_date ? new Date(item.due_date).toLocaleDateString() : 'TBD'}</Text>
                  </View>
                  <Icons.ChevronRight size={16} color="#cbd5e1" />
                </View>
              )) : (
                <View className="py-8 items-center bg-white rounded-3xl border border-dashed border-gray-200">
                  <Text className="text-[10px] font-inter-bold text-gray-400 uppercase tracking-widest">No pending tasks</Text>
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};
