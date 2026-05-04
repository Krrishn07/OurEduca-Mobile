import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Linking, Alert, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icons } from '../../../../components/Icons';
import { AppCard, AppTheme, SectionHeader, AppRow, StatusPill, AppTypography, AppButton, PlatinumHeader } from '../../../design-system';
import { useMockAuth } from '../../../../contexts/MockAuthContext';

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
  const { currentUser } = useMockAuth();
  const [search, setSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('ALL');
  const [deletingId, setDeletingId] = useState<string | null>(null); // PLATINUM FIX: Track loading state for deletions
  const insets = useSafeAreaInsets();

  // PLATINUM FIX: Memoize expensive array operations to prevent keyboard lag
  const allSubjects = useMemo(() => {
    return ['ALL', ...Array.from(new Set(materials.map(m => m.subject || 'General'))).sort()];
  }, [materials]);

  const filtered = useMemo(() => {
    return materials.filter(m => {
      const matchesSearch = (m.title?.toLowerCase().includes(search.toLowerCase()) || m.subject?.toLowerCase().includes(search.toLowerCase()));
      const matchesSubject = selectedSubject === 'ALL' || m.subject === selectedSubject;
      return matchesSearch && matchesSubject;
    });
  }, [materials, search, selectedSubject]);

  const handleOpen = (url: string) => {
    if (!url) return;
    const finalUrl = url.startsWith('http') ? url : `https://${url}`;
    Linking.openURL(finalUrl).catch(() => Alert.alert("Error", "Could not open material URL."));
  };

  const handleDeletePress = (id: string) => {
    Alert.alert(
      "Remove Resource",
      "Are you sure you want to delete this material from the repository?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setDeletingId(id);
            try {
              await onDeleteMaterial(id);
            } finally {
              setDeletingId(null);
            }
          }
        }
      ]
    );
  };

  return (
    <View className="flex-1 bg-gray-50/50">
      {/* PLATINUM FIX: Removed redundant rightAction icons from header */}
      <PlatinumHeader
        title="My Lessons"
        subtitle={`${currentUser?.school_name || 'Academy'} Node`}
        onBack={onBack}
      />

      <View className="px-4 pt-6">
        <View className="bg-white p-4 rounded-[28px] border border-gray-100 shadow-sm flex-row items-center mb-6">
          <Icons.Search size={18} color="#94a3b8" />
          <TextInput
            className="flex-1 ml-4 text-[13px] font-black text-gray-900 font-inter-black"
            placeholder="Search Resources..."
            value={search}
            onChangeText={setSearch}
            placeholderTextColor="#94a3b8"
          />
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={onShowUploadModal}
            className="bg-indigo-600 w-10 h-10 rounded-xl shadow-lg shadow-indigo-100 items-center justify-center active:scale-95"
          >
            <Icons.Plus size={16} color="white" />
          </TouchableOpacity>
        </View>

        {/* Subject Filter Tabs */}
        <View className="mb-6">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-1 pb-2">
            {allSubjects.map((sub) => (
              <TouchableOpacity
                key={sub}
                activeOpacity={0.7}
                onPress={() => setSelectedSubject(sub)}
                className={`mr-3 px-6 py-2.5 rounded-2xl border ${selectedSubject === sub ? 'bg-indigo-600 border-indigo-700 shadow-md shadow-indigo-200' : 'bg-white border-gray-100'}`}
              >
                <Text className={`text-[10px] font-black uppercase tracking-widest font-inter-black ${selectedSubject === sub ? 'text-white' : 'text-gray-500'}`}>
                  {sub}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-4">
        <SectionHeader
          title={selectedSubject === 'ALL' ? 'ALL MATERIALS' : selectedSubject}
          className="mb-4"
          rightElement={<StatusPill label={`${filtered.length} Items`} type="neutral" />}
        />

        <AppCard className="p-0 overflow-hidden border border-white shadow-xl shadow-indigo-100/30 mb-10">
          {filtered.length > 0 ? filtered.map((mat, idx) => (
            <AppRow
              key={mat.id}
              title={mat.title}
              titleProps={{ numberOfLines: 1, ellipsizeMode: 'tail' }} // PLATINUM FIX: Protect layout from long titles
              subtitle={`${mat.classes?.name || 'Class Level'} • Section ${mat.section || 'General'}`}
              avatarIcon={mat.type === 'PDF' ? <Icons.FileText size={15} color="#4f46e5" /> : <Icons.Globe size={15} color="#0ea5e9" />}
              avatarBg={mat.type === 'PDF' ? '#eef2ff' : '#f0f9ff'}
              meta={(() => {
                if (!mat.created_at) return 'Recently';
                const d = new Date(mat.created_at);
                return isNaN(d.getTime()) ? 'Recently' : d.toLocaleDateString();
              })()}
              showBorder={idx < filtered.length - 1}
              onPress={() => handleOpen(mat.url)}
              rightElement={
                <TouchableOpacity
                  activeOpacity={0.7}
                  disabled={deletingId === mat.id}
                  onPress={() => handleDeletePress(mat.id)}
                  className={`px-4 py-2.5 rounded-xl border ${deletingId === mat.id ? 'bg-gray-50 border-gray-100' : 'bg-rose-50 border-rose-100'} active:bg-rose-100`}
                >
                  {deletingId === mat.id ? (
                    <ActivityIndicator size="small" color="#ef4444" />
                  ) : (
                    <Icons.Trash size={15} color="#ef4444" />
                  )}
                </TouchableOpacity>
              }
            />
          )) : (
            <View className="items-center py-20">
              <View className="w-16 h-16 bg-gray-50 rounded-2xl items-center justify-center mb-6 border border-gray-100">
                <Icons.FileText size={32} color="#cbd5e1" />
              </View>
              <Text className="text-gray-900 font-black text-lg font-inter-black">Library Empty</Text>
              <Text className="text-gray-400 text-[10px] font-black uppercase tracking-[3px] mt-2 text-center px-10">
                You haven't uploaded any resources to this subject yet.
              </Text>
            </View>
          )}
        </AppCard>
        <View className="h-20" />
      </ScrollView>
    </View>
  );
};