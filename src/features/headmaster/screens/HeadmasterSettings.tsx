import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, ActivityIndicator, KeyboardAvoidingView, Platform, TextInput } from 'react-native';
import { Icons } from '../../../../components/Icons';
import { useSchoolData } from '../../../../contexts/SchoolDataContext';
import { LinearGradient } from 'expo-linear-gradient';
import { AppTheme, AppCard, AppTypography, AppButton, AppRow, StatusPill, SectionHeader } from '../../../design-system';

interface HeadmasterSettingsProps {
    onSave: (settings: any) => void;
}

export const HeadmasterSettings: React.FC<HeadmasterSettingsProps> = ({ onSave }) => {
    const { 
        schoolDetails, paymentConfig, updatePaymentConfig, 
        dbCameraNodes, registerCameraNode, deleteCameraNode,
        dbClasses, fetchClasses 
    } = useSchoolData();
    const [isAcademicYearActive, setIsAcademicYearActive] = useState(true);
    const [editMode, setEditMode] = useState(false);
    
    const [formData, setFormData] = useState({
        bankName: paymentConfig.bankName || 'HDFC Bank',
        accountNumber: paymentConfig.accountNumber || '50200012345678',
        ifscCode: paymentConfig.ifscCode || 'HDFC0001234',
        upiId: paymentConfig.upiId || 'springfield@upi',
        supportEmail: schoolDetails?.email || 'support@springfield.com',
        supportPhone: schoolDetails?.phone || '+1 555-123-000',
        address: schoolDetails?.address || '123 Academic Way, Education City',
        contactPerson: schoolDetails?.contact_person || 'Principal John Doe'
    });

    const [showAddNode, setShowAddNode] = useState(false);
    const [newNode, setNewNode] = useState({ name: '', url: '', class_id: '', section: '' });
    const [isSubmittingNode, setIsSubmittingNode] = useState(false);

    useEffect(() => {
        if (schoolDetails?.id) {
            fetchClasses(schoolDetails.id);
        }
    }, [schoolDetails?.id, fetchClasses]);

    useEffect(() => {
        setFormData(prev => ({
            ...prev,
            supportEmail: schoolDetails?.email || prev.supportEmail,
            supportPhone: schoolDetails?.phone || prev.supportPhone,
            address: schoolDetails?.address || prev.address,
            contactPerson: schoolDetails?.contact_person || prev.contactPerson,
            bankName: paymentConfig?.bankName || prev.bankName,
            accountNumber: paymentConfig?.accountNumber || prev.accountNumber,
            ifscCode: paymentConfig?.ifscCode || prev.ifscCode,
            upiId: paymentConfig?.upiId || prev.upiId
        }));
    }, [schoolDetails, paymentConfig]);

    const handleSave = () => {
        onSave(formData);
        updatePaymentConfig({
            ...paymentConfig,
            bankName: formData.bankName,
            accountNumber: formData.accountNumber,
            ifscCode: formData.ifscCode,
            upiId: formData.upiId
        });
        setEditMode(false);
    };

    const handleAddCameraNode = async () => {
        if (!newNode.name || !newNode.url || !schoolDetails?.id) return;
        setIsSubmittingNode(true);
        try {
            await registerCameraNode({
                school_id: schoolDetails.id,
                name: newNode.name,
                stream_url: newNode.url,
                target_class_id: newNode.class_id || undefined,
                target_section: newNode.section || undefined
            });
            setNewNode({ name: '', url: '', class_id: '', section: '' });
            setShowAddNode(false);
        } catch (err) {
            console.error(err);
        } finally {
            setIsSubmittingNode(false);
        }
    };



    const LabeledInput = ({ label, value, onChangeText, placeholder, keyboardType = 'default', editable = true, multiline = false }: any) => (
        <View className="mb-4">
            <Text className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">{label}</Text>
            <TextInput
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor="#94a3b8"
                editable={editMode && editable}
                multiline={multiline}
                keyboardType={keyboardType as any}
                className={`bg-gray-50/50 px-4 py-3.5 rounded-2xl border ${editMode && editable ? 'border-gray-200 text-gray-900 bg-white' : 'border-gray-100 text-gray-500'} text-[13px] font-bold ${multiline ? 'min-h-[80px]' : ''}`}
                textAlignVertical={multiline ? 'top' : 'center'}
            />
        </View>
    );

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
            className="flex-1 bg-[#f5f7ff]"
        >
            {/* 1. Platinum Settings Header — 140px Sync */}
            <LinearGradient 
                colors={AppTheme.colors.gradients.brand} 
                start={{x: 0, y: 0}} 
                end={{x: 1, y: 1}} 
                className="h-[140px] px-6 pt-5 rounded-b-[40px] shadow-2xl shadow-indigo-200/50 relative z-30"
            >
                <View className="flex-row justify-between items-start w-full relative z-10">
                    <View className="flex-1 pr-4">
                        <Text className={`${AppTypography.heroTitle} text-white font-inter-black`} numberOfLines={1}>School Settings</Text>
                        <Text className={`${AppTypography.eyebrow} text-indigo-100/60 mt-1.5 font-inter-black`}>
                            MANAGE INSTITUTION
                        </Text>
                    </View>

                    {!editMode ? (
                        <TouchableOpacity 
                            onPress={() => setEditMode(true)}
                            className="bg-white/10 rounded-2xl px-5 py-3 flex-row items-center active:scale-95 border border-white/20"
                        >
                            <Icons.Edit size={12} color="white" />
                            <Text className="text-white text-[10px] font-black uppercase tracking-widest ml-2 font-inter-black">Edit</Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity 
                            onPress={handleSave}
                            className="bg-emerald-500 rounded-2xl px-5 py-3 flex-row items-center active:scale-95 border border-emerald-400"
                        >
                            <Icons.Check size={12} color="white" />
                            <Text className="text-white text-[10px] font-black uppercase tracking-widest ml-2 font-inter-black">Apply</Text>
                        </TouchableOpacity>
                    )}
                </View>
                <View className="absolute right-[-20] bottom-[-20] opacity-10 rotate-12">
                    <Icons.Grid size={140} color="white" />
                </View>
            </LinearGradient>

            <ScrollView 
                className="flex-1" 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 20, paddingBottom: 100 }}
            >
                {/* Section: School Information */}
                <View className="mb-6">
                    <SectionHeader 
                        title="SCHOOL INFORMATION"
                        className="px-2"
                        rightElement={<Icons.School size={16} color="#6366f1" />}
                    />
                    <AppCard className="p-5">
                        <LabeledInput 
                            label="School Name"
                            value={schoolDetails?.name || "Oureduca Hub"}
                            editable={false}
                        />
                        <LabeledInput 
                            label="School Address"
                            value={formData.address}
                            onChangeText={(text: string) => setFormData({...formData, address: text})}
                            multiline
                        />
                        <LabeledInput 
                            label="Support Email"
                            value={formData.supportEmail}
                            onChangeText={(text: string) => setFormData({...formData, supportEmail: text})}
                            keyboardType="email-address"
                        />
                        <LabeledInput 
                            label="Principal / Contact Person"
                            value={formData.contactPerson}
                            onChangeText={(text: string) => setFormData({...formData, contactPerson: text})}
                        />
                    </AppCard>
                </View>

                {/* Section: Payment Settings */}
                <View className="mb-6">
                    <SectionHeader 
                        title="PAYMENT SETTINGS"
                        className="px-2"
                        rightElement={
                            <View className="bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 shadow-sm">
                                <Text className="text-emerald-700 text-[8px] font-black uppercase tracking-widest font-inter-black">Ready</Text>
                            </View>
                        }
                    />
                    <AppCard className="p-5">
                        <LabeledInput 
                            label="Bank Name"
                            value={formData.bankName}
                            onChangeText={(text: string) => setFormData({...formData, bankName: text})}
                            placeholder="e.g. HDFC Bank"
                        />
                        <LabeledInput 
                            label="Account Number"
                            value={formData.accountNumber}
                            onChangeText={(text: string) => setFormData({...formData, accountNumber: text})}
                            keyboardType="numeric"
                        />
                        <LabeledInput 
                            label="UPI ID"
                            value={formData.upiId}
                            onChangeText={(text: string) => setFormData({...formData, upiId: text})}
                            placeholder="e.g. school@upi"
                        />
                    </AppCard>
                </View>

                {/* Section: Academic Status */}
                <View className="mb-6">
                    <SectionHeader 
                        title="ACADEMIC STATUS"
                        className="px-2"
                        rightElement={<Icons.Calendar size={16} color="#6366f1" />}
                    />
                    <AppCard className="p-4">
                        <View className="flex-row justify-between items-center">
                            <View className="flex-row items-center flex-1">
                                <View className="w-10 h-10 rounded-xl bg-indigo-50/50 items-center justify-center mr-3 border border-indigo-100/30">
                                    <Icons.Activity size={18} color={isAcademicYearActive ? '#16a34a' : '#ef4444'} />
                                </View>
                                <View>
                                    <Text className="text-[14px] font-black text-gray-900 tracking-tight font-inter-black">Current Session</Text>
                                    <Text className="text-[9px] text-gray-400 font-black uppercase tracking-widest mt-0.5 font-inter-black">ACTIVE NOW</Text>
                                </View>
                            </View>
                            <Switch 
                                value={isAcademicYearActive}
                                onValueChange={() => {}}
                                trackColor={{ false: '#e2e8f0', true: '#6366f1' }}
                                thumbColor="#ffffff"
                                disabled={true}
                            />
                        </View>
                    </AppCard>
                </View>

                {/* Section: Live Cameras */}
                <View className="mb-6">
                    <SectionHeader 
                        title="LIVE CAMERAS"
                        className="px-2"
                        rightElement={
                            <TouchableOpacity 
                                onPress={() => setShowAddNode(!showAddNode)}
                                className={`w-8 h-8 rounded-lg items-center justify-center shadow-sm active:scale-95 ${showAddNode ? 'bg-indigo-600' : 'bg-white border border-indigo-100'}`}
                            >
                                <Icons.Plus size={14} color={showAddNode ? 'white' : '#6366f1'} />
                            </TouchableOpacity>
                        }
                    />
                    <AppCard className="p-0 overflow-hidden">
                        {showAddNode && (
                            <View className="p-5 border-b border-gray-50 bg-indigo-50/30">
                                <Text className="text-[9px] font-black text-indigo-600 uppercase tracking-widest mb-4 font-inter-black text-center">ADD NEW CAMERA</Text>
                                <LabeledInput 
                                    label="Camera Name"
                                    placeholder="e.g. Science Lab CCTV 1"
                                    value={newNode.name}
                                    onChangeText={(t: string) => setNewNode({...newNode, name: t})}
                                    editable={true}
                                />
                                <LabeledInput 
                                    label="Camera Stream URL"
                                    placeholder="https://stream.url/feed"
                                    value={newNode.url}
                                    onChangeText={(t: string) => setNewNode({...newNode, url: t})}
                                    editable={true}
                                />
                                <View className="flex-row justify-end gap-2 mt-2">
                                    <AppButton 
                                        label="Cancel"
                                        variant="outline"
                                        size="small"
                                        onPress={() => setShowAddNode(false)}
                                    />
                                    <AppButton 
                                        label="Add Camera"
                                        variant="primary"
                                        size="small"
                                        onPress={handleAddCameraNode}
                                        isLoading={isSubmittingNode}
                                    />
                                </View>
                            </View>
                        )}

                        <View className="px-4">
                            {dbCameraNodes.map((node, index) => (
                                <AppRow
                                    key={node.id}
                                    title={node.name}
                                    subtitle={node.stream_url || 'No URL configured'}
                                    statusDot={node.status === 'ONLINE' ? 'active' : 'danger'}
                                    avatarIcon={<Icons.Camera size={14} color="#6366f1" />}
                                    avatarBg="#f5f7ff"
                                    pills={
                                        <StatusPill
                                            label={node.status || 'OFFLINE'}
                                            type={node.status === 'ONLINE' ? 'success' : 'danger'}
                                        />
                                    }
                                    showBorder={index < dbCameraNodes.length - 1}
                                    className="px-0"
                                    swipeAction={{
                                        label: 'Remove',
                                        bgColor: 'bg-rose-500',
                                        icon: <Icons.Trash size={16} color="white" />,
                                        onPress: () => deleteCameraNode(node.id, schoolDetails?.id || ''),
                                    }}
                                />
                            ))}
                            {dbCameraNodes.length === 0 && !showAddNode && (
                                <View className="py-12 items-center justify-center">
                                    <View className="w-12 h-12 bg-gray-50 rounded-2xl items-center justify-center mb-4 border border-gray-100">
                                        <Icons.Camera size={24} color="#e5e7eb" />
                                    </View>
                                    <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest text-center font-inter-black">No cameras registered yet</Text>
                                </View>
                            )}
                        </View>
                    </AppCard>
                </View>

                {/* Section: Support Link */}
                <TouchableOpacity activeOpacity={0.9} className="active:scale-95 transition-all">
                    <LinearGradient 
                        colors={['#1e293b', '#0f172a']}
                        start={{x: 0, y: 0}} end={{x: 1, y: 0}}
                        className="p-6 rounded-[32px] shadow-2xl flex-row items-center justify-between mb-8"
                    >
                        <View className="flex-1 pr-4">
                            <Text className="text-white font-black text-lg tracking-tight font-inter-black">Help & Support</Text>
                            <Text className="text-indigo-400 text-[9px] mt-1.5 leading-relaxed font-black uppercase tracking-widest font-inter-black">
                                CONTACT OUREDUCA TEAM
                            </Text>
                        </View>
                        <View className="bg-white/10 w-12 h-12 rounded-2xl border border-white/5 items-center justify-center">
                            <Icons.Phone size={20} color="white" />
                        </View>
                    </LinearGradient>
                </TouchableOpacity>

                {/* Build Signature */}
                <View className="mt-4 items-center opacity-30">
                    <View className="w-8 h-0.5 bg-gray-300 rounded-full mb-3" />
                    <Text className="text-[9px] font-black text-gray-500 uppercase tracking-widest font-inter-black">School Settings v1.4.2</Text>
                    <Text className="text-[8px] font-bold text-gray-400 mt-1.5 uppercase tracking-widest font-inter-black">Secure Connection Established</Text>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

