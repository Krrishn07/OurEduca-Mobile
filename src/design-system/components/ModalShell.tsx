import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { styled } from 'nativewind';
import { Icons } from '../../../components/Icons';
import { AppTheme } from '../theme';

const StyledLinearGradient = styled(LinearGradient);

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
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 justify-end bg-black/60">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="w-full bg-white rounded-t-[40px] overflow-hidden"
          style={{ maxHeight }}
        >
          {/* Header Section */}
          <StyledLinearGradient
            colors={headerGradient || AppTheme.colors.gradients.brand}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="px-6 pt-10 pb-8 flex-shrink-0"
          >
            <View className="flex-row justify-between items-center">
              <View className="flex-1 mr-4">
                <Text className="text-2xl font-black text-white tracking-tighter leading-7">
                  {title}
                </Text>
                {subtitle && (
                  <Text className="text-indigo-100 text-[10px] font-black uppercase tracking-[3px] mt-2 opacity-80">
                    {subtitle}
                  </Text>
                )}
              </View>
              <TouchableOpacity
                onPress={onClose}
                className="bg-white/10 p-3 rounded-full border border-white/10"
              >
                <Icons.Close size={20} color="white" />
              </TouchableOpacity>
            </View>
          </StyledLinearGradient>

          {/* Content Section */}
          <ScrollView
            className="bg-[#f5f7ff]"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 60 }}
          >
            {children}
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};
