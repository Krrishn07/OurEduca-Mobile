import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { Icons } from '@components/common/Icons';
import { supabase } from '@lib/supabase';
import { useMockAuth } from '@context/MockAuthContext';
import { useSchoolData } from '@context/SchoolDataContext';
import { AppCard, AppRow, SectionHeader, StatusPill, AppButton } from '@components/common';
import { triggerHaptic } from '@utils/haptics';
import ReAnimated, { FadeInDown } from 'react-native-reanimated';

interface TeacherApprovalsProps {
    onBack?: () => void;
}

export const TeacherApprovals: React.FC<TeacherApprovalsProps> = ({ onBack }) => {
    const { currentUser } = useMockAuth();
    const { logSystemActivity } = useSchoolData();
    const [requests, setRequests] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    const fetchRequests = useCallback(async () => {
        if (!currentUser?.school_id || !currentUser?.id) return;
        setIsLoading(true);
        try {
            // 1. Get classes and sections where this teacher is a mentor
            const { data: roster, error: rosterError } = await supabase
                .from('class_roster')
                .select('class_id, section')
                .eq('user_id', currentUser.id)
                .eq('role_in_class', 'mentor');
            
            if (rosterError) throw rosterError;

            if (!roster || roster.length === 0) {
                setRequests([]);
                return;
            }

            const myClassIds = roster.map(r => r.class_id);

            // 2. Fetch requests only for those classes
            const { data, error } = await supabase
                .from('student_onboarding_requests')
                .select('*, classes(name)')
                .eq('school_id', currentUser.school_id)
                .in('class_id', myClassIds)
                .eq('status', 'pending')
                .order('created_at', { ascending: false });
            
            if (error) throw error;

            // 3. Filter by section locally to ensure strict mentor mapping
            const filteredData = (data || []).filter(req => 
                roster.some(r => r.class_id === req.class_id && r.section === req.section)
            );

            setRequests(filteredData);
        } catch (err: any) {
            console.error('[APPROVALS] Fetch Error:', err.message);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    }, [currentUser?.school_id, currentUser?.id]);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    const handleAction = async (requestId: string, status: 'approved' | 'rejected') => {
        const request = requests.find(r => r.id === requestId);
        if (!request) return;

        setIsProcessing(requestId);
        triggerHaptic();

        try {
            if (status === 'approved') {
                // 1. Check if user already exists in 'users'
                let userId: string;
                const { data: existingUser } = await supabase
                    .from('users')
                    .select('id')
                    .eq('phone', request.phone)
                    .maybeSingle();
                
                if (existingUser) {
                    userId = existingUser.id;
                } else {
                    // 2. Create new user record
                    const { data: newUser, error: userError } = await supabase
                        .from('users')
                        .insert({
                            name: request.full_name,
                            phone: request.phone,
                            role: 'student',
                            school_id: request.school_id
                        })
                        .select('id')
                        .single();
                    
                    if (userError) throw userError;
                    userId = newUser.id;
                }

                // 3. Add to roster
                const { error: rosterError } = await supabase
                    .from('class_roster')
                    .insert({
                        class_id: request.class_id,
                        user_id: userId,
                        role_in_class: 'student',
                        section: request.section || 'A'
                    });
                
                if (rosterError) throw rosterError;
            }

            // 4. Update request status
            const { error: updateError, data: updateData } = await supabase
                .from('student_onboarding_requests')
                .update({ status: status })
                .eq('id', requestId)
                .select();
            
            console.log('[APPROVALS] Update Result:', { requestId, status, updateData, updateError });
            
            if (updateError) throw updateError;

            if (!updateData || updateData.length === 0) {
                triggerHaptic();
                Alert.alert(
                    "Verification Failed", 
                    "Could not update status. This usually means the database policy (RLS) is blocking the admin role.\n\nAction: Please ensure you have applied the SQL migration in 'student_onboarding_requests.sql' via the Supabase dashboard."
                );
                return;
            }

            // 5. Log Activity
            await logSystemActivity(
                request.school_id,
                `Student ${status.toUpperCase()}: ${request.full_name} (${request.classes?.name})`,
                status === 'approved' ? 'CheckCircle' : 'XCircle',
                status === 'approved' ? '#10b981' : '#f43f5e',
                currentUser?.id,
                'SYSTEM'
            );

            // 6. Refresh List & Final Feedback
            setRequests(prev => prev.filter(r => r.id !== requestId));
            triggerHaptic();
            
            if (status === 'approved') {
                Alert.alert("Student Verified", `${request.full_name} has been added to the class roster and can now log in.`);
            } else {
                Alert.alert("Request Rejected", `The onboarding request for ${request.full_name} has been declined.`);
            }

        } catch (err: any) {
            triggerHaptic();
            Alert.alert("Process Failed", err.message || "Could not update request status.");
        } finally {
            setIsLoading(false);
            setIsProcessing(null);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchRequests();
    };

    if (isLoading && !refreshing) {
        return (
            <View className="flex-1 items-center justify-center">
                <ActivityIndicator color="#6366f1" />
                <Text className="text-[10px] font-black text-gray-400 uppercase tracking-[2px] mt-4 font-inter-black">Scanning Pending Requests...</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-[#f5f7ff]">
            <ScrollView 
                className="flex-1"
                contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366f1" />}
            >
                {onBack && (
                    <TouchableOpacity onPress={onBack} className="flex-row items-center mb-6">
                        <View className="bg-white p-2 rounded-full mr-3 shadow-sm">
                            <Icons.ChevronRight size={16} color="#4b5563" style={{ transform: [{rotate: '180deg'}] }} />
                        </View>
                        <Text className="text-gray-500 font-inter-bold text-sm">Return to Dashboard</Text>
                    </TouchableOpacity>
                )}

                <SectionHeader 
                    title="STUDENT APPROVALS" 
                    rightElement={<StatusPill label={`${requests.length} Pending`} type="neutral" />}
                />

                {requests.length > 0 ? (
                    requests.map((req, idx) => (
                        <ReAnimated.View key={req.id} entering={FadeInDown.delay(idx * 100).duration(500)}>
                            <AppCard className="mb-4 p-5 border border-white shadow-xl shadow-indigo-100/30">
                                <View className="flex-row items-center mb-4">
                                    <View className="w-12 h-12 bg-indigo-50 rounded-2xl items-center justify-center mr-4 border border-indigo-100/50">
                                        <Icons.Profile size={20} color="#4f46e5" />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-[16px] font-black text-gray-900 font-inter-black">{req.full_name}</Text>
                                        <Text className="text-[11px] text-gray-400 font-inter-medium">{req.phone}</Text>
                                    </View>
                                    <View className="items-end">
                                        <Text className="text-[10px] font-black text-indigo-600 uppercase tracking-[1px] font-inter-black">{req.classes?.name}</Text>
                                        <Text className="text-[9px] text-gray-400 font-inter-medium">Section {req.section}</Text>
                                    </View>
                                </View>

                                <View className="flex-row gap-3">
                                    <TouchableOpacity 
                                        onPress={() => handleAction(req.id, 'rejected')}
                                        disabled={!!isProcessing}
                                        className="flex-1 bg-rose-50 py-3 rounded-xl border border-rose-100 items-center justify-center"
                                    >
                                        <Text className="text-rose-600 font-black text-[10px] uppercase tracking-[1px] font-inter-black">Reject</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity 
                                        onPress={() => handleAction(req.id, 'approved')}
                                        disabled={!!isProcessing}
                                        className="flex-[2] bg-indigo-600 py-3 rounded-xl shadow-lg shadow-indigo-100 items-center justify-center"
                                    >
                                        {isProcessing === req.id ? (
                                            <ActivityIndicator color="white" size="small" />
                                        ) : (
                                            <Text className="text-white font-black text-[10px] uppercase tracking-[1px] font-inter-black">Approve & Roster</Text>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            </AppCard>
                        </ReAnimated.View>
                    ))
                ) : (
                    <View className="items-center py-20 opacity-30">
                        <Icons.ShieldCheck size={40} color="#6366f1" />
                        <Text className="text-[10px] font-black text-gray-400 uppercase tracking-[2px] mt-4 font-inter-black">Queue is clear</Text>
                        <Text className="text-[9px] text-gray-400 mt-1 font-inter-bold">All onboarding requests processed</Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
};
