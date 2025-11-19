import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';
import type { GraphInstance, ExportFormat, WorkerAPI } from '@brepflow/types';
import { GraphManager, DAGEngine, GeometryEvaluationError } from '@brepflow/engine-core';
import { GeometryAPIFactory } from '@brepflow/engine-core/geometry-api-factory';
import { registerCoreNodes } from '@brepflow/nodes-core';

export const SUPPORTED_FORMATS: ExportFormat[] = [
  'step',
  'iges',
  'stl',
  'obj',
  '3dm',
  'gltf',
  'usd',
];

export type ShapeCandidate = {
  nodeId: string;
  outputKey: string;
  handle: any;
  index: number;
  label: string;
};

export type ExportRecord = {
  format: ExportFormat;
  filename: string;
  filepath: string;
  size: number;
  nodeId: string;
};

export const renderCommand = new Command('render')
  .description('Render a BrepFlow graph and export results')
  .argument('<graph>', 'path to .bflow.json graph file')
  .option('-o, --out <dir>', 'output directory', './output')
  .option('-e, --export <formats>', 'export formats (step,stl,obj)', 'step,stl')
  .option('-s, --set <params...>', 'set parameter values (e.g., --set L=120 W=80)')
  .option('--quality <level>', 'tessellation quality (low,medium,high)', 'medium')
  .option('--hash', 'include content hash in filenames')
  .option('--manifest', 'generate manifest.json with metadata')
  .action(async (graphPath, options) => {
    const spinner = ora('Loading graph...').start();

    try {
      // Check if graph file exists
      if (!(await fs.pathExists(graphPath))) {
        spinner.fail(`Graph file not found: ${graphPath}`);
        process.exit(1);
      }

      // Load graph
      // eslint-disable-next-line security/detect-non-literal-fs-filename -- CLI argument, validated by commander
      const graphContent = await fs.readFile(graphPath, 'utf-8');
      const graph: GraphInstance = JSON.parse(graphContent);
      spinner.succeed('Graph loaded');

      // Register core nodes
      registerCoreNodes();

      // Apply parameter overrides
      if (options.set) {
        spinner.start('Applying parameters...');
        applyParameters(graph, options.set);
        spinner.succeed('Parameters applied');
      }

      // Initialize geometry API
      spinner.start('Initializing geometry engine...');
      const geometryAPI = await GeometryAPIFactory.getAPI({
        enableRetry: true,
        retryAttempts: 2,
        validateOutput: true,
      });
      const healthPayload = unwrapOperationResult<unknown>(
        await geometryAPI.invoke('HEALTH_CHECK', {})
      );
      if (!healthPayload.success || !healthPayload.result?.healthy) {
        throw new Error('OCCT health check failed');
      }
      spinner.succeed('Geometry engine initialized');

      // Create graph manager and DAG engine
      const graphManager = new GraphManager(graph);
      const dagEngine = new DAGEngine({
        worker: geometryAPI,
      });

      // Evaluate graph
      spinner.start('Evaluating graph...');
      const startTime = Date.now();

      const dirtyNodes = graphManager.getDirtyNodes();
      await dagEngine.evaluate(graph, dirtyNodes);

      const evalTime = Date.now() - startTime;
      spinner.succeed(`Graph evaluated in ${evalTime}ms`);

      const summary = dagEngine.getEvaluationSummary();
      if (summary && summary.sampleCount > 0) {
        spinner.info(
          `Evaluation metrics — p95: ${summary.p95Ms.toFixed(0)}ms (${summary.sampleCount} nodes, failures: ${summary.failureCount})`
        );
      }

      const evaluatedGraph = graphManager.getGraph();
      const shapeHandles = collectShapeHandles(evaluatedGraph);

      if (shapeHandles.length === 0) {
        throw new Error('No geometry outputs detected in the evaluated graph');
      }

      // Create output directory
      const outputDir = path.resolve(options.out);
      await fs.ensureDir(outputDir);

      // Export results
      const { formats, rejected } = resolveFormats(options.export);
      const exportResults: ExportRecord[] = [];

      if (rejected.length > 0) {
        console.warn(chalk.yellow(`Skipping unsupported formats: ${rejected.join(', ')}`));
      }

      for (const format of formats) {
        spinner.start(`Exporting ${format.toUpperCase()}...`);

        try {
          const results = await exportFormat(
            evaluatedGraph,
            format,
            outputDir,
            options,
            geometryAPI,
            shapeHandles
          );
          exportResults.push(...results);
          spinner.succeed(
            `Exported ${results.length} ${format.toUpperCase()} file${results.length === 1 ? '' : 's'}`
          );
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          spinner.warn(`Failed to export ${format}: ${errorMessage}`);
        }
      }

      if (exportResults.length === 0) {
        spinner.fail('No exports were generated');
        process.exit(1);
      }

      // Generate manifest if requested
      if (options.manifest) {
        spinner.start('Generating manifest...');
        const manifest = {
          graph: path.basename(graphPath),
          timestamp: new Date().toISOString(),
          units: graph.units,
          tolerance: graph.tolerance,
          parameters: options.set || [],
          exports: exportResults,
          evaluationTime: evalTime,
        };

        await fs.writeJson(path.join(outputDir, 'manifest.json'), manifest, { spaces: 2 });
        spinner.succeed('Manifest generated');
      }

      console.log(chalk.green('\n✅ Rendering complete!'));
      console.log(chalk.gray(`Output directory: ${outputDir}`));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      spinner.fail(`Error: ${errorMessage}`);

      if (error instanceof GeometryEvaluationError) {
        const details = {
          nodeId: error.nodeId,
          nodeType: error.nodeType,
          durationMs: error.durationMs,
          code: error.code,
          params: error.params,
        };
        console.error(chalk.red('Geometry evaluation failed:'), details);
      } else if (options.verbose) {
        console.error(error);
      }
      process.exit(1);
    }
  });

