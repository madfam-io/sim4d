/**
 * Comprehensive tests for 2D constraint solver
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Solver2D } from './solver-2d';
import type { Point2D, Variable } from './types';

describe('Solver2D', () => {
  let solver: Solver2D;

  beforeEach(() => {
    solver = new Solver2D();
  });

  describe('Basic functionality', () => {
    it('should solve basic constraints', () => {
      const result = solver.solve();

      expect(result).toBeDefined();
      expect(result.success).toBeDefined();
      expect(result.iterations).toBeGreaterThanOrEqual(0);
      expect(result.residual).toBeGreaterThanOrEqual(0);
    });

    it('should handle empty constraint set', () => {
      const result = solver.solve();

      expect(result.success).toBe(true);
      expect(result.iterations).toBe(0);
      expect(result.residual).toBe(0);
    });

    it('should handle empty variable set', () => {
      solver.addConstraint({
        type: 'distance',
        entities: [],
        targetValue: 10,
      });

      const result = solver.solve();
      expect(result.success).toBe(true);
      expect(result.iterations).toBe(0);
    });
  });

  describe('Variable management', () => {
    it('should add and retrieve variables', () => {
      const v1: Variable = { id: 'x1', value: 5.0 };
      const v2: Variable = { id: 'x2', value: 10.0 };

      solver.addVariable(v1);
      solver.addVariable(v2);

      const values = solver.getVariableValues();
      expect(values['x1']).toBe(5.0);
      expect(values['x2']).toBe(10.0);
    });

    it('should set initial values for variables', () => {
      const v1: Variable = { id: 'x1', value: 0 };
      const v2: Variable = { id: 'x2', value: 0 };

      solver.addVariable(v1);
      solver.addVariable(v2);

      solver.setInitialValues({ x1: 3.5, x2: 7.2 });

      const values = solver.getVariableValues();
      expect(values['x1']).toBe(3.5);
      expect(values['x2']).toBe(7.2);
    });

    it('should clear all constraints and variables', () => {
      const v1: Variable = { id: 'x1', value: 5 };
      solver.addVariable(v1);
      solver.addConstraint({
        type: 'fixed',
        entities: [{ x: 5, y: 5 }],
      });

      solver.clear();

      const values = solver.getVariableValues();
      expect(Object.keys(values)).toHaveLength(0);
    });
  });

  describe('Distance constraints', () => {
    it('should solve distance constraint between two points', () => {
      const p1: Point2D = { x: 0, y: 0 };
      const p2: Point2D = { x: 3, y: 4 };

      solver.addConstraint({
        type: 'distance',
        entities: [p1, p2],
        targetValue: 5.0,
      });

      const result = solver.solve();
      expect(result.success).toBe(true);
    });

    it('should handle distance constraint with missing target value', () => {
      const p1: Point2D = { x: 1, y: 1 };
      const p2: Point2D = { x: 2, y: 2 };

      solver.addConstraint({
        type: 'distance',
        entities: [p1, p2],
      });

      const result = solver.solve();
      expect(result).toBeDefined();
    });
  });

  describe('Horizontal constraints', () => {
    it('should solve horizontal constraint', () => {
      const p1: Point2D = { x: 0, y: 5 };
      const p2: Point2D = { x: 10, y: 3 };

      solver.addConstraint({
        type: 'horizontal',
        entities: [p1, p2],
      });

      const result = solver.solve();
      expect(result.success).toBe(true);
    });

    it('should handle horizontal constraint with insufficient entities', () => {
      const p1: Point2D = { x: 0, y: 0 };

      solver.addConstraint({
        type: 'horizontal',
        entities: [p1],
      });

      const result = solver.solve();
      expect(result).toBeDefined();
    });
  });

  describe('Vertical constraints', () => {
    it('should solve vertical constraint', () => {
      const p1: Point2D = { x: 5, y: 0 };
      const p2: Point2D = { x: 3, y: 10 };

      solver.addConstraint({
        type: 'vertical',
        entities: [p1, p2],
      });

      const result = solver.solve();
      expect(result.success).toBe(true);
    });

    it('should handle vertical constraint with insufficient entities', () => {
      const p1: Point2D = { x: 0, y: 0 };

      solver.addConstraint({
        type: 'vertical',
        entities: [p1],
      });

      const result = solver.solve();
      expect(result).toBeDefined();
    });
  });

  describe('Coincident constraints', () => {
    it('should solve coincident constraint', () => {
      const p1: Point2D = { x: 5, y: 5 };
      const p2: Point2D = { x: 5.1, y: 4.9 };

      solver.addConstraint({
        type: 'coincident',
        entities: [p1, p2],
      });

      const result = solver.solve();
      expect(result.success).toBe(true);
    });
  });

  describe('Fixed constraints', () => {
    it('should solve fixed constraint with target position', () => {
      const p: Point2D = { x: 5, y: 5 };

      solver.addConstraint({
        type: 'fixed',
        entities: [p],
        targetValue: { x: 10, y: 10 },
      });

      const result = solver.solve();
      expect(result.success).toBe(true);
    });

    it('should handle fixed constraint without target value', () => {
      const p: Point2D = { x: 5, y: 5 };

      solver.addConstraint({
        type: 'fixed',
        entities: [p],
      });

      const result = solver.solve();
      expect(result).toBeDefined();
    });
  });

  describe('Complex constraint systems', () => {
    it('should solve multiple constraints together', () => {
      const p1: Point2D = { x: 0, y: 0 };
      const p2: Point2D = { x: 5, y: 0 };
      const p3: Point2D = { x: 5, y: 5 };

      solver.addConstraint({
        type: 'fixed',
        entities: [p1],
        targetValue: { x: 0, y: 0 },
      });

      solver.addConstraint({
        type: 'horizontal',
        entities: [p1, p2],
      });

      solver.addConstraint({
        type: 'vertical',
        entities: [p2, p3],
      });

      const result = solver.solve();
      expect(result.success).toBe(true);
    });

    it('should handle convergence within max iterations', () => {
      const p1: Point2D = { x: 0, y: 0 };
      const p2: Point2D = { x: 100, y: 100 };

      solver.addConstraint({
        type: 'distance',
        entities: [p1, p2],
        targetValue: 10,
      });

      const result = solver.solve();
      expect(result.iterations).toBeLessThanOrEqual(100);
    });
  });

  describe('Edge cases', () => {
    it('should handle unknown constraint type gracefully', () => {
      solver.addConstraint({
        type: 'unknown' as any,
        entities: [],
      });

      const result = solver.solve();
      expect(result).toBeDefined();
    });

    it('should handle constraint with no entities', () => {
      solver.addConstraint({
        type: 'distance',
        entities: [],
        targetValue: 5,
      });

      const result = solver.solve();
      expect(result).toBeDefined();
    });

    it('should return variables in result', () => {
      const v1: Variable = { id: 'test', value: 42 };
      solver.addVariable(v1);

      const result = solver.solve();
      expect(result.variables).toBeDefined();
      expect(result.variables['test']).toBeDefined();
    });
  });
});
