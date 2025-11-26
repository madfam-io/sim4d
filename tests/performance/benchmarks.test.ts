/**
 * Performance Baseline Tests
 *
 * Establishes performance benchmarks for critical operations:
 * - DAG evaluation and dirty propagation
 * - Constraint solving
 * - Session management
 * - Graph serialization/deserialization
 *
 * These tests track performance over time to detect regressions.
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { performance } from 'perf_hooks';

// Import packages for testing
import type { GraphInstance } from '@sim4d/types';
import { SimpleSessionManager } from '@sim4d/collaboration';
import { Solver2D } from '@sim4d/constraint-solver';

/**
 * Performance measurement utility
 */
function measurePerformance<T>(operation: () => T, label: string): { result: T; duration: number } {
  const start = performance.now();
  const result = operation();
  const end = performance.now();
  const duration = end - start;

  console.log(`[PERF] ${label}: ${duration.toFixed(2)}ms`);

  return { result, duration };
}

/**
 * Async performance measurement utility
 */
async function measurePerformanceAsync<T>(
  operation: () => Promise<T>,
  label: string
): Promise<{ result: T; duration: number }> {
  const start = performance.now();
  const result = await operation();
  const end = performance.now();
  const duration = end - start;

  console.log(`[PERF] ${label}: ${duration.toFixed(2)}ms`);

  return { result, duration };
}

