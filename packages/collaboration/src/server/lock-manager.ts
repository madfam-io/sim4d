import type { User } from '../types';

/**
 * LockManager - Manages node-level locks for collaborative editing
 *
 * Prevents multiple users from editing the same node simultaneously by
 * implementing a distributed lock system with automatic expiration and
 * lock stealing for orphaned locks.
 *
 * Features:
 * - Timeout-based auto-release (default 30 seconds)
 * - Lock stealing for expired/orphaned locks
 * - Heartbeat-based lock renewal
 * - Automatic cleanup on disconnect
 */
export class LockManager {
  private locks: Map<string, NodeLock> = new Map();
  private readonly lockTimeout: number;
  private cleanupTimer: NodeJS.Timeout | null = null;

  constructor(options: LockManagerOptions = {}) {
    this.lockTimeout = options.lockTimeout ?? 30000; // 30 seconds default

    // Start periodic cleanup of expired locks
    this.startCleanup();
  }

  /**
   * Attempt to acquire a lock on a node
   */
  acquireLock(nodeId: string, user: User): LockResult {
    const existingLock = this.locks.get(nodeId);

    // No existing lock - grant immediately
    if (!existingLock) {
      const lock = this.createLock(nodeId, user);
      this.locks.set(nodeId, lock);

      return {
        success: true,
        lock,
        reason: 'granted',
      };
    }

    // Lock exists and belongs to same user - renew it
    if (existingLock.userId === user.id) {
      existingLock.expiresAt = Date.now() + this.lockTimeout;
      existingLock.renewCount++;

      return {
        success: true,
        lock: existingLock,
        reason: 'renewed',
      };
    }

    // Lock exists but expired - steal it
    if (this.isLockExpired(existingLock)) {
      const newLock = this.createLock(nodeId, user);
      newLock.stolenFrom = existingLock.userId;
      this.locks.set(nodeId, newLock);

      return {
        success: true,
        lock: newLock,
        reason: 'stolen_expired',
        previousOwner: {
          userId: existingLock.userId,
          userName: existingLock.userName,
        },
      };
    }

    // Lock exists and active - deny
    return {
      success: false,
      lock: existingLock,
      reason: 'locked_by_other',
      remainingTime: existingLock.expiresAt - Date.now(),
    };
  }

  /**
   * Release a lock on a node
   */
  releaseLock(nodeId: string, userId: string): boolean {
    const lock = this.locks.get(nodeId);

    if (!lock) {
      return false; // No lock to release
    }

    if (lock.userId !== userId) {
      return false; // Not the lock owner
    }

    this.locks.delete(nodeId);
    return true;
  }

  /**
   * Renew a lock (extend expiration)
   */
  renewLock(nodeId: string, userId: string): boolean {
    const lock = this.locks.get(nodeId);

    if (!lock || lock.userId !== userId) {
      return false;
    }

    lock.expiresAt = Date.now() + this.lockTimeout;
    lock.renewCount++;

    return true;
  }

  /**
   * Forcefully steal a lock (admin override or expired lock)
   */
  stealLock(nodeId: string, user: User, force: boolean = false): LockResult {
    const existingLock = this.locks.get(nodeId);

    if (!existingLock) {
      // No lock exists - just acquire normally
      return this.acquireLock(nodeId, user);
    }

    if (!force && !this.isLockExpired(existingLock)) {
      return {
        success: false,
        lock: existingLock,
        reason: 'lock_active_cannot_steal',
        remainingTime: existingLock.expiresAt - Date.now(),
      };
    }

    // Steal the lock
    const newLock = this.createLock(nodeId, user);
    newLock.stolenFrom = existingLock.userId;
    this.locks.set(nodeId, newLock);

    return {
      success: true,
      lock: newLock,
      reason: force ? 'stolen_force' : 'stolen_expired',
      previousOwner: {
        userId: existingLock.userId,
        userName: existingLock.userName,
      },
    };
  }

  /**
   * Get current lock for a node
   */
  getLock(nodeId: string): NodeLock | null {
    const lock = this.locks.get(nodeId);

    if (!lock) {
      return null;
    }

    // Check if expired
    if (this.isLockExpired(lock)) {
      this.locks.delete(nodeId);
      return null;
    }

    return lock;
  }

