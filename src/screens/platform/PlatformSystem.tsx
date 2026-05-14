import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Switch, KeyboardAvoidingView, Platform, Modal, Alert } from 'react-native';
import { Icons } from '@components/common/Icons';
import { useSchoolData } from '@context/SchoolDataContext';
import { LinearGradient } from 'expo-linear-gradient';
import { AppTheme, AppCard, AppTypography, RestrictedAccessView, PlatinumHeader, SectionHeader, StatusPill } from '@components/common';
import { UserRole } from '@/types';
import { triggerHaptic } from '@utils/haptics';

interface PlatformSystemProps {
    settings?: any;
    onUpdateSettings?: (settings: any) => void;
    onBroadcast?: (title: string, message: string) => void;
    hasPermission?: (perm: string) => boolean;
    currentUserRole?: UserRole;
}

export const PlatformSystem: React.FC<PlatformSystemProps> = ({ 
    settings, 
    onUpdateSettings, 
    onBroadcast,
    hasPermission,
    currentUserRole
}) => {
    if (hasPermission && !hasPermission('settings')) {
        return <RestrictedAccessView featureName="App Settings" role={currentUserRole} />;
    }

    const { platformSettings: contextSettings, updatePlatformSettings, healthStatus, dbLatency } = useSchoolData();
    const [editMode, setEditMode] = useState(false);
    
    const activeSettings = settings || contextSettings || {};
    const [showBroadcastModal, setShowBroadcastModal] = useState(false);
    const [broadcastData, setBroadcastData] = useState({ title: '', message: '' });
    
    const [formData, setFormData] = useState({
        platformName: activeSettings.platformName || 'Oureduca',
        supportEmail: activeSettings.supportEmail || '',
        supportPhone: activeSettings.supportPhone || '',
        maintenanceMode: activeSettings.maintenanceMode || false,
    });

    const handleToggleMaintenance = (value: boolean) => {
        triggerHaptic();
        const newSettings = { ...formData, maintenanceMode: value };
        setFormData(newSettings);
        onUpdateSettings?.(newSettings);
        updatePlatformSettings(newSettings);
    };

    const handleSave = () => {
        triggerHaptic();
        onUpdateSettings?.(formData);
        setEditMode(false);
    };

    const handleSendBroadcast = () => {
        triggerHaptic();
        if (!broadcastData.title || !broadcastData.message) {
            Alert.alert("Required", "Provide both a title and message.");
            return;
        }
        onBroadcast?.(broadcastData.title, broadcastData.message);
        setBroadcastData({ title: '', message: '' });
        setShowBroadcastModal(false);
    };

    const SettingRow = ({ label, value, onChangeText, placeholder, icon: IconComp, iconColor, isLast = false, keyboardType = 'default' }: any) => (
        <View>
            <View className="flex-row items-center p-4">
                <View 
                    className="w-10 h-10 rounded-xl items-center justify-center mr-4"
                    style={{ backgroundColor: `${iconColor}15` }}
                >
                    <IconComp size={18} color={iconColor} />
                </View>
                <View className="flex-1">
                    <Text className="text-[9px] font-black text-slate-400 uppercase tracking-[1px] mb-0.5 font-inter-black">{label}</Text>
                    {editMode ? (
                        <TextInput
                            value={value}
                            onChangeText={onChangeText}
                            placeholder={placeholder}
                            placeholderTextColor="#94a3b8"
                            keyboardType={keyboardType}
                            className="text-[14px] font-bold text-slate-900 font-inter-bold p-0 min-h-[24px]"
                        />
                    ) : (
                        <Text className="text-[14px] font-bold text-slate-900 font-inter-bold" numberOfLines={1}>
                            {value || placeholder}
                        </Text>
                    )}
                </View>
            </View>
            {!isLast && <View className="h-[1px] mx-4 bg-slate-50" />}
        </View>
    );

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-[#fbfbfe]">
            {/* 1. Control Stage - High-Fidelity Platinum Header */}
            <PlatinumHeader 
                title="System Settings"
                subtitle="PLATFORM CONFIGURATION"
                rightAction={
                    !editMode ? (
                        <TouchableOpacity 
                            onPress={() => { triggerHaptic(); setEditMode(true); }} 
                            className="w-10 h-10 bg-white border border-slate-200 rounded-full items-center justify-center active:scale-95 shadow-sm"
                        >
                            <Icons.Edit size={18} color="#4f46e5" />
                        </TouchableOpacity>
                    ) : (
                        <View className="flex-row items-center gap-2">
                            <TouchableOpacity 
                                onPress={() => { triggerHaptic(); setEditMode(false); }} 
                                className="w-10 h-10 bg-white border border-slate-200 rounded-full items-center justify-center active:scale-95 shadow-sm"
                            >
                                <Icons.Close size={18} color="#64748b" />
                            </TouchableOpacity>
                            <TouchableOpacity 
                                onPress={handleSave} 
                                className="w-10 h-10 bg-indigo-600 rounded-full items-center justify-center active:scale-95 shadow-md shadow-indigo-200"
                            >
                                <Icons.Check size={18} color="white" />
                            </TouchableOpacity>
                        </View>
                    )
                }
            />

            <ScrollView 
                className="flex-1" 
                showsVerticalScrollIndicator={false} 
                contentContainerStyle={{ paddingTop: 20, paddingBottom: 100 }}
            >
                {/* 2. Brand & Contact Identity */}
                <View className="px-5 mb-8">
                    <SectionHeader title="BRAND & IDENTITY" className="px-1 mb-4" />
                    <AppCard className="p-0 overflow-hidden border-white shadow-xl shadow-indigo-100/20 rounded-[16px]">
                        <SettingRow 
                            label="Platform Name" 
                            value={formData.platformName} 
                            onChangeText={(t: string) => setFormData({...formData, platformName: t})} 
                            placeholder="Oureduca" 
                            icon={Icons.School} 
                            iconColor="#4f46e5" 
                        />
                        <SettingRow 
                            label="Admin Email" 
                            value={formData.supportEmail} 
                            onChangeText={(t: string) => setFormData({...formData, supportEmail: t})} 
                            placeholder="admin@domain.com" 
                            icon={Icons.Messages} 
                            iconColor="#4f46e5" 
                            keyboardType="email-address"
                        />
                        <SettingRow 
                            label="Support Phone" 
                            value={formData.supportPhone} 
                            onChangeText={(t: string) => setFormData({...formData, supportPhone: t})} 
                            placeholder="+1 (555) 000-0000" 
                            icon={Icons.Phone} 
                            iconColor="#4f46e5" 
                            keyboardType="phone-pad"
                            isLast={true}
                        />
                    </AppCard>
                </View>

                {/* 3. System Status & Performance */}
                <View className="px-5 mb-8">
                    <SectionHeader 
                        title="SYSTEM CONTROLS" 
                        className="px-1 mb-4"
                        rightElement={<StatusPill label={formData.maintenanceMode ? 'Maintenance' : 'Live'} type={formData.maintenanceMode ? 'warning' : 'success'} />}
                    />
                    
                    <AppCard className="p-0 overflow-hidden border-white shadow-xl shadow-indigo-100/20 rounded-[16px]">
                        <View className="flex-row items-center p-4">
                            <View 
                                className="w-10 h-10 rounded-xl items-center justify-center mr-4"
                                style={{ backgroundColor: `${formData.maintenanceMode ? '#f43f5e' : '#10b981'}15` }}
                            >
                                <Icons.Alert size={18} color={formData.maintenanceMode ? '#f43f5e' : '#10b981'} />
                            </View>
                            <View className="flex-1">
                                <Text className="text-[9px] font-black text-slate-400 uppercase tracking-[1px] mb-0.5 font-inter-black">Maintenance Mode</Text>
                                <Text className="text-[14px] font-bold text-slate-900 font-inter-bold">{formData.maintenanceMode ? 'TRAFFIC PAUSED' : 'SYSTEMS LIVE'}</Text>
                            </View>
                            <Switch 
                                value={formData.maintenanceMode} 
                                onValueChange={handleToggleMaintenance} 
                                trackColor={{ false: '#f1f5f9', true: '#f43f5e' }} 
                                thumbColor="#ffffff" 
                            />
                        </View>
                        <View className="h-[1px] mx-4 bg-slate-50" />
                        <View className="flex-row items-center p-4">
                            <View className="w-10 h-10 rounded-xl items-center justify-center mr-4 bg-emerald-50">
                                <Icons.Activity size={18} color="#10b981" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-[9px] font-black text-slate-400 uppercase tracking-[1px] mb-0.5 font-inter-black">Health Status</Text>
                                <Text className="text-[14px] font-bold text-emerald-600 font-inter-bold">{healthStatus}</Text>
                            </View>
                            <View className="h-full w-[1px] bg-slate-50 mx-4" />
                            <View className="flex-1">
                                <Text className="text-[9px] font-black text-slate-400 uppercase tracking-[1px] mb-0.5 font-inter-black">Server Latency</Text>
                                <Text className="text-[14px] font-bold text-slate-900 font-inter-bold">{dbLatency}ms</Text>
                            </View>
                        </View>
                    </AppCard>
                </View>

                {/* 4. Global Communication */}
                <View className="px-5 mb-10">
                    <SectionHeader title="GLOBAL COMMUNICATION" className="px-1 mb-4" />
                    <TouchableOpacity 
                        onPress={() => { triggerHaptic(); setShowBroadcastModal(true); }} 
                        activeOpacity={0.9} 
                        className="active:scale-[0.98]"
                    >
                        <AppCard className="p-0 overflow-hidden border-indigo-100 shadow-xl shadow-indigo-100/20 rounded-[16px]">
                            <LinearGradient 
                                colors={AppTheme.colors.gradients.brand} 
                                start={{x: 0, y: 0}} 
                                end={{x: 1, y: 1}} 
                                className="p-5 items-center flex-row justify-between"
                            >
                                <View className="flex-row items-center">
                                    <View className="w-11 h-11 rounded-2xl bg-white/20 items-center justify-center mr-4 border border-white/30">
                                        <Icons.Radio size={20} color="white" />
                                    </View>
                                    <View>
                                        <Text className="text-white text-[15px] font-black tracking-tight font-inter-black">Broadcast Alert</Text>
                                        <Text className="text-white/70 text-[9px] font-black uppercase tracking-widest font-inter-black">Send to all dashboards</Text>
                                    </View>
                                </View>
                                <Icons.ChevronRight size={18} color="white" />
                            </LinearGradient>
                        </AppCard>
                    </TouchableOpacity>
                </View>

                <View className="py-10 items-center opacity-30">
                    <Text className="text-[10px] font-black text-slate-400 uppercase tracking-[4px] font-inter-black">OurEduca Hub v2.5.0</Text>
                </View>

                {/* Broadcast Modal - High Fidelity Architecture */}
                <Modal visible={showBroadcastModal} transparent animationType="slide">
                    <View className="flex-1 bg-black/60 items-center justify-center px-6">
                        <View className="bg-white w-full max-w-sm rounded-[16px] overflow-hidden shadow-2xl border border-slate-100">
                            <LinearGradient colors={AppTheme.colors.gradients.brand} start={{x: 0, y: 0}} end={{x: 1, y: 0}} className="px-8 py-8 flex-row justify-between items-center">
                                <View className="flex-row items-center">
                                    <View className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 items-center justify-center mr-4">
                                        <Icons.Radio size={20} color="white" />
                                    </View>
                                    <View>
                                        <Text className="text-white text-[18px] font-black tracking-tighter font-inter-black">Announce</Text>
                                        <Text className="text-indigo-200 text-[9px] font-black uppercase tracking-[2px] font-inter-black">Global Broadcast</Text>
                                    </View>
                                </View>
                                <TouchableOpacity onPress={() => setShowBroadcastModal(false)} className="bg-white/20 w-10 h-10 rounded-full items-center justify-center active:scale-95">
                                    <Icons.Close size={18} color="white" />
                                </TouchableOpacity>
                            </LinearGradient>

                            <View className="p-8">
                                <View className="gap-5">
                                    <View>
                                        <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1 font-inter-black">Subject Line</Text>
                                        <TextInput 
                                            className="bg-slate-50 px-4 py-4 rounded-2xl text-[14px] font-black text-slate-900 border border-slate-100 shadow-inner font-inter-black" 
                                            placeholder="e.g. Critical System Update" 
                                            placeholderTextColor="#94a3b8" 
                                            value={broadcastData.title} 
                                            onChangeText={(t) => setBroadcastData({...broadcastData, title: t})} 
                                        />
                                    </View>
                                    <View>
                                        <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1 font-inter-black">Message Content</Text>
                                        <TextInput 
                                            className={`bg-slate-50 px-4 py-4 rounded-2xl text-[14px] font-black text-slate-700 border border-slate-100 shadow-inner ${Platform.OS === 'ios' ? 'min-h-[140px]' : 'h-[140px]'} font-inter-black`}
                                            placeholder="Write your announcement..." 
                                            placeholderTextColor="#94a3b8" 
                                            multiline 
                                            textAlignVertical="top" 
                                            value={broadcastData.message} 
                                            onChangeText={(t) => setBroadcastData({...broadcastData, message: t})} 
                                        />
                                    </View>
                                </View>
                                
                                <View className="mt-6 bg-amber-50 p-4 rounded-3xl border border-amber-100 flex-row items-center">
                                    <Icons.Alert size={18} color="#d97706" />
                                    <View className="ml-3 flex-1">
                                        <Text className="text-[12px] text-amber-900 font-bold tracking-tight font-inter-bold">Sent to all institutional dashboards instantly.</Text>
                                    </View>
                                </View>

                                <TouchableOpacity 
                                    onPress={handleSendBroadcast} 
                                    className="mt-8 active:scale-95 shadow-xl shadow-indigo-100 transition-all"
                                >
                                    <LinearGradient colors={AppTheme.colors.gradients.brand} className="py-5 rounded-[24px] items-center flex-row justify-center">
                                        <Icons.Radio size={18} color="white" />
                                        <Text className="text-white font-black uppercase tracking-[2px] text-[12px] ml-3 font-inter-black">Send Announcement</Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};
