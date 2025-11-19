/**
 * Real-Time Parameter Synchronization
 * Handles synchronized editing of node parameters across multiple users
 */

import type { NodeId } from '@brepflow/types';
import {
  Operation,
  UpdateNodeParamsOperation,
  UserId,
  SessionId,
  CollaborationEngine,
} from './types';

export interface ParameterChange {
  nodeId: NodeId;
  paramName: string;
  value: unknown;
  previousValue: any;
  userId: UserId;
  timestamp: number;
}

export interface ParameterSyncConfig {
  throttleDelay: number; // ms between parameter updates
  batchDelay: number; // ms to wait before sending batched updates
  conflictResolutionStrategy: 'last-writer-wins' | 'user-priority' | 'merge';
  enableParameterLocking: boolean;
  lockTimeout: number; // ms before parameter locks expire
}

export interface ParameterLock {
  nodeId: NodeId;
  paramName: string;
  userId: UserId;
  acquiredAt: number;
  expiresAt: number;
}

export class ParameterSynchronizer {
  private collaborationEngine: CollaborationEngine;
  private config: ParameterSyncConfig;
  private pendingChanges = new Map<string, ParameterChange>();
  private parameterLocks = new Map<string, ParameterLock>();
  private throttleTimers = new Map<string, unknown>(); // Use any to support both browser and Node.js
  private batchTimer: any = null; // Use any to support both browser and Node.js
  private changeListeners = new Map<string, ((change: ParameterChange) => void)[]>();

  constructor(collaborationEngine: CollaborationEngine, config: Partial<ParameterSyncConfig> = {}) {
    this.collaborationEngine = collaborationEngine;
    this.config = {
      throttleDelay: 300,
      batchDelay: 100,
      conflictResolutionStrategy: 'last-writer-wins',
      enableParameterLocking: true,
      lockTimeout: 5000,
      ...config,
    };

    this.setupCollaborationListeners();
  }

  /**
   * Update a parameter value and sync across users
   */
  async updateParameter(
    sessionId: SessionId,
    nodeId: NodeId,
    paramName: string,
    value: unknown,
    userId: UserId
  ): Promise<void> {
    const lockKey = this.getLockKey(nodeId, paramName);

    // Check if parameter is locked by another user
    if (this.config.enableParameterLocking) {
      const lock = this.parameterLocks.get(lockKey);
      if (lock && lock.userId !== userId && Date.now() < lock.expiresAt) {
        throw new Error(`Parameter ${paramName} is locked by another user`);
      }
    }

    // Get the current value for conflict detection
    const currentValue = await this.getCurrentParameterValue(nodeId, paramName);

    const change: ParameterChange = {
      nodeId,
      paramName,
      value,
      previousValue: currentValue,
      userId,
      timestamp: Date.now(),
    };

    // Store pending change
    const changeKey = this.getChangeKey(nodeId, paramName);
    this.pendingChanges.set(changeKey, change);

    // Throttle parameter updates
    this.throttleParameterUpdate(sessionId, changeKey, change);
  }

  /**
   * Acquire a lock on a specific parameter
   */
  async lockParameter(nodeId: NodeId, paramName: string, userId: UserId): Promise<boolean> {
    if (!this.config.enableParameterLocking) {
      return true; // Locking disabled
    }

    const lockKey = this.getLockKey(nodeId, paramName);
    const existingLock = this.parameterLocks.get(lockKey);

    // Check if already locked by another user
    if (existingLock && existingLock.userId !== userId && Date.now() < existingLock.expiresAt) {
      return false;
    }

    // Create new lock
    const lock: ParameterLock = {
      nodeId,
      paramName,
      userId,
      acquiredAt: Date.now(),
      expiresAt: Date.now() + this.config.lockTimeout,
    };

    this.parameterLocks.set(lockKey, lock);

    // Set up auto-release timer
    setTimeout(() => {
      this.releaseParameterLock(nodeId, paramName, userId);
    }, this.config.lockTimeout);

    return true;
  }

  /**
   * Release a parameter lock
   */
  releaseParameterLock(nodeId: NodeId, paramName: string, userId: UserId): boolean {
    const lockKey = this.getLockKey(nodeId, paramName);
    const lock = this.parameterLocks.get(lockKey);

    if (!lock || lock.userId !== userId) {
      return false; // Lock doesn't exist or user doesn't own it
    }

    this.parameterLocks.delete(lockKey);
    return true;
  }

