import React, { useState } from 'react';
import { Modal, View, Text, Image, Pressable, StyleSheet, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePlayer } from '../player/PlayerContext';
import { useLibrary } from '../store/LibraryContext';
import { fmt } from '../util';
import { colors } from '../theme';

export default function NowPlaying({ visible, onClose }) {
  const { currentTrack, status, toggle, next, prev, seek } = usePlayer();
  const { isLiked, toggleLike } = useLibrary();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [barW, setBarW] = useState(1);

  if (!currentTrack) return null;
  const size = Math.min(width - 48, 360);
  const pct = status.duration ? (status.currentTime / status.duration) * 100 : 0;
  const liked = isLiked(currentTrack.id);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.root, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 16 }]}>
        <Pressable onPress={onClose} hitSlop={12} style={styles.close}>
          <Text style={styles.closeText}>⌄ Cerrar</Text>
        </Pressable>

        {currentTrack.artwork ? (
          <Image source={{ uri: currentTrack.artwork }} style={{ width: size, height: size, borderRadius: 12 }} />
        ) : (
          <View style={{ width: size, height: size, borderRadius: 12, backgroundColor: colors.raised }} />
        )}

        <View style={styles.meta}>
          <View style={{ flex: 1 }}>
            <Text numberOfLines={2} style={styles.title}>{currentTrack.title}</Text>
            <Text numberOfLines={1} style={styles.artist}>{currentTrack.artist}</Text>
          </View>
          <Pressable onPress={() => toggleLike(currentTrack)} hitSlop={12}>
            <Text style={[styles.heart, liked && { color: colors.heart }]}>{liked ? '♥' : '♡'}</Text>
          </Pressable>
        </View>

        <View style={styles.progress}>
          <Pressable
            onLayout={(e) => setBarW(e.nativeEvent.layout.width || 1)}
            onPress={(e) => seek((e.nativeEvent.locationX / barW) * status.duration)}
            style={styles.barHit}
          >
            <View pointerEvents="none" style={styles.barBg}>
              <View style={[styles.barFill, { width: `${pct}%` }]} />
            </View>
          </Pressable>
          <View style={styles.times}>
            <Text style={styles.time}>{fmt(status.currentTime)}</Text>
            <Text style={styles.time}>{fmt(status.duration)}</Text>
          </View>
        </View>

        <View style={styles.controls}>
          <Pressable onPress={prev} hitSlop={12}><Text style={styles.ctrl}>⏮</Text></Pressable>
          <Pressable onPress={toggle} style={styles.play}>
            <Text style={styles.playIcon}>{status.playing ? '⏸' : '▶'}</Text>
          </Pressable>
          <Pressable onPress={next} hitSlop={12}><Text style={styles.ctrl}>⏭</Text></Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', paddingHorizontal: 24 },
  close: { alignSelf: 'flex-start', marginBottom: 24 },
  closeText: { color: colors.sub, fontSize: 16 },
  meta: { flexDirection: 'row', alignItems: 'center', width: '100%', marginTop: 28 },
  title: { color: colors.text, fontSize: 22, fontWeight: '700' },
  artist: { color: colors.sub, fontSize: 16, marginTop: 4 },
  heart: { color: colors.sub, fontSize: 32, paddingLeft: 12 },
  progress: { width: '100%', marginTop: 24 },
  barHit: { paddingVertical: 12 },
  barBg: { height: 4, borderRadius: 2, backgroundColor: colors.line },
  barFill: { height: 4, borderRadius: 2, backgroundColor: colors.accent },
  times: { flexDirection: 'row', justifyContent: 'space-between' },
  time: { color: colors.sub, fontSize: 12 },
  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '70%', marginTop: 24 },
  ctrl: { color: colors.text, fontSize: 32 },
  play: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  playIcon: { color: colors.onAccent, fontSize: 30 },
});
