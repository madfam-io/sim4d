import { createLibraryConfig } from '../../config/tsup.base.config';

/**
 * Viewport build configuration
 * Three.js-based 3D rendering and interaction
 */
export default createLibraryConfig({
  entry: ['src/index.ts'],
  external: [
    'react',
    'react-dom',
    'three',
    '@react-three/fiber',
    '@react-three/drei',
    /^@brepflow\//,
  ],
});
