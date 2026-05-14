import React, { useState } from 'react';
import { View, Text, TextInput } from 'react-native';
import { Icons } from '@components/common/Icons';
import { AppTheme, ModalShell, AppButton, AppTypography } from '@components/common';
import { triggerHaptic } from '@utils/haptics';

interface IssueFeeModalProps {
  visible: boolean;
  onClose: () => void;
  onIssue: (title: string, amount: number, dueDate: string) => Promise<void>;
  targetName: string;
}

export const IssueFeeModal: React.FC<IssueFeeModalProps> = ({
  visible,
  onClose,
  onIssue,
  targetName
}) => {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleIssue = async () => {
    if (!title || !amount || isNaN(Number(amount))) return;
    triggerHaptic();
    setIsProcessing(true);
    try {
      await onIssue(title, Number(amount), dueDate);
      setTitle('');
      setAmount('');
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ModalShell
      visible={visible}
      onClose={onClose}
      title="Issue Invoice"
      subtitle={`TARGET: ${(targetName || 'General').toUpperCase()}`}
    >
      <View className="gap-6">
        <View>
          <Text className="text-[10px] font-black text-gray-400 uppercase tracking-[1px] mb-2.5 ml-1 font-inter-black">Fee Description</Text>
          <View className="bg-gray-50/50 rounded-[24px] border border-gray-100 px-5 flex-row items-center h-16 shadow-sm">
            <Icons.Edit size={18} color="#6366f1" />
            <TextInput
              className="flex-1 ml-3 text-gray-900 font-inter-black text-[15px]"
              placeholder="e.g. Monthly Tuition"
              value={title}
              onChangeText={setTitle}
              placeholderTextColor="#9ca3af"
            />
          </View>
        </View>

        <View>
          <Text className="text-[10px] font-black text-gray-400 uppercase tracking-[1px] mb-2.5 ml-1 font-inter-black">Amount (₹)</Text>
          <View className="bg-gray-50/50 rounded-[24px] border border-gray-100 px-5 flex-row items-center h-16 shadow-sm">
            <Icons.Payment size={18} color="#6366f1" />
            <TextInput
              className="flex-1 ml-3 text-gray-900 font-inter-black text-[15px]"
              placeholder="0.00"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
              placeholderTextColor="#9ca3af"
            />
          </View>
        </View>

        <View className="mb-4">
          <Text className="text-[10px] font-black text-gray-400 uppercase tracking-[1px] mb-2.5 ml-1 font-inter-black">Due Date</Text>
          <View className="bg-gray-50/50 rounded-[24px] border border-gray-100 px-5 flex-row items-center h-16 shadow-sm">
            <Icons.Calendar size={18} color="#6366f1" />
            <TextInput
              className="flex-1 ml-3 text-gray-900 font-inter-black text-[15px]"
              placeholder="YYYY-MM-DD"
              value={dueDate}
              onChangeText={setDueDate}
              placeholderTextColor="#9ca3af"
            />
          </View>
          <Text className="text-[9px] text-gray-400 mt-2.5 px-1 font-inter-medium italic opacity-70">Format: YYYY-MM-DD (e.g. 2026-05-15)</Text>
        </View>

        <AppButton 
          label="GENERATE INVOICES"
          onPress={handleIssue}
          loading={isProcessing}
          disabled={!title || !amount}
          className="py-5"
        />
      </View>
    </ModalShell>
  );
};
