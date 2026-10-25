# Coby

App de música personal hecha con React Native + Expo, para aprender desarrollo móvil.
No se distribuye ni se comercializa. Sin anuncios, reproducción continua, búsqueda, favoritos y playlists.

## Funciones
- Buscar canciones y artistas (catálogo de Audius)
- Reproducción continua: al terminar la cola se agregan canciones en tendencia
- Me gusta y playlists guardadas en el teléfono
- Cola de reproducción, mini reproductor y pantalla de reproducción completa

## Cómo ponerla a funcionar
1. Crear el proyecto base:
   ```
   npx create-expo-app@latest coby --template blank
   cd coby
   ```
2. Copiar `App.js` y la carpeta `src/` de este repositorio sobre el proyecto (reemplazando `App.js`).
3. Instalar dependencias:
   ```
   npx expo install expo-audio react-native-safe-area-context @react-native-async-storage/async-storage
   ```
4. Ejecutar:
   ```
   npx expo start
   ```
   Escanea el QR con la app **Expo Go** en tu Android.

## Subir a GitHub
```
git add .
git commit -m "Coby: primera versión"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/coby.git
git push -u origin main
```

## Estructura
- `src/api/audius.js` — búsqueda y tendencias (cambia aquí la fuente de música)
- `src/player/PlayerContext.js` — cola, reproducción y modo infinito
- `src/store/LibraryContext.js` — me gusta y playlists (AsyncStorage)
- `src/screens/` — Buscar y Tu biblioteca
- `src/components/` — filas, menú, mini reproductor, reproductor completo

## Ideas para después
- Reproducción en segundo plano con notificación (requiere build con EAS, no Expo Go)
- Aleatorio y repetir
- Reordenar canciones en playlists
- Letras, temporizador de sueño, descargas sin conexión
- Segunda fuente de música (por ejemplo Jamendo)

## Créditos
Música y API: [Audius](https://audius.co). Inspirado en la idea de [Musify](https://github.com/gokadzev/Musify) (GPL-3.0); Coby es código nuevo y no copia el de Musify.
