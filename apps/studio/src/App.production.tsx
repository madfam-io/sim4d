import React, { useCallback, useEffect, useState } from 'react';
import ReactFlow, {
  Node as RFNode,
  Edge as RFEdge,
  addEdge,
  Background,
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

import { NodePanel } from './components/NodePanel';
import { Viewport } from './components/Viewport';
import { Inspector } from './components/Inspector';
import { Toolbar } from './components/Toolbar';
import { Console } from './components/Console';
import { WorkbenchLayoutManager } from './components/layout/WorkbenchLayoutManager';
import { useProductionGraphStore } from './store/production-graph-store';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { convertToReactFlow, convertFromReactFlow } from './utils/graph-converter';
import { ErrorBoundary } from './lib/error-handling/error-boundary';
import { ProductionErrorBoundary } from './components/error/ProductionErrorBoundary';
import { MonitoringDashboard } from './components/monitoring/MonitoringDashboard';
import { useMonitoring, useHealthMonitoring } from './hooks/useMonitoring';
import { initializeMonitoring } from './lib/monitoring';
import { Icon } from './components/icons/IconSystem';
import { NodeParameterDialog } from './components/dialogs/NodeParameterDialog';
import './App.css';

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
    isInitialized,
    initializationError,
  } = useProductionGraphStore();

  const { recordUserInteraction, executeWasmOperation } = useMonitoring();
  const { alerts } = useHealthMonitoring();
  const [showMonitoringDashboard, setShowMonitoringDashboard] = useState(false);
  const [showParameterDialog, setShowParameterDialog] = useState(false);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);

  // Convert graph to ReactFlow format
  const { nodes: rfNodes, edges: rfEdges } = convertToReactFlow(graph);
  const [nodes, setNodes, onNodesChange] = useNodesState(rfNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(rfEdges);

  // Sync ReactFlow changes back to graph
  useEffect(() => {
    const timer = setTimeout(() => {
      const updatedGraph = convertFromReactFlow(nodes, edges);
      if (JSON.stringify(updatedGraph) !== JSON.stringify(graph)) {
        // Update graph store with ReactFlow changes
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [nodes, edges]);

  // Sync graph changes to ReactFlow
  useEffect(() => {
    const { nodes: newNodes, edges: newEdges } = convertToReactFlow(graph);
    setNodes(newNodes);
    setEdges(newEdges);
  }, [graph, setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => {
      if (params.source && params.target && params.sourceHandle && params.targetHandle) {
        recordUserInteraction({
          type: 'edge_created',
          data: {
            source: params.source,
            target: params.target,
          },
        });

        const [sourcePort] = params.sourceHandle.split(':');
        const [targetPort] = params.targetHandle.split(':');

        addGraphEdge(params.source, sourcePort, params.target, targetPort);

        setEdges((eds) =>
          addEdge(
            {
              ...params,
              markerEnd: {
                type: MarkerType.ArrowClosed,
                width: 20,
                height: 20,
              },
            },
            eds
          )
        );
      }
    },
    [addGraphEdge, setEdges, recordUserInteraction]
  );

  const onNodesDelete = useCallback(
    (nodesToDelete: RFNode[]) => {
      nodesToDelete.forEach((node) => {
        recordUserInteraction({ type: 'node_deleted', data: { nodeId: node.id } });
        removeNode(node.id);
      });
    },
    [removeNode, recordUserInteraction]
  );

  const onEdgesDelete = useCallback(
    (edgesToDelete: RFEdge[]) => {
      edgesToDelete.forEach((edge) => {
        recordUserInteraction({ type: 'edge_deleted', data: { edgeId: edge.id } });
        removeEdge(edge.id);
      });
    },
    [removeEdge, recordUserInteraction]
  );

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: RFNode) => {
      recordUserInteraction({ type: 'node_selected', data: { nodeId: node.id } });
      selectNode(node.id);
    },
    [selectNode, recordUserInteraction]
  );

  const onNodeDoubleClick = useCallback((_: React.MouseEvent, node: RFNode) => {
    setEditingNodeId(node.id);
    setShowParameterDialog(true);
  }, []);

  const handleAddNode = useCallback(
    (type: string, position?: { x: number; y: number }) => {
      recordUserInteraction({ type: 'node_added', data: { type } });
      const nodePosition = position || { x: 250, y: 250 };
      addNode(type, nodePosition);
    },
    [addNode, recordUserInteraction]
  );

  const handleEvaluate = useCallback(async () => {
    recordUserInteraction({ type: 'graph_evaluated' });
    await evaluateGraph();
  }, [evaluateGraph, recordUserInteraction]);

  const shortcuts = {
    Delete: () => {
      selectedNodes.forEach((nodeId) => removeNode(nodeId));
    },
    Escape: () => {
      selectNode(null);
    },
    e: handleEvaluate,
  };

  useKeyboardShortcuts();

  // Initialize monitoring
  useEffect(() => {
    initializeMonitoring();
  }, []);

  // Show production initialization errors
  if (initializationError) {
    return (
      <div className="production-error">
        <h1>Failed to Initialize Production Geometry Engine</h1>
        <p>{initializationError}</p>
        <details>
          <summary>Technical Details</summary>
          <pre>
            {JSON.stringify(
              {
                environment: process.env['NODE_ENV'],
                wasmSupport: typeof WebAssembly !== 'undefined',
                sharedArrayBuffer: typeof SharedArrayBuffer !== 'undefined',
                timestamp: new Date().toISOString(),
              },
              null,
              2
            )}
          </pre>
        </details>
      </div>
    );
  }

  // Show loading state while initializing
  if (!isInitialized) {
    return (
      <div className="production-loading">
        <h2>Initializing Production Geometry Engine...</h2>
        <p>Loading OCCT WebAssembly module</p>
      </div>
    );
  }

  return (
    <WorkbenchLayoutManager>
      {{
        toolbar: <Toolbar />,
        nodePanel: <NodePanel />,
        inspector: <Inspector selectedNode={null} onParamChange={() => {}} />,
        console: <Console />,
        viewport3d: <Viewport />,
        nodeEditor: (
          <div style={{ width: '100%', height: '100%' }}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodesDelete={onNodesDelete}
              onEdgesDelete={onEdgesDelete}
              onNodeClick={onNodeClick}
              onNodeDoubleClick={onNodeDoubleClick}
              nodeTypes={nodeTypes}
              fitView
            >
              <Background variant={'dots' as any} gap={12} size={1} />
              <Controls />
              <MiniMap />
              <Panel position="top-right">
                <button
                  onClick={() => setShowMonitoringDashboard(!showMonitoringDashboard)}
                  className="monitoring-toggle"
                  title="Toggle Monitoring Dashboard"
                >
                  <Icon name="monitor" size={20} />
                </button>
              </Panel>
            </ReactFlow>

            {showMonitoringDashboard && (
              <div className="monitoring-overlay">
                <MonitoringDashboard
                  isVisible={showMonitoringDashboard}
                  onClose={() => setShowMonitoringDashboard(false)}
                />
              </div>
            )}

            {alerts.length > 0 && (
              <div className="health-alerts">
                {alerts.map((alert, idx) => (
                  <div key={idx} className={`alert alert-${alert.severity}`}>
                    {alert.message}
                  </div>
                ))}
              </div>
            )}
          </div>
        ),
      }}
    </WorkbenchLayoutManager>
  );
}

function App() {
  return (
    <ProductionErrorBoundary>
      <ErrorBoundary>
        <ReactFlowProvider>
          <AppContent />
        </ReactFlowProvider>
      </ErrorBoundary>
    </ProductionErrorBoundary>
  );
}

export default App;
