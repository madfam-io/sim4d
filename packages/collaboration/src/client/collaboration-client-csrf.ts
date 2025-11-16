/**
 * CSRF-Enhanced Collaboration Client
 *
 * Extends CollaborationClient with CSRF token management for secure WebSocket connections
 */

import { io, Socket } from 'socket.io-client';
import type {
  ServerToClientEvents,
  ClientToServerEvents,
  CollaborationOptions,
  CollaborationEventHandler,
  Document,
  Operation,
  Presence,
  User,
  Cursor,
  Selection,
  Viewport,
  Conflict,
} from '../types';

// CSRF-specific event handler extending base handler
export interface CSRFCollaborationEventHandler extends CollaborationEventHandler {
  onCSRFError?: (error: Error) => void;
}

export interface CSRFCollaborationOptions extends CollaborationOptions {
  /** Base URL for HTTP API (for CSRF token fetching) */
  apiBaseUrl: string;
  /** Session ID for CSRF token generation */
  sessionId: string;
  /** Optional custom CSRF token refresh interval (default: 55 minutes) */
  csrfRefreshInterval?: number;
}

interface CSRFTokenResponse {
  success: boolean;
  token?: string;
  expiresIn?: number;
  sessionId?: string;
  error?: string;
}

export class CSRFCollaborationClient {
  private socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;
  private options: CSRFCollaborationOptions;
  private connected: boolean = false;
  private document: Document | null = null;
  private presence: Map<string, Presence> = new Map();
  private eventHandlers: CSRFCollaborationEventHandler = {};
  private operationQueue: Operation[] = [];
  private presenceThrottle: Map<string, any> = new Map();

  // CSRF-specific properties
  private csrfToken: string | null = null;
  private tokenExpiresAt: number = 0;
  private refreshTimer: NodeJS.Timeout | null = null;
  private currentUser: User;
  private retryAttempts: number = 0;
  private maxRetries: number = 3;

  constructor(options: CSRFCollaborationOptions) {
    this.options = options;
    this.currentUser = options.user;
  }

