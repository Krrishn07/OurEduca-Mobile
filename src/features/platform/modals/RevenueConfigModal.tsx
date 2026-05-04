import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Icons } from '../../../../components/Icons';
import { AppTheme, ModalShell, AppButton, AppTypography } from '../../../design-system';

interface RevenueConfigModalProps {
    visible: boolean;
    onClose: () => void;
    currentRates: Record<string, number>;
    onSave: (newRates: Record<string, number>) => void;
}

export const RevenueConfigModal: React.FC<RevenueConfigModalProps> = ({
    visible,
    onClose,
    currentRates,
    onSave
}) => {
    const [localRates, setLocalRates] = useState(currentRates);

    const handleUpdate = (plan: string, value: string) => {
        const numValue = parseInt(value.replace(/[^0-9]/g, '')) || 0;
        setLocalRates(prev => ({ ...prev, [plan]: numValue }));
    };

    const handleSave = () => {
        onSave(localRates);
        onClose();
    };

    return (
        <ModalShell
            visible={visible}
            onClose={onClose}
            title="Pricing Settings"
            subtitle="Global Rate Configuration"
            headerGradient={AppTheme.colors.gradients.brand}
        >
            <View>
                {/* Important Note */}
                <View className="bg-amber-50 p-6 rounded-[32px] border border-amber-100/50 flex-row items-center mb-8 shadow-sm">
                    <View className="w-10 h-10 rounded-2xl bg-amber-100 items-center justify-center mr-4">
                        <Icons.Alert size={20} color="#d97706" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-[10px] text-amber-600 font-black uppercase tracking-[2px] mb-1 font-inter-black">Global Impact Warning</Text>
                        <Text className="text-[12px] text-amber-900 font-black leading-tight tracking-tight">
                            Updates will retroactively affect revenue projections across all nodes.
                        </Text>
                    </View>
                </View>

                <View className="flex-row items-center mb-4 px-1">
                    <View className="w-1 h-4 bg-indigo-500 rounded-full mr-2" />
                    <Text className="text-[10px] font-black text-gray-900 uppercase tracking-[2px] font-inter-black">Plan Specific Rates</Text>
                </View>
                
                <View className="gap-4 mb-10">
                    {Object.entries(localRates).map(([plan, price]) => (
                        <View key={plan} className="bg-white p-6 rounded-[24px] border border-gray-50 shadow-sm flex-row items-center">
                            <View className="flex-1 flex-row items-center">
                                <View className={`w-2.5 h-2.5 rounded-full mr-4 ${
                                    plan === 'Enterprise' ? 'bg-amber-500' : plan === 'Pro' ? 'bg-indigo-600' : 'bg-emerald-500'
                                } shadow-sm`} />
                                <Text className="text-sm font-black text-gray-900 tracking-tight">{plan}</Text>
                            </View>
                            <View className="bg-gray-50/50 flex-row items-center px-4 py-3 rounded-2xl border border-gray-100 w-44">
                                <Text className="text-[11px] font-black text-gray-400 mr-2">₹</Text>
                                <TextInput
                                    className="flex-1 text-sm font-black text-gray-900"
                                    value={price.toString()}
                                    keyboardType="numeric"
                                    onChangeText={(text) => handleUpdate(plan, text)}
                                    placeholder="0"
                                    placeholderTextColor="#d1d5db"
                                />
                            </View>
                        </View>
                    ))}
                </View>

                <View className="flex-row gap-4 mb-6">
                    <AppButton 
                        label="Cancel"
                        variant="outline"
                        onPress={onClose}
                        className="flex-1"
                    />
                    <AppButton 
                        label="Save Prices"
                        onPress={handleSave}
                        className="flex-[2]"
                    />
                </View>
            </View>
        </ModalShell>
    );
};
