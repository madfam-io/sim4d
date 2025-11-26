import type {
  NodeId,
  EdgeId,
  GraphInstance,
  NodeInstance,
  Edge as EdgeType,
} from '@sim4d/types';

// Re-export types for convenience
export type Graph = GraphInstance;
export type Node = NodeInstance;
export type Edge = EdgeType;

// User and Session Types
export interface User {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  color: string;
}

export interface Session {
  id: string;
  userId: string;
  documentId: string;
  connectionId: string;
  joinedAt: Date;
  lastActivity: Date;
}

// Presence Types
export interface Cursor {
  x: number;
  y: number;
  userId: string;
}

export interface Selection {
  nodeIds: string[];
  edgeIds: string[];
  userId: string;
}

export interface Viewport {
  x: number;
  y: number;
  zoom: number;
  userId: string;
}

export interface Presence {
  cursor?: Cursor;
  selection?: Selection;
  viewport?: Viewport;
  user: User;
  isEditing?: string | null;
}

// Operation Types for Operational Transformation
export type OperationType =
  | 'ADD_NODE'
  | 'DELETE_NODE'
  | 'UPDATE_NODE'
  | 'ADD_EDGE'
  | 'DELETE_EDGE'
  | 'UPDATE_GRAPH_METADATA';

export interface BaseOperation {
  id: string;
  type: OperationType;
  userId: string;
  timestamp: number;
  documentId: string;
}

export interface AddNodeOperation extends BaseOperation {
  type: 'ADD_NODE';
  node: Node;
}

export interface DeleteNodeOperation extends BaseOperation {
  type: 'DELETE_NODE';
  nodeId: NodeId;
}

export interface UpdateNodeOperation extends BaseOperation {
  type: 'UPDATE_NODE';
  nodeId: NodeId;
  updates: Partial<Node>;
}

export interface AddEdgeOperation extends BaseOperation {
  type: 'ADD_EDGE';
  edge: Edge;
}

export interface DeleteEdgeOperation extends BaseOperation {
  type: 'DELETE_EDGE';
  edgeId: EdgeId;
}

export interface UpdateGraphMetadataOperation extends BaseOperation {
  type: 'UPDATE_GRAPH_METADATA';
  metadata: Partial<Graph['metadata']>;
}

export type Operation =
  | AddNodeOperation
  | DeleteNodeOperation
  | UpdateNodeOperation
  | AddEdgeOperation
  | DeleteEdgeOperation
  | UpdateGraphMetadataOperation;

// Operation payload accepted from clients before enrichment with metadata
export type OperationInput =
  | { type: 'ADD_NODE'; node: Node }
  | { type: 'DELETE_NODE'; nodeId: NodeId | string }
  | { type: 'UPDATE_NODE'; nodeId: NodeId | string; updates: Partial<Node> }
  | { type: 'ADD_EDGE'; edge: Edge }
  | { type: 'DELETE_EDGE'; edgeId: EdgeId | string }
  | { type: 'UPDATE_GRAPH_METADATA'; metadata: Partial<Graph['metadata']> };

// Conflict Resolution
export interface Conflict {
  operation1: Operation;
  operation2: Operation;
  resolution?: Operation;
}

// Document State
export interface Document {
  id: string;
  graph: Graph;
  version: number;
  operations: Operation[];
  sessions: Session[];
}

// WebSocket Events
export interface ServerToClientEvents {
  'operation:broadcast': (operation: Operation) => void;
  'presence:update': (presence: Presence[]) => void;
  'presence:join': (presence: Presence) => void;
  'presence:leave': (userId: string) => void;
  'document:sync': (document: Document) => void;
  'conflict:detected': (conflict: Conflict) => void;
  error: (error: Error) => void;
}

export interface ClientToServerEvents {
  'document:join': (documentId: string, user: User) => void;
  'document:leave': () => void;
  'operation:submit': (operation: Operation) => void;
  'presence:cursor': (cursor: Cursor) => void;
  'presence:selection': (selection: Selection) => void;
  'presence:viewport': (viewport: Viewport) => void;
  'presence:editing': (nodeId: string | null) => void;
  'document:request-sync': () => void;
}

// Collaboration Options
export interface CollaborationOptions {
  serverUrl: string;
  documentId: string;
  user: User;
  autoConnect?: boolean;
  reconnectAttempts?: number;
  reconnectDelay?: number;
  presenceThrottle?: number;
  operationBuffer?: number;
}

// Collaboration Event Handlers
export interface CollaborationEventHandler {
  onOperation?: (operation: Operation) => void;
  onPresenceUpdate?: (presence: Presence[]) => void;
  onPresenceJoin?: (presence: Presence) => void;
  onPresenceLeave?: (userId: string) => void;
  onDocumentSync?: (document: Document) => void;
  onConflict?: (conflict: Conflict) => void;
  onError?: (error: Error) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}
