/**
 * 2D Constraint System - Main API
 *
 * Provides parametric constraint solving for 2D sketch elements.
 * Enables constraint-driven design with geometric relationships.
 */

import {
  ConstraintSystem,
  ConstraintType,
  Constraint,
  GeometryElement,
  Point2D,
  Line2D,
  Circle2D,
  Vec2,
  SolverConfig,
  SolverResult,
} from './types';
import { ConstraintSolver } from './solver';
import { ConstraintRegistry } from './registry';

export * from './types';
export * from './evaluator';
export * from './solver';
export * from './registry';

/**
 * Main constraint manager class
 */
export class ConstraintManager {
  private system: ConstraintSystem;
  private solver: ConstraintSolver;
  private registry: ConstraintRegistry;

  constructor(config: Partial<SolverConfig> = {}) {
    this.system = {
      geometry: new Map(),
      constraints: new Map(),
      variables: new Map(),
      solved: false,
      lastSolveTime: 0,
      iterations: 0,
    };

    this.solver = new ConstraintSolver(config);
    this.registry = ConstraintRegistry.getInstance();
  }

  /**
   * Add geometry element to the system
   */
  addGeometry(element: GeometryElement): void {
    this.system.geometry.set(element.id, element);

    // Add variables for non-fixed points
    if (this.isPoint(element) && !element.fixed) {
      this.system.variables.set(`${element.id}.x`, element.position.x);
      this.system.variables.set(`${element.id}.y`, element.position.y);
    }

    this.system.solved = false;
  }

  /**
   * Remove geometry element from the system
   */
  removeGeometry(elementId: string): void {
    const element = this.system.geometry.get(elementId);
    if (!element) return;

    // Remove associated constraints
    const constraintsToRemove = Array.from(this.system.constraints.values()).filter((constraint) =>
      constraint.elements.includes(elementId)
    );

    constraintsToRemove.forEach((constraint) => {
      this.system.constraints.delete(constraint.id);
    });

    // Remove variables for points
    if (this.isPoint(element)) {
      this.system.variables.delete(`${elementId}.x`);
      this.system.variables.delete(`${elementId}.y`);
    }

    this.system.geometry.delete(elementId);
    this.system.solved = false;
  }

  /**
   * Add constraint to the system
   */
  addConstraint(
    type: ConstraintType,
    elementIds: string[],
    params: unknown = {},
    priority: number = 1
  ): string {
    // Get geometry elements
    const elements = elementIds.map((id) => {
      const element = this.system.geometry.get(id);
      if (!element) {
        throw new Error(`Geometry element not found: ${id}`);
      }
      return element;
    });

    // Create constraint
    const constraint = this.registry.createConstraint(type, elements, params, priority);
    if (!constraint) {
      throw new Error(`Failed to create constraint of type: ${type}`);
    }

    this.system.constraints.set(constraint.id, constraint);
    this.system.solved = false;

    return constraint.id;
  }

  /**
   * Remove constraint from the system
   */
  removeConstraint(constraintId: string): void {
    this.system.constraints.delete(constraintId);
    this.system.solved = false;
  }

  /**
   * Enable or disable a constraint
   */
  setConstraintEnabled(constraintId: string, enabled: boolean): void {
    const constraint = this.system.constraints.get(constraintId);
    if (constraint) {
      constraint.enabled = enabled;
      this.system.solved = false;
    }
  }

  /**
   * Solve the constraint system
   */
  async solve(): Promise<SolverResult> {
    const result = await this.solver.solve(this.system);

    // Update geometry positions if solve was successful
    if (result.success && result.variables) {
      this.updateGeometryFromVariables(result.variables);
      this.system.solved = true;
      this.system.lastSolveTime = Date.now();
      this.system.iterations = result.iterations || 0;
    } else {
      this.system.solved = false;
    }

    return result;
  }

  /**
   * Get current system state
   */
  getSystem(): Readonly<ConstraintSystem> {
    return {
      geometry: new Map(this.system.geometry),
      constraints: new Map(this.system.constraints),
      variables: new Map(this.system.variables),
      solved: this.system.solved,
      lastSolveTime: this.system.lastSolveTime,
      iterations: this.system.iterations,
    };
  }

  /**
   * Get all geometry elements
   */
  getGeometry(): GeometryElement[] {
    return Array.from(this.system.geometry.values());
  }

  /**
   * Get geometry element by ID
   */
  getGeometryById(id: string): GeometryElement | undefined {
    return this.system.geometry.get(id);
  }

  /**
   * Get all constraints
   */
  getConstraints(): Constraint[] {
    return Array.from(this.system.constraints.values());
  }

