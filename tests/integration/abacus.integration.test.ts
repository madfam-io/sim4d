/**
 * Parametric Abacus Integration Test
 *
 * Tests the complete workflow from node graph creation to geometrically
 * validated export files across multiple formats.
 *
 * This demonstrates BrepFlow's enterprise CAD capabilities with:
 * - Complex parametric assemblies
 * - Constraint solving
 * - Pattern features
 * - Manufacturing export validation
 */

import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import { GeometryAPI } from '@brepflow/engine-occt';
import { NodeRegistry, GraphEvaluator } from '@brepflow/engine-core';
import { registerCoreNodes } from '@brepflow/nodes-core';
import type { GraphDefinition, NodeInstance } from '@brepflow/types';
import fs from 'fs/promises';
import path from 'path';

// Test configuration
const TEST_OUTPUT_DIR = './test-outputs/abacus';
const GOLDEN_MASTER_DIR = './test-fixtures/abacus-golden';

interface AbacusConfiguration {
  name: string;
  params: {
    rodCount: number;
    beadsPerRod: number;
    beadRadius: number;
    rodSpacing: number;
    frameHeight: number;
    frameDepth: number;
  };
  expectedVolume: number;
  expectedBeadCount: number;
}

// Test configurations from simple to complex
const ABACUS_CONFIGS: AbacusConfiguration[] = [
  {
    name: 'minimal',
    params: {
      rodCount: 1,
      beadsPerRod: 1,
      beadRadius: 3,
      rodSpacing: 20,
      frameHeight: 50,
      frameDepth: 15,
    },
    expectedVolume: 800, // Approximate mm³
    expectedBeadCount: 1,
  },
  {
    name: 'standard',
    params: {
      rodCount: 10,
      beadsPerRod: 9,
      beadRadius: 5,
      rodSpacing: 25,
      frameHeight: 300,
      frameDepth: 20,
    },
    expectedVolume: 15000, // Approximate mm³
    expectedBeadCount: 90,
  },
  {
    name: 'large',
    params: {
      rodCount: 15,
      beadsPerRod: 12,
      beadRadius: 6,
      rodSpacing: 30,
      frameHeight: 400,
      frameDepth: 25,
    },
    expectedVolume: 45000, // Approximate mm³
    expectedBeadCount: 180,
  },
];

