import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  useMemo,
} from 'react';
import {
  CSRFCollaborationClient,
  type CSRFCollaborationEventHandler,
} from './collaboration-client-csrf';
import type {
  CollaborationOptions,
  Document,
  Operation,
  OperationInput,
  Presence,
  User,
  Cursor,
  Selection,
  Viewport,
  Conflict,
} from '../types';
import { createNodeId, createEdgeId, type NodeId, type EdgeId } from '@sim4d/types';

export interface CollaborationContextValue {
  client: CSRFCollaborationClient | null;
  document: Document | null;
  presence: Presence[];
  isConnected: boolean;
  currentUser: User;
  submitOperation: (operation: OperationInput) => void;
  updateCursor: (x: number, y: number) => void;
  updateSelection: (nodeIds: string[], edgeIds: string[]) => void;
  updateViewport: (x: number, y: number, zoom: number) => void;
  setEditing: (nodeId: string | null) => void;
  requestSync: () => void;
}

const CollaborationContext = createContext<CollaborationContextValue | null>(null);

export interface CollaborationProviderProps {
  options: CollaborationOptions;
  apiBaseUrl: string;
  sessionId: string;
  children: React.ReactNode;
  onOperation?: (operation: Operation) => void;
  onConflict?: (conflict: Conflict) => void;
  onError?: (error: Error) => void;
  onCSRFError?: (error: Error) => void;
}

const normaliseNodeId = (value: NodeId | string): NodeId =>
  typeof value === 'string' ? createNodeId(value) : value;

const normaliseEdgeId = (value: EdgeId | string): EdgeId =>
  typeof value === 'string' ? createEdgeId(value) : value;

function normaliseOperation(input: OperationInput, userId: string, documentId: string): Operation {
  const base = {
    id: generateOperationId(),
    userId,
    documentId,
    timestamp: Date.now(),
  };

  switch (input.type) {
    case 'ADD_NODE':
      return {
        ...base,
        type: 'ADD_NODE',
        node: {
          ...input.node,
          id: normaliseNodeId(input.node.id as NodeId | string),
        },
      };

    case 'DELETE_NODE':
      return {
        ...base,
        type: 'DELETE_NODE',
        nodeId: normaliseNodeId(input.nodeId),
      };

    case 'UPDATE_NODE':
      return {
        ...base,
        type: 'UPDATE_NODE',
        nodeId: normaliseNodeId(input.nodeId),
        updates: input.updates,
      };

    case 'ADD_EDGE':
      return {
        ...base,
        type: 'ADD_EDGE',
        edge: {
          ...input.edge,
          id: normaliseEdgeId(input.edge.id as EdgeId | string),
        },
      };

    case 'DELETE_EDGE':
      return {
        ...base,
        type: 'DELETE_EDGE',
        edgeId: normaliseEdgeId(input.edgeId),
      };

    case 'UPDATE_GRAPH_METADATA':
      return {
        ...base,
        type: 'UPDATE_GRAPH_METADATA',
        metadata: input.metadata,
      };
  }
}

