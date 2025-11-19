import { YjsAdapter, type YjsAdapterOptions } from './yjs-adapter';
import { createLogger } from '@brepflow/engine-core';

const logger = createLogger('Collaboration');
import { OfflineQueue, type QueuedOperation } from './offline-queue';
import { OptimisticStateManager } from './optimistic-state';
import type {
  Operation,
  Graph,
  User,
  Presence,
  Document,
  CollaborationOptions,
  CollaborationEventHandler,
  Cursor,
  Selection,
  Viewport,
} from '../types';

/**
 * CollaborationClientYjs - Enhanced collaboration client with CRDT support
 *
 * This client provides:
 * - CRDT-based automatic conflict resolution (via Yjs)
 * - Offline support with operation queueing and replay
 * - Optimistic UI updates with automatic rollback
 * - Collaborative undo/redo
 * - Presence awareness (cursors, selections, viewports)
 *
 * This is a drop-in replacement for the original CollaborationClient,
 * providing the same API with enhanced reliability and features.
 */
export class CollaborationClientYjs {
  private yjsAdapter: YjsAdapter;
  private offlineQueue: OfflineQueue;
  private optimisticState: OptimisticStateManager;
  private eventHandlers: CollaborationEventHandler = {};
  private user: User;
  private documentId: string;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private connected: boolean = false;

  constructor(options: CollaborationOptions) {
    this.user = options.user;
    this.documentId = options.documentId;

    // Initialize offline queue
    this.offlineQueue = new OfflineQueue({
      storageKey: `brepflow-offline-${options.documentId}`,
      persistToStorage: true,
    });

    // Initialize Yjs adapter
    const adapterOptions: YjsAdapterOptions = {
      documentId: options.documentId,
      serverUrl: options.serverUrl,
      autoConnect: options.autoConnect !== false,
    };

    this.yjsAdapter = new YjsAdapter(adapterOptions);

    // Initialize optimistic state manager
    const initialGraph = this.yjsAdapter.getGraph();
    this.optimisticState = new OptimisticStateManager(initialGraph);

    // Setup Yjs event handlers
    this.setupYjsHandlers();

    // Setup reconnection logic
    this.setupReconnection(options);

    // Replay queued operations if connected
    if (this.yjsAdapter.isConnected()) {
      this.replayQueuedOperations();
    }
  }

  /**
   * Setup Yjs adapter event handlers
   */
  private setupYjsHandlers(): void {
    // Handle remote changes
    this.yjsAdapter.onRemoteChange((graph) => {
      // Update optimistic state with remote graph
      // This will detect conflicts with pending operations
      const document: Document = {
        id: this.documentId,
        graph,
        version: 1,
        operations: [],
        sessions: [],
      };
      this.eventHandlers.onDocumentSync?.(document);
    });

    // Handle presence changes
    this.yjsAdapter.onPresenceChange((added, updated, removed) => {
      const presenceMap = this.yjsAdapter.getPresence();
      const presenceList: Presence[] = [];

      presenceMap.forEach((state, clientId) => {
        if (state && typeof state === 'object') {
          presenceList.push(state as Presence);
        }
      });

      // Notify about joins
      if (added.length > 0) {
        presenceList
          .filter((p) => added.includes((p.user as unknown).clientId))
          .forEach((p) => {
            this.eventHandlers.onPresenceJoin?.(p);
          });
      }

      // Notify about updates
      if (updated.length > 0) {
        const updatedPresence = presenceList.filter((p) =>
          updated.includes((p.user as unknown).clientId)
        );
        this.eventHandlers.onPresenceUpdate?.(updatedPresence);
      }

      // Notify about leaves
      if (removed.length > 0) {
        removed.forEach((clientId) => {
          this.eventHandlers.onPresenceLeave?.(String(clientId));
        });
      }
    });
  }

  /**
   * Setup reconnection logic
   */
  private setupReconnection(options: CollaborationOptions): void {
    const checkConnection = () => {
      const wasConnected = this.connected;
      this.connected = this.yjsAdapter.isConnected();

      // Connection state changed
      if (wasConnected !== this.connected) {
        if (this.connected) {
          this.eventHandlers.onConnect?.();

          // Replay queued operations
          this.replayQueuedOperations();
        } else {
          this.eventHandlers.onDisconnect?.();
        }
      }
    };

    // Check connection every second
    this.reconnectTimer = setInterval(checkConnection, 1000);

    // Initial check
    checkConnection();
  }

  /**
   * Replay queued operations from offline queue
   */
  private async replayQueuedOperations(): Promise<void> {
    if (!this.yjsAdapter.isConnected()) {
      return;
    }

    while (!this.offlineQueue.isEmpty()) {
      const queuedOp = this.offlineQueue.dequeue();
      if (!queuedOp) break;

      try {
        // Submit operation via Yjs (CRDT handles conflicts automatically)
        this.yjsAdapter.submitOperation(queuedOp.operation);

        // Confirm in optimistic state
        this.optimisticState.confirmOperation(queuedOp.operation.id);
      } catch (error) {
        logger.error('Failed to replay operation:', error);

        // Re-queue if retry count is low
        if (queuedOp.retryCount < 3) {
          this.offlineQueue.enqueue(queuedOp.operation);
          this.offlineQueue.incrementRetry(queuedOp.operation);
        } else {
          // Give up after 3 retries
          logger.error(`Giving up on operation ${queuedOp.operation.id} after 3 retries`);
          this.optimisticState.rejectOperation(queuedOp.operation.id);
        }
      }
    }
  }

