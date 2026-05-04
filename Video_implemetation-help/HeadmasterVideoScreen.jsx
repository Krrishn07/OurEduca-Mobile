/**
 * HeadmasterVideoScreen.jsx
 *
 * Video menu for Headmaster role.
 * Tabs: Meetings (staff calls) | Live Monitor (all institution classes)
 *
 * Staff meeting flow:
 *   1. Headmaster taps "+ New Meeting"
 *   2. Selects staff, enters title → "Start Meeting"
 *   3. Enters MeetingRoomScreen (full-screen with logo watermark on every tile)
 *
 * In production wire-up:
 *   const { data } = await supabase.functions.invoke('create-staff-meeting', {
 *     body: { title: meetTitle, participants: selectedIds }
 *   });
 *   // data returns { roomUrl, hostToken }
 *   const call = Daily.createCallObject();
 *   await call.join({ url: data.roomUrl, token: data.hostToken });
 */

import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, FlatList,
  TouchableOpacity, SafeAreaView, Modal, TextInput,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { C, LIVE_ROOMS, STAFF } from '../constants';
import { Av, OnlineDot, LiveRoomCard, SectionHeader } from './SharedComponents';

function fmtTime(s) {
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

// ─── MEETING ROOM ─────────────────────────────────────────────────────────────
// Full-screen component shown during an active staff meeting.
function MeetingRoom({ meetTitle, participants, onEnd }) {
  const [elapsed, setElapsed]   = useState(0);
  const [muted, setMuted]       = useState(false);
  const [camOff, setCamOff]     = useState(false);

  useEffect(() => {
    const t = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <View style={mr.root}>
      {/* Meeting top bar */}
      <SafeAreaView>
        <View style={mr.topBar}>
          <View style={mr.topBarLeft}>
            <Text style={{ fontSize: 20 }}>🏫</Text>
            <View style={{ marginLeft: 8 }}>
              <Text style={mr.schoolName}>SPRINGFIELD ACADEMY</Text>
              <Text style={mr.meetingLabel}>Staff Meeting · {meetTitle}</Text>
            </View>
          </View>
          <View style={mr.timerBox}>
            <Text style={mr.timerText}>{fmtTime(elapsed)}</Text>
          </View>
        </View>
      </SafeAreaView>

      {/* Video grid */}
      <ScrollView contentContainerStyle={mr.gridArea}>
        {/* Headmaster tile – large */}
        <View style={mr.selfTile}>
          <View style={mr.selfTileInner}>
            {camOff
              ? <Av initials="HM" size={60} bg="rgba(255,255,255,0.1)" />
              : <Text style={{ fontSize: 38 }}>📹</Text>
            }
            <Text style={mr.selfTileLabel}>
              Headmaster (You){muted ? '  🔇' : ''}
            </Text>
          </View>
          {/* Logo watermark */}
          <View style={mr.logoWatermark}>
            <Text style={{ fontSize: 12 }}>🏫</Text>
            <Text style={mr.logoWatermarkText}>SPRINGFIELD</Text>
          </View>
        </View>

        {/* Participant tiles – 2-column grid */}
        <View style={mr.participantGrid}>
          {participants.map(p => (
            <View key={p.id} style={mr.participantTile}>
              <Av initials={p.avatar} size={40} bg="rgba(255,255,255,0.1)" />
              <Text style={mr.participantName} numberOfLines={1}>
                {p.name.split(' ')[1]}
              </Text>
              {/* Mini logo per tile */}
              <View style={mr.miniLogo}>
                <Text style={{ fontSize: 9 }}>🏫</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Controls */}
      <SafeAreaView style={mr.controlBar}>
        <View style={mr.controlRow}>
          <View style={mr.controlBtns}>
            <TouchableOpacity
              style={[mr.controlBtn, !muted && mr.controlBtnOff]}
              onPress={() => setMuted(m => !m)}
            >
              <Text style={{ fontSize: 20 }}>{muted ? '🔇' : '🎤'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[mr.controlBtn, !camOff && mr.controlBtnOff]}
              onPress={() => setCamOff(c => !c)}
            >
              <Text style={{ fontSize: 20 }}>{camOff ? '📵' : '📹'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={mr.controlBtn}>
              <Text style={{ fontSize: 20 }}>💬</Text>
            </TouchableOpacity>
            <TouchableOpacity style={mr.controlBtn}>
              <Text style={{ fontSize: 20 }}>📋</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={mr.endBtn} onPress={onEnd} activeOpacity={0.8}>
            <Text style={mr.endBtnText}>✕ End</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

// ─── MAIN SCREEN ──────────────────────────────────────────────────────────────
export default function HeadmasterVideoScreen({ navigation }) {
  const [tab, setTab]           = useState('meetings');
  const [showNew, setShowNew]   = useState(false);
  const [meetTitle, setTitle]   = useState('');
  const [selected, setSelected] = useState([]);
  const [inMeeting, setInMeeting] = useState(false);

  const toggle = (id) =>
    setSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  const startMeeting = () => {
    setShowNew(false);
    setInMeeting(true);
    // TODO: call Supabase Edge Function here
  };

  const participants = STAFF.filter(s => selected.includes(s.id));

  if (inMeeting) {
    return (
      <MeetingRoom
        meetTitle={meetTitle}
        participants={participants}
        onEnd={() => { setInMeeting(false); setSelected([]); setTitle(''); }}
      />
    );
  }

  const handleWatch = (room) => {
    navigation.navigate('VideoPlayer', { subject: room.subject, teacher: room.teacher });
  };

  // ── TAB: MEETINGS ────────────────────────────────────────────────────────────
  const MeetingsTab = () => (
    <ScrollView contentContainerStyle={styles.tabContent} showsVerticalScrollIndicator={false}>
      {/* Staff online list */}
      <View style={styles.card}>
        <Text style={styles.cardHeading}>Staff Online Now</Text>
        {STAFF.map((s, i) => (
          <View key={s.id} style={[styles.staffRow, i < STAFF.length - 1 && styles.staffRowBorder]}>
            <View style={{ position: 'relative' }}>
              <Av initials={s.avatar} size={36} />
              <OnlineDot online={s.online} />
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.staffName}>{s.name}</Text>
              <Text style={styles.staffRole}>{s.role}</Text>
            </View>
            <TouchableOpacity
              style={[styles.callBtn, !s.online && styles.callBtnDisabled]}
              disabled={!s.online}
            >
              <Text style={[styles.callBtnText, !s.online && { color: C.slate }]}>
                {s.online ? '📞 Call' : 'Offline'}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Recent meetings */}
      <View style={styles.card}>
        <Text style={styles.cardHeading}>Recent Meetings</Text>
        {[
          { title: 'Monthly Review',       date: 'Apr 18', p: 4, dur: '42 min' },
          { title: 'Exam Planning',         date: 'Apr 12', p: 6, dur: '1h 05m' },
          { title: '1-on-1: Mrs. Kavitha', date: 'Apr 08', p: 1, dur: '18 min' },
        ].map((m, i) => (
          <View key={m.title} style={[styles.recentRow, i < 2 && styles.staffRowBorder]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.staffName}>{m.title}</Text>
              <Text style={styles.staffRole}>{m.date} · {m.p + 1} participants · {m.dur}</Text>
            </View>
            <TouchableOpacity style={styles.viewBtn}>
              <Text style={styles.viewBtnText}>▶ View</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  // ── TAB: MONITOR ─────────────────────────────────────────────────────────────
  const MonitorTab = () => (
    <FlatList
      data={LIVE_ROOMS}
      keyExtractor={r => r.id}
      contentContainerStyle={styles.tabContent}
      ListHeaderComponent={<SectionHeader title="All Live Classes" />}
      renderItem={({ item }) => (
        <LiveRoomCard room={item} onWatch={handleWatch} watchLabel="Monitor" />
      )}
      showsVerticalScrollIndicator={false}
    />
  );

  return (
    <SafeAreaView style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <Av initials="HM" size={44} bg="rgba(255,255,255,0.15)" />
        <View style={{ marginLeft: 12, flex: 1 }}>
          <Text style={styles.roleLabel}>HEADMASTER</Text>
          <Text style={styles.name}>Dr. S. Krishnamurthy</Text>
          <Text style={styles.subtitle}>Springfield Academy</Text>
        </View>
        <TouchableOpacity style={styles.newMeetingBtn} onPress={() => setShowNew(true)} activeOpacity={0.8}>
          <Text style={styles.newMeetingText}>+ Meeting</Text>
        </TouchableOpacity>
      </View>

      {/* Tab bar */}
      <View style={styles.tabBar}>
        {[['meetings', '📞 Meetings'], ['monitor', '👁 Live Monitor']].map(([id, label]) => (
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
        {tab === 'meetings' && <MeetingsTab />}
        {tab === 'monitor'  && <MonitorTab />}
      </View>

      {/* New Meeting Modal */}
      <Modal visible={showNew} transparent animationType="slide" onRequestClose={() => setShowNew(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalSheet}>
              <View style={styles.modalHandle} />
              <Text style={styles.modalTitle}>New Staff Meeting</Text>
              <Text style={styles.modalSub}>Select participants. Institution logo on all tiles.</Text>

              <TextInput
                style={styles.titleInput}
                placeholder="Meeting title (e.g. Monthly Review)"
                placeholderTextColor="#94a3b8"
                value={meetTitle}
                onChangeText={setTitle}
              />

              <Text style={styles.sectionLabel}>SELECT PARTICIPANTS</Text>
              {STAFF.map(s => (
                <TouchableOpacity
                  key={s.id}
                  style={[styles.participantRow, selected.includes(s.id) && styles.participantRowActive]}
                  onPress={() => toggle(s.id)}
                  activeOpacity={0.8}
                >
                  <View style={{ position: 'relative' }}>
                    <Av initials={s.avatar} size={36} />
                    <OnlineDot online={s.online} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={[styles.staffName, selected.includes(s.id) && { color: C.navy }]}>{s.name}</Text>
                    <Text style={styles.staffRole}>{s.role} · {s.online ? 'Online' : 'Offline'}</Text>
                  </View>
                  <View style={[styles.checkbox, selected.includes(s.id) && styles.checkboxActive]}>
                    {selected.includes(s.id) && <Text style={{ color: '#fff', fontSize: 12, fontWeight: '800' }}>✓</Text>}
                  </View>
                </TouchableOpacity>
              ))}

              <View style={styles.modalBtnRow}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => { setShowNew(false); setSelected([]); }} activeOpacity={0.8}>
                  <Text style={{ color: C.slate, fontWeight: '700' }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.startBtn, (selected.length === 0 || !meetTitle) && styles.startBtnDisabled]}
                  onPress={startMeeting}
                  disabled={selected.length === 0 || !meetTitle}
                  activeOpacity={0.8}
                >
                  <Text style={styles.startBtnText}>🏫 Start Meeting ({selected.length + 1})</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

// ─── MEETING ROOM STYLES ──────────────────────────────────────────────────────
const mr = StyleSheet.create({
  root:          { flex: 1, backgroundColor: '#0a0f1e' },
  topBar:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: 'rgba(255,255,255,0.04)', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  topBarLeft:    { flexDirection: 'row', alignItems: 'center' },
  schoolName:    { color: '#fff', fontWeight: '800', fontSize: 13 },
  meetingLabel:  { color: 'rgba(255,255,255,0.35)', fontSize: 10, marginTop: 1 },
  timerBox:      { backgroundColor: 'rgba(239,68,68,0.15)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)' },
  timerText:     { color: '#f87171', fontWeight: '800', fontSize: 16, fontVariant: ['tabular-nums'] },
  gridArea:      { padding: 12, gap: 8 },
  selfTile:      { width: '100%', aspectRatio: 16 / 7, backgroundColor: '#1e3a5f', borderRadius: 14, alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', borderWidth: 2, borderColor: 'rgba(29,78,216,0.4)', marginBottom: 8 },
  selfTileInner: { alignItems: 'center' },
  selfTileLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '700', marginTop: 8 },
  logoWatermark: { position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, flexDirection: 'row', alignItems: 'center', gap: 4 },
  logoWatermarkText: { color: 'rgba(255,255,255,0.7)', fontSize: 9, fontWeight: '800', marginLeft: 4 },
  participantGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  participantTile: { width: '48%', aspectRatio: 4 / 3, backgroundColor: '#1a2744', borderRadius: 12, alignItems: 'center', justifyContent: 'center', position: 'relative', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  participantName: { color: 'rgba(255,255,255,0.5)', fontSize: 10, marginTop: 6 },
  miniLogo:        { position: 'absolute', top: 6, right: 6 },
  controlBar:      { backgroundColor: 'rgba(255,255,255,0.04)', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)' },
  controlRow:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  controlBtns:     { flexDirection: 'row', gap: 10 },
  controlBtn:      { width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  controlBtnOff:   { backgroundColor: 'rgba(239,68,68,0.2)' },
  endBtn:          { backgroundColor: '#dc2626', borderRadius: 12, paddingHorizontal: 20, paddingVertical: 10 },
  endBtnText:      { color: '#fff', fontWeight: '800', fontSize: 13 },
});

// ─── SCREEN STYLES ────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    backgroundColor: C.navy,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  roleLabel:     { color: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  name:          { color: '#fff', fontWeight: '800', fontSize: 17, marginTop: 1 },
  subtitle:      { color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 1 },
  newMeetingBtn: { backgroundColor: C.amber, borderRadius: 22, paddingHorizontal: 14, paddingVertical: 8 },
  newMeetingText:{ color: '#fff', fontWeight: '800', fontSize: 12 },
  tabBar:        { flexDirection: 'row', backgroundColor: C.navy, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' },
  tabItem:       { flex: 1, paddingVertical: 11, alignItems: 'center', borderBottomWidth: 2.5, borderBottomColor: 'transparent' },
  tabItemActive: { borderBottomColor: C.amber },
  tabLabel:      { color: 'rgba(255,255,255,0.35)', fontWeight: '700', fontSize: 12 },
  tabLabelActive:{ color: '#fff' },
  tabContent:    { padding: 16, paddingBottom: 32 },
  card:          { backgroundColor: C.white, borderRadius: 16, padding: 16, marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  cardHeading:   { fontWeight: '800', fontSize: 15, color: C.navy, marginBottom: 12 },
  staffRow:      { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  staffRowBorder:{ borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  staffName:     { fontWeight: '700', fontSize: 13, color: C.navy },
  staffRole:     { fontSize: 11, color: C.slate, marginTop: 1 },
  callBtn:       { backgroundColor: '#eff6ff', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  callBtnDisabled:{ backgroundColor: '#f1f5f9' },
  callBtnText:   { color: C.blue, fontWeight: '700', fontSize: 11 },
  recentRow:     { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  viewBtn:       { backgroundColor: '#f1f5f9', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  viewBtnText:   { color: C.slate, fontSize: 11, fontWeight: '600' },
  // Modal
  modalOverlay:  { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  modalSheet:    { backgroundColor: C.white, borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 20, paddingBottom: 36, maxHeight: '88%' },
  modalHandle:   { width: 40, height: 4, borderRadius: 2, backgroundColor: '#e2e8f0', alignSelf: 'center', marginBottom: 14 },
  modalTitle:    { fontWeight: '800', fontSize: 18, color: C.navy, marginBottom: 2 },
  modalSub:      { color: C.slate, fontSize: 13, marginBottom: 16 },
  titleInput:    { borderWidth: 1.5, borderColor: '#e2e8f0', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 11, fontSize: 14, color: C.navy, marginBottom: 16 },
  sectionLabel:  { fontSize: 12, fontWeight: '700', color: C.slate, letterSpacing: 0.4, marginBottom: 8 },
  participantRow:{ flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: 12, borderWidth: 1.5, borderColor: '#e2e8f0', backgroundColor: '#f8fafc', marginBottom: 8 },
  participantRowActive: { borderColor: C.blue, backgroundColor: '#eff6ff' },
  checkbox:      { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: '#cbd5e1', alignItems: 'center', justifyContent: 'center' },
  checkboxActive:{ backgroundColor: C.blue, borderColor: C.blue },
  modalBtnRow:   { flexDirection: 'row', gap: 10, marginTop: 16 },
  cancelBtn:     { flex: 1, paddingVertical: 13, borderRadius: 12, borderWidth: 1.5, borderColor: '#e2e8f0', alignItems: 'center' },
  startBtn:      { flex: 2, paddingVertical: 13, borderRadius: 12, backgroundColor: C.navy, alignItems: 'center' },
  startBtnDisabled: { backgroundColor: '#e2e8f0' },
  startBtnText:  { color: '#fff', fontWeight: '800', fontSize: 14 },
});
