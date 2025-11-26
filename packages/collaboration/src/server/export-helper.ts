/**
 * Export Helper
 *
 * Server-side geometry export functionality
 * Reuses CLI export logic for STEP/STL generation
 */

import type { GraphInstance, ExportFormat, WorkerAPI } from '@sim4d/types';
import { GraphManager, DAGEngine } from '@sim4d/engine-core';
import { GeometryAPIFactory } from '@sim4d/engine-core/geometry-api-factory';

export interface ExportResult {
  content: string | Buffer;
  format: ExportFormat;
  size: number;
}

/**
 * Collect shape handles from evaluated graph
 */
function collectShapeHandles(graph: GraphInstance): unknown[] {
  const handles: unknown[] = [];

  for (const node of graph.nodes) {
    if (!node.outputs) continue;

    for (const [outputKey, outputValue] of Object.entries(node.outputs)) {
      if (outputValue && typeof outputValue === 'object') {
        if (
          'id' in outputValue ||
          (typeof outputValue === 'string' && /^shape[-_]/i.test(outputValue))
        ) {
          handles.push({
            nodeId: node.id,
            outputKey,
            handle: outputValue,
          });
        }
      }
    }
  }

  return handles;
}

/**
 * Export session geometry to STEP or STL format
 */
export async function exportSessionGeometry(
  graph: GraphInstance,
  format: 'step' | 'stl'
): Promise<ExportResult> {
  // Initialize geometry API
  const geometryAPI = await GeometryAPIFactory.getAPI({
    enableRetry: true,
    validateOutput: true,
  });

  // Health check
  const healthResponse = await geometryAPI.invoke('HEALTH_CHECK', {});
  const healthPayload = unwrapOperationResult<unknown>(healthResponse);

  if (!healthPayload.success || !healthPayload.result?.healthy) {
    throw new Error('Geometry engine health check failed');
  }

  // Evaluate graph
  const graphManager = new GraphManager(graph);
  const dagEngine = new DAGEngine({ worker: geometryAPI });

  const dirtyNodes = graphManager.getDirtyNodes();
  await dagEngine.evaluate(graph, dirtyNodes);

  const evaluatedGraph = graphManager.getGraph();
  const shapes = collectShapeHandles(evaluatedGraph);

  if (shapes.length === 0) {
    throw new Error('No geometry outputs found in graph');
  }

  // Use first shape for export
  const shape = shapes[0];
  let content: string | Buffer;

  switch (format) {
    case 'step':
      content = await invokeOperation<string>(geometryAPI, 'EXPORT_STEP', { shape: shape.handle });
      break;

    case 'stl':
      content = await invokeOperation<string>(geometryAPI, 'EXPORT_STL', {
        shape: shape.handle,
        binary: false,
      });
      break;

    default:
      throw new Error(`Unsupported format: ${format}`);
  }

  const size = Buffer.isBuffer(content) ? content.length : Buffer.byteLength(content, 'utf8');

  return {
    content,
    format,
    size,
  };
}

/**
 * Unwrap operation result from geometry API
 */
function unwrapOperationResult<T>(value: unknown): {
  success: boolean;
  result: T | undefined;
  error?: Error | unknown;
} {
  if (value && typeof value === 'object' && 'success' in value) {
    return {
      success: Boolean(value.success),
      result: value.result as T,
      error: value.error,
    };
  }

  return {
    success: true,
    result: value as T,
  };
}

/**
 * Invoke geometry operation with error handling
 */
async function invokeOperation<T>(
  geometryAPI: WorkerAPI,
  operation: string,
  params: unknown
): Promise<T> {
  const response = await geometryAPI.invoke(operation, params);
  const { success, result, error } = unwrapOperationResult<T>(response);

  if (!success) {
    const reason =
      error instanceof Error
        ? error.message
        : typeof error === 'string'
          ? error
          : `Operation ${operation} failed`;
    throw new Error(reason);
  }

  if (result === undefined || result === null) {
    throw new Error(`Operation ${operation} returned no result`);
  }

  return result;
}
