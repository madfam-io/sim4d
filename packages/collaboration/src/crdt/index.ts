/**
 * CRDT Module - Yjs-based collaboration with offline support
 *
 * This module provides enhanced real-time collaboration using CRDTs (Conflict-free
 * Replicated Data Types) via the Yjs library. Features include:
 *
 * - Automatic conflict resolution with mathematical convergence guarantees
 * - Offline support with operation queuing and automatic replay
 * - Optimistic UI updates with rollback on conflicts
 * - Collaborative undo/redo across all users
 * - Binary encoding for efficient network transmission
 *
 * Usage:
 * ```typescript
 * import { CollaborationClientYjs } from '@sim4d/collaboration/crdt';
 *
 * const client = new CollaborationClientYjs({
 *   serverUrl: 'ws://localhost:3000',
 *   documentId: 'my-document',
 *   user: { id: 'user-1', name: 'Alice' },
 * });
 *
 * // Submit operations - automatic offline queueing
 * client.submitOperation({
 *   type: 'ADD_NODE',
 *   node: { ... },
 *   // ...
 * });
 *
 * // Undo/redo across collaborative sessions
 * client.undo();
 * client.redo();
 *
 * // Get collaboration stats
 * const stats = client.getStats();
 * console.log(`Queued ops: ${stats.queueStats.totalOperations}`);
 * ```
 */

export { SharedGraph } from './shared-graph';
export { YjsAdapter, type YjsAdapterOptions } from './yjs-adapter';
export {
  OfflineQueue,
  type OfflineQueueOptions,
  type QueuedOperation,
  type QueueStats,
} from './offline-queue';
export {
  OptimisticStateManager,
  type OptimisticStateOptions,
  type PendingOperation,
  type OptimisticStats,
} from './optimistic-state';
export { CollaborationClientYjs } from './collaboration-client-yjs';
