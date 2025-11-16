import type { Constraint, ConstraintEntity, ConstraintSolution, SolverOptions } from './types';
import { ConstraintSolverEngine } from './solver-engine';

export class ConstraintSolver {
  private engine: ConstraintSolverEngine;

  constructor(options?: SolverOptions) {
    this.engine = new ConstraintSolverEngine(options);
  }

  /**
   * Add a geometric entity to the constraint system
   */
  addEntity(entity: ConstraintEntity): void {
    this.engine.addEntity(entity);
  }

  /**
   * Add multiple entities at once
   */
  addEntities(entities: ConstraintEntity[]): void {
    for (const entity of entities) {
      this.engine.addEntity(entity);
    }
  }

  /**
   * Remove an entity and all associated constraints
   */
  removeEntity(id: string): void {
    this.engine.removeEntity(id);
  }

  /**
   * Add a constraint to the system
   */
  addConstraint(constraint: Constraint): void {
    this.engine.addConstraint(constraint);
  }

  /**
   * Add multiple constraints at once
   */
  addConstraints(constraints: Constraint[]): void {
    for (const constraint of constraints) {
      this.engine.addConstraint(constraint);
    }
  }

  /**
   * Remove a constraint from the system
   */
  removeConstraint(id: string): void {
    this.engine.removeConstraint(id);
  }

  /**
   * Solve the constraint system
   */
  solve(): ConstraintSolution {
    return this.engine.solve();
  }

  /**
   * Get current state of all entities
   */
  getEntities(): ConstraintEntity[] {
    return Array.from(this.engine.getEntities().values());
  }

  /**
   * Get current state of all constraints
   */
  getConstraints(): Constraint[] {
    return Array.from(this.engine.getConstraints().values());
  }

  /**
   * Clear all entities and constraints
   */
  clear(): void {
    const entities = this.engine.getEntities();
    for (const id of entities.keys()) {
      this.engine.removeEntity(id);
    }
  }

  /**
   * Create a coincident constraint between two points
   */
  static coincident(id: string, point1: string, point2: string): Constraint {
    return {
      id,
      type: 'coincident',
      entities: [point1, point2],
      active: true,
    };
  }

  /**
   * Create a parallel constraint between two lines
   */
  static parallel(id: string, line1: string, line2: string): Constraint {
    return {
      id,
      type: 'parallel',
      entities: [line1, line2],
      active: true,
    };
  }

  /**
   * Create a perpendicular constraint between two lines
   */
  static perpendicular(id: string, line1: string, line2: string): Constraint {
    return {
      id,
      type: 'perpendicular',
      entities: [line1, line2],
      active: true,
    };
  }

  /**
   * Create a distance constraint between two entities
   */
  static distance(id: string, entity1: string, entity2: string, value: number): Constraint {
    return {
      id,
      type: 'distance',
      entities: [entity1, entity2],
      value,
      active: true,
    };
  }

  /**
   * Create an angle constraint between two lines
   */
  static angle(id: string, line1: string, line2: string, value: number): Constraint {
    return {
      id,
      type: 'angle',
      entities: [line1, line2],
      value,
      active: true,
    };
  }

  /**
   * Create a radius constraint for a circle or arc
   */
  static radius(id: string, entity: string, value: number): Constraint {
    return {
      id,
      type: 'radius',
      entities: [entity],
      value,
      active: true,
    };
  }

  /**
   * Create a horizontal constraint for a line
   */
  static horizontal(id: string, line: string): Constraint {
    return {
      id,
      type: 'horizontal',
      entities: [line],
      active: true,
    };
  }

  /**
   * Create a vertical constraint for a line
   */
  static vertical(id: string, line: string): Constraint {
    return {
      id,
      type: 'vertical',
      entities: [line],
      active: true,
    };
  }

  /**
   * Create a tangent constraint between a line and circle
   */
  static tangent(id: string, entity1: string, entity2: string): Constraint {
    return {
      id,
      type: 'tangent',
      entities: [entity1, entity2],
      active: true,
    };
  }

  /**
   * Create an equal constraint between two entities
   */
  static equal(id: string, entity1: string, entity2: string): Constraint {
    return {
      id,
      type: 'equal',
      entities: [entity1, entity2],
      active: true,
    };
  }

  /**
   * Create a fixed constraint to lock an entity in place
   */
  static fixed(id: string, entity: string): Constraint {
    return {
      id,
      type: 'fixed',
      entities: [entity],
      active: true,
    };
  }
}
