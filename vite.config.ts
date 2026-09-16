import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/Consumer-Loyalty-Program-Web-Application/',
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
