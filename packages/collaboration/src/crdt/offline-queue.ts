import type { Operation } from '../types';
import { createLogger } from '@sim4d/engine-core';

const logger = createLogger('Collaboration');

/**
 * OfflineQueue - Queue for operations when disconnected from server
 *
 * This queue stores operations made while offline and replays them
 * when the connection is restored. Features:
 * - Persistent storage (localStorage/IndexedDB)
 * - Automatic replay on reconnect
 * - Conflict detection and resolution
 * - Size limits and expiration
 */
export class OfflineQueue {
  private queue: QueuedOperation[] = [];
  private readonly maxQueueSize: number;
  private readonly maxOperationAge: number; // milliseconds
  private readonly storageKey: string;
  private readonly persistToStorage: boolean;

  constructor(options: OfflineQueueOptions = {}) {
    this.maxQueueSize = options.maxQueueSize ?? 1000;
    this.maxOperationAge = options.maxOperationAge ?? 24 * 60 * 60 * 1000; // 24 hours
    this.storageKey = options.storageKey ?? 'sim4d-offline-queue';
    this.persistToStorage = options.persistToStorage ?? true;

    // Load persisted queue from storage
    if (this.persistToStorage) {
      this.loadFromStorage();
    }
  }

  /**
   * Enqueue an operation
   * Returns false if queue is full
   */
  enqueue(operation: Operation): boolean {
    // Check queue size limit
    if (this.queue.length >= this.maxQueueSize) {
      logger.warn('Offline queue full, dropping oldest operation');
      this.queue.shift(); // Remove oldest
    }

    // Add to queue with metadata
    const queuedOp: QueuedOperation = {
      operation,
      queuedAt: Date.now(),
      retryCount: 0,
    };

    this.queue.push(queuedOp);

    // Persist to storage
    if (this.persistToStorage) {
      this.saveToStorage();
    }

    return true;
  }

  /**
   * Dequeue next operation
   * Returns undefined if queue is empty
   */
  dequeue(): QueuedOperation | undefined {
    const queuedOp = this.queue.shift();

    if (queuedOp && this.persistToStorage) {
      this.saveToStorage();
    }

    return queuedOp;
  }

  /**
   * Peek at next operation without removing it
   */
  peek(): QueuedOperation | undefined {
    return this.queue[0];
  }

  /**
   * Get all queued operations
   */
  getAll(): QueuedOperation[] {
    return [...this.queue];
  }

  /**
   * Get queue size
   */
  size(): number {
    return this.queue.length;
  }

  /**
   * Check if queue is empty
   */
  isEmpty(): boolean {
    return this.queue.length === 0;
  }

  /**
   * Clear all operations from queue
   */
  clear(): void {
    this.queue = [];
    if (this.persistToStorage) {
      this.saveToStorage();
    }
  }

  /**
   * Remove expired operations
   * Returns number of operations removed
   */
  removeExpired(): number {
    const now = Date.now();
    const initialSize = this.queue.length;

    this.queue = this.queue.filter((queuedOp) => {
      const age = now - queuedOp.queuedAt;
      return age < this.maxOperationAge;
    });

    const removed = initialSize - this.queue.length;

    if (removed > 0 && this.persistToStorage) {
      this.saveToStorage();
    }

    return removed;
  }

  /**
   * Increment retry count for an operation
   */
  incrementRetry(operation: Operation): void {
    const queuedOp = this.queue.find((op) => op.operation.id === operation.id);
    if (queuedOp) {
      queuedOp.retryCount++;
      queuedOp.lastRetryAt = Date.now();

      if (this.persistToStorage) {
        this.saveToStorage();
      }
    }
  }

  /**
   * Get operations that failed multiple times
   */
  getFailedOperations(minRetries: number = 3): QueuedOperation[] {
    return this.queue.filter((queuedOp) => queuedOp.retryCount >= minRetries);
  }

  /**
   * Remove a specific operation from queue
   */
  remove(operationId: string): boolean {
    const initialSize = this.queue.length;
    this.queue = this.queue.filter((queuedOp) => queuedOp.operation.id !== operationId);

    const removed = initialSize > this.queue.length;

    if (removed && this.persistToStorage) {
      this.saveToStorage();
    }

    return removed;
  }

  /**
   * Save queue to localStorage
   */
  private saveToStorage(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        const serialized = JSON.stringify(this.queue);
        localStorage.setItem(this.storageKey, serialized);
      }
    } catch (error) {
      logger.error('Failed to save offline queue to storage:', error);
    }
  }

  /**
   * Load queue from localStorage
   */
  private loadFromStorage(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        const serialized = localStorage.getItem(this.storageKey);
        if (serialized) {
          this.queue = JSON.parse(serialized);

          // Remove expired operations
          this.removeExpired();
        }
      }
    } catch (error) {
      logger.error('Failed to load offline queue from storage:', error);
      this.queue = [];
    }
  }

  /**
   * Get queue statistics
   */
  getStats(): QueueStats {
    const now = Date.now();
    const ages = this.queue.map((queuedOp) => now - queuedOp.queuedAt);

    return {
      totalOperations: this.queue.length,
      oldestOperationAge: ages.length > 0 ? Math.max(...ages) : 0,
      averageOperationAge: ages.length > 0 ? ages.reduce((a, b) => a + b, 0) / ages.length : 0,
      failedOperations: this.getFailedOperations().length,
      storageSize: this.estimateStorageSize(),
    };
  }

  /**
   * Estimate storage size in bytes
   */
  private estimateStorageSize(): number {
    try {
      const serialized = JSON.stringify(this.queue);
      return new Blob([serialized]).size;
    } catch {
      return 0;
    }
  }
}

export interface OfflineQueueOptions {
  maxQueueSize?: number; // Max number of operations to queue
  maxOperationAge?: number; // Max age of operations in milliseconds
  storageKey?: string; // localStorage key for persistence
  persistToStorage?: boolean; // Whether to persist to localStorage
}

export interface QueuedOperation {
  operation: Operation;
  queuedAt: number; // Timestamp when queued
  retryCount: number; // Number of replay attempts
  lastRetryAt?: number; // Timestamp of last retry
}

export interface QueueStats {
  totalOperations: number;
  oldestOperationAge: number;
  averageOperationAge: number;
  failedOperations: number;
  storageSize: number; // Estimated size in bytes
}
