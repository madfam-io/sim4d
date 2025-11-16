import { createBaseConfig } from '../../config/tsup.base.config';

/**
 * CLI build configuration
 * Node.js headless runner for batch processing
 */
export default createBaseConfig({
  format: ['esm'],
  platform: 'node',
  target: 'node20',
  dts: {
    resolve: true,
    entry: ['src/index.ts'],
  },
  splitting: false,
  sourcemap: true,
  tsconfig: './tsconfig.json', // Use local tsconfig instead of strict
});
