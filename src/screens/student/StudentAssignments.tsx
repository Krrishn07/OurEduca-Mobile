import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, TextInput, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Icons } from '@components/common/Icons';
import { AppTheme, AppCard, AppTypography, SectionHeader, StatusPill, ModalShell, PlatinumHeader, AppButton } from '@components/common';
import { Assignment, Submission } from '@context/SchoolDataContext';
import * as ImagePicker from 'expo-image-picker';

const StyledLinearGradient = LinearGradient || View;

interface StudentAssignmentsProps {
  assignments: Assignment[];
  submissions: Submission[];
  uploadFile?: (schoolId: string, fileUri: string, fileName: string, mimeType?: string) => Promise<string>;
  onSubmit: (submission: Partial<Submission>) => Promise<void>;
  isLoading?: boolean;
}

export const StudentAssignments: React.FC<StudentAssignmentsProps> = ({ 
  assignments = [], 
  submissions = [], 
  uploadFile,
  onSubmit,
  isLoading = false
}) => {
  const [isSubmitModalVisible, setIsSubmitModalVisible] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [submissionContent, setSubmissionContent] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getStatus = (assignmentId: string) => {
    const sub = submissions.find(s => s.assignment_id === assignmentId);
    if (!sub) return { label: 'Pending', type: 'warning' as const };
    if (sub.status === 'GRADED') return { label: 'Graded', type: 'success' as const };
    return { label: 'Submitted', type: 'info' as const };
  };

  const handleOpenSubmit = (assignment: Assignment) => {
    const existing = submissions.find(s => s.assignment_id === assignment.id);
    if (existing) {
      Alert.alert("Already Submitted", "You have already submitted this task.");
      return;
    }
    setSelectedAssignment(assignment);
    setIsSubmitModalVisible(true);
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

  const handleSubmitWork = async () => {
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
      setIsSubmitModalVisible(false);
      setSubmissionContent('');
      setSelectedImage(null);
      Alert.alert("Success", "Your work has been submitted successfully.");
    } catch (err: any) {
      Alert.alert("Submission Failed", err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-[#f5f7ff]">
      <PlatinumHeader 
        title="Task Hub"
        subtitle={`${assignments.length - submissions.length} Tasks Pending Submission`}
      />

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={AppTheme.colors.primary} />
        </View>
      ) : (
        <ScrollView 
          className="flex-1 mt-4 relative z-20"
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 4, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="gap-4">
            {assignments.length > 0 ? assignments.map((item, idx) => {
              const status = getStatus(item.id);
              return (
                <AppCard key={item.id || idx} className="p-4 border border-white shadow-xl shadow-indigo-100/30">
                  <View className="flex-row justify-between items-start mb-4">
                    <View className="flex-1 pr-4">
                      <Text className="text-lg font-black text-gray-900 tracking-tighter font-inter-black" numberOfLines={1}>
                        {item.title}
                      </Text>
                      <Text className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1 font-inter-black">
                        Due: {item.due_date ? new Date(item.due_date).toLocaleDateString() : 'No Deadline'}
                      </Text>
                    </View>
                    <View className="mt-1">
                      <StatusPill label={status.label} type={status.type} />
                    </View>
                  </View>

                  {item.description && (
                    <View className="bg-gray-50/80 p-3 rounded-2xl border border-gray-100 mb-4">
                      <Text className="text-[12px] text-gray-600 font-inter-medium leading-5">
                        {item.description}
                      </Text>
                    </View>
                  )}

                  <View className="flex-row items-center justify-between mt-2">
                    <View className="flex-row items-center">
                      <View className="bg-violet-50 px-3 py-1.5 rounded-full border border-violet-100">
                        <Text className="text-[10px] text-violet-600 font-black font-inter-black">Max Marks: {item.max_marks}</Text>
                      </View>
                    </View>
                    
                    <TouchableOpacity 
                      disabled={status.label !== 'Pending'}
                      onPress={() => handleOpenSubmit(item)}
                      className={`px-6 py-3 rounded-2xl items-center justify-center shadow-lg ${status.label === 'Pending' ? 'bg-violet-600 shadow-violet-100 active:scale-95' : 'bg-gray-100 shadow-none opacity-50'}`}
                    >
                      <Text className={`font-black uppercase tracking-widest text-[10px] font-inter-black ${status.label === 'Pending' ? 'text-white' : 'text-gray-400'}`}>
                        {status.label === 'Pending' ? 'Submit Work' : 'Submited'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </AppCard>
              );
            }) : (
              <View className="py-20 items-center">
                <View className="w-16 h-16 bg-white rounded-3xl items-center justify-center mb-6 border border-gray-100 shadow-xl shadow-indigo-100/50">
                  <Icons.Plus size={32} color="#e5e7eb" />
                </View>
                <Text className="text-[10px] font-black text-gray-400 uppercase tracking-[2px] font-inter-black text-center">No assignments assigned</Text>
              </View>
            )}
          </View>
        </ScrollView>
      )}

      {/* Submission Modal */}
      <ModalShell
        visible={isSubmitModalVisible}
        onClose={() => {
            setIsSubmitModalVisible(false);
            setSelectedImage(null);
        }}
        title="Submit Assignment"
      >
        <ScrollView className="p-4" showsVerticalScrollIndicator={false}>
          <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 font-inter-black">
            Submitting for: {selectedAssignment?.title}
          </Text>

          {/* Image Picker Section */}
          <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 font-inter-black">Handwritten Work / Photo</Text>
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
                    <Text className="text-[9px] font-black text-indigo-600 uppercase tracking-widest mt-2 font-inter-black">From Gallery</Text>
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

          <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 font-inter-black">Text Answer / Notes</Text>
          <View className="bg-gray-50 border border-gray-100 rounded-2xl p-4 mb-6">
            <TextInput
              multiline
              numberOfLines={4}
              placeholder="Enter your answer or notes here..."
              placeholderTextColor="#94a3b8"
              value={submissionContent}
              onChangeText={setSubmissionContent}
              textAlignVertical="top"
              className="text-gray-700 font-inter-medium text-[14px] min-h-[100px]"
            />
          </View>

          <AppButton 
            title={isSubmitting ? "Uploading..." : "Confirm Submission"}
            onPress={handleSubmitWork}
            loading={isSubmitting}
            disabled={isSubmitting || (!submissionContent.trim() && !selectedImage)}
          />
          <View className="h-10" />
        </ScrollView>
      </ModalShell>
    </View>
  );
};
