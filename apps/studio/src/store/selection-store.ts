import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { createChildLogger } from '../lib/logging/logger-instance';

const logger = createChildLogger({ module: 'selection-store' });

export interface SelectionState {
  selectedNodes: Set<string>;
  selectedEdges: Set<string>;
  lastSelected: string | null;
  selectionMode: 'single' | 'multi' | 'box' | 'lasso';
  isSelecting: boolean;
  selectionBox?: {
    startX: number;
    startY: number;
    endX: number;
    endY: number;
  };
}

export interface SelectionActions {
  // Node selection
  selectNode: (nodeId: string, multi?: boolean) => void;
  deselectNode: (nodeId: string) => void;
  toggleNodeSelection: (nodeId: string) => void;
  selectMultipleNodes: (nodeIds: string[]) => void;

  // Edge selection
  selectEdge: (edgeId: string, multi?: boolean) => void;
  deselectEdge: (edgeId: string) => void;
  toggleEdgeSelection: (edgeId: string) => void;

  // General selection
  selectAll: () => void;
  clearSelection: () => void;
  invertSelection: (availableNodeIds: string[], availableEdgeIds: string[]) => void;

  // Selection modes
  setSelectionMode: (mode: SelectionState['selectionMode']) => void;

  // Box selection
  startBoxSelection: (x: number, y: number) => void;
  updateBoxSelection: (x: number, y: number) => void;
  endBoxSelection: (nodeIds: string[]) => void;

  // Bulk operations
  selectNodesInRegion: (
    x: number,
    y: number,
    width: number,
    height: number,
    nodePositions: { [id: string]: { x: number; y: number } }
  ) => void;
  selectNodesByType: (nodeType: string, availableNodes: { id: string; type: string }[]) => void;
  selectDownstreamNodes: (nodeId: string, edges: { source: string; target: string }[]) => void;
  selectUpstreamNodes: (nodeId: string, edges: { source: string; target: string }[]) => void;

  // History and navigation
  selectNext: (availableNodeIds: string[]) => void;
  selectPrevious: (availableNodeIds: string[]) => void;
}

