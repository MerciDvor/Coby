import React from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { usePlayer } from '../player/PlayerContext';
import { useLibrary } from '../store/LibraryContext';
import { colors } from '../theme';

export default function TrackRow({ track, onPress, onMenu }) {
  const { currentTrack } = usePlayer();
  const { isLiked, toggleLike } = useLibrary();
  const active = currentTrack?.id === track.id;
  const liked = isLiked(track.id);

  return (
    <Pressable onPress={onPress} style={styles.row}>
      {track.artwork ? (
        <Image source={{ uri: track.artwork }} style={styles.art} />
      ) : (
        <View style={[styles.art, styles.artEmpty]} />
      )}
      <View style={styles.info}>
        <Text numberOfLines={1} style={[styles.title, active && styles.titleActive]}>
          {track.title}
        </Text>
        <Text numberOfLines={1} style={styles.artist}>
          {track.artist}
        </Text>
      </View>
      <Pressable onPress={() => toggleLike(track)} hitSlop={10} style={styles.btn}>
        <Text style={[styles.icon, liked && { color: colors.heart }]}>{liked ? '♥' : '♡'}</Text>
      </Pressable>
      <Pressable onPress={onMenu} hitSlop={10} style={styles.btn}>
        <Text style={styles.icon}>⋯</Text>
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, gap: 12 },
  art: { width: 52, height: 52, borderRadius: 6, backgroundColor: colors.raised },
  artEmpty: { backgroundColor: colors.raised },
  info: { flex: 1 },
  title: { color: colors.text, fontSize: 16, fontWeight: '600' },
  titleActive: { color: colors.accent },
  artist: { color: colors.sub, fontSize: 13, marginTop: 2 },
  btn: { paddingHorizontal: 6 },
  icon: { color: colors.sub, fontSize: 24 },
});
