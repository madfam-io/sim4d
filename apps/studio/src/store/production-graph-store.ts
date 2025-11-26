/**
 * Production-ready graph store with proper error handling
 * No mock fallbacks - uses real geometry or fails appropriately
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist } from 'zustand/middleware';
import {
  Node,
  Edge,
  Connection,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  NodeChange,
  EdgeChange,
} from 'reactflow';
import { DAGEngine } from '@sim4d/engine-core';
import { getGeometryAPI } from '../services/geometry-api';
import { v4 as uuidv4 } from 'uuid';
import { getConfig } from '@sim4d/engine-core';
import type { GraphInstance, NodeId } from '@sim4d/types';
import { createNodeId } from '@sim4d/types';

// Lazy logger initialization to avoid constructor issues during module loading
interface Logger {
  info(message: string, ...args: unknown[]): void;
  error(message: string, ...args: unknown[]): void;
  warn(message: string, ...args: unknown[]): void;
  debug(message: string, ...args: unknown[]): void;
  startTimer(label: string): () => void;
}

let logger: Logger | null = null;
const getLogger = (): Logger => {
  if (!logger) {
    const { ProductionLogger } = require('@sim4d/engine-occt');
    logger = new ProductionLogger('GraphStore');
  }
  return logger;
};

export type NodeData = {
  label: string;
  type: string;
  inputs: Record<string, unknown>;
  outputs: Record<string, unknown>;
  params: Record<string, unknown>;
  status: 'idle' | 'evaluating' | 'success' | 'error';
  error?: string;
};

export interface ExportedGraph {
  version: string;
  timestamp: string;
  geometryVersion: string | null;
  nodes: Array<{
    id: string;
    type: string;
    position: { x: number; y: number };
    data: {
      params: Record<string, unknown>;
      label: string;
    };
  }>;
  edges: Array<{
    id?: string;
    source: string;
    target: string;
    sourceHandle?: string | null;
    targetHandle?: string | null;
  }>;
}

export type GraphState = {
  nodes: Node<NodeData>[];
  edges: Edge[];
  dagEngine: DAGEngine | null;
  isInitialized: boolean;
  initError: string | null;
  initializationError: string | null;
  geometryVersion: string | null;
  graph: GraphInstance;
  selectedNodes: string[];

  // Actions
  initializeEngine: () => Promise<void>;
  resetEngine: () => Promise<void>;
  healthCheck: () => Promise<boolean>;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  addNode: (type: string, position: { x: number; y: number }) => void;
  removeNode: (nodeId: string) => void;
  updateNode: (nodeId: string, data: unknown) => void;
  deleteNode: (nodeId: string) => void;
  updateNodeParam: (nodeId: string, paramName: string, value: unknown) => void;
  addEdge: (sourceId: string, sourcePort: string, targetId: string, targetPort: string) => void;
  removeEdge: (edgeId: string) => void;
  selectNode: (nodeId: string | null) => void;
  evaluateGraph: () => Promise<void>;
  clearGraph: () => void;
  exportGraph: () => ExportedGraph;
  importGraph: (data: unknown) => void;
};

export const useProductionGraphStore = create<GraphState>()(
  persist(
    immer((set, get) => {
      const syncGraph = (state: unknown) => {
        state.graph = {
          version: '0.1.0',
          units: 'mm' as const,
          tolerance: 0.001,
          nodes: state.nodes.map((node: Node<NodeData>) => ({
            id: node.id,
            type: node.data.type,
            position: node.position,
            params: node.data.params,
            inputs: node.data.inputs,
            outputs: node.data.outputs,
          })),
          edges: state.edges.map((edge: Edge) => ({
            id: edge.id!,
            source: edge.source,
            target: edge.target,
            sourceHandle: edge.sourceHandle || '',
            targetHandle: edge.targetHandle || '',
          })),
        };
      };

      const initEngine = async () => {
        const state = get();
        if (state.isInitialized && state.dagEngine) {
          getLogger().info('Engine already initialized');
          return state.dagEngine;
        }

        const config = getConfig();

        try {
          getLogger().info('Initializing production geometry engine...');

          if (!config.requireRealOCCT && config.isProduction) {
            throw new Error('Production mode requires real OCCT');
          }

          // Initialize real geometry API
          const geometryAPI = await getGeometryAPI();

          // Verify it's real OCCT
          const initResult = await geometryAPI.invoke('HEALTH_CHECK', {});
          if (!initResult || !(initResult as unknown).healthy) {
            throw new Error('Geometry engine health check failed');
          }

          // Create DAG engine with real geometry
          // Adapt IntegratedGeometryAPI to WorkerAPI interface (shutdown → dispose)
          const workerAPI = {
            ...geometryAPI,
            dispose: () => geometryAPI.shutdown(),
          };
          const engine = new DAGEngine({ worker: workerAPI as unknown });

          getLogger().info('Production geometry engine initialized successfully', {
            version: (initResult as unknown).version,
          });

          return engine;
        } catch (error) {
          getLogger().error('Failed to initialize production geometry engine', error);

          // In production, we fail hard
          if (config.isProduction) {
            throw new Error(
              'Critical: Unable to initialize geometry engine in production. ' +
                'Please ensure OCCT WASM is properly built and deployed.'
            );
          }

          throw error;
        }
      };

      return {
        nodes: [],
        edges: [],
        dagEngine: null,
        isInitialized: false,
        initError: null,
        initializationError: null,
        geometryVersion: null,
        graph: { version: '0.1.0', units: 'mm' as const, tolerance: 0.001, nodes: [], edges: [] },
        selectedNodes: [],

        initializeEngine: async () => {
          set((state) => {
            state.isInitialized = false;
            state.initError = null;
          });

          try {
            const engine = await initEngine();

            // Perform additional validation
            const testBox = await engine.geometryAPI.invoke('MAKE_BOX', {
              width: 10,
              height: 10,
              depth: 10,
              center: { x: 0, y: 0, z: 0 },
            });

            if (!testBox) {
              throw new Error('Geometry engine validation failed: unable to create test shape');
            }

            set((state) => {
              state.dagEngine = engine;
              state.isInitialized = true;
              state.initError = null;
              state.geometryVersion = 'OCCT 7.8.0'; // Get from actual engine
            });

            getLogger().info('Store initialized with production geometry engine');
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            getLogger().error('Store initialization failed', error);

            set((state) => {
              state.dagEngine = null;
              state.isInitialized = false;
              state.initError = errorMessage;
              state.initializationError = errorMessage;
            });

            // Re-throw for UI to handle
            throw error;
          }
        },

        resetEngine: async () => {
          const state = get();

          if (state.dagEngine) {
            try {
              await state.dagEngine.geometryAPI.invoke('CLEANUP', {});
              await state.dagEngine.geometryAPI.invoke('SHUTDOWN', {});
            } catch (error) {
              getLogger().warn('Error during engine cleanup', error);
            }
          }

          set((state) => {
            state.dagEngine = null;
            state.isInitialized = false;
            state.initError = null;
            state.geometryVersion = null;
          });

          // Re-initialize
          await get().initializeEngine();
        },

        healthCheck: async () => {
          const state = get();

          if (!state.dagEngine || !state.isInitialized) {
            return false;
          }

          try {
            const result = await state.dagEngine.geometryAPI.invoke('HEALTH_CHECK', {});
            return !!(result && (result as unknown).healthy);
          } catch (error) {
            getLogger().error('Health check failed', error);
            return false;
          }
        },

        onNodesChange: (changes) => {
          set((state) => {
            state.nodes = applyNodeChanges(changes, state.nodes) as Node<NodeData>[];
            syncGraph(state);
          });
        },

        onEdgesChange: (changes) => {
          set((state) => {
            state.edges = applyEdgeChanges(changes, state.edges);
            syncGraph(state);
          });
        },

        onConnect: (connection) => {
          set((state) => {
            if (connection.source && connection.target) {
              state.edges = addEdge(connection, state.edges);
              syncGraph(state);
            }
          });
        },

        addNode: (type, position) => {
          const nodeId = uuidv4();
          const newNode: Node<NodeData> = {
            id: nodeId,
            type: 'custom',
            position,
            data: {
              label: type.split('::')[1] || type,
              type,
              inputs: {},
              outputs: {},
              params: {},
              status: 'idle',
            },
          };

          set((state) => {
            state.nodes.push(newNode);
            syncGraph(state);
          });

          getLogger().debug('Node added', { nodeId, type });
        },

        deleteNode: (nodeId) => {
          set((state) => {
            state.nodes = state.nodes.filter((node: unknown) => node.id !== nodeId);
            state.edges = state.edges.filter(
              (edge: unknown) => edge.source !== nodeId && edge.target !== nodeId
            );
            syncGraph(state);
          });

          getLogger().debug('Node deleted', { nodeId });
        },

        removeNode: (nodeId) => {
          set((state) => {
            state.nodes = state.nodes.filter((node: unknown) => node.id !== nodeId);
            state.edges = state.edges.filter(
              (edge: unknown) => edge.source !== nodeId && edge.target !== nodeId
            );
            state.selectedNodes = state.selectedNodes.filter((id: string) => id !== nodeId);
            syncGraph(state);
          });
          getLogger().debug('Node removed', { nodeId });
        },

        updateNode: (nodeId, data) => {
          set((state) => {
            const node = state.nodes.find((n: Node<NodeData>) => n.id === nodeId);
            if (node) {
              Object.assign(node.data, data);
              syncGraph(state);
            }
          });
        },

        updateNodeParam: (nodeId, paramName, value) => {
          set((state) => {
            const node = state.nodes.find((n: Node<NodeData>) => n.id === nodeId);
            if (node) {
              node.data.params[paramName] = value;
              syncGraph(state);
            }
          });
        },

        addEdge: (sourceId, sourcePort, targetId, targetPort) => {
          const edgeId = `${sourceId}:${sourcePort}-${targetId}:${targetPort}`;
          set((state) => {
            const newEdge: Edge = {
              id: edgeId,
              source: sourceId,
              sourceHandle: sourcePort,
              target: targetId,
              targetHandle: targetPort,
            };
            state.edges.push(newEdge);
            syncGraph(state);
          });
          getLogger().debug('Edge added', { sourceId, targetId });
        },

        removeEdge: (edgeId) => {
          set((state) => {
            state.edges = state.edges.filter((edge: unknown) => edge.id !== edgeId);
            syncGraph(state);
          });
          getLogger().debug('Edge removed', { edgeId });
        },

        selectNode: (nodeId) => {
          set((state) => {
            if (nodeId === null) {
              state.selectedNodes = [];
            } else {
              state.selectedNodes = [nodeId];
            }
          });
        },

        evaluateGraph: async () => {
          const state = get();
          if (!state.dagEngine) {
            throw new Error('DAG engine not initialized');
          }

          const timer = getLogger().startTimer('Graph evaluation');

          try {
            // Mark all nodes as evaluating
            set((state) => {
              state.nodes.forEach((node: unknown) => {
                node.data.status = 'evaluating';
                node.data.error = undefined;
              });
            });

            // Build graph instance for engine
            const graphInstance = {
              nodes: state.nodes.map((node: unknown) => ({
                id: node.id,
                type: node.data.type,
                params: node.data.params,
                inputs: node.data.inputs,
                outputs: node.data.outputs,
                position: node.position,
              })),
              edges: state.edges.map((edge: unknown) => ({
                id: edge.id!,
                source: edge.source,
                target: edge.target,
                sourceHandle: edge.sourceHandle,
                targetHandle: edge.targetHandle,
              })),
            };

            // Evaluate with dirty propagation
            const dirtyNodes = new Set(state.nodes.map((n) => createNodeId(n.id)));
            await state.dagEngine.evaluate(graphInstance as unknown, dirtyNodes);

            // Update node statuses
            set((state) => {
              state.nodes.forEach((node: unknown) => {
                node.data.status = 'success';
              });
            });

            timer(); // Log evaluation time
          } catch (error) {
            getLogger().error('Graph evaluation failed', error);

            set((state) => {
              state.nodes.forEach((node: unknown) => {
                node.data.status = 'error';
                node.data.error = error instanceof Error ? error.message : 'Evaluation failed';
              });
            });

            throw error;
          }
        },

        clearGraph: () => {
          set((state) => {
            state.nodes = [];
            state.edges = [];
            syncGraph(state);
          });
          getLogger().info('Graph cleared');
        },

        exportGraph: () => {
          const state = get();
          const exportData = {
            version: '1.0.0',
            timestamp: new Date().toISOString(),
            geometryVersion: state.geometryVersion,
            nodes: state.nodes.map((node) => ({
              id: node.id,
              type: node.data.type,
              position: node.position,
              data: {
                params: node.data.params,
                label: node.data.label,
              },
            })),
            edges: state.edges.map((edge) => ({
              id: edge.id,
              source: edge.source,
              target: edge.target,
              sourceHandle: edge.sourceHandle,
              targetHandle: edge.targetHandle,
            })),
          };

          getLogger().info('Graph exported', {
            nodeCount: state.nodes.length,
            edgeCount: state.edges.length,
          });

          return exportData;
        },

        importGraph: (data) => {
          try {
            if (!data.version || !data.nodes) {
              throw new Error('Invalid graph data format');
            }

            set((state) => {
              state.nodes = data.nodes.map((node: unknown) => ({
                ...node,
                data: {
                  ...node.data,
                  inputs: {},
                  outputs: {},
                  status: 'idle',
                },
              }));
              state.edges = data.edges || [];
              syncGraph(state);
            });

            getLogger().info('Graph imported', {
              nodeCount: data.nodes.length,
              edgeCount: data.edges?.length || 0,
            });
          } catch (error) {
            getLogger().error('Graph import failed', error);
            throw error;
          }
        },
      };
    }),
    {
      name: 'sim4d-graph',
      partialize: (state) => ({
        // Only persist graph structure, not engine state
        nodes: state.nodes,
        edges: state.edges,
      }),
    }
  )
);
