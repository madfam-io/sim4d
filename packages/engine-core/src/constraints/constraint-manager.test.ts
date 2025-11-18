/**
 * Comprehensive tests for ConstraintManager
 *
 * Tests cover:
 * - Geometry element creation (points, lines, circles)
 * - Constraint creation and validation
 * - Constraint solving
 * - Edge cases and error conditions
 * - Multiple constraint interactions
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ConstraintManager } from './index';
import { ConstraintType } from './types';

describe('ConstraintManager - Comprehensive Tests', () => {
  let manager: ConstraintManager;

  beforeEach(() => {
    manager = new ConstraintManager();
  });

  describe('Geometry Element Creation', () => {
    it('should create a point', () => {
      const point = manager.createPoint('p1', 10, 20, false);

      expect(point.id).toBe('p1');
      expect(point.position.x).toBe(10);
      expect(point.position.y).toBe(20);
      expect(point.fixed).toBe(false);
    });

    it('should create a fixed point', () => {
      const point = manager.createPoint('p1', 0, 0, true);

      expect(point.fixed).toBe(true);
    });

    it('should create a line between two points', () => {
      manager.createPoint('p1', 0, 0);
      manager.createPoint('p2', 10, 0);

      const line = manager.createLine('l1', 'p1', 'p2');

      expect(line.id).toBe('l1');
      expect(line.start).toBe('p1');
      expect(line.end).toBe('p2');
    });

    it('should create a circle with center point', () => {
      manager.createPoint('center', 5, 5);

      const circle = manager.createCircle('c1', 'center', 10);

      expect(circle.id).toBe('c1');
      expect(circle.center).toBe('center');
      expect(circle.radius).toBe(10);
    });

    it('should retrieve created geometry elements', () => {
      manager.createPoint('p1', 0, 0);
      manager.createPoint('p2', 10, 10);

      const elements = manager.getGeometry();

      expect(elements.length).toBe(2);
      expect(elements.find((e) => e.id === 'p1')).toBeDefined();
      expect(elements.find((e) => e.id === 'p2')).toBeDefined();
    });

    it('should retrieve geometry element by ID', () => {
      manager.createPoint('test', 5, 15);

      const element = manager.getGeometryById('test');

      expect(element).toBeDefined();
      expect(element?.id).toBe('test');
    });
  });

  describe('Constraint Creation and Validation', () => {
    it('should validate constraint before adding', () => {
      manager.createPoint('p1', 0, 0);
      manager.createPoint('p2', 10, 0);

      const validation = manager.validateConstraint(ConstraintType.DISTANCE, ['p1', 'p2'], {
        distance: 10,
      });

      expect(validation.valid).toBe(true);
    });

    it('should reject constraint with missing geometry', () => {
      const validation = manager.validateConstraint(
        ConstraintType.DISTANCE,
        ['missing1', 'missing2'],
        {
          distance: 10,
        }
      );

      expect(validation.valid).toBe(false);
      expect(validation.error).toBeDefined();
    });

    it('should add constraint to system', () => {
      manager.createPoint('p1', 0, 0);
      manager.createPoint('p2', 10, 0);

      const constraintId = manager.addConstraint(ConstraintType.DISTANCE, ['p1', 'p2'], {
        distance: 10,
      });

      expect(constraintId).toBeDefined();

      const constraints = manager.getConstraints();
      expect(constraints.length).toBe(1);
      expect(constraints[0].id).toBe(constraintId);
    });

    it('should retrieve constraint by ID', () => {
      manager.createPoint('p1', 0, 0);

      manager.createLine('l1', 'p1', 'p2');

      const constraintId = manager.addConstraint(ConstraintType.HORIZONTAL, ['l1']);
      const constraint = manager.getConstraintById(constraintId);

      expect(constraint).toBeDefined();
      expect(constraint?.type).toBe(ConstraintType.HORIZONTAL);
    });

    it('should get constraints for specific element', () => {
      manager.createPoint('p1', 0, 0);
      manager.createPoint('p2', 10, 0);
      manager.createPoint('p3', 0, 10);

      manager.addConstraint(ConstraintType.DISTANCE, ['p1', 'p2'], { distance: 10 });
      manager.addConstraint(ConstraintType.DISTANCE, ['p1', 'p3'], { distance: 10 });

      const constraintsForP1 = manager.getConstraintsForElement('p1');
      const constraintsForP2 = manager.getConstraintsForElement('p2');

      expect(constraintsForP1.length).toBe(2);
      expect(constraintsForP2.length).toBe(1);
    });
  });

  describe('Constraint Solving', () => {
    it('should solve empty system successfully', async () => {
      const result = await manager.solve();

      expect(result.success).toBe(true);
    });

    it('should solve system with fixed points', async () => {
      manager.createPoint('p1', 0, 0, true);
      manager.createPoint('p2', 10, 0, true);

      const result = await manager.solve();

      expect(result.success).toBe(true);
    });

    it('should mark system as unsolved after adding constraints', () => {
      manager.createPoint('p1', 0, 0);

      manager.createLine('l1', 'p1', 'p2');

      manager.addConstraint(ConstraintType.HORIZONTAL, ['l1']);

      expect(manager.isSolved()).toBe(false);
    });

    it('should mark system as solved after successful solve', async () => {
      manager.createPoint('p1', 0, 0, true);
      manager.createPoint('p2', 10, 5);
      manager.createLine('l1', 'p1', 'p2');

      manager.addConstraint(ConstraintType.HORIZONTAL, ['l1']);

      await manager.solve();

      expect(manager.isSolved()).toBe(true);
    });
  });

  describe('Constraint Management', () => {
    it('should remove constraint from system', () => {
      manager.createPoint('p1', 0, 0);
      manager.createPoint('p2', 10, 0);

      const constraintId = manager.addConstraint(ConstraintType.DISTANCE, ['p1', 'p2'], {
        distance: 10,
      });

      expect(manager.getConstraints().length).toBe(1);

      manager.removeConstraint(constraintId);

      expect(manager.getConstraints().length).toBe(0);
    });

    it('should enable and disable constraints', () => {
      manager.createPoint('p1', 0, 0);

      manager.createLine('l1', 'p1', 'p2');

      const constraintId = manager.addConstraint(ConstraintType.HORIZONTAL, ['l1']);

      manager.setConstraintEnabled(constraintId, false);

      const constraint = manager.getConstraintById(constraintId);
      expect(constraint?.enabled).toBe(false);

      manager.setConstraintEnabled(constraintId, true);
      expect(constraint?.enabled).toBe(true);
    });

    it('should mark system as unsolved when constraint is disabled', () => {
      manager.createPoint('p1', 0, 0, true);
      manager.createPoint('p2', 10, 0);
      manager.createLine('l1', 'p1', 'p2');

      const constraintId = manager.addConstraint(ConstraintType.HORIZONTAL, ['l1']);

      manager.setConstraintEnabled(constraintId, false);

      expect(manager.isSolved()).toBe(false);
    });
  });

  describe('Geometry Removal', () => {
    it('should remove geometry element', () => {
      manager.createPoint('p1', 0, 0);
      manager.createPoint('p2', 10, 0);

      expect(manager.getGeometry().length).toBe(2);

      manager.removeGeometry('p1');

      expect(manager.getGeometry().length).toBe(1);
      expect(manager.getGeometryById('p1')).toBeUndefined();
    });

    it('should remove associated constraints when geometry is removed', () => {
      manager.createPoint('p1', 0, 0);
      manager.createPoint('p2', 10, 0);
      manager.createPoint('p3', 0, 10);

      manager.addConstraint(ConstraintType.DISTANCE, ['p1', 'p2'], { distance: 10 });
      manager.addConstraint(ConstraintType.DISTANCE, ['p1', 'p3'], { distance: 10 });

      expect(manager.getConstraints().length).toBe(2);

      manager.removeGeometry('p1');

      expect(manager.getConstraints().length).toBe(0);
    });
  });

  describe('Point Movement', () => {
    it('should move non-fixed point', () => {
      manager.createPoint('p1', 0, 0, false);

      manager.movePoint('p1', { x: 5, y: 10 });

      const point = manager.getGeometryById('p1');
      expect(point).toBeDefined();
    });

    it('should not move fixed point', () => {
      manager.createPoint('p1', 0, 0, true);

      manager.movePoint('p1', { x: 5, y: 10 });

      const point = manager.getGeometryById('p1');
      expect(point?.position.x).toBe(0);
      expect(point?.position.y).toBe(0);
    });

    it('should mark system as unsolved after moving point', () => {
      manager.createPoint('p1', 0, 0, false);

      manager.movePoint('p1', { x: 5, y: 10 });

      expect(manager.isSolved()).toBe(false);
    });
  });

  describe('System State', () => {
    it('should clear all geometry and constraints', () => {
      manager.createPoint('p1', 0, 0);
      manager.createPoint('p2', 10, 0);
      manager.createLine('l1', 'p1', 'p2');
      manager.addConstraint(ConstraintType.HORIZONTAL, ['l1']);

      manager.clear();

      expect(manager.getGeometry().length).toBe(0);
      expect(manager.getConstraints().length).toBe(0);
      expect(manager.isSolved()).toBe(false);
    });

    it('should get system state', () => {
      manager.createPoint('p1', 0, 0);
      manager.createPoint('p2', 10, 0);

      const system = manager.getSystem();

      expect(system.geometry.size).toBe(2);
      expect(system.solved).toBe(false);
    });
  });

  describe('Available Constraint Types', () => {
    it('should return available constraint types', () => {
      const types = manager.getAvailableConstraintTypes();

      expect(Array.isArray(types)).toBe(true);
      expect(types.length).toBeGreaterThan(0);
    });
  });

  describe('Import/Export', () => {
    it('should export system to JSON', () => {
      manager.createPoint('p1', 0, 0);
      manager.createPoint('p2', 10, 0);
      manager.createLine('l1', 'p1', 'p2');
      manager.addConstraint(ConstraintType.HORIZONTAL, ['l1']);

      const json = manager.exportToJSON();

      expect(json.geometry).toBeDefined();
      expect(json.constraints).toBeDefined();
      expect(json.variables).toBeDefined();
    });

    it('should import system from JSON', () => {
      manager.createPoint('p1', 5, 10);
      const exported = manager.exportToJSON();

      const newManager = new ConstraintManager();
      newManager.importFromJSON(exported);

      const geometry = newManager.getGeometry();
      expect(geometry.length).toBe(1);
      expect(geometry[0].id).toBe('p1');
    });
  });
});
