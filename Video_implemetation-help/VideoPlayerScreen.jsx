/**
 * VideoPlayerScreen.jsx
 *
 * Full-screen live viewer — simulates the CCTV multi-cam grid.
 * In production, replace the placeholder grid with:
 *   import { DailyMediaView } from '@daily-co/react-native-daily-js';
 *
 * Props (passed via React Navigation route.params):
 *   subject  : string
 *   teacher  : string
 *   onClose  : not used via navigation — use navigation.goBack()
 *
 * Usage:
 *   navigation.navigate('VideoPlayer', { subject: 'Mathematics', teacher: 'Mrs. Kavitha R.' });
 */

import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  SafeAreaView, StatusBar, Platform,
} from 'react-native';
import { C } from '../constants';
import { LiveBadge } from './SharedComponents';

const CAM_LABELS = ['Front View', 'Side Angle', 'Board Cam', 'Overview'];
const CAM_ICONS  = ['📹', '🎥', '📸', '🖥️'];

function fmtTime(s) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

export default function VideoPlayerScreen({ route, navigation }) {
  const { subject = 'Mathematics', teacher = 'Mrs. Kavitha R.' } = route?.params ?? {};
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* ── CAMERA FEED AREA ── */}
      <View style={styles.feedArea}>

        {/* Top overlay: stream info + timer */}
        <SafeAreaView style={styles.topOverlay}>
          <View style={styles.topRow}>
            {/* Stream info pill */}
            <View style={styles.infoPill}>
              <Text style={styles.infoPillLabel}>NOW STREAMING</Text>
              <Text style={styles.infoPillSubject}>{subject}</Text>
              <Text style={styles.infoPillTeacher}>{teacher}</Text>
            </View>

            {/* Elapsed timer */}
            <View style={styles.timerPill}>
              <Text style={styles.timerText}>{fmtTime(elapsed)}</Text>
              <Text style={styles.timerLabel}>ELAPSED</Text>
            </View>
          </View>
        </SafeAreaView>

        {/* ── CCTV 2×2 GRID ──
            Replace each CamTile below with <DailyMediaView> for production */}
        <View style={styles.camGrid}>
          {CAM_LABELS.map((label, i) => (
            <CamTile key={i} icon={CAM_ICONS[i]} label={label} camNum={i + 1} isMain={i === 0} />
          ))}
        </View>

        {/* Bottom watermark */}
        <View style={styles.watermark}>
          <Text style={{ fontSize: 16 }}>🏫</Text>
          <View style={{ marginLeft: 6 }}>
            <Text style={styles.watermarkTitle}>SPRINGFIELD ACADEMY</Text>
            <Text style={styles.watermarkSub}>Secure · Encrypted</Text>
          </View>
        </View>
      </View>

      {/* ── CONTROLS BAR ── */}
      <SafeAreaView style={styles.controlsBar}>
        <View style={styles.controlsRow}>
          <View style={styles.controlBtns}>
            {['🔇', '📸', '⛶'].map((ic, i) => (
              <TouchableOpacity key={i} style={styles.controlBtn} activeOpacity={0.7}>
                <Text style={{ fontSize: 18 }}>{ic}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => navigation?.goBack()}
            activeOpacity={0.8}
          >
            <Text style={styles.closeBtnText}>✕ Close</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

function CamTile({ icon, label, camNum, isMain }) {
  return (
    <View style={styles.camTile}>
      <Text style={{ fontSize: 22 }}>{icon}</Text>
      <Text style={styles.camLabel}>CAM {camNum} · {label}</Text>
      {isMain && (
        <View style={styles.camLiveBadge}>
          <LiveBadge />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000',
  },
  feedArea: {
    flex: 1,
    backgroundColor: '#0a1628',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 14,
    paddingTop: Platform.OS === 'android' ? 40 : 12,
  },
  infoPill: {
    backgroundColor: 'rgba(0,0,0,0.65)',
    borderRadius: 8,
    padding: 10,
  },
  infoPillLabel: {
    color: '#94a3b8',
    fontSize: 9,
    letterSpacing: 1,
    fontWeight: '700',
  },
  infoPillSubject: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
    marginTop: 2,
  },
  infoPillTeacher: {
    color: '#64748b',
    fontSize: 10,
    marginTop: 1,
  },
  timerPill: {
    backgroundColor: 'rgba(0,0,0,0.65)',
    borderRadius: 8,
    padding: 10,
    alignItems: 'flex-end',
  },
  timerText: {
    color: '#f87171',
    fontWeight: '800',
    fontSize: 16,
    fontVariant: ['tabular-nums'],
  },
  timerLabel: {
    color: '#64748b',
    fontSize: 9,
    marginTop: 2,
  },
  camGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '90%',
    gap: 3,
  },
  camTile: {
    width: '49%',
    aspectRatio: 4 / 3,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  camLabel: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 9,
    fontWeight: '600',
    marginTop: 4,
  },
  camLiveBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
  },
  watermark: {
    position: 'absolute',
    bottom: 14,
    right: 14,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  watermarkTitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 9,
    fontWeight: '700',
  },
  watermarkSub: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 8,
    marginTop: 1,
  },
  controlsBar: {
    backgroundColor: '#0f172a',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  controlBtns: {
    flexDirection: 'row',
    gap: 14,
  },
  controlBtn: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 10,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtn: {
    backgroundColor: '#dc2626',
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  closeBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
});
