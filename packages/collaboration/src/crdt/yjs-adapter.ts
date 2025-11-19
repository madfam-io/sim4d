import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { SharedGraph } from './shared-graph';
import type { Operation, Graph, CollaborationOptions } from '../types';

/**
 * YjsAdapter - Bridge between BrepFlow operations and Yjs CRDT
 *
 * This adapter provides a clean interface between BrepFlow's operation-based
 * collaboration model and Yjs's CRDT-based synchronization. It handles:
 * - Operation submission and automatic sync
 * - Network connection management
 * - Binary encoding for efficient transmission
 * - Awareness protocol for presence data
 */
export class YjsAdapter {
  private sharedGraph: SharedGraph;
  private wsProvider: WebsocketProvider | null = null;
  private awareness: any; // y-websocket awareness API
  private connected: boolean = false;
  private readonly documentId: string;
  private readonly serverUrl: string;

  constructor(options: YjsAdapterOptions) {
    this.documentId = options.documentId;
    this.serverUrl = options.serverUrl;

    // Create shared graph
    this.sharedGraph = new SharedGraph();

    // Initialize from existing graph if provided
    if (options.initialGraph) {
      this.sharedGraph.fromGraph(options.initialGraph);
    }

    // Setup WebSocket provider if server URL provided
    if (options.serverUrl && options.autoConnect !== false) {
      this.connect();
    }
  }

  /**
   * Connect to collaboration server
   */
  connect(): void {
    if (this.wsProvider) {
      console.warn('Already connected to collaboration server');
      return;
    }

    const ydoc = this.sharedGraph.getYDoc();

    // Create WebSocket provider
    this.wsProvider = new WebsocketProvider(this.serverUrl, this.documentId, ydoc, {
      connect: true,
      // SECURITY: Pass CSRF token in connection params
      params: {
        // Token should be fetched from server before connecting
        // See: GET /api/collaboration/csrf-token
      },
    });

    this.awareness = this.wsProvider.awareness;

    // Setup connection event handlers
    this.wsProvider.on('status', (event: { status: string }) => {
      this.connected = event.status === 'connected';
    });

    this.wsProvider.on('sync', (synced: boolean) => {
      // Sync state tracked internally
    });
  }

  /**
   * Disconnect from collaboration server
   */
  disconnect(): void {
    if (this.wsProvider) {
      this.wsProvider.disconnect();
      this.wsProvider.destroy();
      this.wsProvider = null;
      this.connected = false;
    }
  }

  /**
   * Submit an operation to the shared graph
   * Automatically syncs to all connected clients via CRDT
   */
  submitOperation(operation: Operation): void {
    this.sharedGraph.applyOperation(operation);
    // Yjs handles the sync automatically - no need to emit events
  }

  /**
   * Get the current graph state
   */
  getGraph(): Graph {
    return this.sharedGraph.toGraph();
  }

  /**
   * Subscribe to remote changes
   * Fires when other clients make changes
   */
  onRemoteChange(callback: (graph: Graph) => void): void {
    const ydoc = this.sharedGraph.getYDoc();

    ydoc.on('update', (update: Uint8Array, origin: any) => {
      // Only fire for remote changes (not local)
      if (origin !== ydoc.clientID) {
        const graph = this.sharedGraph.toGraph();
        callback(graph);
      }
    });
  }

  /**
   * Undo last operation
   */
  undo(): boolean {
    return this.sharedGraph.undo();
  }

  /**
   * Redo last undone operation
   */
  redo(): boolean {
    return this.sharedGraph.redo();
  }

  /**
   * Check if undo is available
   */
  canUndo(): boolean {
    return this.sharedGraph.canUndo();
  }

  /**
   * Check if redo is available
   */
  canRedo(): boolean {
    return this.sharedGraph.canRedo();
  }

  /**
   * Get connection status
   */
  isConnected(): boolean {
    return this.connected;
  }

  /**
   * Update local user's presence (cursor, selection, viewport)
   */
  updatePresence(presenceData: Record<string, unknown>): void {
    if (this.awareness) {
      this.awareness.setLocalState(presenceData);
    }
  }

  /**
   * Get all users' presence data
   */
  getPresence(): Map<number, Record<string, unknown>> {
    if (!this.awareness) {
      return new Map();
    }
    return this.awareness.getStates();
  }

  /**
   * Subscribe to presence changes
   */
  onPresenceChange(
    callback: (added: number[], updated: number[], removed: number[]) => void
  ): void {
    if (this.awareness) {
      this.awareness.on('change', (event: unknown) => {
        callback(event.added, event.updated, event.removed);
      });
    }
  }

  /**
   * Get document size in bytes (for monitoring)
   */
  getDocumentSize(): number {
    return this.sharedGraph.getDocumentSize();
  }

  /**
   * Export document state as binary snapshot
   * Used for persistence and backup
   */
  exportSnapshot(): Uint8Array {
    return this.sharedGraph.getSnapshot();
  }

  /**
   * Import document state from binary snapshot
   * Merges with current state using CRDT semantics
   */
  importSnapshot(snapshot: Uint8Array): void {
    this.sharedGraph.applySnapshot(snapshot);
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.disconnect();
    this.sharedGraph.destroy();
  }
}

export interface YjsAdapterOptions {
  documentId: string;
  serverUrl: string;
  initialGraph?: Graph;
  autoConnect?: boolean;
}
