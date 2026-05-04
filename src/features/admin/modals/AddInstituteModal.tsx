import React from 'react';
import { View, Text, TouchableOpacity, TextInput, Modal, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Icons } from '../../../../components/Icons';
import { LinearGradient } from 'expo-linear-gradient';
import { PlatformColors, PlatformRadius, PlatformTheme, PlatformShadows } from '../../platform/theme';
import { styled } from 'nativewind';

const StyledLinearGradient = LinearGradient ? styled(LinearGradient) : View;

interface AddInstituteModalProps {
  visible: boolean;
  onClose: () => void;
  instForm: { name: string; plan: string; status: string; hmName: string; hmEmail: string; hmPhone: string };
  setInstForm: (form: any) => void;
  instModalStep: number;
  setInstModalStep: (step: number) => void;
  onAdd: () => void;
  showToast: (msg: string) => void;
}

export const AddInstituteModal: React.FC<AddInstituteModalProps> = ({
  visible,
  onClose,
  instForm,
  setInstForm,
  instModalStep,
  setInstModalStep,
  onAdd,
  showToast,
}) => {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View className="flex-1 bg-black/60 justify-end">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="w-full">
          <View className="bg-white rounded-t-[40px] overflow-hidden shadow-2xl">
            {/* 1. Platinum Header - Indigo Glassmorphism */}
            <StyledLinearGradient
                colors={PlatformColors.gradients.indigo}
                start={{x: 0, y: 0}} 
                end={{x: 1, y: 0}}
                className="px-8 pt-10 pb-6 flex-row justify-between items-center"
            >
                <View className="flex-row items-center">
                    <View className="w-11 h-11 rounded-2xl bg-white/10 border border-white/20 items-center justify-center mr-4 backdrop-blur-md">
                        <Icons.School size={22} color="white" />
                    </View>
                    <View>
                        <Text className="text-xl font-black text-white tracking-tighter">
                            {instModalStep === 1 ? 'School Profile' : 'Finalize Setup'}
                        </Text>
                        <Text className="text-yellow-300 text-[10px] font-black uppercase tracking-[3px] mt-1 opacity-90">Step {instModalStep} of 2</Text>
                    </View>
                </View>
                <TouchableOpacity onPress={onClose} className="bg-white/10 p-3 rounded-full border border-white/10 active:scale-95">
                    <Icons.Close size={20} color="white" />
                </TouchableOpacity>
            </StyledLinearGradient>

            {/* Progress Bar - Platinum Indigo */}
            <View className="h-1.5 w-full bg-indigo-50 flex-row">
                <View className={`h-full flex-1 ${instModalStep >= 1 ? 'bg-indigo-600' : 'bg-transparent'}`} />
                <View className={`h-full flex-1 ${instModalStep >= 2 ? 'bg-indigo-600' : 'bg-transparent'}`} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} className="p-6 bg-surface-subtle">
                {instModalStep === 1 ? (
                    <View className="pb-4">
                        <View className="bg-white p-5 rounded-2xl border border-white shadow-sm mb-5">
                            <Text className="text-[9px] font-black text-gray-400 mb-3.5 uppercase tracking-widest px-1">School Name</Text>
                            <TextInput 
                                className="bg-gray-50/50 rounded-xl p-4 text-[13px] font-black text-gray-900 border border-gray-100" 
                                placeholder="e.g. Springfield Academy" 
                                placeholderTextColor="#94a3b8"
                                value={instForm.name} 
                                onChangeText={t => setInstForm({...instForm, name: t})} 
                            />
                        </View>

                        <View className="bg-white p-5 rounded-2xl border border-white shadow-sm mb-8">
                            <Text className="text-[9px] font-black text-gray-400 mb-4 uppercase tracking-widest px-1">Select Plan</Text>
                            <View className="flex-row gap-3">
                                {['Basic', 'Pro', 'Enterprise'].map(plan => {
                                    const isActive = instForm.plan === plan;
                                    return (
                                        <TouchableOpacity 
                                            key={plan}
                                            onPress={() => setInstForm({...instForm, plan})}
                                            className={`flex-1 items-center py-4 rounded-xl border ${isActive ? 'border-primary bg-primary-10 shadow-sm' : 'border-gray-100 bg-gray-50'}`}
                                        >
                                            <Text className={`font-black text-[10px] uppercase tracking-widest ${isActive ? 'text-primary' : 'text-gray-400'}`}>{plan}</Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>

                        <TouchableOpacity 
                            onPress={() => { if(instForm.name) setInstModalStep(2); else showToast("Please enter a school name"); }} 
                            className="w-full py-5 bg-primary rounded-2xl items-center shadow-xl shadow-indigo-100 active:scale-95"
                        >
                            <Text className="text-[11px] font-black text-white uppercase tracking-[4px]">Next Step</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View className="pb-4">
                        <View className="bg-white p-5 rounded-2xl border border-white shadow-sm mb-5">
                            <View className="mb-5">
                                <Text className="text-[9px] font-black text-gray-400 mb-3 uppercase tracking-widest px-1">Principal Name</Text>
                                <TextInput className="bg-gray-50/50 rounded-xl p-4 text-[13px] font-black text-gray-900 border border-gray-100" placeholder="Full Legal Name" placeholderTextColor="#94a3b8" value={instForm.hmName} onChangeText={t => setInstForm({...instForm, hmName: t})} />
                            </View>
                            <View className="mb-5">
                                <Text className="text-[9px] font-black text-gray-400 mb-3 uppercase tracking-widest px-1">Principal Email</Text>
                                <TextInput className="bg-gray-50/50 rounded-xl p-4 text-[13px] font-black text-gray-600 border border-gray-100" placeholder="principal@school.edu" placeholderTextColor="#94a3b8" autoCapitalize="none" keyboardType="email-address" value={instForm.hmEmail} onChangeText={t => setInstForm({...instForm, hmEmail: t})} />
                            </View>
                            <View>
                                <Text className="text-[9px] font-black text-gray-400 mb-3 uppercase tracking-widest px-1">Principal Phone</Text>
                                <TextInput className="bg-gray-50/50 rounded-xl p-4 text-[13px] font-black text-gray-600 border border-gray-100" placeholder="+91 00000 00000" placeholderTextColor="#94a3b8" keyboardType="phone-pad" value={instForm.hmPhone} onChangeText={t => setInstForm({...instForm, hmPhone: t})} />
                            </View>
                        </View>

                        {/* Operational Status Selector */}
                        <View className="bg-white p-5 rounded-2xl border border-white shadow-sm mb-8">
                            <Text className="text-[9px] font-black text-gray-400 mb-4 uppercase tracking-widest px-1">Operational Status</Text>
                            <View className="flex-row gap-3">
                                {[
                                    { label: 'Active', value: 'ACTIVE', color: '#10b981', bg: 'bg-emerald-50' },
                                    { label: 'Pending', value: 'PENDING', color: '#f59e0b', bg: 'bg-amber-50' }
                                ].map(status => {
                                    const isActive = instForm.status === status.value;
                                    return (
                                        <TouchableOpacity 
                                            key={status.value}
                                            onPress={() => setInstForm({...instForm, status: status.value})}
                                            className={`flex-1 items-center py-4 rounded-xl border ${isActive ? 'border-indigo-600 bg-indigo-50/30' : 'border-gray-100 bg-gray-50'}`}
                                        >
                                            <Text className={`font-black text-[10px] uppercase tracking-widest ${isActive ? 'text-indigo-600' : 'text-gray-400'}`}>{status.label}</Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                            <Text className="text-[9px] text-gray-400 italic mt-3 px-1 leading-3">
                                {instForm.status === 'ACTIVE' 
                                    ? 'Node will be immediately accessible to staff.' 
                                    : 'Node will be created but locked in the Pending queue.'}
                            </Text>
                        </View>

                        <View className="flex-row gap-4 mb-4">
                            <TouchableOpacity onPress={() => setInstModalStep(1)} className="flex-1 py-5 bg-gray-50 rounded-2xl items-center border border-gray-200 active:scale-95">
                                <Text className="text-[11px] font-black text-gray-400 uppercase tracking-[4px]">Back</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={onAdd} className="flex-[2] py-5 bg-primary rounded-2xl items-center shadow-xl shadow-indigo-100 active:scale-95">
                                <Text className="text-white font-black text-[11px] uppercase tracking-[4px]">Create School</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </ScrollView>
            <View className="h-6 bg-surface-subtle" />
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};
