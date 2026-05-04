import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { styled } from 'nativewind';
import { Icons } from '../../../../components/Icons';
import { HardwareStreamPlayer } from '../../../../components/HardwareStreamPlayer';
import { useSchoolData } from '../../../../contexts/SchoolDataContext';
import { CameraNode } from '../../../../types';
import { AppTheme, AppCard, AppTypography, SectionHeader } from '../../../design-system';

const StyledLinearGradient = LinearGradient ? styled(LinearGradient) : View;

interface MentorMonitorProps {
    assignedClassId: string | null;
    assignedSection: string | null;
    assignedClassName?: string;
}

export const MentorMonitor: React.FC<MentorMonitorProps> = ({ 
    assignedClassId, 
    assignedSection,
    assignedClassName 
}) => {
    const { dbCameraNodes, fetchCameraNodes, schoolDetails } = useSchoolData();
    const [filteredNodes, setFilteredNodes] = useState<CameraNode[]>([]);

    useEffect(() => {
        if (schoolDetails?.id) {
            fetchCameraNodes(schoolDetails.id);
        }
    }, [schoolDetails?.id]);

    useEffect(() => {
        if (assignedClassId) {
            const filtered = dbCameraNodes.filter(node => 
                node.target_class_id === assignedClassId && 
                node.target_section === assignedSection
            );
            setFilteredNodes(filtered);
        }
    }, [dbCameraNodes, assignedClassId, assignedSection]);

    return (
        <View className="flex-1 bg-[#f5f7ff]">
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Premium Observer Header */}
                <StyledLinearGradient
                    colors={AppTheme.colors.gradients.brand}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    className="px-8 pt-16 pb-20 rounded-b-[48px] shadow-2xl shadow-indigo-200/50"
                >
                    <View className="flex-row items-center justify-between mb-8">
                        <View>
                            <Text className="text-3xl font-black text-white tracking-tighter font-inter-black">Classroom View</Text>
                            <Text className="text-indigo-100/60 text-[10px] font-black uppercase tracking-[3px] mt-2 font-inter-black">MONITORING HUB</Text>
                        </View>
                        <View className="w-14 h-14 bg-white/10 rounded-2xl items-center justify-center border border-white/20 backdrop-blur-md shadow-lg">
                            <Icons.Shield size={28} color="white" />
                        </View>
                    </View>

                    <View className="bg-white/10 border border-white/20 rounded-2xl px-5 py-4 backdrop-blur-md">
                        <Text className="text-white text-[11px] font-black uppercase tracking-[1px] font-inter-black">LIVE STREAMING MODE</Text>
                        <Text className="text-indigo-100 font-inter-medium text-[13px] mt-1 opacity-80">
                            Viewing {assignedClassName || 'Class'} - Section {assignedSection || 'N/A'}
                        </Text>
                    </View>
                </StyledLinearGradient>

                <View className="px-6 -mt-10">
                    <View className="flex-row items-center mb-3 px-2">
                        <View className="w-1 h-4 bg-indigo-500 rounded-full mr-2" />
                        <Text className="text-[10px] font-black text-gray-900 uppercase tracking-[2px] font-inter-black">CLASS CAMERAS</Text>
                        <View className="ml-3 bg-indigo-50 px-2 py-0.5 rounded-full">
                            <Text className="text-[9px] font-black text-indigo-600 uppercase font-inter-black">{filteredNodes.length} ONLINE</Text>
                        </View>
                    </View>

                    {filteredNodes.length > 0 ? (
                        filteredNodes.map((node) => (
                            <AppCard key={node.id} className="p-0 overflow-hidden mb-8 border border-white shadow-xl shadow-indigo-100/30">
                                <View className="p-5 flex-row justify-between items-center bg-gray-50/50 border-b border-gray-100">
                                    <View className="flex-row items-center">
                                        <View className="w-12 h-12 rounded-2xl bg-indigo-50 items-center justify-center mr-4 border border-indigo-100/50 shadow-sm">
                                            <Icons.Camera size={20} color="#4f46e5" />
                                        </View>
                                        <View>
                                            <Text className="text-[15px] font-black text-gray-900 tracking-tight font-inter-black">{node.name}</Text>
                                            <Text className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mt-0.5 font-inter-black">STATUS: CONNECTED</Text>
                                        </View>
                                    </View>
                                    <View className="bg-emerald-50 px-3 py-1.5 rounded-xl flex-row items-center border border-emerald-100/50">
                                        <View className="w-2 h-2 rounded-full bg-emerald-500 mr-2 shadow-sm shadow-emerald-500" />
                                        <Text className="text-[9px] font-black text-emerald-600 uppercase tracking-widest font-inter-black">Live</Text>
                                    </View>
                                </View>
                                
                                <View className="aspect-video bg-slate-950">
                                    <HardwareStreamPlayer 
                                        url={node.stream_url} 
                                        style={{ flex: 1 }}
                                    />
                                </View>
                                
                                <View className="p-5 flex-row gap-6 bg-white">
                                    <View className="flex-row items-center">
                                        <Icons.Radio size={12} color="#94a3b8" />
                                        <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 font-inter-black">High Definition</Text>
                                    </View>
                                    <View className="flex-row items-center">
                                        <Icons.Lock size={12} color="#94a3b8" />
                                        <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 font-inter-black">Secured Feed</Text>
                                    </View>
                                </View>
                            </AppCard>
                        ))
                    ) : (
                        <AppCard className="py-24 items-center justify-center border-dashed border-gray-200">
                            <View className="w-20 h-20 rounded-[30px] bg-gray-50 items-center justify-center mb-6 border border-gray-100 shadow-inner">
                                <Icons.VideoOff size={32} color="#cbd5e1" />
                            </View>
                            <Text className="text-xl font-black text-gray-900 tracking-tight font-inter-black">No Cameras Found</Text>
                            <View className="px-10 mt-3 mb-8">
                                <Text className="text-[11px] text-gray-400 text-center leading-relaxed font-inter-black uppercase tracking-widest opacity-60">
                                    No authorized cameras are configured for Section {assignedSection || 'N/A'}.
                                </Text>
                            </View>
                            
                            <TouchableOpacity className="bg-indigo-600 px-8 py-4 rounded-2xl shadow-xl shadow-indigo-100 active:scale-95">
                                <Text className="text-white text-[11px] font-black uppercase tracking-widest font-inter-black">Contact Support</Text>
                            </TouchableOpacity>
                        </AppCard>
                    )}

                    {/* Premium Security Banner */}
                    <StyledLinearGradient
                        colors={['#1e1b4b', '#312e81']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        className="p-8 rounded-[40px] shadow-2xl shadow-indigo-950/20 overflow-hidden relative border border-white/10"
                    >
                        <View className="relative z-10">
                            <View className="flex-row items-center mb-6">
                                <View className="bg-white/10 p-2 rounded-xl border border-white/10 backdrop-blur-md">
                                    <Icons.Activity size={18} color="white" />
                                </View>
                                <Text className="text-white font-black text-[10px] uppercase tracking-[3px] ml-3 font-inter-black">Safety & Privacy</Text>
                            </View>
                            <Text className="text-white text-[13px] leading-relaxed font-inter-medium opacity-80">
                                You are viewing the live feed for your classroom. Access is private, secured, and used solely for educational oversight.
                            </Text>
                        </View>
                        <View className="absolute -bottom-10 -right-10 opacity-10 rotate-12">
                            <Icons.Shield size={160} color="white" />
                        </View>
                    </StyledLinearGradient>
                </View>

                <View className="h-40" />
            </ScrollView>
        </View>
    );
};
