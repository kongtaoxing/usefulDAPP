import { defineConfig, optimizeDeps } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
  },
  build: {
    target: ['es2020'],
  },
  optimizeDeps: {
    esbuildOptions: {
      target: ['es2020']
    }
  }
})
