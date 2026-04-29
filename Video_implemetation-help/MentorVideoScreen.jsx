/**
 * MentorVideoScreen.jsx
 *
 * Video menu for Mentor role.
 * Tabs: Monitor (live classes, read-only) | Library (recorded classes)
 *
 * Mentor joins as a silent viewer — no mic, no camera.
 * In production, generate a viewer token with is_owner:false,
 * start_video_off:true, start_audio_off:true from your Edge Function.
 */

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, SafeAreaView,
} from 'react-native';
import { C, LIVE_ROOMS, RECORDED } from '../constants';
import { Av, LiveRoomCard, RecordedCard, SectionHeader } from './SharedComponents';

export default function MentorVideoScreen({ navigation }) {
  const [tab, setTab] = useState('monitor');

  const handleWatch = (room) => {
    navigation.navigate('VideoPlayer', { subject: room.subject, teacher: room.teacher });
  };

  // ── TAB: MONITOR ─────────────────────────────────────────────────────────────
  const MonitorTab = () => (
    <FlatList
      data={LIVE_ROOMS}
      keyExtractor={r => r.id}
      contentContainerStyle={styles.tabContent}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        <>
          <SectionHeader title="Live Classes Now" />
          {/* Mentor-specific notice */}
          <View style={styles.noticeBox}>
            <Text style={styles.noticeTitle}>Mentor Note</Text>
            <Text style={styles.noticeBody}>
              You can silently monitor any live class without the teacher or students being notified.
              Your presence is read-only — no mic or camera.
            </Text>
          </View>
        </>
      }
      renderItem={({ item }) => (
        <LiveRoomCard room={item} onWatch={handleWatch} watchLabel="👁 Monitor" />
      )}
    />
  );

  // ── TAB: LIBRARY ─────────────────────────────────────────────────────────────
  const LibraryTab = () => (
    <FlatList
      data={RECORDED}
      keyExtractor={v => v.id}
      contentContainerStyle={styles.tabContent}
      ListHeaderComponent={<SectionHeader title="Recorded Classes" />}
      renderItem={({ item }) => (
        <RecordedCard
          video={item}
          onPlay={() => navigation.navigate('VideoPlayer', { subject: item.subject, teacher: item.teacher })}
          showDelete={false}
        />
      )}
      showsVerticalScrollIndicator={false}
    />
  );

  return (
    <SafeAreaView style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <Av initials="DS" size={44} bg="rgba(255,255,255,0.15)" />
        <View style={{ marginLeft: 12, flex: 1 }}>
          <Text style={styles.roleLabel}>MENTOR</Text>
          <Text style={styles.name}>Mr. Dev Sharma</Text>
          <Text style={styles.subtitle}>Mentor · Class 10-A</Text>
        </View>
      </View>

      {/* Tab bar */}
      <View style={styles.tabBar}>
        {[['monitor', '👁 Monitor'], ['library', '🎬 Library']].map(([id, label]) => (
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
        {tab === 'monitor' && <MonitorTab />}
        {tab === 'library' && <LibraryTab />}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    backgroundColor: '#0f4c75',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  roleLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  name:      { color: '#fff', fontWeight: '800', fontSize: 17, marginTop: 1 },
  subtitle:  { color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 1 },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#0f4c75',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  tabItem:       { flex: 1, paddingVertical: 11, alignItems: 'center', borderBottomWidth: 2.5, borderBottomColor: 'transparent' },
  tabItemActive: { borderBottomColor: C.amber },
  tabLabel:      { color: 'rgba(255,255,255,0.35)', fontWeight: '700', fontSize: 12 },
  tabLabelActive:{ color: '#fff' },
  tabContent:    { padding: 16, paddingBottom: 32 },
  noticeBox: {
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#bbf7d0',
    marginBottom: 14,
  },
  noticeTitle: { fontSize: 12, fontWeight: '700', color: '#166534', marginBottom: 3 },
  noticeBody:  { fontSize: 12, color: '#15803d', lineHeight: 18 },
});
