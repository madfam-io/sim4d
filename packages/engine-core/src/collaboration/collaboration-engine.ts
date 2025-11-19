// TODO: Fix SessionId branded type usage and unknown type assertions
/**
 * Comprehensive Real-time Collaboration System for BrepFlow
 * Handles real-time multi-user collaboration with conflict resolution, presence awareness, and optimistic updates
 */

import type { SessionId, UserId, NodeId } from '@brepflow/types';

// Collaboration-specific types from collaboration package
export type CollaborationSession = any; // TODO: Import from @brepflow/collaboration when available
export type Operation = any;
export type OperationConflict = any;
export type ConflictResolution = any;
export type PresenceData = any;
export type ParameterLock = any;
export type ParticipantData = any;
export type ParameterId = string;

// Add missing type definitions
export type User = ParticipantData;
export type SessionState = {
  nodes: Map<NodeId, unknown>;
  edges: Map<string, unknown>;
  parameters: Map<string, unknown>;
  version: number;
  lastModified: number;
};

export type CursorPosition = {
  x: number;
  y: number;
  nodeId?: NodeId | null;
  timestamp?: number;
};

export type Selection = {
  nodeIds: NodeId[];
  edgeIds: string[];
};

// Error classes for collaboration
export class CollaborationError extends Error {
  constructor(
    message: string,
    public code: string,
    public sessionId?: SessionId,
    public operation?: Operation
  ) {
    super(message);
    this.name = 'CollaborationError';
  }
}

// WebSocket client interface
interface WebSocketClient {
  connect(url: string): Promise<void>;
  disconnect(): Promise<void>;
  send(message: unknown): Promise<void>;
  onMessage(callback: (data: unknown) => void): void;
  onReconnect(callback: () => void): void;
  isConnected(): boolean;
}

// Event types for collaboration
export interface CollaborationEvents {
  'session-joined': { sessionId: SessionId; user: ParticipantData };
  'session-left': { sessionId: SessionId; userId: UserId };
  'operation-applied': { sessionId: SessionId; operation: Operation };
  'conflict-detected': { sessionId: SessionId; conflict: OperationConflict };
  'presence-updated': { sessionId: SessionId; userId: UserId; presence: PresenceData };
  'parameter-locked': { sessionId: SessionId; parameterId: ParameterId; userId: UserId };
  'parameter-unlocked': { sessionId: SessionId; parameterId: ParameterId; userId: UserId };
  'connection-lost': { sessionId: SessionId };
  'connection-restored': { sessionId: SessionId };
  broadcast: { sessionId: SessionId; userId: UserId; message: unknown };
}

/**
 * Main collaboration engine that manages real-time multi-user collaboration
 */
export class BrepFlowCollaborationEngine {
  private sessions = new Map<SessionId, CollaborationSession>();
  private userSessions = new Map<UserId, SessionId>();
  private wsClient: WebSocketClient | null = null;
  private eventListeners = new Map<keyof CollaborationEvents, Array<(data: unknown) => void>>();
  private lockManager = new LockManager();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private heartbeatInterval: NodeJS.Timeout | null = null;

  constructor(wsClient?: WebSocketClient) {
    this.wsClient = wsClient || null;
    this.setupEventHandlers();
  }

  /**
   * Create a new collaboration session
   */
  async createSession(projectId: string = 'default', _userId?: UserId): Promise<SessionId> {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const session: CollaborationSession = {
      id: sessionId,
      projectId,
      users: new Map(),
      presence: {
        users: new Map(),
        lastUpdated: Date.now(),
      },
      state: {
        nodes: new Map(),
        edges: new Map(),
        parameters: new Map(),
        version: 0,
        lastModified: Date.now(),
      },
      operations: [],
      lastActivity: Date.now(),
      options: {},
    };

    this.sessions.set(sessionId, session);

    return sessionId;
  }

  /**
   * Get session information
   */
  async getSession(sessionId: SessionId): Promise<CollaborationSession | null> {
    return this.sessions.get(sessionId) || null;
  }

