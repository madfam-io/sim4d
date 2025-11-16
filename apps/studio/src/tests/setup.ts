import { beforeAll, afterEach, afterAll, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';

// Mock global objects for testing
beforeAll(() => {
  // Mock ResizeObserver
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));

  // Mock IntersectionObserver
  global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));

  // Mock PerformanceObserver
  const mockPerformanceObserver = vi.fn();
  mockPerformanceObserver.prototype.observe = vi.fn();
  mockPerformanceObserver.prototype.disconnect = vi.fn();
  mockPerformanceObserver.prototype.takeRecords = vi.fn(() => []);
  // Add supportedEntryTypes as a static property
  Object.defineProperty(mockPerformanceObserver, 'supportedEntryTypes', {
    value: ['measure', 'navigation'],
    writable: false,
    enumerable: true,
    configurable: true,
  });

  global.PerformanceObserver = mockPerformanceObserver as any;

  // Mock requestAnimationFrame
  global.requestAnimationFrame = vi.fn((cb) => {
    setTimeout(cb, 0);
    return 0;
  });

  global.cancelAnimationFrame = vi.fn();

  // Mock matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });

  // Mock scrollTo
  window.scrollTo = vi.fn();

  // Mock localStorage
  const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  };
  global.localStorage = localStorageMock as any;

  // Mock performance.memory for performance monitoring tests
  Object.defineProperty(performance, 'memory', {
    configurable: true,
    get: () => ({
      usedJSHeapSize: 100000000,
      totalJSHeapSize: 200000000,
      jsHeapSizeLimit: 500000000,
    }),
  });

  // Mock Worker for web worker tests
  class WorkerMock {
    onmessage: ((e: MessageEvent) => void) | null = null;
    postMessage = vi.fn();
    terminate = vi.fn();
    addEventListener = vi.fn();
    removeEventListener = vi.fn();
    dispatchEvent = vi.fn();
  }
  global.Worker = WorkerMock as any;

  // Mock for web worker self
  if (typeof self === 'undefined') {
    (global as any).self = global;
  }

  // Mock console methods to reduce test output noise
  global.console = {
    ...console,
    log: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  };
});

afterEach(() => {
  vi.clearAllMocks();
});

afterAll(() => {
  vi.restoreAllMocks();
});

// Mock React components that might have issues in test environment
vi.mock('react-confetti', () => ({
  default: vi.fn(() => null),
}));

vi.mock('react-joyride', () => ({
  default: vi.fn(() => null),
}));

vi.mock('three', () => ({
  WebGLRenderer: vi.fn(),
  Scene: vi.fn(),
  PerspectiveCamera: vi.fn(),
  DirectionalLight: vi.fn(),
  AmbientLight: vi.fn(),
  GridHelper: vi.fn(),
  AxesHelper: vi.fn(),
  Vector3: vi.fn(),
  Color: vi.fn(),
}));

// Mock the worker modules to prevent issues in test environment
vi.mock('@brepflow/engine-occt', () => ({
  createOCCTEngine: vi.fn(() => ({
    execute: vi.fn(),
    dispose: vi.fn(),
  })),
  MockOCCTBinding: vi.fn(),
  getGeometryAPI: vi.fn(() => ({
    init: vi.fn().mockResolvedValue(undefined),
    initialize: vi.fn().mockResolvedValue(undefined),
    execute: vi.fn().mockResolvedValue({ success: true }),
    dispose: vi.fn(),
    isReady: vi.fn().mockResolvedValue(true),
  })),
}));

