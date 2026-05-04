import React, { useState, useMemo, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Image, Alert, Animated, Modal, AppState, AppStateStatus, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import { useVideoPlayer, VideoView } from 'expo-video';
import { LinearGradient } from 'expo-linear-gradient';
import { styled } from 'nativewind';
import { Icons } from '../../../../components/Icons';
import { Video, useSchoolData } from '../../../../contexts/SchoolDataContext';
import { AppTheme, AppCard, AppTypography, SectionHeader, AppButton, ModalShell, StatusPill, AppRow } from '../../../design-system';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const StyledLinearGradient = LinearGradient ? styled(LinearGradient) : View;

interface GoLiveModalProps {
  visible: boolean;
  onClose: () => void;
  onStart: () => void;
  streamTitle: string;
  setStreamTitle: (text: string) => void;
  streamSubject: string;
  setStreamSubject: (text: string) => void;
  streamSource: 'CAMERA' | 'CCTV';
  setStreamSource: (source: 'CAMERA' | 'CCTV') => void;
  selectedCctvNode: any;
  setSelectedCctvNode: (node: any) => void;
  cctvNodes: any[];
  isLoading: boolean;
}

const GoLiveModal: React.FC<GoLiveModalProps> = ({
  visible, onClose, onStart, streamTitle, setStreamTitle, streamSubject, setStreamSubject, 
  streamSource, setStreamSource, selectedCctvNode, setSelectedCctvNode, cctvNodes, isLoading
}) => (
  <ModalShell visible={visible} onClose={onClose} title="Session Studio" subtitle="SETUP BROADCAST">
    <View className="space-y-6">
        <View>
            <Text className="text-[10px] font-black text-gray-400 uppercase tracking-[2px] mb-2.5 ml-1 font-inter-black">Session Title</Text>
            <View className="bg-white rounded-[20px] border border-gray-100 px-5 py-3.5 shadow-sm">
                <TextInput 
                    placeholder="e.g. Executive Oversight 01" 
                    value={streamTitle}
                    onChangeText={setStreamTitle}
                    className="text-[13px] font-black text-gray-900 font-inter-black"
                />
            </View>
        </View>
        
        <View>
          <Text className="text-[10px] font-black text-gray-400 uppercase tracking-[2px] mb-3 ml-1 font-inter-black">Broadcasting Source</Text>
          <View className="flex-row gap-3">
            {(['CAMERA', 'CCTV'] as const).map(s => (
              <TouchableOpacity 
                key={s}
                onPress={() => setStreamSource(s)}
                activeOpacity={0.9}
                className={`flex-1 py-4 rounded-[24px] items-center border-2 transition-all ${
                  streamSource === s 
                    ? 'bg-indigo-50 border-indigo-600 shadow-xl shadow-indigo-100/50' 
                    : 'bg-white border-gray-100'
                }`}
              >
                <View className={`w-10 h-10 rounded-xl items-center justify-center mb-2 ${
                  streamSource === s ? 'bg-indigo-600 shadow-md shadow-indigo-200' : 'bg-gray-50'
                }`}>
                  <Icons.Video size={18} color={streamSource === s ? 'white' : '#94a3b8'} />
                </View>
                <Text className={`text-[9px] font-black uppercase tracking-widest font-inter-black ${
                  streamSource === s ? 'text-indigo-900' : 'text-gray-400'
                }`}>{s === 'CAMERA' ? 'Integrated' : 'Surveillance'}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {streamSource === 'CCTV' && (
          <View>
            <Text className="text-[10px] font-black text-gray-400 uppercase tracking-[2px] mb-3 ml-1 font-inter-black">Security Feed Sync</Text>
            <View className="flex-row flex-wrap gap-2">
              {(cctvNodes || []).map(node => (
                <TouchableOpacity 
                  key={node.id}
                  onPress={() => setSelectedCctvNode(node)}
                  className={`px-4 py-2.5 rounded-xl border transition-all ${
                    selectedCctvNode?.id === node.id 
                      ? 'bg-indigo-600 border-indigo-600 shadow-lg shadow-indigo-100' 
                      : 'bg-white border-gray-100'
                  }`}
                >
                  <Text className={`text-[9px] font-black uppercase tracking-wider font-inter-black ${
                    selectedCctvNode?.id === node.id ? 'text-white' : 'text-gray-600'
                  }`}>{node.label || node.id}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View className="pt-4">
          <AppButton 
              label="Start Broadcast"
              variant="primary"
              onPress={onStart}
              isLoading={isLoading}
              className="shadow-xl shadow-indigo-200"
          />
        </View>
    </View>
  </ModalShell>
);

interface MentorVideosProps {
  videoList: Video[];
  videoTab: 'PUBLIC' | 'PRIVATE' | 'MY_CONTENT';
  setVideoTab: (tab: 'PUBLIC' | 'PRIVATE' | 'MY_CONTENT') => void;
  videoSearch: string;
  setVideoSearch: (text: string) => void;
  isLiveStreamActive: boolean;
  onShowVideoUploadModal: () => void;
  onVideoPress: (video: Video) => void;
  onDeleteVideo?: (id: string) => Promise<void>;
  onNavigate?: (tab: string) => void;
  currentUser?: any;
}

interface SessionCapturedModalProps {
  visible: boolean;
  onSave: () => void;
  onDiscard: () => void;
}

const SessionCapturedModal: React.FC<SessionCapturedModalProps> = ({ visible, onSave, onDiscard }) => (
  <Modal visible={visible} animationType="fade" transparent>
    <View className="flex-1 justify-center items-center bg-black/60 px-6">
      <View className="bg-white w-full max-w-sm rounded-[32px] p-8 shadow-2xl items-center border border-gray-100">
        <View className="w-16 h-16 bg-emerald-50 rounded-2xl items-center justify-center mb-6 border border-emerald-100 shadow-inner">
           <Icons.CheckCircle size={32} color="#10b981" />
        </View>

        <Text className="text-xl font-black text-gray-900 tracking-tight text-center font-inter-black">Recording Complete</Text>
        <Text className="text-[10px] text-indigo-500 font-black uppercase tracking-[3px] mt-2 mb-6 font-inter-black">Academy Storage</Text>
        
        <Text className="text-gray-500 text-[13px] font-medium text-center leading-relaxed mb-8 px-4 font-inter-medium">
           Your broadcast has been successfully encoded. Would you like to publish this recording to the academy library?
        </Text>

        <View className="w-full gap-3">
          <AppButton 
            label="Publish to Library"
            variant="primary"
            onPress={onSave}
            className="shadow-lg shadow-indigo-100"
          />
          <AppButton 
            label="Discard Recording"
            variant="secondary"
            onPress={onDiscard}
          />
        </View>
      </View>
    </View>
  </Modal>
);

export const MentorVideos: React.FC<MentorVideosProps> = ({ 
  videoList, 
  onVideoPress, 
  videoTab, 
  setVideoTab, 
  videoSearch, 
  setVideoSearch, 
  isLiveStreamActive,
  onShowVideoUploadModal,
  onDeleteVideo,
  onNavigate,
  currentUser,
}) => {
  const { liveStreams } = useSchoolData();
  const [activeTab, setActiveTab] = useState<'MONITOR' | 'LIBRARY'>('MONITOR');
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  const filteredVideos = (videoList || []).filter(v => {
    const matchesSearch = !videoSearch || v.title?.toLowerCase().includes(videoSearch.toLowerCase()) || v.subject?.toLowerCase().includes(videoSearch.toLowerCase());
    const matchesSubject = !selectedSubject || v.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  const renderMonitorTab = () => (
    <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
      {/* Mentor Oversight Banner */}
      <View className="bg-emerald-50 p-6 rounded-[32px] border border-emerald-100 mb-8 mt-4">
        <View className="flex-row items-center mb-4">
          <View className="w-10 h-10 bg-emerald-600 rounded-xl items-center justify-center shadow-lg shadow-emerald-100">
             <Icons.Eye size={20} color="white" />
          </View>
          <View className="ml-4">
            <Text className="text-emerald-900 font-black text-[15px] font-inter-black">Institutional Oversight</Text>
            <Text className="text-emerald-600/60 text-[9px] font-black uppercase tracking-widest font-inter-black">Read-Only Monitoring</Text>
          </View>
        </View>
        <Text className="text-emerald-700/70 text-[12px] font-medium leading-relaxed font-inter-medium">
          You can silently monitor any live class without notifying participants. Your presence is read-only (no camera or microphone access).
        </Text>
      </View>

      <SectionHeader title="Active Academy Streams" subtitle="LIVE MONITORING" />
      
      <View className="space-y-4">
        {(liveStreams || []).filter(s => s.is_active).length > 0 ? (
          (liveStreams || []).filter(s => s.is_active).map((stream: any) => (
            <AppCard key={stream.id} className="p-0 overflow-hidden border border-gray-100 shadow-sm">
               <View className="bg-indigo-900 p-4 flex-row items-center justify-between">
                  <View className="flex-1">
                     <Text className="text-white font-black text-[14px] font-inter-black">{stream.title}</Text>
                     <Text className="text-indigo-300 text-[10px] font-black uppercase tracking-widest mt-1 font-inter-black">
                        {stream.subject} • Class {stream.section || 'General'}
                     </Text>
                  </View>
                  <View className="bg-rose-500 px-3 py-1 rounded-full flex-row items-center">
                     <View className="w-1.5 h-1.5 bg-white rounded-full mr-2" />
                     <Text className="text-white text-[9px] font-black tracking-widest font-inter-black">LIVE</Text>
                  </View>
               </View>
               <View className="p-4 flex-row items-center justify-between">
                  <Text className="text-gray-400 text-[11px] font-inter-medium italic">Faculty: {stream.teacher_name || 'Senior Staff'}</Text>
                  <TouchableOpacity 
                    onPress={() => onVideoPress({ ...stream, video_url: stream.stream_url } as any)}
                    className="bg-indigo-600 px-6 py-2.5 rounded-xl shadow-lg shadow-indigo-100"
                  >
                     <Text className="text-white font-black text-[11px] uppercase tracking-widest font-inter-black">Monitor Hub</Text>
                  </TouchableOpacity>
               </View>
            </AppCard>
          ))
        ) : (
          <View className="py-20 items-center justify-center">
             <Icons.Video size={48} color="#e2e8f0" />
             <Text className="text-gray-400 text-[11px] font-black uppercase tracking-widest mt-4 font-inter-black text-center">No Active Streams Found</Text>
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
              placeholder="Search Lesson Library..."
              value={videoSearch}
              onChangeText={setVideoSearch}
          />
      </View>

      <SectionHeader title="Institutional Archive" subtitle="RECORDED SESSIONS" />

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
                      <Text className="text-[9px] font-black text-gray-400 font-inter-black">{new Date(video.created_at).toLocaleDateString()}</Text>
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
    <SafeAreaView className="flex-1 bg-white">
      {/* Mentor Dashboard Header */}
      <View className="bg-indigo-950 px-6 pt-12 pb-6 shadow-2xl">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <View className="w-12 h-12 bg-white/10 rounded-2xl items-center justify-center border border-white/20">
              <Text className="text-white font-black text-lg font-inter-black">
                {currentUser?.name?.split(' ').map((n: string) => n[0]).join('') || 'M'}
              </Text>
            </View>
            <View className="ml-4">
              <Text className="text-white/40 text-[9px] font-black uppercase tracking-[2px] font-inter-black">Executive Mentor</Text>
              <Text className="text-white font-black text-lg tracking-tight font-inter-black">{currentUser?.name}</Text>
              <Text className="text-white/50 text-[10px] font-black tracking-widest font-inter-black">Academic Oversight</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Role Tabs */}
      <View className="flex-row bg-indigo-950 border-t border-white/5">
        {[
          { id: 'MONITOR', label: 'Monitor Hub', icon: '👁' },
          { id: 'LIBRARY', label: 'Archive', icon: '🎬' }
        ].map((t) => (
          <TouchableOpacity 
            key={t.id}
            onPress={() => setActiveTab(t.id as any)}
            className={`flex-1 py-4 items-center border-b-[3px] ${activeTab === t.id ? 'border-amber-400' : 'border-transparent'}`}
          >
            <Text className={`text-[11px] font-black tracking-widest font-inter-black ${activeTab === t.id ? 'text-white' : 'text-white/30'}`}>
              {t.icon} {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View className="flex-1">
        {activeTab === 'MONITOR' && renderMonitorTab()}
        {activeTab === 'LIBRARY' && renderLibraryTab()}
      </View>
    </SafeAreaView>
  );
};