  /**
   * Get all locks for a user
   */
  getUserLocks(userId: string): NodeLock[] {
    const userLocks: NodeLock[] = [];

    for (const lock of this.locks.values()) {
      if (lock.userId === userId) {
        userLocks.push(lock);
      }
    }

    return userLocks;
  }

  /**
   * Release all locks for a user (on disconnect)
   */
  releaseUserLocks(userId: string): number {
    let released = 0;

    for (const [nodeId, lock] of this.locks.entries()) {
      if (lock.userId === userId) {
        this.locks.delete(nodeId);
        released++;
      }
    }

    return released;
  }

  /**
   * Get all active locks
   */
  getAllLocks(): NodeLock[] {
    return Array.from(this.locks.values());
  }

  /**
   * Check if a node is locked
   */
  isLocked(nodeId: string): boolean {
    const lock = this.locks.get(nodeId);
    return lock !== undefined && !this.isLockExpired(lock);
  }

  /**
   * Check if user owns lock on node
   */
  isLockedByUser(nodeId: string, userId: string): boolean {
    const lock = this.locks.get(nodeId);
    return lock !== undefined && lock.userId === userId && !this.isLockExpired(lock);
  }

  /**
   * Cleanup expired locks
   */
  cleanupExpiredLocks(): number {
    let cleaned = 0;

    for (const [nodeId, lock] of this.locks.entries()) {
      if (this.isLockExpired(lock)) {
        this.locks.delete(nodeId);
        cleaned++;
      }
    }

    return cleaned;
  }

  /**
   * Get lock statistics
   */
  getStats(): LockStats {
    const now = Date.now();
    const locks = Array.from(this.locks.values());

    const expiringLocks = locks.filter((lock) => lock.expiresAt - now < 5000);
    const ages = locks.map((lock) => now - lock.acquiredAt);

    return {
      totalLocks: this.locks.size,
      expiredLocks: locks.filter((lock) => this.isLockExpired(lock)).length,
      expiringLocks: expiringLocks.length,
      averageLockAge: ages.length > 0 ? ages.reduce((a, b) => a + b, 0) / ages.length : 0,
      oldestLockAge: ages.length > 0 ? Math.max(...ages) : 0,
      totalRenewals: locks.reduce((sum, lock) => sum + lock.renewCount, 0),
    };
  }

  /**
   * Destroy lock manager and cleanup
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    this.locks.clear();
  }

  // Private methods

  private createLock(nodeId: string, user: User): NodeLock {
    const now = Date.now();

    return {
      nodeId,
      userId: user.id,
      userName: user.name,
      lockId: `lock-${nodeId}-${now}`,
      acquiredAt: now,
      expiresAt: now + this.lockTimeout,
      renewCount: 0,
    };
  }

  private isLockExpired(lock: NodeLock): boolean {
    return Date.now() >= lock.expiresAt;
  }

  private startCleanup(): void {
    // Cleanup every 10 seconds
    this.cleanupTimer = setInterval(() => {
      this.cleanupExpiredLocks();
    }, 10000);
  }
}

export interface LockManagerOptions {
  lockTimeout?: number; // Lock timeout in milliseconds (default: 30000)
}

export interface NodeLock {
  nodeId: string;
  userId: string;
  userName: string;
  lockId: string;
  acquiredAt: number;
  expiresAt: number;
  renewCount: number;
  stolenFrom?: string; // User ID if lock was stolen
}

export interface LockResult {
  success: boolean;
  lock: NodeLock;
  reason:
    | 'granted'
    | 'renewed'
    | 'stolen_expired'
    | 'stolen_force'
    | 'locked_by_other'
    | 'lock_active_cannot_steal';
  previousOwner?: {
    userId: string;
    userName: string;
  };
  remainingTime?: number; // Milliseconds until lock expires (if denied)
}

export interface LockStats {
  totalLocks: number;
  expiredLocks: number;
  expiringLocks: number; // Locks expiring in < 5 seconds
  averageLockAge: number;
  oldestLockAge: number;
  totalRenewals: number;
}