// Mock @brepflow/engine-core
vi.mock('@brepflow/engine-core', () => {
  // Store instances to allow reset between tests
  const graphManagerInstances: any[] = [];

  class MockGraphManager {
    graph: any;

    constructor() {
      this.graph = {
        version: '0.1.0',
        units: 'mm',
        tolerance: 0.001,
        nodes: [],
        edges: [],
      };
      graphManagerInstances.push(this);
    }

    getGraph() {
      return this.graph;
    }

    setGraph(graph: any) {
      this.graph = graph;
    }

    addNode(node: any) {
      const newNode = {
        ...node,
        id: Math.random().toString(36).substr(2, 9),
        dirty: true,
      };
      this.graph.nodes.push(newNode);
      return newNode;
    }

    removeNode(nodeId: any) {
      this.graph.nodes = this.graph.nodes.filter((n: any) => n.id !== nodeId);
      this.graph.edges = this.graph.edges.filter(
        (e: any) => e.source !== nodeId && e.target !== nodeId
      );
    }

    updateNode(nodeId: any, updates: any) {
      const node = this.graph.nodes.find((n: any) => n.id === nodeId);
      if (node) {
        Object.assign(node, updates);
        node.dirty = true;
      }
    }

    addEdge(edge: any) {
      const newEdge = {
        ...edge,
        id: Math.random().toString(36).substr(2, 9),
      };
      this.graph.edges.push(newEdge);
      return newEdge;
    }

    removeEdge(edgeId: any) {
      this.graph.edges = this.graph.edges.filter((e: any) => e.id !== edgeId);
    }

    clearGraph() {
      this.graph = {
        version: '0.1.0',
        units: 'mm',
        tolerance: 0.001,
        nodes: [],
        edges: [],
      };
    }

    fromJSON(json: any) {
      try {
        const parsed = JSON.parse(json);
        this.graph = parsed;
      } catch (error) {
        console.error('Failed to parse JSON:', error);
      }
    }

    toJSON() {
      return JSON.stringify(this.graph);
    }

    validate() {
      return { valid: true, errors: [] };
    }

    getNodesByType(type: any) {
      return this.graph.nodes.filter((n: any) => n.type === type);
    }

    getConnectedNodes(nodeId: any) {
      return [];
    }

    markDownstreamDirty(nodeId: any) {
      // Mock implementation
    }

    static resetAll() {
      graphManagerInstances.forEach((instance) => {
        instance.clearGraph();
      });
    }
  }

  class MockDAGEngine {
    async evaluate() {
      return { success: true, results: {} };
    }

    cancel() {}

    dispose() {}
  }

  class MockNodeRegistry {
    static register(node: any) {}
    static get(type: any) {
      return { type, evaluate: vi.fn() };
    }
    static getAll() {
      return [];
    }
  }

  class MockComputeCache {
    get(key: any) {
      return null;
    }
    set(key: any, value: any) {}
    clear() {}
  }

  return {
    GraphManager: MockGraphManager,
    DAGEngine: MockDAGEngine,
    NodeRegistry: MockNodeRegistry,
    ComputeCache: MockComputeCache,
  };
});

// Mock @brepflow/nodes-core
vi.mock('@brepflow/nodes-core', () => ({
  registerCoreNodes: vi.fn(),
}));

// Mock lib/undo-redo
vi.mock('../lib/undo-redo', () => {
  class MockUndoRedoManager {
    undoStack: any[] = [];
    redoStack: any[] = [];
    maxHistorySize = 100;

    execute(command: any) {
      command.execute();
      this.undoStack.push(command);
      this.redoStack = [];

      // Limit history size like the real implementation
      if (this.undoStack.length > this.maxHistorySize) {
        this.undoStack.shift();
      }
    }

    undo() {
      if (this.undoStack.length > 0) {
        const command = this.undoStack.pop();
        command.undo();
        this.redoStack.push(command);
      }
    }

    redo() {
      if (this.redoStack.length > 0) {
        const command = this.redoStack.pop();
        command.execute();
        this.undoStack.push(command);
      }
    }

    canUndo() {
      return this.undoStack.length > 0;
    }

    canRedo() {
      return this.redoStack.length > 0;
    }

    clear() {
      this.undoStack = [];
      this.redoStack = [];
    }

    getHistory() {
      return [...this.undoStack];
    }
  }

  class MockAddNodeCommand {
    node: any;
    executeFunc: any;
    undoFunc: any;

    constructor(node: any, execute: any, undo: any) {
      this.node = node;
      this.executeFunc = execute;
      this.undoFunc = undo;
      // Add description property as a getter
      Object.defineProperty(this, 'description', {
        get: () => `Add ${this.node.type} node`,
        enumerable: true,
      });
    }

    execute() {
      if (this.executeFunc) {
        return this.executeFunc(this.node);
      }
    }

    undo() {
      if (this.undoFunc) {
        this.undoFunc(this.node.id);
      }
    }
  }

  class MockRemoveNodeCommand {
    node: any;
    executeFunc: any;
    undoFunc: any;

    constructor(node: any, execute: any, undo: any) {
      this.node = node;
      this.executeFunc = execute;
      this.undoFunc = undo;
      // Add description property as a getter
      Object.defineProperty(this, 'description', {
        get: () => `Remove ${this.node.type} node`,
        enumerable: true,
      });
    }

    execute() {
      if (this.undoFunc) {
        this.undoFunc(this.node.id);
      }
    }

    undo() {
      if (this.executeFunc) {
        this.executeFunc(this.node);
      }
    }
  }

  class MockUpdateNodeCommand {
    nodeId: any;
    oldState: any;
    updates: any;
    apply: any;

    constructor(nodeId: any, oldState: any, updates: any, apply: any) {
      this.nodeId = nodeId;
      this.oldState = oldState;
      this.updates = updates;
      this.apply = apply;
      // Add description property as a getter
      Object.defineProperty(this, 'description', {
        get: () => `Update node parameters`,
        enumerable: true,
      });
    }

    execute() {
      if (this.apply) {
        this.apply(this.nodeId, this.updates);
      }
    }

    undo() {
      if (this.apply) {
        this.apply(this.nodeId, this.oldState);
      }
    }
  }

  class MockAddEdgeCommand {
    edge: any;
    executeFunc: any;
    undoFunc: any;

    constructor(edge: any, execute: any, undo: any) {
      this.edge = edge;
      this.executeFunc = execute;
      this.undoFunc = undo;
      // Add description property as a getter
      Object.defineProperty(this, 'description', {
        get: () => `Connect nodes`,
        enumerable: true,
      });
    }

    execute() {
      if (this.executeFunc) {
        return this.executeFunc(this.edge);
      }
    }

    undo() {
      if (this.undoFunc) {
        this.undoFunc(this.edge.id);
      }
    }
  }

  class MockRemoveEdgeCommand {
    edge: any;
    executeFunc: any;
    undoFunc: any;

    constructor(edge: any, execute: any, undo: any) {
      this.edge = edge;
      this.executeFunc = execute;
      this.undoFunc = undo;
      // Add description property as a getter
      Object.defineProperty(this, 'description', {
        get: () => `Disconnect nodes`,
        enumerable: true,
      });
    }

    execute() {
      if (this.undoFunc) {
        this.undoFunc(this.edge.id);
      }
    }

    undo() {
      if (this.executeFunc) {
        this.executeFunc(this.edge);
      }
    }
  }

  return {
    UndoRedoManager: MockUndoRedoManager,
    AddNodeCommand: MockAddNodeCommand,
    RemoveNodeCommand: MockRemoveNodeCommand,
    UpdateNodeCommand: MockUpdateNodeCommand,
    AddEdgeCommand: MockAddEdgeCommand,
    RemoveEdgeCommand: MockRemoveEdgeCommand,
  };
});

