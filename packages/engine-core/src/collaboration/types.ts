/**
 * Real-Time Collaboration Types
 * Type definitions for collaborative editing of node graphs
 */

import type { NodeId, EdgeId } from '@brepflow/types';

export type UserId = string;
export type SessionId = string;
export type OperationId = string;
export type ParameterId = string;

export interface CollaborationUser {
  id: UserId;
  name: string;
  email: string;
  color: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen: number;
  cursor?: CursorPosition;
  selection?: SelectionState;
  presence?: PresenceData;
}

// Add alias for compatibility with tests
export type ParticipantData = CollaborationUser;

export interface CursorPosition {
  x: number;
  y: number;
  nodeId?: NodeId;
  timestamp: number;
}

export interface SelectionState {
  selectedNodes: NodeId[];
  selectedEdges: EdgeId[];
  selectionBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  timestamp: number;
}

export interface CollaborationSession {
  id: SessionId;
  projectId: string;
  users: Map<UserId, CollaborationUser>;
  operations: Operation[];
  state: GraphState;
  createdAt: number;
  lastActivity: number;
  presence: {
    users: Map<UserId, PresenceData>;
    lastUpdated: number;
  };
  options: Record<string, unknown>;
}

export interface GraphState {
  nodes: Map<NodeId, any>;
  edges: Map<EdgeId, any>;
  parameters: Map<string, unknown>;
  version: number;
  lastModified: number;
}

// Operation Types for Operational Transformation
export type OperationType =
  | 'CREATE_NODE'
  | 'DELETE_NODE'
  | 'UPDATE_NODE_POSITION'
  | 'UPDATE_NODE_PARAMS'
  | 'CREATE_EDGE'
  | 'DELETE_EDGE'
  | 'UPDATE_EDGE'
  | 'BATCH';

export interface BaseOperation {
  id: OperationId;
  type: OperationType;
  userId: UserId;
  timestamp: number;
  version: number;
}

export interface CreateNodeOperation extends BaseOperation {
  type: 'CREATE_NODE';
  nodeId: NodeId;
  nodeType: string;
  position: { x: number; y: number };
  params?: Record<string, unknown>;
}

export interface DeleteNodeOperation extends BaseOperation {
  type: 'DELETE_NODE';
  nodeId: NodeId;
}

export interface UpdateNodePositionOperation extends BaseOperation {
  type: 'UPDATE_NODE_POSITION';
  nodeId: NodeId;
  position: { x: number; y: number };
  previousPosition: { x: number; y: number };
}

export interface UpdateNodeParamsOperation extends BaseOperation {
  type: 'UPDATE_NODE_PARAMS';
  nodeId: NodeId;
  paramUpdates: Record<string, unknown>;
  previousValues: Record<string, unknown>;
}

export interface CreateEdgeOperation extends BaseOperation {
  type: 'CREATE_EDGE';
  edgeId: EdgeId;
  sourceNodeId: NodeId;
  sourceSocket: string;
  targetNodeId: NodeId;
  targetSocket: string;
}

export interface DeleteEdgeOperation extends BaseOperation {
  type: 'DELETE_EDGE';
  edgeId: EdgeId;
}

export interface UpdateEdgeOperation extends BaseOperation {
  type: 'UPDATE_EDGE';
  edgeId: EdgeId;
  updates: Partial<{
    sourceNodeId: NodeId;
    sourceSocket: string;
    targetNodeId: NodeId;
    targetSocket: string;
  }>;
}

export interface BatchOperation extends BaseOperation {
  type: 'BATCH';
  operations: Operation[];
}

export type Operation =
  | CreateNodeOperation
  | DeleteNodeOperation
  | UpdateNodePositionOperation
  | UpdateNodeParamsOperation
  | CreateEdgeOperation
  | DeleteEdgeOperation
  | UpdateEdgeOperation
  | BatchOperation;

// Conflict Resolution
export type ConflictResolutionStrategy =
  | 'merge'
  | 'last-writer-wins'
  | 'first-writer-wins'
  | 'user-decision';

export interface ConflictResolution {
  resolved: boolean;
  strategy: ConflictResolutionStrategy;
  resolvedOperation: Operation;
  metadata?: Record<string, unknown>;
}

