import React from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Icons } from '../../../../components/Icons';
import { LinearGradient } from 'expo-linear-gradient';
import { PlatformColors, PlatformRadius, PlatformTheme, PlatformShadows } from '../theme';
import { styled } from 'nativewind';

const StyledLinearGradient = styled(LinearGradient);

interface InstitutionDetailsModalProps {
    visible: boolean;
    onClose: () => void;
    institution: any;
    onAction?: (type: string, id: string) => void;
}

export const InstitutionDetailsModal: React.FC<InstitutionDetailsModalProps> = ({
    visible,
    onClose,
    institution,
    onAction
}) => {
    if (!institution) return null;

    const InfoCard = ({ label, value, icon: Icon, color }: any) => (
        <View 
            className="bg-white p-4 rounded-2xl border border-white shadow-sm mb-4 mx-1"
            style={{ width: '47%' }} // Fixed 2-column grid to prevent overflow
        >
            <View className="flex-row items-center mb-2">
                <View className="w-6 h-6 rounded-lg bg-gray-50 items-center justify-center mr-2 border border-gray-100/50 shrink-0">
                    <Icon size={12} color={color || PlatformColors.primary} />
                </View>
                <Text className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex-1" numberOfLines={1}>{label}</Text>
            </View>
            <Text className="text-[13px] font-black text-gray-900 tracking-tight leading-tight">
                {value || 'Not Set'}
            </Text>
        </View>
    );

    return (
        <Modal visible={visible} transparent animationType="slide">
            <View className="flex-1 bg-black/60 justify-end">
                <View className="bg-white rounded-t-[40px] shadow-2xl h-[88%] overflow-hidden">
                    {/* 1. Platinum Header */}
                    <StyledLinearGradient
                        colors={PlatformColors.gradients.indigo}
                        start={{x: 0, y: 0}} 
                        end={{x: 1, y: 0}}
                        className="px-8 pt-10 pb-8 flex-row justify-between items-center"
                    >
                        <View className="flex-1 flex-row items-center mr-4">
                            <View className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 items-center justify-center mr-4 overflow-hidden backdrop-blur-md shrink-0">
                                {institution.logo_url ? (
                                    <Image source={{ uri: institution.logo_url }} style={{ width: '100%', height: '100%' }} />
                                ) : (
                                    <Icons.School size={28} color="white" />
                                )}
                            </View>
                            <View className="flex-1">
                                <View className="flex-row items-center flex-wrap mb-1">
                                    <View className="w-2 h-2 rounded-full bg-emerald-400 mr-2 shadow-sm shrink-0" />
                                    <Text className="text-white text-xl font-black tracking-tighter leading-tight flex-1">{institution.name}</Text>
                                </View>
                                <Text className="text-yellow-300 text-[10px] font-black uppercase tracking-[2px] opacity-90">{institution.plan || 'Standard'} Plan Details</Text>
                            </View>
                        </View>
                        <TouchableOpacity onPress={onClose} className="bg-white/10 p-3 rounded-full border border-white/10 active:scale-95">
                            <Icons.Close size={20} color="white" />
                        </TouchableOpacity>
                    </StyledLinearGradient>

                    <ScrollView 
                        showsVerticalScrollIndicator={false} 
                        className="flex-1 bg-[#f5f7ff]"
                        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: 60 }}
                    >
                        {/* 2. Payment Details Module - Fixed Grid */}
                        <View className="mb-6">
                            <View className="flex-row items-center mb-5 px-2">
                                <View className="w-1 h-4 bg-indigo-500 rounded-full mr-2" />
                                <Text className="text-[10px] font-black text-gray-900 uppercase tracking-[2px] font-inter-black">Payment Details</Text>
                            </View>
                            <View className="flex-row flex-wrap justify-between">
                                <InfoCard label="Last Payment" value={institution.last_billing_date ? new Date(institution.last_billing_date).toLocaleDateString() : 'No History'} icon={Icons.Clock} />
                                <InfoCard label="Billing Cycle" value={`${institution.billing_cycle_days || 30} Days`} icon={Icons.Calendar} />
                                <InfoCard label="Status" value={institution.billing_status?.toUpperCase() || 'ACTIVE'} icon={Icons.Shield} color={PlatformColors.success} />
                                <InfoCard label="Est. Income" value="₹ 4.5L" icon={Icons.Payment} color={PlatformColors.success} />
                            </View>
                        </View>

                        {/* 3. School Information Module - Fixed Grid */}
                        <View className="mb-6">
                            <View className="flex-row items-center mb-5 px-2">
                                <View className="w-1 h-4 bg-indigo-500 rounded-full mr-2" />
                                <Text className="text-[10px] font-black text-gray-900 uppercase tracking-[2px] font-inter-black">School Information</Text>
                            </View>
                            <View className="flex-row flex-wrap justify-between">
                                <InfoCard label="Total Users" value={institution.plan === 'Enterprise' ? '2,500+' : '1,200+'} icon={Icons.Users} />
                                <InfoCard label="Location" value={institution.address?.split(',')[0] || 'Main Branch'} icon={Icons.Globe} />
                                <InfoCard label="Partner Since" value={new Date(institution.created_at).toLocaleDateString()} icon={Icons.Check} />
                                <InfoCard label="Contact Email" value={institution.email?.toLowerCase() || 'Not Provided'} icon={Icons.Mail} />
                            </View>
                        </View>

                        {/* 4. Administrative Actions Section */}
                        <View className="mb-10 px-1">
                            <View className="flex-row items-center mb-5 px-1">
                                <View className="w-1 h-4 bg-rose-500 rounded-full mr-2" />
                                <Text className="text-[10px] font-black text-rose-600 uppercase tracking-[2px] font-inter-black">Administrative Actions</Text>
                            </View>
                            <View className="flex-row gap-3">
                                <TouchableOpacity onPress={() => onAction?.('MODIFY_BILLING', institution.id)} className="flex-1 bg-white p-4 rounded-2xl border border-white items-center shadow-sm active:scale-95">
                                    <View className="w-9 h-9 bg-primary-10 rounded-xl items-center justify-center mb-2.5">
                                        <Icons.Settings size={16} color={PlatformColors.primary} />
                                    </View>
                                    <Text className="text-[8px] font-black text-gray-900 uppercase tracking-widest text-center">Edit Billing</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => onAction?.('MIGRATE_PLAN', institution.id)} className="flex-1 bg-white p-4 rounded-2xl border border-white items-center shadow-sm active:scale-95">
                                    <View className="w-9 h-9 bg-indigo-50 rounded-xl items-center justify-center mb-2.5">
                                        <Icons.ArrowUp size={16} color="#4f46e5" />
                                    </View>
                                    <Text className="text-[8px] font-black text-gray-900 uppercase tracking-widest text-center">Upgrade Plan</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => onAction?.('SUSPEND_NODE', institution.id)} className="flex-1 bg-rose-50 p-4 rounded-2xl border border-rose-100 items-center active:scale-95">
                                    <View className="w-9 h-9 bg-rose-100 rounded-xl items-center justify-center mb-2.5">
                                        <Icons.Alert size={16} color={PlatformColors.error} />
                                    </View>
                                    <Text className="text-[8px] font-black text-rose-600 uppercase tracking-widest text-center">Pause Account</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView>

                    {/* Footer Guard */}
                    <View className="px-8 pb-10 pt-6 border-t border-gray-100 bg-white">
                        <TouchableOpacity onPress={onClose} className="bg-gray-50 py-5 rounded-2xl items-center border border-gray-200 active:bg-gray-100">
                            <Text className="text-gray-400 font-black text-[11px] uppercase tracking-[4px]">Close Window</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};
