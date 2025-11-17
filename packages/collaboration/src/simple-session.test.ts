/**
 * Comprehensive tests for SimpleSessionManager
 *
 * Tests cover:
 * - Session creation and retrieval
 * - Session updates and deletion
 * - Session lifecycle and expiration
 * - Session summaries and queries
 * - Edge cases and error conditions
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { SimpleSessionManager } from './simple-session';
import type { GraphInstance } from '@brepflow/types';

describe('SimpleSessionManager - Comprehensive Tests', () => {
  let manager: SimpleSessionManager;

  beforeEach(() => {
    manager = new SimpleSessionManager();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('Session Creation', () => {
    it('should create session with empty graph', () => {
      const session = manager.createSession();

      expect(session).toBeDefined();
      expect(session.id).toBeTruthy();
      expect(session.graph).toBeDefined();
      expect(session.graph.nodes).toEqual([]);
      expect(session.graph.edges).toEqual([]);
      expect(session.created).toBeGreaterThan(0);
      expect(session.lastAccess).toBe(session.created);
      expect(session.lastModified).toBe(session.created);
    });

    it('should create session with provided graph', () => {
      const customGraph: GraphInstance = {
        version: '1.0.0',
        units: 'cm',
        tolerance: 0.001,
        nodes: [
          {
            id: 'node1',
            type: 'Box',
            position: { x: 0, y: 0 },
            inputs: {},
            outputs: {},
            params: {},
          },
        ],
        edges: [],
      };

      const session = manager.createSession(customGraph);

      expect(session.graph).toEqual(customGraph);
      expect(session.graph.nodes.length).toBe(1);
      expect(session.graph.units).toBe('cm');
    });

    it('should generate unique session IDs', () => {
      const session1 = manager.createSession();
      const session2 = manager.createSession();

      expect(session1.id).not.toBe(session2.id);
    });

    it('should initialize timestamps correctly', () => {
      const beforeCreate = Date.now();
      const session = manager.createSession();
      const afterCreate = Date.now();

      expect(session.created).toBeGreaterThanOrEqual(beforeCreate);
      expect(session.created).toBeLessThanOrEqual(afterCreate);
      expect(session.lastAccess).toBe(session.created);
      expect(session.lastModified).toBe(session.created);
    });
  });

  describe('Session Retrieval', () => {
    it('should retrieve existing session', () => {
      const created = manager.createSession();
      const retrieved = manager.getSession(created.id);

      expect(retrieved).not.toBeNull();
      expect(retrieved?.id).toBe(created.id);
      expect(retrieved?.graph).toEqual(created.graph);
    });

    it('should return null for non-existent session', () => {
      const retrieved = manager.getSession('non-existent-id');

      expect(retrieved).toBeNull();
    });

    it('should update lastAccess time on retrieval', () => {
      const session = manager.createSession();
      const originalAccess = session.lastAccess;

      // Advance time
      vi.advanceTimersByTime(5000);

      const retrieved = manager.getSession(session.id);

      expect(retrieved?.lastAccess).toBeGreaterThan(originalAccess);
    });

    it('should check if session exists', () => {
      const session = manager.createSession();

      expect(manager.hasSession(session.id)).toBe(true);
      expect(manager.hasSession('non-existent')).toBe(false);
    });
  });

  describe('Session Updates', () => {
    it('should update session graph', () => {
      const session = manager.createSession();
      const originalModified = session.lastModified;

      const updatedGraph: GraphInstance = {
        version: '1.0.0',
        units: 'mm',
        tolerance: 0.01,
        nodes: [
          {
            id: 'node1',
            type: 'Sphere',
            position: { x: 0, y: 0 },
            inputs: {},
            outputs: {},
            params: {},
          },
        ],
        edges: [],
      };

      // Advance time
      vi.advanceTimersByTime(1000);

      const success = manager.updateSession(session.id, updatedGraph);
      const retrieved = manager.getSession(session.id);

      expect(success).toBe(true);
      expect(retrieved?.graph).toEqual(updatedGraph);
      expect(retrieved?.lastModified).toBeGreaterThan(originalModified);
      expect(retrieved?.lastAccess).toBeGreaterThan(originalModified);
    });

    it('should fail to update non-existent session', () => {
      const graph: GraphInstance = {
        version: '1.0.0',
        units: 'mm',
        tolerance: 0.01,
        nodes: [],
        edges: [],
      };

      const success = manager.updateSession('non-existent', graph);

      expect(success).toBe(false);
    });

    it('should preserve session ID and timestamps on update', () => {
      const session = manager.createSession();
      const originalId = session.id;
      const originalCreated = session.created;

      const updatedGraph: GraphInstance = {
        version: '1.0.0',
        units: 'mm',
        tolerance: 0.01,
        nodes: [
          { id: 'new', type: 'Box', position: { x: 0, y: 0 }, inputs: {}, outputs: {}, params: {} },
        ],
        edges: [],
      };

      manager.updateSession(session.id, updatedGraph);
      const retrieved = manager.getSession(session.id);

      expect(retrieved?.id).toBe(originalId);
      expect(retrieved?.created).toBe(originalCreated);
    });
  });

  describe('Session Deletion', () => {
    it('should delete existing session', () => {
      const session = manager.createSession();

      const deleted = manager.deleteSession(session.id);
      const retrieved = manager.getSession(session.id);

      expect(deleted).toBe(true);
      expect(retrieved).toBeNull();
    });

    it('should return false when deleting non-existent session', () => {
      const deleted = manager.deleteSession('non-existent');

      expect(deleted).toBe(false);
    });

    it('should decrement session count after deletion', () => {
      const session1 = manager.createSession();
      const session2 = manager.createSession();

      expect(manager.getSessionCount()).toBe(2);

      manager.deleteSession(session1.id);

      expect(manager.getSessionCount()).toBe(1);
      expect(manager.hasSession(session2.id)).toBe(true);
    });
  });

  describe('Session Summaries', () => {
    it('should return session summary', () => {
      const customGraph: GraphInstance = {
        version: '1.0.0',
        units: 'mm',
        tolerance: 0.01,
        nodes: [
          { id: 'n1', type: 'Box', position: { x: 0, y: 0 }, inputs: {}, outputs: {}, params: {} },
          {
            id: 'n2',
            type: 'Sphere',
            position: { x: 100, y: 0 },
            inputs: {},
            outputs: {},
            params: {},
          },
        ],
        edges: [],
      };

      const session = manager.createSession(customGraph);
      const summary = manager.getSessionSummary(session.id);

      expect(summary).not.toBeNull();
      expect(summary?.id).toBe(session.id);
      expect(summary?.nodeCount).toBe(2);
      expect(summary?.created).toBe(session.created);
    });

    it('should return null summary for non-existent session', () => {
      const summary = manager.getSessionSummary('non-existent');

      expect(summary).toBeNull();
    });

    it('should get all session summaries', () => {
      manager.createSession();
      manager.createSession();
      manager.createSession();

      const allSessions = manager.getAllSessions();

      expect(allSessions.length).toBe(3);
      expect(allSessions[0]).toHaveProperty('id');
      expect(allSessions[0]).toHaveProperty('nodeCount');
      expect(allSessions[0]).not.toHaveProperty('graph'); // Summary shouldn't include full graph
    });

    it('should return empty array when no sessions exist', () => {
      const allSessions = manager.getAllSessions();

      expect(allSessions).toEqual([]);
    });

    it('should accurately count nodes in summary', () => {
      const graph: GraphInstance = {
        version: '1.0.0',
        units: 'mm',
        tolerance: 0.01,
        nodes: [
          { id: 'n1', type: 'Box', position: { x: 0, y: 0 }, inputs: {}, outputs: {}, params: {} },
          {
            id: 'n2',
            type: 'Sphere',
            position: { x: 0, y: 0 },
            inputs: {},
            outputs: {},
            params: {},
          },
          {
            id: 'n3',
            type: 'Cylinder',
            position: { x: 0, y: 0 },
            inputs: {},
            outputs: {},
            params: {},
          },
        ],
        edges: [],
      };

      const session = manager.createSession(graph);
      const summary = manager.getSessionSummary(session.id);

      expect(summary?.nodeCount).toBe(3);
    });
  });

  describe('Session Count', () => {
    it('should track session count correctly', () => {
      expect(manager.getSessionCount()).toBe(0);

      manager.createSession();
      expect(manager.getSessionCount()).toBe(1);

      manager.createSession();
      manager.createSession();
      expect(manager.getSessionCount()).toBe(3);
    });

    it('should decrement count after deletion', () => {
      const s1 = manager.createSession();
      const s2 = manager.createSession();

      expect(manager.getSessionCount()).toBe(2);

      manager.deleteSession(s1.id);
      expect(manager.getSessionCount()).toBe(1);

      manager.deleteSession(s2.id);
      expect(manager.getSessionCount()).toBe(0);
    });
  });
});