  /**
   * Check if a parameter is locked
   */
  isParameterLocked(nodeId: NodeId, paramName: string, userId?: UserId): boolean {
    const lockKey = this.getLockKey(nodeId, paramName);
    const lock = this.parameterLocks.get(lockKey);

    if (!lock) return false;

    // Check if lock has expired
    if (Date.now() > lock.expiresAt) {
      this.parameterLocks.delete(lockKey);
      return false;
    }

    // Return true if locked by someone else, false if locked by this user
    if (userId) {
      return lock.userId !== userId;
    }

    return true;
  }

  /**
   * Get all current parameter locks
   */
  getParameterLocks(): ParameterLock[] {
    // Clean up expired locks first
    const now = Date.now();
    for (const [key, lock] of this.parameterLocks) {
      if (now > lock.expiresAt) {
        this.parameterLocks.delete(key);
      }
    }

    return Array.from(this.parameterLocks.values());
  }

  /**
   * Add listener for parameter changes
   */
  addParameterChangeListener(
    nodeId: NodeId,
    paramName: string,
    listener: (change: ParameterChange) => void
  ): void {
    const key = this.getChangeKey(nodeId, paramName);
    if (!this.changeListeners.has(key)) {
      this.changeListeners.set(key, []);
    }
    this.changeListeners.get(key)!.push(listener);
  }

