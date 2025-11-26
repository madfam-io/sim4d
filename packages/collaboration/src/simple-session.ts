/**
 * Simple Session Management
 *
 * Minimal session system for MVP - no authentication required
 * Sessions are temporary (24h lifetime) and stored in-memory
 */

import { v4 as uuidv4 } from 'uuid';
import type { GraphInstance } from '@sim4d/types';

export interface Session {
  id: string;
  graph: GraphInstance;
  created: number;
  lastAccess: number;
  lastModified: number;
}

export interface SessionSummary {
  id: string;
  created: number;
  lastAccess: number;
  lastModified: number;
  nodeCount: number;
}

/**
 * Simple in-memory session store
 * For MVP - no persistence, no authentication
 */
export class SimpleSessionManager {
  private sessions = new Map<string, Session>();
  private readonly SESSION_LIFETIME_MS = 24 * 60 * 60 * 1000; // 24 hours
  private readonly CLEANUP_INTERVAL_MS = 60 * 60 * 1000; // 1 hour

  constructor() {
    // Start periodic cleanup
    this.startCleanupTimer();
  }

  /**
   * Create new session with empty or provided graph
   */
  createSession(graph?: GraphInstance): Session {
    const sessionId = uuidv4();
    const now = Date.now();

    const session: Session = {
      id: sessionId,
      graph: graph || this.createEmptyGraph(),
      created: now,
      lastAccess: now,
      lastModified: now,
    };

    this.sessions.set(sessionId, session);

    // Schedule auto-cleanup
    setTimeout(() => {
      this.sessions.delete(sessionId);
    }, this.SESSION_LIFETIME_MS);

    return session;
  }

  /**
   * Get session by ID
   */
  getSession(sessionId: string): Session | null {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return null;
    }

    // Update last access time
    session.lastAccess = Date.now();
    return session;
  }

  /**
   * Update session graph
   */
  updateSession(sessionId: string, graph: GraphInstance): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return false;
    }

    session.graph = graph;
    session.lastAccess = Date.now();
    session.lastModified = Date.now();
    return true;
  }

  /**
   * Delete session
   */
  deleteSession(sessionId: string): boolean {
    return this.sessions.delete(sessionId);
  }

  /**
   * Get session summary (without full graph)
   */
  getSessionSummary(sessionId: string): SessionSummary | null {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return null;
    }

    return {
      id: session.id,
      created: session.created,
      lastAccess: session.lastAccess,
      lastModified: session.lastModified,
      nodeCount: session.graph.nodes.length,
    };
  }

  /**
   * Get all sessions (for admin/debugging)
   */
  getAllSessions(): SessionSummary[] {
    return Array.from(this.sessions.values()).map((session) => ({
      id: session.id,
      created: session.created,
      lastAccess: session.lastAccess,
      lastModified: session.lastModified,
      nodeCount: session.graph.nodes.length,
    }));
  }

  /**
   * Check if session exists
   */
  hasSession(sessionId: string): boolean {
    return this.sessions.has(sessionId);
  }

  /**
   * Get session count
   */
  getSessionCount(): number {
    return this.sessions.size;
  }

  /**
   * Clean up expired sessions
   */
  private cleanupExpiredSessions(): void {
    const now = Date.now();
    const expiredSessions: string[] = [];

    for (const [id, session] of this.sessions.entries()) {
      if (now - session.lastAccess > this.SESSION_LIFETIME_MS) {
        expiredSessions.push(id);
      }
    }

    expiredSessions.forEach((id) => this.sessions.delete(id));
  }

  /**
   * Start periodic cleanup timer
   */
  private startCleanupTimer(): void {
    setInterval(() => {
      this.cleanupExpiredSessions();
    }, this.CLEANUP_INTERVAL_MS);
  }

  /**
   * Create empty graph template
   */
  private createEmptyGraph(): GraphInstance {
    return {
      version: '0.1.0',
      units: 'mm',
      tolerance: 0.01,
      nodes: [],
      edges: [],
    };
  }
}

/**
 * Singleton session manager instance
 */
export const sessionManager = new SimpleSessionManager();
