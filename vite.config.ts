/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'


// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Cognito redirect URIs in .env.local are pinned to :5173. Without this a
    // second dev server silently takes 5174 and auth fails at the redirect.
    port: 5173,
    strictPort: true,
  },
  build: {
    rolldownOptions: {
      output: {
        advancedChunks: {
          groups: [{ name: 'oidc', test: /node_modules[\\/]oidc-client-ts[\\/]/ }],
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
  },
})
