import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    postcss: './postcss.config.mjs',
  },
  build: {
    outDir: 'dist',
    cssCodeSplit: false, // Single CSS file for better caching
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          // Ensure CSS files have consistent naming
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return 'assets/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        },
      },
    },
  },
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
