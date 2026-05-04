/**
 * TeacherVideoScreen.jsx
 *
 * Video menu for Subject Teacher role.
 * Tabs: Go Live  |  Library  |  Monitor
 *
 * Real streaming wiring:
 *   import Daily from '@daily-co/react-native-daily-js';
 *   const call = Daily.createCallObject();
 *   await call.join({ url: roomUrl, token: teacherToken });
 *
 * Real video upload:
 *   import * as ImagePicker from 'expo-image-picker';      // pick recorded file
 *   import * as FileSystem   from 'expo-file-system';      // read bytes
 *   // Then upload to Supabase Storage or Mux via Edge Function
 *
 * Navigation: expects React Navigation Stack, with 'VideoPlayer' registered.
 */

import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, SafeAreaView, Modal, FlatList, Alert,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { C, LIVE_ROOMS, RECORDED, SUBJECTS_TEACHER } from '../constants';
import { Av, LiveBadge, LiveRoomCard, RecordedCard, SectionHeader } from './SharedComponents';

const STREAM_SOURCES = [
  { id: 'camera', icon: '📹', label: 'Device Camera',     desc: 'Stream from your phone or tablet camera' },
  { id: 'cctv',   icon: '📷', label: 'Connect CCTV Feed', desc: 'Link classroom CCTV via RTSP / IP address' },
  { id: 'screen', icon: '🖥️', label: 'Screen Share',       desc: 'Share your screen or presentation slides' },
];

