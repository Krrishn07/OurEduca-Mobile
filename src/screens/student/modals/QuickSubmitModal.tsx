import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform, Image, Alert } from 'react-native';
import { Icons } from '@components/common/Icons';
import { ModalShell, AppCard, AppButton, StatusPill } from '@components/common';
import * as ImagePicker from 'expo-image-picker';

interface QuickSubmitModalProps {
  visible: boolean;
  onClose: () => void;
  assignments: any[];
  submissions: any[];
  initialAssignmentId?: string | null;
  uploadFile?: (schoolId: string, fileUri: string, fileName: string, mimeType?: string) => Promise<string>;
  onSubmit: (submission: any) => Promise<void>;
}

export const QuickSubmitModal: React.FC<QuickSubmitModalProps> = ({
  visible,
  onClose,
  assignments,
  submissions,
  initialAssignmentId,
  uploadFile,
  onSubmit
}) => {
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [submissionContent, setSubmissionContent] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (visible && initialAssignmentId) {
      const found = assignments.find(a => a.id === initialAssignmentId);
      if (found) setSelectedAssignment(found);
    }
  }, [visible, initialAssignmentId, assignments]);

  const pendingAssignments = assignments.filter(a => 
    !submissions.some(s => s.assignment_id === a.id)
  );

  const handleReset = () => {
    setSelectedAssignment(null);
    setSubmissionContent('');
    setSelectedImage(null);
    setIsSubmitting(false);
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need camera roll permissions to upload your work.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need camera permissions to take a photo of your work.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleLocalSubmit = async () => {
    if (!selectedAssignment) return;
    if (!submissionContent.trim() && !selectedImage) {
        Alert.alert("Empty Submission", "Please provide either a text response or a photo of your work.");
        return;
    }
    
    setIsSubmitting(true);
    try {
      let finalUrl = '';
      let type: 'TEXT' | 'IMAGE' | 'LINK' = 'TEXT';

      if (selectedImage && uploadFile) {
        const fileName = `submission_${Date.now()}.jpg`;
        finalUrl = await uploadFile(selectedAssignment.school_id, selectedImage, fileName, 'image/jpeg');
        type = 'IMAGE';
      }

      await onSubmit({
        assignment_id: selectedAssignment.id,
        content: submissionContent || 'Handwritten Work Submitted',
        content_url: finalUrl || null,
        content_type: type
      });
      handleReset();
      onClose();
      Alert.alert("Success", "Task submitted successfully!");
    } catch (error: any) {
      console.error('Quick Submit Error:', error);
      Alert.alert("Error", error.message || "Failed to submit task.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalShell
      visible={visible}
      onClose={() => { handleReset(); onClose(); }}
      title="Quick Submit Hub"
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {!selectedAssignment ? (
          <View className="p-4 flex-1">
            <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 font-inter-black">Select Pending Assignment</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {pendingAssignments.length > 0 ? (
                pendingAssignments.map((a, idx) => (
                  <TouchableOpacity 
                    key={a.id || idx}
                    onPress={() => setSelectedAssignment(a)}
                    className="mb-3 bg-gray-50 p-4 rounded-2xl border border-gray-100 active:bg-indigo-50 active:border-indigo-100"
                  >
                    <View className="flex-row justify-between items-center mb-1">
                      <Text className="text-sm font-black text-gray-900 font-inter-black flex-1 mr-2">{a.title}</Text>
                      <StatusPill status="PENDING" label="PENDING" />
                    </View>
                    <Text className="text-[10px] text-gray-500 font-inter-medium">{a.subject || 'Academic'} • Due: {a.due_date ? new Date(a.due_date).toLocaleDateString() : 'N/A'}</Text>
                  </TouchableOpacity>
                ))
              ) : (
                <View className="py-10 items-center">
                  <Icons.Check size={40} color="#10b981" />
                  <Text className="text-gray-400 text-xs font-inter-bold mt-4">All assignments submitted!</Text>
                </View>
              )}
            </ScrollView>
          </View>
        ) : (
          <ScrollView className="p-4 flex-1" showsVerticalScrollIndicator={false}>
            <TouchableOpacity 
              onPress={() => setSelectedAssignment(null)}
              className="flex-row items-center mb-4"
            >
              <Icons.ChevronRight size={14} color="#6366f1" style={{ transform: [{ rotate: '180deg' }] }} />
              <Text className="text-indigo-600 font-inter-black text-[10px] uppercase tracking-widest ml-1">Back to list</Text>
            </TouchableOpacity>

            <AppCard className="p-4 bg-indigo-50/50 border-indigo-100 mb-6">
              <Text className="text-xs font-black text-indigo-900 font-inter-black mb-1">{selectedAssignment.title}</Text>
              <Text className="text-[10px] text-indigo-700/70 font-inter-medium">{selectedAssignment.subject}</Text>
            </AppCard>

            {/* Submission Type Toggle/Buttons */}
            <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 font-inter-black">Attach Handwritten Work</Text>
            <View className="flex-row gap-3 mb-6">
                <TouchableOpacity 
                    onPress={takePhoto}
                    className="flex-1 bg-white p-4 rounded-2xl border border-gray-100 items-center shadow-sm"
                >
                    <Icons.Camera size={20} color="#6366f1" />
                    <Text className="text-[9px] font-black text-indigo-600 uppercase tracking-widest mt-2 font-inter-black">Take Photo</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    onPress={pickImage}
                    className="flex-1 bg-white p-4 rounded-2xl border border-gray-100 items-center shadow-sm"
                >
                    <Icons.Plus size={20} color="#6366f1" />
                    <Text className="text-[9px] font-black text-indigo-600 uppercase tracking-widest mt-2 font-inter-black">Upload Gallery</Text>
                </TouchableOpacity>
            </View>

            {selectedImage && (
                <View className="mb-6 relative">
                    <Image source={{ uri: selectedImage }} className="w-full h-48 rounded-2xl bg-gray-100" />
                    <TouchableOpacity 
                        onPress={() => setSelectedImage(null)}
                        className="absolute top-2 right-2 bg-black/50 p-2 rounded-full"
                    >
                        <Icons.Plus size={16} color="white" style={{ transform: [{ rotate: '45deg' }] }} />
                    </TouchableOpacity>
                </View>
            )}

            <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 font-inter-black">Optional Comments / Answer</Text>
            <TextInput
              multiline
              numberOfLines={4}
              placeholder="Type your notes or additional info here..."
              className="bg-gray-50 p-4 rounded-2xl border border-gray-200 text-gray-900 font-inter-medium min-h-[100px]"
              style={{ textAlignVertical: 'top' }}
              value={submissionContent}
              onChangeText={setSubmissionContent}
            />

            <View className="mt-8 mb-10">
              <AppButton 
                title={isSubmitting ? "Uploading work..." : "Submit Task Now"}
                onPress={handleLocalSubmit}
                loading={isSubmitting}
                disabled={isSubmitting || (!submissionContent.trim() && !selectedImage)}
              />
            </View>
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </ModalShell>
  );
};
