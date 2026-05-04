/**
 * StudentVideoScreen.jsx
 *
 * Video menu for Student role.
 * Also exposes a "Parent Mode" toggle so parents can monitor live classes.
 *
 * Tabs: Live Now | Library
 */

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  SafeAreaView, TextInput,
} from 'react-native';
import { C, LIVE_ROOMS, RECORDED } from '../constants';
import { Av, LiveRoomCard, RecordedCard, SectionHeader } from './SharedComponents';

export default function StudentVideoScreen({ navigation }) {
  const [tab, setTab]             = useState('live');
  const [parentMode, setParentMode] = useState(false);
  const [search, setSearch]       = useState('');

  const handleWatch = (room) => {
    navigation.navigate('VideoPlayer', { subject: room.subject, teacher: room.teacher });
  };

  const filteredRecorded = RECORDED.filter(v =>
    !search ||
    v.subject.toLowerCase().includes(search.toLowerCase()) ||
    v.title.toLowerCase().includes(search.toLowerCase())
  );

  // ── TAB: LIVE ────────────────────────────────────────────────────────────────
  const LiveTab = () => (
    <FlatList
      data={LIVE_ROOMS}
      keyExtractor={r => r.id}
      contentContainerStyle={styles.tabContent}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        <>
          {/* Parent mode banner */}
          {parentMode && (
            <View style={styles.parentBanner}>
              <Text style={{ fontSize: 24 }}>👁</Text>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.parentBannerTitle}>Parent Monitoring</Text>
                <Text style={styles.parentBannerBody}>
                  You can view your child's live classes in real-time.
                  All streams are private and encrypted.
                </Text>
              </View>
            </View>
          )}
          <SectionHeader
            title={`${LIVE_ROOMS.filter(r => r.status === 'live').length} Classes Live Now`}
          />
        </>
      }
      renderItem={({ item }) => (
        <LiveRoomCard
          room={item}
          onWatch={handleWatch}
          watchLabel={parentMode ? '👁 Monitor' : '▶ Join'}
        />
      )}
    />
  );

  // ── TAB: LIBRARY ─────────────────────────────────────────────────────────────
  const LibraryTab = () => (
    <FlatList
      data={filteredRecorded}
      keyExtractor={v => v.id}
      contentContainerStyle={styles.tabContent}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        <TextInput
          style={styles.searchBox}
          placeholder="🔍  Search by subject or topic…"
          placeholderTextColor="#94a3b8"
          value={search}
          onChangeText={setSearch}
        />
      }
      renderItem={({ item }) => (
        <RecordedCard
          video={item}
          onPlay={() => navigation.navigate('VideoPlayer', { subject: item.subject, teacher: item.teacher })}
          showDelete={false}
        />
      )}
    />
  );

  return (
    <SafeAreaView style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <Av initials="AM" size={44} bg="rgba(255,255,255,0.15)" />
        <View style={{ marginLeft: 12, flex: 1 }}>
          <Text style={styles.roleLabel}>STUDENT</Text>
          <Text style={styles.name}>Arjun Mehta</Text>
          <Text style={styles.subtitle}>Class 10-A · Roll 1001</Text>
        </View>
        {/* Parent mode toggle */}
        <TouchableOpacity
          style={[styles.parentToggle, parentMode && styles.parentToggleActive]}
          onPress={() => setParentMode(p => !p)}
          activeOpacity={0.8}
        >
          <Text style={styles.parentToggleText}>
            {parentMode ? '👤 Student' : '👨‍👩‍👦 Parent'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab bar */}
      <View style={styles.tabBar}>
        {[['live', '📡 Live Now'], ['library', '🎬 Library']].map(([id, label]) => (
          <TouchableOpacity
            key={id}
            style={[styles.tabItem, tab === id && styles.tabItemActive]}
            onPress={() => setTab(id)}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabLabel, tab === id && styles.tabLabelActive]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ flex: 1 }}>
        {tab === 'live'    && <LiveTab />}
        {tab === 'library' && <LibraryTab />}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    backgroundColor: C.navy,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  roleLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  name:      { color: '#fff', fontWeight: '800', fontSize: 17, marginTop: 1 },
  subtitle:  { color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 1 },
  parentToggle: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  parentToggleActive: { backgroundColor: C.amber },
  parentToggleText:   { color: '#fff', fontSize: 11, fontWeight: '700' },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: C.navy,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  tabItem:       { flex: 1, paddingVertical: 11, alignItems: 'center', borderBottomWidth: 2.5, borderBottomColor: 'transparent' },
  tabItemActive: { borderBottomColor: C.amber },
  tabLabel:      { color: 'rgba(255,255,255,0.35)', fontWeight: '700', fontSize: 12 },
  tabLabelActive:{ color: '#fff' },
  tabContent:    { padding: 16, paddingBottom: 32 },
  parentBanner: {
    backgroundColor: '#1e3a5f',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(29,78,216,0.3)',
  },
  parentBannerTitle: { color: '#fff', fontWeight: '800', fontSize: 14, marginBottom: 2 },
  parentBannerBody:  { color: 'rgba(255,255,255,0.5)', fontSize: 12, lineHeight: 17 },
  searchBox: {
    backgroundColor: C.white,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    color: C.navy,
    marginBottom: 14,
  },
});