function fmtTime(s) {
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

export default function TeacherVideoScreen({ navigation }) {
  const [tab, setTab]               = useState('stream');
  const [streaming, setStreaming]   = useState(false);
  const [streamRoom, setStreamRoom] = useState(null);
  const [source, setSource]         = useState('camera');
  const [rtspUrl, setRtspUrl]       = useState('');
  const [elapsed, setElapsed]       = useState(0);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadTitle, setUploadTitle]   = useState('');
  const [uploadDesc, setUploadDesc]     = useState('');
  const [viewers]                   = useState(14); // in production: realtime from Supabase

  // Live timer
  useEffect(() => {
    if (!streaming) { setElapsed(0); return; }
    const t = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(t);
  }, [streaming]);

  const handleGoLive = (room) => {
    setStreamRoom(room);
    setStreaming(true);
    // TODO: await supabase.functions.invoke('create-live-room', { body: { subject: room.subject, class_name: room.class } })
    // TODO: const call = Daily.createCallObject(); await call.join({ url: result.data.room.url, token: result.data.teacherToken });
  };

  const handleEndStream = () => {
    setStreaming(false);
    setShowUpload(true);
    // TODO: await call.stopRecording(); await call.leave(); call.destroy();
    // Daily auto-saves cloud recording — fetch URL from webhook / Supabase
  };

  const handlePublish = () => {
    if (!uploadTitle.trim()) { Alert.alert('Title required', 'Please add a title for this recording.'); return; }
    setShowUpload(false);
    setUploadTitle('');
    setUploadDesc('');
    Alert.alert('Published ✓', 'Recording saved to the video library.');
    // TODO: await supabase.from('class_videos').insert({ title: uploadTitle, description: uploadDesc, ... })
  };

  const handleWatch = (room) => {
    navigation.navigate('VideoPlayer', { subject: room.subject, teacher: room.teacher });
  };

  // ── TAB: STREAM ─────────────────────────────────────────────────────────────
  const StreamTab = () => (
    <ScrollView contentContainerStyle={styles.tabContent} showsVerticalScrollIndicator={false}>
      {!streaming ? (
        <>
          {/* Source selector */}
          <View style={styles.card}>
            <Text style={styles.cardHeading}>Start Live Class</Text>
            <Text style={styles.cardSubHeading}>Choose your stream source</Text>

            {STREAM_SOURCES.map(src => (
              <TouchableOpacity
                key={src.id}
                style={[styles.sourceRow, source === src.id && styles.sourceRowActive]}
                onPress={() => setSource(src.id)}
                activeOpacity={0.75}
              >
                <Text style={{ fontSize: 24 }}>{src.icon}</Text>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[styles.sourceLabel, source === src.id && { color: C.blue }]}>{src.label}</Text>
                  <Text style={styles.sourceDesc}>{src.desc}</Text>
                </View>
                {source === src.id && <Text style={{ color: C.blue, fontWeight: '800', fontSize: 16 }}>✓</Text>}
              </TouchableOpacity>
            ))}

            {/* RTSP input for CCTV mode */}
            {source === 'cctv' && (
              <View style={styles.rtspBox}>
                <Text style={styles.rtspLabel}>RTSP / IP Camera URL</Text>
                <TextInput
                  style={styles.rtspInput}
                  placeholder="rtsp://192.168.1.101:554/stream"
                  placeholderTextColor="#94a3b8"
                  value={rtspUrl}
                  onChangeText={setRtspUrl}
                  autoCapitalize="none"
                  keyboardType="url"
                />
                <Text style={styles.rtspHint}>Enter your classroom CCTV IP stream address</Text>
              </View>
            )}
          </View>

          {/* My classes */}
          <View style={styles.card}>
            <Text style={styles.cardHeading}>My Classes</Text>
            {SUBJECTS_TEACHER.map((cls, i) => (
              <View key={i} style={[styles.classRow, i < SUBJECTS_TEACHER.length - 1 && styles.classRowBorder]}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.classSubject}>{cls.subject} — {cls.class}</Text>
                  <Text style={styles.classNext}>{cls.nextAt}</Text>
                </View>
                <TouchableOpacity style={styles.goLiveBtn} onPress={() => handleGoLive(cls)} activeOpacity={0.8}>
                  <Text style={styles.goLiveBtnText}>Go Live 📡</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </>
      ) : (
        /* ── LIVE CONTROL PANEL ── */
        <View style={styles.livePanel}>
          <View style={styles.livePanelHeader}>
            <View>
              <LiveBadge />
              <Text style={styles.livePanelSubject}>{streamRoom?.subject}</Text>
              <Text style={styles.livePanelClass}>Class {streamRoom?.class}</Text>
            </View>
            <View style={styles.timerBox}>
              <Text style={styles.timerText}>{fmtTime(elapsed)}</Text>
              <Text style={styles.timerLabel}>RECORDING</Text>
            </View>
          </View>

          {/* Fake viewfinder — replace with Daily.co <DailyMediaView> */}
          <View style={styles.viewfinder}>
            <Text style={{ fontSize: 36 }}>
              {source === 'camera' ? '📹' : source === 'cctv' ? '📷' : '🖥️'}
            </Text>
            <Text style={styles.viewfinderLabel}>
              {source === 'camera' ? 'Camera Active' : source === 'cctv' ? 'CCTV Feed Connected' : 'Screen Sharing'}
            </Text>
            {/* Viewer count overlay */}
            <View style={styles.viewerBadge}>
              <Text style={styles.viewerBadgeText}>● {viewers} viewers</Text>
            </View>
            {/* Logo watermark */}
            <View style={styles.liveLogo}>
              <Text style={{ fontSize: 12 }}>🏫</Text>
              <Text style={styles.liveLogoText}>SPRINGFIELD ACADEMY</Text>
            </View>
          </View>

          {/* Controls */}
          <View style={styles.liveControls}>
            {[['🔇', 'Mute'], ['📸', 'Snap'], ['💬', 'Chat']].map(([ic, lb]) => (
              <TouchableOpacity key={lb} style={styles.controlBtn} activeOpacity={0.7}>
                <Text style={{ fontSize: 18 }}>{ic}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.endBtn} onPress={handleEndStream} activeOpacity={0.8}>
              <Text style={styles.endBtnText}>■ End & Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
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
          onPlay={() => Alert.alert('Play', item.title)}
          onDelete={() => Alert.alert('Delete', `Delete "${item.title}"?`)}
          showDelete
        />
      )}
      showsVerticalScrollIndicator={false}
    />
  );

  // ── TAB: MONITOR ─────────────────────────────────────────────────────────────
  const MonitorTab = () => (
    <FlatList
      data={LIVE_ROOMS}
      keyExtractor={r => r.id}
      contentContainerStyle={styles.tabContent}
      ListHeaderComponent={<SectionHeader title="Live Classes Now" />}
      renderItem={({ item }) => (
        <LiveRoomCard room={item} onWatch={handleWatch} />
      )}
      showsVerticalScrollIndicator={false}
    />
  );

  return (
    <SafeAreaView style={styles.root}>
      {/* ── HEADER ── */}
      <View style={styles.header}>
        <Av initials="KR" size={44} bg="rgba(255,255,255,0.15)" />
        <View style={{ marginLeft: 12, flex: 1 }}>
          <Text style={styles.roleLabel}>SUBJECT TEACHER</Text>
          <Text style={styles.name}>Mrs. Kavitha R.</Text>
          <Text style={styles.subtitle}>Mathematics · 10-A, 9-B</Text>
        </View>
      </View>

      {/* ── TAB BAR ── */}
      <View style={styles.tabBar}>
        {[['stream', '📡 Go Live'], ['library', '🎬 Library'], ['monitor', '👁 Monitor']].map(([id, label]) => (
          <TouchableOpacity key={id} style={[styles.tabItem, tab === id && styles.tabItemActive]} onPress={() => setTab(id)} activeOpacity={0.8}>
            <Text style={[styles.tabLabel, tab === id && styles.tabLabelActive]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── CONTENT ── */}
      <View style={{ flex: 1 }}>
        {tab === 'stream'  && <StreamTab />}
        {tab === 'library' && <LibraryTab />}
        {tab === 'monitor' && <MonitorTab />}
      </View>

      {/* ── UPLOAD MODAL ── */}
      <Modal visible={showUpload} transparent animationType="slide" onRequestClose={() => setShowUpload(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalSheet}>
              <View style={styles.modalHandle} />
              <Text style={styles.modalTitle}>📤 Save Recording</Text>
              <Text style={styles.modalSubtitle}>Add details before publishing to the library</Text>

              <Text style={styles.fieldLabel}>VIDEO TITLE</Text>
              <TextInput
                style={styles.fieldInput}
                placeholder="e.g. Quadratic Equations – Part 3"
                placeholderTextColor="#94a3b8"
                value={uploadTitle}
                onChangeText={setUploadTitle}
              />

              <Text style={styles.fieldLabel}>DESCRIPTION</Text>
              <TextInput
                style={[styles.fieldInput, { height: 72, textAlignVertical: 'top' }]}
                placeholder="Brief summary of what was covered..."
                placeholderTextColor="#94a3b8"
                value={uploadDesc}
                onChangeText={setUploadDesc}
                multiline
              />

              <View style={styles.modalBtnRow}>
                <TouchableOpacity style={styles.modalBtnCancel} onPress={() => setShowUpload(false)} activeOpacity={0.8}>
                  <Text style={{ color: C.slate, fontWeight: '700' }}>Discard</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalBtnPrimary} onPress={handlePublish} activeOpacity={0.8}>
                  <Text style={styles.modalBtnPrimaryText}>✓ Publish to Library</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

// ─── STYLES ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f8fafc' },

  // Header
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

  // Tab bar
  tabBar: {
    flexDirection: 'row',
    backgroundColor: C.navy,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  tabItem: {
    flex: 1,
    paddingVertical: 11,
    alignItems: 'center',
    borderBottomWidth: 2.5,
    borderBottomColor: 'transparent',
  },
  tabItemActive: { borderBottomColor: C.amber },
  tabLabel:      { color: 'rgba(255,255,255,0.35)', fontWeight: '700', fontSize: 12 },
  tabLabelActive:{ color: '#fff' },

  // Tab content
  tabContent: { padding: 16, paddingBottom: 32 },

  // Cards
  card: {
    backgroundColor: C.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeading:    { fontWeight: '800', fontSize: 15, color: C.navy, marginBottom: 2 },
  cardSubHeading: { color: C.slate, fontSize: 12, marginBottom: 14 },

  // Stream source
  sourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
    marginBottom: 10,
  },
  sourceRowActive: { borderColor: C.blue, backgroundColor: '#eff6ff' },
  sourceLabel:     { fontWeight: '700', fontSize: 13, color: C.navy },
  sourceDesc:      { fontSize: 11, color: C.slate, marginTop: 1 },

  // RTSP box
  rtspBox:   { backgroundColor: '#f0f9ff', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#bae6fd', marginTop: 4 },
  rtspLabel: { fontSize: 12, color: '#0369a1', fontWeight: '700', marginBottom: 6 },
  rtspInput: {
    backgroundColor: C.white, borderRadius: 8, borderWidth: 1.5, borderColor: '#bae6fd',
    paddingHorizontal: 12, paddingVertical: 9, fontSize: 12, color: C.navy,
  },
  rtspHint:  { fontSize: 10, color: C.slate, marginTop: 5 },

  // Class list
  classRow:       { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  classRowBorder: { borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  classSubject:   { fontWeight: '700', fontSize: 13, color: C.navy },
  classNext:      { fontSize: 11, color: C.slate, marginTop: 2 },
  goLiveBtn:      { backgroundColor: C.navy, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 9 },
  goLiveBtnText:  { color: '#fff', fontWeight: '700', fontSize: 12 },

  // Live panel
  livePanel: {
    backgroundColor: C.navy,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  livePanelHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
  livePanelSubject: { color: '#fff', fontWeight: '800', fontSize: 18, marginTop: 8 },
  livePanelClass:   { color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 2 },
  timerBox:   { backgroundColor: 'rgba(239,68,68,0.15)', borderRadius: 10, padding: 10, borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)', alignItems: 'center' },
  timerText:  { color: '#f87171', fontWeight: '800', fontSize: 20, fontVariant: ['tabular-nums'] },
  timerLabel: { color: 'rgba(255,255,255,0.3)', fontSize: 9, marginTop: 2 },

  viewfinder: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 12,
    aspectRatio: 16 / 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    position: 'relative',
    overflow: 'hidden',
  },
  viewfinderLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 6 },
  viewerBadge: {
    position: 'absolute', top: 10, left: 10,
    backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  viewerBadgeText: { color: '#4ade80', fontSize: 10, fontWeight: '700' },
  liveLogo: {
    position: 'absolute', bottom: 10, right: 10,
    backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 4,
    flexDirection: 'row', alignItems: 'center', gap: 4,
  },
  liveLogoText: { color: 'rgba(255,255,255,0.7)', fontSize: 9, fontWeight: '700' },

  liveControls: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  controlBtn:   { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 10, width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  endBtn:       { flex: 1, backgroundColor: '#dc2626', borderRadius: 10, paddingVertical: 11, alignItems: 'center' },
  endBtnText:   { color: '#fff', fontWeight: '700', fontSize: 13 },

  // Upload modal
  modalOverlay:      { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  modalSheet:        { backgroundColor: C.white, borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 22, paddingBottom: 36 },
  modalHandle:       { width: 40, height: 4, borderRadius: 2, backgroundColor: '#e2e8f0', alignSelf: 'center', marginBottom: 14 },
  modalTitle:        { fontWeight: '800', fontSize: 18, color: C.navy, marginBottom: 2 },
  modalSubtitle:     { color: C.slate, fontSize: 12, marginBottom: 18 },
  fieldLabel:        { fontSize: 12, fontWeight: '700', color: C.slate, letterSpacing: 0.4, marginBottom: 6 },
  fieldInput:        { borderWidth: 1.5, borderColor: '#e2e8f0', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 11, fontSize: 14, color: C.navy, marginBottom: 14 },
  modalBtnRow:       { flexDirection: 'row', gap: 10, marginTop: 4 },
  modalBtnCancel:    { flex: 1, paddingVertical: 12, borderRadius: 10, borderWidth: 1.5, borderColor: '#e2e8f0', alignItems: 'center' },
  modalBtnPrimary:   { flex: 2, paddingVertical: 12, borderRadius: 10, backgroundColor: C.navy, alignItems: 'center' },
  modalBtnPrimaryText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
