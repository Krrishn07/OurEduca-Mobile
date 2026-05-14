import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Image, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Icons } from '@components/common/Icons';
import { Video, LiveStream, useSchoolData } from '@context/SchoolDataContext';
import { AppTheme, AppCard, AppTypography, SectionHeader, StatusPill, AppRow, PlatinumSearchHeader } from '@components/common';

const StyledLinearGradient = LinearGradient || View;

interface StudentVideosProps {
  studentMaterials: Video[];
  onVideoPress: (video: Video) => void;
  isLiveStreamActive: boolean;
  videoTab: 'STREAM' | 'LIBRARY' | 'GALLERY';
  setVideoTab: (tab: 'STREAM' | 'LIBRARY' | 'GALLERY') => void;
  videoSearch: string;
  setVideoSearch: (text: string) => void;
  studentClasses?: any[];
  liveStreams?: LiveStream[];
  currentUser?: any;
  onNavigate?: (target: string) => void;
}

export const StudentVideos: React.FC<StudentVideosProps> = ({
  studentMaterials = [],
  onVideoPress,
  isLiveStreamActive,
  videoTab,
  setVideoTab,
  videoSearch,
  setVideoSearch,
  studentClasses = [],
  liveStreams = [],
  currentUser,
  onNavigate,
}) => {
  const [activeTab, setActiveTab] = React.useState<'LIVE' | 'LIBRARY'>('LIVE');
  const [parentMode, setParentMode] = React.useState(false);
  
  const filteredLiveStreams = React.useMemo(() => {
    return (liveStreams || []).filter(ls => {
        if (!ls.is_active) return false;
        // Show if it's a general broadcast (no class_id) OR if it matches the student's enrolled class
        const isTargeted = studentClasses.some(c => c.class_id === ls.class_id || c.id === ls.class_id);
        return !ls.class_id || isTargeted; 
    });
  }, [liveStreams, studentClasses]);

  const filteredVideos = (studentMaterials || []).filter(v => {
    return !videoSearch || v.title?.toLowerCase().includes(videoSearch.toLowerCase()) || v.subject?.toLowerCase().includes(videoSearch.toLowerCase());
  });

  const renderLiveTab = () => (
    <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
      {parentMode && (
        <View className="bg-indigo-900 p-6 rounded-[32px] border border-white/10 mb-8 mt-4 shadow-2xl">
          <View className="flex-row items-center mb-4">
            <View className="w-10 h-10 bg-amber-400 rounded-xl items-center justify-center shadow-lg shadow-amber-200">
               <Icons.Eye size={20} color="white" />
            </View>
            <View className="ml-4">
              <Text className="text-white font-black text-[15px] font-inter-black">Parent Monitoring</Text>
              <Text className="text-amber-400 text-[9px] font-black uppercase tracking-widest font-inter-black">Active Vigilance</Text>
            </View>
          </View>
          <Text className="text-white/60 text-[12px] font-medium leading-relaxed font-inter-medium">
            You are currently in Parent Mode. You can monitor your child's live classes in real-time. All streams are private and institutionally secured.
          </Text>
        </View>
      )}

      <SectionHeader 
        title={`${filteredLiveStreams.length} Classes Live Now`} 
        subtitle="INSTITUTIONAL BROADCASTS" 
      />
      
      <View className="space-y-4">
        {filteredLiveStreams.length > 0 ? (
          filteredLiveStreams.map((stream: any) => (
            <AppCard key={stream.id} className="p-0 overflow-hidden border border-gray-100 shadow-sm">
               <View className="bg-indigo-900 p-4 flex-row items-center justify-between">
                  <View className="flex-1">
                     <Text className="text-white font-black text-[14px] font-inter-black">{stream.title}</Text>
                     <Text className="text-indigo-300 text-[10px] font-black uppercase tracking-widest mt-1 font-inter-black">
                        {stream.subject} • Faculty: {stream.teacher_name || 'Senior Staff'}
                     </Text>
                  </View>
                  <View className="bg-rose-500 px-3 py-1 rounded-full flex-row items-center">
                     <View className="w-1.5 h-1.5 bg-white rounded-full mr-2" />
                     <Text className="text-white text-[9px] font-black tracking-widest font-inter-black">LIVE</Text>
                  </View>
               </View>
               <View className="p-4 flex-row items-center justify-between">
                  <Text className="text-gray-400 text-[11px] font-inter-medium italic">Class: {stream.section || 'General'}</Text>
                  <TouchableOpacity 
                    onPress={() => onVideoPress({ ...stream, video_url: stream.stream_url } as any)}
                    className="bg-indigo-600 px-6 py-2.5 rounded-xl shadow-lg shadow-indigo-100"
                  >
                     <Text className="text-white font-black text-[11px] uppercase tracking-widest font-inter-black">
                        {parentMode ? 'Monitor' : 'Join Class'}
                     </Text>
                  </TouchableOpacity>
               </View>
            </AppCard>
          ))
        ) : (
          <View className="py-20 items-center justify-center">
             <Icons.Radio size={48} color="#e2e8f0" />
             <Text className="text-gray-400 text-[11px] font-black uppercase tracking-widest mt-4 font-inter-black">No live classes at the moment</Text>
          </View>
        )}
      </View>
      <View className="h-40" />
    </ScrollView>
  );

  const renderLibraryTab = () => (
    <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
      {/* Search Bar */}
      <View className="bg-white p-4 rounded-[24px] border border-gray-100 shadow-sm flex-row items-center mb-6 mt-4">
          <Icons.Search size={18} color="#94a3b8" />
          <TextInput 
              className="flex-1 ml-4 text-[13px] font-black text-gray-900 font-inter-black"
              placeholder="Search Subject Library..."
              value={videoSearch}
              onChangeText={setVideoSearch}
          />
      </View>

      <SectionHeader title="Recorded Lessons" subtitle="ACADEMY ARCHIVE" />

      <View className="space-y-4">
        {filteredVideos.map((video) => (
          <AppCard key={video.id} className="p-0 overflow-hidden border border-white shadow-sm">
             <TouchableOpacity 
               activeOpacity={0.9} 
               onPress={() => onVideoPress(video)}
               className="flex-row"
             >
                <View className="w-28 h-28 bg-indigo-900 items-center justify-center relative">
                   <Icons.Play size={24} color="white" />
                   <View className="absolute bottom-2 right-2 bg-black/40 px-1.5 py-0.5 rounded">
                      <Text className="text-white text-[8px] font-black font-inter-black">{video.duration || 'LECTURE'}</Text>
                   </View>
                </View>
                <View className="flex-1 p-4 justify-between">
                   <View>
                      <Text className="font-black text-gray-900 text-[14px] tracking-tight leading-tight mb-1 font-inter-black" numberOfLines={2}>{video.title}</Text>
                      <Text className="text-[10px] font-black text-indigo-500 uppercase tracking-widest font-inter-black">{video.subject}</Text>
                   </View>
                   <View className="flex-row items-center justify-between mt-2">
                      <Text className="text-[9px] font-black text-gray-400 font-inter-black">{video.created_at ? new Date(video.created_at).toLocaleDateString() : 'Recent'}</Text>
                      <Icons.ChevronRight size={14} color="#d1d5db" />
                   </View>
                </View>
             </TouchableOpacity>
          </AppCard>
        ))}
        {filteredVideos.length === 0 && (
          <View className="py-20 items-center justify-center">
             <Icons.Search size={48} color="#e2e8f0" />
             <Text className="text-gray-400 text-[11px] font-black uppercase tracking-widest mt-4 font-inter-black">No recordings found</Text>
          </View>
        )}
      </View>
      <View className="h-40" />
    </ScrollView>
  );
  return (
    <View className="flex-1 bg-white">
      <PlatinumSearchHeader
        title="Study Hub"
        subtitle={activeTab === 'LIVE' ? 'Real-time Classroom Broadcasts' : 'Institutional Recorded Archive'}
        onBack={() => onNavigate?.('home')}
        searchValue={videoSearch}
        onSearchChange={setVideoSearch}
        placeholder="Filter by subject or title..."
      />

      {/* Role Tabs - Integrated Style */}
      <View className="flex-row bg-white border-b border-gray-100 px-4">
        {[
          { id: 'LIVE', label: 'LIVE NOW', icon: <Icons.Radio size={12} color={activeTab === 'LIVE' ? '#4f46e5' : '#94a3b8'} /> },
          { id: 'LIBRARY', label: 'LIBRARY', icon: <Icons.Play size={12} color={activeTab === 'LIBRARY' ? '#4f46e5' : '#94a3b8'} /> }
        ].map((t) => (
          <TouchableOpacity 
            key={t.id}
            onPress={() => setActiveTab(t.id as any)}
            className={`flex-1 py-4 flex-row items-center justify-center border-b-2 ${activeTab === t.id ? 'border-indigo-600' : 'border-transparent'}`}
          >
            {t.icon}
            <Text className={`ml-2 text-[10px] font-black tracking-widest font-inter-black ${activeTab === t.id ? 'text-indigo-600' : 'text-gray-400'}`}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View className="flex-1 bg-[#f5f7ff]">
        {activeTab === 'LIVE' && renderLiveTab()}
        {activeTab === 'LIBRARY' && renderLibraryTab()}
      </View>
    </View>
  );
};
