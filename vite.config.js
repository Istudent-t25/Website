// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import tailwindcss from '@tailwindcss/vite'
import path from "path";
 
export default defineConfig({
   resolve: {
    alias: { "@": path.resolve(__dirname, "src") }
  },
   server: {
    proxy: {
      // Dev proxy: anything starting with /api/v1 goes to your API origin
      "/api/v1": {
        target: "https://api.studentkrd.com",
        changeOrigin: true,
        secure: true, // set to false only if you use a self-signed cert
      },
    },
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.ico', 'robots.txt', 'apple-touch-icon.png',
        'icons/pwa-192.png', 'icons/pwa-512.png', 'icons/maskable-512.png',
        'screenshots/desktop-1280x720.png', 'screenshots/mobile-720x1280.png'
      ],
      manifest: {
        name: 'iStudent',
        short_name: 'iStudent',
        description: 'Books, booklets, videos, papers — all in one place.',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#0ea5e9',
        icons: [
          { src: '/icons/pwa-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icons/pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
        ],
        screenshots: [
          {
            src: '/screenshots/deskstop-1280x720.png', // Corrected path
            sizes: '1280x720',
            type: 'image/png',
            form_factor: 'wide'
          },
          {
            src: '/screenshots/mobisle-720x1280.png', // Corrected path
            sizes: '720x1280',
            type: 'image/png',
            form_factor: 'narrow'
          }
        ]
      },
      devOptions: {
        enabled: true // Important for testing in development
      }
    })
  ]
})