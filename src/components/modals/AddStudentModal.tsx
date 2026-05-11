import React from 'react';
import { View, Text, ActivityIndicator, Pressable, Animated, TouchableOpacity } from 'react-native';
import Reanimated, { FadeInDown } from 'react-native-reanimated';
import { Icons } from '@components/common/Icons';
import { ModalShell, FloatingInput, AppTheme } from '@components/common';
import { triggerHaptic, HapticPatterns } from '@utils/haptics';
import { SPRING_CONFIG } from '@constants/motion';

interface AddStudentModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (data: { name: string; email: string }) => void;
  error?: string | null;
  loading?: boolean;
  status?: string | null;
}

export const AddStudentModal: React.FC<AddStudentModalProps> = ({
  visible,
  onClose,
  onAdd,
  error,
  loading,
  status
}) => {
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [saved, setSaved] = React.useState(false);
  const successScale = React.useRef(new Animated.Value(1)).current;

  // Reset local state when modal opens to ensure fresh entry
  React.useEffect(() => {
    if (visible) {
      setName('');
      setEmail('');
      setSaved(false);
    }
  }, [visible]);

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((email || '').trim());
  const canSave = name.trim().length > 0 && isEmailValid;

  const handleAdd = async () => {
    if (!canSave || loading || saved) return;
    
    triggerHaptic();
    onAdd({ name, email });
    
    // We don't have a direct "success" callback here like EditProfile, 
    // but we can monitor the 'loading' prop transitioning from true -> false if needed.
    // For now, let's just match the UI.
  };

  return (
    <ModalShell
      visible={visible}
      onClose={onClose}
      title="Add Student"
      subtitle="Classroom Roster Entry"
      headerGradient={AppTheme.colors.gradients.brand}
    >
      <View className="pb-8 pt-2">
        {error ? (
          <Text className="text-red-500 text-sm mb-4 font-bold text-center">{error}</Text>
        ) : null}

        <Reanimated.View entering={FadeInDown.delay(100).springify().damping(SPRING_CONFIG.damping)}>
          <FloatingInput
            label="Student Name"
            value={name}
            onChangeText={setName}
            icon={<Icons.User size={18} />}
            autoFocus={true}
            maxLength={80}
          />
        </Reanimated.View>

        <Reanimated.View entering={FadeInDown.delay(200).springify().damping(SPRING_CONFIG.damping)}>
          <FloatingInput
            label="Student Email"
            value={email}
            onChangeText={setEmail}
            icon={<Icons.Mail size={18} />}
            keyboardType="email-address"
            autoCapitalize="none"
            maxLength={100}
            error={!isEmailValid && (email || '').trim().length > 0 ? "Enter a valid institutional email" : null}
          />
        </Reanimated.View>

        <View className="bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100/50 flex-row items-center mb-8 mt-2">
          <View className="w-10 h-10 bg-white rounded-full items-center justify-center mr-4 border border-indigo-100 shadow-sm">
            <Icons.School size={18} color="#4f46e5" />
          </View>
          <Text className="text-indigo-900 text-[11px] font-inter-bold leading-tight flex-1">
            New student will be added to your active class roster.
          </Text>
        </View>

        <Animated.View style={{ transform: [{ scale: successScale }] }} className="mt-2">
          <Pressable
            onPress={handleAdd}
            disabled={!canSave || loading || saved}
            style={({ pressed }) => ({
              opacity: (!canSave || loading || saved) ? 0.5 : pressed ? 0.92 : 1,
              transform: [{ scale: (pressed || (canSave && !loading && !saved)) ? 1.05 : 1 }],
            })}
            className={`h-[52px] rounded-2xl items-center justify-center flex-row ${
              saved ? 'bg-emerald-500' : 'bg-indigo-600'
            }`}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                {!saved && <Icons.Plus size={18} color="white" className="mr-2" />}
                <Text className="text-white text-[13px] font-inter-black tracking-[0.5px] uppercase ml-2">
                  {saved ? 'Successfully Added' : loading ? (status || "Adding...") : "Add Student"}
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
            <Text className="text-[10px] font-inter-bold text-rose-400 uppercase tracking-[0.5px]">Cancel Entry</Text>
          </TouchableOpacity>
        )}
      </View>
    </ModalShell>
  );
};
