import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated,
} from 'react-native';
import { C } from '../constants';

// ─── AVATAR ───────────────────────────────────────────────────────────────────
export function Av({ initials, size = 38, bg = C.navyMid, color = '#fff' }) {
  return (
    <View style={[styles.av, { width: size, height: size, borderRadius: size / 2, backgroundColor: bg }]}>
      <Text style={[styles.avText, { fontSize: size * 0.33, color }]}>{initials}</Text>
    </View>
  );
}

// ─── LIVE BADGE ───────────────────────────────────────────────────────────────
export function LiveBadge() {
  return (
    <View style={styles.liveBadge}>
      <View style={styles.liveDot} />
      <Text style={styles.liveText}>LIVE</Text>
    </View>
  );
}

// ─── ONLINE DOT ───────────────────────────────────────────────────────────────
export function OnlineDot({ online }) {
  return (
    <View style={[styles.onlineDot, { backgroundColor: online ? C.green : '#94a3b8' }]} />
  );
}

// ─── SECTION HEADER ───────────────────────────────────────────────────────────
export function SectionHeader({ title }) {
  return (
    <Text style={styles.sectionHeader}>{title}</Text>
  );
}

// ─── LIVE ROOM CARD ───────────────────────────────────────────────────────────
export function LiveRoomCard({ room, onWatch, watchLabel = 'Watch' }) {
  const isLive = room.status === 'live';
  return (
    <View style={styles.card}>
      {/* coloured top bar */}
      <View style={[styles.cardHeader, { backgroundColor: isLive ? C.navy : '#94a3b8' }]}>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>{room.subject}</Text>
          <Text style={styles.cardSub}>{room.teacher} · Class {room.class}</Text>
        </View>
        {isLive ? <LiveBadge /> : <Text style={styles.endedText}>ENDED</Text>}
      </View>

      {/* footer */}
      <View style={styles.cardFooter}>
        <Text style={styles.cardMeta}>
          👁 {room.viewers} viewers · {room.startedAt}
        </Text>
        {isLive && (
          <TouchableOpacity style={styles.watchBtn} onPress={() => onWatch(room)} activeOpacity={0.75}>
            <Text style={styles.watchBtnText}>{watchLabel}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

// ─── RECORDED VIDEO CARD ──────────────────────────────────────────────────────
export function RecordedCard({ video, onPlay, onDelete, showDelete = false }) {
  return (
    <View style={styles.card}>
      <View style={[styles.cardHeader, { backgroundColor: C.navy, flexDirection: 'row', gap: 12 }]}>
        <View style={styles.thumbBox}>
          <Text style={{ fontSize: 26 }}>{video.thumb}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle} numberOfLines={2}>{video.title}</Text>
          <Text style={styles.cardSub}>{video.subject} · {video.date}</Text>
        </View>
        <Text style={styles.durationBadge}>{video.duration}</Text>
      </View>
      <View style={styles.cardFooter}>
        <Text style={styles.cardMeta}>👁 {video.views} views · {video.teacher}</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity style={styles.playBtn} onPress={() => onPlay(video)} activeOpacity={0.75}>
            <Text style={styles.playBtnText}>▶ Play</Text>
          </TouchableOpacity>
          {showDelete && (
            <TouchableOpacity style={styles.deleteBtn} onPress={() => onDelete(video)} activeOpacity={0.75}>
              <Text style={{ fontSize: 14 }}>🗑</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  av: {
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avText: {
    fontWeight: '800',
    letterSpacing: -0.5,
    color: '#fff',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#dc2626',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fff',
  },
  liveText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  onlineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#fff',
    position: 'absolute',
    bottom: -1,
    right: -1,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: C.slate,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  card: {
    backgroundColor: C.white,
    borderRadius: 14,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
  },
  cardHeader: {
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 14,
    marginBottom: 2,
  },
  cardSub: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    marginTop: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  cardMeta: {
    fontSize: 12,
    color: C.slate,
    flex: 1,
  },
  endedText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    fontWeight: '600',
  },
  watchBtn: {
    backgroundColor: C.navy,
    borderRadius: 9,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  watchBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
  thumbBox: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  durationBadge: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'center',
  },
  playBtn: {
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  playBtnText: {
    color: C.blue,
    fontWeight: '700',
    fontSize: 12,
  },
  deleteBtn: {
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