  /**
   * Remove parameter change listener
   */
  removeParameterChangeListener(
    nodeId: NodeId,
    paramName: string,
    listener: (change: ParameterChange) => void
  ): void {
    const key = this.getChangeKey(nodeId, paramName);
    const listeners = this.changeListeners.get(key);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * Handle incoming parameter changes from other users
   */
  async handleRemoteParameterChange(operation: UpdateNodeParamsOperation): Promise<void> {
    // Apply the remote change
    for (const [paramName, value] of Object.entries(operation.paramUpdates)) {
      const change: ParameterChange = {
        nodeId: operation.nodeId,
        paramName,
        value,
        previousValue: operation.previousValues[paramName],
        userId: operation.userId,
        timestamp: operation.timestamp,
      };

      // Check for conflicts with pending local changes
      const localChange = this.pendingChanges.get(this.getChangeKey(operation.nodeId, paramName));
      if (localChange && localChange.timestamp > operation.timestamp - 1000) {
        // Conflict detected - resolve it
        const resolvedChange = await this.resolveParameterConflict(localChange, change);
        change.value = resolvedChange.value;
      }

      // Notify listeners
      this.notifyParameterChange(change);
    }
  }

  // Private Methods
  private setupCollaborationListeners(): void {
    this.collaborationEngine.addEventListener('operation-received', (event) => {
      if (event.data.operation.type === 'UPDATE_NODE_PARAMS') {
        this.handleRemoteParameterChange(event.data.operation as UpdateNodeParamsOperation);
      }
    });
  }

  private throttleParameterUpdate(
    sessionId: SessionId,
    changeKey: string,
    change: ParameterChange
  ): void {
    // Clear existing timer for this parameter
    const existingTimer = this.throttleTimers.get(changeKey);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Set new timer - use globalThis.setTimeout to work in both browser and Node.js
    const timer = (globalThis.setTimeout || setTimeout)(() => {
      this.sendParameterUpdate(sessionId, change);
      this.throttleTimers.delete(changeKey);
    }, this.config.throttleDelay);

    this.throttleTimers.set(changeKey, timer);
  }

  private async sendParameterUpdate(sessionId: SessionId, change: ParameterChange): Promise<void> {
    // Create operation
    const operation: UpdateNodeParamsOperation = {
      id: `param_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'UPDATE_NODE_PARAMS',
      userId: change.userId,
      timestamp: change.timestamp,
      version: 0, // Will be set by collaboration engine
      nodeId: change.nodeId,
      paramUpdates: {
        [change.paramName]: change.value,
      },
      previousValues: {
        [change.paramName]: change.previousValue,
      },
    };

    // Send through collaboration engine
    await this.collaborationEngine.applyOperation(sessionId, operation);

    // Remove from pending changes
    const changeKey = this.getChangeKey(change.nodeId, change.paramName);
    this.pendingChanges.delete(changeKey);

    // Notify local listeners
    this.notifyParameterChange(change);
  }

  private async resolveParameterConflict(
    localChange: ParameterChange,
    remoteChange: ParameterChange
  ): Promise<ParameterChange> {
    switch (this.config.conflictResolutionStrategy) {
      case 'last-writer-wins':
        return localChange.timestamp > remoteChange.timestamp ? localChange : remoteChange;

      case 'user-priority':
        // For now, prefer the remote change
        return remoteChange;

      case 'merge':
        // Simple merge strategy - for objects, merge properties
        if (typeof localChange.value === 'object' && typeof remoteChange.value === 'object') {
          return {
            ...localChange,
            value: { ...localChange.value, ...remoteChange.value },
          };
        }
        return remoteChange; // Fallback to remote for non-objects

      default:
        return remoteChange;
    }
  }

  private notifyParameterChange(change: ParameterChange): void {
    const key = this.getChangeKey(change.nodeId, change.paramName);
    const listeners = this.changeListeners.get(key);
    if (listeners) {
      listeners.forEach((listener) => {
        try {
          listener(change);
        } catch (error) {
          console.error('Error in parameter change listener:', error);
        }
      });
    }
  }

  private async getCurrentParameterValue(nodeId: NodeId, paramName: string): Promise<any> {
    // This would typically get the current value from the graph state
    // For now, return undefined as a default
    return undefined;
  }

  private getChangeKey(nodeId: NodeId, paramName: string): string {
    return `${nodeId}:${paramName}`;
  }

  private getLockKey(nodeId: NodeId, paramName: string): string {
    return `${nodeId}:${paramName}`;
  }
}

/**
 * Parameter Sync Manager
 * High-level manager for parameter synchronization
 */
export interface ParameterSyncState {
  value: unknown;
  lastModified: number;
  lastModifiedBy: UserId;
  isLocked: boolean;
  lockedBy?: UserId;
}

export class ParameterSyncManager {
  private synchronizer: ParameterSynchronizer;
  private sessionId: SessionId;
  private userId: UserId;
  private parameterStates = new Map<string, ParameterSyncState>();
  private subscriptions = new Map<string, (value: unknown) => void>();

  constructor(synchronizer: ParameterSynchronizer, sessionId: SessionId, userId: UserId) {
    this.synchronizer = synchronizer;
    this.sessionId = sessionId;
    this.userId = userId;
  }

  /**
   * Subscribe to parameter changes for a specific node parameter
   */
  subscribe(nodeId: NodeId, paramName: string, callback: (value: unknown) => void): () => void {
    const key = this.getStateKey(nodeId, paramName);

    // Store the callback
    this.subscriptions.set(key, callback);

    // Initialize parameter state if it doesn't exist
    if (!this.parameterStates.has(key)) {
      this.parameterStates.set(key, {
        value: undefined,
        isLocked: false,
        lockedBy: null,
        lastModified: 0,
        lastModifiedBy: null,
      });
    }

    // Add listener to synchronizer
    const listener = (change: ParameterChange) => {
      this.updateParameterState(key, change);
      const state = this.parameterStates.get(key);
      if (state) {
        callback(state);
      }
    };

    this.synchronizer.addParameterChangeListener(nodeId, paramName, listener);

    // Return unsubscribe function
    return () => {
      this.subscriptions.delete(key);
      this.synchronizer.removeParameterChangeListener(nodeId, paramName, listener);
      this.parameterStates.delete(key);
    };
  }

  /**
   * Subscribe to parameter changes
   */
  subscribeToParameter(nodeId: NodeId, paramName: string): void {
    this.synchronizer.addParameterChangeListener(nodeId, paramName, (change) => {
      this.updateParameterState(this.getStateKey(nodeId, paramName), change);
    });
  }

  /**
   * Unsubscribe from parameter changes
   */
  unsubscribeFromParameter(nodeId: NodeId, paramName: string): void {
    // Note: This would remove all listeners for this parameter
    // In a real implementation, you'd want to track specific listeners
    this.cleanupParameterListener(nodeId, paramName);
  }

  /**
   * Update a parameter value
   */
  async updateParameter(
    nodeId: NodeId,
    paramName: string,
    value: unknown,
    options?: { autoLock?: boolean }
  ): Promise<void> {
    // Try to acquire lock first if auto-lock is enabled
    if (options?.autoLock || this.synchronizer.isParameterLocked(nodeId, paramName, this.userId)) {
      if (this.synchronizer.isParameterLocked(nodeId, paramName, this.userId)) {
        throw new Error('Parameter is locked by another user');
      }
      await this.synchronizer.lockParameter(nodeId, paramName, this.userId);
    }

    try {
      await this.synchronizer.updateParameter(
        this.sessionId,
        nodeId,
        paramName,
        value,
        this.userId
      );
    } finally {
      // Release lock after update if auto-lock was used
      if (options?.autoLock) {
        setTimeout(() => {
          this.synchronizer.releaseParameterLock(nodeId, paramName, this.userId);
        }, 1000);
      }
    }
  }

  /**
   * Get current parameter state
   */
  getParameterState(nodeId: NodeId, paramName: string): ParameterSyncState | null {
    const key = this.getStateKey(nodeId, paramName);
    return this.parameterStates.get(key) || null;
  }

  /**
   * Get parameter state for all subscribed parameters
   */
  getAllParameterStates(): Map<string, unknown> {
    const state = new Map<string, unknown>();
    for (const [key, paramState] of this.parameterStates) {
      state.set(key, paramState.value);
    }
    return state;
  }

  /**
   * Check if parameter is locked
   */
  isParameterLocked(nodeId: NodeId, paramName: string): boolean {
    return this.synchronizer.isParameterLocked(nodeId, paramName, this.userId);
  }

  /**
   * Lock parameter
   */
  lockParameter(nodeId: NodeId, paramName: string): void {
    this.synchronizer.lockParameter(nodeId, paramName, this.userId);
  }

  /**
   * Unlock parameter
   */
  unlockParameter(nodeId: NodeId, paramName: string): void {
    this.synchronizer.releaseParameterLock(nodeId, paramName, this.userId);
  }

  /**
   * Check if user can edit parameter
   */
  canEditParameter(nodeId: NodeId, paramName: string): boolean {
    return !this.synchronizer.isParameterLocked(nodeId, paramName, this.userId);
  }

  /**
   * Force release all locks held by current user
   */
  releaseAllLocks(): void {
    const locks = this.synchronizer.getParameterLocks();
    for (const lock of locks) {
      if (lock.userId === this.userId) {
        this.synchronizer.releaseParameterLock(lock.nodeId, lock.paramName, this.userId);
      }
    }
  }

  private cleanupParameterListener(nodeId: NodeId, paramName: string): void {
    const key = this.getStateKey(nodeId, paramName);
    this.parameterStates.delete(key);
    // Remove listeners would be handled by synchronizer
  }

  private updateParameterState(key: string, change: ParameterChange): void {
    const currentState = this.parameterStates.get(key);
    if (!currentState) {
      // Initialize new state
      this.parameterStates.set(key, {
        value: change.value,
        lastModified: change.timestamp,
        lastModifiedBy: change.userId,
        isLocked: this.synchronizer.isParameterLocked(change.nodeId, change.paramName, this.userId),
        lockedBy: this.getParameterLockOwner(change.nodeId, change.paramName),
      });
      return;
    }

    const newState: ParameterSyncState = {
      ...currentState,
      value: change.value,
      lastModified: change.timestamp,
      lastModifiedBy: change.userId,
      isLocked: this.synchronizer.isParameterLocked(change.nodeId, change.paramName, this.userId),
      lockedBy: this.getParameterLockOwner(change.nodeId, change.paramName),
    };

    this.parameterStates.set(key, newState);

    // Trigger subscription callback if one exists
    const callback = this.subscriptions.get(key);
    if (callback) {
      callback(newState);
    }
  }

  private getParameterLockOwner(nodeId: NodeId, paramName: string): UserId | undefined {
    const locks = this.synchronizer.getParameterLocks();
    const lock = locks.find((l) => l.nodeId === nodeId && l.paramName === paramName);
    return lock?.userId;
  }

  private getStateKey(nodeId: NodeId, paramName: string): string {
    return `${nodeId}:${paramName}`;
  }
}
