/**
 * WebSocket Client for Real-Time Collaboration
 * Handles bidirectional communication for collaborative editing
 */

import {
  WebSocketMessage,
  OperationMessage,
  OperationAckMessage,
  CursorUpdateMessage,
  SelectionUpdateMessage,
  UserJoinMessage,
  UserLeaveMessage,
  SyncRequestMessage,
  SyncResponseMessage,
  CollaborationConfig,
  CollaborationEvent,
  CollaborationEventListener,
  WebSocketConnectionError,
  SessionId,
  UserId,
  Operation,
  CursorPosition,
  SelectionState,
} from './types';

export interface WebSocketClientOptions {
  url: string;
  reconnectAttempts: number;
  reconnectDelay: number;
  heartbeatInterval: number;
  connectionTimeout: number;
  messageQueueSize: number;
}

export class CollaborationWebSocketClient {
  private ws: WebSocket | null = null;
  private url: string;
  private options: WebSocketClientOptions;
  private reconnectAttempts = 0;
  private isConnecting = false;
  private isManualClose = false;
  private messageQueue: WebSocketMessage[] = [];
  private pendingOperations = new Map<
    string,
    { resolve: (value?: unknown) => void; reject: (reason?: unknown) => void }
  >();
  private eventListeners = new Map<string, CollaborationEventListener[]>();
  private heartbeatTimer: number | null = null;
  private sessionId: SessionId | null = null;
  private userId: UserId | null = null;

  constructor(options: WebSocketClientOptions) {
    this.url = options.url;
    this.options = options;
  }

  // Connection Management
  async connect(sessionId: SessionId, userId: UserId): Promise<void> {
    this.sessionId = sessionId;
    this.userId = userId;

    if (this.ws?.readyState === WebSocket.OPEN) {
      return Promise.resolve();
    }

    if (this.isConnecting) {
      return new Promise((resolve, reject) => {
        const checkConnection = () => {
          if (this.ws?.readyState === WebSocket.OPEN) {
            resolve();
          } else if (!this.isConnecting) {
            reject(new Error('Connection failed'));
          } else {
            setTimeout(checkConnection, 100);
          }
        };
        checkConnection();
      });
    }

    return this.establishConnection();
  }

  disconnect(): void {
    this.isManualClose = true;
    this.stopHeartbeat();

    if (this.ws) {
      this.ws.close(1000, 'Manual disconnect');
    }

    this.clearPendingOperations();
    this.emit({
      type: 'connection-status-changed',
      sessionId: this.sessionId!,
      data: { status: 'disconnected', reason: 'manual' },
      timestamp: Date.now(),
    });
  }

  // Message Sending
  async sendOperation(operation: Operation): Promise<void> {
    const message: OperationMessage = {
      type: 'OPERATION',
      payload: {
        operation,
        sessionId: this.sessionId!,
      },
      timestamp: Date.now(),
      messageId: this.generateMessageId(),
    };

    return this.sendMessage(message);
  }

  async sendCursorUpdate(cursor: CursorPosition): Promise<void> {
    const message: CursorUpdateMessage = {
      type: 'CURSOR_UPDATE',
      payload: {
        userId: this.userId!,
        cursor,
      },
      timestamp: Date.now(),
      messageId: this.generateMessageId(),
    };

    return this.sendMessageImmediate(message);
  }

  async sendSelectionUpdate(selection: SelectionState): Promise<void> {
    const message: SelectionUpdateMessage = {
      type: 'SELECTION_UPDATE',
      payload: {
        userId: this.userId!,
        selection,
      },
      timestamp: Date.now(),
      messageId: this.generateMessageId(),
    };

    return this.sendMessageImmediate(message);
  }

  async requestSync(lastKnownVersion: number): Promise<void> {
    const message: SyncRequestMessage = {
      type: 'SYNC_REQUEST',
      payload: {
        lastKnownVersion,
        userId: this.userId!,
      },
      timestamp: Date.now(),
      messageId: this.generateMessageId(),
    };

    return this.sendMessage(message);
  }

  // Event Management
  addEventListener(type: string, listener: CollaborationEventListener): void {
    if (!this.eventListeners.has(type)) {
      this.eventListeners.set(type, []);
    }
    this.eventListeners.get(type)!.push(listener);
  }

