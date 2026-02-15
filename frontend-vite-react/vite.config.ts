import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import wasm from 'vite-plugin-wasm'
import topLevelAwait from 'vite-plugin-top-level-await'

export default defineConfig({
  plugins: [
    wasm(),
    topLevelAwait(),
    react()
  ],
  server: {
    port: 5173,
    strictPort: false
  },
  optimizeDeps: {
    exclude: ['@midnight-ntwrk/midnight-js-types']
  }
})