export interface OperationConflict {
  type: string;
  operation: Operation;
  conflictingOperation: Operation | null;
  description: string;
}

// WebSocket Message Types
export type WebSocketMessageType =
  | 'OPERATION'
  | 'OPERATION_ACK'
  | 'CURSOR_UPDATE'
  | 'SELECTION_UPDATE'
  | 'USER_JOIN'
  | 'USER_LEAVE'
  | 'USER_UPDATE'
  | 'HEARTBEAT'
  | 'ERROR'
  | 'SYNC_REQUEST'
  | 'SYNC_RESPONSE';

export interface WebSocketMessage {
  type: WebSocketMessageType;
  payload: unknown;
  timestamp: number;
  messageId: string;
}

export interface OperationMessage extends WebSocketMessage {
  type: 'OPERATION';
  payload: {
    operation: Operation;
    sessionId: SessionId;
  };
}

export interface OperationAckMessage extends WebSocketMessage {
  type: 'OPERATION_ACK';
  payload: {
    operationId: OperationId;
    success: boolean;
    error?: string;
    transformedOperation?: Operation;
  };
}

export interface CursorUpdateMessage extends WebSocketMessage {
  type: 'CURSOR_UPDATE';
  payload: {
    userId: UserId;
    cursor: CursorPosition;
  };
}

export interface SelectionUpdateMessage extends WebSocketMessage {
  type: 'SELECTION_UPDATE';
  payload: {
    userId: UserId;
    selection: SelectionState;
  };
}

export interface UserJoinMessage extends WebSocketMessage {
  type: 'USER_JOIN';
  payload: {
    user: CollaborationUser;
    sessionId: SessionId;
  };
}

export interface UserLeaveMessage extends WebSocketMessage {
  type: 'USER_LEAVE';
  payload: {
    userId: UserId;
    sessionId: SessionId;
  };
}

export interface SyncRequestMessage extends WebSocketMessage {
  type: 'SYNC_REQUEST';
  payload: {
    lastKnownVersion: number;
    userId: UserId;
  };
}

export interface SyncResponseMessage extends WebSocketMessage {
  type: 'SYNC_RESPONSE';
  payload: {
    operations: Operation[];
    currentState: GraphState;
    users: CollaborationUser[];
  };
}

// Presence and Awareness
export interface PresenceState {
  users: Map<UserId, CollaborationUser>;
  cursors: Map<UserId, CursorPosition>;
  selections: Map<UserId, SelectionState>;
  lastUpdate: number;
}

export interface PresenceData {
  userId: UserId;
  isOnline: boolean;
  cursor?: CursorPosition | null;
  selection?: SelectionState | null;
  lastActivity: number;
  currentActivity?: string;
}

export interface AwarenessUpdate {
  userId: UserId;
  type: 'cursor' | 'selection' | 'status';
  data: CursorPosition | SelectionState | { status: string };
  timestamp: number;
}

// Lock Management
export interface NodeLock {
  nodeId: NodeId;
  userId: UserId;
  lockType: 'edit' | 'view' | 'exclusive';
  acquiredAt: number;
  expiresAt: number;
  autoRelease: boolean;
}

export interface ParameterLock {
  sessionId: SessionId;
  parameterId: ParameterId;
  userId: UserId;
  acquiredAt: number;
  expiresAt: number;
}

export interface LockRequest {
  nodeId: NodeId;
  userId: UserId;
  lockType: 'edit' | 'view' | 'exclusive';
  duration?: number; // milliseconds
}

export interface LockManager {
  acquireLock: (request: LockRequest) => Promise<NodeLock | null>;
  releaseLock: (nodeId: NodeId, userId: UserId) => Promise<boolean>;
  getLocks: (nodeId?: NodeId) => NodeLock[];
  isLocked: (nodeId: NodeId, userId: UserId) => boolean;
  refreshLock: (nodeId: NodeId, userId: UserId) => Promise<boolean>;
}

// Collaboration Engine Interface
export interface CollaborationEngine {
  // Session Management
  createSession: (projectId: string, userId?: UserId) => Promise<SessionId>;
  joinSession: (sessionId: SessionId, user: CollaborationUser) => Promise<void>;
  leaveSession: (sessionId: SessionId, userId: UserId) => Promise<void>;
  getSession: (sessionId: SessionId) => Promise<CollaborationSession | null>;

