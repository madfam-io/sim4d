/**
 * WebSocket Service
 * Real-time communication hub for Sim4D cloud services
 */

import EventEmitter from 'events';
import WebSocket from 'ws';
import {
  SessionId,
  UserId,
  ProjectId,
  CloudOperation,
  SyncState,
  ConflictResolution,
} from '@sim4d/cloud-api/src/types';

export interface WebSocketConfig {
  port: number;
  path: string;
  heartbeatInterval: number;
  maxConnections: number;
  messageRateLimit: {
    maxPerSecond: number;
    windowSize: number;
  };
  authentication: {
    required: boolean;
    tokenValidation: (token: string) => Promise<{ userId: UserId; valid: boolean }>;
  };
}

export interface ClientConnection {
  id: string;
  socket: WebSocket;
  userId: UserId;
  sessionId?: SessionId;
  projectIds: Set<ProjectId>;
  lastActivity: Date;
  messageCount: number;
  messageWindow: number[];
}

export interface WebSocketMessage {
  id: string;
  type: MessageType;
  timestamp: number;
  userId?: UserId;
  sessionId?: SessionId;
  projectId?: ProjectId;
  data: unknown;
}

export type MessageType =
  | 'auth'
  | 'join_project'
  | 'leave_project'
  | 'operation'
  | 'sync_state'
  | 'conflict'
  | 'cursor'
  | 'selection'
  | 'presence'
  | 'typing'
  | 'error'
  | 'heartbeat'
  | 'ack';

export class WebSocketService extends EventEmitter {
  private config: WebSocketConfig;
  private server?: WebSocket.Server;
  private connections = new Map<string, ClientConnection>();
  private projectConnections = new Map<ProjectId, Set<string>>();
  private sessionConnections = new Map<SessionId, Set<string>>();
  private heartbeatTimer?: NodeJS.Timeout;
  private cleanupTimer?: NodeJS.Timeout;

  constructor(config: WebSocketConfig) {
    super();
    this.config = config;
  }

