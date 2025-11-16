import { beforeEach, describe, expect, it } from 'vitest';

import { useSelectionStore } from './selection-store';

const resetSelectionState = () => {
  useSelectionStore.setState({
    selectedNodes: new Set(),
    selectedEdges: new Set(),
    lastSelected: null,
    selectionMode: 'single',
    isSelecting: false,
    selectionBox: undefined,
  });
};

const getSelectedNodes = () => Array.from(useSelectionStore.getState().selectedNodes);
const getSelectedEdges = () => Array.from(useSelectionStore.getState().selectedEdges);

describe('selection-store', () => {
  beforeEach(() => {
    resetSelectionState();
  });

  it('selects single nodes and replaces previous selections by default', () => {
    useSelectionStore.getState().selectNode('node-1');
    expect(getSelectedNodes()).toEqual(['node-1']);
    expect(useSelectionStore.getState().lastSelected).toBe('node-1');

    useSelectionStore.getState().selectNode('node-2');
    expect(getSelectedNodes()).toEqual(['node-2']);
    expect(useSelectionStore.getState().lastSelected).toBe('node-2');
    expect(getSelectedEdges()).toHaveLength(0);
  });

  it('supports additive multi-selection', () => {
    useSelectionStore.getState().selectNode('node-1', true);
    useSelectionStore.getState().selectNode('node-2', true);

    expect(new Set(getSelectedNodes())).toEqual(new Set(['node-1', 'node-2']));
    expect(useSelectionStore.getState().lastSelected).toBe('node-2');
  });

  it('toggles node selection and updates last selected reference', () => {
    useSelectionStore.getState().selectNode('node-1');
    useSelectionStore.getState().toggleNodeSelection('node-2');
    useSelectionStore.getState().toggleNodeSelection('node-3');

    expect(new Set(getSelectedNodes())).toEqual(new Set(['node-1', 'node-2', 'node-3']));

    useSelectionStore.getState().toggleNodeSelection('node-2');
    expect(new Set(getSelectedNodes())).toEqual(new Set(['node-1', 'node-3']));
    expect(useSelectionStore.getState().lastSelected).toBe('node-3');
  });

  it('tracks selection box gestures', () => {
    useSelectionStore.getState().startBoxSelection(10, 20);
    expect(useSelectionStore.getState().isSelecting).toBe(true);
    expect(useSelectionStore.getState().selectionBox).toEqual({
      startX: 10,
      startY: 20,
      endX: 10,
      endY: 20,
    });

    useSelectionStore.getState().updateBoxSelection(30, 40);
    expect(useSelectionStore.getState().selectionBox).toEqual({
      startX: 10,
      startY: 20,
      endX: 30,
      endY: 40,
    });

    useSelectionStore.getState().endBoxSelection(['node-1', 'node-2']);
    expect(useSelectionStore.getState().isSelecting).toBe(false);
    expect(useSelectionStore.getState().selectionBox).toBeUndefined();
    expect(new Set(getSelectedNodes())).toEqual(new Set(['node-1', 'node-2']));
    expect(useSelectionStore.getState().lastSelected).toBe('node-2');
  });

  it('inverts selections using available node and edge identifiers', () => {
    useSelectionStore.getState().selectNode('node-1', true);
    useSelectionStore.getState().selectEdge('edge-1', true);

    useSelectionStore.getState().invertSelection(['node-1', 'node-2'], ['edge-1', 'edge-2']);

    expect(new Set(getSelectedNodes())).toEqual(new Set(['node-2']));
    expect(new Set(getSelectedEdges())).toEqual(new Set(['edge-2']));
    expect(useSelectionStore.getState().lastSelected).toBe('node-2');
  });

  it('selects nodes within a rectangular region', () => {
    const nodePositions = {
      'node-1': { x: 10, y: 10 },
      'node-2': { x: 25, y: 25 },
      'node-3': { x: 60, y: 60 },
    };

    useSelectionStore.getState().selectNodesInRegion(0, 0, 40, 40, nodePositions);
    expect(new Set(getSelectedNodes())).toEqual(new Set(['node-1', 'node-2']));
  });

  it('navigates downstream connectivity to build selections', () => {
    const edges = [
      { source: 'node-1', target: 'node-2' },
      { source: 'node-2', target: 'node-3' },
      { source: 'node-3', target: 'node-4' },
    ];

    useSelectionStore.getState().selectDownstreamNodes('node-1', edges);

    expect(new Set(getSelectedNodes())).toEqual(new Set(['node-1', 'node-2', 'node-3', 'node-4']));
  });

  it('steps through selection history using selectNext/selectPrevious helpers', () => {
    const orderedNodes = ['node-1', 'node-2', 'node-3'];

    useSelectionStore.getState().selectNode('node-1');
    useSelectionStore.getState().selectNext(orderedNodes);
    expect(useSelectionStore.getState().lastSelected).toBe('node-2');

    useSelectionStore.getState().selectPrevious(orderedNodes);
    expect(useSelectionStore.getState().lastSelected).toBe('node-1');
  });
});
