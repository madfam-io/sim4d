import { describe, it, expect, beforeEach, vi } from 'vitest';
import { OfflineQueue } from '../offline-queue';
import type { Operation } from '../../types';
import { createNodeId } from '@brepflow/types';

describe('OfflineQueue', () => {
  let queue: OfflineQueue;
  let sampleOperation: Operation;

  beforeEach(() => {
    queue = new OfflineQueue({
      persistToStorage: false, // Disable localStorage for tests
      maxQueueSize: 10,
      maxOperationAge: 5000, // 5 seconds for testing
    });

    sampleOperation = {
      id: 'op-1',
      type: 'ADD_NODE',
      node: {
        id: createNodeId('test-node'),
        type: 'Box',
        position: { x: 0, y: 0 },
        inputs: {},
        params: {},
      },
      userId: 'user-1',
      timestamp: Date.now(),
      documentId: 'doc-1',
    };
  });

  describe('Enqueue/Dequeue', () => {
    it('should enqueue operation', () => {
      const success = queue.enqueue(sampleOperation);

      expect(success).toBe(true);
      expect(queue.size()).toBe(1);
    });

    it('should dequeue operation', () => {
      queue.enqueue(sampleOperation);
      const queuedOp = queue.dequeue();

      expect(queuedOp).toBeDefined();
      expect(queuedOp?.operation.id).toBe('op-1');
      expect(queue.size()).toBe(0);
    });

    it('should return undefined when dequeueing empty queue', () => {
      const queuedOp = queue.dequeue();
      expect(queuedOp).toBeUndefined();
    });

    it('should peek without removing', () => {
      queue.enqueue(sampleOperation);
      const peeked = queue.peek();

      expect(peeked?.operation.id).toBe('op-1');
      expect(queue.size()).toBe(1);
    });
  });

  describe('Queue Management', () => {
    it('should enforce max queue size', () => {
      for (let i = 0; i < 15; i++) {
        queue.enqueue({ ...sampleOperation, id: `op-${i}` });
      }

      expect(queue.size()).toBe(10);
    });

    it('should report isEmpty correctly', () => {
      expect(queue.isEmpty()).toBe(true);

      queue.enqueue(sampleOperation);
      expect(queue.isEmpty()).toBe(false);

      queue.dequeue();
      expect(queue.isEmpty()).toBe(true);
    });

    it('should clear queue', () => {
      queue.enqueue(sampleOperation);
      queue.enqueue({ ...sampleOperation, id: 'op-2' });

      queue.clear();
      expect(queue.isEmpty()).toBe(true);
    });

    it('should get all queued operations', () => {
      queue.enqueue(sampleOperation);
      queue.enqueue({ ...sampleOperation, id: 'op-2' });

      const all = queue.getAll();
      expect(all).toHaveLength(2);
    });

    it('should remove specific operation', () => {
      queue.enqueue(sampleOperation);
      queue.enqueue({ ...sampleOperation, id: 'op-2' });

      const removed = queue.remove('op-1');
      expect(removed).toBe(true);
      expect(queue.size()).toBe(1);
    });
  });

  describe('Retry Management', () => {
    it('should increment retry count', () => {
      queue.enqueue(sampleOperation);
      queue.incrementRetry(sampleOperation);

      const all = queue.getAll();
      expect(all[0].retryCount).toBe(1);
    });

    it('should track last retry timestamp', () => {
      queue.enqueue(sampleOperation);
      queue.incrementRetry(sampleOperation);

      const all = queue.getAll();
      expect(all[0].lastRetryAt).toBeDefined();
    });

    it('should get failed operations', () => {
      queue.enqueue(sampleOperation);

      for (let i = 0; i < 3; i++) {
        queue.incrementRetry(sampleOperation);
      }

      const failed = queue.getFailedOperations(3);
      expect(failed).toHaveLength(1);
    });
  });

  describe('Expiration', () => {
    it('should remove expired operations', () => {
      vi.useFakeTimers();

      queue.enqueue(sampleOperation);

      // Advance time beyond max age
      vi.advanceTimersByTime(6000);

      const removed = queue.removeExpired();
      expect(removed).toBe(1);
      expect(queue.size()).toBe(0);

      vi.useRealTimers();
    });

    it('should not remove non-expired operations', () => {
      queue.enqueue(sampleOperation);

      const removed = queue.removeExpired();
      expect(removed).toBe(0);
      expect(queue.size()).toBe(1);
    });
  });

  describe('Statistics', () => {
    it('should provide queue statistics', () => {
      queue.enqueue(sampleOperation);
      queue.enqueue({ ...sampleOperation, id: 'op-2' });

      const stats = queue.getStats();

      expect(stats.totalOperations).toBe(2);
      expect(stats.oldestOperationAge).toBeGreaterThanOrEqual(0);
      expect(stats.averageOperationAge).toBeGreaterThanOrEqual(0);
      expect(stats.storageSize).toBeGreaterThan(0);
    });

    it('should report zero stats for empty queue', () => {
      const stats = queue.getStats();

      expect(stats.totalOperations).toBe(0);
      expect(stats.oldestOperationAge).toBe(0);
      expect(stats.averageOperationAge).toBe(0);
    });
  });
});
