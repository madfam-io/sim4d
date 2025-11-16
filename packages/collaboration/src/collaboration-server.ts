/**
 * Real-Time Collaboration Server
 * WebSocket server for multi-user CAD collaboration
 */

import { WebSocketServer, WebSocket } from 'ws';
import { createServer } from 'http';
import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  color: string; // Cursor/selection color
  role: 'owner' | 'editor' | 'viewer';
  lastActivity: Date;
}

export interface Session {
  id: string;
  projectId: string;
  users: Map<string, User>;
  graph: CollaborativeGraph;
  cursors: Map<string, CursorState>;
  selections: Map<string, SelectionState>;
  locks: Map<string, LockState>;
  history: OperationHistory;
  createdAt: Date;
}

export interface CursorState {
  userId: string;
  position: { x: number; y: number };
  viewport?: { x: number; y: number; z: number };
  timestamp: number;
}

export interface SelectionState {
  userId: string;
  nodeIds: string[];
  edgeIds: string[];
  timestamp: number;
}

export interface LockState {
  nodeId: string;
  userId: string;
  timestamp: number;
  expiresAt: number;
}

export interface Operation {
  id: string;
  type: 'create' | 'update' | 'delete' | 'move' | 'connect' | 'disconnect';
  userId: string;
  timestamp: number;
  data: any;
  reversible: boolean;
  inverse?: Operation;
}

export interface CollaborativeGraph {
  nodes: Map<string, any>;
  edges: Map<string, any>;
  version: number;
  checksum: string;
}

export class CollaborationServer extends EventEmitter {
  private wss: WebSocketServer;
  private sessions = new Map<string, Session>();
  private clients = new Map<string, ClientConnection>();
  private operationQueue = new Map<string, Operation[]>();

  // Configuration
  private readonly PORT = process.env.COLLAB_PORT || 8080;
  private readonly HEARTBEAT_INTERVAL = 30000; // 30 seconds
  private readonly LOCK_TIMEOUT = 60000; // 1 minute
  private readonly MAX_HISTORY_SIZE = 1000;

  constructor() {
    super();

    const server = createServer();
    this.wss = new WebSocketServer({ server });

    this.setupWebSocketHandlers();
    this.startHeartbeat();

    server.listen(this.PORT, () => {
      console.log(`Collaboration server listening on port ${this.PORT}`);
    });
  }

