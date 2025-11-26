import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Production-only Vite configuration
export default defineConfig({
  plugins: [react()],

  // Use production App file
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      // Force production implementations
      './App': path.resolve(__dirname, 'src/App.production.tsx'),
      './store/graph-store': path.resolve(__dirname, 'src/store/production-graph-store.ts'),
      '@sim4d/engine-occt/worker': path.resolve(
        __dirname,
        '../../packages/engine-occt/src/production-worker.ts'
      ),
    },
  },

  build: {
    outDir: 'dist-production',
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn'],
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'reactflow-vendor': ['reactflow'],
          'three-vendor': ['three'],
          'geometry-core': ['@sim4d/engine-core', '@sim4d/engine-occt'],
        },
      },
    },
    chunkSizeWarningLimit: 2000,
  },

  server: {
    headers: {
      // Required for SharedArrayBuffer (WASM threads)
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
      // Security headers
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      // CSP for production
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'wasm-unsafe-eval'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: blob:",
        "connect-src 'self' https://api.sim4d.com",
        "worker-src 'self' blob:",
        "frame-src 'none'",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        'upgrade-insecure-requests',
      ].join('; '),
    },
  },

  optimizeDeps: {
    exclude: ['@sim4d/engine-occt'],
    include: ['three', 'reactflow'],
  },

  worker: {
    format: 'es',
    rollupOptions: {
      output: {
        entryFileNames: '[name]-[hash].js',
      },
    },
  },

  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
    'process.env.ENABLE_MOCK_GEOMETRY': JSON.stringify('false'),
    'process.env.REQUIRE_REAL_OCCT': JSON.stringify('true'),
    'process.env.VALIDATE_GEOMETRY_OUTPUT': JSON.stringify('true'),
    'process.env.ENABLE_EXPORT_VALIDATION': JSON.stringify('true'),
    'process.env.LOG_LEVEL': JSON.stringify('error'),
  },

  preview: {
    headers: {
      // Same headers as dev server for preview
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
});
