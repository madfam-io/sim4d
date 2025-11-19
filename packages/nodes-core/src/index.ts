// NOTE: Known type system issues - NodeDefinition mismatches and duplicate exports (non-blocking).
// See packages/types for branded type requirements and registry type definitions.
import { NodeRegistry, createLogger } from '@brepflow/engine-core';

const logger = createLogger('NodesCore');

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
  logger.info('🚀 Registering all 1012+ nodes with enhanced registry...');

  // Initialize enhanced registry with all generated nodes
  logger.info('🔍 DEBUG: About to call initializeNodeRegistry...');
  const enhancedRegistry = await initializeNodeRegistry();
  logger.info('🔍 DEBUG: initializeNodeRegistry returned:', enhancedRegistry);
  logger.info('🔍 DEBUG: typeof enhancedRegistry:', typeof enhancedRegistry);
  logger.info('🔍 DEBUG: enhancedRegistry is null?', enhancedRegistry === null);
  logger.info('🔍 DEBUG: enhancedRegistry is undefined?', enhancedRegistry === undefined);

  if (!enhancedRegistry) {
    logger.error('❌ DEBUG: enhancedRegistry is null/undefined!');
    throw new Error('initializeNodeRegistry returned null/undefined');
  }

  logger.info('🔍 DEBUG: initializeNodeRegistry completed successfully');

  // Also register legacy nodes for backward compatibility
  logger.info('🔍 DEBUG: About to create legacyNodes array...');
  const legacyNodes = [
    ...sketchNodes,
    ...solidNodes,
    ...booleanNodes,
    ...featureNodes,
    ...transformNodes,
    ...ioNodes,
  ];
  logger.info(`🔍 DEBUG: Created legacyNodes array with ${legacyNodes.length} nodes`);

  logger.info('🔍 DEBUG: About to call enhancedRegistry.registerNodes...');
  logger.info(
    '🔍 DEBUG: enhancedRegistry.registerNodes exists?',
    typeof enhancedRegistry.registerNodes
  );

  // Fix legacy nodes: convert 'id' property to 'type' property for EnhancedNodeRegistry compatibility
  logger.info('🔍 DEBUG: Converting legacy nodes from id to type...');
  const fixedLegacyNodes = legacyNodes.map((node) => {
    if (node && (node as unknown).id && !node.type) {
      return { ...node, type: (node as unknown).id };
    }
    return node;
  });
  logger.info(`🔍 DEBUG: Fixed ${fixedLegacyNodes.length} legacy nodes`);

  try {
    enhancedRegistry.registerNodes(fixedLegacyNodes);
    logger.info('🔍 DEBUG: enhancedRegistry.registerNodes completed');
  } catch (error) {
    logger.error('❌ DEBUG: enhancedRegistry.registerNodes failed:', error);
    logger.error('❌ DEBUG: Error message:', error.message);
    logger.error('❌ DEBUG: Error stack:', error.stack);
    throw error;
  }

  logger.info('🔍 DEBUG: About to call getRegistryStatus...');
  const status = getRegistryStatus();
  logger.info(`✅ Enhanced registry initialized with ${status.nodeCount} total nodes`);

  logger.info('🔍 DEBUG: About to return enhancedRegistry');
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
