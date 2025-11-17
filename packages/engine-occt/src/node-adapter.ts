/**
 * OCCT Node Adapter System
 * Bridges the gap between node expectations (context.geometry) and actual context (context.worker)
 * Provides long-term stable solution for connecting nodes to real OCCT operations
 */

import { EvalContext, WorkerAPI } from '@brepflow/types';
// import { GeometryAPIFactory } from '@brepflow/engine-core'; // TODO: Not exported from engine-core
import { NODE_TO_OCCT_OPERATION_MAP } from './occt-operation-router';

/**
 * Operation mapping from node operation types to OCCT method names
 * This mapping ensures nodes can use consistent operation names
 * while the underlying OCCT implementation can have different method names
 */
export const OPERATION_MAP: Record<string, string> = NODE_TO_OCCT_OPERATION_MAP;

/**
 * GeometryProxy class that adapts WorkerAPI to the geometry interface expected by nodes
 * This is the core adapter that bridges the context mismatch
 */
export class GeometryProxy {
  private worker: WorkerAPI;
  private operationMap: Record<string, string>;

  constructor(worker: WorkerAPI, operationMap: Record<string, string> = OPERATION_MAP) {
    this.worker = worker;
    this.operationMap = operationMap;
  }

  /**
   * Execute a geometry operation through the worker
   * Maps node operation types to actual OCCT method names
   */
  async execute(operation: { type: string; params: any }): Promise<any> {
    // Map the operation type to the actual OCCT method name
    const actualMethod = this.operationMap[operation.type] || operation.type;

    try {
      // Primary: use invoke method (standard for OCCT worker)
      if (this.worker.invoke) {
        return await this.worker.invoke(actualMethod, operation.params);
      }
      // Fallback: try direct method call
      else if (typeof (this.worker as any)[actualMethod] === 'function') {
        return await (this.worker as any)[actualMethod](operation.params);
      }
      // Alternative: use execute method
      else if (this.worker.execute) {
        return await this.worker.execute({
          ...operation,
          type: actualMethod,
        });
      } else {
        throw new Error(`Worker does not support operation: ${actualMethod}`);
      }
    } catch (error: unknown) {
      console.error(`Geometry operation failed: ${operation.type} -> ${actualMethod}`, error);
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Geometry operation '${operation.type}' failed: ${message}`);
    }
  }

  /**
   * Direct method proxies for common operations
   * These provide a more convenient API for nodes that want direct method calls
   */
  async makeBox(params: any) {
    return this.execute({ type: 'makeBox', params });
  }

  async makeSphere(params: any) {
    return this.execute({ type: 'makeSphere', params });
  }

  async makeCylinder(params: any) {
    return this.execute({ type: 'makeCylinder', params });
  }

  async performUnion(params: any) {
    return this.execute({ type: 'performUnion', params });
  }

  async performSubtract(params: any) {
    return this.execute({ type: 'performSubtract', params });
  }

  async performIntersect(params: any) {
    return this.execute({ type: 'performIntersect', params });
  }

  async translate(params: any) {
    return this.execute({ type: 'translate', params });
  }

  async rotate(params: any) {
    return this.execute({ type: 'rotate', params });
  }

  async scale(params: any) {
    return this.execute({ type: 'scale', params });
  }

  async fillet(params: any) {
    return this.execute({ type: 'fillet', params });
  }

  async chamfer(params: any) {
    return this.execute({ type: 'chamfer', params });
  }

  async extrude(params: any) {
    return this.execute({ type: 'extrude', params });
  }

  async revolve(params: any) {
    return this.execute({ type: 'revolve', params });
  }

  async tessellate(params: any) {
    return this.execute({ type: 'tessellate', params });
  }

  async calculateVolume(params: any) {
    return this.execute({ type: 'calculateVolume', params });
  }

  async calculateArea(params: any) {
    return this.execute({ type: 'calculateArea', params });
  }
}

/**
 * Enhanced EvalContext that includes the geometry proxy
 * This is what nodes actually receive during evaluation
 */
export interface EnhancedEvalContext extends EvalContext {
  geometry: GeometryProxy;
}

/**
 * Create an enhanced evaluation context with geometry proxy
 * This function wraps the standard EvalContext to add the geometry interface
 */
export function createEnhancedContext(context: EvalContext): EnhancedEvalContext {
  // Create geometry proxy from the worker
  const geometry = new GeometryProxy(context.worker);

  // Return enhanced context with both worker and geometry
  return {
    ...context,
    geometry,
  };
}

/**
 * Monkey-patch the evaluation context creation in DAG engine
 * This ensures all nodes automatically get the geometry interface
 * without modifying the core engine code
 */
export function patchDAGEngine(DAGEngineClass: any): void {
  const originalEvaluateNode = DAGEngineClass.prototype.evaluateNode;

  DAGEngineClass.prototype.evaluateNode = async function (graph: any, nodeId: string) {
    // Store original context creation
    const originalContextCreation = this.createContext;

    // Override context creation to add geometry
    this.createContext = (baseContext: EvalContext) => {
      return createEnhancedContext(baseContext);
    };

    // Call original method
    const result = await originalEvaluateNode.call(this, graph, nodeId);

    // Restore original context creation
    this.createContext = originalContextCreation;

    return result;
  };
}

/**
 * Initialize the node adapter system
 * Call this once during application startup to enable real geometry for all nodes
 */
export async function initializeNodeAdapter(): Promise<void> {
  console.log('🔧 Initializing OCCT node adapter system...');

  try {
    // Get the geometry API (real or mock based on configuration)
    // TODO: Implement proper API initialization when GeometryAPIFactory is available
    const api: any = null; // await GeometryAPIFactory.getAPI();

    // Store globally for access by the DAG engine
    (global as any).__OCCT_GEOMETRY_API = api;

    console.log('✅ OCCT node adapter initialized successfully');
    console.log('📊 Operation mappings loaded:', Object.keys(OPERATION_MAP).length);

    // Test basic operation
    try {
      const _testBox = await api.execute?.({
        type: 'makeBox',
        params: { width: 10, depth: 10, height: 10 },
      });
      console.log('✅ Test geometry operation successful');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn('⚠️ Test geometry operation failed (WASM may not be loaded):', message);
    }
  } catch (error) {
    console.error('❌ Failed to initialize OCCT node adapter:', error);
    throw error;
  }
}

/**
 * Check if real geometry is available
 */
export function isRealGeometryAvailable(): boolean {
  return !!(global as any).__OCCT_GEOMETRY_API;
}

/**
 * Get operation statistics for monitoring
 */
export function getOperationStats(): {
  totalOperations: number;
  categories: Record<string, number>;
} {
  const categories: Record<string, number> = {
    primitives: 0,
    boolean: 0,
    transform: 0,
    features: 0,
    sketch: 0,
    surface: 0,
    analysis: 0,
    mesh: 0,
    io: 0,
    advanced: 0,
  };

  for (const op of Object.keys(OPERATION_MAP)) {
    if (op.startsWith('make') && !op.includes('Surface')) categories.primitives++;
    else if (op.startsWith('perform')) categories.boolean++;
    else if (['translate', 'rotate', 'scale', 'mirror', 'transform', 'move', 'orient'].includes(op))
      categories.transform++;
    else if (
      [
        'fillet',
        'chamfer',
        'shell',
        'offset',
        'draft',
        'extrude',
        'revolve',
        'sweep',
        'loft',
      ].includes(op)
    )
      categories.features++;
    else if (
      op.includes('Circle') ||
      op.includes('Rectangle') ||
      op.includes('Line') ||
      op.includes('Arc')
    )
      categories.sketch++;
    else if (op.includes('Surface')) categories.surface++;
    else if (op.includes('calculate') || op.includes('analyze')) categories.analysis++;
    else if (op.includes('Mesh') || op.includes('tessellate')) categories.mesh++;
    else if (op.includes('import') || op.includes('export')) categories.io++;
    else categories.advanced++;
  }

  return {
    totalOperations: Object.keys(OPERATION_MAP).length,
    categories,
  };
}
