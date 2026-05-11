import React from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { styled } from 'nativewind';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icons } from './Icons';
import { AppTheme } from '@constants/Theme';


import Reanimated, { 
  FadeIn, 
  FadeOut, 
  SlideInDown, 
  SlideOutDown 
} from 'react-native-reanimated';

const StyledLinearGradient = styled(LinearGradient || View);

interface ModalShellProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  headerGradient?: string[];
  children: React.ReactNode;
  maxHeight?: string | number;
}

export const ModalShell: React.FC<ModalShellProps> = ({
  visible,
  onClose,
  title,
  subtitle,
  headerGradient,
  children,
  maxHeight = '92%',
}) => {
  const insets = useSafeAreaInsets();

  if (!visible) return null;

  return (
    <Modal 
      visible={visible} 
      animationType="none" 
      transparent
      onRequestClose={onClose}
    >
      <StatusBar barStyle="light-content" />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 justify-end"
      >
        {/* Background Overlay */}
        <Reanimated.View 
          entering={FadeIn.duration(300)}
          exiting={FadeOut.duration(200)}
          className="absolute inset-0 bg-black/60" 
        >
          <Pressable 
            className="flex-1" 
            onPress={onClose} 
          />
        </Reanimated.View>

        {/* Content Container */}
        <Reanimated.View
          entering={SlideInDown.springify().damping(18).stiffness(180).mass(0.8)}
          exiting={SlideOutDown.duration(250)}
          className="w-full bg-white rounded-t-[40px] overflow-hidden"
          style={{ maxHeight, paddingBottom: insets.bottom }}
        >
          {/* Header Section */}
          <StyledLinearGradient
            colors={headerGradient || AppTheme.colors.gradients.brand}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="px-6 pt-7 pb-5 flex-shrink-0"
          >
            <View className="flex-row justify-between items-start">
              <View className="flex-1 mr-4">
                <Text className="text-2xl font-inter-black text-white tracking-tighter leading-7">
                  {title}
                </Text>
                {subtitle && (
                  <Text className="text-indigo-100 text-[10px] font-inter-black uppercase tracking-[3px] mt-2 opacity-80">
                    {subtitle}
                  </Text>
                )}
              </View>
              <TouchableOpacity
                onPress={onClose}
                className="bg-white/5 p-2.5 rounded-full border border-white/5 active:scale-95 mt-1"
              >
                <Icons.Close size={18} color="white" />
              </TouchableOpacity>
            </View>
          </StyledLinearGradient>

          {/* Content Section */}
          <ScrollView
            className="bg-[#f5f7ff]"
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ 
              paddingHorizontal: 24, 
              paddingTop: 24, 
              paddingBottom: 24 
            }}
          >
            {children}
          </ScrollView>
        </Reanimated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};
