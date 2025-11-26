import { defineConfig, Options } from 'tsup';
import { resolve } from 'path';

/**
 * Base tsup configuration for all packages
 * Provides consistent build settings across the monorepo
 */
export const createBaseConfig = (options: Partial<Options> = {}): Options => {
  const isProduction = process.env.NODE_ENV === 'production';

  return defineConfig({
    // Entry points
    entry: ['src/index.ts'],

    // Output formats
    format: ['cjs', 'esm'],

    // TypeScript declarations
    dts: {
      resolve: true,
      compilerOptions: {
        composite: false,
        incremental: false,
      },
    },

    // Source maps for debugging
    sourcemap: true,

    // Clean output directory before build
    clean: true,

    // Minification in production
    minify: isProduction,

    // Tree shaking for smaller bundles
    treeshake: isProduction
      ? {
          moduleSideEffects: false,
          propertyReadSideEffects: false,
          tryCatchDeoptimization: false,
        }
      : false,

    // Code splitting
    splitting: false,

    // Skip node_modules bundling
    skipNodeModulesBundle: true,

    // External dependencies (to be resolved by consumer)
    external: ['react', 'react-dom', 'react/jsx-runtime'],

    // Target environment
    target: 'es2022',

    // Use shared strict TypeScript configuration
    tsconfig: resolve(__dirname, '../tsconfig.strict.json'),

    // Keep names for better debugging
    keepNames: true,

    // Shims
    shims: true,

    // Banner for license/metadata
    banner: {
      js: `/**
 * @sim4d
 * (c) ${new Date().getFullYear()} Sim4D - Mozilla Public License 2.0
 */`,
    },

    // Merge with custom options
    ...options,
  } as Options);
};

/**
 * Create configuration for library packages
 */
export const createLibraryConfig = (options: Partial<Options> = {}): Options => {
  return createBaseConfig({
    dts: {
      resolve: true,
      entry: ['src/index.ts'],
    },
    external: ['react', 'react-dom', 'react/jsx-runtime', /^@sim4d\//],
    ...options,
  });
};

/**
 * Create configuration for application packages
 */
export const createAppConfig = (options: Partial<Options> = {}): Options => {
  return createBaseConfig({
    splitting: true,
    minify: true,
    external: ['react', 'react-dom', 'react/jsx-runtime'],
    ...options,
  });
};

/**
 * Create configuration for worker packages
 */
export const createWorkerConfig = (options: Partial<Options> = {}): Options => {
  return createBaseConfig({
    format: ['esm'],
    platform: 'browser',
    target: 'es2022',
    external: [],
    ...options,
  });
};