  private setupWebSocketHandlers(): void {
    this.wss.on('connection', (ws: WebSocket, request) => {
      const clientId = uuidv4();
      const client = new ClientConnection(clientId, ws);

      this.clients.set(clientId, client);

      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString());
          this.handleMessage(client, message);
        } catch (error) {
          console.error('Failed to parse message:', error);
          this.sendError(client, 'Invalid message format');
        }
      });

      ws.on('close', () => {
        this.handleDisconnect(client);
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        this.handleDisconnect(client);
      });

      // Send initial handshake
      this.send(client, {
        type: 'connected',
        clientId: clientId,
        timestamp: Date.now(),
      });
    });
  }

  private handleMessage(client: ClientConnection, message: any): void {
    const { type, ...data } = message;

    switch (type) {
      case 'join':
        this.handleJoin(client, data);
        break;

      case 'leave':
        this.handleLeave(client, data);
        break;

      case 'operation':
        this.handleOperation(client, data);
        break;

      case 'cursor':
        this.handleCursor(client, data);
        break;

      case 'selection':
        this.handleSelection(client, data);
        break;

      case 'lock':
        this.handleLock(client, data);
        break;

      case 'unlock':
        this.handleUnlock(client, data);
        break;

      case 'sync':
        this.handleSync(client, data);
        break;

      case 'chat':
        this.handleChat(client, data);
        break;

      case 'ping':
        this.send(client, { type: 'pong', timestamp: Date.now() });
        break;

      default:
        this.sendError(client, `Unknown message type: ${type}`);
    }
  }

  private handleJoin(client: ClientConnection, data: any): void {
    const { sessionId, user, projectId } = data;

    let session = this.sessions.get(sessionId);

    if (!session) {
      // Create new session
      session = {
        id: sessionId,
        projectId,
        users: new Map(),
        graph: {
          nodes: new Map(),
          edges: new Map(),
          version: 0,
          checksum: '',
        },
        cursors: new Map(),
        selections: new Map(),
        locks: new Map(),
        history: new OperationHistory(),
        createdAt: new Date(),
      };
      this.sessions.set(sessionId, session);
      this.operationQueue.set(sessionId, []);
    } else if (!this.operationQueue.has(sessionId)) {
      this.operationQueue.set(sessionId, []);
    }

    // Add user to session
    const userData: User = {
      ...user,
      lastActivity: new Date(),
    };
    session.users.set(client.id, userData);
    client.sessionId = sessionId;
    client.userId = user.id;

    // Send session state to joining user
    this.send(client, {
      type: 'joined',
      session: this.serializeSession(session),
      timestamp: Date.now(),
    });

    // Notify other users
    this.broadcast(
      session,
      {
        type: 'user-joined',
        user: userData,
        timestamp: Date.now(),
      },
      client.id
    );
  }

  private handleLeave(client: ClientConnection, data: any): void {
    const session = this.getClientSession(client);
    if (!session) return;

    // Remove user from session
    session.users.delete(client.id);
    session.cursors.delete(client.userId!);
    session.selections.delete(client.userId!);

    // Release locks
    for (const [nodeId, lock] of session.locks) {
      if (lock.userId === client.userId) {
        session.locks.delete(nodeId);
      }
    }

    // Notify other users
    this.broadcast(
      session,
      {
        type: 'user-left',
        userId: client.userId,
        timestamp: Date.now(),
      },
      client.id
    );

    // Clean up empty sessions
    if (session.users.size === 0) {
      this.sessions.delete(session.id);
      this.operationQueue.delete(session.id);
    }
  }

  private handleOperation(client: ClientConnection, data: any): void {
    const session = this.getClientSession(client);
    if (!session) return;

    const operation: Operation = {
      id: uuidv4(),
      type: data.type,
      userId: client.userId!,
      timestamp: Date.now(),
      data: data.data,
      reversible: data.reversible ?? true,
    };

    // Check for conflicts
    const conflicts = this.detectConflicts(session, operation);
    if (conflicts.length > 0) {
      // Operational Transform (OT) resolution
      const transformed = this.transformOperation(operation, conflicts);
      if (!transformed) {
        this.sendError(client, 'Operation conflict could not be resolved');
        return;
      }
      operation.data = transformed.data;
    }

    // Apply operation
    this.applyOperation(session, operation);

    // Track recent operations for conflict detection
    const recentOps = this.operationQueue.get(session.id) ?? [];
    recentOps.push(operation);
    if (recentOps.length > this.MAX_HISTORY_SIZE) {
      recentOps.splice(0, recentOps.length - this.MAX_HISTORY_SIZE);
    }
    this.operationQueue.set(session.id, recentOps);

    // Add to history
    if (operation.reversible) {
      session.history.add(operation);
    }

    // Increment version
    session.graph.version++;
    session.graph.checksum = this.calculateChecksum(session.graph);

    // Broadcast to all clients
    this.broadcast(session, {
      type: 'operation',
      operation,
      version: session.graph.version,
      checksum: session.graph.checksum,
      timestamp: Date.now(),
    });
  }

  private handleCursor(client: ClientConnection, data: any): void {
    const session = this.getClientSession(client);
    if (!session) return;

    const cursor: CursorState = {
      userId: client.userId!,
      position: data.position,
      viewport: data.viewport,
      timestamp: Date.now(),
    };

    session.cursors.set(client.userId!, cursor);

    // Broadcast to other users (throttled)
    this.broadcastThrottled(
      session,
      {
        type: 'cursor',
        cursor,
        timestamp: Date.now(),
      },
      client.id,
      50
    ); // 50ms throttle
  }

  private handleSelection(client: ClientConnection, data: any): void {
    const session = this.getClientSession(client);
    if (!session) return;

    const selection: SelectionState = {
      userId: client.userId!,
      nodeIds: data.nodeIds ?? [],
      edgeIds: data.edgeIds ?? [],
      timestamp: Date.now(),
    };

    session.selections.set(client.userId!, selection);

    // Broadcast to other users
    this.broadcast(
      session,
      {
        type: 'selection',
        selection,
        timestamp: Date.now(),
      },
      client.id
    );
  }

  private handleLock(client: ClientConnection, data: any): void {
    const session = this.getClientSession(client);
    if (!session) return;

    const { nodeId } = data;

    // Check if already locked
    const existingLock = session.locks.get(nodeId);
    if (existingLock && existingLock.userId !== client.userId) {
      this.send(client, {
        type: 'lock-denied',
        nodeId,
        lockedBy: existingLock.userId,
        timestamp: Date.now(),
      });
      return;
    }

    // Create lock
    const lock: LockState = {
      nodeId,
      userId: client.userId!,
      timestamp: Date.now(),
      expiresAt: Date.now() + this.LOCK_TIMEOUT,
    };

    session.locks.set(nodeId, lock);

    // Confirm lock to requester
    this.send(client, {
      type: 'lock-granted',
      nodeId,
      timestamp: Date.now(),
    });

    // Broadcast to other users
    this.broadcast(
      session,
      {
        type: 'node-locked',
        nodeId,
        userId: client.userId,
        timestamp: Date.now(),
      },
      client.id
    );
  }

  private handleUnlock(client: ClientConnection, data: any): void {
    const session = this.getClientSession(client);
    if (!session) return;

    const { nodeId } = data;
    const lock = session.locks.get(nodeId);

    if (!lock || lock.userId !== client.userId) {
      return;
    }

    session.locks.delete(nodeId);

    // Broadcast to all users
    this.broadcast(session, {
      type: 'node-unlocked',
      nodeId,
      timestamp: Date.now(),
    });
  }

  private handleSync(client: ClientConnection, data: any): void {
    const session = this.getClientSession(client);
    if (!session) return;

    const { version, checksum } = data;

    if (version === session.graph.version && checksum === session.graph.checksum) {
      // Client is in sync
      this.send(client, {
        type: 'sync-ok',
        version: session.graph.version,
        timestamp: Date.now(),
      });
    } else {
      // Client needs update
      this.send(client, {
        type: 'sync-required',
        graph: this.serializeGraph(session.graph),
        version: session.graph.version,
        checksum: session.graph.checksum,
        timestamp: Date.now(),
      });
    }
  }

  private handleChat(client: ClientConnection, data: any): void {
    const session = this.getClientSession(client);
    if (!session) return;

    const message = {
      id: uuidv4(),
      userId: client.userId,
      text: data.text,
      timestamp: Date.now(),
    };

    // Broadcast to all users
    this.broadcast(session, {
      type: 'chat',
      message,
      timestamp: Date.now(),
    });
  }

  private handleDisconnect(client: ClientConnection): void {
    if (client.sessionId) {
      this.handleLeave(client, {});
    }
    this.clients.delete(client.id);
  }

  // Conflict detection and resolution

  private detectConflicts(session: Session, operation: Operation): Operation[] {
    const conflicts: Operation[] = [];
    const recentOps = this.operationQueue.get(session.id) ?? [];

    for (const op of recentOps) {
      if (this.operationsConflict(operation, op)) {
        conflicts.push(op);
      }
    }

    return conflicts;
  }

  private operationsConflict(op1: Operation, op2: Operation): boolean {
    // Check if operations affect the same entities
    if (op1.type === 'update' && op2.type === 'update') {
      return op1.data.nodeId === op2.data.nodeId;
    }

    if (op1.type === 'delete' && op2.type === 'update') {
      return op1.data.nodeId === op2.data.nodeId;
    }

    if (op1.type === 'connect' && op2.type === 'delete') {
      return op1.data.sourceId === op2.data.nodeId || op1.data.targetId === op2.data.nodeId;
    }

    return false;
  }

  private transformOperation(operation: Operation, conflicts: Operation[]): Operation | null {
    // Simplified OT - in production would use full OT algorithm
    let transformed = { ...operation };

    for (const conflict of conflicts) {
      if (conflict.type === 'delete') {
        // Can't modify deleted node
        return null;
      }

      if (conflict.type === 'move' && operation.type === 'move') {
        // Compose moves
        transformed.data.position = {
          x: operation.data.position.x + conflict.data.delta.x,
          y: operation.data.position.y + conflict.data.delta.y,
        };
      }
    }

    return transformed;
  }

  private applyOperation(session: Session, operation: Operation): void {
    switch (operation.type) {
      case 'create':
        session.graph.nodes.set(operation.data.nodeId, operation.data.node);
        break;

      case 'update':
        const node = session.graph.nodes.get(operation.data.nodeId);
        if (node) {
          Object.assign(node, operation.data.updates);
        }
        break;

      case 'delete':
        session.graph.nodes.delete(operation.data.nodeId);
        // Remove connected edges
        for (const [edgeId, edge] of session.graph.edges) {
          if (edge.source === operation.data.nodeId || edge.target === operation.data.nodeId) {
            session.graph.edges.delete(edgeId);
          }
        }
        break;

      case 'connect':
        session.graph.edges.set(operation.data.edgeId, {
          id: operation.data.edgeId,
          source: operation.data.sourceId,
          target: operation.data.targetId,
        });
        break;

      case 'disconnect':
        session.graph.edges.delete(operation.data.edgeId);
        break;
    }
  }

  // Utility methods

  private getClientSession(client: ClientConnection): Session | undefined {
    return client.sessionId ? this.sessions.get(client.sessionId) : undefined;
  }

  private send(client: ClientConnection, message: any): void {
    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify(message));
    }
  }

  private sendError(client: ClientConnection, error: string): void {
    this.send(client, {
      type: 'error',
      error,
      timestamp: Date.now(),
    });
  }

  private broadcast(session: Session, message: any, excludeClientId?: string): void {
    for (const [clientId, user] of session.users) {
      if (clientId !== excludeClientId) {
        const client = this.clients.get(clientId);
        if (client) {
          this.send(client, message);
        }
      }
    }
  }

  private throttledBroadcasts = new Map<string, NodeJS.Timeout>();

  private broadcastThrottled(
    session: Session,
    message: any,
    excludeClientId: string,
    delay: number
  ): void {
    const key = `${session.id}-${message.type}`;

    // Clear existing timeout
    const existing = this.throttledBroadcasts.get(key);
    if (existing) {
      clearTimeout(existing);
    }

    // Set new timeout
    const timeout = setTimeout(() => {
      this.broadcast(session, message, excludeClientId);
      this.throttledBroadcasts.delete(key);
    }, delay);

    this.throttledBroadcasts.set(key, timeout);
  }

  private startHeartbeat(): void {
    setInterval(() => {
      for (const [clientId, client] of this.clients) {
        this.send(client, {
          type: 'heartbeat',
          timestamp: Date.now(),
        });
      }

      // Clean up expired locks
      for (const session of this.sessions.values()) {
        const now = Date.now();
        for (const [nodeId, lock] of session.locks) {
          if (lock.expiresAt < now) {
            session.locks.delete(nodeId);
            this.broadcast(session, {
              type: 'node-unlocked',
              nodeId,
              timestamp: now,
            });
          }
        }
      }
    }, this.HEARTBEAT_INTERVAL);
  }

  private calculateChecksum(graph: CollaborativeGraph): string {
    // Simple checksum - in production would use proper hashing
    const content = JSON.stringify({
      nodes: Array.from(graph.nodes.entries()).sort(),
      edges: Array.from(graph.edges.entries()).sort(),
    });

    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }

    return hash.toString(36);
  }

  private serializeSession(session: Session): any {
    return {
      id: session.id,
      projectId: session.projectId,
      users: Array.from(session.users.values()),
      graph: this.serializeGraph(session.graph),
      cursors: Array.from(session.cursors.values()),
      selections: Array.from(session.selections.values()),
      locks: Array.from(session.locks.values()),
    };
  }

  private serializeGraph(graph: CollaborativeGraph): any {
    return {
      nodes: Array.from(graph.nodes.values()),
      edges: Array.from(graph.edges.values()),
      version: graph.version,
      checksum: graph.checksum,
    };
  }
}

class ClientConnection {
  id: string;
  ws: WebSocket;
  sessionId?: string;
  userId?: string;
  lastActivity: Date;

  constructor(id: string, ws: WebSocket) {
    this.id = id;
    this.ws = ws;
    this.lastActivity = new Date();
  }
}

class OperationHistory {
  private operations: Operation[] = [];
  private maxSize = 1000;

  add(operation: Operation): void {
    this.operations.push(operation);
    if (this.operations.length > this.maxSize) {
      this.operations.shift();
    }
  }

  getLast(n: number): Operation[] {
    return this.operations.slice(-n);
  }

  undo(): Operation | undefined {
    return this.operations.pop();
  }
}
