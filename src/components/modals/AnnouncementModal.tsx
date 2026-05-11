import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, ActivityIndicator, Pressable, Animated } from 'react-native';
import Reanimated, { FadeInDown } from 'react-native-reanimated';
import { Icons } from '@components/common/Icons';
import { AppTheme, ModalShell, FloatingInput } from '@components/common';
import { triggerHaptic, HapticPatterns } from '@utils/haptics';
import { SPRING_CONFIG } from '@constants/motion';

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
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string | null }>({});
  const successScale = useRef(new Animated.Value(1)).current;

  const isTeacher = userRole === 'TEACHER';
  const isMentor = userRole === 'ADMIN_TEACHER';
  const isTeacherOrMentor = isTeacher || isMentor;

  const isValidTarget = () => {
    if (isMentor) return assignedClasses.length > 0;
    if (isTeacher) return (audience === 'STUDENT' ? !!selectedCompId : !!audience);
    return !!audience;
  };

  const isSubmitDisabled = !isValidTarget();

  const wasVisible = useRef(false);
  useEffect(() => {
    if (visible && !wasVisible.current) {
      setTitle('');
      setMessage('');
      setAudience(isTeacherOrMentor ? 'STUDENT' : 'ALL');
      const firstSection = assignedClasses[0];
      setSelectedCompId(firstSection ? `${firstSection.class_id}::${firstSection.section || 'A'}` : undefined);
      setSaved(false);
      setErrors({});
    }
    wasVisible.current = visible;
  }, [visible, isTeacherOrMentor, assignedClasses]);

  const validate = () => {
    const newErrors: { [key: string]: string | null } = {};
    if (!title.trim()) newErrors.title = 'Notice Title is required';
    if (!message.trim()) newErrors.message = 'Message Content is required';
    if (!isValidTarget()) newErrors.target = 'Target Audience is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePost = async () => {
    if (loading || saved) return;
    
    if (!validate()) {
        triggerHaptic();
        return;
    }

    triggerHaptic();
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
    
    // UI behavior consistency: match EditProfileModal
    setSaved(true);
    HapticPatterns.success();
    Animated.sequence([
      Animated.timing(successScale, { toValue: 1.05, duration: 150, useNativeDriver: true }),
      Animated.timing(successScale, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start();

    setTimeout(() => {
      onClose();
    }, 1500);
  };

  const getRecipientSummary = () => {
    if (isMentor && assignedClasses.length > 0) {
        return `${assignedClasses[0].name || assignedClasses[0].subject} Students`;
    }
    if (isTeacher && selectedCompId) {
        const cls = assignedClasses.find(c => `${c.class_id}::${c.section || 'A'}` === selectedCompId);
        return `${cls?.name || cls?.subject || 'Class'} Students (Sec ${cls?.section || 'A'})`;
    }
    if (audience === 'ALL') return 'Entire Institution';
    if (audience === 'STUDENT') return 'All Students';
    if (audience === 'STAFF') return 'Faculty & Staff';
    return 'Undetermined Recipient';
  };

  return (
    <ModalShell
      visible={visible}
      onClose={onClose}
      title="Send Notice"
      subtitle={isTeacherOrMentor ? "Class Announcement" : "School Bulletin"}
      headerGradient={AppTheme.colors.gradients.brand}
    >
      <View className="pb-8 pt-2">
        {error && (
          <View className="bg-rose-50 p-4 rounded-2xl border border-rose-100 mb-6">
            <Text className="text-rose-600 text-[10px] font-inter-bold uppercase tracking-[1px]">{error}</Text>
          </View>
        )}

        <Reanimated.View entering={FadeInDown.delay(100).springify().damping(SPRING_CONFIG.damping)}>
          <FloatingInput
            label="Notice Title"
            value={title}
            onChangeText={setTitle}
            icon={<Icons.Notifications size={18} />}
            maxLength={100}
            error={errors.title}
          />
        </Reanimated.View>

        <Reanimated.View entering={FadeInDown.delay(200).springify().damping(SPRING_CONFIG.damping)}>
          <FloatingInput 
            label="Message Content"
            value={message}
            onChangeText={setMessage}
            multiline
            style={{ minHeight: 120 }}
            error={errors.message}
          />
        </Reanimated.View>

        {!isMentor && (
          <View className="mb-6">
            <Text className="text-[10px] font-inter-bold text-gray-400 uppercase tracking-[0.5px] mb-3 px-1">Send To</Text>
            <View className="flex-row gap-2">
              {(isTeacher ? [
                { key: 'STUDENT', label: 'My Class', sub: 'Class Only' }
              ] : [
                { key: 'ALL', label: 'Everyone', sub: 'Broadcast' },
                { key: 'STUDENT', label: 'Students', sub: 'Learners' },
                { key: 'STAFF', label: 'Teachers', sub: 'Staff' }
              ]).map((aud) => (
                <TouchableOpacity 
                  key={aud.key}
                  onPress={() => setAudience(aud.key as any)}
                  className={`p-3 rounded-2xl border-2 flex-1 items-center ${audience === aud.key ? 'bg-white border-indigo-500 shadow-xl shadow-indigo-100/50' : 'bg-gray-50/30 border-transparent shadow-sm'}`}
                >
                  <Text className={`font-inter-black text-[10px] tracking-[0.5px] uppercase ${audience === aud.key ? 'text-indigo-600' : 'text-gray-500'}`}>{aud.label}</Text>
                  <Text className={`text-[8px] font-inter-bold mt-1 uppercase tracking-[0.5px] ${audience === aud.key ? 'text-indigo-400' : 'text-gray-400'}`}>{aud.sub}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {isTeacher && assignedClasses.length > 0 && (
          <Reanimated.View entering={FadeInDown.delay(400).springify().damping(SPRING_CONFIG.damping)} className="mb-6">
            <Text className="text-[10px] font-inter-bold text-gray-400 uppercase tracking-[0.5px] mb-3 px-1">Select Class</Text>
            <View className="flex-row flex-wrap gap-2">
              {assignedClasses.map((cls) => {
                const compId = `${cls.class_id}::${cls.section || 'A'}`;
                const isSelected = selectedCompId === compId;
                return (
                  <TouchableOpacity 
                    key={compId}
                    onPress={() => { triggerHaptic(); setSelectedCompId(compId); }}
                    activeOpacity={0.75}
                    className={`px-5 py-3 rounded-2xl border-2 ${isSelected ? 'bg-white border-indigo-500 shadow-xl shadow-indigo-100/50' : 'bg-gray-50/30 border-transparent shadow-sm'}`}
                  >
                    <Text className={`font-inter-black text-[11px] uppercase tracking-[0.5px] ${isSelected ? 'text-indigo-600' : 'text-gray-500'}`}>
                      {cls.name || cls.subject}
                    </Text>
                    <Text className={`text-[8px] font-inter-bold uppercase tracking-[0.5px] mt-0.5 ${isSelected ? 'text-indigo-400' : 'text-gray-400'}`}>
                      Sec {cls.section || 'A'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Reanimated.View>
        )}

        {isMentor && assignedClasses.length > 0 && (
          <View className="mb-6">
            <View className="bg-white border border-gray-100 rounded-2xl p-4 flex-row items-center shadow-sm">
              <View className="w-10 h-10 rounded-xl bg-indigo-50 items-center justify-center mr-4 border border-indigo-100">
                <Icons.Users size={20} color="#4f46e5" />
              </View>
              <View className="flex-1">
                <Text className="text-[8px] font-inter-bold text-indigo-400 uppercase tracking-[1px] mb-0.5">Assigned Segment</Text>
                <Text className="font-inter-bold text-gray-900 text-[14px]">
                  {assignedClasses[0].name || assignedClasses[0].subject} - {assignedClasses[0].section || 'A'}
                </Text>
              </View>
            </View>
          </View>
        )}

        <View className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100/50 mb-8 flex-row items-center">
            <View className="w-8 h-8 bg-white rounded-full items-center justify-center mr-3 border border-indigo-100 shadow-sm">
                <Icons.Globe size={16} color="#4f46e5" />
            </View>
            <View className="flex-1">
                <Text className="text-[8px] font-inter-bold text-gray-400 uppercase tracking-[0.5px] mb-0.5">Recipient</Text>
                <Text className="text-indigo-900 font-inter-bold text-[11px]" numberOfLines={1}>
                    {getRecipientSummary()}
                </Text>
            </View>
        </View>

        <Animated.View style={{ transform: [{ scale: successScale }] }}>
          <Pressable
            onPress={handlePost}
            disabled={isSubmitDisabled || loading || saved}
            style={({ pressed }) => ({
              opacity: (isSubmitDisabled || loading || saved) ? 0.5 : pressed ? 0.92 : 1,
              transform: [{ scale: (pressed || (!isSubmitDisabled && !loading && !saved)) ? 1.05 : 1 }],
            })}
            className={`h-[56px] rounded-2xl items-center justify-center flex-row ${
              saved ? 'bg-emerald-500' : 'bg-indigo-600 shadow-xl shadow-indigo-100'
            }`}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                {!saved && <Icons.Notifications size={18} color="white" className="mr-2" />}
                <Text className="text-white text-[13px] font-inter-black tracking-[0.5px] uppercase ml-2">
                  {saved ? 'Successfully Sent' : 'Send Announcement'}
                </Text>
              </>
            )}
          </Pressable>
        </Animated.View>

        {!saved && !loading && (
          <TouchableOpacity 
            onPress={onClose}
            className="py-2 items-center mt-3"
          >
            <Text className="text-[10px] font-inter-bold text-rose-400 uppercase tracking-[0.5px]">Discard Notice</Text>
          </TouchableOpacity>
        )}
      </View>
    </ModalShell>
  );
};
