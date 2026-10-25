import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'coby:library:v1';
const Ctx = createContext(null);
export const useLibrary = () => useContext(Ctx);

export function LibraryProvider({ children }) {
  const [state, setState] = useState({ liked: [], playlists: [] });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        if (raw) setState(JSON.parse(raw));
      } catch {}
      setLoaded(true);
    })();
  }, []);

  useEffect(() => {
    if (loaded) AsyncStorage.setItem(KEY, JSON.stringify(state)).catch(() => {});
  }, [state, loaded]);

  const isLiked = useCallback((id) => state.liked.some((t) => t.id === id), [state.liked]);

  const toggleLike = useCallback((track) => {
    setState((s) => {
      const has = s.liked.some((t) => t.id === track.id);
      return { ...s, liked: has ? s.liked.filter((t) => t.id !== track.id) : [track, ...s.liked] };
    });
  }, []);

  const createPlaylist = useCallback((name) => {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    setState((s) => ({ ...s, playlists: [...s.playlists, { id, name: name.trim(), tracks: [] }] }));
    return id;
  }, []);

  const deletePlaylist = useCallback((id) => {
    setState((s) => ({ ...s, playlists: s.playlists.filter((p) => p.id !== id) }));
  }, []);

  const addToPlaylist = useCallback((playlistId, track) => {
    setState((s) => ({
      ...s,
      playlists: s.playlists.map((p) =>
        p.id === playlistId && !p.tracks.some((t) => t.id === track.id)
          ? { ...p, tracks: [...p.tracks, track] }
          : p
      ),
    }));
  }, []);

  const removeFromPlaylist = useCallback((playlistId, trackId) => {
    setState((s) => ({
      ...s,
      playlists: s.playlists.map((p) =>
        p.id === playlistId ? { ...p, tracks: p.tracks.filter((t) => t.id !== trackId) } : p
      ),
    }));
  }, []);

  const value = {
    liked: state.liked,
    playlists: state.playlists,
    isLiked,
    toggleLike,
    createPlaylist,
    deletePlaylist,
    addToPlaylist,
    removeFromPlaylist,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
