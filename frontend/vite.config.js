import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: false,
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (id.includes('@supabase/supabase-js')) return 'supabase';
          if (id.includes('axios')) return 'http';
          if (
            id.includes('react/') ||
            id.includes('react-dom/') ||
            id.includes('react-router-dom/')
          ) {
            return 'react';
          }
          return 'vendor';
        },
      },
    },
  },
})