/**
 * Apply parameter overrides to graph
 */
export function applyParameters(graph: GraphInstance, params: string[]): void {
  const paramMap = new Map<string, unknown>();

  // Parse parameters
  for (const param of params) {
    const [key, value] = param.split('=');
    if (key && value) {
      // Try to parse as number
      const numValue = parseFloat(value);
      paramMap.set(key, isNaN(numValue) ? value : numValue);
    }
  }

  // Apply to nodes
  for (const node of graph.nodes) {
    for (const [paramName, paramValue] of Object.entries(node.params || {})) {
      // Check for global parameter reference (e.g., @L, @W)
      if (typeof paramValue === 'string' && paramValue.startsWith('@')) {
        const globalName = paramValue.substring(1);
        if (paramMap.has(globalName)) {
          node.params[paramName] = paramMap.get(globalName);
          node.dirty = true;
        }
      }
      // Check for direct parameter match
      else if (paramMap.has(`${node.id}.${paramName}`)) {
        node.params[paramName] = paramMap.get(`${node.id}.${paramName}`);
        node.dirty = true;
      }
    }
  }
}

export function resolveFormats(value: string): { formats: ExportFormat[]; rejected: string[] } {
  const requested = value
    .split(',')
    .map((fmt: string) => fmt.trim().toLowerCase())
    .filter(Boolean);

  const formats: ExportFormat[] = [];
  const rejected: string[] = [];
  const seen = new Set<string>();

  for (const item of requested) {
    if (seen.has(item)) continue;
    seen.add(item);

    if (SUPPORTED_FORMATS.includes(item as ExportFormat)) {
      formats.push(item as ExportFormat);
    } else {
      rejected.push(item);
    }
  }

  if (formats.length === 0) {
    formats.push('step');
  }

  return { formats, rejected };
}

export function collectShapeHandles(graph: GraphInstance): ShapeCandidate[] {
  const results: ShapeCandidate[] = [];
  const seen = new Set<string>();
  let index = 0;

  const visit = (value: unknown, nodeId: string, outputKey: string) => {
    if (value == null) {
      return;
    }

    if (Array.isArray(value)) {
      for (const entry of value) {
        visit(entry, nodeId, outputKey);
      }
      return;
    }

    if (typeof value === 'string') {
      if (/^shape[-_]/i.test(value) && !seen.has(value)) {
        seen.add(value);
        results.push({
          nodeId,
          outputKey,
          handle: value,
          index: index++,
          label: `${nodeId}:${outputKey}`,
        });
      }
      return;
    }

    if (typeof value === 'object') {
      if (typeof value.id === 'string') {
        if (!seen.has(value.id)) {
          seen.add(value.id);
          results.push({
            nodeId,
            outputKey,
            handle: value,
            index: index++,
            label: `${nodeId}:${outputKey}`,
          });
        }
      }

      for (const nested of Object.values(value)) {
        visit(nested, nodeId, outputKey);
      }
    }
  };

  for (const node of graph.nodes) {
    if (!node.outputs) continue;
    for (const [outputKey, outputValue] of Object.entries(node.outputs)) {
      visit(outputValue, node.id, outputKey);
    }
  }

  return results;
}

