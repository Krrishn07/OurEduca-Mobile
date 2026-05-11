import * as React from 'react';
import { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import { FlatList, Text, TouchableOpacity, View, RefreshControl, Platform, TextInput, UIManager, Pressable, Animated } from 'react-native';
import { Icons } from '@components/common/Icons';
import { triggerHaptic, ImpactFeedbackStyle } from '@utils/haptics';
import { AppCard, AppTheme, AppRow, StatusPill, PlatinumHeader, SkeletonCard, SkeletonRow } from '@components/common';
import { useMockAuth } from '@context/MockAuthContext';

interface AnimatedCountProps {
  value: number;
  isEmpty: boolean;
}

const AnimatedCount = React.memo(({ value, isEmpty }: AnimatedCountProps) => {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(scale, {
          toValue: 0.8,
          duration: 120,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.5,
          duration: 120,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          friction: 4,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 120,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [value]);

  return (
    <Animated.Text
      style={{
        transform: [{ scale }],
        opacity,
      }}
      className={`ml-sm text-[13px] font-inter-medium ${
        isEmpty ? "text-gray-400" : "text-indigo-600"
      }`}
    >
      {value}
    </Animated.Text>
  );
});

interface ClassListItemProps {
  item: any;
  onPress: (item: any) => void;
  count: number;
}

const ClassListItem = React.memo(({ item, onPress, count }: ClassListItemProps) => {
  const [pressed, setPressed] = useState(false);
  const isEmpty = count === 0;

  return (
    <Pressable
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      onPress={() => onPress(item)}
      style={({ pressed: isPressed }) => ({
        transform: [{ scale: isPressed ? 0.985 : 1 }],
      })}
      className={`w-full bg-white rounded-[24px] p-5 flex-row items-center mb-4 border border-gray-100/50 shadow-xl shadow-indigo-100/20
        ${pressed ? "bg-indigo-50/30" : "bg-white"}
      `}
    >
      {/* LEFT: ICON */}
      <View className={`w-14 h-14 rounded-2xl items-center justify-center mr-4 ${pressed ? 'bg-indigo-200' : 'bg-indigo-50'}`}>
        <Icons.Classes size={24} color="#4f46e5" />
      </View>

      {/* CENTER: DETAILS */}
      <View className="flex-1 justify-center">
        <View className="flex-row items-center mb-1">
          <Text className="text-[16px] font-inter-black text-gray-900 tracking-tight" numberOfLines={1}>
            {item.subject}
          </Text>
          <View className="ml-2 px-2 py-0.5 bg-indigo-50 rounded-full border border-indigo-100/30">
            <Text className="text-[9px] font-inter-black text-indigo-600 uppercase">Sec {item.section || 'A'}</Text>
          </View>
        </View>
        
        <Text className="text-[12px] font-inter-bold text-gray-500 mb-2">
          {item.name || 'Standard Class'} • {item.room_no ? `Room ${item.room_no}` : 'Room 302'}
        </Text>

        <View className="flex-row items-center">
          <View className={`flex-row items-center px-2.5 py-1 rounded-full ${isEmpty ? 'bg-gray-100' : 'bg-emerald-50'}`}>
            <View className={`w-1.5 h-1.5 rounded-full mr-1.5 ${isEmpty ? 'bg-gray-400' : 'bg-emerald-500'}`} />
            <Text className={`text-[9px] font-inter-black uppercase tracking-[0.5px] ${isEmpty ? 'text-gray-400' : 'text-emerald-600'}`}>
              {isEmpty ? 'Standby' : 'Active'}
            </Text>
          </View>
        </View>
      </View>

      {/* RIGHT: STATS */}
      <View className="items-end justify-center ml-2">
        <View className={`flex-row items-center px-3 py-1.5 rounded-xl ${isEmpty ? 'bg-gray-50' : 'bg-indigo-50/50'}`}>
          <Icons.Users size={14} color={isEmpty ? "#9ca3af" : "#6366f1"} />
          <AnimatedCount value={count} isEmpty={isEmpty} />
        </View>
        <Icons.ChevronRight size={18} color="#cbd5e1" className="mt-2" />
      </View>
    </Pressable>
  );
});

interface TeacherClassesProps {
  assignedSections: any[];
  onNavigateToClass: (cls: any) => void;
  dbRoster?: any[];
  onShowUploadModal: () => void;
  onRefresh?: () => void;
  refreshing?: boolean;
  isLoading?: boolean;
}

export const TeacherClasses = React.memo<TeacherClassesProps>(({
  assignedSections = [],
  onNavigateToClass,
  dbRoster = [],
  onShowUploadModal,
  onRefresh,
  refreshing = false,
  isLoading = false
}) => {
  const { currentUser } = useMockAuth();
  const [classSearch, setClassSearch] = useState('');
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const searchRef = useRef<TextInput>(null);

  const handleRefresh = () => {
    onRefresh?.();
  };

  const toggleSearch = () => {
    setIsSearchVisible(!isSearchVisible);
    if (!isSearchVisible) {
      setTimeout(() => searchRef.current?.focus(), 100);
    } else {
      setClassSearch('');
    }
  };

  const filteredClasses = useMemo(() => {
    return (assignedSections || []).filter(c =>
      c.subject?.toLowerCase().includes(classSearch.toLowerCase()) ||
      c.name?.toLowerCase().includes(classSearch.toLowerCase())
    );
  }, [assignedSections, classSearch]);

  const classStudentCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    (dbRoster || []).forEach(r => {
      const key = `${r.class_id}::${r.section || 'A'}`;
      counts[key] = (counts[key] || 0) + 1;
    });
    return counts;
  }, [dbRoster]);

  const renderClassItem = useCallback(({ item: r }: { item: any }) => {
    const countKey = `${r.class_id}::${r.section || 'A'}`;
    return (
      <ClassListItem 
        item={r} 
        onPress={(item: any) => {
          triggerHaptic();
          onNavigateToClass(item);
        }}
        count={classStudentCounts[countKey] || 0}
      />
    );
  }, [classStudentCounts, onNavigateToClass]);

  return (
    <View className="flex-1 bg-[#f8faff]">
      <PlatinumHeader
        title="My Classes"
        subtitle={`${(currentUser as any)?.school_name || 'Academy'} Node`}
        rightAction={
          <>
            <TouchableOpacity 
              activeOpacity={0.7} 
              onPress={() => {
                triggerHaptic();
                toggleSearch();
              }}
              className={`w-9 h-9 rounded-full items-center justify-center border mr-3 ${isSearchVisible ? 'bg-indigo-50 border-indigo-100' : 'bg-gray-50 border-gray-100'}`}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Icons.Search size={18} color={isSearchVisible ? "#4f46e5" : "#6b7280"} />
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.7} onPress={() => { triggerHaptic(); onShowUploadModal(); }} className="bg-indigo-600 px-4 py-2 rounded-xl shadow-lg shadow-indigo-200">
              <Text className="text-white text-[11px] font-inter-black uppercase">Add</Text>
            </TouchableOpacity>
          </>
        }
      />

      {isSearchVisible && (
        <View className="px-4 pt-4">
          <View className="bg-white p-4 rounded-[20px] border border-gray-100 shadow-sm flex-row items-center">
            <Icons.Search size={16} color="#94a3b8" />
            <TextInput
              ref={searchRef}
              className="flex-1 ml-3 text-[13px] font-inter-medium text-gray-900"
              placeholder="Filter by subject or class name..."
              value={classSearch}
              onChangeText={setClassSearch}
              placeholderTextColor="#94a3b8"
              autoCapitalize="none"
            />
            {classSearch.length > 0 && (
              <TouchableOpacity 
                onPress={() => {
                   setClassSearch('');
                }} 
                className="p-1"
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Icons.Close size={14} color="#94a3b8" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {isLoading ? (
        <View className="px-4 pt-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </View>
      ) : (
        <FlatList
          data={filteredClasses}
          keyExtractor={(item, idx) => `${item.id?.toString() || 'cls'}-${idx}`}
          contentContainerStyle={{ paddingTop: 32, paddingBottom: 120, paddingHorizontal: 20, flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          renderItem={renderClassItem}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
          initialNumToRender={10}
          maxToRenderPerBatch={8}
          windowSize={5}
          removeClippedSubviews={Platform.OS === 'android'}
          ListEmptyComponent={
            <View className="flex-1 justify-center items-center px-8 mt-20">
              <View className="w-24 h-24 bg-slate-100 rounded-3xl items-center justify-center mb-8 border border-slate-200/50">
                <Icons.Classes size={24} color="#94a3b8" />
              </View>
              <Text className="text-slate-900 font-inter-black text-xl text-center">Institutional Roster Clear</Text>
            </View>
          }
        />
      )}
    </View>
  );
});
