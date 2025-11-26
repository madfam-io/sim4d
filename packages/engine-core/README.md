# @sim4d/engine-core

Core execution engine for Sim4D - handles DAG evaluation, caching, and node orchestration.

## Overview

The engine-core package provides the fundamental graph execution runtime for Sim4D. It manages:

- Directed Acyclic Graph (DAG) evaluation with topological sorting
- Dirty propagation for efficient re-computation
- Content-addressed caching with deterministic hashing
- Node registry and type system
- Command pattern for undo/redo operations
- History tree for branching workflows

## Installation

```bash
pnpm add @sim4d/engine-core
```

## Core Components

### DAGEngine

The main execution engine that evaluates node graphs.

```typescript
import { DAGEngine } from '@sim4d/engine-core';
import { WorkerAPI } from '@sim4d/types';

const engine = new DAGEngine({
  worker: workerAPI,
  cache: new ComputeCache(),
  registry: NodeRegistry.getInstance(),
});

// Evaluate a graph with dirty nodes
await engine.evaluate(graph, dirtyNodes);

// Cancel evaluation
engine.cancelNode(nodeId);
engine.cancelAll();

// Clear cache
engine.clearCache();
```

### NodeRegistry

Manages node type definitions and instantiation.

```typescript
import { NodeRegistry } from '@sim4d/engine-core';

const registry = NodeRegistry.getInstance();

// Register a custom node
registry.registerNode({
  type: 'Custom::MyNode',
  params: {
    value: { type: 'number', default: 0 },
  },
  inputs: {
    input: 'number',
  },
  outputs: {
    output: 'number',
  },
  evaluate: async (ctx, inputs, params) => {
    return { output: inputs.input + params.value };
  },
});

// Get node definition
const definition = registry.getNode('Custom::MyNode');

// List all nodes
const allNodes = registry.getAllNodes();
```

### ComputeCache

Content-addressed cache for node evaluation results.

```typescript
import { ComputeCache } from '@sim4d/engine-core';

const cache = new ComputeCache(1000); // Max 1000 entries

// Cache operations
cache.set(hash, result);
const cached = cache.get(hash);
cache.has(hash);
cache.delete(hash);
cache.clear();

// Statistics
const stats = cache.getStats();
console.log(`Hits: ${stats.hits}, Misses: ${stats.misses}`);
```

### Hash Utilities

Deterministic hashing for nodes and graphs.

```typescript
import { hashNode, hashGraph, hashValue } from '@sim4d/engine-core';

// Hash a node with its inputs
const nodeHash = hashNode(node, inputs);

// Hash entire graph
const graphHash = hashGraph(graph);

// Hash arbitrary values
const valueHash = hashValue({ data: [1, 2, 3] });
```

### GraphManager

High-level graph operations and validation.

```typescript
import { GraphManager } from '@sim4d/engine-core';

const manager = new GraphManager();

// Load and validate graph
const graph = await manager.loadGraph('path/to/graph.bflow.json');
const isValid = manager.validateGraph(graph);

// Graph operations
manager.addNode(graph, nodeData);
manager.removeNode(graph, nodeId);
manager.addEdge(graph, source, target);
manager.removeEdge(graph, edgeId);

// Find dependencies
const dependencies = manager.getDependencies(graph, nodeId);
const dependents = manager.getDependents(graph, nodeId);

// Export graph
await manager.saveGraph(graph, 'output.bflow.json');
```

### CommandSystem

Command pattern implementation for undo/redo.

```typescript
import { CommandSystem, Command } from '@sim4d/engine-core';

const commandSystem = new CommandSystem();

// Define a command
class MyCommand implements Command {
  execute() {
    // Do operation
  }

  undo() {
    // Undo operation
  }

  redo() {
    // Redo operation
  }
}

// Execute command
commandSystem.execute(new MyCommand());

// Undo/Redo
commandSystem.undo();
commandSystem.redo();

// History management
commandSystem.clearHistory();
const canUndo = commandSystem.canUndo();
const canRedo = commandSystem.canRedo();
```

### HistoryTree

Branching history for exploratory workflows.

```typescript
import { HistoryTree } from '@sim4d/engine-core';

const history = new HistoryTree();

// Add states
const nodeId = history.addNode(state, parentId);

// Branch history
const branchId = history.branch(fromNodeId);

// Navigate
history.goTo(nodeId);
const current = history.getCurrent();
const branches = history.getBranches();

// Export/Import
const serialized = history.serialize();
history.deserialize(serialized);
```

## Evaluation Process

The DAGEngine follows this evaluation sequence:

1. **Dependency Analysis**: Build dependency graph from edges
2. **Topological Sort**: Determine evaluation order using Kahn's algorithm
3. **Dirty Propagation**: Find all nodes affected by dirty nodes
4. **Evaluation Loop**:
   - Check cache for existing results
   - Collect input values from upstream nodes
   - Execute node evaluation function
   - Cache results with content-addressed hash
   - Update node outputs and state
5. **Error Handling**: Capture and report evaluation errors

## Caching Strategy

The cache uses a multi-level key system:

- **Primary Key**: Hash of (nodeId, inputHashes, paramHash)
- **LRU Eviction**: Least recently used items removed when cache is full
- **Statistics**: Track hit/miss rates for optimization

## Performance Considerations

- **Parallel Evaluation**: Independent nodes can evaluate concurrently
- **Incremental Updates**: Only dirty nodes and dependents re-evaluate
- **Memory Management**: Configure cache size based on available memory
- **Worker Pooling**: Reuse workers to avoid initialization overhead

## Error Handling

```typescript
try {
  await engine.evaluate(graph, dirtyNodes);
} catch (error) {
  if (error.message.includes('Circular dependency')) {
    // Handle circular dependency
  } else if (error.message.includes('Unknown node type')) {
    // Handle missing node type
  } else {
    // Handle general evaluation error
  }
}
```

## Testing

The package includes comprehensive tests for all components:

```bash
# Run tests
pnpm test

# Run with coverage
pnpm test --coverage
```

Current test coverage: **98.1%** for DAGEngine, **60%** for cache.

## API Reference

### Types

```typescript
interface DAGEngineOptions {
  worker: WorkerAPI;
  cache?: ComputeCache;
  registry?: NodeRegistry;
}

interface NodeDefinition {
  type: string;
  params: Record<string, ParamDefinition>;
  inputs: Record<string, string>;
  outputs: Record<string, string>;
  evaluate: (ctx: EvalContext, inputs: any, params: any) => Promise<any>;
}

interface EvalContext {
  nodeId: string;
  graph: GraphInstance;
  cache: Map<string, any>;
  worker: WorkerAPI;
  abort: AbortController;
}
```

## License

MPL-2.0 - See LICENSE in repository root
