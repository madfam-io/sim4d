import { useState, useMemo, useCallback } from 'react';
import { createNodeId, createEdgeId, type NodeId, type EdgeId } from '@brepflow/types';
import type { Node, Edge } from '../types';
import {
  useCollaboration as useCollaborationContext,
  type CollaborationContextValue,
} from './collaboration-provider';

type NodeIdLike = string | NodeId;
type EdgeIdLike = string | EdgeId;

const toNodeId = (value: NodeIdLike): NodeId =>
  typeof value === 'string' ? createNodeId(value) : value;

const toEdgeId = (value: EdgeIdLike): EdgeId =>
  typeof value === 'string' ? createEdgeId(value) : value;

function derivePresence(context: CollaborationContextValue): {
  activeUsers: Array<{
    id: string;
    name: string;
    color: string;
    avatar?: string;
    isCurrentUser: boolean;
  }>;
  userCount: number;
  presence: CollaborationContextValue['presence'];
} {
  const { presence, currentUser } = context;
  const activeUsers = presence.map((p) => ({
    id: p.user.id,
    name: p.user.name,
    color: p.user.color,
    avatar: p.user.avatar,
    isCurrentUser: p.user.id === currentUser.id,
  }));
  return {
    activeUsers,
    userCount: activeUsers.length,
    presence,
  };
}

/**
 * Hook to get and update cursor position
 */
export function useCursor() {
  const { updateCursor, presence, currentUser } = useCollaborationContext();
  const [localCursor, setLocalCursor] = useState({ x: 0, y: 0 });

  const setCursor = useCallback(
    (x: number, y: number) => {
      setLocalCursor({ x, y });
      updateCursor(x, y);
    },
    [updateCursor]
  );

  const otherCursors = presence
    .filter((p) => p.user.id !== currentUser.id && p.cursor)
    .map((p) => {
      const { user } = p;
      const cursor = p.cursor!;
      const { userId: _ignoredUserId, ...cursorPosition } = cursor;
      return {
        userId: user.id,
        userName: user.name,
        userColor: user.color,
        ...cursorPosition,
      };
    });

  return {
    cursor: localCursor,
    setCursor,
    otherCursors,
  };
}

/**
 * Hook to get and update selection
 */
export function useSelection() {
  const { updateSelection, presence, currentUser } = useCollaborationContext();
  const [localSelection, setLocalSelection] = useState<{
    nodeIds: string[];
    edgeIds: string[];
  }>({ nodeIds: [], edgeIds: [] });

  const setSelection = useCallback(
    (nodeIds: string[], edgeIds: string[]) => {
      setLocalSelection({ nodeIds, edgeIds });
      updateSelection(nodeIds, edgeIds);
    },
    [updateSelection]
  );

  const otherSelections = presence
    .filter((p) => p.user.id !== currentUser.id && p.selection)
    .map((p) => {
      const { user } = p;
      const selection = p.selection!;
      const { userId: _ignoredUserId, ...selectionData } = selection;
      return {
        userId: user.id,
        userName: user.name,
        userColor: user.color,
        ...selectionData,
      };
    });

  return {
    selection: localSelection,
    setSelection,
    otherSelections,
  };
}

/**
 * Hook to get and update viewport
 */
export function useViewport() {
  const { updateViewport, presence, currentUser } = useCollaborationContext();
  const [localViewport, setLocalViewport] = useState({
    x: 0,
    y: 0,
    zoom: 1,
  });

  const setViewport = useCallback(
    (x: number, y: number, zoom: number) => {
      setLocalViewport({ x, y, zoom });
      updateViewport(x, y, zoom);
    },
    [updateViewport]
  );

  const otherViewports = presence
    .filter((p) => p.user.id !== currentUser.id && p.viewport)
    .map((p) => {
      const { user } = p;
      const viewport = p.viewport!;
      const { userId: _ignoredUserId, ...viewportData } = viewport;
      return {
        userId: user.id,
        userName: user.name,
        userColor: user.color,
        ...viewportData,
      };
    });

  return {
    viewport: localViewport,
    setViewport,
    otherViewports,
  };
}

/**
 * Hook to track who is editing what
 */
export function useEditingStatus() {
  const { setEditing, presence, currentUser } = useCollaborationContext();
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);

  const startEditing = useCallback(
    (nodeId: string) => {
      setEditingNodeId(nodeId);
      setEditing(nodeId);
    },
    [setEditing]
  );

  const stopEditing = useCallback(() => {
    setEditingNodeId(null);
    setEditing(null);
  }, [setEditing]);

  const editingUsers = presence.reduce<
    Record<string, { userId: string; userName: string; userColor: string }>
  >((acc, p) => {
    if (p.isEditing) {
      acc[p.isEditing] = {
        userId: p.user.id,
        userName: p.user.name,
        userColor: p.user.color,
      };
    }
    return acc;
  }, {});

  return {
    editingNodeId,
    startEditing,
    stopEditing,
    editingUsers,
  };
}

/**
 * Collaboration presence utilities
 */
export function usePresence() {
  const context = useCollaborationContext();
  const presenceData = useMemo(
    () => derivePresence(context),
    [context.presence, context.currentUser]
  );

  return {
    ...presenceData,
    isConnected: context.isConnected,
    currentUser: context.currentUser,
  };
}

/**
 * Hook to handle node operations
 */
export function useNodeOperations() {
  const { submitOperation } = useCollaborationContext();

  const addNode = useCallback(
    (node: Node) => {
      submitOperation({
        type: 'ADD_NODE',
        node,
      });
    },
    [submitOperation]
  );

  const updateNode = useCallback(
    (nodeId: NodeIdLike, updates: Partial<Node>) => {
      submitOperation({
        type: 'UPDATE_NODE',
        nodeId: toNodeId(nodeId),
        updates,
      });
    },
    [submitOperation]
  );

  const deleteNode = useCallback(
    (nodeId: NodeIdLike) => {
      submitOperation({
        type: 'DELETE_NODE',
        nodeId: toNodeId(nodeId),
      });
    },
    [submitOperation]
  );

  return {
    addNode,
    updateNode,
    deleteNode,
  };
}

/**
 * Hook to handle edge operations
 */
export function useEdgeOperations() {
  const { submitOperation } = useCollaborationContext();

  const addEdge = useCallback(
    (edge: Edge) => {
      submitOperation({
        type: 'ADD_EDGE',
        edge,
      });
    },
    [submitOperation]
  );

  const deleteEdge = useCallback(
    (edgeId: EdgeIdLike) => {
      submitOperation({
        type: 'DELETE_EDGE',
        edgeId: toEdgeId(edgeId),
      });
    },
    [submitOperation]
  );

  return {
    addEdge,
    deleteEdge,
  };
}
