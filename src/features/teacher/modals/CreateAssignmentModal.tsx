import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { Icons } from '../../../../components/Icons';
import { AppTheme, AppTypography, ModalShell, AppButton, AppRadius } from '../../../design-system';

interface CreateAssignmentModalProps {
  visible: boolean;
  onClose: () => void;
  onCreate: (assignment: { title: string; description: string; max_marks: number; class_id: string; due_date?: string }) => void;
  assignedSections: any[];
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

  // Reset state on modal open
  React.useEffect(() => {
    if (visible) {
      setCurrentStep(1);
      setTitle('');
      setDescription('');
      setMaxMarks('100');
      // If initialClassId is provided, find the corresponding roster entry
      if (initialClassId) {
          const match = assignedSections.find(r => r.class_id === initialClassId);
          setSelectedRosterId(match ? (match.id || match.rosterId) : null);
      } else {
          setSelectedRosterId(null);
      }
      setDueDate('');
    }
  }, [visible, initialClassId]);

  const handleNext = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const canSubmit = title.trim().length > 0 && selectedRosterId && maxMarks.length > 0;

  const handleSubmit = () => {
    const selectedRoster = assignedSections.find(r => (r.id || r.rosterId) === selectedRosterId);
    if (!selectedRoster || !selectedRoster.class_id) {
        console.error('[SUBMIT_ASSIGNMENT] Missing class_id in roster entry');
        return;
    }

    onCreate({
      title,
      description,
      max_marks: parseInt(maxMarks) || 100,
      class_id: selectedRoster.class_id,
      due_date: dueDate || undefined
    });
  };

  const selectedRoster = assignedSections.find(r => (r.id || r.rosterId) === selectedRosterId);

