import * as React from 'react';
import { useState, useMemo, useRef, useCallback } from 'react';
import { View, Text, Pressable, FlatList, TextInput, Linking, Alert, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import { Icons } from '@components/common/Icons';
import { supabase } from '@lib/supabase';
import { AppTheme } from '@constants/Theme';
import { 
  AppCard, 
  SectionHeader, 
  AppRow, 
  StatusPill, 
  AppTypography, 
  AppButton, 
  PlatinumHeader, 
  SkeletonCard, 
  SkeletonRow 
} from '@components/common';
import { useMockAuth } from '@context/MockAuthContext';
import { triggerHaptic } from '@utils/haptics';

export interface Material {
  id: string;
  title: string;
  subject?: string;
  type: 'PDF' | 'LINK' | 'VIDEO';
  url?: string;
  created_at?: string;
  section?: string;
  classes?: { name: string };
}

interface TeacherMaterialsProps {
  materials: Material[];
  isLoading?: boolean;
  onDeleteMaterial: (id: string) => Promise<void>;
  onShowUploadModal: () => void;
  onBack: () => void;
}

export const TeacherMaterials = React.memo<TeacherMaterialsProps>(({
  materials = [],
  isLoading = false,
  onDeleteMaterial,
  onShowUploadModal,
  onBack
}) => {
  const { currentUser } = useMockAuth();
  const [search, setSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('ALL');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [optimisticDeletedIds, setOptimisticDeletedIds] = useState<string[]>([]);

  const allSubjects = useMemo(() => {
    return ['ALL', ...Array.from(new Set(materials.map(m => (m.subject || 'General').trim()))).sort()];
  }, [materials]);

  const filtered = useMemo(() => {
    return materials
      .filter(m => !optimisticDeletedIds.includes(m.id))
      .filter(m => {
        const q = search.toLowerCase();
        const matchesSearch = (m.title?.toLowerCase().includes(q) || m.subject?.toLowerCase().includes(q));
        const matchesSubject = selectedSubject === 'ALL' || (m.subject || 'General').trim() === selectedSubject;
        return matchesSearch && matchesSubject;
      });
  }, [materials, search, selectedSubject, optimisticDeletedIds]);

  const handleOpen = async (url?: string) => {
    if (!url) {
      Alert.alert('No Resource', 'This material has no URL or document attached.');
      return;
    }

    let finalUrl = url;
    if (url.startsWith('/storage/') || url.startsWith('storage/')) {
      const { data } = supabase.storage
        .from('materials')
        .getPublicUrl(url.replace(/^\/?(storage\/v1\/object\/public\/materials\/)/, ''));
      finalUrl = data.publicUrl;
    } else if (!url.startsWith('http')) {
      finalUrl = `https://${url}`;
    }

    try {
      const canOpen = await Linking.canOpenURL(finalUrl);
      if (!canOpen) {
        Alert.alert('Cannot Open', 'Your device does not have an app installed that can open this resource type.');
        return;
      }
      await Linking.openURL(finalUrl);
    } catch (err) {
      Alert.alert('Error', 'Could not open this resource. The link might be broken or expired.');
    }
  };

  const handleDeletePress = useCallback((id: string) => {
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
            setOptimisticDeletedIds(prev => [...prev, id]);
            try {
              await onDeleteMaterial(id);
            } catch (err) {
              setOptimisticDeletedIds(prev => prev.filter(oid => oid !== id));
              Alert.alert("Sync Error", "Failed to remove material from institution database.");
            } finally {
              setDeletingId(null);
            }
          }
        }
      ]
    );
  }, [onDeleteMaterial]);

  const renderMaterialItem = useCallback(({ item: mat, index: idx }: { item: Material, index: number }) => (
    <AppRow
      title={mat.title}
      titleProps={{ numberOfLines: 1, ellipsizeMode: 'tail' }}
      subtitle={`${mat.classes?.name || 'Class Level'} • Section ${mat.section || 'General'}`}
      avatarIcon={mat.type === 'PDF' ? <Icons.FileText size={15} color="#4f46e5" /> : <Icons.Globe size={15} color="#0ea5e9" />}
      avatarBg={mat.type === 'PDF' ? '#eef2ff' : '#f0f9ff'}
      meta={(() => {
        if (!mat.created_at) return 'Recently';
        const d = new Date(mat.created_at);
        return isNaN(d.getTime()) 
          ? 'Recently' 
          : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
      })()}
      showBorder={idx < filtered.length - 1}
      onPress={() => handleOpen(mat.url)}
      rightElement={
        <Pressable
          style={({ pressed }) => [{ opacity: pressed ? 0.92 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] }]}
          disabled={deletingId === mat.id}
          onPress={() => {
            triggerHaptic();
            handleDeletePress(mat.id);
          }}
          hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
          className={`px-4 py-2.5 rounded-xl border ${deletingId === mat.id ? 'bg-gray-50 border-gray-100' : 'bg-rose-50 border-rose-100'} active:bg-rose-100`}
        >
          {deletingId === mat.id ? (
            <ActivityIndicator size="small" color="#ef4444" />
          ) : (
            <Icons.Trash size={15} color="#ef4444" />
          )}
        </Pressable>
      }
    />
  ), [filtered.length, deletingId, handleOpen, handleDeletePress]);

  const ListHeader = useMemo(() => (
    <View>
      <View className="px-4 pt-6">
        <View className="mb-6 flex-row items-center justify-between">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-1 pb-2">
            {allSubjects.map((sub) => (
              <Pressable
                key={sub}
                style={({ pressed }) => [{ opacity: pressed ? 0.92 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] }]}
                onPress={() => {
                  triggerHaptic();
                  setSelectedSubject(sub);
                }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                className={`mr-3 px-6 py-2.5 rounded-2xl border ${selectedSubject === sub ? 'bg-indigo-600 border-indigo-700 shadow-md shadow-indigo-200' : 'bg-white border-gray-100'}`}
              >
                <Text className={`text-[10px] font-black uppercase tracking-[1px] font-inter-black ${selectedSubject === sub ? 'text-white' : 'text-gray-500'}`}>
                  {sub}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={onShowUploadModal}
            className="bg-indigo-600 w-10 h-10 rounded-xl shadow-lg shadow-indigo-100 items-center justify-center active:scale-95 ml-2"
          >
            <Icons.Plus size={16} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <View className="px-4">
        <SectionHeader
          title={selectedSubject === 'ALL' ? 'ALL MATERIALS' : selectedSubject}
          className="mb-4"
          rightElement={<StatusPill label={`${filtered.length} Items`} type="neutral" />}
        />
      </View>
    </View>
  ), [search, selectedSubject, allSubjects, filtered.length, onShowUploadModal]);

  return (
    <View className="flex-1 bg-[#f8faff]">
      <PlatinumSearchHeader
        title="My Lessons"
        subtitle={`${(currentUser as any)?.school_name || 'Academy'} Node`}
        onBack={onBack}
        searchValue={search}
        onSearchChange={setSearch}
        placeholder="Search Resources..."
      />

      {isLoading ? (
        <View className="px-4 pt-6">
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
        </View>
      ) : (
        <FlatList
          data={filtered}
          ListHeaderComponent={ListHeader}
          renderItem={renderMaterialItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="py-20 items-center px-4">
              <View className="w-16 h-16 bg-gray-50 rounded-[28px] items-center justify-center mb-4 border border-gray-100">
                <Icons.Inbox size={28} color="#94a3b8" />
              </View>
              <Text className="text-gray-900 font-black text-lg text-center font-inter-black">
                {search.length > 0 || selectedSubject !== 'ALL' ? 'No Results Found' : 'Library Empty'}
              </Text>
              <Text className="text-gray-400 text-[10px] uppercase tracking-[1px] text-center mt-2 font-inter-black">
                {search.length > 0 || selectedSubject !== 'ALL' 
                  ? `No materials match "${search || selectedSubject}"` 
                  : 'Upload your first resource to get started'}
              </Text>
              {(search.length > 0 || selectedSubject !== 'ALL') && (
                <Pressable
                  onPress={() => { setSearch(''); setSelectedSubject('ALL'); }}
                  className="mt-6 bg-indigo-50 px-6 py-3 rounded-2xl border border-indigo-100 active:scale-95"
                >
                  <Text className="text-indigo-600 text-[10px] font-inter-black uppercase tracking-[1px]">Clear Filters</Text>
                </Pressable>
              )}
            </View>
          }
        />
      )}
    </View>
  );
});
