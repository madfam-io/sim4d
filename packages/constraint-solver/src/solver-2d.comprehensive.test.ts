/**
 * Comprehensive tests for 2D constraint solver
 *
 * Tests cover:
 * - Basic constraint types (distance, horizontal, vertical)
 * - Variable management
 * - Solver convergence
 * - Edge cases and error conditions
 * - Multiple constraint interactions
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Solver2D } from './solver-2d';
import type { Point2D, Variable, Constraint2D } from './types';

/**
 * Helper function to create a solver-compatible point entity
 * Converts simple Point2D to entity with params and fixed arrays
 */
function createPointEntity(id: string, x: number, y: number, fixed: boolean = false) {
  return {
    id,
    type: 'point' as const,
    params: [x, y],
    fixed: [fixed, fixed],
  };
}

describe('Solver2D - Comprehensive Tests', () => {
  let solver: Solver2D;

  beforeEach(() => {
    solver = new Solver2D();
  });

  describe('Variable Management', () => {
    it('should add and retrieve variables', () => {
      const variable: Variable = {
        id: 'var1',
        value: 10,
        type: 'x',
      };

      solver.addVariable(variable);
      const values = solver.getVariableValues();

      expect(values['var1']).toBe(10);
    });

    it('should handle multiple variables', () => {
      const vars: Variable[] = [
        { id: 'x1', value: 5, type: 'x' },
        { id: 'y1', value: 10, type: 'y' },
        { id: 'x2', value: 15, type: 'x' },
      ];

      vars.forEach((v) => solver.addVariable(v));
      const values = solver.getVariableValues();

      expect(values['x1']).toBe(5);
      expect(values['y1']).toBe(10);
      expect(values['x2']).toBe(15);
    });

    it('should update initial variable values', () => {
      const variable: Variable = {
        id: 'test',
        value: 0,
        type: 'x',
      };

      solver.addVariable(variable);
      solver.setInitialValues({ test: 100 });
      const values = solver.getVariableValues();

      expect(values['test']).toBe(100);
    });

    it('should ignore invalid variable IDs in setInitialValues', () => {
      const variable: Variable = {
        id: 'valid',
        value: 5,
        type: 'x',
      };

      solver.addVariable(variable);
      solver.setInitialValues({ valid: 10, invalid: 999 });
      const values = solver.getVariableValues();

      expect(values['valid']).toBe(10);
      expect(values['invalid']).toBeUndefined();
    });

    it('should clear all variables and constraints', () => {
      const variable: Variable = { id: 'test', value: 10, type: 'x' };
      const constraint: Constraint2D = {
        id: 'c1',
        type: 'fixed',
        entities: [],
      };

      solver.addVariable(variable);
      solver.addConstraint(constraint);
      solver.clear();

      const values = solver.getVariableValues();
      expect(Object.keys(values).length).toBe(0);
    });
  });

  describe('Distance Constraints', () => {
    it('should solve distance constraint between two points', () => {
      const p1 = createPointEntity('p1', 0, 0);
      const p2 = createPointEntity('p2', 3, 4);

      solver.addEntity(p1);
      solver.addEntity(p2);

      const constraint: Constraint2D = {
        id: 'dist1',
        type: 'distance',
        entities: ['p1', 'p2'],
        targetValue: 5, // Distance should be 5 (already is: 3-4-5 triangle)
      };

      solver.addConstraint(constraint);
      const result = solver.solve();

      expect(result.success).toBe(true);
      expect(result.iterations).toBeGreaterThanOrEqual(0);
      expect(result.residual).toBeLessThanOrEqual(1e-6);
    });

    it('should handle zero distance constraint', () => {
      const p1 = createPointEntity('p1', 0, 0);
      const p2 = createPointEntity('p2', 0, 0);

      solver.addEntity(p1);
      solver.addEntity(p2);

      const constraint: Constraint2D = {
        id: 'dist1',
        type: 'distance',
        entities: ['p1', 'p2'],
        targetValue: 0,
      };

      solver.addConstraint(constraint);
      const result = solver.solve();

      expect(result.success).toBe(true);
      expect(result.residual).toBeLessThanOrEqual(1e-6);
    });

    it('should handle distance constraint with insufficient entities', () => {
      const p1 = createPointEntity('p1', 0, 0);

      solver.addEntity(p1);

      const constraint: Constraint2D = {
        id: 'dist1',
        type: 'distance',
        entities: ['p1'], // Only one point - should not crash
        targetValue: 10,
      };

      solver.addConstraint(constraint);
      const result = solver.solve();

      // Should complete without crashing
      expect(result).toBeDefined();
      expect(result.iterations).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Horizontal and Vertical Constraints', () => {
    it('should solve horizontal constraint', () => {
      const p1 = createPointEntity('p1', 0, 5);
      const p2 = createPointEntity('p2', 10, 5);

      solver.addEntity(p1);
      solver.addEntity(p2);

      const constraint: Constraint2D = {
        id: 'horiz1',
        type: 'horizontal',
        entities: ['p1', 'p2'],
      };

      solver.addConstraint(constraint);
      const result = solver.solve();

      expect(result.success).toBe(true);
      expect(result.residual).toBeLessThanOrEqual(1e-6);
    });

    it('should solve vertical constraint', () => {
      const p1 = createPointEntity('p1', 5, 0);
      const p2 = createPointEntity('p2', 5, 10);

      solver.addEntity(p1);
      solver.addEntity(p2);

      const constraint: Constraint2D = {
        id: 'vert1',
        type: 'vertical',
        entities: ['p1', 'p2'],
      };

      solver.addConstraint(constraint);
      const result = solver.solve();

      expect(result.success).toBe(true);
      expect(result.residual).toBeLessThanOrEqual(1e-6);
    });

    it('should handle horizontal constraint with insufficient entities', () => {
      const p1 = createPointEntity('p1', 0, 0);

      const constraint: Constraint2D = {
        id: 'horiz1',
        type: 'horizontal',
        entities: [p1], // Only one point
      };

      solver.addConstraint(constraint);
      const result = solver.solve();

      // Should complete without crashing
      expect(result).toBeDefined();
    });
  });

  describe('Solver Behavior', () => {
    it('should handle empty constraint set', () => {
      const result = solver.solve();

      expect(result.success).toBe(true);
      expect(result.iterations).toBe(0);
      expect(result.residual).toBe(0);
      expect(result.variables).toEqual({});
    });

    it('should handle constraints with no variables', () => {
      const p1 = createPointEntity('p1', 0, 0);
      const p2 = createPointEntity('p2', 1, 0);

      const constraint: Constraint2D = {
        id: 'dist1',
        type: 'distance',
        entities: [p1, p2],
        targetValue: 1,
      };

      solver.addConstraint(constraint);
      const result = solver.solve();

      // With no variables, should return early success
      expect(result.success).toBe(true);
      expect(result.iterations).toBe(0);
    });

    it('should respect maximum iterations limit', () => {
      // Create an unsolvable or very difficult constraint system
      const p1 = createPointEntity('p1', 0, 0);
      const p2 = createPointEntity('p2', 100, 100);

      const constraint: Constraint2D = {
        id: 'dist1',
        type: 'distance',
        entities: [p1, p2],
        targetValue: 0.001, // Very small target distance - hard to achieve
      };

      solver.addConstraint(constraint);
      const result = solver.solve();

      // Should terminate within reasonable iterations (MAX_ITERATIONS = 100)
      expect(result.iterations).toBeLessThanOrEqual(100);
    });

    it('should return all variables in result', () => {
      const vars: Variable[] = [
        { id: 'x1', value: 5, type: 'x' },
        { id: 'y1', value: 10, type: 'y' },
      ];

      vars.forEach((v) => solver.addVariable(v));
      const result = solver.solve();

      expect(result.variables).toHaveProperty('x1');
      expect(result.variables).toHaveProperty('y1');
      expect(Object.keys(result.variables).length).toBe(2);
    });
  });

  describe('Edge Cases', () => {
    it('should handle constraint with missing targetValue', () => {
      const p1 = createPointEntity('p1', 0, 0);
      const p2 = createPointEntity('p2', 5, 0);

      solver.addEntity(p1);
      solver.addEntity(p2);

      const constraint: Constraint2D = {
        id: 'dist1',
        type: 'distance',
        entities: ['p1', 'p2'],
        // No targetValue - should default to 0
      };

      solver.addConstraint(constraint);
      const result = solver.solve();

      expect(result).toBeDefined();
      expect(result.success).toBeDefined();
    });

    it('should handle negative distance target', () => {
      const p1 = createPointEntity('p1', 0, 0);
      const p2 = createPointEntity('p2', 5, 0);

      solver.addEntity(p1);
      solver.addEntity(p2);

      const constraint: Constraint2D = {
        id: 'dist1',
        type: 'distance',
        entities: ['p1', 'p2'],
        targetValue: -10, // Negative distance
      };

      solver.addConstraint(constraint);
      const result = solver.solve();

      // Should handle gracefully (distance is always positive)
      expect(result).toBeDefined();
      expect(result.iterations).toBeGreaterThanOrEqual(0);
    });

    it('should handle very large coordinate values', () => {
      const p1 = createPointEntity('p1', 1e10, 1e10);
      const p2 = createPointEntity('p2', 1e10 + 5, 1e10);

      solver.addEntity(p1);
      solver.addEntity(p2);

      const constraint: Constraint2D = {
        id: 'dist1',
        type: 'distance',
        entities: ['p1', 'p2'],
        targetValue: 5,
      };

      solver.addConstraint(constraint);
      const result = solver.solve();

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });
  });
});
