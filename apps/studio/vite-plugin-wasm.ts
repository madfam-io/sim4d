import { Plugin } from 'vite';
import fs from 'fs';
import path from 'path';

/**
 * Vite plugin to handle WASM files for production deployment
 * Ensures WASM files are properly copied and accessible
 */
export function wasmPlugin(): Plugin {
  return {
    name: 'wasm-handler',

    // Copy WASM files during build
    writeBundle(options, bundle) {
      const outDir = options.dir || 'dist';

      // Find all WASM files in the bundle
      const wasmFiles = Object.entries(bundle).filter(([name]) => name.endsWith('.wasm'));

      // Create wasm directory in output
      const wasmDir = path.join(outDir, 'wasm');
      if (!fs.existsSync(wasmDir)) {
        fs.mkdirSync(wasmDir, { recursive: true });
      }

      // Copy WASM files with original names for compatibility
      for (const [fileName, fileInfo] of wasmFiles) {
        if (fileInfo.type === 'asset' && fileInfo.source) {
          // Extract original name from the hashed filename
          let originalName = 'occt.wasm';
          if (fileName.includes('occt-core')) {
            originalName = 'occt-core.wasm';
          } else if (fileName.includes('occt_geometry')) {
            originalName = 'occt_geometry.wasm';
          }

          const targetPath = path.join(wasmDir, originalName);
          fs.writeFileSync(targetPath, fileInfo.source);
          console.log(`Copied WASM: ${fileName} -> wasm/${originalName}`);
        }
      }
    },

    // Handle WASM imports in development
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        // Serve WASM files with correct headers in dev
        if (req.url?.includes('.wasm')) {
          res.setHeader('Content-Type', 'application/wasm');
          res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
          res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
        }
        next();
      });
    },
  };
}
