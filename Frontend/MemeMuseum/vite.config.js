import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  css: {
    devSourcemap: false,
  },
  build: {
    sourcemap: false,
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: ['mememuseum.duckdns.org', 'localhost'],
    historyApiFallback: true,
  },
  preview: {
    headers: {
      'Cache-Control': 'public, max-age=31536000',
    },
  },
});