  // Operation Management
  applyOperation: (sessionId: SessionId, operation: Operation) => Promise<void>;
  transformOperation: (localOp: Operation, remoteOp: Operation) => Promise<Operation>;
  resolveConflict: (conflict: OperationConflict) => Promise<ConflictResolution>;

  // Real-time Communication
  broadcastOperation: (sessionId: SessionId, operation: Operation) => Promise<void>;
  broadcastCursor: (sessionId: SessionId, userId: UserId, cursor: CursorPosition) => Promise<void>;
  broadcastSelection: (
    sessionId: SessionId,
    userId: UserId,
    selection: SelectionState
  ) => Promise<void>;

  // Synchronization
  syncWithServer: (sessionId: SessionId, lastKnownVersion: number) => Promise<Operation[]>;
  getFullState: (sessionId: SessionId) => Promise<GraphState>;

  // Lock Management
  lockManager: LockManager;

  // Presence Management
  updatePresence: (sessionId: SessionId, userId: UserId, presence: PresenceData) => Promise<void>;
  getPresence: (sessionId: SessionId) => Promise<PresenceState>;

  // Event handling
  addEventListener: (event: string, listener: (...args: any[]) => void) => void;
  removeEventListener: (event: string, listener: (...args: any[]) => void) => void;
}

// Configuration
export interface CollaborationConfig {
  // WebSocket configuration
  websocket: {
    url: string;
    reconnectAttempts: number;
    reconnectDelay: number;
    heartbeatInterval: number;
    connectionTimeout: number;
  };

  // Operation transformation
  operationalTransform: {
    maxOperationHistory: number;
    conflictResolutionStrategy: 'client-wins' | 'server-wins' | 'merge';
    batchOperations: boolean;
    batchDelay: number;
  };

  // Presence and awareness
  presence: {
    cursorUpdateThrottle: number;
    selectionUpdateThrottle: number;
    presenceTimeout: number;
    showCursors: boolean;
    showSelections: boolean;
  };

  // Lock management
  locks: {
    defaultLockDuration: number;
    maxLockDuration: number;
    autoReleaseLocks: boolean;
    lockConflictResolution: 'queue' | 'reject' | 'steal';
  };

  // Performance
  performance: {
    maxConcurrentUsers: number;
    operationQueueSize: number;
    compressionEnabled: boolean;
    deltaCompressionEnabled: boolean;
  };
}

// Events
export type CollaborationEventType =
  | 'operation-applied'
  | 'operation-received'
  | 'user-joined'
  | 'user-left'
  | 'cursor-updated'
  | 'selection-updated'
  | 'lock-acquired'
  | 'lock-released'
  | 'conflict-detected'
  | 'sync-completed'
  | 'connection-status-changed';

export interface CollaborationEvent {
  type: CollaborationEventType;
  sessionId: SessionId;
  userId?: UserId;
  data: unknown;
  timestamp: number;
}

export interface CollaborationEventListener {
  (event: CollaborationEvent): void;
}

// Error Types
export class CollaborationError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly sessionId?: SessionId,
    public readonly operation?: Operation
  ) {
    super(message);
    this.name = 'CollaborationError';
  }
}

export class OperationTransformError extends CollaborationError {
  constructor(
    message: string,
    public readonly localOperation: Operation,
    public readonly remoteOperation: Operation
  ) {
    super(message, 'TRANSFORM_ERROR');
    this.name = 'OperationTransformError';
  }
}

export class ConflictResolutionError extends CollaborationError {
  constructor(
    message: string,
    public readonly conflict: OperationConflict
  ) {
    super(message, 'CONFLICT_RESOLUTION_ERROR');
    this.name = 'ConflictResolutionError';
  }
}

export class WebSocketConnectionError extends CollaborationError {
  constructor(
    message: string,
    public readonly retryAttempt: number,
    public readonly maxRetries: number
  ) {
    super(message, 'WEBSOCKET_ERROR');
    this.name = 'WebSocketConnectionError';
  }
}
