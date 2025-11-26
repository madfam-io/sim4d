/**
 * Testing Utilities for Collaboration Features
 * Helper functions and mocks for testing collaboration functionality
 */

import type {
  CollaborationUser,
  SessionId,
  UserId,
  Operation,
  CreateNodeOperation,
  UpdateNodeParamsOperation,
  CursorPosition,
  SelectionState,
  CollaborationConfig,
} from '../types';
import { Sim4DCollaborationEngine } from '../collaboration-engine';

export class MockWebSocketClient {
  private eventListeners = new Map<string, ((...args: any[]) => void)[]>();
  private connected = false;
  private messageQueue: any[] = [];
  private messageCallback?: (data: any) => void;
  private reconnectCallback?: () => void;

  // Support both signatures for compatibility
  async connect(urlOrSessionId: string | SessionId, userId?: UserId): Promise<void> {
    this.connected = true;
    this.emit('connection-status-changed', { connected: true });

    // If reconnect callback exists, simulate reconnection
    if (this.reconnectCallback) {
      setTimeout(() => this.reconnectCallback!(), 100);
    }
  }

  async disconnect(): Promise<void> {
    this.connected = false;
    this.emit('connection-status-changed', { connected: false });
  }

  // Add generic send method for interface compatibility
  async send(message: any): Promise<void> {
    if (!this.connected) {
      throw new Error('Not connected');
    }
    this.messageQueue.push({ type: 'generic', data: message });

    // Trigger message callback if set
    if (this.messageCallback) {
      this.messageCallback(message);
    }
  }

  // Add onMessage handler
  onMessage(callback: (data: any) => void): void {
    this.messageCallback = callback;
  }

  // Add onReconnect handler
  onReconnect(callback: () => void): void {
    this.reconnectCallback = callback;
  }

  async sendOperation(operation: Operation): Promise<void> {
    if (!this.connected) {
      throw new Error('Not connected');
    }
    this.messageQueue.push({ type: 'operation', data: operation });
  }

  async sendCursorUpdate(cursor: CursorPosition): Promise<void> {
    if (!this.connected) {
      throw new Error('Not connected');
    }
    this.messageQueue.push({ type: 'cursor', data: cursor });
  }

  async sendSelectionUpdate(selection: SelectionState): Promise<void> {
    if (!this.connected) {
      throw new Error('Not connected');
    }
    this.messageQueue.push({ type: 'selection', data: selection });
  }

  async requestSync(lastKnownVersion: number): Promise<void> {
    this.messageQueue.push({ type: 'sync-request', lastKnownVersion });
  }

  // Check connection status - THIS WAS MISSING
  isConnected(): boolean {
    return this.connected;
  }

  addEventListener(event: string, listener: (...args: any[]) => void): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(listener);
  }

  removeEventListener(event: string, listener: (...args: any[]) => void): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    }
  }

  // Test utilities
  emit(event: string, data: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach((listener) => listener(data));
    }
  }

  getMessageQueue(): any[] {
    return [...this.messageQueue];
  }

  clearMessageQueue(): void {
    this.messageQueue = [];
  }

  simulateMessage(type: string, data: any): void {
    this.emit(type, data);
  }
}

export function createTestUser(
  id: string,
  overrides: Partial<CollaborationUser> = {}
): CollaborationUser {
  return {
    id: id as UserId,
    name: `Test User ${id}`,
    email: `test${id}@example.com`,
    color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
    avatar: `https://example.com/avatar${id}.jpg`,
    isOnline: true,
    lastSeen: Date.now(),
    ...overrides,
  };
}

