import { io, Socket } from 'socket.io-client';
import { createLogger } from '@sim4d/engine-core';

const logger = createLogger('Collaboration');
import type {
  ServerToClientEvents,
  ClientToServerEvents,
  CollaborationOptions,
  Document,
  Operation,
  Presence,
  User,
  Cursor,
  Selection,
  Viewport,
  Conflict,
  CollaborationEventHandler,
} from '../types';

export class CollaborationClient {
  private socket: Socket<ServerToClientEvents, ClientToServerEvents>;
  private options: CollaborationOptions;
  private connected: boolean = false;
  private document: Document | null = null;
  private presence: Map<string, Presence> = new Map();
  private eventHandlers: CollaborationEventHandler = {};
  private operationQueue: Operation[] = [];
  private presenceThrottle: Map<string, unknown> = new Map();

  constructor(options: CollaborationOptions) {
    this.options = options;

    // Create socket connection
    this.socket = io(options.serverUrl, {
      autoConnect: options.autoConnect !== false,
      reconnection: true,
      reconnectionAttempts: options.reconnectAttempts ?? 5,
      reconnectionDelay: options.reconnectDelay ?? 1000,
    });

    this.setupSocketHandlers();

    if (options.autoConnect !== false) {
      this.connect();
    }
  }

  private setupSocketHandlers(): void {
    this.socket.on('connect', () => {
      this.connected = true;

      // Join document room
      this.socket.emit('document:join', this.options.documentId, this.options.user);

      // Flush queued operations
      this.flushOperationQueue();

      this.eventHandlers.onConnect?.();
    });

    this.socket.on('disconnect', () => {
      this.connected = false;
      this.eventHandlers.onDisconnect?.();
    });

    this.socket.on('operation:broadcast', (operation) => {
      // Apply operation to local document
      if (this.document) {
        this.applyOperationToDocument(operation);
      }
      this.eventHandlers.onOperation?.(operation);
    });

    this.socket.on('presence:update', (presenceList) => {
      // Update presence map
      presenceList.forEach((p) => {
        this.presence.set(p.user.id, p);
      });
      this.eventHandlers.onPresenceUpdate?.(presenceList);
    });

    this.socket.on('presence:join', (presence) => {
      this.presence.set(presence.user.id, presence);
      this.eventHandlers.onPresenceJoin?.(presence);
    });

    this.socket.on('presence:leave', (userId) => {
      this.presence.delete(userId);
      this.eventHandlers.onPresenceLeave?.(userId);
    });

    this.socket.on('document:sync', (document) => {
      this.document = document;
      this.eventHandlers.onDocumentSync?.(document);
    });

    this.socket.on('conflict:detected', (conflict) => {
      logger.warn('Conflict detected:', conflict);
      this.eventHandlers.onConflict?.(conflict);
    });

    this.socket.on('error', (error) => {
      logger.error('Collaboration error:', error);
      this.eventHandlers.onError?.(error);
    });
  }

  private applyOperationToDocument(operation: Operation): void {
    if (!this.document) return;

    switch (operation.type) {
      case 'ADD_NODE':
        this.document.graph.nodes.push(operation.node);
        break;
      case 'DELETE_NODE':
        this.document.graph.nodes = this.document.graph.nodes.filter(
          (n) => n.id !== operation.nodeId
        );
        this.document.graph.edges = this.document.graph.edges.filter(
          (e) => e.source !== operation.nodeId && e.target !== operation.nodeId
        );
        break;
      case 'UPDATE_NODE':
        const nodeIndex = this.document.graph.nodes.findIndex((n) => n.id === operation.nodeId);
        if (nodeIndex >= 0) {
          this.document.graph.nodes[nodeIndex] = {
            ...this.document.graph.nodes[nodeIndex],
            ...operation.updates,
          };
        }
        break;
      case 'ADD_EDGE':
        this.document.graph.edges.push(operation.edge);
        break;
      case 'DELETE_EDGE':
        this.document.graph.edges = this.document.graph.edges.filter(
          (e) => e.id !== operation.edgeId
        );
        break;
      case 'UPDATE_GRAPH_METADATA':
        this.document.graph.metadata = {
          ...this.document.graph.metadata,
          ...operation.metadata,
        };
        break;
    }

    this.document.operations.push(operation);
    this.document.version++;
  }

  connect(): void {
    if (!this.connected) {
      this.socket.connect();
    }
  }

  disconnect(): void {
    if (this.connected) {
      this.socket.emit('document:leave');
      this.socket.disconnect();
    }
  }

  setEventHandlers(handlers: CollaborationEventHandler): void {
    this.eventHandlers = handlers;
  }

  submitOperation(operation: Operation): void {
    if (this.connected) {
      this.socket.emit('operation:submit', operation);
    } else {
      // Queue operation for later
      this.operationQueue.push(operation);
    }
  }

  updateCursor(cursor: Cursor): void {
    this.throttledPresenceUpdate('cursor', cursor, () => {
      this.socket.emit('presence:cursor', cursor);
    });
  }

  updateSelection(selection: Selection): void {
    this.throttledPresenceUpdate('selection', selection, () => {
      this.socket.emit('presence:selection', selection);
    });
  }

  updateViewport(viewport: Viewport): void {
    this.throttledPresenceUpdate('viewport', viewport, () => {
      this.socket.emit('presence:viewport', viewport);
    });
  }

  setEditing(nodeId: string | null): void {
    this.socket.emit('presence:editing', nodeId);
  }

  requestSync(): void {
    this.socket.emit('document:request-sync');
  }

  private throttledPresenceUpdate(type: string, data: unknown, callback: () => void): void {
    // Clear existing timeout
    if (this.presenceThrottle.has(type)) {
      clearTimeout(this.presenceThrottle.get(type));
    }

    // Set new timeout
    const timeout = setTimeout(callback, this.options.presenceThrottle ?? 50);
    this.presenceThrottle.set(type, timeout);
  }

  private flushOperationQueue(): void {
    while (this.operationQueue.length > 0) {
      const operation = this.operationQueue.shift()!;
      this.socket.emit('operation:submit', operation);
    }
  }

  getDocument(): Document | null {
    return this.document;
  }

  getPresence(): Presence[] {
    return Array.from(this.presence.values());
  }

  getUserPresence(userId: string): Presence | undefined {
    return this.presence.get(userId);
  }

  isConnected(): boolean {
    return this.connected;
  }

  destroy(): void {
    this.disconnect();
    this.presenceThrottle.forEach((timeout) => clearTimeout(timeout));
    this.presenceThrottle.clear();
    this.operationQueue = [];
    this.presence.clear();
    this.document = null;
  }
}
