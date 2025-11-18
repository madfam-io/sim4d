import { defineConfig } from 'vite';
import type { Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { wasmPlugin } from './vite-plugin-wasm';
import { nodePolyfillsPlugin } from './vite-plugin-node-polyfills';
import { wasmAssetsPlugin } from './vite-plugin-wasm-assets';
import { wasmWorkerFixPlugin } from './vite-plugin-wasm-worker-fix';

const NODE_BUILTIN_WARNING_PATTERNS = [
  'Module "fs" has been externalized for browser compatibility',
  'Module "path" has been externalized for browser compatibility',
  'Module "url" has been externalized for browser compatibility',
];

// eslint-disable-next-line no-secrets/no-secrets -- False positive: documentation path
const OCCT_ASSET_DOC_PATH = 'docs/implementation/OCCT_ASSET_STRATEGY.md';

interface SuppressedLogDescriptor {
  onceKey: string;
  test(message: string): boolean;
  info: string;
}

const SUPPRESSED_BUILD_LOGS: SuppressedLogDescriptor[] = [
  {
    onceKey: 'occt-worker-url',
    test: (message) =>
      message.includes('../engine-occt/dist/worker.mjs') &&
      message.includes("doesn't exist at build time"),
    info: `[studio-build] Worker URL resolved at runtime via start-studio-preview (documented in ${OCCT_ASSET_DOC_PATH})`,
  },
  {
    onceKey: 'occt-wasm-url',
    test: (message) =>
      message.includes('../wasm/') && message.includes("doesn't exist at build time"),
    info: `[studio-build] OCCT wasm assets are located at runtime by wasmAssetsPlugin (see ${OCCT_ASSET_DOC_PATH})`,
  },
  {
    onceKey: 'node-polyfills',
    test: (message) => NODE_BUILTIN_WARNING_PATTERNS.some((pattern) => message.includes(pattern)),
    info: `[studio-build] Node built-in imports are redirected to browser mocks for OCCT (see ${OCCT_ASSET_DOC_PATH})`,
  },
  {
    onceKey: 'chunk-size-limit',
    test: (message) => message.includes('chunks are larger than') && message.includes('kB'),
    info: `[studio-build] Large chunks expected for CAD application with geometry engine (configured limit: 800KB)`,
  },
];

function suppressOcctWarnings(): Plugin {
  return {
    name: 'brepflow-occt-warning-filter',
    apply: 'build',
    configResolved(config) {
      const originalWarn = config.logger.warn.bind(config.logger);
      const originalWarnOnce = config.logger.warnOnce.bind(config.logger);
      const originalInfo = config.logger.info.bind(config.logger);
      const seen = new Set<string>();

      const suppress = (msg: any): boolean => {
        const text = typeof msg === 'string' ? msg : (msg?.message ?? '');
        const descriptor = SUPPRESSED_BUILD_LOGS.find((entry) => entry.test(text));

        if (descriptor) {
          if (!seen.has(descriptor.onceKey)) {
            originalInfo(descriptor.info);
            seen.add(descriptor.onceKey);
          }
          return true;
        }

        return false;
      };

      config.logger.warn = (msg, options) => {
        if (suppress(msg)) return;
        originalWarn(msg, options);
      };

      config.logger.warnOnce = (msg, options) => {
        if (suppress(msg)) return;
        originalWarnOnce(msg, options);
      };

      if (!originalConsoleWarn) {
        originalConsoleWarn = console.warn;
        console.warn = (...args: unknown[]) => {
          const text = args
            .map((value) => {
              if (typeof value === 'string') return value;
              if (value instanceof Error) return value.message;
              return '';
            })
            .join(' ');
          const descriptor = SUPPRESSED_BUILD_LOGS.find((entry) => entry.test(text));

          if (descriptor) {
            if (!seenSuppressedBuildLogs.has(descriptor.onceKey)) {
              console.info(descriptor.info);
              seenSuppressedBuildLogs.add(descriptor.onceKey);
            }
            return;
          }

          originalConsoleWarn?.apply(console, args as any);
        };
      }
    },
    buildStart() {
      // no-op; console override happens in configResolved for early transform warnings
    },
    buildEnd() {
      if (originalConsoleWarn) {
        console.warn = originalConsoleWarn;
        originalConsoleWarn = undefined;
      }
    },
    closeBundle() {
      if (originalConsoleWarn) {
        console.warn = originalConsoleWarn;
        originalConsoleWarn = undefined;
      }
    },
  };
}

let reportedWasmChunkRationale = false;
const seenSuppressedBuildLogs = new Set<string>();
let originalConsoleWarn: ((...args: unknown[]) => void) | undefined;

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    wasmWorkerFixPlugin(), // Must run first to fix worker calls in WASM files
    react({
      // Use automatic JSX runtime (no need to import React in every file)
      jsxRuntime: 'automatic',
      // Skip detection issues by explicitly including all source files
      include: '**/*.{jsx,tsx}',
    }),
    wasmPlugin(),
    nodePolyfillsPlugin(),
    wasmAssetsPlugin(),
    suppressOcctWarnings(),
  ],
  define: {
    global: 'globalThis',
  },
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
    headers: {
      // Required for SharedArrayBuffer/WASM threads
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',

      // SECURITY: Content Security Policy
      // Note: 'unsafe-inline' is allowed in development for React Fast Refresh (HMR)
      // Production builds use strict CSP without inline scripts
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'", // unsafe-inline required for React Fast Refresh in dev
        "worker-src 'self' blob:",
        "style-src 'self' 'unsafe-inline'", // unsafe-inline needed for React/CSS-in-JS
        "img-src 'self' data: blob:",
        "font-src 'self' data:",
        "connect-src 'self' ws: wss:", // WebSocket for dev server HMR
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "form-action 'self'",
      ].join('; '),

      // SECURITY: Additional security headers
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
    },
    fs: {
      // Allow serving files from the entire monorepo
      allow: [
        resolve(__dirname, '../..'), // Project root
        resolve(__dirname, '../../packages'), // Packages directory
        resolve(__dirname, '../../packages/nodes-core'), // nodes-core package
        resolve(__dirname, '../../packages/engine-core'), // engine-core package
        resolve(__dirname, '../../packages/engine-occt'), // engine-occt package
        resolve(__dirname, '../../packages/types'), // types package
        resolve(__dirname, '../../packages/viewport'), // viewport package
      ],
    },
  },
  preview: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
    headers: {
      // Required for SharedArrayBuffer/WASM threads
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',

      // SECURITY: Content Security Policy (same as dev server)
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'wasm-unsafe-eval'",
        "worker-src 'self' blob:",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: blob:",
        "font-src 'self' data:",
        "connect-src 'self' ws: wss:",
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "form-action 'self'",
      ].join('; '),

      // SECURITY: Additional security headers
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
    },
  },
  worker: {
    format: 'es',
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      // BrepFlow package aliases for monorepo - point to source index files
      '@brepflow/nodes-core': resolve(__dirname, '../../packages/nodes-core/src/index.ts'),
      '@brepflow/engine-core': resolve(__dirname, '../../packages/engine-core/src/index.ts'),
      '@brepflow/engine-occt': resolve(__dirname, '../../packages/engine-occt/src/index.ts'),
      '@brepflow/types': resolve(__dirname, '../../packages/types/src/index.ts'),
      '@brepflow/viewport': resolve(__dirname, '../../packages/viewport/src/index.ts'),
      // Polyfills
      'xxhash-wasm': resolve(__dirname, './src/polyfills/xxhash-mock.ts'),
      uuid: resolve(__dirname, './src/polyfills/uuid-mock.ts'),
      path: resolve(__dirname, './src/polyfills/path-mock.ts'),
      url: resolve(__dirname, './src/polyfills/url-mock.ts'),
      fs: resolve(__dirname, './src/polyfills/fs-mock.ts'),
      crypto: resolve(__dirname, './src/polyfills/crypto-mock.ts'),
    },
  },
  optimizeDeps: {
    exclude: ['@brepflow/engine-occt'], // Exclude WASM modules from optimization
    include: ['path', 'url', 'fs', 'crypto', 'uuid', 'xxhash-wasm'], // Force inclusion of polyfilled modules
  },
  ssr: {
    noExternal: ['path', 'url', 'fs', 'crypto', 'uuid', 'xxhash-wasm'], // Prevent externalization
  },
  build: {
    target: 'esnext',
    outDir: 'dist',
    sourcemap: true,
    chunkSizeWarningLimit: 1000, // Increase warning limit for CAD application with geometry engine (largest chunk: ~973KB)
    // @ts-expect-error - onLog is valid Vite config but not in BuildOptions type
    onLog(level, log, handler) {
      if (level === 'warn') {
        const text = typeof log === 'string' ? log : (log?.message ?? '');
        const descriptor = SUPPRESSED_BUILD_LOGS.find((entry) => entry.test(text));

        if (descriptor) {
          if (!seenSuppressedBuildLogs.has(descriptor.onceKey)) {
            console.info(descriptor.info);
            seenSuppressedBuildLogs.add(descriptor.onceKey);
          }
          return;
        }

        // Additional check for chunk size warnings in log.frame
        if (typeof log === 'object' && log !== null && 'frame' in log) {
          const frame = String(log.frame || '');
          if (frame.includes('chunks are larger than') || frame.includes('kB after minification')) {
            console.info(
              '[studio-build] Large chunks expected for CAD application with geometry engine (configured limit: 800KB)'
            );
            return;
          }
        }
      }

      handler(level, log);
    },
    rollupOptions: {
      onwarn(warning, defaultHandler) {
        const messageText = typeof warning.message === 'string' ? warning.message : '';

        // Suppress chunk size warnings - we've configured a higher limit (800KB) for CAD application
        // Rollup's default warning threshold is 500KB, but our chunks are expected to be larger
        if (warning.code === 'CHUNK_SIZE' || messageText.includes('chunks are larger than')) {
          return; // Suppress - configured limit is 800KB in chunkSizeWarningLimit
        }

        // Suppress WASM chunk warnings
        const shouldSuppressWasmChunkWarning =
          // eslint-disable-next-line no-secrets/no-secrets -- False positive: Rollup warning code constant
          ['FILE_SIZE', 'LARGE_BUNDLE', 'LARGE_DYNAMIC_IMPORT_CHUNK'].includes(
            warning.code ?? ''
          ) && messageText.includes('.wasm');

        if (shouldSuppressWasmChunkWarning) {
          if (!reportedWasmChunkRationale) {
            console.info(
              `[studio-build] OCCT wasm bundle exceeds Rollup size threshold – compression tracked in ${OCCT_ASSET_DOC_PATH}`
            );
            reportedWasmChunkRationale = true;
          }
          return;
        }

        defaultHandler(warning);
      },
      // Don't externalize - these are polyfilled/mocked
      output: {
        manualChunks: (id) => {
          // Core React dependencies
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
            return 'react-vendor';
          }

          // React Router
          if (
            id.includes('node_modules/react-router-dom/') ||
            id.includes('node_modules/@remix-run/')
          ) {
            return 'router-vendor';
          }

          // ReactFlow and its dependencies
          if (id.includes('node_modules/reactflow/') || id.includes('node_modules/@reactflow/')) {
            return 'reactflow-vendor';
          }

          // Three.js and related 3D libraries
          if (id.includes('node_modules')) {
            if (
              id.match(/[\\/]three[\\/]/) ||
              id.match(/[\\/]three-stdlib[\\/]/) ||
              id.endsWith('/three') ||
              id.endsWith('\\three')
            ) {
              return 'three-vendor';
            }
          }

          // UI animation libraries
          if (id.includes('node_modules/framer-motion/')) {
            return 'animation-vendor';
          }

          // UI component libraries
          if (
            id.includes('node_modules/@dnd-kit/') ||
            id.includes('node_modules/react-resizable-panels/') ||
            id.includes('node_modules/lucide-react/')
          ) {
            return 'ui-vendor';
          }

          // State management and utilities
          if (
            id.includes('node_modules/zustand/') ||
            id.includes('node_modules/immer/') ||
            id.includes('node_modules/comlink/')
          ) {
            return 'state-vendor';
          }

          // BrepFlow engine packages - split into separate chunks
          if (id.includes('@brepflow/engine-core')) {
            return 'engine-core';
          }

          if (id.includes('@brepflow/engine-occt')) {
            return 'engine-occt';
          }

          // BrepFlow nodes - large package, separate chunk
          if (id.includes('@brepflow/nodes-core')) {
            return 'nodes-core';
          }

          // Other BrepFlow packages
          if (id.includes('@brepflow/')) {
            return 'brepflow-vendor';
          }
        },
        // Optimize chunk names for better caching
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
            ? chunkInfo.facadeModuleId.split('/').pop()
            : 'chunk';
          return `assets/${facadeModuleId}-[hash].js`;
        },
      },
    },
  },
});
