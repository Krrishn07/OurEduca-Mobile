import * as React from 'react';
import { useState, useMemo, useCallback } from 'react';
import { View, Text, Pressable, FlatList, Linking, Alert, TouchableOpacity, ScrollView } from 'react-native';
import { Icons } from '@components/common/Icons';
import { supabase } from '@lib/supabase';
import { AppTheme } from '@constants/Theme';
import { 
  AppCard, 
  SectionHeader, 
  AppRow, 
  StatusPill, 
  PlatinumSearchHeader, 
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
  file_url?: string;
  created_at?: string;
  section?: string;
  teacher_name?: string;
}

interface StudentMaterialsProps {
  materials: Material[];
  isLoading?: boolean;
  onBack: () => void;
  initialSubject?: string;
}

export const StudentMaterials = React.memo<StudentMaterialsProps>(({
  materials = [],
  isLoading = false,
  onBack,
  initialSubject = 'ALL'
}) => {
  const { currentUser } = useMockAuth();
  const [search, setSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState(initialSubject);

  React.useEffect(() => {
    if (initialSubject) {
      setSelectedSubject(initialSubject);
    }
  }, [initialSubject]);

  const allSubjects = useMemo(() => {
    return ['ALL', ...Array.from(new Set(materials.map(m => (m.subject || 'General').trim()))).sort()];
  }, [materials]);

  const filtered = useMemo(() => {
    return materials
      .filter(m => {
        const q = search.toLowerCase();
        const matchesSearch = (m.title?.toLowerCase().includes(q) || m.subject?.toLowerCase().includes(q));
        const matchesSubject = selectedSubject === 'ALL' || (m.subject || 'General').trim() === selectedSubject;
        return matchesSearch && matchesSubject;
      });
  }, [materials, search, selectedSubject]);

  const handleOpen = async (url?: string) => {
    if (!url) {
      Alert.alert('No Resource', 'This material has no link or document attached.');
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

  const renderMaterialItem = useCallback(({ item: mat, index: idx }: { item: Material, index: number }) => {
    const isPDF = mat.type === 'PDF' || (mat.file_url && mat.file_url.toLowerCase().endsWith('.pdf'));
    const isVideo = mat.type === 'VIDEO' || (mat.file_url && (mat.file_url.includes('youtube') || mat.file_url.includes('vimeo')));

    return (
      <AppRow
        title={mat.title}
        titleProps={{ numberOfLines: 1, ellipsizeMode: 'tail' }}
        subtitle={`${mat.subject || 'Academic Resource'} • By ${mat.teacher_name || 'Faculty'}`}
        avatarIcon={isPDF ? <Icons.FileText size={15} color="#4f46e5" /> : isVideo ? <Icons.Video size={15} color="#0ea5e9" /> : <Icons.Globe size={15} color="#0ea5e9" />}
        avatarBg={isPDF ? '#eef2ff' : '#f0f9ff'}
        meta={(() => {
          if (!mat.created_at) return 'Recently';
          const d = new Date(mat.created_at);
          return isNaN(d.getTime()) 
            ? 'Recently' 
            : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
        })()}
        showBorder={idx < filtered.length - 1}
        onPress={() => {
            triggerHaptic();
            handleOpen(mat.url || mat.file_url);
        }}
        rightElement={
           <View className={`px-3 py-1 rounded-lg ${isPDF ? 'bg-indigo-50 border border-indigo-100' : 'bg-sky-50 border border-sky-100'}`}>
             <Text className={`text-[9px] font-inter-black uppercase tracking-widest ${isPDF ? 'text-indigo-600' : 'text-sky-600'}`}>
                {isPDF ? 'PDF' : isVideo ? 'VIDEO' : 'LINK'}
             </Text>
           </View>
        }
      />
    );
  }, [filtered.length, handleOpen]);

  const ListHeader = useMemo(() => (
    <View>
      <View className="px-4 pt-6">
        <View className="mb-6">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pb-2">
            {allSubjects.map((sub) => (
              <Pressable
                key={sub}
                style={({ pressed }) => [{ opacity: pressed ? 0.92 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] }]}
                onPress={() => {
                  triggerHaptic();
                  setSelectedSubject(sub);
                }}
                className={`mr-3 px-6 py-2.5 rounded-2xl border ${selectedSubject === sub ? 'bg-indigo-600 border-indigo-700 shadow-md shadow-indigo-200' : 'bg-white border-gray-100'}`}
              >
                <Text className={`text-[10px] font-black uppercase tracking-[1px] font-inter-black ${selectedSubject === sub ? 'text-white' : 'text-gray-500'}`}>
                  {sub}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </View>

      <View className="px-4">
        <SectionHeader
          title={selectedSubject === 'ALL' ? 'STUDY REPOSITORY' : `${selectedSubject} VAULT`}
          className="mb-4"
          rightElement={<StatusPill label={`${filtered.length} Resources`} type="neutral" />}
        />
      </View>
    </View>
  ), [selectedSubject, allSubjects, filtered.length]);

  return (
    <View className="flex-1 bg-[#f8faff]">
      <PlatinumSearchHeader
        title="Study Materials"
        subtitle="Institutional Academic Repository"
        onBack={onBack}
        searchValue={search}
        onSearchChange={setSearch}
        placeholder="Filter by title or subject..."
      />

      {isLoading ? (
        <View className="px-4 pt-6">
          <SkeletonRow />
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
                {search.length > 0 || selectedSubject !== 'ALL' ? 'No Materials Found' : 'Repository Clear'}
              </Text>
              <Text className="text-gray-400 text-[10px] uppercase tracking-[1px] text-center mt-2 font-inter-black">
                {search.length > 0 || selectedSubject !== 'ALL' 
                  ? `Try adjusting your search for "${search || selectedSubject}"` 
                  : 'Your teachers haven\'t shared any materials yet'}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
});
