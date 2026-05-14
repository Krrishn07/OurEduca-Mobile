import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert, Animated, Pressable, ActivityIndicator } from 'react-native';
import Reanimated, { FadeInDown } from 'react-native-reanimated';
import { Icons } from '@components/common/Icons';
import { AppTheme, ModalShell, FloatingInput } from '@components/common';
import { RosterSection } from '@/types';
import { triggerHaptic, HapticPatterns } from '@utils/haptics';
import { SPRING_CONFIG } from '@constants/motion';

interface CreateAssignmentModalProps {
  visible: boolean;
  onClose: () => void;
  onCreate: (assignment: { title: string; description: string; max_marks: number; class_id: string; due_date?: string }) => void;
  assignedSections: RosterSection[];
  isCreating?: boolean;
  initialClassId?: string | null;
}

export const CreateAssignmentModal: React.FC<CreateAssignmentModalProps> = ({
  visible,
  onClose,
  onCreate,
  assignedSections = [],
  isCreating = false,
  initialClassId = null
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [maxMarks, setMaxMarks] = useState('100');
  const [selectedRosterId, setSelectedRosterId] = useState<string | null>(null);
  const [dueDate, setDueDate] = useState('');
  const [saved, setSaved] = useState(false);
  const successScale = useRef(new Animated.Value(1)).current;

  const resetForm = useCallback(() => {
    setCurrentStep(1);
    setTitle('');
    setDescription('');
    setMaxMarks('100');
    setDueDate('');
    setSaved(false);
    if (initialClassId) {
        const match = assignedSections.find(r => r.class_id === initialClassId);
        setSelectedRosterId(match ? (match.id || match.rosterId) : null);
    } else {
        setSelectedRosterId(null);
    }
  }, [initialClassId, assignedSections]);

  // Reset state on modal open
  useEffect(() => {
    if (visible) resetForm();
  }, [visible, resetForm]);

  const handleNext = () => {
    if (currentStep === 1 && !selectedRosterId) return;
    if (currentStep === 2 && !title.trim()) return;
    triggerHaptic();
    if (currentStep < 3) setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    triggerHaptic();
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const parsedMarks = parseInt(maxMarks);
  const isMarksValid = !isNaN(parsedMarks) && parsedMarks > 0 && parsedMarks <= 1000;
  const isDateValid = dueDate === '' || /^(0[1-9]|[12]\d|3[01])-(0[1-9]|1[0-2])-\d{4}$/.test(dueDate);

  const canSubmit = title.trim().length > 0 && selectedRosterId && isMarksValid && isDateValid;

  const isDirty = title.trim() !== '' || description.trim() !== '' || (dueDate !== '');

  const handleClose = () => {
    if (isDirty && !isCreating && !saved) {
      Alert.alert(
        'Discard Assignment?',
        'Progress will be lost if you cancel now.',
        [
          { text: 'Keep Editing', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: onClose },
        ]
      );
    } else {
      onClose();
    }
  };

  const handleSubmit = () => {
    const selectedRoster = assignedSections.find((r, idx) => (r.rosterId || r.id || `${r.class_id}-${r.section}-${idx}`).toString() === selectedRosterId);
    if (!selectedRoster || !selectedRoster.class_id) return;

    if (!canSubmit) {
      triggerHaptic();
      return;
    }

    triggerHaptic();
    onCreate({
      title: title.trim(),
      description: description.trim(),
      max_marks: parsedMarks,
      class_id: selectedRoster.class_id,
      due_date: dueDate || undefined
    });
    
    setSaved(true);
    HapticPatterns.success();
    Animated.sequence([
      Animated.timing(successScale, { toValue: 1.05, duration: 150, useNativeDriver: true }),
      Animated.timing(successScale, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start();
    
    setTimeout(() => onClose(), 1500);
  };

  const selectedRoster = assignedSections.find((r, idx) => (r.rosterId || r.id || `${r.class_id}-${r.section}-${idx}`).toString() === selectedRosterId);

  return (
    <ModalShell
      visible={visible}
      onClose={handleClose}
      title="Create Assignment"
      subtitle={`Step ${currentStep} of 3`}
      headerGradient={AppTheme.colors.gradients.brand}
    >
      <View className="pb-8 pt-2">
        {/* Progress Indicator */}
        <View className="flex-row items-center justify-center mb-6 gap-1.5">
            {[1, 2, 3].map(s => (
                <View 
                  key={s} 
                  className={`h-[3px] rounded-full ${
                    currentStep === s 
                      ? 'w-6 bg-indigo-600' 
                      : s < currentStep 
                        ? 'w-2 bg-emerald-500' 
                        : 'w-2 bg-gray-200'
                  }`} 
                />
            ))}
        </View>

        <View className="min-h-[280px]">
          {currentStep === 1 && (
                  <Reanimated.View entering={FadeInDown.delay(100).springify().damping(SPRING_CONFIG.damping)}>
                    <Text className="text-[10px] font-inter-bold text-gray-400 uppercase tracking-[0.5px] mb-3 px-1">Select Class</Text>
                    <View className="flex-row flex-wrap gap-2 mb-6">
                        {assignedSections.map((r, idx) => {
                            // PRIORITIZE rosterId (unique to entry) over id (which might be class ID)
                            const uniqueId = (r.rosterId || r.id || `${r.class_id}-${r.section}-${idx}`).toString();
                            const isSelected = selectedRosterId === uniqueId;
                            return (
                                <TouchableOpacity 
                                    key={`section-${uniqueId}-${idx}`}
                                    onPress={() => setSelectedRosterId(uniqueId)}
                                    activeOpacity={0.75}
                                    className={`px-5 py-3 rounded-2xl border-2 ${isSelected ? 'bg-white border-indigo-500 shadow-xl shadow-indigo-100/50' : 'bg-gray-50/30 border-transparent shadow-sm'}`}
                                >
                                    <Text className={`text-[11px] font-inter-black uppercase tracking-[0.5px] ${isSelected ? 'text-indigo-600' : 'text-gray-500'}`}>
                                        {r.name || (r as any).classes?.name || 'Class'}
                                    </Text>
                                    <Text className={`text-[8px] font-inter-bold uppercase tracking-[0.5px] mt-0.5 ${isSelected ? 'text-indigo-400' : 'text-gray-400'}`}>
                                        {r.subject || 'Academic'} • Sec {r.section || 'A'}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                  </Reanimated.View>
          )}

          {currentStep === 2 && (
              <View>
                  <Reanimated.View entering={FadeInDown.delay(100).springify().damping(SPRING_CONFIG.damping)}>
                    <FloatingInput
                      label="Assignment Title"
                      value={title}
                      onChangeText={setTitle}
                      icon={<Icons.FileText size={18} />}
                      autoFocus={true}
                    />
                  </Reanimated.View>

                  <Reanimated.View entering={FadeInDown.delay(200).springify().damping(SPRING_CONFIG.damping)}>
                    <FloatingInput 
                      label="Instruction / Description"
                      value={description}
                      onChangeText={setDescription}
                      multiline
                      style={{ minHeight: 120 }}
                    />
                  </Reanimated.View>
              </View>
          )}

          {currentStep === 3 && (
              <View>
                  <Reanimated.View entering={FadeInDown.delay(100).springify().damping(SPRING_CONFIG.damping)} className="flex-row gap-3 mb-6">
                      <View className="flex-1">
                          <FloatingInput
                            label="Max Marks"
                            value={maxMarks}
                            onChangeText={setMaxMarks}
                            keyboardType="numeric"
                            error={!isMarksValid && maxMarks.length > 0 ? "1-1000" : null}
                          />
                      </View>
                      <View className="flex-1">
                          <FloatingInput
                            label="Due Date (DD-MM-YYYY)"
                            value={dueDate}
                            onChangeText={setDueDate}
                            placeholder="31-12-2026"
                            error={!isDateValid && dueDate.length > 0 ? "Format Error" : null}
                          />
                      </View>
                  </Reanimated.View>

                  <Text className="text-[10px] font-inter-bold text-gray-400 uppercase tracking-[0.5px] mb-3 px-1">Assignment Summary</Text>
                  <View className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm mb-6">
                      <View className="flex-row items-center mb-4 pb-4 border-b border-gray-50">
                          <View className="w-10 h-10 bg-indigo-50 rounded-xl items-center justify-center mr-3 border border-indigo-100">
                              <Icons.FileText size={20} color="#4f46e5" />
                          </View>
                          <View className="flex-1">
                              <Text className="text-gray-900 font-inter-bold text-[15px] tracking-tight" numberOfLines={1}>{title || 'Untitled'}</Text>
                              <Text className="text-[9px] font-inter-bold text-indigo-500 uppercase tracking-[0.5px]">
                                  {selectedRoster 
                                      ? `${selectedRoster.name} • ${selectedRoster.subject} • Sec ${selectedRoster.section || 'A'}`
                                      : 'No Class'
                                  }
                              </Text>
                          </View>
                      </View>
                      
                      <View className="flex-row justify-between mb-2">
                          <Text className="text-[9px] font-inter-bold text-gray-400 uppercase tracking-[0.5px]">Weightage</Text>
                          <Text className="text-[9px] font-inter-bold text-gray-900">{maxMarks} Marks</Text>
                      </View>
                      <View className="flex-row justify-between">
                          <Text className="text-[9px] font-inter-bold text-gray-400 uppercase tracking-[0.5px]">Target Students</Text>
                          <Text className="text-[9px] font-inter-medium text-indigo-600">Full Class Roster</Text>
                      </View>
                  </View>
              </View>
          )}
        </View>

        <View className="mt-2 gap-3">
            {currentStep < 3 ? (
                <Pressable
                  onPress={handleNext}
                  style={({ pressed }) => ({
                    opacity: (currentStep === 1 ? !selectedRosterId : !title.trim()) ? 0.7 : pressed ? 0.92 : 1,
                    transform: [{ scale: (pressed || (currentStep === 1 ? !!selectedRosterId : !!title.trim())) ? 1.05 : 1 }],
                  })}
                  className="h-[56px] bg-indigo-600 rounded-2xl items-center justify-center shadow-lg shadow-indigo-100"
                >
                  <Text className="text-white text-[13px] font-inter-black tracking-[0.5px] uppercase">Continue</Text>
                </Pressable>
            ) : (
                <Animated.View style={{ transform: [{ scale: successScale }] }}>
                  <Pressable
                    onPress={handleSubmit}
                    disabled={isCreating || saved}
                    style={({ pressed }) => ({
                      opacity: (isCreating || saved) ? 0.8 : pressed ? 0.92 : 1,
                      transform: [{ scale: (pressed || (!isCreating && !saved)) ? 1.05 : 1 }],
                    })}
                    className={`h-[56px] rounded-2xl items-center justify-center flex-row ${
                      saved ? 'bg-emerald-500' : 'bg-indigo-600 shadow-xl shadow-indigo-100'
                    }`}
                  >
                    {isCreating ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <>
                        {!saved && <Icons.Send size={18} color="white" className="mr-2" />}
                        <Text className="text-white text-[13px] font-inter-black tracking-[0.5px] uppercase ml-2">
                          {saved ? 'Successfully Created' : 'Create Assignment'}
                        </Text>
                      </>
                    )}
                  </Pressable>
                </Animated.View>
            )}
            {currentStep > 1 && !isCreating && !saved && (
                <TouchableOpacity 
                  onPress={handleBack}
                  className="py-2 items-center"
                >
                    <Text className="text-[10px] font-inter-bold text-gray-400 uppercase tracking-[0.5px]">Back to previous</Text>
                </TouchableOpacity>
            )}

            {currentStep === 1 && !saved && (
                 <TouchableOpacity 
                 onPress={handleClose}
                 className="py-2 items-center"
               >
                   <Text className="text-[10px] font-inter-bold text-rose-400 uppercase tracking-[0.5px]">Discard Assignment</Text>
               </TouchableOpacity>
            )}
        </View>
      </View>
    </ModalShell>
  );
};
