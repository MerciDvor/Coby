import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { trendingTracks } from '../api/audius';

const Ctx = createContext(null);
export const usePlayer = () => useContext(Ctx);

export function PlayerProvider({ children }) {
  const playerRef = useRef(null);
  const queueRef = useRef([]);
  const indexRef = useRef(-1);
  const nextRef = useRef(() => {});
  const loadingMoreRef = useRef(false);

  const [queue, setQueue] = useState([]);
  const [index, setIndex] = useState(-1);
  const [status, setStatus] = useState({ playing: false, currentTime: 0, duration: 0 });

  const playAt = useCallback((i, list = queueRef.current) => {
    const track = list[i];
    if (!track) return;
    queueRef.current = list;
    indexRef.current = i;
    setQueue(list);
    setIndex(i);
    const p = playerRef.current;
    p.replace({ uri: track.url });
    p.play();
    try {
      p.setActiveForLockScreen(true, {
        title: track.title,
        artist: track.artist,
        artworkUrl: track.artwork ?? undefined,
      });
    } catch {}
  }, []);

  // Modo infinito: al terminar la cola se agregan canciones en tendencia.
  const next = useCallback(async () => {
    const list = queueRef.current;
    const i = indexRef.current;
    if (i + 1 < list.length) {
      playAt(i + 1);
      return;
    }
    if (loadingMoreRef.current) return;
    loadingMoreRef.current = true;
    try {
      const offset = Math.floor(Math.random() * 100);
      const more = await trendingTracks(20, offset);
      const seen = new Set(list.map((t) => t.id));
      const fresh = more.filter((t) => !seen.has(t.id));
      if (fresh.length) playAt(list.length, [...list, ...fresh]);
    } catch {}
    loadingMoreRef.current = false;
  }, [playAt]);
  nextRef.current = next;

  useEffect(() => {
    setAudioModeAsync({ playsInSilentMode: true, shouldPlayInBackground: true }).catch(() => {});
    const player = createAudioPlayer(null);
    playerRef.current = player;
    const sub = player.addListener('playbackStatusUpdate', (s) => {
      setStatus({ playing: s.playing, currentTime: s.currentTime, duration: s.duration });
      if (s.didJustFinish) nextRef.current();
    });
    return () => {
      sub.remove();
      player.remove();
    };
  }, []);

  const playTracks = useCallback((tracks, startIndex = 0) => playAt(startIndex, tracks), [playAt]);

  const addToQueue = useCallback(
    (track) => {
      const list = queueRef.current;
      if (list.length === 0) return playAt(0, [track]);
      const updated = [...list, track];
      queueRef.current = updated;
      setQueue(updated);
    },
    [playAt]
  );

  const prev = useCallback(() => {
    const p = playerRef.current;
    if (p.currentTime > 3 || indexRef.current <= 0) {
      p.seekTo(0);
    } else {
      playAt(indexRef.current - 1);
    }
  }, [playAt]);

  const toggle = useCallback(() => {
    const p = playerRef.current;
    if (p.playing) p.pause();
    else p.play();
  }, []);

  const seek = useCallback((seconds) => {
    playerRef.current?.seekTo(Math.max(0, seconds));
  }, []);

  const value = {
    queue,
    index,
    currentTrack: queue[index] ?? null,
    status,
    playTracks,
    addToQueue,
    next,
    prev,
    toggle,
    seek,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
