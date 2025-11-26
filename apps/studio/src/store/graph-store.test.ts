import { beforeEach, describe, expect, it, vi } from 'vitest';

const dagInstances: any[] = [];
const dagEvaluateMock = vi.fn();

vi.mock('@sim4d/nodes-core', () => ({
  registerCoreNodes: vi.fn(),
}));

vi.mock('@sim4d/engine-core', async () => {
  const actual = await vi.importActual<any>('@sim4d/engine-core');

  class MockComputeCache {
    private cache = new Map<string, any>();
    get(key: string) {
      return this.cache.get(key);
    }
    set(key: string, value: any) {
      this.cache.set(key, value);
    }
    clear() {
      this.cache.clear();
    }
  }

  class MockDAGEngine {
    public cancelAll = vi.fn();

    constructor(options: any) {
      dagInstances.push(this);
    }

    async evaluate(graph: any, dirtyNodes: Set<string>) {
      return dagEvaluateMock(graph, dirtyNodes);
    }
  }

  const nodeRegistryMock = {
    getNode: vi.fn(() => ({
      evaluate: vi.fn(async () => ({ result: 'ok' })),
    })),
  };

  return {
    ...actual,
    DAGEngine: MockDAGEngine,
    ComputeCache: MockComputeCache,
    NodeRegistry: {
      getInstance: vi.fn(() => nodeRegistryMock),
    },
  };
});

const geometryInitMock = vi.fn();
const geometryExecuteMock = vi.fn();

vi.mock('../services/geometry-api', () => ({
  getGeometryAPI: vi.fn(async () => ({
    init: geometryInitMock.mockResolvedValue(undefined),
    invoke: geometryExecuteMock,
  })),
}));

const metricsCollectorMock = {
  incrementCounter: vi.fn(),
  recordTiming: vi.fn(),
};

vi.mock('../lib/monitoring/metrics-collector', async () => {
  const actual = await vi.importActual<any>('../lib/monitoring/metrics-collector');
  return {
    ...actual,
    MetricsCollector: {
      getInstance: vi.fn(() => metricsCollectorMock),
    },
  };
});

const errorManagerMock = {
  fromJavaScriptError: vi.fn(),
  createError: vi.fn(),
};

vi.mock('../lib/error-handling/error-manager', async () => {
  const actual = await vi.importActual<any>('../lib/error-handling/error-manager');
  return {
    ...actual,
    ErrorManager: {
      getInstance: vi.fn(() => errorManagerMock),
    },
  };
});

const undoRedoManagerMock = {
  undo: vi.fn(),
  redo: vi.fn(),
  canUndo: vi.fn(() => false),
  canRedo: vi.fn(() => false),
  clear: vi.fn(),
  execute: vi.fn(),
};

vi.mock('../lib/undo-redo', () => ({
  UndoRedoManager: vi.fn(() => undoRedoManagerMock),
  AddNodeCommand: class {},
  RemoveNodeCommand: class {},
  UpdateNodeCommand: class {},
  AddEdgeCommand: class {},
  RemoveEdgeCommand: class {},
}));

const flushMicrotasks = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('graph-store', () => {
  let useGraphStore: typeof import('./graph-store').useGraphStore;

  beforeEach(async () => {
    dagInstances.length = 0;
    dagEvaluateMock.mockReset();
    dagEvaluateMock.mockImplementation(async (graph) => {
      for (const node of graph.nodes) {
        node.outputs = { result: `evaluated-${node.id}` };
        node.dirty = false;
      }
    });

    geometryInitMock.mockClear();
    geometryExecuteMock.mockClear();
    metricsCollectorMock.incrementCounter.mockClear();
    metricsCollectorMock.recordTiming.mockClear();
    Object.values(errorManagerMock).forEach((fn) => fn.mockClear());
    Object.values(undoRedoManagerMock).forEach((fn) => fn.mockClear?.());

    vi.resetModules();
    ({ useGraphStore } = await import('./graph-store'));
    await flushMicrotasks();
  });

  it('updates graph state via setGraph', () => {
    const newGraph = {
      version: '0.1.0',
      units: 'mm' as const,
      tolerance: 0.001,
      nodes: [],
      edges: [],
    };

    useGraphStore.getState().setGraph(newGraph);

    expect(useGraphStore.getState().graph).toBe(newGraph);
    expect(useGraphStore.getState().errors.size).toBe(0);
  });

  it('adds nodes through addNode helper', () => {
    const node = useGraphStore.getState().addNode({
      type: 'Test::Node',
      inputs: {},
      outputs: {},
      params: {},
    });

    const graph = useGraphStore.getState().graph;
    expect(graph.nodes).toHaveLength(1);
    expect(graph.nodes[0].id).toBe(node.id);
    expect(node.dirty).toBe(true);
  });

  it('evaluates graph and marks completion', async () => {
    useGraphStore.getState().addNode({
      type: 'Test::Node',
      inputs: {},
      outputs: {},
      params: {},
    });

    await useGraphStore.getState().evaluateGraph();

    const state = useGraphStore.getState();
    expect(state.isEvaluating).toBe(false);
    expect(state.evaluationProgress).toBe(100);
    expect(state.graph.nodes[0].outputs).toEqual({ result: expect.stringMatching(/^evaluated-/) });
    expect(metricsCollectorMock.recordTiming).toHaveBeenCalledWith(
      'graph_evaluation_duration_ms',
      expect.any(Number)
    );
  });

  it('handles evaluation failures gracefully', async () => {
    dagEvaluateMock.mockImplementationOnce(async () => {
      throw new Error('evaluation failed');
    });

    useGraphStore.getState().addNode({
      type: 'Test::Node',
      inputs: {},
      outputs: {},
      params: {},
    });

    await useGraphStore.getState().evaluateGraph();

    const state = useGraphStore.getState();
    expect(state.isEvaluating).toBe(false);
    expect(state.evaluationProgress).toBe(0);
    expect(errorManagerMock.fromJavaScriptError).toHaveBeenCalled();
  });

  it('cancels evaluation through cancelEvaluation', () => {
    const instance = dagInstances[0];
    expect(instance).toBeDefined();

    useGraphStore.getState().cancelEvaluation();

    expect(instance.cancelAll).toHaveBeenCalled();
    expect(useGraphStore.getState().isEvaluating).toBe(false);
  });

  it('clears graph and undo history via clearGraph', () => {
    useGraphStore.getState().addNode({
      type: 'Test::Node',
      inputs: {},
      outputs: {},
      params: {},
    });

    useGraphStore.getState().clearGraph();

    const graph = useGraphStore.getState().graph;
    expect(graph.nodes).toHaveLength(0);
    expect(graph.edges).toHaveLength(0);
    expect(undoRedoManagerMock.clear).toHaveBeenCalled();
  });

  it('tracks node selection helpers', () => {
    useGraphStore.getState().selectNode('node-1');
    useGraphStore.getState().selectNodes(['node-1', 'node-2']);
    expect(Array.from(useGraphStore.getState().selectedNodes)).toEqual(['node-1', 'node-2']);

    useGraphStore.getState().deselectNode('node-1');
    expect(Array.from(useGraphStore.getState().selectedNodes)).toEqual(['node-2']);

    useGraphStore.getState().clearSelection();
    expect(useGraphStore.getState().selectedNodes.size).toBe(0);
  });

  it('records node specific errors', () => {
    useGraphStore.getState().setError('node-1', 'Failed to compute');
    expect(useGraphStore.getState().errors.get('node-1')).toBe('Failed to compute');

    useGraphStore.getState().clearErrors();
    expect(useGraphStore.getState().errors.size).toBe(0);
  });
});
