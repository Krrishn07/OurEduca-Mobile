import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Image, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { styled } from 'nativewind';
import { Icons } from '../../../../components/Icons';
import { Video, useSchoolData, User } from '../../../../contexts/SchoolDataContext';
import { PlatformRadius, PlatformTypography } from '../../platform/theme';
import { PlatformCard } from '../../platform/components/PlatformCard';

const StyledLinearGradient = styled(LinearGradient);

interface HeadmasterVideosProps {
  videoList: Video[];
  onVideoPress: (video: Video) => void;
  currentUser?: any;
}

export const HeadmasterVideos: React.FC<HeadmasterVideosProps> = ({
  videoList = [],
  onVideoPress,
  currentUser,
}) => {
  const [tab, setTab] = useState<'MEETINGS' | 'MONITOR'>('MEETINGS');
  const [showNewMeeting, setShowNewMeeting] = useState(false);
  const [meetingTitle, setMeetingTitle] = useState('');
  const [selectedStaffIds, setSelectedStaffIds] = useState<string[]>([]);
  
  const { dbCameraNodes, fetchCameraNodes, users, fetchUsers, liveStreams, fetchLiveStreams } = useSchoolData();

  React.useEffect(() => {
    if (currentUser?.school_id) {
       fetchCameraNodes(currentUser.school_id);
       fetchUsers('TEACHER', currentUser.school_id);
       fetchLiveStreams(currentUser.school_id);
    }
  }, [currentUser?.school_id]);

  const toggleStaff = (id: string) => {
    setSelectedStaffIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const activeStaff = users.filter(u => u.role === 'TEACHER' || u.role === 'MENTOR');

  return (
    <ScrollView className="flex-1 bg-gray-50" showsVerticalScrollIndicator={false}>
      {/* High-Fidelity Platinum Header */}
      <StyledLinearGradient
        colors={['#0f172a', '#1e3a8a']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="px-6 pt-12 pb-24 rounded-b-[40px] relative shadow-lg"
      >
        <View className="absolute top-10 right-6 opacity-10">
          <Icons.Radio size={120} color="white" />
        </View>
        
        <View className="flex-row justify-between items-center mb-10">
          <View>
            <Text className="text-2xl font-black text-white tracking-[-1.5px] leading-8">Academic Archive</Text>
            <Text className="text-[10px] font-black uppercase tracking-[3px] text-blue-200 mt-2">Surveillance & Events</Text>
          </View>
          <TouchableOpacity 
            onPress={() => setShowNewMeeting(true)}
            className="bg-amber-500 px-6 py-4 rounded-[20px] shadow-2xl shadow-amber-500/40 border border-amber-400/30 active:scale-95"
          >
            <Text className="text-[10px] font-black text-white uppercase tracking-[2px]">+ New Session</Text>
          </TouchableOpacity>
        </View>

        {/* Tab Switcher */}
        <View className="flex-row bg-white/10 p-1.5 rounded-[24px] border border-white/10 backdrop-blur-md">
           {(['MEETINGS', 'MONITOR'] as const).map(t => (
             <TouchableOpacity 
               key={t}
               onPress={() => setTab(t)}
               className={`flex-1 py-4 rounded-[18px] items-center justify-center ${tab === t ? 'bg-white shadow-xl shadow-slate-900/40' : ''}`}
             >
                <Text className={`text-[10px] font-black uppercase tracking-[2px] ${tab === t ? 'text-slate-900' : 'text-blue-100'}`}>
                   {t === 'MEETINGS' ? 'Executive Terminal' : 'Surveillance Matrix'}
                </Text>
             </TouchableOpacity>
           ))}
        </View>
      </StyledLinearGradient>

      <View className="px-5 -mt-10">
        {tab === 'MEETINGS' ? (
           <>
              {/* Staff Presence Card */}
              <PlatformCard className="mb-6 p-8 rounded-[32px] shadow-2xl shadow-indigo-100/40 border border-gray-100">
                 <Text className="text-slate-900 text-sm font-black tracking-tight mb-8 uppercase tracking-[3px] text-slate-400">Personnel Connectivity</Text>
                 {activeStaff.slice(0, 5).map((staff, i) => (
                    <View key={staff.id} className={`flex-row items-center py-5 ${i !== 0 ? 'border-t border-slate-50' : ''}`}>
                       <View className="relative">
                          <View className="w-12 h-12 bg-slate-50 rounded-2xl items-center justify-center border border-slate-100 shadow-inner">
                             <Text className="font-black text-slate-400 text-[11px]">{staff.name?.slice(0, 2).toUpperCase()}</Text>
                          </View>
                          <View className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-[3px] border-white shadow-sm ${staff.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                       </View>
                       <View className="ml-5 flex-1">
                          <Text className="text-slate-900 font-black text-[15px] tracking-tight">{staff.name}</Text>
                          <Text className="text-slate-400 text-[10px] font-black uppercase tracking-[2px] mt-1">{staff.role.replace('_', ' ')}</Text>
                       </View>
                       <TouchableOpacity className="bg-indigo-50 px-5 py-2.5 rounded-xl border border-indigo-100 shadow-sm active:scale-95">
                          <Text className="text-indigo-600 text-[10px] font-black uppercase tracking-[2px]">Link</Text>
                       </TouchableOpacity>
                    </View>
                 ))}
             </PlatformCard>

              {/* Recent Logs / Analytics */}
              <View className="flex-row justify-between mb-8">
                 <PlatformCard noPadding className="flex-1 mr-3 p-6 items-center justify-center border border-slate-100 rounded-[32px] shadow-2xl shadow-indigo-100/40 bg-white">
                    <View className="w-10 h-10 bg-indigo-50 rounded-2xl items-center justify-center mb-4 border border-indigo-100/30">
                        <Icons.Activity size={20} color="#4f46e5" />
                    </View>
                    <Text className="text-2xl font-black text-slate-900 tracking-[-2px] leading-none mt-1">12</Text>
                    <Text className="text-[10px] text-gray-400 mt-2 font-black uppercase tracking-[2px]">Monthly Units</Text>
                 </PlatformCard>
                 <PlatformCard noPadding className="flex-1 ml-3 p-6 items-center justify-center border border-slate-100 rounded-[32px] shadow-2xl shadow-indigo-100/40 bg-white">
                    <View className="w-10 h-10 bg-emerald-50 rounded-2xl items-center justify-center mb-4 border border-emerald-100/30">
                        <Icons.Check size={20} color="#10b981" />
                    </View>
                    <Text className="text-2xl font-black text-slate-900 tracking-[-2px] leading-none mt-1">98%</Text>
                    <Text className="text-[10px] text-gray-400 mt-2 font-black uppercase tracking-[2px]">Session Sync</Text>
                 </PlatformCard>
              </View>
           </>
        ) : (
           <>
              {/* Global Monitoring Hub */}
              <Text className="text-slate-400 text-[10px] font-black uppercase tracking-[4px] mb-8 ml-1">Real-time Monitoring</Text>
              {liveStreams.length > 0 ? (
                 liveStreams.map(ls => (
                   <TouchableOpacity 
                     key={ls.id}
                     onPress={() => onVideoPress({
                         id: ls.id,
                         school_id: ls.school_id,
                         title: ls.title,
                         video_url: ls.stream_url,
                         is_public: !ls.class_id,
                         created_by: ls.created_by,
                         created_at: ls.created_at
                     } as Video)}
                     className="bg-white p-7 rounded-[32px] border border-slate-100 shadow-2xl shadow-indigo-100/40 mb-5 active:scale-[0.98]"
                   >
                     <View className="flex-row justify-between items-center mb-6">
                        <View className="flex-1 mr-4">
                           <Text className="text-slate-900 font-black text-xl tracking-tight leading-tight">{ls.title}</Text>
                           <Text className="text-indigo-600 text-[10px] font-black uppercase tracking-[3px] mt-2">{ls.subject || 'Section Stream'}</Text>
                        </View>
                        <View className="bg-rose-500 px-4 py-2 rounded-[14px] flex-row items-center shadow-lg shadow-rose-200">
                           <View className="w-1.5 h-1.5 bg-white rounded-full mr-2" />
                           <Text className="text-white text-[9px] font-black uppercase tracking-[2px]">Live</Text>
                        </View>
                     </View>
                     <View className="flex-row items-center justify-between pt-6 border-t border-slate-50">
                        <View className="flex-row items-center">
                           <Icons.Activity size={14} color="#64748b" />
                           <Text className="text-slate-500 text-[10px] font-black uppercase tracking-[2px] ml-2">{Math.floor(Math.random() * 50) + 10} Nodes</Text>
                        </View>
                        <TouchableOpacity className="bg-slate-900 px-6 py-3 rounded-2xl shadow-xl shadow-slate-300">
                           <Text className="text-white text-[10px] font-black uppercase tracking-[2px]">Monitor</Text>
                        </TouchableOpacity>
                     </View>
                   </TouchableOpacity>
                 ))
             ) : (
                <View className="p-20 items-center justify-center">
                   <Icons.Video size={40} color="#e2e8f0" />
                   <Text className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-4">No Active Broadcasts</Text>
                </View>
             )}
           </>
        )}
      </View>

      <View className="h-40" />

      {/* New Meeting Setup Modal */}
      {showNewMeeting && (
         <View className="absolute inset-0 bg-slate-900/95 z-[2000] items-center justify-center px-6">
            <StyledLinearGradient
              colors={['#1e293b', '#0f172a']}
              className={`w-full p-8 ${PlatformRadius.primary} border border-slate-700 shadow-2xl`}
            >
                <View className="flex-row items-center mb-8">
                   <View className="w-14 h-14 bg-amber-500/10 rounded-[20px] items-center justify-center mr-5 border border-amber-500/20 shadow-inner">
                      <Icons.Radio size={28} color="#f59e0b" />
                   </View>
                   <View>
                      <Text className="text-2xl font-black text-white tracking-tight leading-none mb-3">Establish Link</Text>
                      <Text className="text-slate-500 text-[10px] font-black uppercase tracking-[3px]">Dispatch Strategic Subject</Text>
                   </View>
                </View>

                <View className="space-y-6 mb-10">
                   <TextInput 
                     className="bg-slate-800/40 border border-slate-700 rounded-[20px] px-6 py-5 text-white font-black text-[15px] shadow-inner"
                     placeholder="Dispatch Subject (e.g. Monthly Review)"
                     placeholderTextColor="#475569"
                     value={meetingTitle}
                     onChangeText={setMeetingTitle}
                   />

                   <Text className="text-slate-500 text-[10px] font-black uppercase tracking-[3px] ml-1 mb-2">Selection Matrix ({selectedStaffIds.length})</Text>
                  <ScrollView className="max-h-[200px]">
                     {activeStaff.map(staff => (
                        <TouchableOpacity 
                           key={staff.id}
                           onPress={() => toggleStaff(staff.id)}
                           className={`flex-row items-center p-3 rounded-xl mb-2 border ${selectedStaffIds.includes(staff.id) ? 'bg-blue-600/20 border-blue-500' : 'bg-slate-800/30 border-slate-700'}`}
                        >
                           <View className="w-8 h-8 rounded-full bg-slate-700 items-center justify-center mr-3">
                              <Text className="text-white font-black text-[10px]">{staff.name?.slice(0, 1)}</Text>
                           </View>
                           <Text className={`flex-1 font-black text-[13px] ${selectedStaffIds.includes(staff.id) ? 'text-white' : 'text-slate-400'}`}>{staff.name}</Text>
                           {selectedStaffIds.includes(staff.id) && <Icons.Check size={14} color="#60a5fa" />}
                        </TouchableOpacity>
                     ))}
                  </ScrollView>
               </View>

                <View className="flex-row gap-4">
                   <TouchableOpacity 
                     onPress={() => { setShowNewMeeting(false); setSelectedStaffIds([]); }}
                     className="flex-1 py-5 rounded-[24px] items-center justify-center border border-slate-700 active:bg-slate-800/30"
                   >
                      <Text className="text-slate-500 font-black uppercase tracking-[3px] text-[10px]">Cancel</Text>
                   </TouchableOpacity>
                   <TouchableOpacity 
                     onPress={async () => {
                       try {
                         await startLiveStream({
                           school_id: currentUser.school_id,
                           title: meetingTitle || 'Strategic Meeting',
                           stream_url: 'rtmp://our-edu-stream.local/meetings', // Production RTMP target
                           created_by: currentUser.id,
                           subject: 'Strategy',
                           class_id: null
                         });
                         setShowNewMeeting(false);
                         setMeetingTitle('');
                         setSelectedStaffIds([]);
                         Alert.alert("Link Established", "Strategic dispatch has been synchronized with selected personnel nodes.");
                       } catch (err) {
                         Alert.alert("Link Failure", "Institutional dispatch node could not be synchronized.");
                       }
                     }}
                     disabled={!meetingTitle || selectedStaffIds.length === 0}
                     className={`flex-[2] py-5 rounded-[24px] items-center justify-center shadow-2xl ${(!meetingTitle || selectedStaffIds.length === 0) ? 'bg-slate-800 opacity-50' : 'bg-amber-500 shadow-amber-500/40 border border-amber-400/30 active:scale-[0.98]'}`}
                   >
                      <Text className="text-white font-black uppercase tracking-[3px] text-[10px]">Dispatch Link</Text>
                   </TouchableOpacity>
                </View>
            </StyledLinearGradient>
         </View>
      )}
    </ScrollView>
  );
};
