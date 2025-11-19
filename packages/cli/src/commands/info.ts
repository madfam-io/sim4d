import { Command } from 'commander';
import chalk from 'chalk';
import fs from 'fs-extra';
import type { GraphInstance } from '@brepflow/types';

export const infoCommand = new Command('info')
  .description('Display information about a BrepFlow graph')
  .argument('<graph>', 'path to .bflow.json graph file')
  .option('--nodes', 'list all nodes')
  .option('--edges', 'list all edges')
  .option('--params', 'list all parameters')
  .option('--json', 'output as JSON')
  .action(async (graphPath, options) => {
    try {
      // Check if file exists
      if (!(await fs.pathExists(graphPath))) {
        console.error(chalk.red(`Graph file not found: ${graphPath}`));
        process.exit(1);
      }

      // Load graph
      const graphContent = await fs.readFile(graphPath, 'utf-8');
      const graph: GraphInstance = JSON.parse(graphContent);

      // Collect information
      const info = {
        file: graphPath,
        version: graph.version,
        units: graph.units,
        tolerance: graph.tolerance,
        metadata: graph.metadata,
        statistics: {
          nodes: graph.nodes.length,
          edges: graph.edges.length,
          nodeTypes: getNodeTypes(graph),
          parameters: countParameters(graph),
        },
        nodes: options.nodes ? graph.nodes : undefined,
        edges: options.edges ? graph.edges : undefined,
        parameters: options.params ? collectParameters(graph) : undefined,
      };

      // Output
      if (options.json) {
        console.log(JSON.stringify(info, null, 2));
      } else {
        displayInfo(info);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(chalk.red(`Error: ${errorMessage}`));
      process.exit(1);
    }
  });

/**
 * Get unique node types
 */
function getNodeTypes(graph: GraphInstance): Record<string, number> {
  const types: Record<string, number> = {};

  for (const node of graph.nodes) {
    types[node.type] = (types[node.type] || 0) + 1;
  }

  return types;
}

/**
 * Count total parameters
 */
function countParameters(graph: GraphInstance): number {
  let count = 0;

  for (const node of graph.nodes) {
    if (node.params) {
      count += Object.keys(node.params).length;
    }
  }

  return count;
}

/**
 * Collect all parameters
 */
function collectParameters(
  graph: GraphInstance
): Record<string, Array<{ nodeId: string; nodeType: string; value: unknown }>> {
  const params: Record<string, Array<{ nodeId: string; nodeType: string; value: unknown }>> = {};

  for (const node of graph.nodes) {
    if (node.params) {
      for (const [key, value] of Object.entries(node.params)) {
        const paramKey = `${node.id}.${key}`;
        if (!params[paramKey]) {
          params[paramKey] = [];
        }
        params[paramKey].push({
          nodeId: node.id,
          nodeType: node.type,
          value,
        });
      }
    }
  }

  return params;
}

/**
 * Display information in readable format
 */
function displayInfo(info: {
  file: string;
  version: string;
  units: string;
  tolerance: number;
  metadata?: {
    created?: string;
    author?: string;
    description?: string;
    name?: string;
    createdAt?: string;
    updatedAt?: string;
  };
  statistics: {
    nodes: number;
    edges: number;
    nodeTypes: Record<string, number>;
    parameters: number;
  };
  nodes?: Array<{
    id: string;
    type: string;
    params?: Record<string, unknown>;
  }>;
  edges?: Array<{
    source: string;
    sourceHandle: string;
    target: string;
    targetHandle: string;
  }>;
  parameters?: Record<
    string,
    Array<{
      nodeId: string;
      nodeType: string;
      value: unknown;
    }>
  >;
}): void {
  console.log(chalk.blue('\n📊 BrepFlow Graph Information\n'));

  // Basic info
  console.log(chalk.gray('File:'), info.file);
  console.log(chalk.gray('Version:'), info.version);
  console.log(chalk.gray('Units:'), info.units);
  console.log(chalk.gray('Tolerance:'), info.tolerance);

  // Metadata
  if (info.metadata) {
    console.log(chalk.blue('\n📝 Metadata:'));
    if (info.metadata.created) {
      console.log(chalk.gray('  Created:'), info.metadata.created);
    }
    if (info.metadata.author) {
      console.log(chalk.gray('  Author:'), info.metadata.author);
    }
    if (info.metadata.description) {
      console.log(chalk.gray('  Description:'), info.metadata.description);
    }
  }

  // Statistics
  console.log(chalk.blue('\n📈 Statistics:'));
  console.log(chalk.gray('  Nodes:'), info.statistics.nodes);
  console.log(chalk.gray('  Edges:'), info.statistics.edges);
  console.log(chalk.gray('  Parameters:'), info.statistics.parameters);

  // Node types
  console.log(chalk.blue('\n🔧 Node Types:'));
  for (const [type, count] of Object.entries(info.statistics.nodeTypes)) {
    console.log(chalk.gray(`  ${type}:`), count);
  }

  // Nodes list
  if (info.nodes) {
    console.log(chalk.blue('\n📦 Nodes:'));
    for (const node of info.nodes) {
      console.log(chalk.gray(`  [${node.id}]`), node.type);
      if (node.params && Object.keys(node.params).length > 0) {
        for (const [key, value] of Object.entries(node.params)) {
          console.log(chalk.gray(`    ${key}:`), value);
        }
      }
    }
  }

  // Edges list
  if (info.edges) {
    console.log(chalk.blue('\n🔗 Edges:'));
    for (const edge of info.edges) {
      console.log(
        chalk.gray(`  ${edge.source}.${edge.sourceHandle}`),
        '→',
        chalk.gray(`${edge.target}.${edge.targetHandle}`)
      );
    }
  }

  // Parameters list
  if (info.parameters) {
    console.log(chalk.blue('\n⚙️ Parameters:'));
    for (const [key, values] of Object.entries(info.parameters)) {
      if (Array.isArray(values) && values.length > 0) {
        const value = values[0];
        console.log(chalk.gray(`  ${key}:`), value.value);
      }
    }
  }

  console.log();
}
