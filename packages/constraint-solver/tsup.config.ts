import { createLibraryConfig } from '../../config/tsup.base.config';

/**
 * Constraint Solver build configuration
 * 2D/3D parametric constraint solving for CAD operations
 */
export default createLibraryConfig({
  entry: ['src/index.ts'],
  dts: true, // Generate TypeScript declaration files
  external: ['@brepflow/types', 'kiwi.js'],
  tsconfig: './tsconfig.json', // Use local tsconfig instead of strict
});
