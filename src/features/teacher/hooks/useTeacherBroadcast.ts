import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { AppState, AppStateStatus, Alert } from 'react-native';
import { CameraView, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import { useVideoPlayer } from 'expo-video';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';
import { supabase, supabaseUrl, supabaseAnonKey } from '../../../../lib/supabase';
import { useSchoolData } from '../../../../contexts/SchoolDataContext';
import { useSystemStatus } from '../../../../contexts/SystemStatusContext';

interface UseTeacherBroadcastProps {
    currentUser: any;
    teacherAssignedSections: any[];
}

export const useTeacherBroadcast = ({ currentUser, teacherAssignedSections }: UseTeacherBroadcastProps) => {
    const { 
        uploadVideo, 
        startLiveStream, 
        endLiveStream, 
        liveStreams,
        dbCameraNodes,
        fetchCameraNodes
    } = useSchoolData();

    const {
        isLiveSessionActive: globalIsLiveActive,
        setIsLiveSessionActive,
        activeSessionData,
        setActiveSessionData
    } = useSystemStatus();

    const [isStreaming, setIsStreaming] = useState(globalIsLiveActive);
    const [streamSource, setStreamSource] = useState<'CAMERA' | 'CCTV' | 'SCREEN'>(activeSessionData?.source || 'CAMERA');
    const [elapsed, setElapsed] = useState(0);
    const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [streamTitle, setStreamTitle] = useState('');
    const [streamSubject, setStreamSubject] = useState('');
    const [viewerCount, setViewerCount] = useState(0);
    const [isMuted, setIsMuted] = useState(false); // Note: Hardware mute is not supported by expo-camera during active recording.
    const [showChat, setShowChat] = useState(false);
    
    // Recording states
    const [isRecording, setIsRecording] = useState(false);
    const [recordedVideoUri, setRecordedVideoUri] = useState<string | null>(null);
    const [isCameraReady, setIsCameraReady] = useState(false);
    const [selectedCctvNode, setSelectedCctvNode] = useState<any>(null);
    const [showCapturedModal, setShowCapturedModal] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [messages, setMessages] = useState<any[]>([]);

    const cameraRef = useRef<any>(null);
    const viewerChannelRef = useRef<any>(null);
    const [cameraPermission, requestCameraPermission] = useCameraPermissions();
    const [micPermission, requestMicPermission] = useMicrophonePermissions();

    // CCTV Player
    const player = useVideoPlayer(selectedCctvNode?.stream_url || '', (p) => {
        p.loop = true;
        if (isStreaming && streamSource === 'CCTV') p.play();
    });

    // Fetch nodes on mount
    useEffect(() => {
        if (currentUser?.school_id) fetchCameraNodes(currentUser.school_id);
    }, [currentUser?.school_id]);

    const isEndingSession = useRef(false);

    // Restore session details
    useEffect(() => {
        // Guard: Only restore if global state is active and we haven't already initialized local streaming
        // AND we are not in the middle of ending a session
        if (globalIsLiveActive && activeSessionData && !isStreaming && !isEndingSession.current) {
            setIsStreaming(true);
            setStreamSubject(activeSessionData.subject);
            setStreamTitle(activeSessionData.title);
            setStreamSource(activeSessionData.source);
        }
    }, [globalIsLiveActive, activeSessionData, isStreaming]);

    // Timer logic
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

    // Recording Logic
    useEffect(() => {
        let isMounted = true;
        let timer: NodeJS.Timeout;
        
        const startRecording = async () => {
            if (isStreaming && streamSource === 'CAMERA' && isCameraReady && cameraRef.current && !isRecording) {
                try {
                    setIsRecording(true);
                    console.log('[BROADCAST] Hardware Ready. Starting recording...');
                    
                    const video = await cameraRef.current.recordAsync({
                        quality: '720p',
                        maxDuration: 3600,
                    });
                    
                    // Recording finished (stopRecording was called)
                    if (isMounted) {
                        setRecordedVideoUri(video.uri);
                        setIsRecording(false);
                        setShowCapturedModal(true);
                        // DB cleanup is handled by handleEndSession, not here
                    }
                } catch (err) {
                    console.error('[RECORDING_ERROR]', err);
                    if (isMounted) setIsRecording(false);
                }
            }
        };

        if (isStreaming && streamSource === 'CAMERA' && isCameraReady) {
            // Hardware settlement delay
            timer = setTimeout(startRecording, 1000);
        }

        return () => { 
            isMounted = false;
            if (timer) clearTimeout(timer);
        };
    }, [isStreaming, streamSource, isCameraReady]);

    // Real-time Viewer Count using Supabase Presence
    useEffect(() => {
        let channel: any = null;
        
        if (isStreaming && (activeSessionId || activeSessionData?.id)) {
            const streamId = activeSessionId || activeSessionData?.id;
            channel = supabase.channel(`stream:${streamId}`, {
                config: { presence: { key: currentUser?.id } }
            });

            channel
                .on('presence', { event: 'sync' }, () => {
                    const state = channel.presenceState();
                    setViewerCount(Object.keys(state).length);
                })
                .on('broadcast', { event: 'chat_message' }, ({ payload }) => {
                    setMessages(prev => [...prev, payload]);
                })
                .subscribe(async (status: string) => {
                    if (status === 'SUBSCRIBED') {
                        await channel.track({ 
                            user_id: currentUser?.id, 
                            role: 'broadcaster',
                            online_at: new Date().toISOString() 
                        });
                    }
                });

            viewerChannelRef.current = channel;
        } else {
            setViewerCount(0);
        }

        return () => {
            if (channel) {
                channel.unsubscribe();
                viewerChannelRef.current = null;
            }
        };
    }, [isStreaming, activeSessionId, activeSessionData?.id, currentUser?.id]);

    const [showGoLiveModal, setShowGoLiveModal] = useState(false);

    const handleStartBroadcast = useCallback(async (config?: { title: string; subject: string; source: 'CAMERA' | 'CCTV'; cctvNode?: any }) => {
        isEndingSession.current = false;
        const titleToUse = config?.title || streamTitle;
        const subjectToUse = config?.subject || streamSubject;
        const sourceToUse = config?.source || streamSource;
        const cctvNodeToUse = config?.cctvNode || selectedCctvNode;

        if (!titleToUse) {
            Alert.alert('Missing Info', 'Please provide a session title.');
            return;
        }

        // Production Requirement: Explicitly request hardware permissions before session start
        if (sourceToUse === 'CAMERA') {
            const camPerm = await requestCameraPermission();
            const micPerm = await requestMicPermission();
            
            if (!camPerm.granted || !micPerm.granted) {
                Alert.alert('Hardware Access Required', 'Institutional broadcast requires Camera and Microphone access.');
                return;
            }
        }

        // Update local state if config was provided (syncing with Modal internal state)
        if (config) {
            setStreamTitle(config.title);
            setStreamSubject(config.subject);
            setStreamSource(config.source);
            setSelectedCctvNode(config.cctvNode);
        }

        setIsLoading(true);
        try {
            const activeSection = (teacherAssignedSections || []).find(s => s.displayName === subjectToUse) || teacherAssignedSections?.[0];

            const streamData = await startLiveStream({
                school_id: currentUser?.school_id,
                created_by: currentUser?.id,
                class_id: activeSection?.class_id || null,
                section: activeSection?.section || null,
                title: titleToUse,
                subject: subjectToUse || activeSection?.subject || 'General',
                source: sourceToUse,
                stream_url: sourceToUse === 'CCTV' ? cctvNodeToUse?.stream_url : 'MOBILE_HARDWARE_FEED'
            });

            if (streamData) {
                const sessionInfo = {
                    id: streamData.id,
                    title: titleToUse,
                    subject: subjectToUse,
                    source: sourceToUse,
                    startTime: new Date(streamData.created_at).getTime()
                };
                setActiveSessionData(sessionInfo);
                setActiveSessionId(streamData.id);
                setIsStreaming(true);
                setIsLiveSessionActive(true);
                setShowGoLiveModal(false);
            }
        } catch (err: any) {
            console.error('[TEACHER_BROADCAST_ERROR]', err.message);
            Alert.alert('Publishing Failed', 'Could not establish institutional connection.');
        } finally {
            setIsLoading(false);
        }
    }, [streamTitle, streamSubject, streamSource, selectedCctvNode, teacherAssignedSections, currentUser, startLiveStream, setActiveSessionData, setIsLiveSessionActive]);

    const handleEndSession = useCallback(async () => {
        isEndingSession.current = true;
        const idToEnd = activeSessionId || activeSessionData?.id;
        
        // 1. Aggressively clear ALL state immediately
        setIsLiveSessionActive(false);
        setIsStreaming(false);
        setActiveSessionId(null);
        setActiveSessionData(null);
        setElapsed(0);
        setViewerCount(0);

        // 2. If recording, signal hardware to stop
        if (isRecording && cameraRef.current) {
            try { cameraRef.current.stopRecording(); } catch (e) { /* already stopped */ }
            setIsRecording(false);
        }

        // 3. ALWAYS call endLiveStream — it sweeps ALL orphan streams by this user
        try {
            await endLiveStream(idToEnd || '', currentUser?.school_id || '');
            console.log('[BROADCAST] All active streams terminated.');
        } catch (err) {
            console.error('[BROADCAST] Failed to end stream in DB:', err);
        }
    }, [activeSessionId, activeSessionData, isRecording, currentUser?.school_id, endLiveStream, setIsLiveSessionActive, setActiveSessionData, setActiveSessionId]);

    const handleSnapshot = useCallback(async () => {
        if (cameraRef.current && streamSource === 'CAMERA') {
            try {
                const { status } = await MediaLibrary.requestPermissionsAsync();
                if (status !== 'granted') return;
                const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
                await MediaLibrary.saveToLibraryAsync(photo.uri);
                Alert.alert('Snapshot Captured', 'Institutional snapshot saved.');
            } catch (err) {
                Alert.alert('Hardware Error', 'Failed to capture snapshot.');
            }
        }
    }, [streamSource]);

    // AppState Listener to prevent orphaned sessions/hardware locks
    useEffect(() => {
        const handleAppStateChange = (nextAppState: AppStateStatus) => {
            if (nextAppState.match(/inactive|background/) && (isStreaming || isRecording)) {
                handleEndSession();
            }
        };
        const subscription = AppState.addEventListener('change', handleAppStateChange);
        return () => subscription.remove();
    }, [handleEndSession, isStreaming, isRecording]);

    const handleSaveRecording = useCallback(async () => {
        if (!recordedVideoUri || !currentUser?.school_id) return;
        
        setIsLoading(true);
        try {
            const entropy = Math.random().toString(36).slice(2, 7);
            const fileName = `${currentUser?.school_id || 'general'}/${Date.now()}_${entropy}.mp4`;
            setUploadProgress(0);
            
            // USE DISK STREAMING (Prevents OOM Crashes on Large Videos)
            const { data: { session } } = await supabase.auth.getSession();
            
            const uploadResult = await FileSystem.uploadAsync(
                `${supabaseUrl}/storage/v1/object/videos/${fileName}`,
                recordedVideoUri,
                {
                    httpMethod: 'POST',
                    uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
                    headers: {
                        'Authorization': `Bearer ${session?.access_token || supabaseAnonKey}`,
                        'apikey': supabaseAnonKey,
                        'Content-Type': 'video/mp4',
                        'x-upsert': 'false',
                    },
                    onUploadProgress: ({ totalBytesUploaded, totalBytesExpectedToUpload }) => {
                        const progress = totalBytesUploaded / totalBytesExpectedToUpload;
                        setUploadProgress(Math.round(progress * 100));
                    },
                }
            );
 
            if (uploadResult.status >= 400) {
                throw new Error(`Upload failed with status ${uploadResult.status}`);
            }
 
            const publicUrl = `${supabaseUrl}/storage/v1/object/public/videos/${fileName}`;
            
            await uploadVideo({
                title: streamTitle || 'Recorded Broadcast',
                subject: streamSubject || 'General',
                duration: `${Math.floor(elapsed / 60)}:${(elapsed % 60).toString().padStart(2, '0')}`,
                video_url: publicUrl,
                is_public: true,
                school_id: currentUser.school_id,
                created_by: currentUser.id
            });
            Alert.alert('Archive Updated', 'Broadcast successfully published.');
        } catch (err: any) {
            Alert.alert('Upload Failed', err.message);
        } finally {
            setIsLoading(false);
            setUploadProgress(0);
            // Cleanup local file after attempt
            if (recordedVideoUri) {
                try {
                    await FileSystem.deleteAsync(recordedVideoUri, { idempotent: true });
                } catch (err) {
                    console.warn('[STORAGE_CLEANUP_ERROR]', err);
                }
            }
            setRecordedVideoUri(null);
            setShowCapturedModal(false);
        }
    }, [recordedVideoUri, currentUser, streamTitle, streamSubject, elapsed, uploadVideo]);

    const handleDiscardRecording = async () => {
        if (recordedVideoUri) {
            try {
                await FileSystem.deleteAsync(recordedVideoUri, { idempotent: true });
            } catch (err) {
                console.warn('[DISCARD_CLEANUP_ERROR]', err);
            }
        }
        setRecordedVideoUri(null);
        setShowCapturedModal(false);
    };

    const handleSendMessage = useCallback(async (text: string) => {
        if (!text.trim() || !viewerChannelRef.current) return;
        
        const payload = {
            user: currentUser?.school_name || currentUser?.id || 'Teacher',
            text: text.trim(),
            timestamp: new Date().toISOString()
        };

        await viewerChannelRef.current.send({
            type: 'broadcast',
            event: 'chat_message',
            payload
        });

        // Add locally as well
        setMessages(prev => [...prev, payload]);
    }, [currentUser]);

    return {
        isStreaming,
        setIsStreaming,
        streamSource,
        setStreamSource,
        elapsed,
        viewerCount,
        isMuted,
        setIsMuted,
        isLoading,
        messages,
        handleSendMessage,
        streamTitle,
        setStreamTitle,
        streamSubject,
        setStreamSubject,
        activeSessionId,
        cameraRef,
        isCameraReady,
        setIsCameraReady,
        selectedCctvNode,
        setSelectedCctvNode,
        showCapturedModal,
        setShowCapturedModal,
        showGoLiveModal,
        setShowGoLiveModal,
        recordedVideoUri,
        player,
        showChat,
        setShowChat,
        handleStartBroadcast,
        handleEndSession,
        handleSnapshot,
        handleSaveRecording,
        handleDiscardRecording,
        uploadProgress,
        fetchCameraNodes,
        cctvNodes: dbCameraNodes || [],
        cameraPermission,
        requestCameraPermission,
        micPermission,
        requestMicPermission
    };
};
