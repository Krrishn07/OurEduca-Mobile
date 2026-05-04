import React from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { Icons } from './Icons';
import { UserRole } from '../types';

interface RestrictedAccessViewProps {
    featureName: string;
    onContactAdmin?: () => void;
    role?: UserRole;
}

const { width } = Dimensions.get('window');

export const RestrictedAccessView: React.FC<RestrictedAccessViewProps> = ({ 
    featureName, 
    onContactAdmin,
    role
}) => {
    let message = "This module has been restricted for your role. Please contact your institution's administrator to request access.";
    let buttonLabel = "Contact Administrator";
    let showShield = false;

    if (role === UserRole.PLATFORM_ADMIN) {
        message = "Administrative Access Restricted. This system-level module is currently locked or undergoing maintenance in the global registry.";
        buttonLabel = "Contact Developer Support";
        showShield = true;
    } else if (role === UserRole.SUPER_ADMIN) {
        message = "Institutional Access Restricted. This feature is not available for your current subscription tier or has been disabled by platform administration.";
        buttonLabel = "Contact Platform Support";
        showShield = true;
    } else {
        // Fallback for Staff/Teachers/Mentors/Students
        message = "Access Restricted. This module has been disabled for your role by your institution's administrator.";
        buttonLabel = "Contact Institution Admin";
        showShield = false;
    }

    return (
        <View className="flex-1 bg-gray-50 items-center justify-center px-8 py-10">
            {/* Background Decorative Element */}
            <View 
                style={{ 
                    position: 'absolute', 
                    top: -100, 
                    right: -100, 
                    width: 300, 
                    height: 300, 
                    borderRadius: 150, 
                    backgroundColor: 'rgba(79, 70, 229, 0.03)' 
                }} 
            />
            
            <View className="w-full bg-white rounded-[40px] p-8 items-center shadow-2xl shadow-indigo-100 border border-gray-50 my-6">
                {/* Shield Icon with Glow */}
                <View className="mb-6 overflow-visible">
                    <View 
                        style={{ 
                            shadowColor: '#6366f1', 
                            shadowOffset: { width: 0, height: 10 }, 
                            shadowOpacity: 0.2, 
                            shadowRadius: 20 
                        }}
                        className="bg-indigo-50/50 p-6 rounded-[32px] border border-indigo-100/50"
                    >
                        <Icons.Shield size={48} color="#6366f1" />
                    </View>
                    
                    {/* Tiny Lock Badge */}
                    <View className="absolute -bottom-2 -right-2 bg-rose-500 p-2 rounded-full border-4 border-white">
                        <Icons.Lock size={14} color="white" />
                    </View>
                </View>

                {/* Text Content */}
                <View className="items-center mb-8">
                    <Text className="text-gray-400 font-black text-[10px] uppercase tracking-[3px] mb-3">
                        Security Protocol
                    </Text>
                    <Text className="text-xl font-black text-gray-900 text-center tracking-tight mb-4 px-4">
                        {featureName} Restricted
                    </Text>
                    <Text className="text-sm text-gray-500 text-center leading-relaxed font-medium px-2">
                        {message}
                    </Text>
                </View>

                {/* Action */}
                <TouchableOpacity 
                    onPress={onContactAdmin}
                    className="w-full bg-indigo-600 py-4 rounded-2xl items-center shadow-lg shadow-indigo-200"
                >
                    <View className="flex-row items-center">
                        {showShield ? <Icons.Shield size={18} color="white" /> : <Icons.Messages size={18} color="white" />}
                        <Text className="text-white font-black text-[11px] uppercase tracking-widest ml-2">{buttonLabel}</Text>
                    </View>
                </TouchableOpacity>

                {/* Secondary Info */}
                <View className="mt-8 pt-6 border-t border-gray-50 w-full">
                    <View className="flex-row items-center justify-center">
                        <Icons.Info size={14} color="#9ca3af" />
                        <Text className="text-[10px] text-gray-400 font-black uppercase tracking-widest ml-2">
                           ID: SEC-RES-403
                        </Text>
                    </View>
                </View>
            </View>

            {/* Bottom Branding */}
            <View className="py-6 items-center opacity-30">
                <Text className="text-[10px] font-black text-gray-400 uppercase tracking-[4px]">
                    Oureduca Security
                </Text>
            </View>
        </View>
    );
};
