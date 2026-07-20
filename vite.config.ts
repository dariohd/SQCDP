import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'SQCDP — Tableau de bord',
        short_name: 'SQCDP',
        description: 'Suivi SQCDP Sécurité Qualité Coût Délai Personnel',
        theme_color: '#3A55A4',
        background_color: '#f8fafc',
        display: 'standalone',
        lang: 'fr',
        icons: [
          { src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,ico,png,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: 'NetworkFirst',
            options: { cacheName: 'sqcdp-supabase', networkTimeoutSeconds: 8 },
          },
        ],
      },
    }),
  ],
})
