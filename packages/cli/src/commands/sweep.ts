import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';
import type { GraphInstance } from '@brepflow/types';
import { GeometryEvaluationError } from '@brepflow/engine-core';
import {
  applyParameters,
  collectShapeHandles,
  exportFormat,
  resolveFormats,
  unwrapOperationResult,
} from './render';

export const sweepCommand = new Command('sweep')
  .description('Sweep parameters over a graph to generate variants')
  .argument('<graph>', 'path to .bflow.json graph file')
  .option('-m, --matrix <file>', 'CSV file with parameter matrix')
  .option('-p, --params <json>', 'JSON file with parameter combinations')
  .option('-o, --out <dir>', 'output directory', './sweep-output')
  .option('-e, --export <formats>', 'export formats (step,stl)', 'step')
  .option('--parallel <n>', 'number of parallel renders', '1')
  .action(async (graphPath, options) => {
    const spinner = ora('Loading parameter matrix...').start();

    try {
      // Check if graph exists
      if (!(await fs.pathExists(graphPath))) {
        spinner.fail(`Graph file not found: ${graphPath}`);
        process.exit(1);
      }

      // Load parameter matrix
      let parameterSets: Record<string, unknown>[] = [];

      if (options.matrix) {
        // Load from CSV
        if (!(await fs.pathExists(options.matrix))) {
          spinner.fail(`Matrix file not found: ${options.matrix}`);
          process.exit(1);
        }

        // eslint-disable-next-line security/detect-non-literal-fs-filename -- CLI argument, validated by commander
        const csvContent = await fs.readFile(options.matrix, 'utf-8');
        parameterSets = parseCSV(csvContent);
        spinner.succeed(`Loaded ${parameterSets.length} parameter sets from CSV`);
      } else if (options.params) {
        // Load from JSON
        if (!(await fs.pathExists(options.params))) {
          spinner.fail(`Params file not found: ${options.params}`);
          process.exit(1);
        }

        parameterSets = await fs.readJson(options.params);
        spinner.succeed(`Loaded ${parameterSets.length} parameter sets from JSON`);
      } else {
        // Generate default sweep
        parameterSets = generateDefaultSweep();
        spinner.succeed(`Generated ${parameterSets.length} default parameter sets`);
      }

      // Create output directory
      const outputDir = path.resolve(options.out);
      await fs.ensureDir(outputDir);

      // Process each parameter set
      console.log(chalk.blue(`\nProcessing ${parameterSets.length} variants...\n`));

      const results: Array<{
        index: number;
        parameters: Record<string, unknown>;
        timestamp: string;
        success: boolean;
        error?: string;
      }> = [];
      const parallel = parseInt(options.parallel, 10);

      for (let i = 0; i < parameterSets.length; i += parallel) {
        const batch = parameterSets.slice(i, i + parallel);

        const batchPromises = batch.map(async (params, j) => {
          const variantIndex = i + j;
          const variantDir = path.join(
            outputDir,
            `variant_${variantIndex.toString().padStart(3, '0')}`
          );
          await fs.ensureDir(variantDir);

          console.log(
            chalk.gray(`[${variantIndex + 1}/${parameterSets.length}] Processing variant...`)
          );

          try {
            // Convert params to --set format
            const setParams = Object.entries(params).map(([key, value]) => `${key}=${value}`);

            // Run render command
            await renderVariant(graphPath, variantDir, setParams, options);

            // Save variant metadata
            const metadata = {
              index: variantIndex,
              parameters: params,
              timestamp: new Date().toISOString(),
              success: true,
            };
            await fs.writeJson(path.join(variantDir, 'variant.json'), metadata, { spaces: 2 });

            results.push(metadata);
            console.log(
              chalk.green(`[${variantIndex + 1}/${parameterSets.length}] ✓ Variant complete`)
            );
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.log(
              chalk.red(
                `[${variantIndex + 1}/${parameterSets.length}] ✗ Variant failed: ${errorMessage}`
              )
            );

            if (error instanceof GeometryEvaluationError) {
              console.log(chalk.redBright('  Geometry failure details:'), {
                nodeId: error.nodeId,
                nodeType: error.nodeType,
                code: error.code,
              });
            }

            results.push({
              index: variantIndex,
              parameters: params,
              timestamp: new Date().toISOString(),
              error: errorMessage,
              success: false,
            });
          }
        });

        await Promise.all(batchPromises);
      }

      // Generate sweep summary
      const summary = {
        graph: path.basename(graphPath),
        totalVariants: parameterSets.length,
        successful: results.filter((r) => r.success).length,
        failed: results.filter((r) => !r.success).length,
        timestamp: new Date().toISOString(),
        results,
      };

      await fs.writeJson(path.join(outputDir, 'sweep-summary.json'), summary, { spaces: 2 });

      // Print summary
      console.log(chalk.green('\n✅ Sweep complete!'));
      console.log(chalk.gray(`Total variants: ${summary.totalVariants}`));
      console.log(chalk.green(`Successful: ${summary.successful}`));
      if (summary.failed > 0) {
        console.log(chalk.red(`Failed: ${summary.failed}`));
      }
      console.log(chalk.gray(`Output directory: ${outputDir}`));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      spinner.fail(`Error: ${errorMessage}`);
      if (error instanceof GeometryEvaluationError) {
        console.error(chalk.red('Geometry evaluation failed:'), {
          nodeId: error.nodeId,
          nodeType: error.nodeType,
          code: error.code,
        });
      }
      process.exit(1);
    }
  });

