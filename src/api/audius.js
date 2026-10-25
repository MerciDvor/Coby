// Fuente de música: API pública de Audius (catálogo de artistas independientes).
// Documentación: https://docs.audius.org  — no requiere clave, solo un nombre de app.
const BASE = 'https://api.audius.co/v1';
const APP_NAME = 'Coby';

function normalize(t) {
  return {
    id: String(t.id),
    title: t.title,
    artist: t.user?.name ?? 'Artista desconocido',
    artwork: t.artwork?.['480x480'] ?? t.artwork?.['150x150'] ?? null,
    duration: t.duration ?? 0,
    url: `${BASE}/tracks/${t.id}/stream?app_name=${APP_NAME}`,
  };
}

async function get(path) {
  const sep = path.includes('?') ? '&' : '?';
  const res = await fetch(`${BASE}${path}${sep}app_name=${APP_NAME}`);
  if (!res.ok) throw new Error(`Audius respondió ${res.status}`);
  const json = await res.json();
  return json.data ?? [];
}

export async function searchTracks(query) {
  const data = await get(`/tracks/search?query=${encodeURIComponent(query)}`);
  return data.filter((t) => t.is_streamable !== false).map(normalize);
}

export async function trendingTracks(limit = 20, offset = 0) {
  const data = await get(`/tracks/trending?limit=${limit}&offset=${offset}`);
  return data.filter((t) => t.is_streamable !== false).map(normalize);
}
