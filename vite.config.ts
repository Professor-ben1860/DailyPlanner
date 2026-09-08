import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig } from 'vite'

/* Auf GitHub Pages liegt die App nicht unter "/", sondern unter
   "/name-des-repositorys/". Diesen Pfad setzt die Veroeffentlichung
   automatisch als BASE_PATH - lokal bleibt es einfach "/". */
const basisPfad = process.env.BASE_PATH ?? '/'

// https://vite.dev/config/
export default defineConfig({
  base: basisPfad,
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      /* Eine neue Version wird im Hintergrund geladen und beim
         naechsten Oeffnen der App still uebernommen. */
      registerType: 'autoUpdate',

      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],

      /* Diese Angaben liest das Betriebssystem aus, wenn du die App
         zum Startbildschirm hinzufuegst. */
      manifest: {
        name: 'Daily Planner',
        short_name: 'Planner',
        description:
          'Kalender, Aufgaben, Projekte, Gewohnheiten und Notizen an einem Ort.',
        lang: 'de',
        dir: 'ltr',
        theme_color: '#000000',
        background_color: '#000000',
        display: 'standalone',
        orientation: 'portrait',
        // Punkt = "der Ordner, in dem die App liegt" - funktioniert
        // dadurch lokal und auf GitHub Pages gleichermassen
        start_url: '.',
        scope: '.',
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            // "maskable" = Android darf das Symbol rund oder eckig
            // zuschneiden, ohne dass das Haekchen abgeschnitten wird
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },

      workbox: {
        /* Diese Dateitypen werden beim ersten Besuch gespeichert.
           Danach startet die App auch ohne Internet. */
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        // Jede Adresse fuehrt zurueck auf die Startseite (Ein-Seiten-App)
        navigateFallback: 'index.html',
        cleanupOutdatedCaches: true,
      },

      /* Damit laesst sich die Offline-Faehigkeit schon beim
         Entwickeln testen (npm run dev). */
      devOptions: {
        enabled: false,
      },
    }),
  ],
})
