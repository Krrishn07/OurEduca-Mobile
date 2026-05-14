import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Image, ActivityIndicator, Dimensions, Modal, Animated, Alert, AppState, AppStateStatus } from 'react-native';
import { CameraView, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as MediaLibrary from 'expo-media-library';
import { decode } from 'base64-arraybuffer';
import { useVideoPlayer, VideoView } from 'expo-video';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '@lib/supabase';
import { Icons } from '@components/common/Icons';
import { Video as VideoType, useSchoolData, LiveStream } from '@context/SchoolDataContext';
import { useSystemStatus } from '@context/SystemStatusContext';
import { AppTheme } from '@constants/Theme';
import { 
  ActionTile, 
  AppCard, 
  SectionHeader, 
  StatCard, 
  AppRow, 
  StatusPill, 
  AppTypography, 
  AppButton, 
  ModalShell, 
  PlatinumSearchHeader 
} from '@components/common';

const { width } = Dimensions.get('window');

// Private component for GoLiveModal
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

const GoLiveModal = ({
  visible, onClose, onStart, streamTitle, setStreamTitle, streamSubject, setStreamSubject, 
  streamSource, setStreamSource, selectedCctvNode, setSelectedCctvNode, cctvNodes, isLoading
}: GoLiveModalProps) => (
  <ModalShell visible={visible} onClose={onClose} title="Session Studio" subtitle="SETUP BROADCAST">
    <View className="space-y-6">
        <View>
            <Text className="text-[10px] font-black text-gray-400 uppercase tracking-[2px] mb-2.5 ml-1 font-inter-black">Session Title</Text>
            <View className="bg-white rounded-[20px] border border-gray-100 px-5 py-3.5 shadow-sm">
                <TextInput 
                    placeholder="e.g. Mentor Session 01" 
                    value={streamTitle}
                    onChangeText={setStreamTitle}
                    className="text-[13px] font-black text-gray-900 font-inter-black"
                />
            </View>
        </View>
        
        <View>
          <Text className="text-[10px] font-black text-gray-400 uppercase tracking-[2px] mb-3 ml-1 font-inter-black">Go Live</Text>
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
                <Text className={`text-[9px] font-black uppercase tracking-[1px] font-inter-black ${
                  streamSource === s ? 'text-indigo-900' : 'text-gray-400'
                }`}>{s === 'CAMERA' ? 'Device Camera' : 'Security Feed'}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {streamSource === 'CCTV' && (
          <View>
            <Text className="text-[10px] font-black text-gray-400 uppercase tracking-[2px] mb-3 ml-1 font-inter-black">Security Feed Link</Text>
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
  videoList?: VideoType[];
  videoTab: 'PUBLIC' | 'PRIVATE' | 'MY_CONTENT';
  setVideoTab: (tab: 'PUBLIC' | 'PRIVATE' | 'MY_CONTENT') => void;
  videoSearch: string;
  setVideoSearch: (q: string) => void;
  onShowVideoUploadModal: () => void;
  onVideoPress: (video: VideoType) => void;
  isLiveStreamActive?: boolean;
  onDeleteVideo?: (id: string) => Promise<void>;
  currentUser?: any;
  teacherAssignedSections?: any[];
  onNavigate?: (tab: string) => void;
}

interface SessionCapturedModalProps {
  visible: boolean;
  onSave: () => void;
  onDiscard: () => void;
}

const SessionCapturedModal = ({ visible, onSave, onDiscard }: SessionCapturedModalProps) => (
  <ModalShell visible={visible} onClose={onDiscard} title="Capture Studio" subtitle="RECORDING COMPLETE">
      <View className="items-center">
        <View className="w-16 h-16 bg-emerald-50 rounded-2xl items-center justify-center mb-6 border border-emerald-100 shadow-inner">
           <Icons.CheckCircle size={32} color="#10b981" />
        </View>

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
  </ModalShell>
);

export const MentorVideos = React.memo<MentorVideosProps>(({
  videoList = [],
  videoSearch,
  setVideoSearch,
  onShowVideoUploadModal,
  onVideoPress,
  onDeleteVideo,
  currentUser,
  teacherAssignedSections = []
}) => {
  const { 
    platformSettings, 
    uploadVideo, 
    startLiveStream, 
    endLiveStream, 
    liveStreams,
    dbCameraNodes: rawCameraNodes,
    fetchCameraNodes
  } = useSchoolData();

  const {
    isLiveSessionActive: globalIsLiveActive,
    setIsLiveSessionActive,
    activeSessionData,
    setActiveSessionData
  } = useSystemStatus();

  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<'STREAM' | 'LIBRARY' | 'MONITOR'>('STREAM');
  
  const [isStreaming, setIsStreaming] = useState(globalIsLiveActive);
  const [streamSource, setStreamSource] = useState<'CAMERA' | 'CCTV' | 'SCREEN'>(activeSessionData?.source || 'CAMERA');
  const [elapsed, setElapsed] = useState(0);

  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showGoLiveModal, setShowGoLiveModal] = useState(false);
  const [streamTitle, setStreamTitle] = useState('');
  const [streamSubject, setStreamSubject] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scanlineAnim = useRef(new Animated.Value(0)).current;
  const cameraRef = useRef<any>(null);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [micPermission, requestMicPermission] = useMicrophonePermissions();
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideoUri, setRecordedVideoUri] = useState<string | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [selectedCctvNode, setSelectedCctvNode] = useState<any>(null);
  const [showCapturedModal, setShowCapturedModal] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  const memoizedCameraNodes = React.useMemo(() => rawCameraNodes || [], [rawCameraNodes]);

  const player = useVideoPlayer(selectedCctvNode?.stream_url || '', (p) => {
    p.loop = true;
    if (isStreaming && streamSource === 'CCTV') p.play();
  });

  useEffect(() => {
    if (currentUser?.school_id) fetchCameraNodes(currentUser.school_id);
  }, [currentUser?.school_id]);

  useEffect(() => {
    let pulseLoop: Animated.CompositeAnimation | null = null;
    let scanlineLoop: Animated.CompositeAnimation | null = null;

    if (isStreaming) {
      pulseLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.2, duration: 1000, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true })
        ])
      );
      scanlineLoop = Animated.loop(
        Animated.timing(scanlineAnim, { toValue: 1, duration: 3000, useNativeDriver: true })
      );
      pulseLoop.start();
      scanlineLoop.start();
    }
    return () => {
      pulseLoop?.stop();
      scanlineLoop?.stop();
    };
  }, [isStreaming]);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartBroadcast = async () => {
    if (!streamTitle) {
      Alert.alert('Missing Info', 'Please provide a session title.');
      return;
    }
    setIsLoading(true);
    try {
      const activeSection = (teacherAssignedSections || []).find((s: any) => s.displayName === streamSubject) || teacherAssignedSections?.[0];
      const streamId = await startLiveStream({
        school_id: currentUser?.school_id,
        created_by: currentUser?.id,
        class_id: activeSection?.class_id || null,
        section: activeSection?.section || null,
        title: streamTitle,
        subject: streamSubject || activeSection?.subject || 'General',
        stream_url: streamSource === 'CAMERA' ? 'HARDWARE_CAMERA' : (selectedCctvNode?.stream_url || 'CCTV_FEED'),
        source: streamSource
      });
      if (streamId) {
        setActiveSessionData({ id: streamId, title: streamTitle, subject: streamSubject, source: streamSource, startTime: Date.now() });
        setActiveSessionId(streamId);
        setIsStreaming(true);
        setShowGoLiveModal(false);
      }
    } catch (err: any) {
      Alert.alert('Broadcast Error', 'Failed to establish connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndSession = async () => {
    const idToEnd = activeSessionId || activeSessionData?.id;
    if (idToEnd) {
      await endLiveStream(idToEnd, currentUser?.school_id);
    }
    setIsStreaming(false);
    setActiveSessionId(null);
    setActiveSessionData(null);
    setIsLiveSessionActive(false);
    setElapsed(0);
  };

  const filteredVideos = (videoList || []).filter(v => 
    v.title?.toLowerCase().includes(videoSearch.toLowerCase()) || 
    v.subject?.toLowerCase().includes(videoSearch.toLowerCase())
  );

  const renderStreamTab = () => (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      {!isStreaming ? (
        <View className="px-4 pt-6 space-y-6">
          <AppCard className="p-5 border border-gray-100 shadow-sm">
            <Text className="text-gray-900 font-black text-lg tracking-tight mb-1 font-inter-black">Broadcasting Hub</Text>
            <Text className="text-gray-400 text-[10px] font-black uppercase tracking-[1px] mb-6 font-inter-black">Choose stream source for subject session</Text>
            <View className="space-y-3">
              {[
                { id: 'CAMERA', icon: '📹', label: 'Internal Camera', desc: 'Stream from integrated device camera' },
                { id: 'CCTV', icon: '📷', label: 'CCTV Node', desc: 'Relay classroom surveillance feed' },
              ].map(src => (
                <TouchableOpacity
                  key={src.id}
                  style={{
                    backgroundColor: streamSource === src.id ? '#eff6ff' : '#f8fafc',
                    borderColor: streamSource === src.id ? '#2563eb' : '#e2e8f0',
                    borderWidth: 1.5,
                    borderRadius: 16,
                    padding: 14,
                    flexDirection: 'row',
                    alignItems: 'center'
                  }}
                  onPress={() => setStreamSource(src.id as any)}
                >
                  <Text style={{ fontSize: 24 }}>{src.icon}</Text>
                  <View style={{ flex: 1, marginLeft: 16 }}>
                    <Text className={`font-black text-[14px] font-inter-black ${streamSource === src.id ? 'text-blue-600' : 'text-slate-900'}`}>{src.label}</Text>
                    <Text className="text-slate-500 text-[10px] font-medium font-inter-medium mt-0.5">{src.desc}</Text>
                  </View>
                  {streamSource === src.id && <Icons.CheckCircle size={20} color="#2563eb" />}
                </TouchableOpacity>
              ))}
            </View>
          </AppCard>

          <AppCard className="p-5 border border-gray-100 shadow-sm">
            <Text className="text-gray-900 font-black text-lg tracking-tight mb-1 font-inter-black">Assigned Class Broadcast</Text>
            <Text className="text-gray-400 text-[10px] font-black uppercase tracking-[1px] mb-4 font-inter-black">Go live to your subject sections</Text>
            <View className="space-y-4">
              {teacherAssignedSections.map((cls: any, i: number) => (
                <View key={i} className="flex-row items-center py-3 border-b border-gray-50 last:border-b-0">
                  <View className="flex-1">
                    <Text className="text-gray-900 font-black text-[14px] font-inter-black">{cls.displayName}</Text>
                    <Text className="text-gray-400 text-[10px] font-black uppercase tracking-[1px] mt-1 font-inter-black">{cls.subject}</Text>
                  </View>
                  <TouchableOpacity 
                    className="bg-indigo-600 px-5 py-2.5 rounded-xl"
                    onPress={() => {
                        setStreamSubject(cls.displayName);
                        setStreamTitle(`${cls.displayName} Live`);
                        setShowGoLiveModal(true);
                    }}
                  >
                    <Text className="text-white font-black text-[11px] uppercase tracking-[1px] font-inter-black">GO LIVE</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </AppCard>
        </View>
      ) : (
        <View className="flex-1 h-screen bg-black">
           <CameraView style={{ flex: 1 }} facing="back" mode="video" />
           <View className="absolute top-10 left-6 right-6 flex-row justify-between">
              <View className="bg-red-600 px-3 py-1 rounded-full flex-row items-center">
                 <Animated.View style={{ opacity: pulseAnim }} className="w-2 h-2 bg-white rounded-full mr-2" />
                 <Text className="text-white text-[10px] font-inter-black uppercase">LIVE</Text>
              </View>
              <TouchableOpacity onPress={handleEndSession} className="bg-white/20 px-4 py-2 rounded-xl border border-white/30">
                 <Text className="text-white text-[10px] font-inter-black uppercase">END</Text>
              </TouchableOpacity>
           </View>
        </View>
      )}
    </ScrollView>
  );

  const renderLibraryTab = () => (
    <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
      <View className="space-y-4 mt-4">
        {filteredVideos.length > 0 ? (
            filteredVideos.map((video: any) => (
                <AppCard key={video.id} className="p-0 overflow-hidden border border-white shadow-xl shadow-indigo-100/30">
                    <TouchableOpacity activeOpacity={0.9} onPress={() => onVideoPress(video)} className="flex-row">
                        <View className="w-32 h-32 bg-gray-900 items-center justify-center relative">
                            {video.thumbnail_url ? (
                                <Image source={{ uri: video.thumbnail_url }} className="w-full h-full opacity-80" resizeMode="cover" />
                            ) : (
                                <Icons.Play size={24} color="white" />
                            )}
                            <View className="absolute top-2 left-2">
                                <StatusPill label={video.subject || 'GENERAL'} type="info" />
                            </View>
                            <View className="absolute bottom-2 right-2 bg-black/60 px-1.5 py-0.5 rounded border border-white/10">
                                <Text className="text-white text-[8px] font-black font-inter-black">{video.duration || 'LECTURE'}</Text>
                            </View>
                        </View>
                        <View className="flex-1 p-4 justify-between">
                            <View>
                                <Text className="font-black text-gray-900 text-[14px] tracking-tight leading-tight mb-2 font-inter-black" numberOfLines={2}>{video.title}</Text>
                                <View className="flex-row items-center mb-2">
                                    <View className="w-5 h-5 bg-indigo-50 rounded-lg items-center justify-center mr-2 border border-indigo-100">
                                        <Icons.Profile size={10} color="#4f46e5" />
                                    </View>
                                    <Text className="text-[10px] font-black text-gray-500 font-inter-black">{video.teacher_name || 'Institution Faculty'}</Text>
                                </View>
                            </View>
                            <View className="flex-row items-center justify-between mt-auto">
                                <View className="flex-row items-center">
                                    <Icons.Calendar size={10} color="#94a3b8" />
                                    <Text className="text-[9px] font-black text-gray-400 ml-1.5 font-inter-black">{new Date(video.created_at).toLocaleDateString()}</Text>
                                </View>
                                <Icons.ChevronRight size={14} color="#d1d5db" />
                            </View>
                        </View>
                    </TouchableOpacity>
                </AppCard>
            ))
        ) : (
            <View className="py-20 items-center justify-center">
                <Icons.Video size={48} color="#e2e8f0" />
                <Text className="text-gray-400 text-[11px] font-black uppercase tracking-widest mt-4 font-inter-black">No recordings found</Text>
            </View>
        )}
      </View>
    </ScrollView>
  );

  const renderMonitorTab = () => (
    <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
       <Text className="text-[9px] font-black text-gray-400 uppercase tracking-[3px] mb-4 px-2 font-inter-black">Institutional Monitoring</Text>
       <View className="space-y-3">
           {memoizedCameraNodes.map((node: any, i: number) => (
              <TouchableOpacity 
                key={node.id || i}
                className="bg-white border border-gray-100 rounded-[28px] p-4 flex-row items-center shadow-sm"
              >
                <View className="w-12 h-12 bg-slate-900 rounded-2xl items-center justify-center mr-4 border border-slate-800">
                  <Icons.Eye size={20} color="white" />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-900 font-inter-black text-[15px]">{node.label || `Classroom View ${i+1}`}</Text>
                  <Text className="text-emerald-600 text-[10px] font-inter-bold uppercase">Active Feed</Text>
                </View>
                <View className="bg-indigo-50 px-4 py-2 rounded-xl">
                   <Text className="text-[10px] font-inter-black text-indigo-600 uppercase">View</Text>
                </View>
              </TouchableOpacity>
           ))}
       </View>
    </ScrollView>
  );

  return (
    <View className="flex-1 bg-[#f5f7ff]">
      {!isStreaming && (
        <PlatinumSearchHeader 
          title={activeTab === 'MONITOR' ? 'Campus View' : activeTab === 'LIBRARY' ? 'Library' : 'Broadcast'}
          subtitle="Academy Oversight Node"
          searchValue={videoSearch}
          onSearchChange={setVideoSearch}
          placeholder="Search videos or feeds..."
        />
      )}
      {!isStreaming && (
        <View className="px-4 py-4">
          <View className="flex-row bg-white/50 p-1 rounded-[20px] border border-white shadow-sm">
            {['STREAM', 'LIBRARY', 'MONITOR'].map(s => (
              <TouchableOpacity 
                key={s} 
                onPress={() => setActiveTab(s as any)}
                className={`flex-1 py-3 rounded-[18px] items-center ${activeTab === s ? 'bg-indigo-600 shadow-md shadow-indigo-100' : ''}`}
              >
                <Text className={`text-[9px] font-black uppercase tracking-[1.5px] font-inter-black ${activeTab === s ? 'text-white' : 'text-gray-400'}`}>
                  {s === 'STREAM' ? 'Go Live' : s === 'LIBRARY' ? 'Archive' : 'Monitor'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
      <View className="flex-1">
        {activeTab === 'STREAM' && renderStreamTab()}
        {activeTab === 'LIBRARY' && renderLibraryTab()}
        {activeTab === 'MONITOR' && renderMonitorTab()}
      </View>
      <GoLiveModal 
        visible={showGoLiveModal} 
        onClose={() => setShowGoLiveModal(false)} 
        onStart={handleStartBroadcast}
        streamTitle={streamTitle} setStreamTitle={setStreamTitle}
        streamSubject={streamSubject} setStreamSubject={setStreamSubject}
        streamSource={streamSource as any} setStreamSource={setStreamSource as any}
        selectedCctvNode={selectedCctvNode} setSelectedCctvNode={setSelectedCctvNode}
        cctvNodes={memoizedCameraNodes} isLoading={isLoading}
      />
    </View>
  );
});
