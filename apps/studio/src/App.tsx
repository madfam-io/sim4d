import React, { useCallback, useEffect, useState } from 'react';
import ReactFlow, {
  Node as RFNode,
  Edge as RFEdge,
  addEdge,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Connection,
  Panel,
  ReactFlowProvider,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import CustomNode from './components/nodes/CustomNode';

const nodeTypes = {
  default: CustomNode,
  input: CustomNode,
  output: CustomNode,
};

// Augment Window interface for studio API
declare global {
  interface Window {
    studio?: {
      createNode?: (type: string, position: { x: number; y: number }) => void;
      evaluateGraph?: () => void;
      clearGraph?: () => void;
      undo?: () => void;
      redo?: () => void;
      [key: string]: unknown;
    };
  }
}

import { NodePanel } from './components/NodePanel';
import { EnhancedNodePalette } from './components/node-palette/EnhancedNodePalette';
import './components/node-palette/EnhancedNodePalette.css';
import { Viewport } from './components/Viewport';
import { Inspector } from './components/Inspector';
import { Toolbar } from './components/Toolbar';
import { CommandPalette } from './components/CommandPalette';
import { Console } from './components/Console';
import { OnboardingOrchestrator } from './components/onboarding/OnboardingOrchestrator';
import { ResponsiveLayoutManager } from './components/responsive/ResponsiveLayoutManager';
import { useGraphStore } from './store/graph-store';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useErrorTracking } from './hooks/useErrorTracking';
import { convertToReactFlow, convertFromReactFlow } from './utils/graph-converter';
import type { NodeId, SocketId } from '@brepflow/types';
import { createNodeId, createSocketId } from '@brepflow/types';
import {
  ErrorBoundary,
  WASMErrorBoundary,
  GeometryErrorBoundary,
} from './lib/error-handling/error-boundary';
import { MonitoringDashboard } from './components/monitoring/MonitoringDashboard';
import { useMonitoring, useHealthMonitoring } from './hooks/useMonitoring';
import { initializeMonitoring } from './lib/monitoring';
import { Icon } from './components/icons/IconSystem';
import { NodeParameterDialog } from './components/dialogs/NodeParameterDialog';
import { ViewportLayoutManager } from './components/viewport/ViewportLayoutManager';
import './App.css';
import { BrowserWASMTestSuite } from './test-browser-wasm';
import { SessionControls } from './components/SessionControls';
// @ts-expect-error - DTS generation disabled in @brepflow/collaboration due to complex type issues (tracked in technical debt)
import { CollaborationProvider } from '@brepflow/collaboration/client';
// @ts-expect-error - DTS generation disabled in @brepflow/collaboration due to complex type issues (tracked in technical debt)
import type { Operation, Conflict } from '@brepflow/collaboration/client';
import { useSession } from './hooks/useSession';
import { Routes, Route, Navigate } from 'react-router-dom';
import { createChildLogger } from './lib/logging/logger-instance';

// Create module-specific logger
const logger = createChildLogger({ module: 'App' });

