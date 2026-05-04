import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { AppTheme, ModalShell, AppButton, AppTypography } from '../../../design-system';

interface VideoUploadModalProps {
  visible: boolean;
  onClose: () => void;
  videoUploadTitle: string;
  setVideoUploadTitle: (text: string) => void;
  videoPrivacy: 'PUBLIC' | 'PRIVATE';
  setVideoPrivacy: (privacy: 'PUBLIC' | 'PRIVATE') => void;
  isUploading: boolean;
  onUpload: () => void;
}

export const VideoUploadModal: React.FC<VideoUploadModalProps> = ({
  visible,
  onClose,
  videoUploadTitle,
  setVideoUploadTitle,
  videoPrivacy,
  setVideoPrivacy,
  isUploading,
  onUpload,
}) => {
  return (
    <ModalShell
      visible={visible}
      onClose={onClose}
      title="Upload Video"
      subtitle="Share content with your students"
      headerGradient={AppTheme.colors.gradients.brand}
    >
      <View className="gap-6">
        <View>
          <Text className={`${AppTypography.eyebrow} text-gray-400 mb-2 ml-1`}>Video Title</Text>
          <TextInput 
            value={videoUploadTitle} 
            onChangeText={setVideoUploadTitle} 
            placeholder="e.g. Calculus Lecture 1"
            placeholderTextColor="#9ca3af"
            className="w-full border border-gray-100 bg-white rounded-2xl p-4 text-sm font-black text-gray-900 h-14 shadow-sm" 
          />
        </View>

        <View>
          <Text className={`${AppTypography.eyebrow} text-gray-400 mb-2 ml-1`}>Visibility</Text>
          <View className="flex-row gap-3">
            <TouchableOpacity 
              onPress={() => setVideoPrivacy('PUBLIC')} 
              activeOpacity={0.7}
              className={`flex-1 p-4 rounded-2xl border-2 flex-row items-center justify-center ${videoPrivacy === 'PUBLIC' ? 'bg-indigo-50 border-indigo-600' : 'bg-white border-gray-100 shadow-sm'}`}
            >
              <Text className={`text-[11px] font-black uppercase tracking-widest ${videoPrivacy === 'PUBLIC' ? 'text-indigo-600' : 'text-gray-400'}`}>Public</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => setVideoPrivacy('PRIVATE')} 
              activeOpacity={0.7}
              className={`flex-1 p-4 rounded-2xl border-2 flex-row items-center justify-center ${videoPrivacy === 'PRIVATE' ? 'bg-indigo-50 border-indigo-600' : 'bg-white border-gray-100 shadow-sm'}`}
            >
              <Text className={`text-[11px] font-black uppercase tracking-widest ${videoPrivacy === 'PRIVATE' ? 'text-indigo-600' : 'text-gray-400'}`}>Private</Text>
            </TouchableOpacity>
          </View>
        </View>

        <AppButton 
          label={isUploading ? 'Uploading Material...' : 'Share Video'}
          onPress={onUpload}
          loading={isUploading}
          disabled={!videoUploadTitle.trim()}
          className="py-5"
        />
      </View>
    </ModalShell>
  );
};
