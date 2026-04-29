import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { AppTheme, ModalShell, AppButton, AppTypography } from '../../../design-system';

interface BillingFilter {
    status: string;
    plan: string;
}

interface BillingFilterModalProps {
    visible: boolean;
    onClose: () => void;
    currentFilters: BillingFilter;
    onApply: (filters: BillingFilter) => void;
}

export const BillingFilterModal: React.FC<BillingFilterModalProps> = ({
    visible,
    onClose,
    currentFilters,
    onApply
}) => {
    const [localFilters, setLocalFilters] = useState(currentFilters);

    const statuses = ['All', 'Paid', 'Overdue', 'Pending'];
    const plans = ['All', 'Basic', 'Pro', 'Enterprise'];

    const handleApply = () => {
        onApply(localFilters);
        onClose();
    };

    const handleReset = () => {
        const reset = { status: 'All', plan: 'All' };
        setLocalFilters(reset);
        onApply(reset);
        onClose();
    };

    return (
        <ModalShell
            visible={visible}
            onClose={onClose}
            title="Search Filters"
            subtitle="Narrow Institutional Search"
            headerGradient={AppTheme.colors.gradients.brand}
        >
            <View>
                {/* Status Category */}
                <View className="mb-10">
                    <Text className={`${AppTypography.eyebrow} text-gray-400 mb-5 ml-1`}>Payment Status</Text>
                    <View className="flex-row flex-wrap gap-3">
                        {statuses.map(s => {
                            const isSelected = localFilters.status === s;
                            return (
                                <TouchableOpacity 
                                    key={s}
                                    onPress={() => setLocalFilters(prev => ({ ...prev, status: s }))}
                                    className={`px-6 py-3.5 rounded-2xl border shadow-sm active:scale-95 ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-gray-100'}`}
                                >
                                    <Text className={`text-[10px] font-black uppercase tracking-widest ${isSelected ? 'text-white' : 'text-gray-400'}`}>{s}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                {/* Plan Category */}
                <View className="mb-12">
                    <Text className={`${AppTypography.eyebrow} text-gray-400 mb-5 ml-1`}>Subscription Tier</Text>
                    <View className="flex-row flex-wrap gap-3">
                        {plans.map(p => {
                            const isSelected = localFilters.plan === p;
                            return (
                                <TouchableOpacity 
                                    key={p}
                                    onPress={() => setLocalFilters(prev => ({ ...prev, plan: p }))}
                                    className={`px-6 py-3.5 rounded-2xl border shadow-sm active:scale-95 ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-gray-100'}`}
                                >
                                    <Text className={`text-[10px] font-black uppercase tracking-widest ${isSelected ? 'text-white' : 'text-gray-400'}`}>{p}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                {/* Footer Actions */}
                <View className="flex-row gap-4 mb-6">
                    <AppButton 
                        label="Clear All"
                        variant="outline"
                        onPress={handleReset}
                        className="flex-1"
                    />
                    <AppButton 
                        label="Apply Filters"
                        onPress={handleApply}
                        className="flex-[2]"
                    />
                </View>
            </View>
        </ModalShell>
    );
};
