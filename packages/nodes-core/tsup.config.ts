import type { Plugin } from 'esbuild';
import path from 'path';
import fs from 'fs';
import { createLibraryConfig } from '../../config/tsup.base.config';

/**
 * Nodes Core build configuration
 * Built-in node definitions for Sim4D
 */
const nodeExtensionResolver: Plugin = {
  name: 'generated-node-extension-resolver',
  setup(build) {
    // Override tsup's native-node-modules plugin by handling .node files first
    build.onResolve({ filter: /\.node$/ }, (args) => {
      // Skip node_modules - those are real native modules
      if (args.path.includes('node_modules')) {
        return null;
      }

      // Resolve the path relative to the importing file
      const resolvedPath = path.resolve(args.resolveDir, `${args.path}.ts`);

      // Verify the file exists
      if (fs.existsSync(resolvedPath)) {
        return {
          path: resolvedPath,
          namespace: 'file',
        };
      }

      // If not found, let other plugins handle it
      return null;
    });
  },
};

export default createLibraryConfig({
  entry: ['src/index.ts'],
  format: ['esm'], // ESM only for import.meta.url support
  dts: false, // Temporarily disable DTS generation due to TS4023 errors with generated nodes
  shims: false, // Disable ESM shims to avoid Node.js module imports
  platform: 'neutral',
  esbuildPlugins: [nodeExtensionResolver],
  // Skip the native .node module plugin that tsup adds by default
  skipNodeModulesBundle: true,
  // Override tsconfig to use DTS-specific config (disables strict checks)
  tsconfig: './tsconfig.dts.json',
  // Additional node categories can be added as entry points
  // entry: ['src/index.ts', 'src/geometry/index.ts', 'src/math/index.ts'],
});
