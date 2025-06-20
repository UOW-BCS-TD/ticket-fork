import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/',
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
    allowedHosts: [
      'elvificent.com',
      'www.elvificent.com',
      'localhost'
    ],
    hmr: {
      clientPort: 80,
      protocol: 'ws'
    },
    proxy: {
      '/api': {
        target: 'http://localhost:8082',
        changeOrigin: true,
        secure: false
      },
      '/chatapi': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      }
    }
  }
});
