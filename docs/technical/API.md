# BrepFlow API Documentation

## Table of Contents

- [Core Types](#core-types)
- [DAG Engine API](#dag-engine-api)
- [Graph Manager API](#graph-manager-api)
- [Node Registry API](#node-registry-api)
- [Geometry API](#geometry-api)
- [Node Definitions](#node-definitions)
- [Worker API](#worker-api)

## Core Types

### GraphInstance

```typescript
interface GraphInstance {
  version: string;
  units: 'mm' | 'cm' | 'm' | 'in';
  tolerance: number;
  nodes: NodeInstance[];
  edges: Edge[];
  metadata?: {
    created?: string;
    author?: string;
    description?: string;
  };
}
```

### NodeInstance

```typescript
interface NodeInstance {
  id: NodeId;
  type: string;
  position?: { x: number; y: number };
  inputs: { [key: string]: SocketRef | SocketRef[] | null };
  params: { [key: string]: any };
  outputs?: { [key: string]: any };
  state?: {
    error?: string;
    warning?: string;
    executionTime?: number;
  };
  dirty?: boolean;
}
```

### Edge

```typescript
interface Edge {
  id: string;
  source: NodeId;
  sourceHandle: SocketId;
  target: NodeId;
  targetHandle: SocketId;
}
```

## DAG Engine API

### DAGEngine Class

#### Constructor

```typescript
constructor(options?: {
  worker?: WorkerAPI;
  cache?: ComputeCache;
  maxConcurrency?: number;
})
```

#### evaluate

Evaluates dirty nodes in the graph

```typescript
async evaluate(
  graph: GraphInstance,
  dirtyNodes: Set<NodeId>
): Promise<void>
```

#### cancel

Cancels specific node evaluation

```typescript
cancel(nodeId: NodeId): void
```

#### cancelAll

Cancels all running evaluations

```typescript
cancelAll(): void
```

#### clearCache

Clears the compute cache

```typescript
clearCache(): void
```

### Example Usage

```typescript
import { DAGEngine } from '@brepflow/engine-core';

const engine = new DAGEngine({
  maxConcurrency: 4,
});

const dirtyNodes = new Set(['node1', 'node2']);
await engine.evaluate(graph, dirtyNodes);
```

## Graph Manager API

### GraphManager Class

#### Constructor

```typescript
constructor(graph?: GraphInstance)
```

#### Node Operations

##### addNode

```typescript
addNode(node: Omit<NodeInstance, 'id'>): NodeInstance
```

##### removeNode

```typescript
removeNode(nodeId: NodeId): void
```

##### updateNode

```typescript
updateNode(nodeId: NodeId, updates: Partial<NodeInstance>): void
```

##### getNode

```typescript
getNode(nodeId: NodeId): NodeInstance | undefined
```

#### Edge Operations

##### addEdge

```typescript
addEdge(edge: Omit<Edge, 'id'>): Edge
```

##### removeEdge

```typescript
removeEdge(edgeId: string): void
```

##### getConnectedEdges

```typescript
getConnectedEdges(nodeId: NodeId): Edge[]
```

#### Graph Operations

##### validate

```typescript
validate(): string[]
```

##### detectCycles

```typescript
detectCycles(): void // throws if cycle detected
```

##### getDirtyNodes

```typescript
getDirtyNodes(): Set<NodeId>
```

##### clearDirtyFlags

```typescript
clearDirtyFlags(): void
```

##### toJSON

```typescript
toJSON(): string
```

##### fromJSON

```typescript
fromJSON(json: string): void
```

### Example Usage

```typescript
import { GraphManager } from '@brepflow/engine-core';

const manager = new GraphManager();

// Add nodes
const boxNode = manager.addNode({
  type: 'Solid::Box',
  position: { x: 100, y: 100 },
  params: { width: 100, height: 100, depth: 100 },
});

// Add edges
const edge = manager.addEdge({
  source: boxNode.id,
  sourceHandle: 'shape',
  target: 'fillet-node',
  targetHandle: 'input',
});

// Validate graph
const errors = manager.validate();
```

## Node Registry API

### NodeRegistry Class

#### register

```typescript
static register(definition: NodeDefinition): void
```

#### get

```typescript
static get(type: string): NodeDefinition | undefined
```

#### getAll

```typescript
static getAll(): Map<string, NodeDefinition>
```

#### getCategories

```typescript
static getCategories(): string[]
```

### NodeDefinition Interface

```typescript
interface NodeDefinition<I = any, O = any, P = any> {
  type: string;
  category?: string;
  inputs: SocketSpec<I>;
  outputs: SocketSpec<O>;
  params: ParamSpec<P>;
  evaluate: (ctx: EvalContext, inputs: I, params: P) => Promise<O>;
}
```

## Geometry API

### GeometryAPI Class

#### createLine

```typescript
async createLine(
  start: Vec3,
  end: Vec3
): Promise<ShapeHandle>
```

#### createCircle

```typescript
async createCircle(
  center: Vec3,
  radius: number,
  normal: Vec3
): Promise<ShapeHandle>
```

#### createBox

```typescript
async createBox(
  center: Vec3,
  width: number,
  height: number,
  depth: number
): Promise<ShapeHandle>
```

#### createCylinder

```typescript
async createCylinder(
  center: Vec3,
  axis: Vec3,
  radius: number,
  height: number
): Promise<ShapeHandle>
```

#### Boolean Operations

##### booleanUnion

```typescript
async booleanUnion(
  shapes: ShapeHandle[]
): Promise<ShapeHandle>
```

##### booleanSubtract

```typescript
async booleanSubtract(
  base: ShapeHandle,
  tools: ShapeHandle[]
): Promise<ShapeHandle>
```

##### booleanIntersect

```typescript
async booleanIntersect(
  shapes: ShapeHandle[]
): Promise<ShapeHandle>
```

#### Transformation Operations

##### transform

```typescript
async transform(
  shape: ShapeHandle,
  matrix: Mat4
): Promise<ShapeHandle>
```

##### translate

```typescript
async translate(
  shape: ShapeHandle,
  offset: Vec3
): Promise<ShapeHandle>
```

##### rotate

```typescript
async rotate(
  shape: ShapeHandle,
  axis: Vec3,
  angle: number,
  origin?: Vec3
): Promise<ShapeHandle>
```

#### Feature Operations

##### fillet

```typescript
async fillet(
  shape: ShapeHandle,
  radius: number,
  edges?: ShapeHandle[]
): Promise<ShapeHandle>
```

##### chamfer

```typescript
async chamfer(
  shape: ShapeHandle,
  distance: number,
  edges?: ShapeHandle[]
): Promise<ShapeHandle>
```

##### shell

```typescript
async shell(
  shape: ShapeHandle,
  thickness: number,
  faces?: ShapeHandle[]
): Promise<ShapeHandle>
```

## Node Definitions

### Sketch Nodes

#### Line Node

```typescript
type: 'Sketch::Line';
inputs: {
}
params: {
  start: Vec3;
  end: Vec3;
}
outputs: {
  curve: ShapeHandle;
}
```

#### Circle Node

```typescript
type: 'Sketch::Circle';
inputs: {
}
params: {
  center: Vec3;
  radius: number;
  normal: Vec3;
}
outputs: {
  curve: ShapeHandle;
}
```

### Solid Nodes

#### Box Node

```typescript
type: 'Solid::Box';
inputs: {
}
params: {
  center: Vec3;
  width: number;
  height: number;
  depth: number;
}
outputs: {
  shape: ShapeHandle;
}
```

#### Extrude Node

```typescript
type: 'Solid::Extrude'
inputs: {
  profile: ShapeHandle
}
params: {
  distance: number
  direction: Vec3
  draft?: number
}
outputs: {
  shape: ShapeHandle
}
```

### Boolean Nodes

#### Union Node

```typescript
type: 'Boolean::Union'
inputs: {
  shapes: ShapeHandle[]
}
params: {
  simplify?: boolean
}
outputs: {
  shape: ShapeHandle
}
```

#### Subtract Node

```typescript
type: 'Boolean::Subtract'
inputs: {
  base: ShapeHandle
  tools: ShapeHandle[]
}
params: {
  simplify?: boolean
}
outputs: {
  shape: ShapeHandle
}
```

### Feature Nodes

#### Fillet Node

```typescript
type: 'Features::Fillet'
inputs: {
  shape: ShapeHandle
}
params: {
  radius: number
  selectAll?: boolean
}
outputs: {
  shape: ShapeHandle
}
```

## Worker API

### WorkerClient Class

#### Constructor

```typescript
constructor(workerUrl?: string)
```

#### init

Initialize the worker

```typescript
async init(): Promise<void>
```

#### invoke

Invoke geometry operation

```typescript
async invoke<T = any>(
  operation: string,
  params: any
): Promise<T>
```

#### tessellate

Convert shape to mesh

```typescript
async tessellate(
  shapeId: string,
  deflection: number
): Promise<MeshData>
```

#### dispose

Dispose geometry handle

```typescript
async dispose(handleId: string): Promise<void>
```

#### terminate

Terminate worker

```typescript
terminate(): void
```

### Worker Message Types

#### WorkerRequest

```typescript
type WorkerRequest =
  | InitRequest
  | CreateLineRequest
  | CreateBoxRequest
  | BooleanUnionRequest
  | TessellateRequest
  | DisposeRequest;
// ... etc
```

#### WorkerResponse

```typescript
interface WorkerResponse<T = any> {
  id: string;
  success: boolean;
  result?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}
```

## Store API (Zustand)

### useGraphStore Hook

```typescript
const {
  // State
  graph,
  selectedNodes,
  isEvaluating,
  errors,

  // Actions
  addNode,
  removeNode,
  updateNode,
  addEdge,
  removeEdge,

  // Selection
  selectNode,
  clearSelection,

  // Evaluation
  evaluateGraph,
  cancelEvaluation,

  // File Operations
  importGraph,
  exportGraph,
  clearGraph,
} = useGraphStore();
```

## CLI API

### Commands

#### render

Render a graph file

```bash
brepflow render <file> [options]
  --output, -o     Output file path
  --format, -f     Output format (step|stl|obj)
  --params, -p     Parameter overrides (JSON)
```

#### validate

Validate a graph file

```bash
brepflow validate <file> [options]
  --verbose, -v   Show detailed validation
```

#### sweep

Parameter sweep generation

```bash
brepflow sweep <file> [options]
  --param, -p     Parameter to sweep
  --values, -v    Values to sweep (comma-separated)
  --output, -o    Output directory
```

#### info

Display graph information

```bash
brepflow info <file> [options]
  --nodes         List all nodes
  --params        List all parameters
  --stats         Show statistics
```

## Error Codes

### Geometry Errors

- `GEOM_001`: Invalid geometry input
- `GEOM_002`: Boolean operation failed
- `GEOM_003`: Tessellation failed
- `GEOM_004`: Invalid transformation

### Graph Errors

- `GRAPH_001`: Cycle detected
- `GRAPH_002`: Missing input connection
- `GRAPH_003`: Type mismatch
- `GRAPH_004`: Invalid node type

### Worker Errors

- `WORKER_001`: Worker initialization failed
- `WORKER_002`: Worker timeout
- `WORKER_003`: Worker crashed
- `WORKER_004`: Invalid message format

## WebSocket API (Future)

### Connection

```typescript
const ws = new WebSocket('ws://localhost:8080/graph');

ws.onmessage = (event) => {
  const update = JSON.parse(event.data);
  // Handle graph updates
};
```

### Message Types

```typescript
type WSMessage =
  | { type: 'NODE_UPDATE'; payload: NodeInstance }
  | { type: 'EDGE_ADD'; payload: Edge }
  | { type: 'EVALUATION_START'; payload: NodeId[] }
  | { type: 'EVALUATION_COMPLETE'; payload: Results };
```
