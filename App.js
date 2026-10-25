import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { PlayerProvider } from './src/player/PlayerContext';
import { LibraryProvider } from './src/store/LibraryContext';
import SearchScreen from './src/screens/SearchScreen';
import LibraryScreen from './src/screens/LibraryScreen';
import MiniPlayer from './src/components/MiniPlayer';
import NowPlaying from './src/components/NowPlaying';
import { colors } from './src/theme';

function Shell() {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState('search');
  const [playerOpen, setPlayerOpen] = useState(false);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />
      {/* Ambas pantallas quedan montadas para no perder la búsqueda al cambiar de pestaña */}
      <View style={[styles.content, tab !== 'search' && styles.hidden]}>
        <SearchScreen />
      </View>
      <View style={[styles.content, tab !== 'library' && styles.hidden]}>
        <LibraryScreen />
      </View>

      <MiniPlayer onOpen={() => setPlayerOpen(true)} />

      <View style={[styles.tabs, { paddingBottom: insets.bottom + 8 }]}>
        <TabButton label="Buscar" active={tab === 'search'} onPress={() => setTab('search')} />
        <TabButton label="Tu biblioteca" active={tab === 'library'} onPress={() => setTab('library')} />
      </View>

      <NowPlaying visible={playerOpen} onClose={() => setPlayerOpen(false)} />
    </View>
  );
}

function TabButton({ label, active, onPress }) {
  return (
    <Pressable onPress={onPress} style={styles.tab}>
      <Text style={[styles.tabText, active && styles.tabTextActive]}>{label}</Text>
      <View style={[styles.tabDot, active && styles.tabDotActive]} />
    </Pressable>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <LibraryProvider>
        <PlayerProvider>
          <Shell />
        </PlayerProvider>
      </LibraryProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { flex: 1 },
  hidden: { display: 'none' },
  tabs: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
  },
  tab: { flex: 1, alignItems: 'center', gap: 6 },
  tabText: { color: colors.sub, fontSize: 15, fontWeight: '600' },
  tabTextActive: { color: colors.text },
  tabDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'transparent' },
  tabDotActive: { backgroundColor: colors.accent },
});