/**
 * Parse CSV content to parameter sets
 */
function parseCSV(content: string): Record<string, unknown>[] {
  const lines = content.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0]?.split(',').map((h) => h.trim()) || [];
  const paramSets = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i]?.split(',').map((v) => v.trim()) || [];
    const params: Record<string, unknown> = {};

    for (let j = 0; j < Math.min(headers.length, values.length); j++) {
      const header = headers[j];
      const value = values[j];
      if (header && value !== undefined) {
        // Try to parse as number
        const numValue = parseFloat(value);
        params[header] = isNaN(numValue) ? value : numValue;
      }
    }

    paramSets.push(params);
  }

  return paramSets;
}

/**
 * Generate default parameter sweep
 */
function generateDefaultSweep(): Record<string, unknown>[] {
  return [
    { L: 100, W: 60, H: 40 },
    { L: 120, W: 80, H: 40 },
    { L: 150, W: 100, H: 50 },
    { L: 200, W: 120, H: 60 },
  ];
}

/**
 * Render a single variant
 */
async function renderVariant(
  graphPath: string,
  outputDir: string,
  params: string[],
  options: { export?: string }
): Promise<void> {
  const { GraphManager, DAGEngine } = await import('@brepflow/engine-core');
  const { GeometryAPIFactory } = await import('@brepflow/engine-core/geometry-api-factory');
  const { registerCoreNodes } = await import('@brepflow/nodes-core');

  // Load graph
  // eslint-disable-next-line security/detect-non-literal-fs-filename -- CLI argument, validated by commander
  const graphContent = await fs.readFile(graphPath, 'utf-8');
  const graph: GraphInstance = JSON.parse(graphContent);

  // Register nodes and apply overrides
  registerCoreNodes();
  applyParameters(graph, params);

  // Initialize geometry
  const geometryAPI = await GeometryAPIFactory.getAPI({
    enableRetry: true,
    retryAttempts: 2,
    validateOutput: true,
  });
  const health = unwrapOperationResult<any>(await geometryAPI.invoke('HEALTH_CHECK', {}));
  if (!health.success || !health.result?.healthy) {
    throw new Error('OCCT health check failed');
  }

  // Evaluate graph
  const graphManager = new GraphManager(graph);
  const dagEngine = new DAGEngine({ worker: geometryAPI });
  const dirtyNodes = graphManager.getDirtyNodes();
  await dagEngine.evaluate(graph, dirtyNodes);

  const summary = dagEngine.getEvaluationSummary();
  if (summary && summary.sampleCount > 0) {
    console.info(
      chalk.gray(
        `Variant ${params.join(', ')} — p95: ${summary.p95Ms.toFixed(0)}ms (failures: ${summary.failureCount})`
      )
    );
  }

  const evaluatedGraph = graphManager.getGraph();
  const shapes = collectShapeHandles(evaluatedGraph);
  if (shapes.length === 0) {
    throw new Error('No geometry outputs detected in evaluated graph');
  }

  const { formats, rejected } = resolveFormats(options.export || 'step');
  if (rejected.length > 0) {
    console.warn(chalk.yellow(`Skipping unsupported formats: ${rejected.join(', ')}`));
  }

  for (const format of formats) {
    await exportFormat(evaluatedGraph, format, outputDir, { hash: false }, geometryAPI, shapes);
  }
}