  /**
   * Server Lifecycle
   */
  start(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.server = new WebSocket.Server({
          port: this.config.port,
          path: this.config.path,
          maxPayload: 1024 * 1024, // 1MB max message size
        });

        this.server.on('connection', this.handleConnection.bind(this));
        this.server.on('error', reject);
        this.server.on('listening', () => {
          this.startHeartbeat();
          this.startCleanup();
          resolve();
        });

        this.emit('server-started', { port: this.config.port });
      } catch (error) {
        reject(error);
      }
    });
  }

  stop(): Promise<void> {
    return new Promise((resolve) => {
      if (this.heartbeatTimer) {
        clearInterval(this.heartbeatTimer);
      }

      if (this.cleanupTimer) {
        clearInterval(this.cleanupTimer);
      }

      // Close all connections
      for (const connection of this.connections.values()) {
        connection.socket.close();
      }

      if (this.server) {
        this.server.close(() => {
          this.emit('server-stopped');
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  /**
   * Connection Management
   */
  private async handleConnection(socket: WebSocket, request: unknown): Promise<void> {
    const connectionId = this.generateConnectionId();
    const connection: ClientConnection = {
      id: connectionId,
      socket,
      userId: '' as UserId, // Will be set after authentication
      projectIds: new Set(),
      lastActivity: new Date(),
      messageCount: 0,
      messageWindow: [],
    };

    this.connections.set(connectionId, connection);

    socket.on('message', (data) => this.handleMessage(connectionId, data));
    socket.on('close', () => this.handleDisconnection(connectionId));
    socket.on('error', (error) => this.handleConnectionError(connectionId, error));
    socket.on('pong', () => this.handlePong(connectionId));

    // Send welcome message
    this.sendMessage(connectionId, {
      id: this.generateMessageId(),
      type: 'auth',
      timestamp: Date.now(),
      data: {
        connectionId,
        authRequired: this.config.authentication.required,
      },
    });

    this.emit('connection-opened', { connectionId, remote: request.socket.remoteAddress });
  }

  private async handleMessage(connectionId: string, data: WebSocket.Data): Promise<void> {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    try {
      // Rate limiting
      if (!this.checkRateLimit(connection)) {
        this.sendError(connectionId, 'RATE_LIMIT_EXCEEDED', 'Too many messages');
        return;
      }

      const message: WebSocketMessage = JSON.parse(data.toString());
      connection.lastActivity = new Date();

      // Validate message structure
      if (!this.validateMessage(message)) {
        this.sendError(connectionId, 'INVALID_MESSAGE', 'Invalid message format');
        return;
      }

      // Handle authentication
      if (message.type === 'auth') {
        await this.handleAuthentication(connectionId, message);
        return;
      }

      // Check authentication for other messages
      if (this.config.authentication.required && !connection.userId) {
        this.sendError(connectionId, 'AUTH_REQUIRED', 'Authentication required');
        return;
      }

      // Route message by type
      await this.routeMessage(connectionId, message);
    } catch (error) {
      this.sendError(connectionId, 'MESSAGE_ERROR', error.message);
    }
  }

  private handleDisconnection(connectionId: string): void {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    // Remove from project subscriptions
    for (const projectId of connection.projectIds) {
      this.leaveProject(connectionId, projectId);
    }

    // Remove from session subscriptions
    if (connection.sessionId) {
      this.leaveSession(connectionId, connection.sessionId);
    }

    this.connections.delete(connectionId);
    this.emit('connection-closed', { connectionId, userId: connection.userId });
  }

  private handleConnectionError(connectionId: string, error: Error): void {
    this.emit('connection-error', { connectionId, error: error.message });
  }

  private handlePong(connectionId: string): void {
    const connection = this.connections.get(connectionId);
    if (connection) {
      connection.lastActivity = new Date();
    }
  }

  /**
   * Message Routing
   */
  private async routeMessage(connectionId: string, message: WebSocketMessage): Promise<void> {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    switch (message.type) {
      case 'join_project':
        await this.handleJoinProject(connectionId, message);
        break;

      case 'leave_project':
        await this.handleLeaveProject(connectionId, message);
        break;

      case 'operation':
        await this.handleOperation(connectionId, message);
        break;

      case 'cursor':
        await this.handleCursor(connectionId, message);
        break;

      case 'selection':
        await this.handleSelection(connectionId, message);
        break;

      case 'typing':
        await this.handleTyping(connectionId, message);
        break;

      case 'heartbeat':
        this.sendMessage(connectionId, {
          id: this.generateMessageId(),
          type: 'heartbeat',
          timestamp: Date.now(),
          data: { pong: true },
        });
        break;

      default:
        this.sendError(
          connectionId,
          'UNKNOWN_MESSAGE_TYPE',
          `Unknown message type: ${message.type}`
        );
    }
  }

  /**
   * Authentication
   */
  private async handleAuthentication(
    connectionId: string,
    message: WebSocketMessage
  ): Promise<void> {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    try {
      const { token } = message.data;
      const result = await this.config.authentication.tokenValidation(token);

      if (result.valid) {
        connection.userId = result.userId;
        this.sendMessage(connectionId, {
          id: this.generateMessageId(),
          type: 'auth',
          timestamp: Date.now(),
          data: { authenticated: true, userId: result.userId },
        });

        this.emit('user-authenticated', { connectionId, userId: result.userId });
      } else {
        this.sendError(connectionId, 'AUTH_FAILED', 'Invalid authentication token');
      }
    } catch (error) {
      this.sendError(connectionId, 'AUTH_ERROR', error.message);
    }
  }

  /**
   * Project Management
   */
  private async handleJoinProject(connectionId: string, message: WebSocketMessage): Promise<void> {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    const { projectId } = message.data;
    this.joinProject(connectionId, projectId);

    this.sendMessage(connectionId, {
      id: this.generateMessageId(),
      type: 'join_project',
      timestamp: Date.now(),
      data: { projectId, joined: true },
    });
  }

  private async handleLeaveProject(connectionId: string, message: WebSocketMessage): Promise<void> {
    const { projectId } = message.data;
    this.leaveProject(connectionId, projectId);

    this.sendMessage(connectionId, {
      id: this.generateMessageId(),
      type: 'leave_project',
      timestamp: Date.now(),
      data: { projectId, left: true },
    });
  }

  private joinProject(connectionId: string, projectId: ProjectId): void {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    connection.projectIds.add(projectId);

    let projectConnections = this.projectConnections.get(projectId);
    if (!projectConnections) {
      projectConnections = new Set();
      this.projectConnections.set(projectId, projectConnections);
    }
    projectConnections.add(connectionId);

    this.emit('user-joined-project', {
      userId: connection.userId,
      projectId,
      connectionCount: projectConnections.size,
    });
  }

  private leaveProject(connectionId: string, projectId: ProjectId): void {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    connection.projectIds.delete(projectId);

    const projectConnections = this.projectConnections.get(projectId);
    if (projectConnections) {
      projectConnections.delete(connectionId);
      if (projectConnections.size === 0) {
        this.projectConnections.delete(projectId);
      }
    }

    this.emit('user-left-project', {
      userId: connection.userId,
      projectId,
      connectionCount: projectConnections?.size || 0,
    });
  }

  /**
   * Real-time Operations
   */
  private async handleOperation(connectionId: string, message: WebSocketMessage): Promise<void> {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    const { projectId, operation } = message.data;

    // Validate project access
    if (!connection.projectIds.has(projectId)) {
      this.sendError(connectionId, 'PROJECT_ACCESS_DENIED', 'Not subscribed to project');
      return;
    }

    // Broadcast to other project subscribers
    this.broadcastToProject(
      projectId,
      {
        id: this.generateMessageId(),
        type: 'operation',
        timestamp: Date.now(),
        userId: connection.userId,
        projectId,
        data: { operation },
      },
      connectionId
    );

    this.emit('operation-received', {
      userId: connection.userId,
      projectId,
      operation,
    });
  }

  private async handleCursor(connectionId: string, message: WebSocketMessage): Promise<void> {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    const { projectId, cursor } = message.data;

    if (!connection.projectIds.has(projectId)) {
      return; // Silently ignore invalid project access for cursor updates
    }

    // Broadcast cursor position (throttled)
    this.broadcastToProject(
      projectId,
      {
        id: this.generateMessageId(),
        type: 'cursor',
        timestamp: Date.now(),
        userId: connection.userId,
        projectId,
        data: { cursor },
      },
      connectionId
    );
  }

  private async handleSelection(connectionId: string, message: WebSocketMessage): Promise<void> {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    const { projectId, selection } = message.data;

    if (!connection.projectIds.has(projectId)) {
      return;
    }

    this.broadcastToProject(
      projectId,
      {
        id: this.generateMessageId(),
        type: 'selection',
        timestamp: Date.now(),
        userId: connection.userId,
        projectId,
        data: { selection },
      },
      connectionId
    );
  }

  private async handleTyping(connectionId: string, message: WebSocketMessage): Promise<void> {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    const { projectId, isTyping, nodeId } = message.data;

    if (!connection.projectIds.has(projectId)) {
      return;
    }

    this.broadcastToProject(
      projectId,
      {
        id: this.generateMessageId(),
        type: 'typing',
        timestamp: Date.now(),
        userId: connection.userId,
        projectId,
        data: { isTyping, nodeId },
      },
      connectionId
    );
  }

  /**
   * Broadcasting
   */
  broadcastToProject(
    projectId: ProjectId,
    message: WebSocketMessage,
    excludeConnectionId?: string
  ): void {
    const connections = this.projectConnections.get(projectId);
    if (!connections) return;

    for (const connectionId of connections) {
      if (connectionId !== excludeConnectionId) {
        this.sendMessage(connectionId, message);
      }
    }
  }

  broadcastToSession(
    sessionId: SessionId,
    message: WebSocketMessage,
    excludeConnectionId?: string
  ): void {
    const connections = this.sessionConnections.get(sessionId);
    if (!connections) return;

    for (const connectionId of connections) {
      if (connectionId !== excludeConnectionId) {
        this.sendMessage(connectionId, message);
      }
    }
  }

  broadcastToUser(userId: UserId, message: WebSocketMessage): void {
    for (const connection of this.connections.values()) {
      if (connection.userId === userId) {
        this.sendMessage(connection.id, message);
      }
    }
  }

  /**
   * Message Utilities
   */
  private sendMessage(connectionId: string, message: WebSocketMessage): void {
    const connection = this.connections.get(connectionId);
    if (!connection || connection.socket.readyState !== WebSocket.OPEN) {
      return;
    }

    try {
      connection.socket.send(JSON.stringify(message));
    } catch (error) {
      this.emit('send-error', { connectionId, error: error.message });
    }
  }

  private sendError(connectionId: string, code: string, message: string): void {
    this.sendMessage(connectionId, {
      id: this.generateMessageId(),
      type: 'error',
      timestamp: Date.now(),
      data: { code, message },
    });
  }

  /**
   * Validation and Rate Limiting
   */
  private validateMessage(message: unknown): boolean {
    return (
      message &&
      typeof message.id === 'string' &&
      typeof message.type === 'string' &&
      typeof message.timestamp === 'number' &&
      message.data !== undefined
    );
  }

  private checkRateLimit(connection: ClientConnection): boolean {
    const now = Date.now();
    const windowSize = this.config.messageRateLimit.windowSize;

    // Clean old entries
    connection.messageWindow = connection.messageWindow.filter((time) => now - time < windowSize);

    // Check limit
    if (connection.messageWindow.length >= this.config.messageRateLimit.maxPerSecond) {
      return false;
    }

    connection.messageWindow.push(now);
    connection.messageCount++;
    return true;
  }

  /**
   * Maintenance
   */
  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      for (const [connectionId, connection] of this.connections) {
        if (connection.socket.readyState === WebSocket.OPEN) {
          connection.socket.ping();
        }
      }
    }, this.config.heartbeatInterval);
  }

  private startCleanup(): void {
    this.cleanupTimer = setInterval(() => {
      const now = Date.now();
      const staleThreshold = 60 * 1000; // 60 seconds

      for (const [connectionId, connection] of this.connections) {
        const timeSinceActivity = now - connection.lastActivity.getTime();

        if (timeSinceActivity > staleThreshold || connection.socket.readyState !== WebSocket.OPEN) {
          this.handleDisconnection(connectionId);
        }
      }
    }, 30 * 1000); // Run every 30 seconds
  }

  /**
   * Utilities
   */
  private generateConnectionId(): string {
    return `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private leaveSession(connectionId: string, sessionId: SessionId): void {
    const sessionConnections = this.sessionConnections.get(sessionId);
    if (sessionConnections) {
      sessionConnections.delete(connectionId);
      if (sessionConnections.size === 0) {
        this.sessionConnections.delete(sessionId);
      }
    }
  }

  /**
   * Stats and Monitoring
   */
  getStats(): {
    connections: number;
    projects: number;
    sessions: number;
    messagesPerSecond: number;
  } {
    const totalMessages = Array.from(this.connections.values()).reduce(
      (total, conn) => total + conn.messageCount,
      0
    );

    return {
      connections: this.connections.size,
      projects: this.projectConnections.size,
      sessions: this.sessionConnections.size,
      messagesPerSecond: totalMessages / 60, // Rough estimate
    };
  }

  getProjectConnections(projectId: ProjectId): number {
    return this.projectConnections.get(projectId)?.size || 0;
  }

  getUserConnections(userId: UserId): number {
    let count = 0;
    for (const connection of this.connections.values()) {
      if (connection.userId === userId) {
        count++;
      }
    }
    return count;
  }
}