export const useSelectionStore = create<SelectionState & SelectionActions>()(
  devtools(
    (set, get) => ({
      // Initial state
      selectedNodes: new Set(),
      selectedEdges: new Set(),
      lastSelected: null,
      selectionMode: 'single',
      isSelecting: false,

      // Node selection actions
      selectNode: (nodeId: string, multi = false) => {
        set((state) => {
          const newSelectedNodes = new Set(multi ? state.selectedNodes : []);
          newSelectedNodes.add(nodeId);

          return {
            selectedNodes: newSelectedNodes,
            selectedEdges: multi ? state.selectedEdges : new Set(),
            lastSelected: nodeId,
          };
        });
      },

      deselectNode: (nodeId: string) => {
        set((state) => {
          const newSelectedNodes = new Set(state.selectedNodes);
          newSelectedNodes.delete(nodeId);

          return {
            selectedNodes: newSelectedNodes,
            lastSelected:
              newSelectedNodes.size > 0
                ? Array.from(newSelectedNodes)[newSelectedNodes.size - 1]
                : null,
          };
        });
      },

      toggleNodeSelection: (nodeId: string) => {
        const { selectedNodes } = get();
        if (selectedNodes.has(nodeId)) {
          get().deselectNode(nodeId);
        } else {
          get().selectNode(nodeId, true);
        }
      },

      selectMultipleNodes: (nodeIds: string[]) => {
        set((state) => ({
          selectedNodes: new Set([...state.selectedNodes, ...nodeIds]),
          lastSelected: nodeIds[nodeIds.length - 1] || state.lastSelected,
        }));
      },

      // Edge selection actions
      selectEdge: (edgeId: string, multi = false) => {
        set((state) => {
          const newSelectedEdges = new Set(multi ? state.selectedEdges : []);
          newSelectedEdges.add(edgeId);

          return {
            selectedEdges: newSelectedEdges,
            selectedNodes: multi ? state.selectedNodes : new Set(),
            lastSelected: edgeId,
          };
        });
      },

      deselectEdge: (edgeId: string) => {
        set((state) => {
          const newSelectedEdges = new Set(state.selectedEdges);
          newSelectedEdges.delete(edgeId);

          return {
            selectedEdges: newSelectedEdges,
          };
        });
      },

      toggleEdgeSelection: (edgeId: string) => {
        const { selectedEdges } = get();
        if (selectedEdges.has(edgeId)) {
          get().deselectEdge(edgeId);
        } else {
          get().selectEdge(edgeId, true);
        }
      },

      // General selection actions
      selectAll: () => {
        // This should be called with all available node and edge IDs
        // Implementation depends on how we get all available items
        logger.debug('Select all triggered - requires node/edge lists from graph store');
      },

      clearSelection: () => {
        set({
          selectedNodes: new Set(),
          selectedEdges: new Set(),
          lastSelected: null,
        });
      },

      invertSelection: (availableNodeIds: string[], availableEdgeIds: string[]) => {
        set((state) => {
          const invertedNodes = new Set(
            availableNodeIds.filter((id) => !state.selectedNodes.has(id))
          );
          const invertedEdges = new Set(
            availableEdgeIds.filter((id) => !state.selectedEdges.has(id))
          );

          return {
            selectedNodes: invertedNodes,
            selectedEdges: invertedEdges,
            lastSelected: invertedNodes.size > 0 ? Array.from(invertedNodes)[0] : null,
          };
        });
      },

      // Selection mode
      setSelectionMode: (mode: SelectionState['selectionMode']) => {
        set({ selectionMode: mode });
      },

      // Box selection
      startBoxSelection: (x: number, y: number) => {
        set({
          isSelecting: true,
          selectionBox: { startX: x, startY: y, endX: x, endY: y },
        });
      },

      updateBoxSelection: (x: number, y: number) => {
        set((state) => ({
          selectionBox: state.selectionBox
            ? {
                ...state.selectionBox,
                endX: x,
                endY: y,
              }
            : undefined,
        }));
      },

      endBoxSelection: (nodeIds: string[]) => {
        set((state) => ({
          selectedNodes: new Set([...state.selectedNodes, ...nodeIds]),
          isSelecting: false,
          selectionBox: undefined,
          lastSelected: nodeIds[nodeIds.length - 1] || state.lastSelected,
        }));
      },

      // Bulk operations
      selectNodesInRegion: (
        x: number,
        y: number,
        width: number,
        height: number,
        nodePositions: { [id: string]: { x: number; y: number } }
      ) => {
        const nodesInRegion = Object.entries(nodePositions)
          .filter(
            ([id, pos]) => pos.x >= x && pos.x <= x + width && pos.y >= y && pos.y <= y + height
          )
          .map(([id]) => id);

        get().selectMultipleNodes(nodesInRegion);
      },

      selectNodesByType: (nodeType: string, availableNodes: { id: string; type: string }[]) => {
        const nodeIds = availableNodes
          .filter((node) => node.type === nodeType)
          .map((node) => node.id);

        get().selectMultipleNodes(nodeIds);
      },

      selectDownstreamNodes: (nodeId: string, edges: { source: string; target: string }[]) => {
        const visited = new Set<string>();
        const toVisit = [nodeId];

        while (toVisit.length > 0) {
          const currentNode = toVisit.pop()!;
          if (visited.has(currentNode)) continue;

          visited.add(currentNode);

          // Find all edges where this node is the source
          const outgoingEdges = edges.filter((edge) => edge.source === currentNode);
          for (const edge of outgoingEdges) {
            if (!visited.has(edge.target)) {
              toVisit.push(edge.target);
            }
          }
        }

        get().selectMultipleNodes(Array.from(visited));
      },

      selectUpstreamNodes: (nodeId: string, edges: { source: string; target: string }[]) => {
        const visited = new Set<string>();
        const toVisit = [nodeId];

        while (toVisit.length > 0) {
          const currentNode = toVisit.pop()!;
          if (visited.has(currentNode)) continue;

          visited.add(currentNode);

          // Find all edges where this node is the target
          const incomingEdges = edges.filter((edge) => edge.target === currentNode);
          for (const edge of incomingEdges) {
            if (!visited.has(edge.source)) {
              toVisit.push(edge.source);
            }
          }
        }

        get().selectMultipleNodes(Array.from(visited));
      },

      // History and navigation
      selectNext: (availableNodeIds: string[]) => {
        const { lastSelected } = get();
        if (!lastSelected || availableNodeIds.length === 0) return;

        const currentIndex = availableNodeIds.indexOf(lastSelected);
        const nextIndex = (currentIndex + 1) % availableNodeIds.length;

        get().selectNode(availableNodeIds[nextIndex]);
      },

      selectPrevious: (availableNodeIds: string[]) => {
        const { lastSelected } = get();
        if (!lastSelected || availableNodeIds.length === 0) return;

        const currentIndex = availableNodeIds.indexOf(lastSelected);
        const prevIndex = currentIndex === 0 ? availableNodeIds.length - 1 : currentIndex - 1;

        get().selectNode(availableNodeIds[prevIndex]);
      },
    }),
    {
      name: 'selection-store',
    }
  )
);

// Helper functions for external use
export const getSelectedNodeIds = (): string[] => {
  return Array.from(useSelectionStore.getState().selectedNodes);
};

export const getSelectedEdgeIds = (): string[] => {
  return Array.from(useSelectionStore.getState().selectedEdges);
};

export const hasSelection = (): boolean => {
  const state = useSelectionStore.getState();
  return state.selectedNodes.size > 0 || state.selectedEdges.size > 0;
};

export const getSelectionCount = (): { nodes: number; edges: number; total: number } => {
  const state = useSelectionStore.getState();
  const nodes = state.selectedNodes.size;
  const edges = state.selectedEdges.size;
  return { nodes, edges, total: nodes + edges };
};
