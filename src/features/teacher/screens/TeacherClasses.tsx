import * as React from 'react';
import { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import { FlatList, Text, TouchableOpacity, View, RefreshControl, Platform, TextInput, UIManager, Pressable, Animated } from 'react-native';
import { Icons } from '../../../../components/Icons';
import { triggerHaptic, ImpactFeedbackStyle } from '../../../utils/haptics';
import { AppCard, AppTheme, AppRow, StatusPill, PlatinumHeader, SkeletonCard, SkeletonRow } from '../../../design-system';
import { useMockAuth } from '../../../../contexts/MockAuthContext';

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
      className={`ml-1 text-[12px] font-inter-bold ${
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
      className={`w-full rounded-2xl px-4 py-4 flex-row items-center justify-between mb-3 shadow-sm
        ${pressed ? "bg-indigo-50/50 opacity-90 scale-[0.98]" : "bg-white opacity-100 scale-100"}
      `}
      style={{
        shadowColor: "#4f46e5",
        shadowOpacity: pressed ? 0.05 : 0.08,
        shadowRadius: pressed ? 4 : 8,
        elevation: pressed ? 1 : 2,
      }}
    >
      {/* LEFT SECTION */}
      <View className="flex-row items-center flex-1">
        {/* Icon */}
        <View className={`w-14 h-14 rounded-xl items-center justify-center mr-4 ${pressed ? 'bg-indigo-200' : 'bg-indigo-50'}`}>
          <Icons.Classes size={24} color="#4f46e5" />
        </View>

        {/* Text Block */}
        <View className="justify-center flex-1">
          <Text className="text-[18px] font-inter-black text-gray-800" numberOfLines={1}>
            {item.subject}
          </Text>

          <View className="flex-row items-center mt-1">
            <Text className={`text-[10px] font-inter-bold uppercase tracking-[1px] ${isEmpty ? 'text-gray-400' : 'text-indigo-500'}`}>
              {isEmpty ? 'IDLE' : 'ONGOING'}
            </Text>
          </View>
        </View>
      </View>

      {/* RIGHT SECTION */}
      <View className="flex-row items-center">
        {/* Action Block */}
        <View className="items-center justify-center mr-3">
          {/* Student Count Pill */}
          <View className={`flex-row items-center px-3 py-1 rounded-full ${isEmpty ? 'bg-gray-100' : 'bg-indigo-50'}`}>
            <Icons.Users size={14} color={isEmpty ? "#9ca3af" : "#6366f1"} />
            <AnimatedCount value={count} isEmpty={isEmpty} />
          </View>

          {/* Manage Label */}
          <Text className={`text-[10px] font-inter-semibold tracking-[0.5px] mt-1 uppercase ${isEmpty ? 'text-gray-400' : 'text-gray-600'}`}>
            {isEmpty ? "NO STUDENTS" : "MANAGE"}
          </Text>
        </View>

        {/* Chevron */}
        <Icons.ChevronRight size={18} color="#9ca3af" />
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
          <View className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm flex-row items-center">
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
          contentContainerStyle={{ paddingTop: 24, paddingBottom: 100, paddingHorizontal: 16, flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          renderItem={renderClassItem}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
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
