import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Image, ActivityIndicator, Dimensions, Modal, Animated, Alert, AppState, AppStateStatus } from 'react-native';
import { CameraView, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system/legacy';
import { decode } from 'base64-arraybuffer';
import { useVideoPlayer, VideoView } from 'expo-video';
import { LinearGradient } from 'expo-linear-gradient';
import { styled } from 'nativewind';
import { supabase } from '../../../../lib/supabase';
import { Icons } from '../../../../components/Icons';
import { Video as VideoType, useSchoolData, LiveStream } from '../../../../contexts/SchoolDataContext';
import { ActionTile, AppCard, AppTheme, SectionHeader, StatCard, AppRow, StatusPill, AppTypography, AppButton, ModalShell } from '../../../design-system';
import { UploadMaterialModal } from '../modals/UploadMaterialModal';

const { width } = Dimensions.get('window');
const StyledLinearGradient = LinearGradient ? styled(LinearGradient) : View;

// Private component for GoLiveModal as it was consolidated
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
                    placeholder="e.g. Classroom Session A" 
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
                }`}>{s === 'CAMERA' ? 'Device Camera' : 'Security Feed'}</Text>
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

interface TeacherVideosProps {
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
}

interface SessionCapturedModalProps {
  visible: boolean;
  onSave: () => void;
  onDiscard: () => void;
}

const SessionCapturedModal: React.FC<SessionCapturedModalProps> = ({ visible, onSave, onDiscard }) => (
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

export const TeacherVideos: React.FC<TeacherVideosProps> = ({
  videoList = [],
  videoTab,
  setVideoTab,
  videoSearch,
  setVideoSearch,
  onShowVideoUploadModal,
  onVideoPress,
  isLiveStreamActive = false,
  onDeleteVideo,
  currentUser,
  teacherAssignedSections = []
}) => {
  const { 
    platformSettings, 
    setIsLiveSessionActive, 
    isLiveSessionActive: globalIsLiveActive,
    activeSessionData,
    setActiveSessionData,
    uploadVideo, 
    startLiveStream, 
    endLiveStream, 
    liveStreams 
  } = useSchoolData();

  const defaultTab = currentUser?.role === 'mentor' ? 'MONITOR' : 'STREAM';
  const [activeTab, setActiveTab] = useState<'STREAM' | 'LIBRARY' | 'MONITOR'>(defaultTab);
  
  // Local UI states synced with global session
  const [isStreaming, setIsStreaming] = useState(globalIsLiveActive);
  const [streamSource, setStreamSource] = useState<'CAMERA' | 'CCTV' | 'SCREEN'>(activeSessionData?.source || 'CAMERA');
  const [elapsed, setElapsed] = useState(0);

  // Restore session details if returning to an active stream
  useEffect(() => {
    if (globalIsLiveActive && activeSessionData) {
       setIsStreaming(true);
       setStreamSubject(activeSessionData.subject);
       setStreamTitle(activeSessionData.title);
       setStreamSource(activeSessionData.source);
    }
  }, [globalIsLiveActive]);

  // Orphan Stream Recovery (Place near the other useEffects)
  useEffect(() => {
    if (!liveStreams || !currentUser) return;
    
    // Find any active stream in the DB owned by this user
    const orphanStream = liveStreams.find(s => s.created_by === currentUser.id && s.is_active);
    
    // If one exists but the UI is NOT showing the streaming console, snap them back to it
    if (orphanStream && !isStreaming) {
        console.log('[RESCUE] Recovering orphaned stream:', orphanStream.id);
        setActiveSessionId(orphanStream.id);
        setActiveSessionData({
            id: orphanStream.id,
            title: orphanStream.title || 'Recovered Session',
            subject: orphanStream.subject || 'Recovered Session',
            source: orphanStream.stream_url === 'HARDWARE_CAMERA' ? 'CAMERA' : 'CCTV',
            startTime: new Date(orphanStream.created_at).getTime()
        });
        setStreamSubject(orphanStream.subject || 'Recovered Session');
        setIsStreaming(true);
        setIsLiveSessionActive(true);
    }
  }, [liveStreams, currentUser?.id, isStreaming]);

  // Persistent Timer Logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isStreaming && activeSessionData?.startTime) {
      interval = setInterval(() => {
        const delta = Math.floor((Date.now() - activeSessionData.startTime) / 1000);
        setElapsed(delta);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isStreaming, activeSessionData?.startTime]);

  // Sync Global Live State for UI suppression
  useEffect(() => {
    setIsLiveSessionActive(isStreaming);
  }, [isStreaming]);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);
  
  // Modal states for Go Live
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
  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const { dbCameraNodes, fetchCameraNodes } = useSchoolData();

  // CCTV Video Player
  const player = useVideoPlayer(selectedCctvNode?.stream_url || '', (p) => {
    p.loop = true;
    if (isStreaming && streamSource === 'CCTV') p.play();
  });

  // Fetch nodes on mount
  useEffect(() => {
    if (currentUser?.school_id) fetchCameraNodes(currentUser.school_id);
  }, [currentUser?.school_id]);

  // Production-Grade AppState Handling
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState.match(/inactive|background/) && isRecording) {
        console.log('[PRODUCTION] App backgrounded. Auto-stopping hardware recording.');
        handleEndSession();
      }
    };
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, [isRecording, recordedVideoUri]);

  // Production HUD Effects (Pulse/Scanline)
  useEffect(() => {
    if (isStreaming) {
      setViewerCount(Math.floor(Math.random() * 10) + 5);
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.2, duration: 1000, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true })
        ])
      ).start();
      Animated.loop(
        Animated.timing(scanlineAnim, { toValue: 1, duration: 3000, useNativeDriver: true })
      ).start();
    } else {
      pulseAnim.setValue(1);
      scanlineAnim.setValue(0);
    }
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
            const activeSection = (teacherAssignedSections || []).find(s => s.displayName === streamSubject) || teacherAssignedSections?.[0];

            const streamId = await startLiveStream({
                school_id: currentUser?.school_id,
                created_by: currentUser?.id,
                class_id: activeSection?.class_id || null,
                section: activeSection?.section || null,
                title: streamTitle,
                subject: streamSubject || activeSection?.subject || 'General',
                stream_url: streamSource === 'CAMERA' ? 'HARDWARE_CAMERA' : (selectedCctvNode?.stream_url || 'CCTV_FEED')
            });

            if (streamId) {
                const sessionInfo = {
                  id: streamId,
                  title: streamTitle,
                  subject: streamSubject,
                  source: streamSource,
                  startTime: Date.now()
                };
                setActiveSessionData(sessionInfo);
                setActiveSessionId(streamId);
                
                setTimeout(() => {
                    setIsLoading(false);
                    setIsStreaming(true);
                    setShowGoLiveModal(false);
                }, 1000);
            }

        } catch (err: any) {
            console.error('[TEACHER_BROADCAST_ERROR] Failed to publish session:', err.message);
            Alert.alert('Publishing Failed', 'Could not establish institutional connection.');
            setIsLoading(false);
        }
    };

    const handleEndSession = async () => {
        const idToEnd = activeSessionId || activeSessionData?.id;
        
        if (isRecording) {
            if (cameraRef.current) {
                cameraRef.current.stopRecording();
            }
        } else {
            setIsStreaming(false);
        }
        
        if (idToEnd) {
            await endLiveStream(idToEnd, currentUser?.school_id);
            setActiveSessionId(null);
            setActiveSessionData(null);
            setIsLiveSessionActive(false);
        }

        setElapsed(0);
        setViewerCount(0);
        setStreamTitle('');
        setStreamSubject('');
    };

  // Dedicated Effect for Camera Initialization and Recording Start
  useEffect(() => {
    if (isStreaming && streamSource === 'CAMERA' && isCameraReady) {
        // Now that the camera is READY and showing a feed, we start recording
        const startRecording = async () => {
            if (cameraRef.current) {
                try {
                    setIsRecording(true);
                    console.log('[BROADCAST] Hardware Ready. Starting Recording...');
                    // recordAsync is a blocking promise. It only resolves after stopRecording is called.
                    const video = await cameraRef.current.recordAsync({
                        maxDuration: 3600,
                        quality: '1080p'
                    });
                    
                    // Hardware encoder finished and flushed file to disk.
                    console.log('[BROADCAST] Recording saved safely to:', video.uri);
                    setRecordedVideoUri(video.uri);
                    setIsStreaming(false);
                    setIsRecording(false);
                    setShowCapturedModal(true); // Now it is safe to show the publish modal
                } catch (err) {
                    console.error('Hardware Recording Error:', err);
                    setIsRecording(false);
                    setIsStreaming(false);
                }
            }
        };
        startRecording();
    }
  }, [isStreaming, streamSource, isCameraReady]);

  const handleSnapshot = async () => {
    if (cameraRef.current && streamSource === 'CAMERA') {
        try {
            const { status } = await MediaLibrary.requestPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Media Library access is required to save snapshots.');
                return;
            }
            const photo = await cameraRef.current.takePictureAsync({ quality: 0.8, base64: false });
            await MediaLibrary.saveToLibraryAsync(photo.uri);
            Alert.alert('Snapshot Captured', 'Institutional snapshot saved to gallery.');
        } catch (err) {
            console.error('[BROADCAST] Snapshot Error:', err);
            Alert.alert('Hardware Error', 'Failed to capture snapshot.');
        }
    } else {
        Alert.alert('Node Sync', 'Snapshots are currently restricted to the Integrated Camera source.');
    }
  };

   // Session Handlers are now integrated above with Supabase Sync

  const handleSaveRecording = async () => {
    const videoUri = capturedUri || recordedVideoUri;
    if (videoUri && currentUser?.school_id) {
        setIsLoading(true);
        try {
            // 1. Optimized Native Upload (Prevents OOM & Network Errors)
            const formData = new FormData();
            formData.append('file', {
                uri: videoUri,
                name: `lecture_${Date.now()}.mp4`,
                type: 'video/mp4'
            } as any);
            
            const fileName = `lecture_${Date.now()}.mp4`;
            
            const { data: storageData, error: storageError } = await supabase.storage
                .from('videos')
                .upload(`${fileName}`, formData, { 
                  contentType: 'video/mp4',
                  upsert: true
                });
                
            if (storageError) throw storageError;

            const { data: { publicUrl } } = supabase.storage.from('videos').getPublicUrl(`${fileName}`);
            
            await uploadVideo({
                title: streamTitle || 'Recorded Broadcast',
                subject: streamSubject || 'General',
                duration: formatTime(elapsed),
                thumbnail_url: null,
                video_url: publicUrl,
                is_public: true,
                school_id: currentUser.school_id,
                created_by: currentUser.id
            });
            
            Alert.alert('Archive Updated', 'Institutional broadcast successfully published to library.');
        } catch (err: any) {
            console.error('Save Recording Error:', err.message);
            Alert.alert('Upload Failed', err.message);
        } finally {
            setIsLoading(false);
        }
    }
    setCapturedUri(null);
    setRecordedVideoUri(null);
    setShowCapturedModal(false);
  };

  const handleDiscardRecording = () => {
    setCapturedUri(null);
    setRecordedVideoUri(null);
    setShowCapturedModal(false);
  };

  const filteredVideos = (videoList || []).filter(v => 
    v.title?.toLowerCase().includes(videoSearch.toLowerCase()) || 
    v.subject?.toLowerCase().includes(videoSearch.toLowerCase())
  );

  const renderStreamTab = () => (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      {!isStreaming ? (
        <View className="px-4 pt-6 space-y-6">
          {/* Source Selector Card */}
          <AppCard className="p-5 border border-gray-100 shadow-sm">
            <Text className="text-gray-900 font-black text-lg tracking-tight mb-1 font-inter-black">Start Live Class</Text>
            <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-6 font-inter-black">Choose your stream source</Text>

            <View className="space-y-3">
              {[
                { id: 'CAMERA', icon: '📹', label: 'Device Camera',     desc: 'Stream from your phone or tablet camera' },
                { id: 'CCTV',   icon: '📷', label: 'Connect CCTV Feed', desc: 'Link classroom CCTV via RTSP / IP address' },
                { id: 'SCREEN', icon: '🖥️', label: 'Screen Share',       desc: 'Share your screen or presentation slides' },
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
                  activeOpacity={0.75}
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

            {/* RTSP Input for CCTV Mode */}
            {streamSource === 'CCTV' && (
              <View className="mt-4 bg-sky-50 p-4 rounded-2xl border border-sky-100">
                <Text className="text-sky-700 text-[10px] font-black uppercase tracking-widest mb-2 font-inter-black">CCTV Stream URL</Text>
                <View className="bg-white rounded-xl border border-sky-200 px-4 py-3">
                    <TextInput
                      style={{ fontSize: 13, color: '#0c4a6e', fontFamily: 'Inter_900Black' }}
                      placeholder="rtsp://192.168.1.101:554/stream"
                      placeholderTextColor="#94a3b8"
                      value={selectedCctvNode?.stream_url || ''}
                      onChangeText={(val) => setSelectedCctvNode({ stream_url: val })}
                      autoCapitalize="none"
                      keyboardType="url"
                    />
                </View>
                <Text className="text-sky-600/60 text-[9px] font-medium font-inter-medium mt-2">Enter the classroom CCTV IP stream address or RTSP link.</Text>
              </View>
            )}
          </AppCard>

          {/* Assigned Classes List */}
          <AppCard className="p-5 border border-gray-100 shadow-sm">
            <Text className="text-gray-900 font-black text-lg tracking-tight mb-1 font-inter-black">My Assigned Classes</Text>
            <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-4 font-inter-black">Select a class to go live</Text>

            <View className="space-y-4">
              {teacherAssignedSections.map((cls, i) => (
                <View key={i} className={`flex-row items-center py-3 ${i < teacherAssignedSections.length - 1 ? 'border-b border-gray-50' : ''}`}>
                  <View className="flex-1">
                    <Text className="text-gray-900 font-black text-[14px] font-inter-black">{cls.displayName}</Text>
                    <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1 font-inter-black">{cls.subject} • Room {cls.room_no}</Text>
                  </View>
                  <TouchableOpacity 
                    className="bg-indigo-600 px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-100 active:scale-95 transition-all"
                    onPress={() => {
                        setStreamSubject(cls.displayName);
                        setStreamTitle(`${cls.displayName} Live Session`);
                        setShowGoLiveModal(true);
                    }}
                  >
                    <Text className="text-white font-black text-[11px] uppercase tracking-widest font-inter-black">Go Live 📡</Text>
                  </TouchableOpacity>
                </View>
              ))}
              {teacherAssignedSections.length === 0 && (
                <Text className="text-gray-400 text-center py-4 font-inter-medium text-[12px]">No assigned classes found.</Text>
              )}
            </View>
          </AppCard>

          <View className="h-40" />
        </View>
      ) : (
        <View className="flex-1">
              {/* ═══════ LIVE PRODUCTION CONSOLE ═══════ */}
              <View className="flex-1 h-screen bg-slate-950">
                <View className="m-0 overflow-hidden bg-slate-950 shadow-2xl relative flex-1">
                   {/* Hardware Feed Layer */}
                   <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
                      {isStreaming && streamSource === 'CAMERA' && (
                          <CameraView 
                              key="teacher-active-camera-v5"
                              ref={cameraRef}
                              style={{ width: '100%', height: '100%' }}
                              facing="back"
                              mode="video"
                              ratio="16:9"
                              onCameraReady={() => setIsCameraReady(true)}
                              onMountError={(err) => Alert.alert('Hardware Error', err.message)}
                          />
                      )}
                      {isStreaming && streamSource === 'CCTV' && selectedCctvNode && (
                          <VideoView 
                            player={player} 
                            style={{ width: '100%', height: '100%' }} 
                            contentFit="cover"
                          />
                      )}
                      
                      {/* Live Texture Overlay */}
                      <View className="absolute inset-0 opacity-10 pointer-events-none">
                         <Animated.View 
                           style={{ 
                             height: 1, 
                             width: '100%', 
                             backgroundColor: 'rgba(255,255,255,0.3)',
                             transform: [{
                               translateY: scanlineAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 800] })
                             }]
                           }} 
                         />
                      </View>
                   </View>

                    {/* HUD: Top Bar */}
                    <View className="absolute top-12 left-6 right-6 z-20 flex-row justify-between items-start">
                       <View>
                          <View className="bg-rose-500 px-3 py-1.5 rounded-full flex-row items-center shadow-lg shadow-rose-900/40 border border-rose-400/50">
                             <Animated.View style={{ opacity: pulseAnim }} className="w-1.5 h-1.5 bg-white rounded-full mr-2" />
                             <Text className="text-white text-[8px] font-black uppercase tracking-[2px] font-inter-black">LIVE</Text>
                          </View>
                          <Text className="text-white font-black text-xl tracking-tight mt-3 font-inter-black">{streamSubject}</Text>
                          <Text className="text-white/50 text-[10px] font-black uppercase tracking-widest font-inter-black">Subject Stream</Text>
                       </View>

                       <View className="items-end">
                          <View className="bg-black/60 px-4 py-2 rounded-2xl border border-white/10 backdrop-blur-md items-center shadow-2xl">
                             <Text className="text-rose-400 font-black text-lg tracking-tight font-inter-black">{formatTime(elapsed)}</Text>
                             <Text className="text-white/30 text-[7px] font-black uppercase tracking-widest font-inter-black">RECORDING</Text>
                          </View>
                          <View className="bg-white/10 px-2 py-1 rounded-full mt-3 flex-row items-center">
                              <Icons.Users size={10} color="white" />
                              <Text className="text-white text-[8px] font-black uppercase tracking-widest ml-1 font-inter-black">{viewerCount} VIEWERS</Text>
                          </View>
                       </View>
                    </View>

                    {/* Viewfinder Watermark */}
                    <View className="absolute bottom-32 right-6 opacity-30 flex-row items-center gap-2">
                        <Icons.Radio size={14} color="white" />
                        <Text className="text-white font-black text-[10px] uppercase tracking-[3px] font-inter-black">SPRINGFIELD ACADEMY</Text>
                    </View>

                    {/* ═══════ FLOATING COMMAND CENTER ═══════ */}
                    <View className="absolute bottom-10 left-6 right-6 z-30">
                        <View className="bg-white/10 backdrop-blur-3xl p-4 rounded-[40px] border border-white/10 flex-row items-center gap-4 shadow-2xl">
                           <View className="flex-row flex-1 items-center gap-3">
                              {[
                                { id: 'mute', icon: isMuted ? Icons.Mute : Icons.Mic, color: isMuted ? '#f43f5e' : 'white', active: isMuted, onPress: () => setIsMuted(!isMuted) },
                                { id: 'snap', icon: Icons.Camera, color: 'white', active: false, onPress: handleSnapshot },
                                { id: 'chat', icon: Icons.Messages, color: 'white', active: false, onPress: () => {} }
                              ].map(ctrl => (
                                <TouchableOpacity 
                                  key={ctrl.id}
                                  onPress={ctrl.onPress}
                                  className={`w-14 h-14 items-center justify-center rounded-[24px] ${ctrl.active ? 'bg-white shadow-xl shadow-white/20' : 'bg-white/10 border border-white/10'}`}
                                >
                                  <ctrl.icon size={22} color={ctrl.active ? ctrl.color : 'white'} />
                                </TouchableOpacity>
                              ))}
                           </View>

                           <TouchableOpacity 
                             onPress={handleEndSession}
                             className="bg-rose-500 px-8 py-5 rounded-[28px] shadow-2xl shadow-rose-500/40 active:bg-rose-600 active:scale-95 transition-all"
                           >
                             <Text className="text-white text-[11px] font-black uppercase tracking-[3px] font-inter-black">■ END SESSION</Text>
                           </TouchableOpacity>
                        </View>
                    </View>
                </View>
              </View>
            </View>
        )}
        <View className="h-40" />
      </ScrollView>
  );

  const renderLibraryTab = () => {
    return (
      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        {/* Search Header */}
        <View className="bg-white p-4 rounded-[24px] border border-gray-100 shadow-sm flex-row items-center mb-6 mt-4">
           <Icons.Search size={18} color="#94a3b8" />
           <TextInput 
              className="flex-1 ml-4 text-[13px] font-black text-gray-900 font-inter-black"
              placeholder="Search Academy Videos..."
              value={videoSearch}
              onChangeText={setVideoSearch}
           />
           <TouchableOpacity onPress={onShowVideoUploadModal} className="bg-indigo-600 w-10 h-10 rounded-xl shadow-md shadow-indigo-100 items-center justify-center">
              <Icons.Plus size={16} color="white" />
           </TouchableOpacity>
        </View>

        <View className="space-y-4">
          {filteredVideos.length > 0 ? (
            filteredVideos.map((video) => (
              <AppCard key={video.id} className="p-0 overflow-hidden border border-white shadow-xl shadow-indigo-100/30">
                 <TouchableOpacity 
                   activeOpacity={0.9}
                   onPress={() => onVideoPress(video)}
                   className="flex-row"
                 >
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
              <View className="w-16 h-16 bg-white rounded-2xl items-center justify-center mb-6 shadow-xl shadow-indigo-100/50 border border-gray-50">
                 <Icons.Video size={32} color="#e2e8f0" />
              </View>
              
              <Text className="text-gray-900 text-lg font-black tracking-tight mb-1 font-inter-black">No Videos Found</Text>
              <Text className="text-gray-400 text-[10px] font-black text-center px-10 leading-relaxed font-inter-black uppercase tracking-widest">
                 Academy repository is empty
              </Text>
            </View>
          )}
        </View>
        <View className="h-40" />
      </ScrollView>
    );
  };

  const renderMonitorTab = () => {
    return (
      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
         <View className="bg-slate-950 p-7 rounded-[40px] shadow-2xl border border-slate-800 relative overflow-hidden mb-8 mt-4">
            <View className="relative z-10">
               <View className="w-12 h-12 bg-white/10 rounded-2xl items-center justify-center mb-6 border border-white/10">
                  <Icons.Eye size={24} color="white" />
               </View>
               <View className="flex-row items-center mb-6">
                 <View className="w-1 h-3.5 bg-indigo-500 rounded-full mr-2" />
                 <Text className="text-white font-black text-lg tracking-tight font-inter-black">Live Monitor</Text>
               </View>
               
               <View className="space-y-4">
                   {(dbCameraNodes && dbCameraNodes.length > 0 ? dbCameraNodes.slice(0, 3) : [1, 2, 3]).map((node: any, i: number) => (
                      <View key={node.id || i} className="flex-row items-center justify-between bg-white/5 p-5 rounded-[32px] border border-white/5">
                         <View className="flex-row items-center">
                            <View className="w-2 h-2 bg-emerald-500 rounded-full mr-4 shadow-sm shadow-emerald-500" />
                            <View>
                              <Text className="text-white font-black text-[13px] tracking-tight font-inter-black">{node.name || `Classroom ${i+1}0A`}</Text>
                              <Text className="text-slate-500 text-[9px] font-black uppercase tracking-widest mt-1 font-inter-black">Uplink Active • Node {i+1}</Text>
                            </View>
                         </View>
                         <View className="flex-row items-center gap-1.5">
                             {([0.4, 0.7, 0.5] || []).map((h, idx) => (
                              <Animated.View 
                                key={idx}
                                style={{ 
                                  width: 2, 
                                  height: 12 * h, 
                                  backgroundColor: '#10b981',
                                  opacity: pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] })
                                }} 
                              />
                            ))}
                         </View>
                      </View>
                   ))}
                </View>
             </View>
             <View className="absolute -bottom-10 -right-10 opacity-5">
                <Icons.Shield size={200} color="white" />
             </View>
          </View>
         <View className="h-40" />
      </ScrollView>
    );
  };

  return (
    <View className="flex-1 bg-[#f5f7ff]">
      {/* Segment Selector Header */}
      {!isStreaming && (
        <View className="px-4 pt-12 pb-2">
          <View className="flex-row bg-white/50 p-1 rounded-[20px] border border-white shadow-sm mb-4">
            {(() => {
              let tabs = ['STREAM', 'LIBRARY'];
              if (currentUser?.role === 'mentor') tabs = ['STREAM', 'MONITOR', 'LIBRARY']; 
              return tabs;
            })().map(s => (
              <TouchableOpacity 
                key={s}
                onPress={() => setActiveTab(s as any)}
                className={`flex-1 py-3 rounded-[18px] items-center ${activeTab === s ? 'bg-indigo-600 shadow-md shadow-indigo-100' : ''}`}
              >
                <Text className={`text-[9px] font-black uppercase tracking-[1.5px] font-inter-black ${activeTab === s ? 'text-white' : 'text-gray-400'}`}>
                  {s === 'STREAM' ? 'Go Live' : s === 'MONITOR' ? 'Live Monitor' : 'Library'}
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
        streamTitle={streamTitle}
        setStreamTitle={setStreamTitle}
        streamSubject={streamSubject}
        setStreamSubject={setStreamSubject}
        streamSource={streamSource as any}
        setStreamSource={setStreamSource as any}
        selectedCctvNode={selectedCctvNode}
        setSelectedCctvNode={setSelectedCctvNode}
        cctvNodes={dbCameraNodes}
        isLoading={isLoading}
      />
      <SessionCapturedModal 
        visible={showCapturedModal}
        onSave={handleSaveRecording}
        onDiscard={handleDiscardRecording}
      />
    </View>
  );
};
