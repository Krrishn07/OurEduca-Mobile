import React from 'react';
import { View, Text } from 'react-native';
import { Icons } from '../../../../components/Icons';
import { AppTheme, ModalShell, AppButton, AppTypography } from '../../../design-system';

interface FeeReceiptModalProps {
  visible: boolean;
  onClose: () => void;
  fee: any;
  studentName: string;
}

export const FeeReceiptModal: React.FC<FeeReceiptModalProps> = ({
  visible,
  onClose,
  fee,
  studentName
}) => {
  if (!fee) return null;

  return (
    <ModalShell
      visible={visible}
      onClose={onClose}
      title="Official E-Receipt"
      subtitle="Institutional Ledger Document"
      headerGradient={AppTheme.colors.gradients.brand}
    >
      <View>
        {/* Verification Area */}
        <View className="absolute top-0 right-0 opacity-[0.03] rotate-[15deg]">
            <Icons.Verified size={220} color="#000" />
        </View>

        <View className="flex-row justify-between items-center mb-8 px-1">
          <View>
            <Text className={AppTypography.eyebrow}>Receipt ID</Text>
            <Text className="text-[11px] font-mono font-black text-gray-900 uppercase mt-1">
                {String(fee?.id || 'ID-TEMP').substring(0, 10)}
            </Text>
          </View>
          <View className="items-end">
            <Text className={AppTypography.eyebrow}>Generation Date</Text>
            <Text className="text-sm font-black text-gray-900 tracking-tighter mt-1">
                {new Date().toLocaleDateString('en-IN')}
            </Text>
          </View>
        </View>

        <View className="gap-8 mb-10">
          <View>
            <Text className={AppTypography.eyebrow}>Institutional Beneficiary</Text>
            <Text className="text-xl font-black text-gray-900 tracking-tighter mt-1">{studentName}</Text>
          </View>

          <View className="h-px bg-gray-100 w-full" />

          <View>
            <Text className={AppTypography.eyebrow}>Transaction Details</Text>
            <View className="flex-row justify-between items-center bg-gray-50 p-6 rounded-[28px] border border-gray-100/50 mt-2">
              <Text className="text-[11px] font-black text-gray-700">{fee.title}</Text>
              <View className="flex-row items-center">
                <Text className="text-sm font-black text-gray-400 mr-0.5 opacity-60">₹</Text>
                <Text className="text-2xl font-black text-gray-900 tracking-tighter">{fee.amount.toLocaleString()}</Text>
              </View>
            </View>
          </View>

          <View className="flex-row gap-6">
            <View className="flex-1">
                <Text className={AppTypography.eyebrow}>Settlement Status</Text>
                <View className="flex-row items-center bg-emerald-50 self-start px-3 py-1.5 rounded-xl border border-emerald-100 mt-1.5">
                    <Icons.Check size={12} color="#059669" />
                    <Text className="text-emerald-700 text-[10px] font-black ml-2 uppercase tracking-widest">Verified</Text>
                </View>
            </View>
            <View className="flex-1 items-end">
                <Text className={AppTypography.eyebrow}>Ledger Method</Text>
                <Text className="text-[11px] font-black text-gray-800 tracking-tight mt-1.5">Institutional Transfer</Text>
            </View>
          </View>
        </View>

        {/* Verification Footer */}
        <View className="items-center p-8 border-t border-dashed border-gray-200 mb-10">
            <View className="w-14 h-14 bg-gray-50 rounded-[20px] items-center justify-center mb-4 border border-gray-100 shadow-inner">
                <Icons.Verified size={24} color="#94a3b8" />
            </View>
            <Text className="text-[11px] text-gray-400 text-center leading-relaxed font-medium">
                This is a computer-generated document verified by the Oureduca Institutional Ledger. No physical signature is required. Encrypted node verification active.
            </Text>
        </View>

        <AppButton 
          label="Close Document"
          onPress={onClose}
          className="py-5 mb-4"
          variant="primary"
        />
      </View>
    </ModalShell>
  );
};