  /**
   * Join a collaboration session
   */
  async joinSession(sessionId: SessionId, user: ParticipantData): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new CollaborationError(`Session not found: ${sessionId}`, 'SESSION_NOT_FOUND');
    }

    // Add user to session
    session.users.set(user.id, user);
    this.userSessions.set(user.id, sessionId);
    session.lastActivity = Date.now();

    // Initialize user presence
    session.presence.users.set(user.id, {
      userId: user.id,
      isOnline: true,
      cursor: null,
      selection: null,
      lastActivity: Date.now(),
      currentActivity: 'joined',
    });

    // Connect to WebSocket if available
    if (this.wsClient && !this.wsClient.isConnected()) {
      await this.connectWebSocket(sessionId);
    }

    // Emit session joined event
    this.emit('session-joined', { sessionId, user });
  }

  /**
   * Leave a collaboration session
   */
  async leaveSession(sessionId: SessionId, userId: UserId): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return;
    }

    // Release all locks held by this user
    this.lockManager.releaseAllLocksForUser(sessionId, userId);

    // Remove user from session
    session.users.delete(userId);
    session.presence.users.delete(userId);
    this.userSessions.delete(userId);
    session.lastActivity = Date.now();

    // Emit session left event
    this.emit('session-left', { sessionId, userId });
  }

  /**
   * Apply an operation to the collaboration session
   */
  async applyOperation(sessionId: SessionId, operation: Operation): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new CollaborationError(`Session not found: ${sessionId}`, 'SESSION_NOT_FOUND');
    }

    try {
      // Detect conflicts
      const conflicts = await this.detectConflicts(session, operation);

      if (conflicts.length > 0) {
        console.warn(
          `[Collaboration] Detected ${conflicts.length} conflicts for operation ${operation.id}`
        );

        // Resolve conflicts
        for (const conflict of conflicts) {
          await this.resolveConflict(conflict);
          this.emit('conflict-detected', { sessionId, conflict });
        }
      }

      // Apply operation to session state
      await this.applyOperationToState(session, operation);

      // Add to operation history
      operation.version = session.state.version;
      session.operations.push(operation);

      // Update session state
      session.state.version++;
      session.state.lastModified = Date.now();
      session.lastActivity = Date.now();

      // Broadcast operation to other users
      await this.broadcastOperation(sessionId, operation);

      // Emit operation applied event
      this.emit('operation-applied', { sessionId, operation });
    } catch (error) {
      console.error('Error processing operation:', error);
      throw new CollaborationError(
        `Failed to process operation: ${error.message}`,
        'OPERATION_FAILED',
        sessionId,
        operation
      );
    }
  }

  /**
   * Detect conflicts between operations
   */
  private async detectConflicts(
    session: CollaborationSession,
    operation: Operation
  ): Promise<OperationConflict[]> {
    const conflicts: OperationConflict[] = [];

    // Check for parameter conflicts
    if (operation.type === 'UPDATE_NODE_PARAMS') {
      const updateOp = operation as unknown;
      const lock = this.lockManager.getLock(session.id, updateOp.parameterId);

      if (lock && lock.userId !== operation.userId) {
        conflicts.push({
          type: 'parameter-lock',
          operation,
          conflictingOperation: null,
          description: `Parameter ${updateOp.parameterId} is locked by user ${lock.userId}`,
        });
      }
    }

    return conflicts;
  }

  private async applyOperationToState(
    session: CollaborationSession,
    operation: Operation
  ): Promise<void> {
    // Validate operation parameter
    if (!operation) {
      throw new CollaborationError('Operation is null or undefined', 'INVALID_OPERATION');
    }

    if (!operation.type) {
      throw new CollaborationError('Operation type is missing or undefined', 'INVALID_OPERATION');
    }

    const { state } = session;

    switch (operation.type) {
      case 'CREATE_NODE': {
        const createNodeOp = operation as unknown;
        state.nodes.set(createNodeOp.nodeId, {
          id: createNodeOp.nodeId,
          type: createNodeOp.nodeType,
          position: createNodeOp.position,
          params: createNodeOp.params || {},
        });
        break;
      }

      case 'DELETE_NODE': {
        const deleteNodeOp = operation as unknown;
        state.nodes.delete(deleteNodeOp.nodeId);
        // Also remove edges connected to this node
        for (const [edgeId, edge] of state.edges) {
          if (
            edge.sourceNodeId === deleteNodeOp.nodeId ||
            edge.targetNodeId === deleteNodeOp.nodeId
          ) {
            state.edges.delete(edgeId);
          }
        }
        break;
      }

      case 'UPDATE_NODE_POSITION': {
        const updatePosOp = operation as unknown;
        const posNode = state.nodes.get(updatePosOp.nodeId);
        if (posNode) {
          posNode.position = updatePosOp.position;
        }
        break;
      }

      case 'UPDATE_NODE_PARAMS': {
        const updateParamsOp = operation as unknown;
        const paramsNode = state.nodes.get(updateParamsOp.nodeId);
        if (paramsNode) {
          paramsNode.params = { ...paramsNode.params, ...updateParamsOp.params };
        }
        break;
      }

      case 'CREATE_EDGE': {
        const createEdgeOp = operation as unknown;
        state.edges.set(createEdgeOp.edgeId, {
          id: createEdgeOp.edgeId,
          sourceNodeId: createEdgeOp.sourceNodeId,
          targetNodeId: createEdgeOp.targetNodeId,
          sourceSocket: createEdgeOp.sourceSocket,
          targetSocket: createEdgeOp.targetSocket,
        });
        break;
      }

      case 'DELETE_EDGE': {
        const deleteEdgeOp = operation as unknown;
        state.edges.delete(deleteEdgeOp.edgeId);
        break;
      }

      default:
        console.warn(`[Collaboration] Unknown operation type: ${operation.type}, applying as-is`);
        // Don't throw error for unknown types to be more resilient
        break;
    }
  }

  private async resolveConflict(conflict: OperationConflict): Promise<ConflictResolution> {
    // Simple conflict resolution - for now just prefer the newer operation
    return {
      resolved: true,
      strategy: 'prefer-newer',
      resolvedOperation: conflict.operation,
      metadata: { conflictType: conflict.type },
    };
  }

  private async broadcastOperation(sessionId: SessionId, operation: Operation): Promise<void> {
    if (this.wsClient) {
      await this.wsClient.send({
        type: 'collaboration-operation',
        sessionId,
        operation,
      });
    }
  }

  /**
   * Update user presence in a session
   */
  async updatePresence(
    sessionId: SessionId,
    userId: UserId,
    presence: PresenceData
  ): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new CollaborationError(`Session not found: ${sessionId}`, 'SESSION_NOT_FOUND');
    }

    const user = session.users.get(userId);
    if (!user) {
      throw new CollaborationError(`User not in session: ${userId}`, 'USER_NOT_IN_SESSION');
    }

    // Update presence data in the proper location
    const presenceData = session.presence.users.get(userId);
    if (presenceData) {
      // Update individual fields if they exist in the presence object
      if (presence.cursor !== undefined) presenceData.cursor = presence.cursor;
      if (presence.selection !== undefined) presenceData.selection = presence.selection;
      if (presence.viewport !== undefined) presenceData.viewport = presence.viewport;
      if (presence.activity !== undefined) presenceData.currentActivity = presence.activity;
      presenceData.lastActivity = Date.now();
    }

    // Also update user object for backward compatibility
    user.presence = presence;
    user.lastSeen = Date.now();
    session.lastActivity = Date.now();

    // Broadcast presence update
    if (this.wsClient) {
      await this.wsClient.send({
        type: 'presence-update',
        sessionId,
        userId,
        presence,
      });
    }

    this.emit('presence-updated', { sessionId, userId, presence });
  }

  /**
   * Get current presence state for all users in a session
   */
  async getPresenceState(sessionId: SessionId): Promise<Map<UserId, PresenceData>> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new CollaborationError(`Session not found: ${sessionId}`, 'SESSION_NOT_FOUND');
    }

    // Return the presence map directly from the session
    return new Map(session.presence.users);
  }

  /**
   * Lock a parameter for exclusive editing
   */
  async lockParameter(
    sessionId: SessionId,
    parameterId: ParameterId,
    userId: UserId
  ): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new CollaborationError(`Session not found: ${sessionId}`, 'SESSION_NOT_FOUND');
    }

    await this.lockManager.acquireLock(sessionId, parameterId, userId);
    this.emit('parameter-locked', { sessionId, parameterId, userId });
  }

  /**
   * Unlock a parameter
   */
  async unlockParameter(
    sessionId: SessionId,
    parameterId: ParameterId,
    userId: UserId
  ): Promise<void> {
    await this.lockManager.releaseLock(sessionId, parameterId, userId);
    this.emit('parameter-unlocked', { sessionId, parameterId, userId });
  }

  /**
   * Get all parameter locks for a session
   */
  async getParameterLocks(sessionId: SessionId): Promise<Map<ParameterId, ParameterLock>> {
    return this.lockManager.getSessionLocks(sessionId);
  }

  /**
   * Event handling
   */
  on<K extends keyof CollaborationEvents>(
    event: K,
    listener: (data: CollaborationEvents[K]) => void
  ): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(listener);
  }

  off<K extends keyof CollaborationEvents>(
    event: K,
    listener: (data: CollaborationEvents[K]) => void
  ): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emit<K extends keyof CollaborationEvents>(event: K, data: CollaborationEvents[K]): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach((listener) => {
        try {
          listener(data);
        } catch (error) {
          console.error(`[Collaboration] Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  /**
   * WebSocket connection management
   */
  private async connectWebSocket(sessionId: SessionId): Promise<void> {
    if (!this.wsClient) {
      return;
    }

    try {
      const wsUrl = this.buildWebSocketUrl(sessionId);
      await this.wsClient.connect(wsUrl);

      this.setupWebSocketHandlers();
      this.startHeartbeat();
      this.reconnectAttempts = 0;
    } catch (error) {
      console.error('[Collaboration] Failed to connect to WebSocket:', error);
      await this.handleReconnect(sessionId);
    }
  }

  private buildWebSocketUrl(sessionId: SessionId): string {
    // This would be configurable based on your server setup
    const baseUrl = process.env.COLLABORATION_WS_URL || 'ws://localhost:8080';
    return `${baseUrl}/collaboration/${sessionId}`;
  }

  private setupWebSocketHandlers(): void {
    if (!this.wsClient) {
      return;
    }

    this.wsClient.onMessage((data) => {
      this.handleWebSocketMessage(data);
    });

    this.wsClient.onReconnect(async () => {
      this.emit('connection-restored', { sessionId: 'unknown' });
    });
  }

  private async handleWebSocketMessage(data: unknown): Promise<void> {
    try {
      switch (data.type) {
        case 'collaboration-operation':
          await this.handleRemoteOperation(data.sessionId, data.operation);
          break;
        case 'presence-update':
          await this.handleRemotePresenceUpdate(data.sessionId, data.userId, data.presence);
          break;
        case 'user-joined':
          this.emit('session-joined', { sessionId: data.sessionId, user: data.user });
          break;
        case 'user-left':
          this.emit('session-left', { sessionId: data.sessionId, userId: data.userId });
          break;
        default:
          console.warn('[Collaboration] Unknown WebSocket message type:', data.type);
      }
    } catch (error) {
      console.error('[Collaboration] Error handling WebSocket message:', error);
    }
  }

  private async handleRemoteOperation(sessionId: SessionId, operation: Operation): Promise<void> {
    // Apply remote operation without broadcasting back
    const session = this.sessions.get(sessionId);
    if (session) {
      await this.applyOperationToState(session, operation);
      this.emit('operation-applied', { sessionId, operation });
    }
  }

  private async handleRemotePresenceUpdate(
    sessionId: SessionId,
    userId: UserId,
    presence: PresenceData
  ): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (session) {
      const user = session.users.get(userId);
      if (user) {
        user.presence = presence;
        user.lastSeen = Date.now();
        this.emit('presence-updated', { sessionId, userId, presence });
      }
    }
  }

  private async handleReconnect(sessionId: SessionId): Promise<void> {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[Collaboration] Max reconnection attempts reached');
      this.emit('connection-lost', { sessionId });
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts - 1), 30000);

    setTimeout(async () => {
      await this.connectWebSocket(sessionId);
    }, delay);
  }

  private setupEventHandlers(): void {
    // Event handlers can be registered by consumers via .on()
  }

  private startHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    this.heartbeatInterval = setInterval(async () => {
      if (this.wsClient && this.wsClient.isConnected()) {
        try {
          await this.wsClient.send({ type: 'heartbeat', timestamp: Date.now() });
        } catch (error) {
          console.warn('[Collaboration] Heartbeat failed:', error);
        }
      }
    }, 30000); // 30 second heartbeat
  }

  /**
   * Get active users in a session
   */
  getActiveUsers(sessionId: SessionId): User[] {
    const session = this.sessions.get(sessionId);
    if (!session) return [];

    return Array.from(session.users.values())
      .filter((user) => {
        // Consider user online if they're in the users list (they joined)
        // and either have no presence data yet or are marked as online
        const presenceData = session.presence.users.get(user.id);
        return !presenceData || presenceData.isOnline !== false;
      })
      .map((user) => {
        const presenceData = session.presence.users.get(user.id);
        return {
          ...user,
          cursor: presenceData?.cursor || user.cursor,
          selection: presenceData?.selection || user.selection,
        };
      });
  }

  /**
   * Get the current state of a session
   */
  getSessionState(sessionId: SessionId): SessionState | null {
    const session = this.sessions.get(sessionId);
    return session?.state || null;
  }

  /**
   * Update user cursor position
   */
  async updateCursor(sessionId: SessionId, userId: UserId, cursor: CursorPosition): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new CollaborationError(`Session ${sessionId} not found`, 'SESSION_NOT_FOUND');
    }

    const presenceData = session.presence.users.get(userId);
    if (presenceData) {
      presenceData.cursor = cursor;

      // Broadcast cursor update to other users
      await this.broadcastToSession(
        sessionId,
        {
          type: 'cursor-update',
          userId,
          cursor,
          timestamp: Date.now(),
        },
        userId
      );
    }

    // Send via WebSocket
    if (this.wsClient && this.wsClient.isConnected()) {
      await this.wsClient.send({
        type: 'presence-update',
        sessionId,
        userId,
        presence: {
          cursor,
        },
      });
    }
  }

  /**
   * Broadcast cursor position to other users
   */
  async broadcastCursor(
    sessionId: SessionId,
    userId: UserId,
    cursor: CursorPosition
  ): Promise<void> {
    // Alias for updateCursor for compatibility
    await this.updateCursor(sessionId, userId, cursor);
  }

  /**
   * Update user selection
   */
  async updateSelection(sessionId: SessionId, userId: UserId, selection: Selection): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new CollaborationError(`Session ${sessionId} not found`, 'SESSION_NOT_FOUND');
    }

    const presenceData = session.presence.users.get(userId);
    if (presenceData) {
      presenceData.selection = selection;

      // Broadcast selection update to other users
      await this.broadcastToSession(
        sessionId,
        {
          type: 'selection-update',
          userId,
          selection,
          timestamp: Date.now(),
        },
        userId
      );
    }

    // Send via WebSocket
    if (this.wsClient && this.wsClient.isConnected()) {
      await this.wsClient.send({
        type: 'presence-update',
        sessionId,
        userId,
        presence: {
          selection,
        },
      });
    }
  }

  /**
   * Broadcast selection to other users
   */
  async broadcastSelection(
    sessionId: SessionId,
    userId: UserId,
    selection: Selection
  ): Promise<void> {
    // Alias for updateSelection for compatibility
    await this.updateSelection(sessionId, userId, selection);
  }

  /**
   * Broadcast message to all users in a session
   */
  private async broadcastToSession(
    sessionId: SessionId,
    message: unknown,
    excludeUserId?: UserId
  ): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    // Send to all users except the excluded one
    for (const [userId] of session.users) {
      if (userId !== excludeUserId) {
        // In a real implementation, this would send via WebSocket
        // For now, emit an event that can be listened to
        this.emit('broadcast', { sessionId, userId, message });
      }
    }

    // Also send via WebSocket if connected
    if (this.wsClient && this.wsClient.isConnected()) {
      try {
        await this.wsClient.send(message);
      } catch (error) {
        console.warn('[Collaboration] Failed to broadcast message:', error);
      }
    }
  }

  /**
   * Cleanup and shutdown
   */
  async shutdown(): Promise<void> {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    if (this.wsClient) {
      await this.wsClient.disconnect();
    }

    this.sessions.clear();
    this.userSessions.clear();
    this.eventListeners.clear();
    this.lockManager.cleanup();
  }
}

/**
 * Lock manager for parameter-level locking
 */
class LockManager {
  private locks = new Map<string, ParameterLock>();

  async acquireLock(sessionId: SessionId, parameterId: ParameterId, userId: UserId): Promise<void> {
    const lockKey = `${sessionId}:${parameterId}`;
    const existingLock = this.locks.get(lockKey);

    if (existingLock && existingLock.userId !== userId) {
      throw new CollaborationError(
        `Parameter ${parameterId} is already locked by user ${existingLock.userId}`,
        'PARAMETER_LOCKED'
      );
    }

    this.locks.set(lockKey, {
      sessionId,
      parameterId,
      userId,
      acquiredAt: Date.now(),
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 minute expiry
    });
  }

  async releaseLock(sessionId: SessionId, parameterId: ParameterId, userId: UserId): Promise<void> {
    const lockKey = `${sessionId}:${parameterId}`;
    const existingLock = this.locks.get(lockKey);

    if (existingLock && existingLock.userId === userId) {
      this.locks.delete(lockKey);
    }
  }

  getLock(sessionId: SessionId, parameterId: ParameterId): ParameterLock | null {
    const lockKey = `${sessionId}:${parameterId}`;
    const lock = this.locks.get(lockKey);

    // Check if lock has expired
    if (lock && lock.expiresAt < Date.now()) {
      this.locks.delete(lockKey);
      return null;
    }

    return lock || null;
  }

  getSessionLocks(sessionId: SessionId): Map<ParameterId, ParameterLock> {
    const sessionLocks = new Map<ParameterId, ParameterLock>();

    for (const [lockKey, lock] of this.locks) {
      if (lock.sessionId === sessionId && lock.expiresAt > Date.now()) {
        sessionLocks.set(lock.parameterId, lock);
      }
    }

    return sessionLocks;
  }

  releaseAllLocksForUser(sessionId: SessionId, userId: UserId): void {
    const toDelete: string[] = [];

    for (const [lockKey, lock] of this.locks) {
      if (lock.sessionId === sessionId && lock.userId === userId) {
        toDelete.push(lockKey);
      }
    }

    toDelete.forEach((key) => this.locks.delete(key));
  }

  cleanup(): void {
    // Remove expired locks
    const now = Date.now();
    const toDelete: string[] = [];

    for (const [lockKey, lock] of this.locks) {
      if (lock.expiresAt < now) {
        toDelete.push(lockKey);
      }
    }

    toDelete.forEach((key) => this.locks.delete(key));
  }
}
