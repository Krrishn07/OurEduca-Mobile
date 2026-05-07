import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { AppTheme, ModalShell, AppButton, AppTypography } from '../../../design-system';

interface VideoUploadModalProps {
  visible: boolean;
  onClose: () => void;
  onUpload: (data: { title: string; privacy: 'PUBLIC' | 'PRIVATE' }) => void;
  isUploading: boolean;
}

export const VideoUploadModal: React.FC<VideoUploadModalProps> = ({
  visible,
  onClose,
  isUploading,
  onUpload,
}) => {
  const [title, setTitle] = React.useState('');
  const [privacy, setPrivacy] = React.useState<'PUBLIC' | 'PRIVATE'>('PUBLIC');

  // Reset state on open
  React.useEffect(() => {
    if (visible) {
      setTitle('');
      setPrivacy('PUBLIC');
    }
  }, [visible]);

  const handleUpload = () => {
    if (title.trim()) {
      onUpload({ title: title.trim(), privacy });
    }
  };
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
            value={title} 
            onChangeText={setTitle} 
            placeholder="e.g. Calculus Lecture 1"
            placeholderTextColor="#9ca3af"
            className="w-full border border-gray-100 bg-white rounded-2xl p-4 text-sm font-black text-gray-900 h-14 shadow-sm" 
          />
        </View>

        <View>
          <Text className={`${AppTypography.eyebrow} text-gray-400 mb-2 ml-1`}>Visibility</Text>
          <View className="flex-row gap-3">
            <TouchableOpacity 
              onPress={() => setPrivacy('PUBLIC')} 
              activeOpacity={0.7}
              className={`flex-1 p-4 rounded-2xl border-2 flex-row items-center justify-center ${privacy === 'PUBLIC' ? 'bg-indigo-50 border-indigo-600' : 'bg-white border-gray-100 shadow-sm'}`}
            >
              <Text className={`text-[11px] font-black uppercase tracking-[1px] ${privacy === 'PUBLIC' ? 'text-indigo-600' : 'text-gray-400'}`}>Public</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => setPrivacy('PRIVATE')} 
              activeOpacity={0.7}
              className={`flex-1 p-4 rounded-2xl border-2 flex-row items-center justify-center ${privacy === 'PRIVATE' ? 'bg-indigo-50 border-indigo-600' : 'bg-white border-gray-100 shadow-sm'}`}
            >
              <Text className={`text-[11px] font-black uppercase tracking-[1px] ${privacy === 'PRIVATE' ? 'text-indigo-600' : 'text-gray-400'}`}>Private</Text>
            </TouchableOpacity>
          </View>
        </View>

        <AppButton 
          label={isUploading ? 'Uploading Material...' : 'Share Video'}
          onPress={handleUpload}
          loading={isUploading}
          disabled={!title.trim()}
          className="py-5"
        />
      </View>
    </ModalShell>
  );
};