  /**
   * Get constraint by ID
   */
  getConstraintById(id: string): Constraint | undefined {
    return this.system.constraints.get(id);
  }

  /**
   * Get constraints affecting a geometry element
   */
  getConstraintsForElement(elementId: string): Constraint[] {
    return Array.from(this.system.constraints.values()).filter((constraint) =>
      constraint.elements.includes(elementId)
    );
  }

  /**
   * Check if system is solved
   */
  isSolved(): boolean {
    return this.system.solved;
  }

  /**
   * Clear all geometry and constraints
   */
  clear(): void {
    this.system.geometry.clear();
    this.system.constraints.clear();
    this.system.variables.clear();
    this.system.solved = false;
    this.system.lastSolveTime = 0;
    this.system.iterations = 0;
  }

  /**
   * Create a point
   */
  createPoint(id: string, x: number, y: number, fixed: boolean = false): Point2D {
    const point: Point2D = {
      id,
      position: { x, y },
      fixed,
    };

    this.addGeometry(point);
    return point;
  }

  /**
   * Create a line
   */
  createLine(id: string, startPointId: string, endPointId: string): Line2D {
    const line: Line2D = {
      id,
      start: startPointId,
      end: endPointId,
    };

    this.addGeometry(line);
    return line;
  }

  /**
   * Create a circle
   */
  createCircle(id: string, centerPointId: string, radius: number): Circle2D {
    const circle: Circle2D = {
      id,
      center: centerPointId,
      radius,
    };

    this.addGeometry(circle);
    return circle;
  }

  /**
   * Move a point (updates variables and triggers re-solve)
   */
  movePoint(pointId: string, position: Vec2): void {
    const point = this.system.geometry.get(pointId) as Point2D;
    if (!point || point.fixed) return;

    this.system.variables.set(`${pointId}.x`, position.x);
    this.system.variables.set(`${pointId}.y`, position.y);
    this.system.solved = false;
  }

  /**
   * Get available constraint types
   */
  getAvailableConstraintTypes(): ConstraintType[] {
    return this.registry.getAvailableTypes();
  }

  /**
   * Validate constraint before adding
   */
  validateConstraint(
    type: ConstraintType,
    elementIds: string[],
    params: unknown = {}
  ): { valid: boolean; error?: string } {
    try {
      const elements = elementIds.map((id) => {
        const element = this.system.geometry.get(id);
        if (!element) {
          throw new Error(`Geometry element not found: ${id}`);
        }
        return element;
      });

      return this.registry.validateConstraint(type, elements, params);
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Unknown validation error',
      };
    }
  }

  /**
   * Export system to JSON
   */
  exportToJSON(): any {
    return {
      geometry: Array.from(this.system.geometry.entries()),
      constraints: Array.from(this.system.constraints.entries()),
      variables: Array.from(this.system.variables.entries()),
      solved: this.system.solved,
      lastSolveTime: this.system.lastSolveTime,
      iterations: this.system.iterations,
    };
  }

  /**
   * Import system from JSON
   */
  importFromJSON(data: unknown): void {
    this.clear();

    if (data.geometry) {
      data.geometry.forEach(([id, element]: [string, GeometryElement]) => {
        this.system.geometry.set(id, element);
      });
    }

    if (data.constraints) {
      data.constraints.forEach(([id, constraint]: [string, Constraint]) => {
        this.system.constraints.set(id, constraint);
      });
    }

    if (data.variables) {
      data.variables.forEach(([name, value]: [string, number]) => {
        this.system.variables.set(name, value);
      });
    }

    this.system.solved = data.solved || false;
    this.system.lastSolveTime = data.lastSolveTime || 0;
    this.system.iterations = data.iterations || 0;
  }

  // Private helper methods
  private updateGeometryFromVariables(variables: Map<string, number>): void {
    for (const [element] of this.system.geometry) {
      const point = this.system.geometry.get(element) as Point2D;
      if (this.isPoint(point) && !point.fixed) {
        const x = variables.get(`${element}.x`);
        const y = variables.get(`${element}.y`);

        if (x !== undefined && y !== undefined) {
          point.position = { x, y };
          this.system.variables.set(`${element}.x`, x);
          this.system.variables.set(`${element}.y`, y);
        }
      }
    }
  }

  private isPoint(element: GeometryElement): element is Point2D {
    return 'position' in element;
  }

  private isLine(element: GeometryElement): element is Line2D {
    return 'start' in element && 'end' in element;
  }

  private isCircle(element: GeometryElement): element is Circle2D {
    return 'center' in element && 'radius' in element;
  }
}

/**
 * Create a new constraint manager instance
 */
export function createConstraintManager(config?: Partial<SolverConfig>): ConstraintManager {
  return new ConstraintManager(config);
}
