import { v4 as uuidv4 } from 'uuid';
import type { Session } from '../types';

export class SessionManager {
  private sessions: Map<string, Session> = new Map();
  private connectionToSession: Map<string, string> = new Map();
  private userSessions: Map<string, Set<string>> = new Map();

  createSession(params: { userId: string; documentId: string; connectionId: string }): Session {
    const session: Session = {
      id: uuidv4(),
      userId: params.userId,
      documentId: params.documentId,
      connectionId: params.connectionId,
      joinedAt: new Date(),
      lastActivity: new Date(),
    };

    this.sessions.set(session.id, session);
    this.connectionToSession.set(params.connectionId, session.id);

    // Track user sessions
    if (!this.userSessions.has(params.userId)) {
      this.userSessions.set(params.userId, new Set());
    }
    this.userSessions.get(params.userId)!.add(session.id);

    return session;
  }

  getSession(sessionId: string): Session | undefined {
    return this.sessions.get(sessionId);
  }

  getSessionByConnectionId(connectionId: string): Session | undefined {
    const sessionId = this.connectionToSession.get(connectionId);
    return sessionId ? this.sessions.get(sessionId) : undefined;
  }

  getUserSessions(userId: string): Session[] {
    const sessionIds = this.userSessions.get(userId);
    if (!sessionIds) return [];

    return Array.from(sessionIds)
      .map((id) => this.sessions.get(id))
      .filter((session): session is Session => session !== undefined);
  }

  getDocumentSessions(documentId: string): Session[] {
    return Array.from(this.sessions.values()).filter(
      (session) => session.documentId === documentId
    );
  }

  updateActivity(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.lastActivity = new Date();
    }
  }

  removeSession(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    // Remove from all maps
    this.sessions.delete(sessionId);
    this.connectionToSession.delete(session.connectionId);

    const userSessionIds = this.userSessions.get(session.userId);
    if (userSessionIds) {
      userSessionIds.delete(sessionId);
      if (userSessionIds.size === 0) {
        this.userSessions.delete(session.userId);
      }
    }
  }

  removeInactiveSessions(maxInactiveMs: number = 30 * 60 * 1000): void {
    const now = Date.now();
    const toRemove: string[] = [];

    for (const [id, session] of this.sessions) {
      if (now - session.lastActivity.getTime() > maxInactiveMs) {
        toRemove.push(id);
      }
    }

    toRemove.forEach((id) => this.removeSession(id));
  }

  getAllSessions(): Session[] {
    return Array.from(this.sessions.values());
  }

  clear(): void {
    this.sessions.clear();
    this.connectionToSession.clear();
    this.userSessions.clear();
  }
}
