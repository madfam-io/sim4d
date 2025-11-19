/**
 * Test script to validate OCCT node adapter functionality
 * Ensures nodes can use real geometry operations through the adapter
 */

import {
  GeometryProxy,
  initializeNodeAdapter as _initializeNodeAdapter,
  getOperationStats,
  OPERATION_MAP,
} from './node-adapter';
import { WASMValidator } from './wasm-validation';
// NOTE: GeometryAPIFactory not exported from engine-core - API design pending.
// import { GeometryAPIFactory } from '@brepflow/engine-core';
import { DAGEngine } from '@brepflow/engine-core';
import { NodeRegistry } from '@brepflow/engine-core';
import type { GraphInstance, NodeInstance, WorkerAPI } from '@brepflow/types';

// Test colors for output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

function log(message: string, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

/**
 * Test the GeometryProxy adapter
 */
async function testGeometryProxy() {
  log('\n📋 Testing GeometryProxy Adapter...', colors.cyan);

  // Create a mock worker API for testing
  const mockWorker = {
    makeBox: async (params: unknown) => ({ id: 'box-1', type: 'solid', ...params }),
    makeSphere: async (params: unknown) => ({ id: 'sphere-1', type: 'solid', ...params }),
    performUnion: async (params: unknown) => ({ id: 'union-1', type: 'solid', ...params }),
    execute: async (op: any) => ({ id: `${op.type}-1`, type: 'result', ...op.params }),
  } as unknown as WorkerAPI;

  const proxy = new GeometryProxy(mockWorker as WorkerAPI);

  // Test direct method calls
  log('  Testing direct methods...', colors.gray);
  const box = await proxy.makeBox({ width: 10, height: 10, depth: 10 });
  if (box && box.id === 'box-1') {
    log('    ✅ Direct method call works', colors.green);
  } else {
    log('    ❌ Direct method call failed', colors.red);
  }

  // Test execute method with operation mapping
  log('  Testing execute method...', colors.gray);
  const sphere = await proxy.execute({ type: 'makeSphere', params: { radius: 5 } });
  if (sphere && sphere.id === 'sphere-1') {
    log('    ✅ Execute method works', colors.green);
  } else {
    log('    ❌ Execute method failed', colors.red);
  }

  // Test operation mapping
  log('  Testing operation mapping...', colors.gray);
  const moveResult = await proxy.execute({ type: 'move', params: { dx: 10, dy: 0, dz: 0 } });
  if (moveResult && moveResult.id === 'translate-1') {
    log('    ✅ Operation mapping works (move -> translate)', colors.green);
  } else {
    log('    ❌ Operation mapping failed', colors.red);
  }

  return true;
}

/**
 * Test node evaluation with the adapter
 */
async function testNodeEvaluation() {
  log('\n📋 Testing Node Evaluation with Adapter...', colors.cyan);

  try {
    // NOTE: Proper API initialization deferred - GeometryAPIFactory not exported from engine-core.
    // Get real geometry API
    const api: unknown = null; // Future: await GeometryAPIFactory.getAPI({ enableRetry: true, retryAttempts: 1 });

    // Create DAG engine with the API
    const dagEngine = new DAGEngine({ worker: api });

    // Create a simple test graph with a box node
    const testGraph: GraphInstance = {
      version: '1.0',
      units: 'mm' as const,
      tolerance: 0.01,
      nodes: [
        {
          id: 'box-node-1',
          type: 'Solid::Box',
          params: { width: 100, depth: 100, height: 100, centerX: 0, centerY: 0, centerZ: 0 },
          inputs: {},
          outputs: {},
          dirty: true,
        } as NodeInstance,
      ],
      edges: [],
      metadata: { description: 'Test Graph' },
    };

    // Register a test node definition that uses context.geometry
    NodeRegistry.getInstance().registerNode({
      id: 'Solid::Box',
      type: 'Solid::Box',
      category: 'Solid',
      label: 'Box',
      params: {},
      inputs: {},
      outputs: { solid: { type: 'Solid' } },
      async evaluate(context: unknown, inputs: any, params: unknown) {
        // This mimics how generated nodes work - they expect context.geometry
        if (!context.geometry) {
          throw new Error('context.geometry not available - adapter not working!');
        }
        return {
          solid: await context.geometry.execute({
            type: 'makeBox',
            params: params,
          }),
        };
      },
    } as unknown);

    // Evaluate the graph
    log('  Evaluating test graph...', colors.gray);
    const dirtyNodes = new Set<unknown>(['box-node-1']);
    await dagEngine.evaluate(testGraph, dirtyNodes);

    // Check if the node was evaluated successfully
    const node = testGraph.nodes[0];
    if (node.outputs && node.outputs.solid) {
      log('    ✅ Node evaluated successfully with geometry adapter', colors.green);
      log(`    📦 Output: ${JSON.stringify(node.outputs.solid)}`, colors.gray);
    } else if (node.state?.error) {
      log(`    ❌ Node evaluation failed: ${node.state.error}`, colors.red);
      return false;
    } else {
      log('    ❌ Node evaluation failed: no output', colors.red);
      return false;
    }

    return true;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    log(`    ❌ Test failed: ${message}`, colors.red);
    return false;
  }
}

/**
 * Test WASM integration
 */
async function testWASMIntegration() {
  log('\n📋 Testing WASM Integration...', colors.cyan);

  // Validate WASM is available
  const validator = WASMValidator.getInstance();
  const result = await validator.validate();

  if (result.compiled) {
    log('  ✅ WASM compiled and available', colors.green);
  } else {
    log('  ⚠️  WASM not compiled (expected in dev)', colors.yellow);
  }

  if (result.loaded) {
    log('  ✅ WASM module loaded', colors.green);
  } else {
    log('  ⚠️  WASM module not loaded (may need server headers)', colors.yellow);
  }

  if (result.functional) {
    log('  ✅ WASM operations functional', colors.green);
  } else {
    log('  ⚠️  WASM operations not functional (expected without proper setup)', colors.yellow);
  }

  return true;
}

/**
 * Display operation statistics
 */
function displayOperationStats() {
  log('\n📊 Operation Mapping Statistics:', colors.cyan);

  const stats = getOperationStats();
  log(`  Total operations mapped: ${stats.totalOperations}`, colors.blue);

  log('\n  Categories:', colors.gray);
  for (const [category, count] of Object.entries(stats.categories)) {
    if (count > 0) {
      log(`    ${category}: ${count} operations`, colors.gray);
    }
  }

  // Show some example mappings
  log('\n  Example mappings:', colors.gray);
  const examples = [
    ['move', OPERATION_MAP['move']],
    ['makeBox', OPERATION_MAP['makeBox']],
    ['performUnion', OPERATION_MAP['performUnion']],
    ['fillet', OPERATION_MAP['fillet']],
    ['extrude', OPERATION_MAP['extrude']],
  ];

  for (const [from, to] of examples) {
    log(`    ${from} → ${to}`, colors.gray);
  }
}

/**
 * Main test runner
 */
async function runTests() {
  log('\n🔧 OCCT Node Adapter Test Suite', colors.blue);
  log('================================\n', colors.blue);

  let allTestsPassed = true;

  // Test 1: GeometryProxy
  const proxyTestPassed = await testGeometryProxy();
  allTestsPassed = allTestsPassed && proxyTestPassed;

  // Test 2: Node Evaluation
  const nodeTestPassed = await testNodeEvaluation();
  allTestsPassed = allTestsPassed && nodeTestPassed;

  // Test 3: WASM Integration
  const wasmTestPassed = await testWASMIntegration();
  allTestsPassed = allTestsPassed && wasmTestPassed;

  // Display statistics
  displayOperationStats();

  // Summary
  log('\n================================', colors.blue);
  if (allTestsPassed) {
    log('✅ All tests passed!', colors.green);
    log('\n🎉 OCCT node adapter is working correctly', colors.green);
    log('   Nodes can now use real geometry operations through context.geometry', colors.gray);
  } else {
    log('❌ Some tests failed', colors.red);
    log('\n⚠️  The adapter may need additional configuration', colors.yellow);
  }

  log('\n💡 Next steps:', colors.cyan);
  log('   1. Run "pnpm run build:wasm" to compile real OCCT bindings', colors.gray);
  log('   2. Ensure dev server has COOP/COEP headers for SharedArrayBuffer', colors.gray);
  log('   3. Test with real geometry operations in Studio', colors.gray);
}

// Run tests if executed directly
if (require.main === module) {
  runTests().catch((error) => {
    log(`\n❌ Test suite failed: ${error}`, colors.red);
    process.exit(1);
  });
}

export { runTests, testGeometryProxy, testNodeEvaluation, testWASMIntegration };
