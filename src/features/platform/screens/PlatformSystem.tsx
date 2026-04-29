import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Switch, KeyboardAvoidingView, Platform, Modal, Alert } from 'react-native';
import { Icons } from '../../../../components/Icons';
import { useSchoolData } from '../../../../contexts/SchoolDataContext';
import { LinearGradient } from 'expo-linear-gradient';
import { AppTheme, AppCard, AppTypography } from '../../../design-system';
import { RestrictedAccessView } from '../../../../components/RestrictedAccessView';
import { UserRole } from '../../../../types';

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
        const newSettings = { ...formData, maintenanceMode: value };
        setFormData(newSettings);
        onUpdateSettings?.(newSettings);
        updatePlatformSettings(newSettings);
    };

    const handleSave = () => {
        onUpdateSettings?.(formData);
        setEditMode(false);
    };

    const handleSendBroadcast = () => {
        if (!broadcastData.title || !broadcastData.message) {
            Alert.alert("Required", "Provide both a title and message.");
            return;
        }
        onBroadcast?.(broadcastData.title, broadcastData.message);
        setBroadcastData({ title: '', message: '' });
        setShowBroadcastModal(false);
    };

    const CompactHeader = ({ title, icon: IconComp }: any) => (
        <View className="flex-row items-center mb-4">
            <View className="w-8 h-8 rounded-lg bg-indigo-50 items-center justify-center mr-3 border border-indigo-100/50 shadow-sm">
                <IconComp size={16} color="#4f46e5" />
            </View>
            <Text className="text-[11px] font-black text-gray-900 uppercase tracking-widest">{title}</Text>
        </View>
    );

    const LabeledInput = ({ label, value, onChangeText, placeholder, keyboardType = 'default' }: any) => (
        <View className="mb-4">
            <Text className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">{label}</Text>
            <TextInput
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor="#94a3b8"
                editable={editMode}
                keyboardType={keyboardType as any}
                className={`bg-gray-50/50 px-4 py-3.5 rounded-2xl border ${editMode ? 'border-gray-200 text-gray-900 bg-white' : 'border-gray-100 text-gray-500'} text-[13px] font-bold`}
            />
        </View>
    );

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-[#f5f7ff]">
            {/* 1. Cinematic Hero Header */}
            <LinearGradient 
                colors={AppTheme.colors.gradients.brand} 
                start={{x: 0, y: 0}} 
                end={{x: 1, y: 1}} 
                className="px-6 pt-5 pb-12 rounded-b-[40px] shadow-2xl shadow-indigo-200 z-20"
            >
                <View className="absolute right-[-20] bottom-[-20] opacity-10 transform rotate-12">
                    <Icons.Settings size={160} color="white" />
                </View>
                <View className="flex-row justify-between items-center relative z-10">
                    <View className="flex-1 mr-4">
                        <Text className={`${AppTypography.heroTitle} text-white`} numberOfLines={1}>Platform Settings</Text>
                        <Text className={`${AppTypography.eyebrow} text-white/60 mt-1.5`}>System Controls</Text>
                    </View>
                    {!editMode ? (
                        <TouchableOpacity onPress={() => setEditMode(true)} className="bg-white/10 p-3 rounded-2xl border border-white/20 active:scale-95">
                            <Icons.Edit size={20} color="white" />
                        </TouchableOpacity>
                    ) : (
                        <View className="flex-row items-center gap-3">
                            <TouchableOpacity onPress={() => setEditMode(false)} className="bg-white/10 p-3 rounded-2xl border border-white/20 active:scale-95">
                                <Icons.Close size={20} color="white" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleSave} className="bg-white p-3 rounded-2xl shadow-lg shadow-indigo-500/20 active:scale-95">
                                <Icons.Check size={20} color="#4f46e5" />
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </LinearGradient>

            <ScrollView 
                className="flex-1 px-6 pt-8" 
                showsVerticalScrollIndicator={false} 
                contentContainerStyle={{ paddingBottom: 100 }}
            >
                {/* 2. Brand Identity Card */}
                <AppCard className="mb-6 border border-gray-100 p-5">
                    <CompactHeader title="Branding & Name" icon={Icons.School} />
                    <LabeledInput label="Platform Name" value={formData.platformName} onChangeText={(t: string) => setFormData({...formData, platformName: t})} placeholder="Oureduca" />
                </AppCard>

                {/* 3. Support Contacts */}
                <AppCard className="mb-6 border border-gray-100 p-5">
                    <CompactHeader title="Contact Information" icon={Icons.Phone} />
                    <View className="flex-row gap-4">
                        <View className="flex-1"><LabeledInput label="Admin Email" value={formData.supportEmail} onChangeText={(t: string) => setFormData({...formData, supportEmail: t})} placeholder="admin@domain.com" keyboardType="email-address" /></View>
                        <View className="flex-1"><LabeledInput label="Support Phone" value={formData.supportPhone} onChangeText={(t: string) => setFormData({...formData, supportPhone: t})} placeholder="+1 (555) 000-0000" keyboardType="phone-pad" /></View>
                    </View>
                </AppCard>

                {/* 4. App Status & Performance */}
                <AppCard className="mb-6 border border-gray-100 p-5">
                    <CompactHeader title="App Status" icon={Icons.Zap} />
                    
                    <View className={`p-4 flex-row justify-between items-center border rounded-2xl mb-4 shadow-sm ${formData.maintenanceMode ? 'bg-rose-50 border-rose-100' : 'bg-emerald-50/50 border-emerald-100'}`}>
                        <View className="flex-row items-center flex-1">
                            <View className={`w-10 h-10 rounded-xl items-center justify-center mr-3 ${formData.maintenanceMode ? 'bg-rose-500' : 'bg-emerald-500'}`}>
                                <Icons.Alert size={18} color="white" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-sm font-bold text-gray-900 tracking-tight">Maintenance Mode</Text>
                                <Text className={`text-[8px] font-black uppercase tracking-widest mt-0.5 ${formData.maintenanceMode ? 'text-rose-600' : 'text-emerald-600'}`}>{formData.maintenanceMode ? 'PAUSED' : 'LIVE'}</Text>
                            </View>
                        </View>
                        <Switch value={formData.maintenanceMode} onValueChange={handleToggleMaintenance} trackColor={{ false: '#e2e8f0', true: '#ef4444' }} thumbColor="#ffffff" />
                    </View>

                    <View className="flex-row gap-4">
                        <View className={`flex-1 p-4 rounded-xl border shadow-sm ${healthStatus === 'Optimal' ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
                            <Text className={`text-[8px] font-black uppercase tracking-widest mb-1 ${healthStatus === 'Optimal' ? 'text-emerald-600' : 'text-rose-600'}`}>System Health</Text>
                            <Text className="text-lg font-black text-gray-900 tracking-tighter">{healthStatus}</Text>
                        </View>
                        <View className="flex-1 bg-gray-50/50 p-4 rounded-xl border border-gray-100 shadow-sm">
                            <Text className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Server Delay</Text>
                            <Text className="text-lg font-black text-gray-900 tracking-tighter">{dbLatency}ms</Text>
                        </View>
                    </View>
                </AppCard>

                {/* 5. Notification Card */}
                <AppCard className="mb-6 border border-gray-100 p-5 shadow-sm">
                    <CompactHeader title="Send Global Alert" icon={Icons.Notifications} />
                    <TouchableOpacity onPress={() => setShowBroadcastModal(true)} activeOpacity={0.8} className="active:scale-95 transition-all">
                        <LinearGradient colors={AppTheme.colors.gradients.brand} start={{x: 0, y: 0}} end={{x: 1, y: 1}} className="py-4 rounded-[16px] items-center flex-row justify-center shadow-md shadow-indigo-200">
                            <Icons.Messages size={20} color="white" />
                            <Text className="text-white font-black ml-3 uppercase tracking-[2px] text-[10px]">Send Notification</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </AppCard>

                <View className="mt-12 items-center opacity-30">
                    <Text className="text-[10px] font-black text-gray-500 uppercase tracking-[4px]">OurEduca Hub v2.4.0</Text>
                </View>

                {/* Notification Modal - High Fidelity Architecture */}
                <Modal visible={showBroadcastModal} transparent animationType="slide">
                    <View className="flex-1 bg-black/60 items-center justify-center px-6">
                        <View className="bg-white w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl border border-gray-100">
                            <LinearGradient colors={AppTheme.colors.gradients.brand} start={{x: 0, y: 0}} end={{x: 1, y: 0}} className="px-6 py-6 flex-row justify-between items-center">
                                <View className="flex-row items-center">
                                    <View className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 items-center justify-center mr-3">
                                        <Icons.Radio size={18} color="white" />
                                    </View>
                                    <View>
                                        <Text className="text-white text-lg font-black tracking-tighter">Send Announcement</Text>
                                        <Text className="text-indigo-200 text-[8px] font-black uppercase tracking-[2px]">App Notifications</Text>
                                    </View>
                                </View>
                                <TouchableOpacity onPress={() => setShowBroadcastModal(false)} className="bg-white/10 p-2.5 rounded-full border border-white/10 active:scale-95">
                                    <Icons.Close size={18} color="white" />
                                </TouchableOpacity>
                            </LinearGradient>

                            <View className="p-6 bg-gray-50/30">
                                <View className="gap-4">
                                    <View>
                                        <Text className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Message Title</Text>
                                        <TextInput 
                                            className="bg-white px-4 py-4 rounded-2xl text-[13px] font-black text-gray-900 border border-gray-100 shadow-sm" 
                                            placeholder="e.g. School Update" 
                                            placeholderTextColor="#9ca3af" 
                                            value={broadcastData.title} 
                                            onChangeText={(t) => setBroadcastData({...broadcastData, title: t})} 
                                        />
                                    </View>
                                    <View>
                                        <Text className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Message Content</Text>
                                        <TextInput 
                                            className="bg-white px-4 py-4 rounded-2xl text-[13px] font-black text-gray-700 border border-gray-100 shadow-sm min-h-[120px]" 
                                            placeholder="Type your message here..." 
                                            placeholderTextColor="#9ca3af" 
                                            multiline 
                                            textAlignVertical="top" 
                                            value={broadcastData.message} 
                                            onChangeText={(t) => setBroadcastData({...broadcastData, message: t})} 
                                        />
                                    </View>
                                </View>
                                
                                <View className="mt-5 bg-amber-50 p-4 rounded-2xl border border-amber-100 flex-row items-center shadow-sm">
                                    <Icons.Alert size={16} color="#d97706" />
                                    <View className="ml-3 flex-1">
                                        <Text className="text-[9px] text-amber-800 font-black uppercase tracking-widest leading-none mb-1">System Note</Text>
                                        <Text className="text-[11px] text-amber-900 font-bold tracking-tight">This message will be sent to all users immediately.</Text>
                                    </View>
                                </View>
                            </View>

                            <View className="p-6 bg-white border-t border-gray-100">
                                <TouchableOpacity onPress={handleSendBroadcast} className="active:scale-95 shadow-lg shadow-indigo-100 transition-all">
                                    <LinearGradient colors={AppTheme.colors.gradients.brand} className="py-4.5 rounded-2xl items-center flex-row justify-center">
                                        <Icons.Radio size={16} color="white" />
                                        <Text className="text-white font-black uppercase tracking-[2px] text-[11px] ml-3">Send Now</Text>
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