function AppContent() {
  const {
    graph,
    selectedNodes,
    addNode,
    removeNode,
    updateNode,
    addEdge: addGraphEdge,
    removeEdge,
    selectNode,
    evaluateGraph,
    clearGraph,
    undo,
    redo,
  } = useGraphStore();

  const { recordUserInteraction, executeWasmOperation } = useMonitoring();
  const { alerts } = useHealthMonitoring();
  const [showMonitoringDashboard, setShowMonitoringDashboard] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);

  // Parameter dialog state
  const [parameterDialog, setParameterDialog] = useState<{
    isOpen: boolean;
    nodeType: string;
    position: { x: number; y: number };
  }>({
    isOpen: false,
    nodeType: '',
    position: { x: 0, y: 0 },
  });

  // Initialize keyboard shortcuts for layout system
  useKeyboardShortcuts();

  // Add keyboard shortcuts for monitoring dashboard and command palette
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl+K to open command palette
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        setShowCommandPalette((prev) => !prev);
        recordUserInteraction({
          type: 'keyboard_shortcut',
          target: 'command_palette_toggle',
        });
      }
      // Ctrl+Shift+M to toggle monitoring dashboard
      if (event.ctrlKey && event.shiftKey && event.key === 'M') {
        event.preventDefault();
        setShowMonitoringDashboard((prev) => !prev);
        recordUserInteraction({
          type: 'keyboard_shortcut',
          target: 'monitoring_dashboard_toggle',
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [recordUserInteraction]);

  // Convert graph to ReactFlow format with enhanced node data
  const errorTracker = useErrorTracking();
  const handleOpenParameterDialog = useCallback(
    (nodeType: string, position: { x: number; y: number }) => {
      setParameterDialog({
        isOpen: true,
        nodeType,
        position,
      });
    },
    []
  );

  const { nodes: rfNodes, edges: rfEdges } = convertToReactFlow(
    graph,
    selectedNodes,
    errorTracker.errors,
    handleOpenParameterDialog
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(rfNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(rfEdges);

  logger.debug('Graph snapshot', {
    storeNodes: graph.nodes.length,
    storeEdges: graph.edges.length,
    reactFlowNodes: rfNodes.length,
    reactFlowEdges: rfEdges.length,
  });

  // Note: Removed problematic force sync to prevent duplicate node creation
  // The useEffect below handles proper synchronization

  // Sync ReactFlow state with graph store
  // Note: Only depend on graph object itself, not graph.nodes/graph.edges to avoid double updates
  useEffect(() => {
    const { nodes: newNodes, edges: newEdges } = convertToReactFlow(
      graph,
      selectedNodes,
      errorTracker.errors
    );
    logger.debug('Syncing nodes from store', {
      nodeCount: newNodes.length,
      edgeCount: newEdges.length,
    });
    setNodes(newNodes);
    setEdges(newEdges);
  }, [graph, selectedNodes, errorTracker.errors]);

  useEffect(() => {
    const studioApi = {
      async createNode(nodeType: string, position: { x: number; y: number } = { x: 180, y: 180 }) {
        return addNode({
          type: nodeType,
          position,
          inputs: {},
          outputs: {},
          params: getDefaultParams(nodeType),
        });
      },
      async evaluateGraph() {
        await evaluateGraph();
        return {
          errors: Array.from(errorTracker.errors.values()).map((error) => error.message),
        };
      },
      clearGraph: () => clearGraph(),
      undo: () => undo(),
      redo: () => redo(),
      getGraphSummary: () => {
        const state = useGraphStore.getState();
        return {
          nodeCount: state.graph.nodes.length,
          edgeCount: state.graph.edges.length,
        };
      },
      getErrors: () => Array.from(errorTracker.errors.values()).map((error) => error.message),
    };

    if (typeof window === 'undefined') {
      return () => undefined;
    }

    const exposeStudioApi = /^(localhost|127\.0\.0\.1)$/.test(window.location.hostname);

    if (!exposeStudioApi) {
      logger.debug('Studio API helpers not exposed outside local development');
      return () => undefined;
    }

    const existing = window.studio ?? {};
    const combined = { ...existing, ...studioApi };
    window.studio = combined;

    return () => {
      if (window.studio === combined) {
        delete window.studio;
      }
    };
  }, [addNode, evaluateGraph, clearGraph, undo, redo, errorTracker]);

  const onConnect = useCallback(
    (params: Connection) => {
      logger.debug('Connection attempt', params);
      if (params.source && params.target) {
        addGraphEdge({
          source: createNodeId(params.source),
          sourceHandle: createSocketId(params.sourceHandle || 'output'),
          target: createNodeId(params.target),
          targetHandle: createSocketId(params.targetHandle || 'input'),
        });
        logger.debug('Edge added', { source: params.source, target: params.target });
      }
    },
    [addGraphEdge]
  );

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: RFNode) => {
      selectNode(createNodeId(node.id));
      recordUserInteraction({
        type: 'node_click',
        ...(node.type && { target: node.type }),
        data: { nodeId: node.id },
      });
    },
    [selectNode, recordUserInteraction]
  );

  const onNodesDelete = useCallback(
    (nodes: RFNode[]) => {
      nodes.forEach((node) => removeNode(createNodeId(node.id)));
    },
    [removeNode]
  );

  const onEdgesDelete = useCallback(
    (edges: RFEdge[]) => {
      edges.forEach((edge) => removeEdge(edge.id));
    },
    [removeEdge]
  );

  // Get default parameters based on node type
  const getDefaultParams = (nodeType: string) => {
    const type = nodeType.split('::')[1]?.toLowerCase();

    switch (type) {
      case 'box':
        return { width: 100, height: 100, depth: 100 };
      case 'cylinder':
        return { radius: 50, height: 100 };
      case 'sphere':
        return { radius: 50 };
      case 'extrude':
        return { distance: 100 };
      case 'revolve':
        return { angle: 360 };
      case 'fillet':
        return { radius: 10 };
      case 'chamfer':
        return { distance: 10 };
      case 'move':
        return { x: 0, y: 0, z: 0 };
      case 'rotate':
        return { x: 0, y: 0, z: 90 };
      case 'scale':
        return { factor: 2 };
      case 'lineararray':
        return { count: 5, spacing: 50 };
      case 'circulararray':
        return { count: 6, angle: 360 };
      default:
        return {};
    }
  };

  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();

    const nodeType = event.dataTransfer.getData('application/reactflow');
    if (!nodeType) return;

    const reactFlowBounds = event.currentTarget.getBoundingClientRect();
    const position = {
      x: event.clientX - reactFlowBounds.left,
      y: event.clientY - reactFlowBounds.top,
    };

    // Open parameter dialog instead of directly creating node
    setParameterDialog({
      isOpen: true,
      nodeType,
      position,
    });

    logger.debug('Opening parameter dialog', { nodeType, position });
  }, []);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Handle parameter dialog confirmation
  const handleParameterDialogConfirm = useCallback(
    (params: Record<string, unknown>) => {
      if (!parameterDialog.nodeType) return;

      addNode({
        type: parameterDialog.nodeType,
        position: parameterDialog.position,
        inputs: {},
        params,
      });

      logger.debug('Node created via dialog', { nodeType: parameterDialog.nodeType, params });

      recordUserInteraction({
        type: 'node_created',
        target: parameterDialog.nodeType,
        data: { params, position: parameterDialog.position },
      });
    },
    [parameterDialog, addNode, recordUserInteraction]
  );

  // Handle parameter dialog close
  const handleParameterDialogClose = useCallback(() => {
    setParameterDialog({
      isOpen: false,
      nodeType: '',
      position: { x: 0, y: 0 },
    });
  }, []);

  const selectedNode =
    selectedNodes.size === 1
      ? graph.nodes.find((n) => n.id === Array.from(selectedNodes)[0])
      : null;

  // Auto-evaluate when graph changes with monitoring
  useEffect(() => {
    const dirtyNodes = graph.nodes.filter((n) => n.dirty);
    if (dirtyNodes.length > 0) {
      // Debounce evaluation
      const timer = setTimeout(() => {
        executeWasmOperation(() => evaluateGraph(), 'graph_evaluation').catch((error) => {
          logger.error('Graph evaluation failed', {
            error: error instanceof Error ? error.message : String(error),
          });
        });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [graph, evaluateGraph, executeWasmOperation]);

  return (
    <>
      <CommandPalette isOpen={showCommandPalette} onClose={() => setShowCommandPalette(false)} />
      <ResponsiveLayoutManager
        panels={{
          nodeEditor: {
            id: 'nodeEditor',
            title: 'Node Editor',
            icon: '📊',
            content: (
              <ErrorBoundary>
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  nodeTypes={nodeTypes}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  onConnect={onConnect}
                  onNodeClick={onNodeClick}
                  onNodesDelete={onNodesDelete}
                  onEdgesDelete={onEdgesDelete}
                  onDrop={onDrop}
                  onDragOver={onDragOver}
                  deleteKeyCode="Delete"
                  fitView
                  snapToGrid={true}
                  snapGrid={[15, 15]}
                  multiSelectionKeyCode="Shift"
                  selectionKeyCode="Shift"
                  panOnScroll={true}
                  zoomOnScroll={true}
                  zoomOnPinch={true}
                  connectionLineStyle={{
                    stroke: 'var(--color-primary-500)',
                    strokeWidth: 3,
                    strokeDasharray: '5,5',
                    animation: 'dash 1s linear infinite',
                  }}
                  connectionLineComponent={({ fromX, fromY, toX, toY }) => (
                    <g>
                      <path
                        fill="none"
                        stroke="var(--color-primary-500)"
                        strokeWidth={3}
                        strokeDasharray="5,5"
                        d={`M${fromX},${fromY} Q ${fromX + 50},${fromY} ${toX - 50},${toY} T${toX},${toY}`}
                        style={{
                          animation: 'dash 1s linear infinite',
                        }}
                      />
                      <circle
                        cx={toX}
                        cy={toY}
                        r={4}
                        fill="var(--color-primary-500)"
                        stroke="var(--color-surface-primary)"
                        strokeWidth={2}
                      />
                    </g>
                  )}
                  defaultEdgeOptions={{
                    type: 'smoothstep',
                    animated: true,
                    style: {
                      stroke: 'var(--color-primary-500)',
                      strokeWidth: 2,
                    },
                    markerEnd: {
                      type: MarkerType.Arrow,
                      color: 'var(--color-primary-500)',
                    },
                  }}
                >
                  <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
                  <Controls />
                  <MiniMap />
                  <Panel position="top-left">
                    <div className="logo">BrepFlow Studio</div>
                  </Panel>
                  <Panel position="bottom-left">
                    <div className="status">
                      Units: {graph.units} | Tolerance: {graph.tolerance} | Nodes:{' '}
                      {graph.nodes.length} |
                      {crossOriginIsolated ? ' ✅ WASM Ready' : ' ⚠️ WASM Limited'}
                      {alerts.length > 0 && (
                        <span
                          className="status-alerts"
                          style={{ color: '#f59e0b', marginLeft: '0.5rem' }}
                        >
                          | ⚠️ {alerts.length} Alert{alerts.length > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </Panel>
                  $1
                  <Panel position="top-right">
                    <SessionControls />
                  </Panel>
                </ReactFlow>
              </ErrorBoundary>
            ),
          },
          viewport: {
            id: 'viewport',
            title: '3D Viewport',
            icon: '🎲',
            content: (
              <WASMErrorBoundary>
                <GeometryErrorBoundary>
                  <ViewportLayoutManager
                    initialLayout="single"
                    enableKeyboardShortcuts={true}
                    showLayoutControls={true}
                    onLayoutChange={(layout) => {
                      logger.debug('Viewport layout changed', layout);
                      recordUserInteraction({
                        type: 'viewport_layout_change',
                        target: layout.type,
                        data: { viewports: layout.viewports.length },
                      });
                    }}
                    onViewportSelect={(viewportId) => {
                      logger.debug('Viewport selected', viewportId);
                      recordUserInteraction({
                        type: 'viewport_select',
                        target: viewportId,
                      });
                    }}
                    onCameraChange={(viewportId, camera) => {
                      logger.debug('Camera changed for viewport', { viewportId, camera });
                    }}
                    onRenderModeChange={(viewportId, mode) => {
                      logger.debug('Render mode changed', { viewportId, mode });
                      recordUserInteraction({
                        type: 'viewport_render_mode_change',
                        target: mode,
                        data: { viewportId },
                      });
                    }}
                    geometryData={graph}
                  />
                </GeometryErrorBoundary>
              </WASMErrorBoundary>
            ),
          },
          palette: {
            id: 'palette',
            title: 'Node Palette',
            icon: '🎨',
            content: (
              <ErrorBoundary>
                <EnhancedNodePalette
                  onNodeDragStart={(event, nodeType) => {
                    event.dataTransfer.setData('application/reactflow', nodeType);
                    event.dataTransfer.effectAllowed = 'move';
                  }}
                  enableAdvancedSearch={true}
                  enableCategoryTree={true}
                  defaultViewMode="list"
                />
              </ErrorBoundary>
            ),
          },
          inspector: {
            id: 'inspector',
            title: 'Properties',
            icon: '⚙️',
            content: (
              <ErrorBoundary>
                <Inspector selectedNode={selectedNode || null} onParamChange={updateNode} />
              </ErrorBoundary>
            ),
          },
          console: {
            id: 'console',
            title: 'Console',
            icon: '💬',
            content: (
              <ErrorBoundary>
                <Console />
              </ErrorBoundary>
            ),
          },
        }}
        enableGestures={true}
        enableKeyboardShortcuts={true}
        theme="auto"
      />
      {/* Monitoring Dashboard */}
      $1
      {/* Node Parameter Dialog */}
      <NodeParameterDialog
        isOpen={parameterDialog.isOpen}
        nodeType={parameterDialog.nodeType}
        onConfirm={handleParameterDialogConfirm}
        onClose={handleParameterDialogClose}
      />
    </>
  );
}

function App() {
  // Hooks must be called before any early returns
  const [isMonitoringReady, setIsMonitoringReady] = useState(false);

  useEffect(() => {
    // Initialize monitoring system
    const environment =
      ((import.meta as any).env?.MODE as 'development' | 'production') || 'production';

    initializeMonitoring(environment, {
      monitoring: {
        errorReporting: {
          enabled: true,
          sampleRate: environment === 'production' ? 0.1 : 1.0,
          includeStackTrace: true,
        },
        performance: {
          enabled: true,
          sampleRate: environment === 'production' ? 0.1 : 1.0,
        },
        userAnalytics: {
          enabled: false,
          anonymize: true,
        },
        logging: {
          level: environment === 'production' ? 'warn' : 'debug',
          console: true,
          remote: false, // Configure this based on your logging service
          structured: true,
        },
      },
    })
      .then(() => {
        logger.debug('Monitoring system initialized');
        setIsMonitoringReady(true);
      })
      .catch((error) => {
        logger.error('Failed to initialize monitoring system', {
          error: error instanceof Error ? error.message : String(error),
        });
        // Still allow the app to load without monitoring
        setIsMonitoringReady(true);
      });
  }, []);

  // Check if we're in test mode (after hooks)
  const isTestMode = window.location.search.includes('test=wasm');

  if (isTestMode) {
    return <BrowserWASMTestSuite />;
  }

  if (!isMonitoringReady) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontSize: '1.2rem',
          color: '#6b7280',
        }}
      >
        <div>
          <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
            🔧 Initializing BrepFlow Studio...
          </div>
          <div style={{ fontSize: '0.875rem', textAlign: 'center' }}>
            Setting up monitoring and error handling systems
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <ReactFlowProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/session/new" replace />} />
          <Route path="/session/:sessionId" element={<SessionWrapper />} />
          <Route path="*" element={<Navigate to="/session/new" replace />} />
        </Routes>
      </ReactFlowProvider>
    </ErrorBoundary>
  );
}

/**
 * SessionWrapper component that manages session state and provides collaboration
 */
function SessionWrapper() {
  const { sessionId } = useSession();

  // Check if collaboration server is configured
  const collaborationServerUrl =
    import.meta.env['VITE_COLLABORATION_WS_URL'] ||
    (import.meta.env['PROD'] ? '' : 'http://localhost:8080');
  const collaborationApiUrl =
    import.meta.env['VITE_COLLABORATION_API_URL'] ||
    (import.meta.env['PROD'] ? '' : 'http://localhost:8080');
  const hasCollaborationServer = Boolean(collaborationServerUrl && collaborationApiUrl);

  return (
    <ErrorBoundary>
      {sessionId ? (
        hasCollaborationServer ? (
          <CollaborationProvider
            options={{
              serverUrl: collaborationServerUrl,
              documentId: sessionId,
              user: {
                id: `user_${Math.random().toString(36).slice(2, 11)}`,
                name: `User ${Math.floor(Math.random() * 1000)}`,
                color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
              },
              reconnectAttempts: 5,
              reconnectDelay: 1000,
              presenceThrottle: 50,
            }}
            apiBaseUrl={collaborationApiUrl}
            sessionId={sessionId}
            onOperation={(operation: Operation) => {
              logger.debug('Collaboration operation received', {
                operationType: operation.type,
                operationId: operation.id,
              });
            }}
            onConflict={(conflict: Conflict) => {
              logger.warn('Collaboration conflict detected', {
                conflictType: conflict.type,
                conflictId: conflict.id,
              });
            }}
            onError={(error: Error) => {
              logger.error('Collaboration error occurred', {
                error: error.message,
                stack: error.stack,
              });
            }}
            onCSRFError={(error: Error) => {
              logger.error('Collaboration CSRF authentication failed', {
                error: error.message,
                needsReauthentication: true,
              });
            }}
          >
            <OnboardingOrchestrator>
              <AppContent />
            </OnboardingOrchestrator>
          </CollaborationProvider>
        ) : (
          <OnboardingOrchestrator>
            <AppContent />
          </OnboardingOrchestrator>
        )
      ) : (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
          }}
        >
          <div>Loading session...</div>
        </div>
      )}
    </ErrorBoundary>
  );
}

export default App;
