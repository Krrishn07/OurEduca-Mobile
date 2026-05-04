import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, ActivityIndicator } from 'react-native';
import { supabase } from '../lib/supabase';
import { useMockAuth, DbUser } from '../contexts/MockAuthContext';
import { Icons } from './Icons';
import { NotificationService } from '../src/features/platform/services/NotificationService';

export const DevSimulationOverlay: React.FC = () => {
  const { setSession, currentUser, clearSession } = useMockAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<DbUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [schoolsMap, setSchoolsMap] = useState<Record<string, string>>({});
  const [mentorIds, setMentorIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isVisible) {
      loadSimulationData();
    }
  }, [isVisible]);

  const loadSimulationData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch all users
      const { data: users, error: userError } = await supabase
        .from('users')
        .select('*')
        .order('role');
      
      if (userError) throw userError;
      
      // 2. Fetch roster to identify mentors
      const { data: roster, error: rosterError } = await supabase
        .from('class_roster')
        .select('user_id')
        .eq('role_in_class', 'mentor');
      
      const mentors = new Set((roster || []).map(r => r.user_id));
      setMentorIds(mentors);

      setAvailableUsers((users || []).map(u => ({
          ...u,
          isMentor: mentors.has(u.id)
      })));

      // 2. Fetch all schools to map IDs to Names
      const { data: schools, error: schoolError } = await supabase
        .from('schools')
        .select('id, name');
        
      if (!schoolError && schools) {
        const map: Record<string, string> = {};
        schools.forEach(s => map[s.id] = s.name);
        setSchoolsMap(map);
      }
    } catch (err) {
      console.error('Failed to load simulation users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectUser = async (user: DbUser) => {
    await setSession(user.id);
    setIsVisible(false);
  };

  return (
    <>
      {/* Floating Trigger Button — Repositioned to Top Left for Zero Clutter */}
      <TouchableOpacity 
        onPress={() => setIsVisible(true)}
        className="absolute top-16 left-4 w-10 h-10 bg-indigo-600/90 rounded-2xl items-center justify-center shadow-xl z-50 border border-white/20"
        style={{ elevation: 5 }}
      >
        <Icons.Activity size={18} color="white" />
        <View className="absolute -bottom-1 -right-1 bg-red-600 rounded-lg px-1 py-0.5 border border-white shadow-sm">
          <Text className="text-[6px] text-white font-black uppercase">DEV</Text>
        </View>
      </TouchableOpacity>

      <Modal visible={isVisible} transparent animationType="slide">
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-white rounded-t-[40px] h-[80%] shadow-2xl">
            {/* Header */}
            <View className="p-8 border-b border-gray-50 flex-row justify-between items-center">
              <View>
                <Text className="text-2xl font-black text-gray-900">Simulation Hub</Text>
                <Text className="text-sm text-gray-500 mt-1">Select a real Supabase identity</Text>
              </View>
              <TouchableOpacity onPress={() => setIsVisible(false)} className="bg-gray-100 p-3 rounded-full">
                <Icons.Close size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>

            {isLoading ? (
              <View className="flex-1 items-center justify-center">
                <ActivityIndicator size="large" color="#4f46e5" />
                <Text className="text-gray-400 mt-4 font-medium">Fetching users from Supabase...</Text>
              </View>
            ) : (
              <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 24 }}>
                
                {currentUser && (
                    <View className="mb-6 bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
                        <Text className="text-indigo-900 font-black mb-1">Active Identity:</Text>
                        <Text className="text-indigo-700 text-sm">{currentUser.name} ({currentUser.role})</Text>
                        
                        <View className="flex-row gap-2 mt-4">
                            <TouchableOpacity onPress={clearSession} className="bg-white px-4 py-2 rounded-xl border border-indigo-200">
                                <Text className="text-indigo-600 font-black text-[11px]">Logout</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                              onPress={() => NotificationService.sendLocalTestNotification('Institutional Alert', 'A teacher has started a live session in Classroom 12-B.')}
                              className="bg-indigo-600 px-4 py-2 rounded-xl border border-indigo-500 flex-row items-center"
                            >
                                <Icons.Bell size={12} color="white" />
                                <Text className="text-white font-black text-[11px] ml-2">Test Push</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                <Text className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-4">Available DB Users</Text>
                
                <View className="gap-3">
                  {availableUsers.map(user => {
                    const isSelected = currentUser?.id === user.id;
                    return (
                        <TouchableOpacity 
                            key={user.id}
                            onPress={() => handleSelectUser(user)}
                            className={`p-4 rounded-2xl border ${isSelected ? 'border-indigo-500 bg-indigo-50' : 'border-gray-100 bg-gray-50'}`}
                        >
                            <View className="flex-row justify-between items-center">
                                <View>
                                    <Text className="font-black text-gray-900">{user.name}</Text>
                                    <View className="flex-row items-center mt-1">
                                        <View className={`rounded-md px-2 py-0.5 ${user.role === 'mentor' ? 'bg-indigo-100' : 'bg-gray-100'}`}>
                                            <Text className={`text-[9px] font-black uppercase ${user.role === 'mentor' || user.isMentor ? 'text-indigo-700' : 'text-gray-500'}`}>
                                                {(user.role === 'mentor' || user.isMentor) ? 'ADMIN_TEACHER' : user.role.toUpperCase()}
                                            </Text>
                                        </View>
                                        {(user.role === 'mentor' || user.isMentor) && (
                                            <View className="ml-2 bg-orange-100 px-2 py-0.5 rounded-md border border-orange-200">
                                                <Text className="text-[8px] font-black text-orange-700 uppercase">Class Mentor</Text>
                                            </View>
                                        )}
                                    </View>
                                    {user.school_id && (
                                        <Text className="text-[10px] text-indigo-500 font-black mt-1.5 px-1">
                                            🏢 {schoolsMap[user.school_id] || 'Unknown School'}
                                        </Text>
                                    )}
                                </View>
                                {isSelected && <Icons.Check size={20} color="#4f46e5" />}
                            </View>
                        </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
};
