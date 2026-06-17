
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'KeysKingdom: Arcane Architect',
        short_name: 'KeysKingdom',
        description: 'Forge a magical kingdom, manage ancient mana, and grow your village under the guidance of the Keeper of Keys.',
        start_url: '.',
        display: 'standalone',
        background_color: '#0c0a09',
        theme_color: '#f59e0b',
        orientation: 'any',
        icons: [
          {
            src: 'https://cdn-icons-png.flaticon.com/512/3721/3721591.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'https://cdn-icons-png.flaticon.com/512/3721/3721591.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.hostname.includes('generativelanguage.googleapis.com'),
            handler: 'NetworkOnly',
          },
          {
            urlPattern: ({ url }) => 
              url.hostname.includes('cdn.tailwindcss.com') || 
              url.hostname.includes('cdn-icons-png.flaticon.com') ||
              url.hostname.includes('aistudiocdn.com'),
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'external-resources',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 Days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ]
});
