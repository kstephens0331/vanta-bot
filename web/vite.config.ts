import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import autoprefixer from 'autoprefixer';

// Vite 7-compatible config
export default defineConfig({
  plugins: [react()],
  css: {
    // Inline PostCSS so it doesn't search for package.json / .postcssrc
    postcss: {
      plugins: [autoprefixer()],
    },
  },
  build: {
    outDir: 'dist',
  },
});
