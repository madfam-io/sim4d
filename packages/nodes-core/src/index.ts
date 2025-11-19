// TODO: Fix NodeDefinition type mismatches, error type assertions, and duplicate exports
import { NodeRegistry } from '@brepflow/engine-core';

// Import core node definitions (only existing files)
import { sketchNodes } from './sketch';
import { parametricSketchNodes } from './sketch-parametric';
import { solidNodes } from './solid';
import { booleanNodes } from './boolean';
import { featureNodes } from './features';
import { transformNodes } from './transform';
import { ioNodes } from './io';
import { curveNodes } from './curves';
import { surfaceNodes } from './surfaces';
import { dataNodes } from './data';
import { analysisNodes } from './analysis';
import { assemblyNodes } from './assembly';
import { advancedSurfaceNodes } from './advanced-surfaces';
import { simulationNodes } from './simulation';
import * as advancedFilletNodes from './advanced-fillets';
import * as sheetMetalNodes from './sheet-metal';
import { advancedAssemblyNodes } from './assembly-advanced';

// Import enhanced registry system
import { EnhancedNodeRegistry } from './registry/enhanced-node-registry';
import { initializeNodeRegistry, getRegistryStatus } from './registry/node-discovery';

// Register all core nodes (legacy method)
export function registerCoreNodes(): void {
  const registry = NodeRegistry.getInstance();

  registry.registerNodes([
    ...sketchNodes,
    ...parametricSketchNodes,
    ...solidNodes,
    ...booleanNodes,
    ...featureNodes,
    ...transformNodes,
    ...ioNodes,
    ...curveNodes,
    ...surfaceNodes,
    ...dataNodes,
    ...analysisNodes,
    ...assemblyNodes,
    ...advancedSurfaceNodes,
    ...advancedAssemblyNodes,
    ...simulationNodes,
    ...Object.values(advancedFilletNodes),
    ...Object.values(sheetMetalNodes),
  ]);
}

// Enhanced registration with all 1012+ nodes
export async function registerAllNodes(): Promise<EnhancedNodeRegistry> {
  console.log('🚀 Registering all 1012+ nodes with enhanced registry...');

  // Initialize enhanced registry with all generated nodes
  console.log('🔍 DEBUG: About to call initializeNodeRegistry...');
  const enhancedRegistry = await initializeNodeRegistry();
  console.log('🔍 DEBUG: initializeNodeRegistry returned:', enhancedRegistry);
  console.log('🔍 DEBUG: typeof enhancedRegistry:', typeof enhancedRegistry);
  console.log('🔍 DEBUG: enhancedRegistry is null?', enhancedRegistry === null);
  console.log('🔍 DEBUG: enhancedRegistry is undefined?', enhancedRegistry === undefined);

  if (!enhancedRegistry) {
    console.error('❌ DEBUG: enhancedRegistry is null/undefined!');
    throw new Error('initializeNodeRegistry returned null/undefined');
  }

  console.log('🔍 DEBUG: initializeNodeRegistry completed successfully');

  // Also register legacy nodes for backward compatibility
  console.log('🔍 DEBUG: About to create legacyNodes array...');
  const legacyNodes = [
    ...sketchNodes,
    ...solidNodes,
    ...booleanNodes,
    ...featureNodes,
    ...transformNodes,
    ...ioNodes,
  ];
  console.log(`🔍 DEBUG: Created legacyNodes array with ${legacyNodes.length} nodes`);

  console.log('🔍 DEBUG: About to call enhancedRegistry.registerNodes...');
  console.log(
    '🔍 DEBUG: enhancedRegistry.registerNodes exists?',
    typeof enhancedRegistry.registerNodes
  );

  // Fix legacy nodes: convert 'id' property to 'type' property for EnhancedNodeRegistry compatibility
  console.log('🔍 DEBUG: Converting legacy nodes from id to type...');
  const fixedLegacyNodes = legacyNodes.map((node) => {
    if (node && (node as unknown).id && !node.type) {
      return { ...node, type: (node as unknown).id };
    }
    return node;
  });
  console.log(`🔍 DEBUG: Fixed ${fixedLegacyNodes.length} legacy nodes`);

  try {
    enhancedRegistry.registerNodes(fixedLegacyNodes);
    console.log('🔍 DEBUG: enhancedRegistry.registerNodes completed');
  } catch (error) {
    console.error('❌ DEBUG: enhancedRegistry.registerNodes failed:', error);
    console.error('❌ DEBUG: Error message:', error.message);
    console.error('❌ DEBUG: Error stack:', error.stack);
    throw error;
  }

  console.log('🔍 DEBUG: About to call getRegistryStatus...');
  const status = getRegistryStatus();
  console.log(`✅ Enhanced registry initialized with ${status.nodeCount} total nodes`);

  console.log('🔍 DEBUG: About to return enhancedRegistry');
  return enhancedRegistry;
}

// Get the enhanced registry instance
export function getEnhancedRegistry(): EnhancedNodeRegistry {
  return EnhancedNodeRegistry.getInstance();
}

// Export individual node categories (only existing modules)
export * from './sketch';
export * from './sketch-parametric';
export * from './solid';
export * from './boolean';
export * from './features';
export * from './transform';
export * from './io';
export * from './curves';
export * from './surfaces';
export * from './data';
export * from './analysis';
export * from './assembly';
export * from './advanced-surfaces';
export * from './simulation';
export * from './assembly-advanced';

// Export enhanced registry system
export * from './registry/enhanced-node-registry';
export * from './registry/node-discovery';

// Export curated node catalog
export * from './catalog';
