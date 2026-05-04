import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Animated, TouchableOpacity } from 'react-native';
import { Icons } from '../../../../components/Icons';
import { AppTheme, ModalShell, AppButton, AppTypography } from '../../../design-system';
import { PaymentConfig } from '../../../../contexts/SchoolDataContext';

interface PaymentGatewayModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (method: string) => Promise<any>;
  amount: number;
  feeTitle: string;
  paymentConfig: PaymentConfig;
}

type PaymentState = 'IDLE' | 'PROCESSING' | 'SUCCESS' | 'ERROR';

export const PaymentGatewayModal: React.FC<PaymentGatewayModalProps> = ({
  visible,
  onClose,
  onConfirm,
  amount,
  feeTitle,
  paymentConfig
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'UPI' | 'CARD' | 'BANK' | null>(null);
  const [paymentState, setPaymentState] = useState<PaymentState>('IDLE');
  const [processingStep, setProcessingStep] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  const steps = [
    "Securing encrypted connection...",
    "Verifying institutional ledger...",
    "Routing to banking gateway...",
    "Finalizing digital capture..."
  ];

  useEffect(() => {
    if (paymentState === 'PROCESSING') {
      let currentStep = 0;
      const interval = setInterval(() => {
        currentStep++;
        if (currentStep < steps.length) {
          setProcessingStep(currentStep);
        } else {
          clearInterval(interval);
        }
      }, 1200);
      return () => clearInterval(interval);
    }
  }, [paymentState]);

  useEffect(() => {
    if (visible) {
      setPaymentState('IDLE');
      setSelectedMethod(null);
      setProcessingStep(0);
    }
  }, [visible]);

  const handleConfirm = async () => {
    if (!selectedMethod) return;
    setPaymentState('PROCESSING');
    try {
      await onConfirm(selectedMethod);
      setPaymentState('SUCCESS');
      setTimeout(() => {
        onClose();
      }, 2500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Payment simulation failed');
      setPaymentState('ERROR');
    }
  };

  const methods = [
    { id: 'UPI', label: 'UPI / GPay / PhonePe', icon: 'Sparkles', desc: paymentConfig.upiId },
    { id: 'CARD', label: 'Debit / Credit Card', icon: 'Payment', desc: 'Secure encryption enabled' },
    { id: 'BANK', label: 'Net Banking', icon: 'Admin', desc: paymentConfig.bankName }
  ];

  const renderProcessing = () => (
    <View className="items-center justify-center py-16 px-4">
      <View className="mb-10 w-20 h-20 items-center justify-center">
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
      <Text className="text-gray-900 font-black text-center text-xl mb-3 tracking-tight">Simulating Secure Transfer</Text>
      <Text className="text-gray-400 text-[11px] font-black text-center uppercase tracking-widest leading-relaxed mb-12">{steps[processingStep]}</Text>
      
      <View className="w-full bg-gray-100 h-2 rounded-full overflow-hidden shadow-inner">
        <Animated.View 
            className="bg-indigo-600 h-full rounded-full"
            style={{ width: `${((processingStep + 1) / steps.length) * 100}%` }}
        />
      </View>
    </View>
  );

  const renderSuccess = () => (
    <View className="items-center justify-center py-16 px-4">
        <View className="w-24 h-24 bg-emerald-50 rounded-[32px] items-center justify-center mb-8 border border-emerald-100 shadow-lg shadow-emerald-100">
            <Icons.Check size={40} color="#10b981" />
        </View>
        <Text className="text-gray-900 font-black text-2xl tracking-tighter mb-3">Settled</Text>
        <Text className="text-gray-400 text-center text-[12px] font-black leading-5 px-6 mb-10">
            Institutional dues have been successfully verified. An official receipt has been appended to your student ledger.
        </Text>
        <View className="bg-emerald-500 px-5 py-2.5 rounded-2xl border border-emerald-400 shadow-md">
            <Text className="text-white font-black text-[9px] uppercase tracking-widest">Digital Auth: SIM-{Math.random().toString(36).substring(7).toUpperCase()}</Text>
        </View>
    </View>
  );

  return (
    <ModalShell
      visible={visible}
      onClose={onClose}
      title="Oureduca Pay"
      subtitle={paymentState === 'IDLE' ? 'Pro Simulation Hub' : 'Secure Transaction Stage'}
      headerGradient={paymentState === 'SUCCESS' ? ['#10b981', '#065f46'] : AppTheme.colors.gradients.brand}
    >
      <View>
        {paymentState === 'IDLE' ? (
            <View>
                {/* Amount Snapshot */}
                <View className="bg-indigo-50/50 p-8 rounded-[40px] mb-10 border border-indigo-100/50 items-center shadow-sm">
                    <Text className="text-indigo-900/40 text-[9px] font-black uppercase tracking-[3px] mb-3">{feeTitle}</Text>
                    <View className="flex-row items-baseline">
                        <Text className="text-2xl font-black text-indigo-400 mr-2">₹</Text>
                        <Text className="text-5xl font-black text-indigo-900 tracking-tighter">{amount.toLocaleString()}</Text>
                    </View>
                    <View className="flex-row items-center mt-6 bg-white px-4 py-2 rounded-full border border-indigo-100 shadow-sm">
                        <Icons.Shield size={12} color="#4f46e5" />
                        <Text className="text-indigo-600 text-[9px] font-black uppercase tracking-widest ml-2">Secure 128-bit Encryption</Text>
                    </View>
                </View>

                <Text className={`${AppTypography.eyebrow} text-gray-400 mb-5 ml-1`}>Select Payment Mode</Text>
                
                <View className="gap-4 mb-10">
                  {methods.map((method) => {
                    const isSelected = selectedMethod === method.id;
                    return (
                      <TouchableOpacity
                        key={method.id}
                        onPress={() => setSelectedMethod(method.id as any)}
                        activeOpacity={0.7}
                        className={`p-5 rounded-[28px] border-2 flex-row items-center ${
                          isSelected 
                          ? 'border-indigo-600 bg-indigo-50/30' 
                          : 'border-gray-100 bg-white shadow-sm'
                        }`}
                      >
                        <View className={`w-14 h-14 rounded-2xl items-center justify-center mr-5 ${
                          isSelected ? 'bg-indigo-600 shadow-lg shadow-indigo-200' : 'bg-gray-100'
                        }`}>
                          {(Icons as any)[method.icon] ? 
                            React.createElement((Icons as any)[method.icon], { size: 24, color: isSelected ? 'white' : '#94a3b8' }) 
                            : null
                          }
                        </View>
                        <View className="flex-1">
                          <Text className={`font-black text-[15px] tracking-tight ${isSelected ? 'text-indigo-950' : 'text-gray-900'}`}>
                            {method.label}
                          </Text>
                          <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1.5">{method.desc}</Text>
                        </View>
                        {isSelected && (
                          <View className="bg-indigo-600 w-6 h-6 rounded-full items-center justify-center">
                            <Icons.Check size={12} color="white" />
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <AppButton 
                  label="Proceed to Secure Payment"
                  onPress={handleConfirm}
                  disabled={!selectedMethod}
                  className="py-5 mb-6"
                />
            </View>
        ) : paymentState === 'PROCESSING' ? (
            renderProcessing()
        ) : paymentState === 'SUCCESS' ? (
            renderSuccess()
        ) : (
            <View className="py-16 items-center px-6">
                <View className="w-20 h-20 bg-rose-50 rounded-full items-center justify-center mb-6 border border-rose-100">
                    <Icons.Alert size={32} color="#f43f5e" />
                </View>
                <Text className="text-gray-900 font-black text-xl mb-3 tracking-tight">Transmission Fault</Text>
                <Text className="text-rose-500 font-black text-center text-sm leading-relaxed mb-10">{errorMessage}</Text>
                <AppButton 
                  label="Retry Handshake"
                  onPress={() => setPaymentState('IDLE')}
                  className="w-full py-5 mb-6"
                />
            </View>
        )}
      </View>
    </ModalShell>
  );
};