  removeEventListener(type: string, listener: CollaborationEventListener): void {
    const listeners = this.eventListeners.get(type);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    }
  }

  // Connection State
  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  get connectionState(): 'connecting' | 'open' | 'closing' | 'closed' {
    if (!this.ws) return 'closed';

    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return 'connecting';
      case WebSocket.OPEN:
        return 'open';
      case WebSocket.CLOSING:
        return 'closing';
      case WebSocket.CLOSED:
        return 'closed';
      default:
        return 'closed';
    }
  }

  // Private Methods
  private async establishConnection(): Promise<void> {
    this.isConnecting = true;

    return new Promise((resolve, reject) => {
      const wsUrl = new URL(this.url);
      wsUrl.searchParams.set('sessionId', this.sessionId!);
      wsUrl.searchParams.set('userId', this.userId!);

      this.ws = new WebSocket(wsUrl.toString());

      const connectionTimeout = setTimeout(() => {
        if (this.ws?.readyState !== WebSocket.OPEN) {
          this.ws?.close();
          reject(
            new WebSocketConnectionError(
              'Connection timeout',
              this.reconnectAttempts,
              this.options.reconnectAttempts
            )
          );
        }
      }, this.options.connectionTimeout);

      this.ws.onopen = () => {
        clearTimeout(connectionTimeout);
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.startHeartbeat();
        this.flushMessageQueue();

        this.emit({
          type: 'connection-status-changed',
          sessionId: this.sessionId!,
          data: { status: 'connected' },
          timestamp: Date.now(),
        });

        resolve();
      };

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.ws.onclose = (event) => {
        clearTimeout(connectionTimeout);
        this.isConnecting = false;
        this.stopHeartbeat();

        this.emit({
          type: 'connection-status-changed',
          sessionId: this.sessionId!,
          data: {
            status: 'disconnected',
            code: event.code,
            reason: event.reason,
          },
          timestamp: Date.now(),
        });

        // Auto-reconnect unless manually closed
        if (!this.isManualClose && this.reconnectAttempts < this.options.reconnectAttempts) {
          setTimeout(
            () => {
              this.reconnectAttempts++;
              this.establishConnection().catch(() => {
                // Reconnection failed
              });
            },
            this.options.reconnectDelay * Math.pow(2, this.reconnectAttempts)
          );
        } else if (this.reconnectAttempts >= this.options.reconnectAttempts) {
          reject(
            new WebSocketConnectionError(
              'Max reconnection attempts reached',
              this.reconnectAttempts,
              this.options.reconnectAttempts
            )
          );
        }
      };

      this.ws.onerror = (error) => {
        clearTimeout(connectionTimeout);
        this.emit({
          type: 'connection-status-changed',
          sessionId: this.sessionId!,
          data: { status: 'error', error },
          timestamp: Date.now(),
        });
      };
    });
  }

  private async sendMessage(message: WebSocketMessage): Promise<void> {
    if (!this.isConnected) {
      // Queue message for when connection is restored
      if (this.messageQueue.length < this.options.messageQueueSize) {
        this.messageQueue.push(message);
      }
      return;
    }

    return new Promise((resolve, reject) => {
      try {
        this.ws!.send(JSON.stringify(message));

        // For operations, wait for acknowledgment
        if (message.type === 'OPERATION') {
          this.pendingOperations.set(message.messageId, { resolve, reject });

          // Timeout for operation acknowledgment
          setTimeout(() => {
            if (this.pendingOperations.has(message.messageId)) {
              this.pendingOperations.delete(message.messageId);
              reject(new Error('Operation acknowledgment timeout'));
            }
          }, 10000);
        } else {
          resolve();
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  private async sendMessageImmediate(message: WebSocketMessage): Promise<void> {
    if (!this.isConnected) {
      return; // Drop cursor/selection updates if not connected
    }

    try {
      this.ws!.send(JSON.stringify(message));
    } catch (error) {
      console.warn('Failed to send immediate message:', error);
    }
  }

  private handleMessage(message: WebSocketMessage): void {
    switch (message.type) {
      case 'OPERATION':
        this.handleOperationMessage(message as OperationMessage);
        break;

      case 'OPERATION_ACK':
        this.handleOperationAck(message as OperationAckMessage);
        break;

      case 'CURSOR_UPDATE':
        this.handleCursorUpdate(message as CursorUpdateMessage);
        break;

      case 'SELECTION_UPDATE':
        this.handleSelectionUpdate(message as SelectionUpdateMessage);
        break;

      case 'USER_JOIN':
        this.handleUserJoin(message as UserJoinMessage);
        break;

      case 'USER_LEAVE':
        this.handleUserLeave(message as UserLeaveMessage);
        break;

      case 'SYNC_RESPONSE':
        this.handleSyncResponse(message as SyncResponseMessage);
        break;

      case 'HEARTBEAT':
        // Respond to heartbeat
        this.sendMessageImmediate({
          type: 'HEARTBEAT',
          payload: { pong: true },
          timestamp: Date.now(),
          messageId: this.generateMessageId(),
        });
        break;

      case 'ERROR':
        this.handleError(message);
        break;

      default:
        console.warn('Unknown message type:', message.type);
    }
  }

  private handleOperationMessage(message: OperationMessage): void {
    this.emit({
      type: 'operation-received',
      sessionId: message.payload.sessionId,
      data: message.payload.operation,
      timestamp: message.timestamp,
    });
  }

  private handleOperationAck(message: OperationAckMessage): void {
    const pending = this.pendingOperations.get(message.messageId);
    if (pending) {
      this.pendingOperations.delete(message.messageId);

      if (message.payload.success) {
        pending.resolve();
      } else {
        pending.reject(new Error(message.payload.error || 'Operation failed'));
      }
    }

    this.emit({
      type: 'operation-applied',
      sessionId: this.sessionId!,
      data: message.payload,
      timestamp: message.timestamp,
    });
  }

  private handleCursorUpdate(message: CursorUpdateMessage): void {
    this.emit({
      type: 'cursor-updated',
      sessionId: this.sessionId!,
      userId: message.payload.userId,
      data: message.payload.cursor,
      timestamp: message.timestamp,
    });
  }

  private handleSelectionUpdate(message: SelectionUpdateMessage): void {
    this.emit({
      type: 'selection-updated',
      sessionId: this.sessionId!,
      userId: message.payload.userId,
      data: message.payload.selection,
      timestamp: message.timestamp,
    });
  }

  private handleUserJoin(message: UserJoinMessage): void {
    this.emit({
      type: 'user-joined',
      sessionId: message.payload.sessionId,
      userId: message.payload.user.id,
      data: message.payload.user,
      timestamp: message.timestamp,
    });
  }

  private handleUserLeave(message: UserLeaveMessage): void {
    this.emit({
      type: 'user-left',
      sessionId: message.payload.sessionId,
      userId: message.payload.userId,
      data: { userId: message.payload.userId },
      timestamp: message.timestamp,
    });
  }

  private handleSyncResponse(message: SyncResponseMessage): void {
    this.emit({
      type: 'sync-completed',
      sessionId: this.sessionId!,
      data: message.payload,
      timestamp: message.timestamp,
    });
  }

  private handleError(message: WebSocketMessage): void {
    console.error('WebSocket error:', message.payload);
    this.emit({
      type: 'connection-status-changed',
      sessionId: this.sessionId!,
      data: { status: 'error', error: message.payload },
      timestamp: message.timestamp,
    });
  }

  private startHeartbeat(): void {
    this.heartbeatTimer = window.setInterval(() => {
      if (this.isConnected) {
        this.sendMessageImmediate({
          type: 'HEARTBEAT',
          payload: { ping: true },
          timestamp: Date.now(),
          messageId: this.generateMessageId(),
        });
      }
    }, this.options.heartbeatInterval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0 && this.isConnected) {
      const message = this.messageQueue.shift()!;
      this.sendMessage(message).catch((error) => {
        console.warn('Failed to send queued message:', error);
      });
    }
  }

  private clearPendingOperations(): void {
    for (const [id, pending] of this.pendingOperations) {
      pending.reject(new Error('Connection closed'));
    }
    this.pendingOperations.clear();
  }

  private emit(event: CollaborationEvent): void {
    const listeners = this.eventListeners.get(event.type);
    if (listeners) {
      listeners.forEach((listener) => {
        try {
          listener(event);
        } catch (error) {
          console.error('Error in event listener:', error);
        }
      });
    }
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
