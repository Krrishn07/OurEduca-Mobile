import React, { useState } from 'react';
import { View, Text, TextInput } from 'react-native';
import { Icons } from '../../../../components/Icons';
import { AppTheme, ModalShell, AppButton, AppTypography } from '../../../design-system';

interface IssueFeeModalProps {
  visible: boolean;
  onClose: () => void;
  onIssue: (title: string, amount: number, dueDate: string) => Promise<void>;
  targetName: string; // e.g. "Class 10-A"
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
      title="Issue Fee"
      subtitle={`Target: ${targetName}`}
      headerGradient={AppTheme.colors.gradients.brand}
    >
      <View className="gap-6">
        <View>
          <Text className={`${AppTypography.eyebrow} text-gray-400 mb-2 ml-1`}>Fee Description</Text>
          <View className="bg-white rounded-2xl border border-gray-100 px-5 flex-row items-center h-14 shadow-sm">
            <Icons.Edit size={18} color="#6366f1" />
            <TextInput
              className="flex-1 ml-3 text-gray-900 font-black text-sm"
              placeholder="e.g. Monthly Tuition, Lab Fee..."
              value={title}
              onChangeText={setTitle}
              placeholderTextColor="#9ca3af"
            />
          </View>
        </View>

        <View>
          <Text className={`${AppTypography.eyebrow} text-gray-400 mb-2 ml-1`}>Amount (₹)</Text>
          <View className="bg-white rounded-2xl border border-gray-100 px-5 flex-row items-center h-14 shadow-sm">
            <Icons.Payment size={18} color="#6366f1" />
            <TextInput
              className="flex-1 ml-3 text-gray-900 font-black text-sm"
              placeholder="0.00"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
              placeholderTextColor="#9ca3af"
            />
          </View>
        </View>

        <View className="mb-4">
          <Text className={`${AppTypography.eyebrow} text-gray-400 mb-2 ml-1`}>Due Date</Text>
          <View className="bg-white rounded-2xl border border-gray-100 px-5 flex-row items-center h-14 shadow-sm">
            <Icons.Calendar size={18} color="#6366f1" />
            <TextInput
              className="flex-1 ml-3 text-gray-900 font-black text-sm"
              placeholder="YYYY-MM-DD"
              value={dueDate}
              onChangeText={setDueDate}
              placeholderTextColor="#9ca3af"
            />
          </View>
          <Text className="text-[10px] text-gray-400 mt-2 px-1 font-medium italic">Format: YYYY-MM-DD (e.g. 2026-05-15)</Text>
        </View>

        <AppButton 
          label="Generate Invoices Now"
          onPress={handleIssue}
          loading={isProcessing}
          disabled={!title || !amount}
          className="py-5"
        />
      </View>
    </ModalShell>
  );
};
