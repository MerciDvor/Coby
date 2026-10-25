import React, { useState } from 'react';
import { Modal, View, Text, TextInput, Pressable, ScrollView, StyleSheet } from 'react-native';
import { usePlayer } from '../player/PlayerContext';
import { useLibrary } from '../store/LibraryContext';
import { colors } from '../theme';

export default function TrackMenu({ track, playlistId, onClose }) {
  const { addToQueue } = usePlayer();
  const { playlists, addToPlaylist, removeFromPlaylist, createPlaylist } = useLibrary();
  const [name, setName] = useState('');

  if (!track) return null;

  const run = (fn) => () => {
    fn();
    setName('');
    onClose();
  };

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <Text numberOfLines={1} style={styles.heading}>{track.title}</Text>
          <Text numberOfLines={1} style={styles.sub}>{track.artist}</Text>

          <ScrollView style={{ maxHeight: 360 }} keyboardShouldPersistTaps="handled">
            <Item label="Agregar a la cola" onPress={run(() => addToQueue(track))} />
            {playlistId && (
              <Item label="Quitar de esta playlist" onPress={run(() => removeFromPlaylist(playlistId, track.id))} />
            )}
            {playlists
              .filter((p) => p.id !== playlistId)
              .map((p) => (
                <Item key={p.id} label={`Agregar a «${p.name}»`} onPress={run(() => addToPlaylist(p.id, track))} />
              ))}
            <View style={styles.newRow}>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Nombre de la nueva playlist"
                placeholderTextColor={colors.sub}
                style={styles.input}
              />
              <Pressable
                disabled={!name.trim()}
                onPress={run(() => addToPlaylist(createPlaylist(name), track))}
                style={[styles.create, !name.trim() && { opacity: 0.4 }]}
              >
                <Text style={styles.createText}>Crear y agregar</Text>
              </Pressable>
            </View>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function Item({ label, onPress }) {
  return (
    <Pressable onPress={onPress} style={styles.item}>
      <Text style={styles.itemText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: colors.surface, padding: 20, borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  heading: { color: colors.text, fontSize: 18, fontWeight: '700' },
  sub: { color: colors.sub, marginBottom: 8 },
  item: { paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  itemText: { color: colors.text, fontSize: 16 },
  newRow: { marginTop: 14, gap: 8 },
  input: { backgroundColor: colors.raised, color: colors.text, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10 },
  create: { backgroundColor: colors.accent, borderRadius: 8, paddingVertical: 12, alignItems: 'center' },
  createText: { color: colors.onAccent, fontWeight: '700' },
});
