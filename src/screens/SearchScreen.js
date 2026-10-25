import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, ActivityIndicator, StyleSheet } from 'react-native';
import { searchTracks, trendingTracks } from '../api/audius';
import TrackList from '../components/TrackList';
import { colors } from '../theme';

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const q = query.trim();
    const timer = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const res = q.length >= 2 ? await searchTracks(q) : await trendingTracks(30);
        if (!cancelled) setTracks(res);
      } catch {
        if (!cancelled) setError('No se pudo cargar la música. Revisa tu conexión e intenta de nuevo.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, q ? 450 : 0);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  const searching = query.trim().length >= 2;

  return (
    <View style={styles.root}>
      <Text style={styles.brand}>Coby</Text>
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Busca canciones o artistas"
        placeholderTextColor={colors.sub}
        style={styles.input}
        returnKeyType="search"
        autoCorrect={false}
      />
      <Text style={styles.section}>{searching ? 'Resultados' : 'En tendencia'}</Text>
      {loading && <ActivityIndicator color={colors.accent} style={{ marginVertical: 8 }} />}
      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <TrackList tracks={tracks} emptyText={loading ? '' : 'No encontramos canciones con esa búsqueda. Prueba con otro nombre.'} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  brand: { color: colors.accent, fontSize: 30, fontWeight: '800', paddingHorizontal: 16, paddingTop: 12 },
  input: {
    backgroundColor: colors.surface,
    color: colors.text,
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    fontSize: 16,
  },
  section: { color: colors.text, fontSize: 18, fontWeight: '700', paddingHorizontal: 16, marginTop: 18, marginBottom: 4 },
  error: { color: colors.heart, textAlign: 'center', marginTop: 32, paddingHorizontal: 32, lineHeight: 22 },
});
