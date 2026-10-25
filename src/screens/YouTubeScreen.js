import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View, Text, TextInput, Image, Pressable, FlatList, ActivityIndicator,
  StyleSheet, useWindowDimensions, Linking,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import YoutubePlayer from 'react-native-youtube-iframe';
import { usePlayer } from '../player/PlayerContext';
import { colors } from '../theme';

const KEY_STORE = 'coby:youtube-key:v1';

const decode = (s = '') =>
  s.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>');

async function searchVideos(q, key) {
  const url =
    'https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoCategoryId=10' +
    `&videoEmbeddable=true&maxResults=25&q=${encodeURIComponent(q)}&key=${key}`;
  const res = await fetch(url);
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error?.message ?? `YouTube respondió ${res.status}`);
  return (json.items ?? []).map((i) => ({
    id: i.id.videoId,
    title: decode(i.snippet.title),
    channel: decode(i.snippet.channelTitle),
    thumb: i.snippet.thumbnails?.medium?.url ?? null,
  }));
}

export default function YouTubeScreen() {
  const { width } = useWindowDimensions();
  const { status, toggle: toggleAudius } = usePlayer();

  const [apiKey, setApiKey] = useState(null); // null = cargando, '' = sin clave
  const [keyInput, setKeyInput] = useState('');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [index, setIndex] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const resultsRef = useRef([]);
  const indexRef = useRef(-1);

  useEffect(() => {
    AsyncStorage.getItem(KEY_STORE)
      .then((v) => setApiKey(v ?? ''))
      .catch(() => setApiKey(''));
  }, []);

  const saveKey = async () => {
    const k = keyInput.trim();
    if (!k) return;
    await AsyncStorage.setItem(KEY_STORE, k);
    setApiKey(k);
    setError(null);
  };

  const resetKey = async () => {
    await AsyncStorage.removeItem(KEY_STORE);
    setApiKey('');
    setKeyInput('');
    setResults([]);
    resultsRef.current = [];
    setIndex(-1);
    setPlaying(false);
  };

  const search = async () => {
    const q = query.trim();
    if (q.length < 2) return;
    setLoading(true);
    setError(null);
    try {
      const r = await searchVideos(q, apiKey);
      resultsRef.current = r;
      setResults(r);
      if (!r.length) setError('No encontramos videos con esa búsqueda. Prueba con otro nombre.');
    } catch (e) {
      setError(`No se pudo buscar: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const playIndex = useCallback(
    (i) => {
      if (!resultsRef.current[i]) return;
      if (status.playing) toggleAudius(); // pausa la música de Audius para que no se mezclen
      indexRef.current = i;
      setIndex(i);
      setPlaying(true);
    },
    [status.playing, toggleAudius]
  );

  const onState = useCallback(
    (s) => {
      if (s === 'ended') {
        const n = indexRef.current + 1;
        if (n < resultsRef.current.length) playIndex(n);
        else setPlaying(false);
      } else if (s === 'playing') setPlaying(true);
      else if (s === 'paused') setPlaying(false);
    },
    [playIndex]
  );

  if (apiKey === null) {
    return <ActivityIndicator color={colors.accent} style={{ marginTop: 60 }} />;
  }

  if (apiKey === '') {
    return (
      <View style={styles.root}>
        <Text style={styles.brand}>YouTube</Text>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Conecta tu clave de YouTube</Text>
          <Text style={styles.cardText}>
            Para buscar videos necesitas una clave gratuita de la API de YouTube Data v3. En Google Cloud Console
            crea un proyecto, activa «YouTube Data API v3» y crea una clave de API. Pégala aquí; se guarda solo en
            tu teléfono.
          </Text>
          <Pressable
            onPress={() => Linking.openURL('https://console.cloud.google.com/apis/library/youtube.googleapis.com')}
            style={styles.linkBtn}
          >
            <Text style={styles.linkText}>Abrir Google Cloud Console</Text>
          </Pressable>
          <TextInput
            value={keyInput}
            onChangeText={setKeyInput}
            placeholder="Pega tu clave de API"
            placeholderTextColor={colors.sub}
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.input}
          />
          <Pressable onPress={saveKey} disabled={!keyInput.trim()} style={[styles.primary, !keyInput.trim() && { opacity: 0.4 }]}>
            <Text style={styles.primaryText}>Guardar clave</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const current = results[index] ?? null;

  return (
    <View style={styles.root}>
      <View style={styles.topRow}>
        <Text style={styles.brand}>YouTube</Text>
        <Pressable onPress={resetKey} hitSlop={10}>
          <Text style={styles.small}>Cambiar clave</Text>
        </Pressable>
      </View>

      <TextInput
        value={query}
        onChangeText={setQuery}
        onSubmitEditing={search}
        placeholder="Busca canciones o artistas"
        placeholderTextColor={colors.sub}
        returnKeyType="search"
        autoCorrect={false}
        style={styles.input}
      />

      {current && (
        <View style={styles.playerWrap}>
          <YoutubePlayer
            height={Math.round((width * 9) / 16)}
            play={playing}
            videoId={current.id}
            onChangeState={onState}
          />
          <Text numberOfLines={2} style={styles.nowTitle}>{current.title}</Text>
          <View style={styles.controls}>
            <Pressable onPress={() => playIndex(Math.max(0, index - 1))} hitSlop={10}>
              <Text style={styles.ctrl}>⏮</Text>
            </Pressable>
            <Pressable onPress={() => setPlaying((p) => !p)} style={styles.play}>
              <Text style={styles.playIcon}>{playing ? '⏸' : '▶'}</Text>
            </Pressable>
            <Pressable onPress={() => playIndex(index + 1)} hitSlop={10}>
              <Text style={styles.ctrl}>⏭</Text>
            </Pressable>
          </View>
        </View>
      )}

      {loading && <ActivityIndicator color={colors.accent} style={{ marginVertical: 8 }} />}
      {error && <Text style={styles.error}>{error}</Text>}

      <FlatList
        data={results}
        keyExtractor={(v) => v.id}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          !loading && !error ? (
            <Text style={styles.empty}>
              Busca un artista y toca un video para reproducirlo. YouTube controla los anuncios y el video debe
              seguir visible: con la pantalla apagada se detiene.
            </Text>
          ) : null
        }
        renderItem={({ item, index: i }) => (
          <Pressable onPress={() => playIndex(i)} style={styles.row}>
            {item.thumb ? <Image source={{ uri: item.thumb }} style={styles.thumb} /> : <View style={styles.thumb} />}
            <View style={{ flex: 1 }}>
              <Text numberOfLines={2} style={[styles.title, i === index && { color: colors.accent }]}>{item.title}</Text>
              <Text numberOfLines={1} style={styles.channel}>{item.channel}</Text>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingRight: 16 },
  brand: { color: colors.accent, fontSize: 30, fontWeight: '800', paddingHorizontal: 16, paddingTop: 12 },
  small: { color: colors.sub, fontSize: 13, paddingTop: 12 },
  input: {
    backgroundColor: colors.surface, color: colors.text, marginHorizontal: 16, marginTop: 12,
    paddingHorizontal: 14, paddingVertical: 12, borderRadius: 10, fontSize: 16,
  },
  card: { backgroundColor: colors.surface, margin: 16, padding: 16, borderRadius: 12, gap: 12 },
  cardTitle: { color: colors.text, fontSize: 18, fontWeight: '700' },
  cardText: { color: colors.sub, fontSize: 14, lineHeight: 21 },
  linkBtn: { alignSelf: 'flex-start' },
  linkText: { color: colors.accent, fontWeight: '600' },
  primary: { backgroundColor: colors.accent, borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  primaryText: { color: colors.onAccent, fontWeight: '700' },
  playerWrap: { marginTop: 12 },
  nowTitle: { color: colors.text, fontWeight: '600', fontSize: 15, paddingHorizontal: 16, marginTop: 6 },
  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 36, marginVertical: 8 },
  ctrl: { color: colors.text, fontSize: 28 },
  play: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  playIcon: { color: colors.onAccent, fontSize: 22 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 8 },
  thumb: { width: 96, height: 54, borderRadius: 6, backgroundColor: colors.raised },
  title: { color: colors.text, fontSize: 15, fontWeight: '600' },
  channel: { color: colors.sub, fontSize: 12, marginTop: 2 },
  error: { color: colors.heart, textAlign: 'center', marginTop: 12, paddingHorizontal: 24, lineHeight: 21 },
  empty: { color: colors.sub, textAlign: 'center', marginTop: 32, paddingHorizontal: 32, lineHeight: 22 },
});
