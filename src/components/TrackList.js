import React, { useState } from 'react';
import { FlatList, Text, StyleSheet } from 'react-native';
import { usePlayer } from '../player/PlayerContext';
import TrackRow from './TrackRow';
import TrackMenu from './TrackMenu';
import { colors } from '../theme';

export default function TrackList({ tracks, playlistId, emptyText }) {
  const { playTracks } = usePlayer();
  const [menuTrack, setMenuTrack] = useState(null);

  return (
    <>
      <FlatList
        data={tracks}
        keyExtractor={(t) => t.id}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={<Text style={styles.empty}>{emptyText}</Text>}
        renderItem={({ item, index }) => (
          <TrackRow track={item} onPress={() => playTracks(tracks, index)} onMenu={() => setMenuTrack(item)} />
        )}
      />
      <TrackMenu track={menuTrack} playlistId={playlistId} onClose={() => setMenuTrack(null)} />
    </>
  );
}

const styles = StyleSheet.create({
  empty: { color: colors.sub, textAlign: 'center', marginTop: 40, paddingHorizontal: 32, fontSize: 15, lineHeight: 22 },
});
