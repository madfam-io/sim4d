import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'server/index': 'src/server/index.ts',
    'server/standalone-server': 'src/server/standalone-server.ts',
    'client/index': 'src/client/index.ts',
  },
  format: ['cjs', 'esm'],
  dts: false, // Temporarily disabled - type issues with project file list
  splitting: false,
  sourcemap: true,
  clean: true,
  external: [
    'react',
    'react-dom',
    'ws',
    'y-websocket',
    'yjs',
    'uuid',
    'socket.io',
    'socket.io-client',
    'express', // Standalone server dependency
    'cors', // Standalone server dependency
    '@brepflow/engine-core', // Has Node.js modules (path, url, fs)
    '@brepflow/types', // Type-only package, no need to bundle
  ],
  tsconfig: 'tsconfig.json',
});