function sanitizeFileStem(stem: string): string {
  return (
    stem
      .replace(/[^a-z0-9_-]+/gi, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .toLowerCase() || 'shape'
  );
}

function slugFromHandle(handle: any): string {
  if (handle && typeof handle === 'object') {
    if (typeof handle.hash === 'string') {
      return sanitizeFileStem(handle.hash).slice(0, 8);
    }
    if (typeof handle.id === 'string') {
      return sanitizeFileStem(handle.id).slice(0, 8);
    }
  }
  if (typeof handle === 'string') {
    return sanitizeFileStem(handle).slice(0, 8);
  }
  return Math.random().toString(36).slice(2, 10);
}

function buildFileName(shape: ShapeCandidate, format: string, includeHash: boolean): string {
  const stem = sanitizeFileStem(`${shape.nodeId}-${shape.outputKey}-${shape.index + 1}`);
  const hash = includeHash ? slugFromHandle(shape.handle) : '';
  return `${stem}${hash ? `-${hash}` : ''}.${format}`;
}

export function unwrapOperationResult<T>(value: unknown): {
  success: boolean;
  result: T | undefined;
  error?: Error | unknown;
} {
  if (value && typeof value === 'object' && 'success' in value) {
    return {
      success: Boolean((value as unknown).success),
      result: (value as unknown).result as T,
      error: (value as unknown).error,
    };
  }

  return {
    success: true,
    result: value as T,
  };
}

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

/**
 * Export graph in specified format
 */
export async function exportFormat(
  graph: GraphInstance,
  format: ExportFormat,
  outputDir: string,
  options: { hash?: boolean },
  geometryAPI: WorkerAPI,
  shapes: ShapeCandidate[]
): Promise<ExportRecord[]> {
  const normalizedFormat = format.toLowerCase() as ExportFormat;
  const written: ExportRecord[] = [];
  const errors: Array<{ nodeId: string; error: Error }> = [];

  for (const shape of shapes) {
    const filename = buildFileName(shape, normalizedFormat, !!options.hash);
    const filepath = path.join(outputDir, filename);

    try {
      let content: string | Buffer;

      switch (normalizedFormat) {
        case 'step':
          content = await invokeOperation<string>(geometryAPI, 'EXPORT_STEP', {
            shape: shape.handle,
          });
          break;
        case 'stl':
          content = await invokeOperation<string>(geometryAPI, 'EXPORT_STL', {
            shape: shape.handle,
            binary: false,
          });
          break;
        default:
          content = JSON.stringify(
            {
              nodeId: shape.nodeId,
              outputKey: shape.outputKey,
              format: normalizedFormat,
              generatedAt: new Date().toISOString(),
            },
            null,
            2
          );
      }

      // eslint-disable-next-line security/detect-non-literal-fs-filename -- Output path from CLI, validated
      if (Buffer.isBuffer(content)) {
        await fs.writeFile(filepath, content);
      } else {
        await fs.writeFile(filepath, content, 'utf8');
      }

      // eslint-disable-next-line security/detect-non-literal-fs-filename -- Output path from CLI, validated
      const { size } = await fs.stat(filepath);
      written.push({
        format: normalizedFormat,
        filename,
        filepath,
        size,
        nodeId: shape.nodeId,
      });
    } catch (error) {
      errors.push({
        nodeId: shape.nodeId,
        error: error instanceof Error ? error : new Error(String(error)),
      });
    }
  }

  if (written.length === 0 && errors.length > 0) {
    throw errors[0].error;
  }

  return written;
}