export function CollaborationProvider({
  options,
  apiBaseUrl,
  sessionId,
  children,
  onOperation,
  onConflict,
  onError,
  onCSRFError,
}: CollaborationProviderProps) {
  const [client, setClient] = useState<CSRFCollaborationClient | null>(null);
  const [document, setDocument] = useState<Document | null>(null);
  const [presence, setPresence] = useState<Presence[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const clientRef = useRef<CSRFCollaborationClient | null>(null);

  // Stabilize user object to prevent unnecessary re-renders
  const stableUser = useMemo(() => options.user, [options.user.id]);

  // Destructure options for stable dependencies
  const { serverUrl, documentId } = options;

  useEffect(() => {
    // Create CSRF-aware collaboration client
    const collaborationClient = new CSRFCollaborationClient({
      ...options,
      apiBaseUrl,
      sessionId,
    });
    clientRef.current = collaborationClient;

    // Set up event handlers
    collaborationClient.setEventHandlers({
      onConnect: () => setIsConnected(true),
      onDisconnect: () => setIsConnected(false),
      onDocumentSync: (doc) => setDocument(doc),
      onOperation: (op) => {
        setDocument(collaborationClient.getDocument());
        onOperation?.(op);
      },
      onPresenceUpdate: (presenceList) => {
        setPresence(collaborationClient.getPresence());
      },
      onPresenceJoin: (p) => {
        setPresence(collaborationClient.getPresence());
      },
      onPresenceLeave: (userId) => {
        setPresence(collaborationClient.getPresence());
      },
      onConflict: (conflict) => {
        console.warn('Conflict detected:', conflict);
        onConflict?.(conflict);
      },
      onError: (error) => {
        console.error('Collaboration error:', error);
        onError?.(error);
      },
      onCSRFError: (error) => {
        console.error('CSRF authentication error:', error);
        onCSRFError?.(error);
      },
    });

    setClient(collaborationClient);

    // Connect to server
    collaborationClient.connect().catch((error) => {
      console.error('Failed to connect to collaboration server:', error);
      onError?.(error);
    });

    // Cleanup on unmount
    return () => {
      collaborationClient.destroy();
      clientRef.current = null;
    };
  }, [serverUrl, documentId, stableUser.id, apiBaseUrl, sessionId, options]);

  const submitOperation = useCallback(
    (input: OperationInput) => {
      if (!clientRef.current) return;

      const operation = normaliseOperation(input, stableUser.id, documentId);

      clientRef.current.submitOperation(operation);
    },
    [stableUser.id, documentId]
  );

  const updateCursor = useCallback(
    (x: number, y: number) => {
      if (!clientRef.current) return;

      clientRef.current.updateCursor({
        x,
        y,
        userId: stableUser.id,
      });
    },
    [stableUser.id]
  );

  const updateSelection = useCallback(
    (nodeIds: string[], edgeIds: string[]) => {
      if (!clientRef.current) return;

      clientRef.current.updateSelection({
        nodeIds,
        edgeIds,
        userId: stableUser.id,
      });
    },
    [stableUser.id]
  );

  const updateViewport = useCallback(
    (x: number, y: number, zoom: number) => {
      if (!clientRef.current) return;

      clientRef.current.updateViewport({
        x,
        y,
        zoom,
        userId: stableUser.id,
      });
    },
    [stableUser.id]
  );

  const setEditing = useCallback((nodeId: string | null) => {
    if (!clientRef.current) return;
    clientRef.current.setEditing(nodeId);
  }, []);

  const requestSync = useCallback(() => {
    if (!clientRef.current) return;
    clientRef.current.requestSync();
  }, []);

  const value: CollaborationContextValue = {
    client,
    document,
    presence,
    isConnected,
    currentUser: stableUser,
    submitOperation,
    updateCursor,
    updateSelection,
    updateViewport,
    setEditing,
    requestSync,
  };

  return <CollaborationContext.Provider value={value}>{children}</CollaborationContext.Provider>;
}

export function useCollaboration() {
  const context = useContext(CollaborationContext);
  if (!context) {
    throw new Error('useCollaboration must be used within CollaborationProvider');
  }
  return context;
}

/**
 * Hook to access awareness state (presence, cursors, etc.)
 */
export function useAwareness() {
  const { presence, currentUser, updateCursor, updateSelection, updateViewport } =
    useCollaboration();
  return {
    presence,
    currentUser,
    updateCursor,
    updateSelection,
    updateViewport,
  };
}

/**
 * Hook to access document state and operations
 */
export function useDoc() {
  const { document, submitOperation, isConnected } = useCollaboration();
  return {
    document,
    submitOperation,
    isConnected,
  };
}

function generateOperationId(): string {
  return `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
