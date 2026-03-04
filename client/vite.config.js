import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate', // Automatically updates the app when you push new code
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'], // Add your icons here
      manifest: {
        name: 'LOBBY - Direct Ride',
        short_name: 'LOBBY',
        description: 'Connect directly with drivers. No middlemen, fair prices.',
        theme_color: '#0f172a', // This is your slate-900 color
        background_color: '#ffffff',
        display: 'standalone', // This hides the browser UI (makes it look like a real app)
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
})
