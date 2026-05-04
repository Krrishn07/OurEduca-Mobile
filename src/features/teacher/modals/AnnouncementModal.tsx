import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, ActivityIndicator } from 'react-native';
import { Icons } from '../../../../components/Icons';
import { AppTheme, AppTypography, ModalShell, AppButton } from '../../../design-system';

interface AnnouncementModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: { title: string; message: string; audience: 'ALL' | 'STUDENT' | 'STAFF'; class_id?: string; section?: string }) => void;
  userRole?: string;
  assignedClasses?: any[];
  error?: string | null;
  loading?: boolean;
}

export const AnnouncementModal: React.FC<AnnouncementModalProps> = ({
  visible,
  onClose,
  onSave,
  userRole,
  assignedClasses = [],
  error,
  loading
}) => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [audience, setAudience] = useState<'ALL' | 'STUDENT' | 'STAFF'>('ALL');
  const [selectedCompId, setSelectedCompId] = useState<string | undefined>(undefined);

  const isTeacher = userRole === 'TEACHER';
  const isMentor = userRole === 'ADMIN_TEACHER';
  const isTeacherOrMentor = isTeacher || isMentor;

  // Validation: Hard-block empty or invalid target states
  const isValidTarget = () => {
    if (isMentor) return assignedClasses.length > 0;
    if (isTeacher) return (audience === 'STUDENT' ? !!selectedCompId : !!audience);
    return !!audience;
  };

  const isSubmitDisabled = !title.trim() || !message.trim() || !isValidTarget();

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
    if (isSubmitDisabled) return;
    
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

  const getRecipientSummary = () => {
    if (isMentor && assignedClasses.length > 0) {
        return `${assignedClasses[0].name || assignedClasses[0].subject} Students`;
    }
    if (isTeacher && selectedCompId) {
        const cls = assignedClasses.find(c => `${c.class_id}::${c.section || 'A'}` === selectedCompId);
        return `${cls?.name || cls?.subject || 'Class'} Students (Sec ${cls?.section || 'A'})`;
    }
    if (audience === 'ALL') return 'Entire Institution (All Staff & Students)';
    if (audience === 'STUDENT') return 'All Students (Cross-Department)';
    if (audience === 'STAFF') return 'Institutional Faculty & Staff';
    return 'Undetermined Recipient';
  };

  return (
    <ModalShell
      visible={visible}
      onClose={onClose}
      title="Global Broadcast"
      subtitle={isTeacherOrMentor ? "Classroom Transmission" : "Institutional Communication Node"}
      headerGradient={AppTheme.colors.gradients.brand}
    >
      {error && (
        <View className="bg-rose-50 p-4 rounded-2xl border border-rose-100 mb-6">
          <Text className="text-rose-600 text-[11px] font-black uppercase tracking-wider font-inter-black">{error}</Text>
        </View>
      )}
      <ScrollView showsVerticalScrollIndicator={false} className="max-h-[550px]">
        <View className="mb-6">
          <Text className="text-[9px] font-black text-indigo-400 uppercase tracking-[2px] mb-2 px-1 font-inter-black">Notice Designation</Text>
          <View className="bg-gray-50 border border-gray-100 rounded-[24px] px-6 py-5 shadow-inner">
            <TextInput 
              placeholder="e.g. Annual Sports Day Briefing" 
              value={title}
              onChangeText={setTitle}
              className="text-gray-900 font-black text-[14px] font-inter-black p-0"
              placeholderTextColor="#94a3b8"
            />
          </View>
        </View>

        <View className="mb-6">
          <Text className="text-[9px] font-black text-indigo-400 uppercase tracking-[2px] mb-2 px-1 font-inter-black">Content Transmission</Text>
          <View className="bg-gray-50 border border-gray-100 rounded-[28px] px-6 py-5 h-40 shadow-inner">
            <TextInput 
              placeholder="Construct your institutional message..." 
              value={message}
              onChangeText={setMessage}
              multiline
              className="text-gray-900 font-black text-[14px] font-inter-black flex-1 leading-relaxed p-0"
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
                  className={`p-5 rounded-[24px] border flex-1 items-center ${audience === aud.key ? 'bg-indigo-600 border-indigo-600 shadow-xl shadow-indigo-200' : 'bg-white border-gray-100 shadow-sm'}`}
                >
                  <Text className={`font-black text-[11px] tracking-widest uppercase font-inter-black ${audience === aud.key ? 'text-white' : 'text-gray-500'}`}>{aud.label}</Text>
                  <Text className={`text-[9px] font-black mt-1 uppercase tracking-tighter ${audience === aud.key ? 'text-indigo-100' : 'text-gray-400'}`}>{aud.sub}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {isTeacher && assignedClasses.length > 0 && (
          <View className="mb-8">
            <Text className="text-[9px] font-black text-indigo-400 uppercase tracking-[2px] mb-4 px-1 font-inter-black">Academic Segment Synchronization</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row pb-2">
              {assignedClasses.map((cls) => {
                const compId = `${cls.class_id}::${cls.section || 'A'}`;
                const isSelected = selectedCompId === compId;
                return (
                  <TouchableOpacity 
                    key={compId}
                    onPress={() => setSelectedCompId(compId)}
                    className={`px-6 py-5 rounded-[24px] border mr-3 ${isSelected ? 'bg-indigo-50 border-indigo-200 shadow-xl shadow-indigo-100/50' : 'bg-white border-gray-100 shadow-sm'}`}
                  >
                    <View className="flex-row items-center">
                      <View className={`w-2.5 h-2.5 rounded-full mr-3 ${isSelected ? 'bg-indigo-500 shadow-sm shadow-indigo-500/50' : 'bg-gray-300'}`} />
                      <Text className={`font-black text-[11px] uppercase tracking-[2px] font-inter-black ${isSelected ? 'text-indigo-700' : 'text-gray-500'}`}>
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
            <View className="bg-white border border-gray-50 rounded-[32px] p-6 flex-row items-center shadow-2xl shadow-indigo-100/40">
              <View className="w-14 h-14 rounded-2xl bg-indigo-50 items-center justify-center mr-5 border border-indigo-100 shadow-sm">
                <Icons.Users size={28} color="#4f46e5" />
              </View>
              <View className="flex-1">
                <Text className="text-[10px] font-black text-indigo-400 uppercase tracking-[2px] mb-1.5 font-inter-black">Institutional Roster</Text>
                <Text className="font-black text-gray-900 text-lg tracking-tight font-inter-black">
                  {assignedClasses[0].name || assignedClasses[0].subject} - {assignedClasses[0].section || 'A'}
                </Text>
              </View>
              <View className="bg-indigo-600 px-4 py-2 rounded-xl shadow-lg shadow-indigo-200">
                <Text className="text-[10px] font-black text-white font-inter-black uppercase">SECURE</Text>
              </View>
            </View>
          </View>
        )}

        {/* Transmission Summary - Preview Card */}
        <View className="bg-indigo-50/50 p-6 rounded-[32px] border border-indigo-100/50 mb-10">
            <Text className="text-[10px] font-medium text-gray-500 mb-3 italic opacity-70">
              This announcement will go to: {audience === 'STUDENT' && isTeacherOrMentor ? "Selected class" : audience}
            </Text>
            <View className="flex-row items-center">
                <View className="w-10 h-10 bg-white rounded-full items-center justify-center mr-4 border border-indigo-100 shadow-sm">
                    <Icons.Globe size={20} color="#4f46e5" />
                </View>
                <View className="flex-1">
                    <Text className="text-[9px] font-black text-indigo-400 uppercase tracking-[2px] mb-1 font-inter-black">Transmission Recipient</Text>
                    <Text className="text-indigo-900 font-black text-[12px] font-inter-black leading-tight" numberOfLines={1}>
                        {getRecipientSummary()}
                    </Text>
                </View>
            </View>
        </View>
      </ScrollView>

      <TouchableOpacity 
        onPress={handlePost}
        disabled={isSubmitDisabled || loading}
        activeOpacity={0.9}
        className={`py-5 rounded-2xl flex-row items-center justify-center mb-4 border ${
            isSubmitDisabled || loading
                ? 'bg-gray-100 border-gray-200' 
                : 'bg-indigo-600 border-indigo-500 shadow-xl shadow-indigo-200'
        }`}
      >
        {loading ? (
          <ActivityIndicator color="#94a3b8" size="small" />
        ) : (
          <>
            <Icons.Notifications size={18} color={isSubmitDisabled ? "#94a3b8" : "white"} />
            <Text className={`font-black uppercase tracking-[3px] text-[11px] font-inter-black ml-3 ${
                isSubmitDisabled ? 'text-gray-400' : 'text-white'
            }`}>Transmit Notice</Text>
          </>
        )}
      </TouchableOpacity>
    </ModalShell>
  );
};
