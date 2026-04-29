import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { styled } from 'nativewind';
import { Icons } from '../../../../components/Icons';
import { User } from '../../../../types';
import { AppTheme, AppCard, AppTypography, AppRow, StatusPill, SectionHeader } from '../../../design-system';

const StyledLinearGradient = LinearGradient ? styled(LinearGradient) : View;

interface StudentProfileProps {
  currentUser: User;
  onLogout: () => void;
  onEditProfile: () => void;
  onAccountSecurity?: () => void;
}

export const StudentProfile: React.FC<StudentProfileProps> = ({ 
  currentUser,
  onLogout,
  onEditProfile,
  onAccountSecurity,
}) => (
  <ScrollView className="flex-1 bg-[#f5f7ff]" showsVerticalScrollIndicator={false}>
    {/* Platinum Brand Hero — Role Synchronized */}
    <View className="relative z-20">
        <StyledLinearGradient 
          colors={AppTheme.colors.gradients.brand}
          start={{x: 0, y: 0}} end={{x: 1, y: 1}}
          className="h-[140px] rounded-b-[40px] shadow-xl shadow-indigo-200/50"
        />
        
        {/* Avatar Cluster — Standardized metrics */}
        <View className="absolute -bottom-10 left-6 p-1.5 rounded-[24px] bg-white shadow-xl shadow-indigo-200 border border-gray-50 z-30">
            <View className="w-20 h-20 rounded-[20px] bg-indigo-50 items-center justify-center border border-indigo-100 overflow-hidden shadow-inner">
                {currentUser?.avatar_url ? (
                    <View className="w-full h-full items-center justify-center">
                        <Icons.Profile size={48} color="#4f46e5" />
                    </View>
                ) : (
                    <Text className="text-2xl font-black text-indigo-600 font-inter-black tracking-tighter">
                        {currentUser?.name?.charAt(0) || 'S'}
                    </Text>
                )}
            </View>
            <View className="absolute bottom-2 right-2 w-5 h-5 rounded-full bg-emerald-500 border-[3px] border-white shadow-sm shadow-emerald-500/40" />
        </View>
    </View>

    {/* Profile Title Block — Standardized mt */}
    <View className="px-6 mt-14 mb-5 relative z-10">
        <View className="flex-row justify-between items-start">
            <View className="flex-1 mr-4">
                <Text className="text-xl font-black text-gray-900 tracking-tighter leading-none mb-2 font-inter-black">{currentUser?.name}</Text>
                <View className="flex-row">
                    <StatusPill label="Academy Scholar" type="info" />
                </View>
            </View>
            <TouchableOpacity 
                onPress={onEditProfile}
                activeOpacity={0.7}
                className="bg-white border border-gray-100 shadow-md shadow-indigo-100/20 p-3 rounded-xl active:scale-95"
            >
                <Icons.Edit size={18} color="#4f46e5" />
            </TouchableOpacity>
        </View>
    </View>

    {/* Academic Identity Module — Standardized Header */}
    <View className="px-4 mb-5">
        <View className="flex-row items-center mb-3 px-2">
            <View className="w-1 h-4 bg-indigo-500 rounded-full mr-2" />
            <Text className="text-[10px] font-black text-gray-900 uppercase tracking-[2px] font-inter-black">Academic Identity</Text>
        </View>
        <AppCard className="p-0 overflow-hidden border border-white shadow-xl shadow-indigo-100/30">
            <AppRow 
                title={currentUser.email || 'not set'}
                subtitle="Institutional Email"
                avatarIcon={<Icons.Mail size={15} color="#4f46e5" />}
                avatarBg="#eef2ff"
                showBorder
                rightElement={<Icons.ChevronRight size={13} color="#d1d5db" />}
            />
            <AppRow 
                title={currentUser.rollNumber || (currentUser as any).roll_number || 'not assigned'}
                subtitle="Scholar Roll Number"
                avatarIcon={<Icons.User size={15} color="#4f46e5" />}
                avatarBg="#eef2ff"
                showBorder
                rightElement={<Icons.ChevronRight size={13} color="#d1d5db" />}
            />
            <AppRow 
                title={currentUser?.grade ? `Grade ${currentUser.grade}${currentUser.section ? ` - ${currentUser.section}` : ''}` : 'Not assigned'}
                subtitle="Current Cohort"
                avatarIcon={<Icons.Classes size={15} color="#4f46e5" />}
                avatarBg="#eef2ff"
                rightElement={<Icons.ChevronRight size={13} color="#d1d5db" />}
            />
        </AppCard>
    </View>

    {/* Security & Access Registry — Standardized Header */}
    <View className="px-4 mb-24">
        <View className="flex-row items-center mb-3 px-2">
            <View className="w-1 h-4 bg-indigo-500 rounded-full mr-2" />
            <Text className="text-[10px] font-black text-gray-900 uppercase tracking-[2px] font-inter-black">Account & Security</Text>
        </View>
        <AppCard className="p-0 overflow-hidden border border-white shadow-xl shadow-indigo-100/30">
            <AppRow 
                title="Security Credentials"
                subtitle="Password & Hub Access"
                avatarIcon={<Icons.Shield size={15} color="#4f46e5" />}
                avatarBg="#eef2ff"
                showBorder
                onPress={onAccountSecurity}
                rightElement={<Icons.ChevronRight size={13} color="#d1d5db" />}
            />
            <AppRow 
                title="Terminate Session"
                subtitle="Secure Logout"
                avatarIcon={<Icons.Logout size={15} color="#e11d48" />}
                avatarBg="#fff1f2"
                onPress={onLogout}
                rightElement={<Icons.ChevronRight size={13} color="#fca5a5" />}
            />
        </AppCard>

        {/* Platinum Terminal Signature — Synchronized */}
        <View className="mt-16 items-center opacity-30">
            <View className="w-8 h-0.5 bg-gray-300 rounded-full mb-4" />
            <Text className="text-[9px] font-black text-gray-400 uppercase tracking-[4px] font-inter-black text-center">Scholar Platform Node v2.0</Text>
            <Text className="text-[8px] font-black text-gray-400 mt-1 uppercase tracking-widest font-inter-black italic text-center">TLS 1.3 SECURE CONNECTION</Text>
        </View>
    </View>
  </ScrollView>
);
