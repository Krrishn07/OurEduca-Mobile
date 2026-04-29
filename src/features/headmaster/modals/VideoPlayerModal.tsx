import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { useSchoolData } from '../../../../contexts/SchoolDataContext';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEventListener } from 'expo';
import YoutubePlayer from 'react-native-youtube-iframe';
import { Icons } from '../../../../components/Icons';
import { Video as VideoType } from '../../../../contexts/SchoolDataContext';
import { HardwareStreamPlayer } from '../../../../components/HardwareStreamPlayer';

interface VideoPlayerModalProps {
    visible: boolean;
    onClose: () => void;
    video: VideoType | null;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
    visible,
    onClose,
    video
}) => {
    const { schoolDetails } = useSchoolData();
    const [isLoading, setIsLoading] = useState(true);
    const [elapsedTime, setElapsedTime] = useState(0);

    const isHardwareCamera = video?.video_url === 'HARDWARE_CAMERA';
    const isLiveNode = isHardwareCamera || video?.subject?.toLowerCase().includes('live') || video?.video_url?.includes('rtsp') || video?.title?.toLowerCase().includes('node');

    React.useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isLiveNode) {
            // Calculate actual elapsed time based on the database creation timestamp
            const startTimestamp = video?.created_at ? new Date(video.created_at).getTime() : Date.now();
            
            const syncTimer = () => {
                const deltaSeconds = Math.floor((Date.now() - startTimestamp) / 1000);
                setElapsedTime(deltaSeconds > 0 ? deltaSeconds : 0);
            };

            syncTimer(); // Set immediately on mount
            interval = setInterval(syncTimer, 1000);
        }
        return () => clearInterval(interval);
    }, [isLiveNode, video?.created_at]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const getYoutubeId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const youtubeId = video?.video_url ? getYoutubeId(video.video_url) : null;

    const playbackUrl = isHardwareCamera 
        ? 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4' 
        : (video?.video_url || '');





    if (!video) return null;

    return (
        <Modal visible={visible} animationType="fade" transparent={false} statusBarTranslucent>
            <View className="flex-1 bg-black justify-center">
                {/* Header Controls */}
                <View className="absolute top-12 left-0 right-0 z-50 px-6 flex-row justify-between items-center">
                    <View className="flex-1 mr-4">
                        <Text className="text-white font-black text-lg shadow-sm" numberOfLines={1}>
                            {video.title}
                        </Text>
                        <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-0.5">
                            {video.subject || 'Institutional Lecture'} {isLiveNode ? '• LIVE' : ''}
                        </Text>
                    </View>
                    <TouchableOpacity 
                        onPress={onClose}
                        className="bg-white/20 p-2.5 rounded-full backdrop-blur-md border border-white/30"
                    >
                        <Icons.Close size={20} color="white" />
                    </TouchableOpacity>
                </View>

                {/* Video Player & Monitor Deck */}
                <View className={`w-full aspect-video bg-black relative`}>
                    {youtubeId ? (
                         <YoutubePlayer height="100%" play={true} videoId={youtubeId} onReady={() => setIsLoading(false)} />
                    ) : (
                         <HardwareStreamPlayer 
                             url={playbackUrl} 
                             style={{ flex: 1 }} 
                             hideUI={true}
                         />
                    )}

                    {/* Platinum Viewfinder Overlays */}
                    {isLiveNode && (
                        <View className="absolute inset-0 pointer-events-none">
                             {/* Scanline Overlay */}
                             <View className="absolute inset-0 opacity-[0.03]">
                                  {Array.from({ length: 60 }).map((_, i) => (
                                     <View key={i} className="h-0.5 w-full bg-white mb-0.5" />
                                  ))}
                             </View>
                             
                             {/* Corner Accents */}
                             <View className="absolute top-4 left-4 w-10 h-10 border-t-2 border-l-2 border-white/20" />
                             <View className="absolute top-4 right-4 w-10 h-10 border-t-2 border-r-2 border-white/20" />
                             <View className="absolute bottom-4 left-4 w-10 h-10 border-b-2 border-l-2 border-white/20" />
                             <View className="absolute bottom-4 right-4 w-10 h-10 border-b-2 border-r-2 border-white/20" />
                        </View>
                    )}

                    {/* Scanline Overlay Logic */}
                    {isLiveNode && (
                        <View className="absolute inset-0 pointer-events-none opacity-[0.03]">
                             {Array.from({ length: 60 }).map((_, i) => (
                                <View key={i} className="h-0.5 w-full bg-white mb-0.5" />
                             ))}
                        </View>
                    )}
                    
                    {isLoading && youtubeId && !isLiveNode && (
                        <View className="absolute inset-0 items-center justify-center bg-black/40">
                            <ActivityIndicator size="large" color="#6366f1" />
                        </View>
                    )}

                    {/* Platinum Watermarking */}
                    <View className="absolute bottom-4 right-4 flex-row items-center bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white/5">
                        {schoolDetails?.logo_url ? (
                            <Image 
                                source={{ uri: schoolDetails.logo_url }} 
                                className="w-6 h-6 opacity-80 mr-3"
                                resizeMode="contain"
                            />
                        ) : (
                            <Icons.Shield size={14} color="#6366f1" />
                        )}
                        <View>
                            <Text className="text-white font-black text-[9px] uppercase tracking-[2px]">
                                {schoolDetails?.name || 'Institutional Node'}
                            </Text>
                            <Text className="text-white/40 text-[8px] font-black uppercase tracking-widest mt-0.5">Encrypted Stream</Text>
                        </View>
                    </View>

                    {isLiveNode && (
                        <View className="absolute top-4 left-4 bg-red-600/90 px-3 py-1.5 rounded-lg shadow-xl shadow-red-500/30 flex-row items-center">
                             <View className="w-1.5 h-1.5 bg-white rounded-full mr-2" />
                             <Text className="text-white font-mono text-[11px] font-black tracking-tight">{formatTime(elapsedTime)}</Text>
                        </View>
                    )}
                </View>

                {/* Metadata Overlay (Bottom) */}
                <View className="absolute bottom-32 left-6 right-6">
                    <View className="bg-black/40 p-4 rounded-2xl border border-white/10 backdrop-blur-md flex-row justify-between items-center">
                        <View className="flex-row items-center">
                            <View className="w-10 h-10 bg-indigo-500/20 rounded-xl items-center justify-center mr-3 border border-indigo-500/30">
                                <Icons.Video size={20} color="#818cf8" />
                            </View>
                            <View>
                                <Text className="text-white font-black text-[11px]">Tactical Feed Active</Text>
                                <Text className="text-gray-400 text-[8px] uppercase font-black tracking-[2px] mt-0.5">Secure Institutional Node</Text>
                            </View>
                        </View>
                        {isLiveNode && (
                             <View className="items-end">
                                <Text className="text-red-500 font-mono text-lg font-black tracking-tighter leading-none">{formatTime(elapsedTime)}</Text>
                                <Text className="text-slate-500 text-[8px] font-black uppercase mt-1">Telemetry</Text>
                             </View>
                        )}
                    </View>
                </View>

                {/* Production Controls Footer */}
                <View className="absolute bottom-10 left-0 right-0 px-6 flex-row justify-between items-center">
                    <View className="flex-row gap-4">
                        {[
                            { icon: Icons.Mic, label: 'Mute' },
                            { icon: Icons.Camera, label: 'Snap' },
                            { icon: Icons.Layers, label: 'Layout' }
                        ].map((ctrl, i) => (
                            <TouchableOpacity 
                                key={i}
                                className="w-12 h-12 bg-white/10 rounded-2xl items-center justify-center border border-white/20 backdrop-blur-xl active:bg-white/20"
                            >
                                <ctrl.icon size={20} color="white" />
                            </TouchableOpacity>
                        ))}
                    </View>
                    <TouchableOpacity 
                        onPress={onClose}
                        className="bg-red-600 px-6 py-3.5 rounded-2xl flex-row items-center shadow-lg shadow-red-500/20"
                    >
                        <Icons.Close size={16} color="white" />
                        <Text className="text-white font-black uppercase tracking-widest text-[10px] ml-3">Terminate</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};