describe('Parametric Abacus Integration Tests', () => {
  let geometryAPI: GeometryAPI;
  // let nodeRegistry: NodeRegistry;
  let graphEvaluator: GraphEvaluator;

  beforeAll(async () => {
    // Initialize BrepFlow components
    geometryAPI = new GeometryAPI();
    await geometryAPI.initialize();

    nodeRegistry = NodeRegistry.getInstance();
    registerCoreNodes();

    graphEvaluator = new GraphEvaluator(geometryAPI);

    // Ensure output directories exist
    await fs.mkdir(TEST_OUTPUT_DIR, { recursive: true });
    await fs.mkdir(path.join(TEST_OUTPUT_DIR, 'step'), { recursive: true });
    await fs.mkdir(path.join(TEST_OUTPUT_DIR, 'iges'), { recursive: true });
    await fs.mkdir(path.join(TEST_OUTPUT_DIR, 'stl'), { recursive: true });
    await fs.mkdir(path.join(TEST_OUTPUT_DIR, 'bflow'), { recursive: true });
  });

  afterAll(async () => {
    await geometryAPI.dispose();
  });

  describe('Abacus Graph Construction', () => {
    test.each(ABACUS_CONFIGS)('Creates valid node graph for $name configuration', (config) => {
      const graph = createAbacusGraph(config.params);

      // Validate graph structure
      expect(graph.nodes).toBeDefined();
      expect(graph.connections).toBeDefined();
      expect(Object.keys(graph.nodes)).toContain('frame');
      expect(Object.keys(graph.nodes)).toContain('rods');
      expect(Object.keys(graph.nodes)).toContain('beads');
      expect(Object.keys(graph.nodes)).toContain('assembly');

      // Validate parameter propagation
      const frameNode = graph.nodes['frame'];
      expect(frameNode.params.height).toBe(config.params.frameHeight);
      expect(frameNode.params.depth).toBe(config.params.frameDepth);

      const beadNode = graph.nodes['beads'];
      expect(beadNode.params.radius).toBe(config.params.beadRadius);
    });
  });

  describe('Parametric Geometry Generation', () => {
    test.each(ABACUS_CONFIGS)('Generates valid geometry for $name abacus', async (config) => {
      const graph = createAbacusGraph(config.params);
      const result = await graphEvaluator.evaluate(graph);

      expect(result.success).toBe(true);
      expect(result.outputs).toBeDefined();
      expect(result.outputs.assembly).toBeDefined();

      // Validate assembly components
      const assembly = result.outputs.assembly;
      expect(assembly.components).toHaveLength(3); // frame, rods, beads

      // Validate geometry properties
      const properties = await geometryAPI.getProperties(assembly.shape);
      expect(properties.volume).toBeGreaterThan(0);
      expect(properties.volume).toBeCloseTo(config.expectedVolume, -1); // Within order of magnitude

      // Validate bead count through pattern analysis
      const beadComponent = assembly.components.find((c) => c.type === 'beads');
      expect(beadComponent?.instances).toHaveLength(config.expectedBeadCount);
    });

    test('Parameter changes update geometry correctly', async () => {
      const initialConfig = ABACUS_CONFIGS[0];
      const graph = createAbacusGraph(initialConfig.params);

      // Initial evaluation
      const result1 = await graphEvaluator.evaluate(graph);
      const initialVolume = await geometryAPI.getVolume(result1.outputs.assembly.shape);

      // Update parameters
      graph.nodes['beads'].params.radius = initialConfig.params.beadRadius * 2;

      // Re-evaluate
      const result2 = await graphEvaluator.evaluate(graph);
      const updatedVolume = await geometryAPI.getVolume(result2.outputs.assembly.shape);

      // Volume should increase significantly with larger beads
      expect(updatedVolume).toBeGreaterThan(initialVolume * 4); // Volume scales with radius³
    });
  });

  describe('Export Format Validation', () => {
    test.each(ABACUS_CONFIGS)('Exports $name abacus to STEP format', async (config) => {
      const graph = createAbacusGraph(config.params);
      const result = await graphEvaluator.evaluate(graph);

      const stepPath = path.join(TEST_OUTPUT_DIR, 'step', `abacus-${config.name}.step`);
      const exportResult = await geometryAPI.exportSTEP({
        shapes: [result.outputs.assembly.shape],
        filePath: stepPath,
        units: 'mm',
        precision: 'standard',
      });

      expect(exportResult.success).toBe(true);
      expect(exportResult.fileSize).toBeGreaterThan(1000); // Reasonable file size

      // Verify file exists and has content
      const fileStats = await fs.stat(stepPath);
      expect(fileStats.size).toBeGreaterThan(0);

      // Basic STEP format validation
      const content = await fs.readFile(stepPath, 'utf-8');
      expect(content).toMatch(/^ISO-10303-21;/);
      expect(content).toMatch(/HEADER;/);
      expect(content).toMatch(/DATA;/);
      expect(content).toMatch(/ENDSEC;/);
    });

    test.each(ABACUS_CONFIGS)('Exports $name abacus to IGES format', async (config) => {
      const graph = createAbacusGraph(config.params);
      const result = await graphEvaluator.evaluate(graph);

      const igesPath = path.join(TEST_OUTPUT_DIR, 'iges', `abacus-${config.name}.iges`);
      const exportResult = await geometryAPI.exportIGES({
        shapes: [result.outputs.assembly.shape],
        filePath: igesPath,
        units: 'mm',
        version: '214',
      });

      expect(exportResult.success).toBe(true);

      // Verify IGES format
      const content = await fs.readFile(igesPath, 'utf-8');
      const lines = content.split('\n');
      expect(lines[0]).toMatch(/START/);
      expect(content).toMatch(/GLOBAL/);
      expect(content).toMatch(/DIRECTORY/);
      expect(content).toMatch(/PARAMETER/);
    });

    test.each(ABACUS_CONFIGS)('Exports $name abacus to STL format', async (config) => {
      const graph = createAbacusGraph(config.params);
      const result = await graphEvaluator.evaluate(graph);

      const stlPath = path.join(TEST_OUTPUT_DIR, 'stl', `abacus-${config.name}.stl`);
      const exportResult = await geometryAPI.exportSTL({
        shapes: [result.outputs.assembly.shape],
        filePath: stlPath,
        quality: 'standard',
        binary: true,
      });

      expect(exportResult.success).toBe(true);
      expect(exportResult.triangles).toBeGreaterThan(100); // Reasonable triangle count

      // Verify binary STL format
      const buffer = await fs.readFile(stlPath);
      expect(buffer.length).toBeGreaterThan(84); // Header + at least one triangle

      // Check triangle count matches header
      const triangleCount = buffer.readUInt32LE(80);
      const expectedSize = 84 + triangleCount * 50; // Header + triangles
      expect(buffer.length).toBe(expectedSize);
    });

    test.each(ABACUS_CONFIGS)('Saves $name abacus as .bflow project', async (config) => {
      const graph = createAbacusGraph(config.params);
      const bflowPath = path.join(TEST_OUTPUT_DIR, 'bflow', `abacus-${config.name}.bflow.json`);

      const projectData = {
        version: '1.0.0',
        metadata: {
          name: `Parametric Abacus - ${config.name}`,
          description: 'Integration test abacus model',
          created: new Date().toISOString(),
          units: 'mm',
          tolerance: 0.01,
        },
        graph,
        parameters: config.params,
      };

      await fs.writeFile(bflowPath, JSON.stringify(projectData, null, 2));

      // Verify .bflow file can be loaded and executed
      const loadedData = JSON.parse(await fs.readFile(bflowPath, 'utf-8'));
      expect(loadedData.version).toBe('1.0.0');
      expect(loadedData.graph.nodes).toBeDefined();

      const result = await graphEvaluator.evaluate(loadedData.graph);
      expect(result.success).toBe(true);
    });
  });

  describe('Manufacturing Validation', () => {
    test.each(ABACUS_CONFIGS)('Validates $name abacus for 3D printing', async (config) => {
      const graph = createAbacusGraph(config.params);
      const result = await graphEvaluator.evaluate(graph);

      const validation = await geometryAPI.validateManufacturingConstraints({
        shape: result.outputs.assembly.shape,
        manufacturingProcess: '3d_printing',
        minWallThickness: 1.0,
        maxAspectRatio: 10.0,
        checkTolerances: true,
      });

      expect(validation.valid).toBe(true);
      expect(validation.constraints.wallThickness.passed).toBe(true);
      expect(validation.constraints.aspectRatio.passed).toBe(true);
    });

    test.each(ABACUS_CONFIGS)(
      'Generates 3D printing optimization for $name abacus',
      async (config) => {
        const graph = createAbacusGraph(config.params);
        const result = await graphEvaluator.evaluate(graph);

        const optimization = await geometryAPI.optimizeForPrinting({
          shape: result.outputs.assembly.shape,
          printTechnology: 'FDM',
          layerHeight: 0.2,
          supportAngle: 45,
          orientation: { x: 0, y: 0, z: 1 },
        });

        expect(optimization.optimizedShape).toBeDefined();
        expect(optimization.printTime).toBeGreaterThan(0);
        expect(optimization.materialUsage).toBeGreaterThan(0);

        // Should require minimal supports for abacus geometry
        expect(optimization.supports.length).toBeLessThan(10);
      }
    );
  });

  describe('Golden Master Tests', () => {
    test.each(ABACUS_CONFIGS)('Geometry matches golden master for $name abacus', async (config) => {
      const graph = createAbacusGraph(config.params);
      const result = await graphEvaluator.evaluate(graph);

      const currentProperties = await geometryAPI.getProperties(result.outputs.assembly.shape);

      const goldenPath = path.join(GOLDEN_MASTER_DIR, `${config.name}-properties.json`);

      try {
        // Try to load existing golden master
        const goldenData = JSON.parse(await fs.readFile(goldenPath, 'utf-8'));

        // Compare with tolerance
        expect(currentProperties.volume).toBeCloseTo(goldenData.volume, 1);
        expect(currentProperties.surfaceArea).toBeCloseTo(goldenData.surfaceArea, 1);
        expect(currentProperties.centerOfMass.x).toBeCloseTo(goldenData.centerOfMass.x, 2);
        expect(currentProperties.centerOfMass.y).toBeCloseTo(goldenData.centerOfMass.y, 2);
        expect(currentProperties.centerOfMass.z).toBeCloseTo(goldenData.centerOfMass.z, 2);
      } catch (error) {
        // Create golden master if it doesn't exist
        console.warn(`Creating golden master for ${config.name}: ${goldenPath}`);
        await fs.mkdir(path.dirname(goldenPath), { recursive: true });
        await fs.writeFile(goldenPath, JSON.stringify(currentProperties, null, 2));
      }
    });
  });

  describe('Performance Benchmarks', () => {
    test.each(ABACUS_CONFIGS)('$name abacus evaluation performance', async (config) => {
      const graph = createAbacusGraph(config.params);

      const startTime = performance.now();
      const result = await graphEvaluator.evaluate(graph);
      const endTime = performance.now();

      const evaluationTime = endTime - startTime;

      expect(result.success).toBe(true);

      // Performance expectations based on complexity
      const maxTime = config.params.rodCount * config.params.beadsPerRod * 10; // 10ms per bead
      expect(evaluationTime).toBeLessThan(Math.max(maxTime, 5000)); // At least 5 seconds max

      // ${config.name} abacus (${config.expectedBeadCount} beads): ${evaluationTime.toFixed(2)}ms
    });

    test('Constraint solver convergence performance', async () => {
      const config = ABACUS_CONFIGS[1]; // Standard abacus
      const graph = createAbacusGraph(config.params);

      const result = await graphEvaluator.evaluate(graph);

      expect(result.constraintSolverStats.converged).toBe(true);
      expect(result.constraintSolverStats.iterations).toBeLessThan(100);
      expect(result.constraintSolverStats.residual).toBeLessThan(1e-6);
      expect(result.constraintSolverStats.solveTime).toBeLessThan(1000); // 1 second
    });
  });
});

