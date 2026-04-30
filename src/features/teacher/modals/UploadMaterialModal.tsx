import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { Icons } from '../../../../components/Icons';
import { AppTheme, AppTypography, ModalShell, AppButton, AppRadius } from '../../../design-system';
import * as DocumentPicker from 'expo-document-picker';

interface UploadMaterialModalProps {
  visible: boolean;
  onClose: () => void;
  onUpload: () => void;
  uploadTitle: string;
  setUploadTitle: (text: string) => void;
  uploadRosterId: string | null;
  setUploadRosterId: (id: string) => void;
  assignedSections: any[];
  isUploading: boolean;
  uploadType: 'PDF' | 'LINK';
  setUploadType: (type: 'PDF' | 'LINK') => void;
  uploadUrl: string;
  setUploadUrl: (url: string) => void;
  selectedFile: any;
  setSelectedFile: (file: any) => void;
}

export const UploadMaterialModal: React.FC<UploadMaterialModalProps> = ({
  visible,
  onClose,
  onUpload,
  uploadTitle,
  setUploadTitle,
  uploadRosterId,
  setUploadRosterId,
  assignedSections,
  isUploading,
  uploadType,
  setUploadType,
  uploadUrl,
  setUploadUrl,
  selectedFile,
  setSelectedFile,
}) => {
  const [currentStep, setCurrentStep] = React.useState(1);

  // ARMOR: State hygiene to prevent data pollution between modes
  React.useEffect(() => {
    if (uploadType === 'PDF') setUploadUrl('');
    else setSelectedFile(null);
  }, [uploadType]);

  // RESET: Back to step 1 on modal visibility change
  React.useEffect(() => {
    if (visible) setCurrentStep(1);
  }, [visible]);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedFile(result.assets[0]);
        if (!uploadTitle) setUploadTitle(result.assets[0].name);
      }
    } catch (err) {
      console.error('DocumentPicker error:', err);
    }
  };

  const isUrlValid = (url: string) => {
    const pattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    return pattern.test(url);
  };

  const isNextDisabled = () => {
    if (currentStep === 1) return !uploadRosterId;
    if (currentStep === 2) {
        if (!uploadTitle.trim()) return true;
        if (uploadType === 'PDF') return !selectedFile;
        if (uploadType === 'LINK') return !uploadUrl.trim() || !isUrlValid(uploadUrl);
    }
    return false;
  };

  const selectedRoster = assignedSections.find(r => (r.id || r.rosterId) === uploadRosterId);

  return (
    <ModalShell
      visible={visible}
      onClose={onClose}
      title="Upload Materials"
      subtitle={currentStep === 1 ? "Step 1: Resource Context" : currentStep === 2 ? "Step 2: Resource Details" : "Step 3: Finalize Node"}
    >
      {/* Progress Indicator */}
      <View className="flex-row items-center justify-center mb-8 gap-2">
          {[1, 2, 3].map(s => (
              <View 
                key={s} 
                className={`h-1.5 rounded-full ${currentStep === s ? 'w-8 bg-indigo-600' : 'w-4 bg-gray-200'}`} 
              />
          ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="max-h-[500px]">
        {currentStep === 1 && (
            <View>
                <Text className="text-[9px] font-black text-indigo-400 uppercase tracking-[2px] mb-4 px-1 font-inter-black">Resource Strategy</Text>
                <View className="flex-row bg-gray-100/50 p-1.5 rounded-[24px] mb-10 border border-gray-100/80 shadow-inner">
                    <TouchableOpacity 
                        onPress={() => setUploadType('PDF')}
                        className={`flex-1 py-4 rounded-[20px] items-center flex-row justify-center ${uploadType === 'PDF' ? 'bg-white shadow-md border border-gray-100' : ''}`}
                    >
                        <Icons.Classes size={16} color={uploadType === 'PDF' ? '#4f46e5' : '#94a3b8'} />
                        <Text className={`text-[10px] font-black uppercase tracking-wider ml-2 font-inter-black ${uploadType === 'PDF' ? 'text-indigo-600' : 'text-gray-400'}`}>PDF DOC</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        onPress={() => setUploadType('LINK')}
                        className={`flex-1 py-4 rounded-[20px] items-center flex-row justify-center ${uploadType === 'LINK' ? 'bg-white shadow-md border border-gray-100' : ''}`}
                    >
                        <Icons.Globe size={16} color={uploadType === 'LINK' ? '#4f46e5' : '#94a3b8'} />
                        <Text className={`text-[10px] font-black uppercase tracking-wider ml-2 font-inter-black ${uploadType === 'LINK' ? 'text-indigo-600' : 'text-gray-400'}`}>WEB LINK</Text>
                    </TouchableOpacity>
                </View>

                <Text className="text-[9px] font-black text-indigo-400 uppercase tracking-[2px] mb-4 px-1 font-inter-black">Target Academic Section</Text>
                <View className="flex-row flex-wrap gap-3 mb-6">
                    {assignedSections.map(r => {
                        const uniqueId = r.id || r.rosterId;
                        const isSelected = uploadRosterId === uniqueId;
                        return (
                            <TouchableOpacity 
                                key={uniqueId}
                                onPress={() => setUploadRosterId(uniqueId)}
                                className={`px-5 py-4 rounded-2xl border ${isSelected ? 'bg-indigo-600 border-indigo-600 shadow-xl shadow-indigo-200' : 'bg-white border-gray-100 shadow-sm'}`}
                            >
                                <Text className={`text-[10px] font-black uppercase tracking-wider font-inter-black ${isSelected ? 'text-white' : 'text-gray-400'}`}>
                                    {r.displayName || `${r.classes?.name || 'Class'} - ${r.section || 'A'}`}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>
        )}

        {currentStep === 2 && (
            <View>
                <View className="mb-8">
                    <Text className="text-[9px] font-black text-indigo-400 uppercase tracking-[2px] mb-2.5 px-1 font-inter-black">Material Designation</Text>
                    <View className="bg-gray-50 border border-gray-100 rounded-[28px] px-6 py-5 shadow-inner">
                        <TextInput 
                            placeholder="e.g. Calculus Quarter 1 Notes" 
                            value={uploadTitle}
                            onChangeText={setUploadTitle}
                            className="text-gray-900 font-black text-[14px] font-inter-black p-0"
                            placeholderTextColor="#94a3b8"
                        />
                    </View>
                </View>

                {uploadType === 'LINK' ? (
                    <View className="mb-8">
                        <Text className="text-[9px] font-black text-indigo-400 uppercase tracking-[2px] mb-2.5 px-1 font-inter-black">Institutional URL</Text>
                        <View className="bg-gray-50 border border-gray-100 rounded-[28px] px-6 py-5 shadow-inner">
                            <TextInput 
                                placeholder="https://resource.edu/notes.pdf" 
                                value={uploadUrl}
                                onChangeText={setUploadUrl}
                                autoCapitalize="none"
                                keyboardType="url"
                                className="text-gray-900 font-black text-[14px] font-inter-black p-0"
                                placeholderTextColor="#94a3b8"
                            />
                        </View>
                        {uploadUrl.length > 0 && !isUrlValid(uploadUrl) && (
                            <Text className="text-[9px] font-black text-rose-500 uppercase tracking-widest mt-3 ml-2 italic">Malformed Transmission Link Detected</Text>
                        )}
                    </View>
                ) : (
                    <View className="bg-white p-6 rounded-[32px] border border-gray-50 shadow-xl shadow-indigo-100/30 flex-row items-center justify-between mb-8">
                        <View className="flex-1 mr-4">
                            <Text className="text-[9px] font-black text-indigo-400 uppercase tracking-[2px] mb-1.5 font-inter-black">
                                {selectedFile ? 'File Prepared' : 'Select Document'}
                            </Text>
                            <Text className="text-gray-900 font-black text-[14px] leading-tight font-inter-black" numberOfLines={1}>
                                {selectedFile ? selectedFile.name : 'Choose institutional PDF'}
                            </Text>
                        </View>
                        <TouchableOpacity 
                            onPress={pickDocument}
                            className="bg-indigo-600 px-6 py-3.5 rounded-xl active:scale-95 shadow-lg shadow-indigo-200"
                        >
                            <Text className="text-[10px] font-black text-white uppercase tracking-widest font-inter-black">{selectedFile ? 'Swap' : 'Browse'}</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        )}

        {currentStep === 3 && (
            <View>
                <Text className="text-[9px] font-black text-indigo-400 uppercase tracking-[2px] mb-4 px-1 font-inter-black">Resource Metadata Review</Text>
                <View className="bg-white p-6 rounded-[32px] border border-gray-50 shadow-2xl shadow-indigo-100/40 mb-10">
                    <View className="flex-row items-center mb-6">
                        <View className="w-14 h-14 bg-indigo-50 rounded-2xl items-center justify-center mr-4 border border-indigo-100/50">
                            <Icons.FileText size={24} color="#4f46e5" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-gray-900 font-black text-lg tracking-tight font-inter-black" numberOfLines={1}>{uploadTitle}</Text>
                            <Text className="text-[10px] font-black text-indigo-500 uppercase tracking-widest font-inter-black">{uploadType} NODE</Text>
                        </View>
                    </View>
                    
                    <View className="pt-6 border-t border-gray-50">
                        <View className="flex-row justify-between mb-3">
                            <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest font-inter-black">Target Class</Text>
                            <Text className="text-[10px] font-black text-gray-900 font-inter-black">{selectedRoster?.displayName || 'Unknown'}</Text>
                        </View>
                        <View className="flex-row justify-between">
                            <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest font-inter-black">Transmission</Text>
                            <Text className="text-[10px] font-black text-indigo-600 italic font-inter-black" numberOfLines={1}>Encrypted institutional tunnel</Text>
                        </View>
                    </View>
                </View>
            </View>
        )}
      </ScrollView>

      <View className="mt-4 gap-4">
          {currentStep < 3 ? (
              <AppButton 
                label="Continue Discovery"
                onPress={() => setCurrentStep(currentStep + 1)}
                disabled={isNextDisabled()}
                className="py-5"
              />
          ) : (
              <AppButton 
                label={isUploading ? "Synchronizing..." : "Establish Material Link"}
                onPress={onUpload}
                disabled={isUploading}
                loading={isUploading}
                className="py-5"
              />
          )}

          {currentStep > 1 && !isUploading && (
              <TouchableOpacity 
                onPress={() => setCurrentStep(currentStep - 1)}
                className="py-4 items-center"
              >
                  <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest font-inter-black">Return to previous node</Text>
              </TouchableOpacity>
          )}

          {currentStep === 1 && (
               <TouchableOpacity 
               onPress={onClose}
               className="py-4 items-center"
             >
                 <Text className="text-[10px] font-black text-rose-400 uppercase tracking-widest font-inter-black">Abort Transmission</Text>
             </TouchableOpacity>
          )}
      </View>
    </ModalShell>
  );
};
