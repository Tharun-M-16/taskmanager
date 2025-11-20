import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    host: true, // 0.0.0.0 to allow LAN access
    port: 5177,
  },
  preview: {
    host: true,
    port: 5177,
  },
});