// Mock lib/error-handling
vi.mock('../lib/error-handling/error-manager', () => ({
  ErrorManager: {
    getInstance: vi.fn(() => ({
      reportError: vi.fn(),
      clearErrors: vi.fn(),
      // Add event handling methods for useErrorMonitoring
      on: vi.fn(),
      off: vi.fn(),
      getActiveErrors: vi.fn(() => []),
      resolveError: vi.fn(),
    })),
  },
  ErrorCode: {
    GRAPH_INVALID: 'GRAPH_INVALID',
    NODE_NOT_FOUND: 'NODE_NOT_FOUND',
    EDGE_NOT_FOUND: 'EDGE_NOT_FOUND',
  },
}));

// Mock lib/monitoring/index
vi.mock('../lib/monitoring', () => ({
  initializeMonitoring: vi.fn(() =>
    Promise.resolve({
      initialize: vi.fn().mockResolvedValue(undefined),
      start: vi.fn(),
      stop: vi.fn(),
      recordMetric: vi.fn(),
      recordEvent: vi.fn(),
    })
  ),
  MonitoringSystem: {
    getInstance: vi.fn(() => ({
      initialize: vi.fn().mockResolvedValue(undefined),
      start: vi.fn(),
      stop: vi.fn(),
      recordMetric: vi.fn(),
      recordEvent: vi.fn(),
    })),
  },
}));

// Mock lib/monitoring
vi.mock('../lib/monitoring/metrics-collector', () => ({
  MetricsCollector: {
    getInstance: vi.fn(() => ({
      recordMetric: vi.fn(),
      incrementCounter: vi.fn(),
      recordTiming: vi.fn(),
      setGauge: vi.fn(),
      recordHistogram: vi.fn(),
      startTimer: vi.fn(() => vi.fn()),
      exportMetrics: vi.fn(() => ({
        counters: {},
        timers: {},
        gauges: {},
        histograms: {},
      })),
    })),
  },
}));

vi.mock('../lib/monitoring/monitoring-system', () => ({
  MonitoringSystem: {
    getInstance: vi.fn(() => ({
      initialize: vi.fn().mockResolvedValue(undefined),
      start: vi.fn(),
      stop: vi.fn(),
      recordMetric: vi.fn(),
      recordEvent: vi.fn(),
      startOperation: vi.fn(() => vi.fn()),
      measureFrameRate: vi.fn(),
      getMetrics: vi.fn(() => ({
        fps: 60,
        frameTime: 16.67,
        memory: { used: 100000000, total: 200000000, limit: 500000000 },
      })),
      // Add missing methods for useMonitoring tests
      recordUserInteraction: vi.fn(),
      executeMonitoredOperation: vi.fn(async (operation) => await operation()),
      executeWasmOperation: vi.fn(async (operation) => await operation()),
      executeNetworkOperation: vi.fn(async (operation) => await operation()),
      getMonitoringDashboard: vi.fn(() => ({
        systemHealth: { status: 'healthy', cpu: 45, memory: 60 },
        activeAlerts: [],
      })),
    })),
  },
}));

// Mock layout presets
vi.mock('../config/layout-presets', () => ({
  LAYOUT_PRESETS: {
    guided: { id: 'guided', name: 'Guided Learning' },
    professional: { id: 'professional', name: 'Professional' },
    modeling: { id: 'modeling', name: 'Modeling' },
    nodeFocused: { id: 'nodeFocused', name: 'Node Focused' },
  },
}));

// Mock comlink for worker communication
vi.mock('comlink', () => ({
  wrap: vi.fn((worker) => ({
    execute: vi.fn(),
    dispose: vi.fn(),
  })),
  expose: vi.fn(),
  transfer: vi.fn((value) => value),
  transferHandlers: new Map(),
}));
