import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Pressable, Animated, TextInput } from 'react-native';
import Reanimated, { FadeInDown } from 'react-native-reanimated';
import { Icons } from '@components/common/Icons';
import { AppTheme, ModalShell, FloatingInput } from '@components/common';
import { triggerHaptic, HapticPatterns } from '@utils/haptics';
import { SPRING_CONFIG } from '@constants/motion';

interface VideoUploadModalProps {
  visible: boolean;
  onClose: () => void;
  onUpload: (data: { title: string; description: string; privacy: 'PUBLIC' | 'PRIVATE' }) => void;
  isUploading: boolean;
}

export const UploadVideoModal: React.FC<VideoUploadModalProps> = ({
  visible,
  onClose,
  isUploading,
  onUpload,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [privacy, setPrivacy] = useState<'PUBLIC' | 'PRIVATE'>('PUBLIC');
  const [saved, setSaved] = useState(false);
  const successScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible) {
      setTitle('');
      setDescription('');
      setPrivacy('PUBLIC');
      setSaved(false);
    }
  }, [visible]);

  const handleUpload = () => {
    if (title.trim() && !isUploading && !saved) {
      triggerHaptic();
      onUpload({ title: title.trim(), description: description.trim(), privacy });
      
      setSaved(true);
      HapticPatterns.success();
      Animated.sequence([
        Animated.timing(successScale, { toValue: 1.03, duration: 150, useNativeDriver: true }),
        Animated.timing(successScale, { toValue: 1, duration: 150, useNativeDriver: true }),
      ]).start();
      
      setTimeout(() => onClose(), 1500);
    }
  };

  return (
    <ModalShell
      visible={visible}
      onClose={onClose}
      title="Upload Video"
      subtitle="School Media Resource"
      headerGradient={AppTheme.colors.gradients.brand}
    >
      <View className="pb-8 pt-2">
        <Reanimated.View entering={FadeInDown.delay(100).springify().damping(SPRING_CONFIG.damping)}>
          <FloatingInput
            label="Video Title"
            value={title}
            onChangeText={setTitle}
            icon={<Icons.Video size={18} />}
            autoFocus={true}
            maxLength={100}
          />
        </Reanimated.View>

        <Reanimated.View entering={FadeInDown.delay(200).springify().damping(SPRING_CONFIG.damping)} className="mb-6">
          <View className="bg-white border-2 border-transparent rounded-2xl px-4 py-3 shadow-sm min-h-[100px]">
            <Text className="text-[10px] font-inter-bold text-gray-400 uppercase tracking-[0.5px] mb-2">Video Description</Text>
            <TextInput 
              placeholder="Provide context or instructions for this media..." 
              value={description}
              onChangeText={setDescription}
              multiline
              className="text-gray-900 font-inter-bold text-[14px] flex-1 leading-relaxed p-0"
              textAlignVertical="top"
              placeholderTextColor="#cbd5e1"
            />
          </View>
        </Reanimated.View>

        <Reanimated.View entering={FadeInDown.delay(300).springify().damping(SPRING_CONFIG.damping)} className="mb-8">
          <Text className="text-[10px] font-inter-bold text-gray-400 uppercase tracking-[0.5px] mb-3 px-1">Visibility</Text>
          <View className="flex-row gap-2">
            <TouchableOpacity 
              onPress={() => { triggerHaptic(); setPrivacy('PUBLIC'); }} 
              activeOpacity={0.75}
              className={`flex-1 py-3.5 rounded-2xl border-2 items-center justify-center ${privacy === 'PUBLIC' ? 'bg-white border-indigo-500 shadow-xl shadow-indigo-100/50' : 'bg-gray-50/30 border-transparent shadow-sm'}`}
            >
              <Text className={`text-[10px] font-inter-black uppercase tracking-[0.5px] ${privacy === 'PUBLIC' ? 'text-indigo-600' : 'text-gray-500'}`}>Public Access</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => { triggerHaptic(); setPrivacy('PRIVATE'); }} 
              activeOpacity={0.75}
              className={`flex-1 py-3.5 rounded-2xl border-2 items-center justify-center ${privacy === 'PRIVATE' ? 'bg-white border-indigo-500 shadow-xl shadow-indigo-100/50' : 'bg-gray-50/30 border-transparent shadow-sm'}`}
            >
              <Text className={`text-[10px] font-inter-black uppercase tracking-[0.5px] ${privacy === 'PRIVATE' ? 'text-indigo-600' : 'text-gray-500'}`}>Private Access</Text>
            </TouchableOpacity>
          </View>
        </Reanimated.View>

        <Reanimated.View entering={FadeInDown.delay(300).springify().damping(SPRING_CONFIG.damping)} className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100/50 flex-row items-center mb-10">
          <View className="w-8 h-8 bg-white rounded-full items-center justify-center mr-3 border border-indigo-100 shadow-sm">
            <Icons.Shield size={16} color="#4f46e5" />
          </View>
          <Text className="text-indigo-900 text-[11px] font-inter-bold leading-tight flex-1">
            Media will be encrypted and stored in the school's private cloud infrastructure.
          </Text>
        </Reanimated.View>

        <Animated.View style={{ transform: [{ scale: successScale }] }}>
          <Pressable
            onPress={handleUpload}
            disabled={!title.trim() || isUploading || saved}
            style={({ pressed }) => ({
              opacity: (!title.trim() || isUploading || saved) ? 0.5 : pressed ? 0.92 : 1,
              transform: [{ scale: (pressed || (title.trim() && !isUploading && !saved)) ? 1.05 : 1 }],
            })}
            className={`h-[52px] rounded-2xl items-center justify-center flex-row ${
              saved ? 'bg-emerald-500' : 'bg-indigo-600'
            }`}
          >
            {isUploading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                {!saved && <Icons.Send size={18} color="white" className="mr-2" />}
                <Text className="text-white text-[13px] font-inter-black tracking-[0.5px] uppercase ml-2">
                  {saved ? '✓ Media Published' : 'Upload Video'}
                </Text>
              </>
            )}
          </Pressable>
        </Animated.View>

        {!saved && !isUploading && (
          <TouchableOpacity 
            onPress={onClose}
            className="py-2 items-center mt-3"
          >
            <Text className="text-[10px] font-inter-bold text-rose-400 uppercase tracking-[0.5px]">Discard Upload</Text>
          </TouchableOpacity>
        )}
      </View>
    </ModalShell>
  );
};