  return (
    <ModalShell
      visible={visible}
      onClose={onClose}
      title="Create Assignment"
      subtitle={`Step ${currentStep} of 3`}
    >
      {/* Progress Indicator */}
      <View className="flex-row items-center justify-center mb-8 gap-2">
          {[1, 2, 3].map(s => (
              <View 
                key={s} 
                className={`h-1.5 rounded-full ${currentStep === s ? 'w-8 bg-indigo-600' : 'w-4 bg-gray-200'}`} 
              />
          ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="max-h-[500px]">
        {currentStep === 1 && (
            <View>
                <Text className="text-[9px] font-bold text-indigo-400 uppercase tracking-[2px] mb-4 px-1 font-inter-bold">Target Academic Section</Text>
                <View className="flex-row flex-wrap gap-3 mb-6">
                    {assignedSections.map(r => {
                        const uniqueId = r.id || r.rosterId;
                        const isSelected = selectedRosterId === uniqueId;
                        return (
                            <TouchableOpacity 
                                key={uniqueId}
                                onPress={() => setSelectedRosterId(uniqueId)}
                                className={`px-5 py-4 rounded-2xl border ${isSelected ? 'bg-indigo-600 border-indigo-600 shadow-xl shadow-indigo-200' : 'bg-white border-gray-100 shadow-sm'}`}
                            >
                                <Text className={`text-[11px] font-bold uppercase tracking-wider font-inter-bold ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                                    {r.name || 'Class'}
                                </Text>
                                <Text className={`text-[8px] font-semibold uppercase tracking-[2px] mt-1 font-inter-semibold ${isSelected ? 'text-white/70' : 'text-indigo-400'}`}>
                                    {r.subject || 'Academic'} • Sec {r.section || 'A'}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>
        )}

        {currentStep === 2 && (
            <View>
                <View className="mb-6">
                    <Text className="text-[9px] font-bold text-indigo-400 uppercase tracking-[2px] mb-2.5 px-1 font-inter-bold">Assignment Title</Text>
                    <View className="bg-gray-50 border border-gray-100 rounded-[24px] px-6 py-5 shadow-inner">
                        <TextInput 
                            placeholder="e.g. Calculus Midterm Project" 
                            value={title}
                            onChangeText={setTitle}
                            className="text-gray-900 font-bold text-[14px] font-inter-bold p-0"
                            placeholderTextColor="#94a3b8"
                        />
                    </View>
                </View>

                <View className="mb-6">
                    <Text className="text-[9px] font-bold text-indigo-400 uppercase tracking-[2px] mb-2.5 px-1 font-inter-bold">Instruction / Description</Text>
                    <View className="bg-gray-50 border border-gray-100 rounded-[28px] px-6 py-5 shadow-inner">
                        <TextInput 
                            placeholder="Provide details about the assignment..." 
                            value={description}
                            onChangeText={setDescription}
                            multiline
                            numberOfLines={4}
                            className="text-gray-900 font-medium text-[13px] font-inter-medium p-0 min-h-[100px]"
                            placeholderTextColor="#94a3b8"
                            textAlignVertical="top"
                        />
                    </View>
                </View>
            </View>
        )}

        {currentStep === 3 && (
            <View>
                <View className="flex-row gap-4 mb-8">
                    <View className="flex-1">
                        <Text className="text-[9px] font-bold text-indigo-400 uppercase tracking-[2px] mb-2.5 px-1 font-inter-bold">Max Marks</Text>
                        <View className="bg-gray-50 border border-gray-100 rounded-[24px] px-6 py-5 shadow-inner">
                            <TextInput 
                                placeholder="100" 
                                value={maxMarks}
                                onChangeText={setMaxMarks}
                                keyboardType="numeric"
                                className="text-gray-900 font-bold text-[14px] font-inter-bold p-0"
                                placeholderTextColor="#94a3b8"
                            />
                        </View>
                    </View>
                    <View className="flex-1">
                        <Text className="text-[9px] font-bold text-indigo-400 uppercase tracking-[2px] mb-2.5 px-1 font-inter-bold">Due Date (Optional)</Text>
                        <View className="bg-gray-50 border border-gray-100 rounded-[24px] px-6 py-5 shadow-inner">
                            <TextInput 
                                placeholder="YYYY-MM-DD" 
                                value={dueDate}
                                onChangeText={setDueDate}
                                className="text-gray-900 font-bold text-[14px] font-inter-bold p-0"
                                placeholderTextColor="#94a3b8"
                            />
                        </View>
                    </View>
                </View>

                <Text className="text-[9px] font-bold text-indigo-400 uppercase tracking-[2px] mb-4 px-1 font-inter-bold">Review Summary</Text>
                <View className="bg-white p-6 rounded-[32px] border border-gray-50 shadow-2xl shadow-indigo-100/40 mb-6">
                    <View className="flex-row items-center mb-6">
                        <View className="w-14 h-14 bg-indigo-50 rounded-2xl items-center justify-center mr-4 border border-indigo-100/50">
                            <Icons.FileText size={24} color="#4f46e5" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-gray-900 font-bold text-lg tracking-tight font-inter-bold" numberOfLines={1}>{title || 'Untitled Assignment'}</Text>
                            <Text className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest font-inter-bold">{selectedRoster?.displayName || 'No Class Selected'}</Text>
                        </View>
                    </View>
                    
                    <View className="pt-6 border-t border-gray-50">
                        <View className="flex-row justify-between mb-3">
                            <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-inter-bold">Weightage</Text>
                            <Text className="text-[10px] font-bold text-gray-900 font-inter-bold">{maxMarks} Marks</Text>
                        </View>
                        <View className="flex-row justify-between">
                            <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-inter-bold">Target Students</Text>
                            <Text className="text-[10px] font-bold text-indigo-600 italic font-inter-bold">Full Roster Transmission</Text>
                        </View>
                    </View>
                </View>
            </View>
        )}
      </ScrollView>

      <View className="mt-4 gap-4">
          {currentStep < 3 ? (
              <AppButton 
                label="Continue Discovery"
                onPress={handleNext}
                disabled={currentStep === 1 ? !selectedRosterId : !title.trim()}
                className="py-5"
              />
          ) : (
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={!canSubmit || isCreating}
                activeOpacity={0.9}
                className={`py-5 rounded-2xl shadow-xl border items-center justify-center mb-4 ${
                  !canSubmit || isCreating ? "bg-indigo-300 border-indigo-200" : "bg-indigo-600 border-indigo-500"
                }`}
              >
                <Text className="text-white font-bold uppercase tracking-[3px] text-[11px] font-inter-bold">
                  {isCreating ? "Deploying Assignment..." : "Broadcast Assignment"}
                </Text>
              </TouchableOpacity>
          )}

          {currentStep > 1 && !isCreating && (
              <TouchableOpacity 
                onPress={handleBack}
                className="py-4 items-center"
              >
                  <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-inter-bold">Return to previous node</Text>
              </TouchableOpacity>
          )}

          {currentStep === 1 && (
               <TouchableOpacity 
               onPress={onClose}
               className="py-4 items-center"
             >
                 <Text className="text-[10px] font-bold text-rose-400 uppercase tracking-widest font-inter-bold">Abort Creation</Text>
             </TouchableOpacity>
          )}
      </View>
    </ModalShell>
  );
};