export function createTestOperation(type: string, overrides: any = {}): Operation {
  const baseOperation = {
    id: `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId: 'test-user' as UserId,
    timestamp: Date.now(),
    version: 0,
    type,
    ...overrides,
  };

  switch (type) {
    case 'CREATE_NODE':
      return {
        ...baseOperation,
        nodeId: 'test-node',
        nodeType: 'Math::Add',
        position: { x: 100, y: 100 },
        params: {},
        ...overrides,
      } as CreateNodeOperation;

    case 'UPDATE_NODE_PARAMS':
      return {
        ...baseOperation,
        nodeId: 'test-node',
        paramUpdates: { value: 42 },
        previousValues: { value: 0 },
        ...overrides,
      } as UpdateNodeParamsOperation;

    default:
      return baseOperation as Operation;
  }
}

export function createTestCursor(overrides: Partial<CursorPosition> = {}): CursorPosition {
  return {
    x: Math.floor(Math.random() * 800),
    y: Math.floor(Math.random() * 600),
    timestamp: Date.now(),
    ...overrides,
  };
}

export function createTestSelection(
  nodeIds: string[] = [],
  edgeIds: string[] = []
): SelectionState {
  return {
    selectedNodes: nodeIds as any[],
    selectedEdges: edgeIds as any[],
    timestamp: Date.now(),
  };
}

export function createTestConfig(
  overrides: Partial<CollaborationConfig> = {}
): CollaborationConfig {
  return {
    websocket: {
      url: 'ws://localhost:3001/test',
      reconnectAttempts: 3,
      reconnectDelay: 1000,
      heartbeatInterval: 30000,
      connectionTimeout: 5000,
    },
    operationalTransform: {
      maxOperationHistory: 100,
      conflictResolutionStrategy: 'merge',
      batchOperations: true,
      batchDelay: 50,
    },
    presence: {
      cursorUpdateThrottle: 50,
      selectionUpdateThrottle: 100,
      presenceTimeout: 30000,
      showCursors: true,
      showSelections: true,
    },
    locks: {
      defaultLockDuration: 30000,
      maxLockDuration: 300000,
      autoReleaseLocks: true,
      lockConflictResolution: 'queue',
    },
    performance: {
      maxConcurrentUsers: 10,
      operationQueueSize: 100,
      compressionEnabled: true,
      deltaCompressionEnabled: true,
    },
    ...overrides,
  };
}

export class CollaborationTestHarness {
  private users: Map<
    UserId,
    {
      user: CollaborationUser;
      client: MockWebSocketClient;
    }
  > = new Map();
  private engine: any = null;

  setEngine(engine: any): void {
    this.engine = engine;
    // Set up event listeners to simulate message broadcasting
    this.setupEngineEventHandlers();
  }

  addUser(user: CollaborationUser): MockWebSocketClient {
    const client = new MockWebSocketClient();
    this.users.set(user.id, { user, client });
    return client;
  }

  private setupEngineEventHandlers(): void {
    if (!this.engine) return;

    // Listen for operation broadcasts and simulate sending to all other clients
    this.engine.addEventListener('operation-applied', (event: any) => {
      this.broadcastToOthers(event.data.operation.userId, 'operation', event.data.operation);
    });

    this.engine.addEventListener('cursor-updated', (event: any) => {
      this.broadcastToOthers(event.userId, 'cursor', event.data);
    });

    this.engine.addEventListener('selection-updated', (event: any) => {
      this.broadcastToOthers(event.userId, 'selection', event.data);
    });
  }

  removeUser(userId: UserId): void {
    this.users.delete(userId);
  }

  getUser(userId: UserId): CollaborationUser | undefined {
    return this.users.get(userId)?.user;
  }

  getClient(userId: UserId): MockWebSocketClient | undefined {
    return this.users.get(userId)?.client;
  }

  broadcastToOthers(fromUserId: UserId, event: string, data: any): void {
    for (const [userId, { client }] of this.users) {
      if (userId !== fromUserId) {
        client.simulateMessage(event, data);
      }
    }
  }

  simulateNetworkPartition(userIds: UserId[]): void {
    userIds.forEach((userId) => {
      const client = this.getClient(userId);
      if (client) {
        client.emit('connection-status-changed', { connected: false });
      }
    });
  }

  simulateNetworkReconnection(userIds: UserId[]): void {
    userIds.forEach((userId) => {
      const client = this.getClient(userId);
      if (client) {
        client.emit('connection-status-changed', { connected: true });
      }
    });
  }

  getAllMessageQueues(): Map<UserId, any[]> {
    const queues = new Map<UserId, any[]>();
    for (const [userId, { client }] of this.users) {
      queues.set(userId, client.getMessageQueue());
    }
    return queues;
  }

  clearAllMessageQueues(): void {
    for (const [, { client }] of this.users) {
      client.clearMessageQueue();
    }
  }
}

export function waitFor(
  condition: () => boolean | Promise<boolean>,
  timeout: number = 5000,
  interval: number = 50
): Promise<void> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    const check = async () => {
      try {
        const result = await condition();
        if (result) {
          resolve();
          return;
        }
      } catch (error) {
        // Continue checking
      }

      if (Date.now() - startTime > timeout) {
        reject(new Error(`Condition not met within ${timeout}ms`));
        return;
      }

      setTimeout(check, interval);
    };

    check();
  });
}

// Removed: createMockGeometryContext - mock geometry no longer exists

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Mock WebSocket Client that integrates with the harness
export class TestCollaborationWebSocketClient {
  private harness: CollaborationTestHarness;
  private userId: UserId;
  private sessionId: SessionId;
  private connected = false;

  constructor(harness: CollaborationTestHarness, config: any) {
    this.harness = harness;
  }

  async connect(sessionId: SessionId, userId: UserId): Promise<void> {
    this.sessionId = sessionId;
    this.userId = userId;
    this.connected = true;
  }

  async disconnect(): Promise<void> {
    this.connected = false;
  }

  isConnected(): boolean {
    return this.connected;
  }

  async sendOperation(operation: any): Promise<void> {
    if (!this.connected) return;

    // Broadcast to all other clients
    this.harness.broadcastToOthers(this.userId, 'operation', operation);
  }

  async sendCursorUpdate(cursor: any): Promise<void> {
    if (!this.connected) return;

    this.harness.broadcastToOthers(this.userId, 'cursor', cursor);
  }

  async sendSelectionUpdate(selection: any): Promise<void> {
    if (!this.connected) return;

    this.harness.broadcastToOthers(this.userId, 'selection', selection);
  }

  async requestSync(lastKnownVersion: number): Promise<void> {
    // Mock sync request
  }

  addEventListener(event: string, listener: (...args: any[]) => void): void {
    // Mock event listener
  }

  removeEventListener(event: string, listener: (...args: any[]) => void): void {
    // Mock event listener removal
  }

  onMessage(callback: (data: any) => void): void {
    // Mock onMessage handler
  }

  onReconnect(callback: () => void): void {
    // Mock onReconnect handler
  }

  async send(message: any): Promise<void> {
    if (!this.connected) return;

    // Mock generic send
  }
}

// Simplified test engine creation - just use regular import
export function createTestCollaborationEngine(harness: CollaborationTestHarness): any {
  const config = createTestConfig();

  // Create a mock WebSocket client with all required methods
  const mockWebSocketClient = new MockWebSocketClient();

  // Use the imported engine class with the mock client
  const engine = new Sim4DCollaborationEngine(mockWebSocketClient);

  // Override WebSocket broadcasting to use harness
  const originalBroadcastOperation = engine.broadcastOperation?.bind(engine);
  if (originalBroadcastOperation) {
    engine.broadcastOperation = async function (sessionId: any, operation: any) {
      // Broadcast to all clients in harness
      harness.broadcastToOthers(operation.userId, 'operation', operation);
      // Still emit the event for local listeners
      (this as any).emit({
        type: 'operation-applied',
        sessionId,
        data: { operation },
        timestamp: Date.now(),
      });
    };
  }

  return engine;
}

// Create a working mock collaboration engine for parameter sync tests
export function createMockCollaborationEngine() {
  return {
    addEventListener: (event: string, listener: (...args: any[]) => void) => {
      // Store listeners if needed
    },
    removeEventListener: (event: string, listener: (...args: any[]) => void) => {
      // Remove listeners if needed
    },
    applyOperation: async (sessionId: string, operation: any) => {
      // Mock operation application - this is what the tests expect to be called
      console.log(`Mock applying operation ${operation.type} to session ${sessionId}`);
    },
  };
}
