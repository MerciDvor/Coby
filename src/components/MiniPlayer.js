import React from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { usePlayer } from '../player/PlayerContext';
import { colors } from '../theme';

export default function MiniPlayer({ onOpen }) {
  const { currentTrack, status, toggle, next } = usePlayer();
  if (!currentTrack) return null;
  const pct = status.duration ? (status.currentTime / status.duration) * 100 : 0;

  return (
    <Pressable onPress={onOpen} style={styles.wrap}>
      <View style={styles.row}>
        {currentTrack.artwork ? (
          <Image source={{ uri: currentTrack.artwork }} style={styles.art} />
        ) : (
          <View style={styles.art} />
        )}
        <View style={styles.info}>
          <Text numberOfLines={1} style={styles.title}>{currentTrack.title}</Text>
          <Text numberOfLines={1} style={styles.artist}>{currentTrack.artist}</Text>
        </View>
        <Pressable onPress={toggle} hitSlop={10} style={styles.btn}>
          <Text style={styles.icon}>{status.playing ? '⏸' : '▶'}</Text>
        </Pressable>
        <Pressable onPress={next} hitSlop={10} style={styles.btn}>
          <Text style={styles.icon}>⏭</Text>
        </Pressable>
      </View>
      <View style={styles.barBg}>
        <View style={[styles.barFill, { width: `${pct}%` }]} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { backgroundColor: colors.raised },
  row: { flexDirection: 'row', alignItems: 'center', padding: 8, gap: 10 },
  art: { width: 44, height: 44, borderRadius: 6, backgroundColor: colors.surface },
  info: { flex: 1 },
  title: { color: colors.text, fontWeight: '600', fontSize: 15 },
  artist: { color: colors.sub, fontSize: 12 },
  btn: { paddingHorizontal: 8 },
  icon: { color: colors.text, fontSize: 24 },
  barBg: { height: 2, backgroundColor: colors.line },
  barFill: { height: 2, backgroundColor: colors.accent },
});
