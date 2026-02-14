import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  // CHANGE THIS: Django needs to see /static/ in the file paths
  base: '/static/', 
  
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // This ensures the service worker is created at the root of the build
      injectRegister: 'auto', 
      manifest: {
        name: "PTMS",
        short_name: "PTMS",
        // CHANGE THIS: PWA starts at the root, not inside /static/
        start_url: "/", 
        display: "standalone",
        theme_color: "#0d6efd",
        background_color: "#ffffff",
        icons: [
          {
            src: "icons/icon-512.png", // Paths are relative to the 'public' folder
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "icons/icon-512.png",
            sizes: "512x512",
            type: "image/png"
          },
          {
            src: "icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable"
          }
        ]
      },
      workbox: {
        // This ensures all your static assets are cached for offline use
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === 'document',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'html-cache',
            }
          }
        ]
      }
    })
  ],
  server: {
    port: 5173,
    allowedHosts: [
      'monetary-sherell-unrecondite.ngrok-free.dev'
    ]
  }
})