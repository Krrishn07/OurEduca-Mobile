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

  return (
    <ModalShell
      visible={visible}
      onClose={onClose}
      title="Upload Materials"
      subtitle="Institutional Resource Node"
    >
      {/* Type Selection - Platinum Pill */}
      <View className="flex-row bg-gray-100/50 p-1 rounded-2xl mb-8 border border-gray-100 shadow-inner">
          <TouchableOpacity 
              onPress={() => setUploadType('PDF')}
              className={`flex-1 py-3 rounded-xl items-center flex-row justify-center ${uploadType === 'PDF' ? 'bg-white shadow-sm border border-gray-100' : ''}`}
          >
              <Icons.Classes size={14} color={uploadType === 'PDF' ? '#4f46e5' : '#94a3b8'} />
              <Text className={`text-[10px] font-black uppercase tracking-wider ml-2 font-inter-black ${uploadType === 'PDF' ? 'text-indigo-600' : 'text-gray-400'}`}>PDF Document</Text>
          </TouchableOpacity>
          <TouchableOpacity 
              onPress={() => setUploadType('LINK')}
              className={`flex-1 py-3 rounded-xl items-center flex-row justify-center ${uploadType === 'LINK' ? 'bg-white shadow-sm border border-gray-100' : ''}`}
          >
              <Icons.Globe size={14} color={uploadType === 'LINK' ? '#4f46e5' : '#94a3b8'} />
              <Text className={`text-[10px] font-black uppercase tracking-wider ml-2 font-inter-black ${uploadType === 'LINK' ? 'text-indigo-600' : 'text-gray-400'}`}>Web Link</Text>
          </TouchableOpacity>
      </View>

      <View className="mb-6">
        <Text className="text-[9px] font-black text-indigo-400 uppercase tracking-[2px] mb-2 px-1 font-inter-black">Material Designation</Text>
        <View className="bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 shadow-inner">
          <TextInput 
            placeholder="e.g. Calculus Quarter 1 Notes" 
            value={uploadTitle}
            onChangeText={setUploadTitle}
            className="text-gray-900 font-black text-[13px] font-inter-black p-0"
            placeholderTextColor="#94a3b8"
          />
        </View>
      </View>

      {uploadType === 'LINK' ? (
        <View className="mb-8">
          <Text className="text-[9px] font-black text-indigo-400 uppercase tracking-[2px] mb-2 px-1 font-inter-black">Institutional URL</Text>
          <View className="bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 shadow-inner">
            <TextInput 
              placeholder="https://institutional-resource.edu/..." 
              value={uploadUrl}
              onChangeText={setUploadUrl}
              autoCapitalize="none"
              keyboardType="url"
              className="text-gray-900 font-black text-[13px] font-inter-black p-0"
              placeholderTextColor="#94a3b8"
            />
          </View>
        </View>
      ) : (
        <View className="bg-white p-5 rounded-2xl border border-white shadow-xl shadow-indigo-100/30 flex-row items-center justify-between mb-8">
          <View className="flex-1 mr-4">
              <Text className="text-[9px] font-black text-indigo-400 uppercase tracking-[2px] mb-1.5 font-inter-black">
                  {selectedFile ? 'File Prepared' : 'Select Document'}
              </Text>
              <Text className="text-gray-900 font-black text-[13px] leading-tight font-inter-black" numberOfLines={1}>
                  {selectedFile ? selectedFile.name : 'Choose institutional PDF'}
              </Text>
          </View>
          <TouchableOpacity 
              onPress={pickDocument}
              className="bg-indigo-50 px-5 py-3 rounded-xl border border-indigo-100 active:scale-95 shadow-sm"
          >
              <Text className="text-[10px] font-black text-indigo-600 uppercase tracking-widest font-inter-black">{selectedFile ? 'Change' : 'Browse'}</Text>
          </TouchableOpacity>
        </View>
      )}

      <View className="mb-10">
          <Text className="text-[9px] font-black text-indigo-400 uppercase tracking-[2px] mb-4 px-1 font-inter-black">Target Academic Sections</Text>
          <View className="flex-row flex-wrap gap-2.5">
               {assignedSections.map(r => {
                   const uniqueId = r.id || r.rosterId;
                   const isSelected = uploadRosterId === uniqueId;
                   return (
                       <TouchableOpacity 
                           key={uniqueId}
                           onPress={() => setUploadRosterId(uniqueId)}
                           className={`px-5 py-3.5 rounded-2xl border ${isSelected ? 'bg-indigo-600 border-indigo-600 shadow-xl shadow-indigo-200' : 'bg-white border-white shadow-sm'}`}
                       >
                           <Text className={`text-[10px] font-black uppercase tracking-wider font-inter-black ${isSelected ? 'text-white' : 'text-gray-400'}`}>
                               {r.displayName || `${r.classes?.name || 'Class'} - ${r.section || 'A'}`}
                           </Text>
                       </TouchableOpacity>
                   );
               })}
          </View>
      </View>

      <TouchableOpacity 
        onPress={onUpload}
        disabled={isUploading}
        activeOpacity={0.9}
        className="bg-indigo-600 py-5 rounded-2xl shadow-xl shadow-indigo-200 border border-indigo-500 items-center justify-center mb-4"
      >
        <Text className="text-white font-black uppercase tracking-[3px] text-[11px] font-inter-black">
          {isUploading ? 'Synchronizing Node...' : 'Establish Material Link'}
        </Text>
      </TouchableOpacity>
    </ModalShell>
  );
};
