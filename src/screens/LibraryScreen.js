import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, FlatList, Alert, StyleSheet } from 'react-native';
import { useLibrary } from '../store/LibraryContext';
import { usePlayer } from '../player/PlayerContext';
import TrackList from '../components/TrackList';
import { colors } from '../theme';

export default function LibraryScreen() {
  const { liked, playlists, createPlaylist, deletePlaylist } = useLibrary();
  const { playTracks } = usePlayer();
  const [section, setSection] = useState('liked');
  const [openId, setOpenId] = useState(null);
  const [name, setName] = useState('');

  const open = playlists.find((p) => p.id === openId);

  const confirmDelete = (p) =>
    Alert.alert('Eliminar playlist', `¿Eliminar «${p.name}»? Las canciones no se borran de Coby.`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => { deletePlaylist(p.id); setOpenId(null); } },
    ]);

  return (
    <View style={styles.root}>
      <Text style={styles.heading}>Tu biblioteca</Text>

      <View style={styles.switch}>
        <Seg label="Me gusta" active={section === 'liked'} onPress={() => { setSection('liked'); setOpenId(null); }} />
        <Seg label="Playlists" active={section === 'playlists'} onPress={() => setSection('playlists')} />
      </View>

      {section === 'liked' && (
        <>
          {liked.length > 0 && <PlayAll onPress={() => playTracks(liked, 0)} />}
          <TrackList tracks={liked} emptyText="Aún no tienes favoritas. Toca ♡ en cualquier canción para guardarla aquí." />
        </>
      )}

      {section === 'playlists' && !open && (
        <>
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
              onPress={() => { createPlaylist(name); setName(''); }}
              style={[styles.create, !name.trim() && { opacity: 0.4 }]}
            >
              <Text style={styles.createText}>Crear</Text>
            </Pressable>
          </View>
          <FlatList
            data={playlists}
            keyExtractor={(p) => p.id}
            ListEmptyComponent={<Text style={styles.empty}>Crea tu primera playlist con el campo de arriba.</Text>}
            renderItem={({ item }) => (
              <Pressable onPress={() => setOpenId(item.id)} style={styles.plRow}>
                <Text style={styles.plName}>{item.name}</Text>
                <Text style={styles.plCount}>{item.tracks.length} canciones</Text>
              </Pressable>
            )}
          />
        </>
      )}

      {section === 'playlists' && open && (
        <>
          <View style={styles.detailHead}>
            <Pressable onPress={() => setOpenId(null)} hitSlop={10}>
              <Text style={styles.back}>‹ Playlists</Text>
            </Pressable>
            <Pressable onPress={() => confirmDelete(open)} hitSlop={10}>
              <Text style={styles.delete}>Eliminar</Text>
            </Pressable>
          </View>
          <Text style={styles.plTitle}>{open.name}</Text>
          {open.tracks.length > 0 && <PlayAll onPress={() => playTracks(open.tracks, 0)} />}
          <TrackList
            tracks={open.tracks}
            playlistId={open.id}
            emptyText="Esta playlist está vacía. En Buscar, toca ⋯ en una canción y elige esta playlist."
          />
        </>
      )}
    </View>
  );
}

function Seg({ label, active, onPress }) {
  return (
    <Pressable onPress={onPress} style={[styles.seg, active && styles.segActive]}>
      <Text style={[styles.segText, active && styles.segTextActive]}>{label}</Text>
    </Pressable>
  );
}

function PlayAll({ onPress }) {
  return (
    <Pressable onPress={onPress} style={styles.playAll}>
      <Text style={styles.playAllText}>▶  Reproducir todo</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  heading: { color: colors.text, fontSize: 26, fontWeight: '800', paddingHorizontal: 16, paddingTop: 12 },
  switch: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginVertical: 14 },
  seg: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: colors.surface },
  segActive: { backgroundColor: colors.accent },
  segText: { color: colors.sub, fontWeight: '600' },
  segTextActive: { color: colors.onAccent },
  playAll: { marginHorizontal: 16, marginBottom: 6, backgroundColor: colors.raised, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  playAllText: { color: colors.text, fontWeight: '700', fontSize: 15 },
  newRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginBottom: 8 },
  input: { flex: 1, backgroundColor: colors.surface, color: colors.text, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10 },
  create: { backgroundColor: colors.accent, borderRadius: 10, paddingHorizontal: 18, justifyContent: 'center' },
  createText: { color: colors.onAccent, fontWeight: '700' },
  plRow: { paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  plName: { color: colors.text, fontSize: 17, fontWeight: '600' },
  plCount: { color: colors.sub, fontSize: 13, marginTop: 2 },
  empty: { color: colors.sub, textAlign: 'center', marginTop: 40, paddingHorizontal: 32, lineHeight: 22 },
  detailHead: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16 },
  back: { color: colors.sub, fontSize: 16 },
  delete: { color: colors.heart, fontSize: 15 },
  plTitle: { color: colors.text, fontSize: 24, fontWeight: '800', paddingHorizontal: 16, marginVertical: 10 },
});