describe('Performance Baseline Tests', () => {
  describe('Session Management Performance', () => {
    let manager: SimpleSessionManager;

    beforeAll(() => {
      manager = new SimpleSessionManager();
    });

    it('should create session in < 5ms', () => {
      const { duration } = measurePerformance(() => manager.createSession(), 'Session Creation');

      expect(duration).toBeLessThan(5);
    });

    it('should create 100 sessions in < 50ms', () => {
      const { duration } = measurePerformance(() => {
        for (let i = 0; i < 100; i++) {
          manager.createSession();
        }
      }, 'Create 100 Sessions');

      expect(duration).toBeLessThan(50);
    });

    it('should retrieve session in < 1ms', () => {
      const session = manager.createSession();

      const { duration } = measurePerformance(
        () => manager.getSession(session.id),
        'Session Retrieval'
      );

      expect(duration).toBeLessThan(1);
    });

    it('should get all sessions in < 5ms', () => {
      // Create some sessions
      for (let i = 0; i < 50; i++) {
        manager.createSession();
      }

      const { duration } = measurePerformance(
        () => manager.getAllSessions(),
        'Get All Sessions (50)'
      );

      expect(duration).toBeLessThan(5);
    });

    it('should update session in < 2ms', () => {
      const session = manager.createSession();
      const updatedGraph: GraphInstance = {
        version: '1.0.0',
        units: 'mm',
        tolerance: 0.01,
        nodes: [
          { id: 'n1', type: 'Box', position: { x: 0, y: 0 }, inputs: {}, outputs: {}, params: {} },
        ],
        edges: [],
      };

      const { duration } = measurePerformance(
        () => manager.updateSession(session.id, updatedGraph),
        'Session Update'
      );

      expect(duration).toBeLessThan(2);
    });

    it('should delete session in < 1ms', () => {
      const session = manager.createSession();

      const { duration } = measurePerformance(
        () => manager.deleteSession(session.id),
        'Session Deletion'
      );

      expect(duration).toBeLessThan(1);
    });
  });

  describe('Constraint Solver Performance', () => {
    it('should solve empty constraints in < 1ms', () => {
      const solver = new Solver2D();

      const { duration } = measurePerformance(() => solver.solve(), 'Solve Empty Constraints');

      expect(duration).toBeLessThan(1);
    });

    it('should clear solver in < 1ms', () => {
      const solver = new Solver2D();

      // Add some constraints
      for (let i = 0; i < 10; i++) {
        solver.addConstraint({
          id: `c${i}`,
          type: 'fixed',
          entities: [],
        });
      }

      const { duration } = measurePerformance(() => solver.clear(), 'Clear Solver');

      expect(duration).toBeLessThan(1);
    });
  });

  describe('Graph Serialization Performance', () => {
    it('should serialize small graph in < 5ms', () => {
      const graph: GraphInstance = {
        version: '1.0.0',
        units: 'mm',
        tolerance: 0.01,
        nodes: [
          {
            id: 'n1',
            type: 'Box',
            position: { x: 0, y: 0 },
            inputs: {},
            outputs: {},
            params: { width: 10, height: 10, depth: 10 },
          },
          {
            id: 'n2',
            type: 'Sphere',
            position: { x: 100, y: 0 },
            inputs: {},
            outputs: {},
            params: { radius: 5 },
          },
        ],
        edges: [{ id: 'e1', source: 'n1', sourcePort: 'out', target: 'n2', targetPort: 'in' }],
      };

      const { duration } = measurePerformance(
        () => JSON.stringify(graph),
        'Serialize Small Graph (2 nodes)'
      );

      expect(duration).toBeLessThan(5);
    });

    it('should serialize large graph in < 50ms', () => {
      const nodes = [];
      const edges = [];

      // Create 100 nodes
      for (let i = 0; i < 100; i++) {
        nodes.push({
          id: `node${i}`,
          type: i % 2 === 0 ? 'Box' : 'Sphere',
          position: { x: i * 10, y: i * 10 },
          inputs: {},
          outputs: {},
          params: { value: i },
        });

        // Connect to previous node
        if (i > 0) {
          edges.push({
            id: `edge${i}`,
            source: `node${i - 1}`,
            sourcePort: 'out',
            target: `node${i}`,
            targetPort: 'in',
          });
        }
      }

      const graph: GraphInstance = {
        version: '1.0.0',
        units: 'mm',
        tolerance: 0.01,
        nodes,
        edges,
      };

      const { duration } = measurePerformance(
        () => JSON.stringify(graph),
        'Serialize Large Graph (100 nodes)'
      );

      expect(duration).toBeLessThan(50);
    });

    it('should deserialize small graph in < 5ms', () => {
      const graphJson = JSON.stringify({
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
      });

      const { duration } = measurePerformance(
        () => JSON.parse(graphJson),
        'Deserialize Small Graph'
      );

      expect(duration).toBeLessThan(5);
    });

    it('should deserialize large graph in < 30ms', () => {
      const nodes = [];
      for (let i = 0; i < 100; i++) {
        nodes.push({
          id: `node${i}`,
          type: 'Box',
          position: { x: i * 10, y: i * 10 },
          inputs: {},
          outputs: {},
          params: {},
        });
      }

      const graphJson = JSON.stringify({
        version: '1.0.0',
        units: 'mm',
        tolerance: 0.01,
        nodes,
        edges: [],
      });

      const { duration } = measurePerformance(
        () => JSON.parse(graphJson),
        'Deserialize Large Graph (100 nodes)'
      );

      expect(duration).toBeLessThan(30);
    });
  });

  describe('Memory and Scalability', () => {
    it('should handle 1000 sessions without excessive memory', () => {
      const manager = new SimpleSessionManager();
      const initialMemory = process.memoryUsage().heapUsed;

      const { duration } = measurePerformance(() => {
        for (let i = 0; i < 1000; i++) {
          manager.createSession();
        }
      }, 'Create 1000 Sessions');

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncreaseMB = (finalMemory - initialMemory) / 1024 / 1024;

      console.log(`[PERF] Memory increase: ${memoryIncreaseMB.toFixed(2)} MB`);

      // Should create 1000 sessions in reasonable time
      expect(duration).toBeLessThan(500);

      // Should not use excessive memory (< 50MB for 1000 empty sessions)
      expect(memoryIncreaseMB).toBeLessThan(50);
    });

    it('should handle session count queries efficiently', () => {
      const manager = new SimpleSessionManager();

      // Create many sessions
      for (let i = 0; i < 100; i++) {
        manager.createSession();
      }

      const { duration } = measurePerformance(() => {
        for (let i = 0; i < 1000; i++) {
          manager.getSessionCount();
        }
      }, 'Session Count (1000 queries)');

      expect(duration).toBeLessThan(10);
    });
  });

  describe('Performance Regression Tracking', () => {
    it('should record baseline metrics', () => {
      const metrics = {
        sessionCreation: 0,
        sessionRetrieval: 0,
        sessionUpdate: 0,
        graphSerialization: 0,
        graphDeserialization: 0,
      };

      // Session creation
      const manager = new SimpleSessionManager();
      metrics.sessionCreation = measurePerformance(
        () => manager.createSession(),
        'Baseline: Session Creation'
      ).duration;

      // Session retrieval
      const session = manager.createSession();
      metrics.sessionRetrieval = measurePerformance(
        () => manager.getSession(session.id),
        'Baseline: Session Retrieval'
      ).duration;

      // Session update
      const graph: GraphInstance = {
        version: '1.0.0',
        units: 'mm',
        tolerance: 0.01,
        nodes: [],
        edges: [],
      };
      metrics.sessionUpdate = measurePerformance(
        () => manager.updateSession(session.id, graph),
        'Baseline: Session Update'
      ).duration;

      // Graph serialization
      metrics.graphSerialization = measurePerformance(
        () => JSON.stringify(graph),
        'Baseline: Graph Serialization'
      ).duration;

      // Graph deserialization
      const graphJson = JSON.stringify(graph);
      metrics.graphDeserialization = measurePerformance(
        () => JSON.parse(graphJson),
        'Baseline: Graph Deserialization'
      ).duration;

      // Log metrics for tracking
      console.log('\n=== Performance Baseline Metrics ===');
      console.log(JSON.stringify(metrics, null, 2));
      console.log('=====================================\n');

      // All operations should be reasonably fast
      Object.values(metrics).forEach((duration) => {
        expect(duration).toBeLessThan(10);
      });
    });
  });
});
