import type { Presence } from '../types';

export interface PresenceManagerOptions {
  timeout?: number;
}

export class PresenceManager {
  private presence: Map<string, Map<string, Presence>> = new Map();
  private lastActivity: Map<string, Map<string, Date>> = new Map();
  private timeout: number;

  constructor(options?: PresenceManagerOptions) {
    this.timeout = options?.timeout ?? 30000; // 30 seconds default
    this.startCleanupInterval();
  }

  addPresence(documentId: string, userId: string, presence: Presence): void {
    if (!this.presence.has(documentId)) {
      this.presence.set(documentId, new Map());
      this.lastActivity.set(documentId, new Map());
    }

    this.presence.get(documentId)!.set(userId, presence);
    this.lastActivity.get(documentId)!.set(userId, new Date());
  }

  updatePresence(
    documentId: string,
    userId: string,
    field: keyof Presence,
    value: unknown
  ): Presence | undefined {
    const docPresence = this.presence.get(documentId);
    if (!docPresence) return undefined;

    const userPresence = docPresence.get(userId);
    if (!userPresence) return undefined;

    // Update specific field
    (userPresence as unknown)[field] = value;

    // Update activity timestamp
    this.lastActivity.get(documentId)!.set(userId, new Date());

    return userPresence;
  }

  removePresence(documentId: string, userId: string): void {
    const docPresence = this.presence.get(documentId);
    if (docPresence) {
      docPresence.delete(userId);
      if (docPresence.size === 0) {
        this.presence.delete(documentId);
      }
    }

    const docActivity = this.lastActivity.get(documentId);
    if (docActivity) {
      docActivity.delete(userId);
      if (docActivity.size === 0) {
        this.lastActivity.delete(documentId);
      }
    }
  }

  getPresence(documentId: string): Presence[] {
    const docPresence = this.presence.get(documentId);
    if (!docPresence) return [];

    return Array.from(docPresence.values());
  }

  getUserPresence(documentId: string, userId: string): Presence | undefined {
    return this.presence.get(documentId)?.get(userId);
  }

  getActiveUsers(documentId: string): string[] {
    const docPresence = this.presence.get(documentId);
    if (!docPresence) return [];

    return Array.from(docPresence.keys());
  }

  private startCleanupInterval(): void {
    setInterval(() => {
      this.cleanupInactive();
    }, this.timeout / 2);
  }

  private cleanupInactive(): void {
    const now = Date.now();

    for (const [documentId, docActivity] of this.lastActivity) {
      const toRemove: string[] = [];

      for (const [userId, lastActive] of docActivity) {
        if (now - lastActive.getTime() > this.timeout) {
          toRemove.push(userId);
        }
      }

      toRemove.forEach((userId) => {
        this.removePresence(documentId, userId);
      });
    }
  }

  clear(): void {
    this.presence.clear();
    this.lastActivity.clear();
  }
}
