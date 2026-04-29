import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { Icons } from '../../../../components/Icons';
import { AppTheme, AppTypography, ModalShell, AppButton } from '../../../design-system';

interface AnnouncementModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: { title: string; message: string; audience: 'ALL' | 'STUDENT' | 'STAFF'; class_id?: string; section?: string }) => void;
  userRole?: string;
  assignedClasses?: any[];
}

export const AnnouncementModal: React.FC<AnnouncementModalProps> = ({
  visible,
  onClose,
  onSave,
  userRole,
  assignedClasses = [],
}) => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [audience, setAudience] = useState<'ALL' | 'STUDENT' | 'STAFF'>('ALL');
  const [selectedCompId, setSelectedCompId] = useState<string | undefined>(undefined);

  const isTeacher = userRole === 'TEACHER';
  const isMentor = userRole === 'ADMIN_TEACHER';
  const isTeacherOrMentor = isTeacher || isMentor;

  // Reset state ONLY when modal transitions from closed -> open
  const wasVisible = useRef(false);
  useEffect(() => {
    if (visible && !wasVisible.current) {
      setTitle('');
      setMessage('');
      setAudience(isTeacherOrMentor ? 'STUDENT' : 'ALL');
      const firstSection = assignedClasses[0];
      setSelectedCompId(firstSection ? `${firstSection.class_id}::${firstSection.section || 'A'}` : undefined);
    }
    wasVisible.current = visible;
  }, [visible]);

  const handlePost = () => {
    if (!title.trim() || !message.trim()) return;
    
    let targetClassId = undefined;
    let targetSection = undefined;
    
    if (isMentor && assignedClasses.length > 0) {
        targetClassId = assignedClasses[0].class_id;
        targetSection = assignedClasses[0].section || 'A';
    } else if (isTeacher && selectedCompId) {
        const parts = selectedCompId.split('::');
        targetClassId = parts[0];
        targetSection = parts[1];
    }

    onSave({ title, message, audience, class_id: targetClassId, section: targetSection });
    onClose();
  };

  return (
    <ModalShell
      visible={visible}
      onClose={onClose}
      title="Global Broadcast"
      subtitle="Institutional Communication Node"
      headerGradient={AppTheme.colors.gradients.brand}
    >
      <View className="mb-6">
        <Text className="text-[9px] font-black text-indigo-400 uppercase tracking-[2px] mb-2 px-1 font-inter-black">Notice Designation</Text>
        <View className="bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 shadow-inner">
          <TextInput 
            placeholder="e.g. Annual Sports Day Briefing" 
            value={title}
            onChangeText={setTitle}
            className="text-gray-900 font-black text-[13px] font-inter-black p-0"
            placeholderTextColor="#94a3b8"
          />
        </View>
      </View>

      <View className="mb-6">
        <Text className="text-[9px] font-black text-indigo-400 uppercase tracking-[2px] mb-2 px-1 font-inter-black">Content Transmission</Text>
        <View className="bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 h-36 shadow-inner">
          <TextInput 
            placeholder="Construct your institutional message..." 
            value={message}
            onChangeText={setMessage}
            multiline
            className="text-gray-900 font-black text-[13px] font-inter-black flex-1 leading-relaxed p-0"
            textAlignVertical="top"
            placeholderTextColor="#94a3b8"
          />
        </View>
      </View>

      {!isMentor && (
        <View className="mb-8">
          <Text className="text-[9px] font-black text-indigo-400 uppercase tracking-[2px] mb-4 px-1 font-inter-black">Targeted Node Distribution</Text>
          <View className="flex-row gap-3">
            {(isTeacher ? [
              { key: 'STUDENT', label: 'My Students', sub: 'Class Only' }
            ] : [
              { key: 'ALL', label: 'Everyone', sub: 'Broadcast' },
              { key: 'STUDENT', label: 'Students', sub: 'Learners' },
              { key: 'STAFF', label: 'Teachers', sub: 'Staff' }
            ]).map((aud) => (
              <TouchableOpacity 
                key={aud.key}
                onPress={() => setAudience(aud.key as any)}
                className={`p-4 rounded-2xl border flex-1 items-center ${audience === aud.key ? 'bg-indigo-600 border-indigo-600 shadow-xl shadow-indigo-200' : 'bg-white border-white shadow-sm'}`}
              >
                <Text className={`font-black text-[10px] tracking-widest uppercase font-inter-black ${audience === aud.key ? 'text-white' : 'text-gray-500'}`}>{aud.label}</Text>
                <Text className={`text-[8px] font-black mt-1 uppercase tracking-tighter ${audience === aud.key ? 'text-indigo-100' : 'text-gray-400'}`}>{aud.sub}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {isTeacher && assignedClasses.length > 0 && (
        <View className="mb-8">
          <Text className="text-[9px] font-black text-indigo-400 uppercase tracking-[2px] mb-4 px-1 font-inter-black">Academic Segment Synchronization</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
            {assignedClasses.map((cls) => {
              const compId = `${cls.class_id}::${cls.section || 'A'}`;
              const isSelected = selectedCompId === compId;
              return (
                <TouchableOpacity 
                  key={compId}
                  onPress={() => setSelectedCompId(compId)}
                  className={`px-5 py-4 rounded-2xl border mr-3 ${isSelected ? 'bg-indigo-50 border-indigo-200 shadow-xl shadow-indigo-100/50' : 'bg-white border-white shadow-sm'}`}
                >
                  <View className="flex-row items-center">
                    <View className={`w-2 h-2 rounded-full mr-3 ${isSelected ? 'bg-indigo-500 shadow-sm shadow-indigo-500/50' : 'bg-gray-300'}`} />
                    <Text className={`font-black text-[10px] uppercase tracking-[2px] font-inter-black ${isSelected ? 'text-indigo-700' : 'text-gray-500'}`}>
                      {cls.name || cls.subject} - {cls.section || 'A'}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {isMentor && assignedClasses.length > 0 && (
        <View className="mb-8">
          <Text className="text-[9px] font-black text-indigo-400 uppercase tracking-[2px] mb-4 px-1 font-inter-black">Enforced Segment Target</Text>
          <View className="bg-white border border-white rounded-[24px] p-5 flex-row items-center shadow-xl shadow-indigo-100/30">
            <View className="w-12 h-12 rounded-2xl bg-indigo-50 items-center justify-center mr-4 border border-indigo-100 shadow-sm">
              <Icons.Users size={24} color="#4f46e5" />
            </View>
            <View className="flex-1">
              <Text className="text-[10px] font-black text-indigo-400 uppercase tracking-[2px] mb-1 font-inter-black">Institutional Roster</Text>
              <Text className="font-black text-gray-900 text-lg tracking-tighter font-inter-black">
                {assignedClasses[0].name || assignedClasses[0].subject} - {assignedClasses[0].section || 'A'}
              </Text>
            </View>
            <View className="bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100">
              <Text className="text-[9px] font-black text-indigo-600 font-inter-black">SECURE</Text>
            </View>
          </View>
        </View>
      )}

      <TouchableOpacity 
        onPress={handlePost}
        disabled={!title.trim() || !message.trim()}
        activeOpacity={0.9}
        className="bg-indigo-600 py-5 rounded-2xl shadow-xl shadow-indigo-200 border border-indigo-500 flex-row items-center justify-center mb-4"
      >
        <Icons.Notifications size={18} color="white" />
        <Text className="text-white font-black uppercase tracking-[3px] text-[11px] font-inter-black ml-3">Transmit Notice</Text>
      </TouchableOpacity>
    </ModalShell>
  );
};
