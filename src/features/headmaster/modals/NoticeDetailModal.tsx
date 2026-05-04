import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Icons } from '../../../../components/Icons';
import { AppTheme, AppTypography, ModalShell, AppButton } from '../../../design-system';

interface NoticeDetailModalProps {
  visible: boolean;
  onClose: () => void;
  notice: any;
}

export const NoticeDetailModal: React.FC<NoticeDetailModalProps> = ({
  visible,
  onClose,
  notice
}) => {
  if (!notice) return null;

  const getAudienceColor = (audience: string) => {
    const aud = (audience || '').toUpperCase();
    if (aud === 'STAFF') return { text: '#4f46e5', bg: 'bg-indigo-50' };
    if (aud === 'PARENT') return { text: '#d97706', bg: 'bg-amber-50' };
    if (aud === 'STUDENT') return { text: '#10b981', bg: 'bg-emerald-50' };
    return { text: '#9333ea', bg: 'bg-purple-50' };
  };

  const style = getAudienceColor(notice.audience);

  return (
    <ModalShell
      visible={visible}
      onClose={onClose}
      title={notice.title}
      subtitle="Institutional Bulletin"
    >
      {/* Metadata Chips */}
      <View className="flex-row items-center mb-8 flex-wrap gap-3">
        <View className={`${style.bg} px-4 py-1.5 rounded-xl flex-row items-center border border-black/5`}>
          <View className="w-2 h-2 rounded-full bg-indigo-600 mr-2" style={{ backgroundColor: style.text }} />
          <Text className={`${AppTypography.meta}`} style={{ color: style.text }}>{notice.audience}</Text>
        </View>
        <View className="bg-white px-4 py-1.5 rounded-xl flex-row items-center border border-gray-100 shadow-sm">
          <Icons.Clock size={12} color="#9ca3af" />
          <Text className={`${AppTypography.meta} text-gray-400 ml-2`}>{notice.date}</Text>
        </View>
      </View>

      {/* Content Body */}
      <View className="mb-10">
        <Text className="text-gray-900 text-lg font-medium leading-relaxed">
          {notice.message}
        </Text>
      </View>

      {/* Sender Footer */}
      <View className="pt-8 border-t border-gray-100 flex-row items-center justify-between mb-8">
        <View className="flex-row items-center">
          <View className="w-12 h-12 rounded-2xl bg-indigo-50 items-center justify-center border border-indigo-100">
            <Icons.Profile size={20} color="#4f46e5" />
          </View>
          <View className="ml-4">
            <Text className="text-gray-900 font-black text-sm tracking-tight">{notice.sender || 'Institutional Admin'}</Text>
            <Text className="text-gray-400 text-[10px] font-medium uppercase tracking-widest mt-0.5">Authorized Sender</Text>
          </View>
        </View>
      </View>

      <AppButton 
        label="Acknowledge"
        onPress={onClose}
        className="py-5"
      />
    </ModalShell>
  );
};
