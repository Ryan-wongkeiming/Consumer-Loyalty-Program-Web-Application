import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/Consumer-Loyalty-Program-Web-Application/',
  plugins: [
    react(),
    // GitHub Pages SPA fallback: copy the built index.html to 404.html so
    // deep links (e.g. /womens-health) render the app instead of a 404 page.
    // GitHub Pages serves 404.html for any unmatched path.
    {
      name: 'gh-pages-404-fallback',
      closeBundle() {
        const distDir = fileURLToPath(new URL('./dist', import.meta.url));
        const html = readFileSync(`${distDir}/index.html`, 'utf8');
        writeFileSync(`${distDir}/404.html`, html, 'utf8');
      },
    },
  ],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
