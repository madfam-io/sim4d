import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';
import Ajv from 'ajv';
import type { GraphInstance } from '@sim4d/types';
import { GraphManager } from '@sim4d/engine-core';

export const validateCommand = new Command('validate')
  .description('Validate a Sim4D graph file')
  .argument('<graph>', 'path to .bflow.json graph file')
  .option('--schema <file>', 'custom schema file')
  .option('--strict', 'enable strict validation')
  .action(async (graphPath, options) => {
    const spinner = ora('Loading graph...').start();

    try {
      // Check if file exists
      if (!(await fs.pathExists(graphPath))) {
        spinner.fail(`Graph file not found: ${graphPath}`);
        process.exit(1);
      }

      // Load graph
      const graphContent = await fs.readFile(graphPath, 'utf-8');
      let graph: GraphInstance;

      try {
        graph = JSON.parse(graphContent);
        spinner.succeed('Graph loaded');
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        spinner.fail(`Invalid JSON: ${errorMessage}`);
        process.exit(1);
      }

      // Schema validation
      spinner.start('Validating schema...');
      const schemaErrors = await validateSchema(graph, options.schema);

      if (schemaErrors.length > 0) {
        spinner.fail('Schema validation failed');
        console.log(chalk.red('\n❌ Schema Errors:'));
        schemaErrors.forEach((err) => {
          console.log(chalk.gray(`  - ${err}`));
        });
      } else {
        spinner.succeed('Schema valid');
      }

      // Graph structure validation
      spinner.start('Validating graph structure...');
      const graphManager = new GraphManager(graph);
      const structureErrors = graphManager.validate();

      if (structureErrors.length > 0) {
        spinner.fail('Structure validation failed');
        console.log(chalk.red('\n❌ Structure Errors:'));
        structureErrors.forEach((err) => {
          console.log(chalk.gray(`  - ${err}`));
        });
      } else {
        spinner.succeed('Structure valid');
      }

      // Node validation
      spinner.start('Validating nodes...');
      const nodeErrors = validateNodes(graph);

      if (nodeErrors.length > 0) {
        spinner.fail('Node validation failed');
        console.log(chalk.red('\n❌ Node Errors:'));
        nodeErrors.forEach((err) => {
          console.log(chalk.gray(`  - ${err}`));
        });
      } else {
        spinner.succeed('Nodes valid');
      }

      // Edge validation
      spinner.start('Validating edges...');
      const edgeErrors = validateEdges(graph);

      if (edgeErrors.length > 0) {
        spinner.fail('Edge validation failed');
        console.log(chalk.red('\n❌ Edge Errors:'));
        edgeErrors.forEach((err) => {
          console.log(chalk.gray(`  - ${err}`));
        });
      } else {
        spinner.succeed('Edges valid');
      }

      // Summary
      const totalErrors =
        schemaErrors.length + structureErrors.length + nodeErrors.length + edgeErrors.length;

      if (totalErrors === 0) {
        console.log(chalk.green('\n✅ Graph is valid!'));

        // Print statistics
        console.log(chalk.gray('\nStatistics:'));
        console.log(chalk.gray(`  Nodes: ${graph.nodes.length}`));
        console.log(chalk.gray(`  Edges: ${graph.edges.length}`));
        console.log(chalk.gray(`  Units: ${graph.units}`));
        console.log(chalk.gray(`  Tolerance: ${graph.tolerance}`));
      } else {
        console.log(chalk.red(`\n❌ Graph has ${totalErrors} error(s)`));
        process.exit(1);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      spinner.fail(`Error: ${errorMessage}`);
      process.exit(1);
    }
  });

/**
 * Validate graph against JSON schema
 */
async function validateSchema(graph: GraphInstance, schemaPath?: string): Promise<string[]> {
  const errors: string[] = [];

  try {
    // Load schema
    let schema;
    if (schemaPath) {
      schema = await fs.readJson(schemaPath);
    } else {
      // Use default schema
      schema = await fs.readJson(
        path.join(__dirname, '../../../schemas/schemas/graph.schema.json')
      );
    }

    // Validate
    const ajv = new Ajv();
    const validate = ajv.compile(schema);
    const valid = validate(graph);

    if (!valid && validate.errors) {
      validate.errors.forEach((err) => {
        errors.push(`${err.instancePath} ${err.message}`);
      });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    errors.push(`Schema validation error: ${errorMessage}`);
  }

  return errors;
}

/**
 * Validate nodes
 */
function validateNodes(graph: GraphInstance): string[] {
  const errors: string[] = [];
  const nodeIds = new Set<string>();

  for (const node of graph.nodes) {
    // Check for duplicate IDs
    if (nodeIds.has(node.id)) {
      errors.push(`Duplicate node ID: ${node.id}`);
    }
    nodeIds.add(node.id);

    // Check required fields
    if (!node.type) {
      errors.push(`Node ${node.id} missing type`);
    }

    // Check position
    if (node.position) {
      if (typeof node.position.x !== 'number' || typeof node.position.y !== 'number') {
        errors.push(`Node ${node.id} has invalid position`);
      }
    }

    // Check parameters
    if (node.params) {
      for (const [key, value] of Object.entries(node.params)) {
        if (value === undefined || value === null) {
          errors.push(`Node ${node.id} parameter '${key}' is null/undefined`);
        }
      }
    }
  }

  return errors;
}

/**
 * Validate edges
 */
function validateEdges(graph: GraphInstance): string[] {
  const errors: string[] = [];
  const edgeIds = new Set<string>();
  const nodeIds = new Set(graph.nodes.map((n) => n.id));

  for (const edge of graph.edges) {
    // Check for duplicate IDs
    if (edgeIds.has(edge.id)) {
      errors.push(`Duplicate edge ID: ${edge.id}`);
    }
    edgeIds.add(edge.id);

    // Check source/target exist
    if (!nodeIds.has(edge.source)) {
      errors.push(`Edge ${edge.id} references non-existent source node: ${edge.source}`);
    }
    if (!nodeIds.has(edge.target)) {
      errors.push(`Edge ${edge.id} references non-existent target node: ${edge.target}`);
    }

    // Check handles
    if (!edge.sourceHandle) {
      errors.push(`Edge ${edge.id} missing sourceHandle`);
    }
    if (!edge.targetHandle) {
      errors.push(`Edge ${edge.id} missing targetHandle`);
    }

    // Check for self-loops
    if (edge.source === edge.target) {
      errors.push(`Edge ${edge.id} creates self-loop on node ${edge.source}`);
    }
  }

  return errors;
}
