import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Linking, Alert } from 'react-native';
import { Icons } from '../../../../components/Icons';
import { AppCard, AppTheme, SectionHeader, AppRow, StatusPill, AppTypography, AppButton } from '../../../design-system';

interface TeacherMaterialsProps {
  materials: any[];
  onDeleteMaterial: (id: string) => Promise<void>;
  onShowUploadModal: () => void;
  onBack: () => void;
}

export const TeacherMaterials: React.FC<TeacherMaterialsProps> = ({
  materials = [],
  onDeleteMaterial,
  onShowUploadModal,
  onBack
}) => {
  const [search, setSearch] = useState('');

  const filtered = materials.filter(m => 
    m.title?.toLowerCase().includes(search.toLowerCase()) ||
    m.subject?.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpen = (url: string) => {
    if (!url) return;
    const finalUrl = url.startsWith('http') ? url : `https://${url}`;
    Linking.openURL(finalUrl).catch(() => Alert.alert("Error", "Could not open material URL."));
  };

  return (
    <View className="flex-1">
      {/* Header with Back Button */}
      <View className="bg-white border-b border-gray-100 pt-12 pb-6 px-6 shadow-sm">
        <View className="flex-row items-center">
            <TouchableOpacity 
                onPress={onBack}
                className="bg-gray-50 p-2.5 rounded-xl border border-gray-100 mr-4 active:scale-90"
            >
                <Icons.ChevronLeft size={18} color="#4f46e5" />
            </TouchableOpacity>
            <View>
                <Text className="text-[17px] font-black text-gray-900 tracking-tighter font-inter-black">Institutional Repository</Text>
                <Text className="text-[9px] font-black text-indigo-400 uppercase tracking-[2px] mt-0.5 font-inter-black">Academic Node Overview</Text>
            </View>
        </View>
      </View>

      <View className="flex-1 px-4 pt-6">
      <View className="bg-white p-4 rounded-[28px] border border-gray-100 shadow-sm flex-row items-center mb-6">
        <Icons.Search size={18} color="#94a3b8" />
        <TextInput 
          className="flex-1 ml-4 text-[13px] font-black text-gray-900 font-inter-black"
          placeholder="Search Academic Resources..."
          value={search}
          onChangeText={setSearch}
          placeholderTextColor="#94a3b8"
        />
        <TouchableOpacity 
          onPress={onShowUploadModal}
          className="bg-indigo-600 w-10 h-10 rounded-xl shadow-lg shadow-indigo-100 items-center justify-center active:scale-95"
        >
          <Icons.Plus size={16} color="white" />
        </TouchableOpacity>
      </View>

      <SectionHeader 
        title="INSTITUTIONAL REPOSITORY" 
        subtitle={`${filtered.length} Objects Synced`}
        className="mb-4 px-2"
      />

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        <AppCard className="p-0 overflow-hidden border border-white shadow-xl shadow-indigo-100/30 mb-10">
          {filtered.length > 0 ? filtered.map((mat, idx) => (
            <AppRow
              key={mat.id}
              title={mat.title}
              subtitle={`${mat.type} • ${mat.subject || 'General'}`}
              avatarIcon={mat.type === 'PDF' ? <Icons.FileText size={15} color="#4f46e5" /> : <Icons.Globe size={15} color="#0ea5e9" />}
              avatarBg={mat.type === 'PDF' ? '#eef2ff' : '#f0f9ff'}
              meta={new Date(mat.created_at).toLocaleDateString()}
              showBorder={idx < filtered.length - 1}
              onPress={() => handleOpen(mat.url)}
              rightElement={
                <TouchableOpacity
                  onPress={() => onDeleteMaterial(mat.id)}
                  className="bg-rose-50 border border-rose-100 px-3 py-1.5 rounded-xl active:bg-rose-100"
                >
                  <Text className="text-[9px] font-black text-rose-500 uppercase tracking-widest font-inter-black">Delete</Text>
                </TouchableOpacity>
              }
            />
          )) : (
            <View className="items-center py-20">
              <View className="w-16 h-16 bg-gray-50 rounded-2xl items-center justify-center mb-6 border border-gray-100">
                <Icons.FileText size={32} color="#cbd5e1" />
              </View>
              <Text className="text-gray-900 font-black text-lg font-inter-black">No Materials Found</Text>
              <Text className="text-gray-400 text-[10px] font-black uppercase tracking-[3px] mt-2 text-center px-10">
                The academic node is currently clear.
              </Text>
            </View>
          )}
        </AppCard>
        <View className="h-20" />
      </ScrollView>
    </View>
  );
};