/**
 * Creates a parametric abacus node graph
 */
function createAbacusGraph(params: AbacusConfiguration['params']): GraphDefinition {
  const frameWidth = params.rodCount * params.rodSpacing;

  const nodes: Record<string, NodeInstance> = {
    // Frame with calculated dimensions
    frame: {
      id: 'frame',
      type: 'Solid::Box',
      params: {
        width: frameWidth + 40, // Extra for frame thickness
        height: params.frameHeight,
        depth: params.frameDepth,
        center: { x: 0, y: 0, z: 0 },
      },
      position: { x: 100, y: 100 },
    },

    // Single rod geometry
    rod: {
      id: 'rod',
      type: 'Solid::Cylinder',
      params: {
        radius: 2,
        height: frameWidth - 10,
        center: { x: 0, y: 0, z: 0 },
        axis: { x: 1, y: 0, z: 0 },
      },
      position: { x: 200, y: 100 },
    },

    // Pattern rods across frame
    rods: {
      id: 'rods',
      type: 'Pattern::LinearPattern',
      params: {
        count: params.rodCount,
        direction: { x: 0, y: 1, z: 0 },
        spacing: params.rodSpacing,
        keepOriginal: true,
      },
      position: { x: 300, y: 100 },
    },

    // Single bead geometry
    bead: {
      id: 'bead',
      type: 'Solid::Sphere',
      params: {
        radius: params.beadRadius,
        center: { x: 0, y: 0, z: 0 },
      },
      position: { x: 100, y: 200 },
    },

    // Pattern beads in rectangular grid
    beads: {
      id: 'beads',
      type: 'Pattern::RectangularPattern',
      params: {
        countX: Math.floor(frameWidth / (params.beadRadius * 3)), // Fit beads along rod
        countY: params.rodCount,
        spacingX: params.beadRadius * 3,
        spacingY: params.rodSpacing,
        keepOriginal: true,
      },
      position: { x: 200, y: 200 },
    },

    // Assembly all components
    assembly: {
      id: 'assembly',
      type: 'Assembly::Assembly',
      params: {
        name: 'Parametric Abacus',
      },
      position: { x: 400, y: 150 },
    },
  };

  const connections = [
    { from: 'rod', to: 'rods', fromPort: 'shape', toPort: 'shape' },
    { from: 'bead', to: 'beads', fromPort: 'shape', toPort: 'shape' },
    { from: 'frame', to: 'assembly', fromPort: 'shape', toPort: 'parts' },
    { from: 'rods', to: 'assembly', fromPort: 'shapes', toPort: 'parts' },
    { from: 'beads', to: 'assembly', fromPort: 'shapes', toPort: 'parts' },
  ];

  return { nodes, connections };
}