  /**
   * Connect to collaboration server
   */
  connect(): void {
    this.yjsAdapter.connect();
  }

  /**
   * Disconnect from collaboration server
   */
  disconnect(): void {
    this.yjsAdapter.disconnect();
  }

  /**
   * Set event handlers
   */
  setEventHandlers(handlers: CollaborationEventHandler): void {
    this.eventHandlers = handlers;
  }

  /**
   * Submit an operation
   * Applies optimistically and queues if offline
   */
  submitOperation(operation: Operation): void {
    // Apply optimistically
    const optimisticGraph = this.optimisticState.applyOptimistic(operation);

    // Emit optimistic update to UI
    const document: Document = {
      id: this.documentId,
      graph: optimisticGraph,
      version: 1,
      operations: [],
      sessions: [],
    };
    this.eventHandlers.onDocumentSync?.(document);

    if (this.yjsAdapter.isConnected()) {
      // Submit to server
      this.yjsAdapter.submitOperation(operation);

      // Confirm after successful submission
      // (In production, would wait for server ACK)
      setTimeout(() => {
        this.optimisticState.confirmOperation(operation.id);
      }, 100);
    } else {
      // Queue for later
      this.offlineQueue.enqueue(operation);
    }
  }

  /**
   * Undo last operation
   */
  undo(): boolean {
    const success = this.yjsAdapter.undo();

    if (success) {
      const graph = this.yjsAdapter.getGraph();
      const document: Document = {
        id: this.documentId,
        graph,
        version: 1,
        operations: [],
        sessions: [],
      };
      this.eventHandlers.onDocumentSync?.(document);
    }

    return success;
  }

  /**
   * Redo last undone operation
   */
  redo(): boolean {
    const success = this.yjsAdapter.redo();

    if (success) {
      const graph = this.yjsAdapter.getGraph();
      const document: Document = {
        id: this.documentId,
        graph,
        version: 1,
        operations: [],
        sessions: [],
      };
      this.eventHandlers.onDocumentSync?.(document);
    }

    return success;
  }

  /**
   * Check if undo is available
   */
  canUndo(): boolean {
    return this.yjsAdapter.canUndo();
  }

  /**
   * Check if redo is available
   */
  canRedo(): boolean {
    return this.yjsAdapter.canRedo();
  }

  /**
   * Update cursor position
   */
  updateCursor(cursor: Cursor): void {
    const presence = {
      user: this.user,
      cursor,
    };
    this.yjsAdapter.updatePresence(presence);
  }

  /**
   * Update selection
   */
  updateSelection(selection: Selection): void {
    const presence = {
      user: this.user,
      selection,
    };
    this.yjsAdapter.updatePresence(presence);
  }

  /**
   * Update viewport
   */
  updateViewport(viewport: Viewport): void {
    const presence = {
      user: this.user,
      viewport,
    };
    this.yjsAdapter.updatePresence(presence);
  }

  /**
   * Set editing state
   */
  setEditing(nodeId: string | null): void {
    const presence = {
      user: this.user,
      isEditing: nodeId,
    };
    this.yjsAdapter.updatePresence(presence);
  }

  /**
   * Request document sync
   */
  requestSync(): void {
    const graph = this.yjsAdapter.getGraph();
    const document: Document = {
      id: this.documentId,
      graph,
      version: 1,
      operations: [],
      sessions: [],
    };
    this.eventHandlers.onDocumentSync?.(document);
  }

  /**
   * Get current document
   */
  getDocument(): Graph {
    if (this.optimisticState.hasPendingOperations()) {
      // Return optimistic state if there are pending operations
      return this.optimisticState.getOptimisticGraph();
    }
    return this.yjsAdapter.getGraph();
  }

  /**
   * Get presence list
   */
  getPresence(): Presence[] {
    const presenceMap = this.yjsAdapter.getPresence();
    const presenceList: Presence[] = [];

    presenceMap.forEach((state) => {
      if (state && typeof state === 'object') {
        presenceList.push(state as Presence);
      }
    });

    return presenceList;
  }

  /**
   * Get user presence
   */
  getUserPresence(userId: string): Presence | undefined {
    return this.getPresence().find((p) => p.user.id === userId);
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.connected;
  }

  /**
   * Get collaboration statistics
   */
  getStats() {
    return {
      connected: this.connected,
      queueStats: this.offlineQueue.getStats(),
      optimisticStats: this.optimisticState.getStats(),
      documentSize: this.yjsAdapter.getDocumentSize(),
    };
  }

  /**
   * Cleanup and destroy
   */
  destroy(): void {
    if (this.reconnectTimer) {
      clearInterval(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    this.offlineQueue.clear();
    this.optimisticState.reset();
    this.yjsAdapter.destroy();
  }
}
