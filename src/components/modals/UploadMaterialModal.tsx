import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Pressable, Animated } from 'react-native';
import Reanimated, { FadeInDown } from 'react-native-reanimated';
import { Icons } from '@components/common/Icons';
import { AppTheme, ModalShell, FloatingInput } from '@components/common';
import * as DocumentPicker from 'expo-document-picker';
import { triggerHaptic, HapticPatterns } from '@utils/haptics';
import { SPRING_CONFIG } from '@constants/motion';

interface UploadMaterialModalProps {
  visible: boolean;
  onClose: () => void;
  onUpload: (data: {
    title: string;
    rosterId: string;
    type: 'PDF' | 'LINK';
    url: string;
    file: any;
  }) => void;
  assignedSections: any[];
  isUploading: boolean;
  error?: string | null;
  status?: string | null;
  initialRosterId?: string | null;
}

export const UploadMaterialModal: React.FC<UploadMaterialModalProps> = ({
  visible,
  onClose,
  onUpload,
  assignedSections = [],
  isUploading,
  error,
  status,
  initialRosterId
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [title, setTitle] = useState('');
  const [rosterId, setRosterId] = useState<string>(initialRosterId || '');
  const [type, setType] = useState<'PDF' | 'LINK'>('PDF');
  const [url, setUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string | null }>({});
  const successScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible) {
      setCurrentStep(1);
      setRosterId(initialRosterId || '');
      setTitle('');
      setUrl('');
      setSelectedFile(null);
      setType('PDF');
      setSaved(false);
      setErrors({});
    }
  }, [visible, initialRosterId]);

  useEffect(() => {
    if (type === 'PDF') setUrl('');
    else setSelectedFile(null);
  }, [type]);

  const pickDocument = async () => {
    try {
      triggerHaptic();
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'text/plain'],
        copyToCacheDirectory: true
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedFile(result.assets[0]);
        if (!title) setTitle(result.assets[0].name);
        setErrors(prev => ({ ...prev, file: null }));
      }
    } catch (err) {
      console.error('DocumentPicker error:', err);
    }
  };

  const isUrlValid = (url: string) => {
    const pattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    return pattern.test(url);
  };

  const validateStep = () => {
    const newErrors: { [key: string]: string | null } = {};
    if (currentStep === 1 && !rosterId) newErrors.roster = 'Selection required';
    
    if (currentStep === 2) {
        if (!title.trim()) newErrors.title = 'Title required';
        if (type === 'PDF' && !selectedFile) newErrors.file = 'Document required';
        if (type === 'LINK') {
            if (!url.trim()) newErrors.url = 'URL required';
            else if (!isUrlValid(url)) newErrors.url = 'Invalid URL';
        }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep()) {
        triggerHaptic();
        return;
    }
    triggerHaptic();
    setCurrentStep(currentStep + 1);
  };

  const isNextDisabled = () => {
    if (currentStep === 1) return !rosterId;
    if (currentStep === 2) {
        if (!title.trim()) return true;
        if (type === 'PDF') return !selectedFile;
        if (type === 'LINK') return !url.trim() || !isUrlValid(url);
    }
    return false;
  };

  const canSubmit = title.trim().length > 0 && rosterId && (
      (type === "PDF" && !!selectedFile) ||
      (type === "LINK" && url.trim().length > 0 && isUrlValid(url))
  );

  const handleFinalUpload = () => {
    if (!canSubmit) {
      triggerHaptic();
      validateStep();
      return;
    }

    triggerHaptic();
    onUpload({ title, rosterId, type, url, file: selectedFile });
    
    setSaved(true);
    HapticPatterns.success();
    Animated.sequence([
      Animated.timing(successScale, { toValue: 1.05, duration: 150, useNativeDriver: true }),
      Animated.timing(successScale, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start();
    
    setTimeout(() => onClose(), 1500);
  };

  const selectedRoster = useMemo(() => {
    return assignedSections.find((r, idx) => {
        const uniqueId = (r.rosterId || r.id || `${r.class_id || idx}-${r.section || idx}-${idx}`).toString();
        return uniqueId === rosterId;
    });
  }, [assignedSections, rosterId]);

  return (
    <ModalShell
      visible={visible}
      onClose={onClose}
      title="Upload Materials"
      subtitle={`Step ${currentStep} of 3`}
      headerGradient={AppTheme.colors.gradients.brand}
    >
      <View className="pb-8 pt-2">
        {error && (
          <View className="bg-rose-50 p-4 rounded-2xl border border-rose-100 mb-6">
            <Text className="text-rose-600 text-[10px] font-inter-bold uppercase tracking-[1px]">{error}</Text>
          </View>
        )}

        <View className="flex-row items-center justify-center mb-6 gap-1.5">
            {[1, 2, 3].map(s => (
                <View 
                  key={s} 
                  className={`h-[3px] rounded-full ${
                    currentStep === s 
                      ? 'w-6 bg-indigo-600' 
                      : s < currentStep 
                        ? 'w-2 bg-emerald-500' 
                        : 'w-2 bg-gray-200'
                  }`} 
                />
            ))}
        </View>

        <View className="min-h-[300px]">
          {currentStep === 1 && (
              <View>
                  <Reanimated.View entering={FadeInDown.delay(100).springify().damping(SPRING_CONFIG.damping)}>
                    <Text className="text-[10px] font-inter-bold text-gray-400 uppercase tracking-[0.5px] mb-3 px-1">Material Type</Text>
                    <View className="flex-row bg-white p-1.5 rounded-2xl mb-8 border border-gray-100 shadow-sm">
                        <TouchableOpacity 
                            onPress={() => { triggerHaptic(); setType('PDF'); }}
                            className={`flex-1 h-12 rounded-xl items-center flex-row justify-center transition-all ${type === 'PDF' ? 'bg-indigo-600 shadow-md shadow-indigo-100' : 'bg-transparent'}`}
                        >
                            <Icons.FileText size={16} color={type === 'PDF' ? 'white' : '#94a3b8'} />
                            <Text className={`text-[10px] font-inter-black uppercase tracking-[0.5px] ml-2.5 ${type === 'PDF' ? 'text-white' : 'text-gray-400'}`}>Course Document</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            onPress={() => { triggerHaptic(); setType('LINK'); }}
                            className={`flex-1 h-12 rounded-xl items-center flex-row justify-center transition-all ${type === 'LINK' ? 'bg-indigo-600 shadow-md shadow-indigo-100' : 'bg-transparent'}`}
                        >
                            <Icons.Globe size={16} color={type === 'LINK' ? 'white' : '#94a3b8'} />
                            <Text className={`text-[10px] font-inter-black uppercase tracking-[0.5px] ml-2.5 ${type === 'LINK' ? 'text-white' : 'text-gray-400'}`}>Web Resource</Text>
                        </TouchableOpacity>
                    </View>
                  </Reanimated.View>

                  <Reanimated.View entering={FadeInDown.delay(200).springify().damping(SPRING_CONFIG.damping)}>
                    <View className="flex-row justify-between items-center mb-3 px-1">
                        <Text className="text-[10px] font-inter-bold text-gray-400 uppercase tracking-[0.5px]">Select Class</Text>
                        {errors.roster && <Text className="text-red-400 text-[9px] font-inter-bold uppercase italic">* {errors.roster}</Text>}
                    </View>
                    <View className="gap-3 mb-6">
                        {assignedSections.map((r, idx) => {
                            const uniqueId = (r.rosterId || r.id || `${r.class_id || idx}-${r.section || idx}-${idx}`).toString();
                            const isSelected = rosterId === uniqueId;
                            return (
                                <TouchableOpacity 
                                    key={`upload-section-${uniqueId}-${idx}`}
                                    onPress={() => { triggerHaptic(); setRosterId(uniqueId); setErrors(p => ({ ...p, roster: null })); }}
                                    activeOpacity={0.75}
                                    className={`p-4 rounded-2xl border-2 flex-row items-center ${isSelected ? 'bg-white border-indigo-500 shadow-xl shadow-indigo-100/50' : 'bg-gray-50/30 border-transparent shadow-sm'}`}
                                >
                                    <View className={`w-10 h-10 rounded-xl items-center justify-center mr-3 ${isSelected ? 'bg-indigo-600' : 'bg-gray-100'}`}>
                                        <Icons.Classes size={18} color={isSelected ? 'white' : '#94a3b8'} />
                                    </View>
                                    <View className="flex-1">
                                        <Text className={`text-[12px] font-inter-black tracking-tight ${isSelected ? 'text-indigo-600' : 'text-gray-900'}`}>
                                            {r.subject || 'General Instruction'}
                                        </Text>
                                        <Text className="text-[10px] font-inter-bold text-gray-400 uppercase tracking-[0.5px]">
                                            {r.name || 'Class'} • Section {r.section || 'A'}
                                        </Text>
                                    </View>
                                    {isSelected && (
                                        <View className="bg-indigo-50 w-6 h-6 rounded-full items-center justify-center">
                                            <Icons.Check size={14} color="#4f46e5" />
                                        </View>
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                  </Reanimated.View>
              </View>
          )}

          {currentStep === 2 && (
              <View>
                  <Reanimated.View entering={FadeInDown.delay(100).springify().damping(SPRING_CONFIG.damping)}>
                    <FloatingInput
                      label="Material Title"
                      value={title}
                      onChangeText={setTitle}
                      icon={<Icons.FileText size={18} />}
                      autoFocus={true}
                      error={errors.title}
                    />
                  </Reanimated.View>

                  {type === 'LINK' ? (
                      <Reanimated.View entering={FadeInDown.delay(200).springify().damping(SPRING_CONFIG.damping)}>
                        <FloatingInput
                          label="Website Link"
                          value={url}
                          onChangeText={setUrl}
                          icon={<Icons.Globe size={18} />}
                          autoCapitalize="none"
                          keyboardType="url"
                          error={errors.url}
                          placeholder="https://example.com"
                        />
                      </Reanimated.View>
                  ) : (
                      <Reanimated.View entering={FadeInDown.delay(200).springify().damping(SPRING_CONFIG.damping)}>
                        <View className={`bg-white p-5 rounded-2xl border-2 ${errors.file ? 'border-red-400 shadow-sm' : 'border-gray-100 shadow-sm'} flex-row items-center justify-between mb-8`}>
                            <View className="flex-1 mr-3">
                                <Text className={`text-[8px] font-inter-bold ${errors.file ? 'text-red-400' : 'text-indigo-400'} uppercase tracking-[0.5px] mb-0.5`}>
                                    {selectedFile ? 'File Prepared' : 'Select Document'}
                                </Text>
                                <Text className="text-gray-900 font-inter-black text-[14px]" numberOfLines={1}>
                                    {selectedFile ? selectedFile.name : 'Choose academic resource'}
                                </Text>
                            </View>
                            <TouchableOpacity 
                                onPress={pickDocument}
                                className="bg-indigo-600 px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-100"
                            >
                                <Text className="text-[10px] font-inter-black text-white uppercase tracking-[0.5px]">{selectedFile ? 'Swap' : 'Browse'}</Text>
                            </TouchableOpacity>
                        </View>
                        {errors.file && <Text className="text-red-400 text-[11px] mt-[-24px] mb-6 ml-1 font-inter-medium italic">* {errors.file}</Text>}
                      </Reanimated.View>
                  )}
              </View>
          )}

          {currentStep === 3 && (
              <View>
                  <Text className="text-[10px] font-inter-bold text-gray-400 uppercase tracking-[0.5px] mb-3 px-1">Upload Summary</Text>
                  <View className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm mb-8">
                      <View className="flex-row items-center mb-4 pb-4 border-b border-gray-50">
                          <View className="w-10 h-10 bg-indigo-50 rounded-xl items-center justify-center mr-3 border border-indigo-100">
                              <Icons.FileText size={20} color="#4f46e5" />
                          </View>
                          <View className="flex-1">
                              <Text className="text-gray-900 font-inter-black text-[15px] tracking-tight" numberOfLines={1}>{title}</Text>
                              <Text className="text-[9px] font-inter-bold text-indigo-500 uppercase tracking-[0.5px]">Institutional Resource</Text>
                          </View>
                      </View>
                      
                      <View className="flex-row justify-between mb-3 pb-3 border-b border-gray-50">
                          <Text className="text-[9px] font-inter-bold text-gray-400 uppercase tracking-[0.5px]">Subject Context</Text>
                          <Text className="text-[11px] font-inter-black text-indigo-600">{selectedRoster?.subject || 'General Instruction'}</Text>
                      </View>
                      <View className="flex-row justify-between mb-3">
                          <Text className="text-[9px] font-inter-bold text-gray-400 uppercase tracking-[0.5px]">Target Class</Text>
                          <Text className="text-[11px] font-inter-black text-gray-900">{selectedRoster?.name || 'Academic Group'} - {selectedRoster?.section || 'A'}</Text>
                      </View>
                      <View className="flex-row justify-between">
                          <Text className="text-[9px] font-inter-bold text-gray-400 uppercase tracking-[0.5px]">Security</Text>
                          <Text className="text-[9px] font-inter-medium text-indigo-600 italic">End-to-End Encrypted</Text>
                      </View>
                  </View>
              </View>
          )}
        </View>

        <View className="mt-2 gap-3">
            {currentStep < 3 ? (
                <Pressable
                  onPress={handleNext}
                  style={({ pressed }) => ({
                    opacity: isNextDisabled() ? 0.7 : pressed ? 0.92 : 1,
                    transform: [{ scale: (pressed || !isNextDisabled()) ? 1.05 : 1 }],
                  })}
                  className="h-[56px] bg-indigo-600 rounded-2xl items-center justify-center shadow-xl shadow-indigo-100"
                >
                  <Text className="text-white text-[13px] font-inter-black tracking-[0.5px] uppercase">Continue</Text>
                </Pressable>
            ) : (
                <Animated.View style={{ transform: [{ scale: successScale }] }}>
                  <Pressable
                    onPress={handleFinalUpload}
                    disabled={isUploading || saved}
                    style={({ pressed }) => ({
                      opacity: (isUploading || saved) ? 0.8 : pressed ? 0.92 : 1,
                      transform: [{ scale: (pressed || (!isUploading && !saved)) ? 1.05 : 1 }],
                    })}
                    className={`h-[56px] rounded-2xl items-center justify-center flex-row ${
                      saved ? 'bg-emerald-500' : 'bg-indigo-600 shadow-xl shadow-indigo-100'
                    }`}
                  >
                    {isUploading ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <>
                        {!saved && <Icons.Send size={18} color="white" className="mr-2" />}
                        <Text className="text-white text-[13px] font-inter-black tracking-[0.5px] uppercase ml-2">
                          {saved ? 'Successfully Uploaded' : 'Upload Material'}
                        </Text>
                      </>
                    )}
                  </Pressable>
                </Animated.View>
            )}

            {currentStep > 1 && !isUploading && !saved && (
                <TouchableOpacity 
                  onPress={() => { triggerHaptic(); setCurrentStep(currentStep - 1); }}
                  className="py-2 items-center"
                >
                    <Text className="text-[10px] font-inter-bold text-gray-400 uppercase tracking-[0.5px]">Back to previous</Text>
                </TouchableOpacity>
            )}

            {currentStep === 1 && !saved && (
                 <TouchableOpacity 
                 onPress={onClose}
                 className="py-2 items-center"
               >
                   <Text className="text-[10px] font-inter-bold text-rose-400 uppercase tracking-[0.5px]">Discard Upload</Text>
               </TouchableOpacity>
            )}
        </View>
      </View>
    </ModalShell>
  );
};