  /**
   * Fetch CSRF token from HTTP API
   */
  private async fetchCSRFToken(): Promise<string> {
    const url = `${this.options.apiBaseUrl}/api/collaboration/csrf-token?sessionId=${this.options.sessionId}`;

    try {
      const response = await fetch(url);
      const data: CSRFTokenResponse = await response.json();

      if (!data.success || !data.token) {
        throw new Error(data.error || 'Failed to fetch CSRF token');
      }

      // Track expiration (default: 1 hour)
      const expiresIn = (data.expiresIn || 3600) * 1000; // Convert to ms
      this.tokenExpiresAt = Date.now() + expiresIn;

      console.log('[CSRF] Token fetched successfully, expires in', data.expiresIn, 'seconds');

      return data.token;
    } catch (error) {
      console.error('[CSRF] Token fetch failed:', error);
      throw new Error(
        `CSRF token fetch failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Refresh CSRF token
   */
  private async refreshCSRFToken(): Promise<string> {
    const url = `${this.options.apiBaseUrl}/api/collaboration/csrf-token/refresh`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: this.options.sessionId }),
      });

      const data: CSRFTokenResponse = await response.json();

      if (!data.success || !data.token) {
        throw new Error(data.error || 'Failed to refresh CSRF token');
      }

      // Update expiration
      const expiresIn = (data.expiresIn || 3600) * 1000;
      this.tokenExpiresAt = Date.now() + expiresIn;

      console.log('[CSRF] Token refreshed successfully');

      return data.token;
    } catch (error) {
      console.error('[CSRF] Token refresh failed:', error);
      throw new Error(
        `CSRF token refresh failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Setup automatic token refresh timer
   * Refreshes 5 minutes before expiration (or custom interval)
   */
  private setupTokenRefreshTimer(): void {
    // Clear existing timer
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }

    // Calculate refresh time (5 minutes before expiration by default)
    const refreshInterval = this.options.csrfRefreshInterval || 55 * 60 * 1000; // 55 minutes in ms
    const timeUntilRefresh = this.tokenExpiresAt - Date.now() - 5 * 60 * 1000;

    // Don't set timer if token expires too soon
    if (timeUntilRefresh < 0) {
      console.warn('[CSRF] Token expires soon, refreshing immediately');
      this.handleTokenRefresh();
      return;
    }

    this.refreshTimer = setTimeout(
      () => {
        this.handleTokenRefresh();
      },
      Math.min(timeUntilRefresh, refreshInterval)
    );

    console.log(
      '[CSRF] Token refresh scheduled in',
      Math.round(timeUntilRefresh / 1000),
      'seconds'
    );
  }

  /**
   * Handle token refresh - reconnect with new token
   */
  private async handleTokenRefresh(): Promise<void> {
    try {
      console.log('[CSRF] Refreshing token and reconnecting...');

      // Fetch new token
      const newToken = await this.refreshCSRFToken();
      this.csrfToken = newToken;

      // Reconnect with new token
      if (this.connected) {
        this.disconnect();
        await this.connect();
      }

      // Setup next refresh
      this.setupTokenRefreshTimer();
    } catch (error) {
      console.error('[CSRF] Token refresh failed:', error);
      this.eventHandlers.onCSRFError?.(error instanceof Error ? error : new Error(String(error)));

      // Retry with exponential backoff
      if (this.retryAttempts < this.maxRetries) {
        this.retryAttempts++;
        const backoff = Math.pow(2, this.retryAttempts) * 1000;
        console.log(
          `[CSRF] Retrying token refresh in ${backoff}ms (attempt ${this.retryAttempts}/${this.maxRetries})`
        );
        setTimeout(() => this.handleTokenRefresh(), backoff);
      } else {
        console.error('[CSRF] Max retry attempts reached, giving up');
        this.eventHandlers.onError?.(new Error('CSRF token refresh failed after max retries'));
      }
    }
  }

  /**
   * Setup socket event handlers
   */
  private setupSocketHandlers(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      this.connected = true;
      this.retryAttempts = 0; // Reset retry counter on successful connection
      console.log('[Collaboration] Connected to server');

      // Join document room
      this.socket!.emit('document:join', this.options.documentId, this.currentUser);

      // Flush queued operations
      this.flushOperationQueue();

      this.eventHandlers.onConnect?.();
    });

    this.socket.on('disconnect', () => {
      this.connected = false;
      console.log('[Collaboration] Disconnected from server');
      this.eventHandlers.onDisconnect?.();
    });

    this.socket.on('connect_error', (error) => {
      console.error('[Collaboration] Connection error:', error);

      // Check if it's a CSRF validation error
      if (error.message.includes('CSRF') || error.message.includes('token')) {
        console.warn('[CSRF] Token validation failed, attempting refresh...');
        this.handleCSRFError(error);
      } else {
        this.eventHandlers.onError?.(error);
      }
    });

    // Document operation handlers
    this.socket.on('operation:broadcast', (operation) => {
      if (this.document) {
        this.applyOperationToDocument(operation);
      }
      this.eventHandlers.onOperation?.(operation);
    });

    // Presence handlers
    this.socket.on('presence:update', (presenceList) => {
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

    // Document sync handler
    this.socket.on('document:sync', (document) => {
      this.document = document;
      this.eventHandlers.onDocumentSync?.(document);
    });

    // Conflict handler
    this.socket.on('conflict:detected', (conflict) => {
      console.warn('[Collaboration] Conflict detected:', conflict);
      this.eventHandlers.onConflict?.(conflict);
    });

    // Generic error handler
    this.socket.on('error', (error) => {
      console.error('[Collaboration] Server error:', error);
      this.eventHandlers.onError?.(error);
    });
  }

  /**
   * Handle CSRF validation errors
   */
  private async handleCSRFError(error: Error): Promise<void> {
    this.eventHandlers.onCSRFError?.(error);

    try {
      // Attempt to refresh token and reconnect
      const newToken = await this.refreshCSRFToken();
      this.csrfToken = newToken;

      // Reconnect with new token
      this.disconnect();
      await this.connect();
    } catch (refreshError) {
      console.error('[CSRF] Failed to recover from CSRF error:', refreshError);
      this.eventHandlers.onError?.(new Error('CSRF authentication failed'));
    }
  }

  /**
   * Connect to collaboration server with CSRF authentication
   */
  async connect(): Promise<void> {
    try {
      // Fetch CSRF token if not already available
      if (!this.csrfToken) {
        this.csrfToken = await this.fetchCSRFToken();
      }

      // Create socket with CSRF token in auth
      this.socket = io(this.options.serverUrl, {
        auth: {
          csrfToken: this.csrfToken,
          sessionId: this.options.sessionId,
          userId: this.currentUser.id,
          userName: this.currentUser.name,
        },
        autoConnect: false,
        reconnection: true,
        reconnectionAttempts: this.options.reconnectAttempts ?? 5,
        reconnectionDelay: this.options.reconnectDelay ?? 1000,
      });

      // Setup event handlers
      this.setupSocketHandlers();

      // Connect
      this.socket.connect();

      // Setup token refresh timer
      this.setupTokenRefreshTimer();
    } catch (error) {
      console.error('[CSRF] Failed to connect:', error);
      this.eventHandlers.onError?.(error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  disconnect(): void {
    if (this.connected && this.socket) {
      this.socket.emit('document:leave');
      this.socket.disconnect();
    }

    // Clear refresh timer
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  setEventHandlers(handlers: CSRFCollaborationEventHandler): void {
    this.eventHandlers = handlers;
  }

  submitOperation(operation: Operation): void {
    if (this.connected && this.socket) {
      this.socket.emit('operation:submit', operation);
    } else {
      this.operationQueue.push(operation);
    }
  }

  updateCursor(cursor: Cursor): void {
    this.throttledPresenceUpdate('cursor', cursor, () => {
      this.socket?.emit('presence:cursor', cursor);
    });
  }

  updateSelection(selection: Selection): void {
    this.throttledPresenceUpdate('selection', selection, () => {
      this.socket?.emit('presence:selection', selection);
    });
  }

  updateViewport(viewport: Viewport): void {
    this.throttledPresenceUpdate('viewport', viewport, () => {
      this.socket?.emit('presence:viewport', viewport);
    });
  }

  setEditing(nodeId: string | null): void {
    this.socket?.emit('presence:editing', nodeId);
  }

  requestSync(): void {
    this.socket?.emit('document:request-sync');
  }

  private throttledPresenceUpdate(type: string, data: any, callback: () => void): void {
    if (this.presenceThrottle.has(type)) {
      clearTimeout(this.presenceThrottle.get(type));
    }

    const timeout = setTimeout(callback, this.options.presenceThrottle ?? 50);
    this.presenceThrottle.set(type, timeout);
  }

  private flushOperationQueue(): void {
    while (this.operationQueue.length > 0) {
      const operation = this.operationQueue.shift()!;
      this.socket?.emit('operation:submit', operation);
    }
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
    this.csrfToken = null;
  }
}
