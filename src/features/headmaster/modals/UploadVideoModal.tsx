import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, TextInput, ScrollView, ActivityIndicator, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as VideoThumbnails from 'expo-video-thumbnails';
import { Icons } from '../../../../components/Icons';
import { LinearGradient } from 'expo-linear-gradient';
import { styled } from 'nativewind';

const StyledLinearGradient = styled(LinearGradient);

interface UploadVideoModalProps {
    visible: boolean;
    onClose: () => void;
    onUpload: (video: {
        title: string;
        subject: string;
        video_url: string;
        class_id?: string;
        section?: string;
        is_public: boolean;
        localVideoUri?: string;
        localThumbUri?: string;
    }) => Promise<void>;
    assignedSections: any[];
    isUploading: boolean;
}

export const UploadVideoModal: React.FC<UploadVideoModalProps> = ({
    visible,
    onClose,
    onUpload,
    assignedSections = [],
    isUploading
}) => {
    const [title, setTitle] = useState('');
    const [subject, setSubject] = useState('');
    const [videoUrl, setVideoUrl] = useState('');
    const [uploadMode, setUploadMode] = useState<'FILE' | 'URL'>('FILE');
    const [localVideoUri, setLocalVideoUri] = useState<string | null>(null);
    const [localThumbUri, setLocalThumbUri] = useState<string | null>(null);
    
    const [selectedRosterId, setSelectedRosterId] = useState<string | null>(null);
    const [selectedClassId, setSelectedClassId] = useState<string | null>(null);

    // Selection Logic: Initialize with null to allow user to pick their own target
    useEffect(() => {
        if (!selectedRosterId) {
            // Optional: Auto-select can be disabled or made more robust
            // setSelectedRosterId(null);
        }
    }, [assignedSections]);

    // Keep selectedClassId in sync for the actual upload logic
    useEffect(() => {
        if (selectedRosterId && assignedSections) {
            const selected = (assignedSections || []).find(s => (s.rosterId || s.id) === selectedRosterId);
            if (selected) {
                setSelectedClassId(selected.class_id);
            }
        }
    }, [selectedRosterId, assignedSections]);

    const [isPublic, setIsPublic] = useState(false);

    const generateThumbnail = async (videoUri: string) => {
        try {
            const { uri } = await VideoThumbnails.getThumbnailAsync(videoUri, {
                time: 1000,
            });
            setLocalThumbUri(uri);
        } catch (e) {
            console.warn("Auto-thumb failed:", e);
        }
    };

    const pickVideo = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['videos'],
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled) {
            setLocalVideoUri(result.assets[0].uri);
            generateThumbnail(result.assets[0].uri);
        }
    };

    const pickCustomThumbnail = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [16, 9],
            quality: 1,
        });

        if (!result.canceled) {
            setLocalThumbUri(result.assets[0].uri);
        }
    };

    const handleUpload = async () => {
        if (!title) return;
        if (uploadMode === 'URL' && !videoUrl) return;
        if (uploadMode === 'FILE' && !localVideoUri) return;

        await onUpload({
            title,
            subject,
            video_url: uploadMode === 'URL' ? videoUrl : (localVideoUri || ''),
            class_id: selectedClassId || undefined,
            section: (assignedSections || []).find(s => (s.id || s.rosterId) === selectedRosterId)?.section,
            is_public: isPublic,
            localVideoUri: uploadMode === 'FILE' ? localVideoUri || undefined : undefined,
            localThumbUri: localThumbUri || undefined
        });
        
        // Reset state
        setTitle('');
        setSubject('');
        setVideoUrl('');
        setLocalVideoUri(null);
        setLocalThumbUri(null);
        onClose();
    };

    return (
        <Modal visible={visible} animationType="slide" transparent={true}>
            <View className="flex-1 bg-black/60 justify-end">
                <View className="bg-white h-[85%] rounded-t-[40px] shadow-2xl">
                    <ScrollView showsVerticalScrollIndicator={false} className="p-6">
                        <View className="flex-row justify-between items-center mb-8">
                            <View>
                                <Text className="text-2xl font-black text-gray-900">Upload Video</Text>
                                <Text className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">E-Learning Content</Text>
                            </View>
                            <TouchableOpacity onPress={onClose} className="bg-gray-50 p-2 rounded-full">
                                <Icons.Close size={20} color="#6b7280" />
                            </TouchableOpacity>
                        </View>

                        <View className="space-y-6">
                            {/* Source Mode Switcher */}
                            <View className="flex-row bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
                                <TouchableOpacity 
                                    onPress={() => setUploadMode('FILE')}
                                    className={`flex-1 py-3 rounded-xl flex-row items-center justify-center ${uploadMode === 'FILE' ? 'bg-white shadow-sm' : ''}`}
                                >
                                    <Icons.Video size={16} color={uploadMode === 'FILE' ? '#4f46e5' : '#94a3b8'} />
                                    <Text className={`text-[10px] font-black uppercase tracking-wider ml-2 ${uploadMode === 'FILE' ? 'text-gray-900' : 'text-gray-400'}`}>Native File</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    onPress={() => setUploadMode('URL')}
                                    className={`flex-1 py-3 rounded-xl flex-row items-center justify-center ${uploadMode === 'URL' ? 'bg-white shadow-sm' : ''}`}
                                >
                                    <Icons.Globe size={16} color={uploadMode === 'URL' ? '#4f46e5' : '#94a3b8'} />
                                    <Text className={`text-[10px] font-black uppercase tracking-wider ml-2 ${uploadMode === 'URL' ? 'text-gray-900' : 'text-gray-400'}`}>Social Link</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Title */}
                            <View>
                                <Text className="text-[11px] font-black text-gray-400 uppercase tracking-wider mb-2 ml-1">Video Title</Text>
                                <View className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-4">
                                    <TextInput
                                        placeholder="e.g. Physics Chapter 4 Lecture"
                                        value={title}
                                        onChangeText={setTitle}
                                        className="text-gray-900 font-medium"
                                    />
                                </View>
                            </View>

                            {/* Subject */}
                            <View>
                                <Text className="text-[11px] font-black text-gray-400 uppercase tracking-wider mb-2 ml-1">Subject</Text>
                                <View className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-4">
                                    <TextInput
                                        placeholder="e.g. Mathematics"
                                        value={subject}
                                        onChangeText={setSubject}
                                        className="text-gray-900 font-medium"
                                    />
                                </View>
                            </View>

                            {/* Source Selection */}
                            {uploadMode === 'FILE' ? (
                                <View className="flex-row gap-4">
                                    <TouchableOpacity 
                                        onPress={pickVideo}
                                        className="flex-1 aspect-video bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl items-center justify-center relative overflow-hidden"
                                    >
                                        {localVideoUri ? (
                                            <>
                                                <Icons.Check size={32} color="#10b981" />
                                                <Text className="text-[10px] font-black text-emerald-500 uppercase mt-2">Asset Ready</Text>
                                            </>
                                        ) : (
                                            <>
                                                <Icons.Plus size={32} color="#cbd5e1" />
                                                <Text className="text-[10px] font-black text-gray-400 uppercase mt-2">Select Video</Text>
                                            </>
                                        )}
                                    </TouchableOpacity>

                                    <TouchableOpacity 
                                        onPress={pickCustomThumbnail}
                                        className="w-1/3 aspect-video bg-gray-50 border border-gray-100 rounded-3xl items-center justify-center relative overflow-hidden"
                                    >
                                        {localThumbUri ? (
                                            <Image source={{ uri: localThumbUri }} className="w-full h-full" />
                                        ) : (
                                            <>
                                                <Icons.Camera size={20} color="#cbd5e1" />
                                                <Text className="text-[8px] font-black text-gray-400 uppercase mt-1">Cover</Text>
                                            </>
                                        )}
                                        <View className="absolute inset-0 bg-black/5 items-center justify-center">
                                            <Text className="text-[8px] font-black text-white uppercase bg-black/40 px-2 py-0.5 rounded-md">Edit</Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <View>
                                    <Text className="text-[11px] font-black text-gray-400 uppercase tracking-wider mb-2 ml-1">Social Link</Text>
                                    <View className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-4">
                                        <TextInput
                                            placeholder="Paste YouTube or MP4 link..."
                                            value={videoUrl}
                                            onChangeText={setVideoUrl}
                                            className="text-gray-900 font-medium"
                                        />
                                    </View>
                                </View>
                            )}

                            {/* Class Selection */}
                                <Text className="text-[11px] font-black text-gray-400 uppercase tracking-wider mb-2 ml-1">Target Class</Text>
                                <View className="flex-row flex-wrap gap-2">
                                    {(assignedSections || []).map(s => {
                                        const uniqueId = s.rosterId || s.id;
                                        const isSelected = selectedRosterId === uniqueId;
                                        return (
                                            <TouchableOpacity
                                                key={uniqueId}
                                                onPress={() => setSelectedRosterId(uniqueId)}
                                                className={`px-4 py-2 rounded-xl border ${isSelected ? 'bg-indigo-600 border-indigo-600 shadow-sm shadow-indigo-200' : 'bg-white border-gray-100'}`}
                                            >
                                                <Text className={`text-[10px] font-black ${isSelected ? 'text-white' : 'text-gray-500'}`}>
                                                  {s.displayName || s.classes?.name || s.name || 'Unnamed Class'}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>

                            {/* Visibility */}
                            <View className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                                <View className="flex-row justify-between items-center">
                                    <View className="flex-1">
                                        <Text className="text-sm font-black text-gray-900">Make Public</Text>
                                        <Text className="text-[10px] text-gray-400 mt-1">Available to all students in the institution</Text>
                                    </View>
                                    <TouchableOpacity 
                                        onPress={() => setIsPublic(!isPublic)}
                                        className={`w-12 h-6 rounded-full px-1 justify-center ${isPublic ? 'bg-indigo-600' : 'bg-gray-300'}`}
                                    >
                                        <View className={`w-4 h-4 rounded-full bg-white shadow-sm ${isPublic ? 'self-end' : 'self-start'}`} />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <TouchableOpacity
                                onPress={handleUpload}
                                disabled={isUploading || !title || (uploadMode === 'URL' && !videoUrl) || (uploadMode === 'FILE' && !localVideoUri)}
                                className={`w-full py-5 rounded-[24px] flex-row items-center justify-center shadow-lg mb-10 ${isUploading || !title || (uploadMode === 'URL' && !videoUrl) || (uploadMode === 'FILE' && !localVideoUri) ? 'bg-gray-300' : 'bg-gray-900'}`}
                            >
                                {isUploading ? (
                                    <ActivityIndicator color="white" size="small" />
                                ) : (
                                    <>
                                        <Icons.Upload size={20} color="white" />
                                        <Text className="text-white font-black ml-2 tracking-wide">Publish Video Content</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};
