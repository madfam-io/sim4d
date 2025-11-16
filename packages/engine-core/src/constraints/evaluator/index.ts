/**
 * Constraint evaluation engine - computes constraint functions and gradients
 */

import {
  ConstraintType,
  Constraint,
  GeometryElement,
  Point2D,
  Line2D,
  Circle2D,
  Vec2,
  DistanceConstraint,
  CoincidentConstraint,
  ParallelConstraint,
  PerpendicularConstraint,
  HorizontalConstraint,
  VerticalConstraint,
  AngleConstraint,
  RadiusConstraint,
} from '../types';

/**
 * Constraint evaluation result
 */
export interface ConstraintEvaluation {
  value: number; // Constraint function value (0 = satisfied)
  gradient: number[]; // Partial derivatives w.r.t. variables
  variables: string[]; // Variable names corresponding to gradient
}

/**
 * Constraint evaluator class
 */
export class ConstraintEvaluator {
  private geometry: Map<string, GeometryElement>;
  private variables: Map<string, number>;

  constructor(geometry: Map<string, GeometryElement>, variables: Map<string, number>) {
    this.geometry = geometry;
    this.variables = variables;
  }

  /**
   * Evaluate a constraint and return function value and gradient
   */
  evaluate(constraint: Constraint): ConstraintEvaluation {
    switch (constraint.type) {
      case ConstraintType.DISTANCE:
        return this.evaluateDistance(constraint as DistanceConstraint);
      case ConstraintType.COINCIDENT:
        return this.evaluateCoincident(constraint as CoincidentConstraint);
      case ConstraintType.PARALLEL:
        return this.evaluateParallel(constraint as ParallelConstraint);
      case ConstraintType.PERPENDICULAR:
        return this.evaluatePerpendicular(constraint as PerpendicularConstraint);
      case ConstraintType.HORIZONTAL:
        return this.evaluateHorizontal(constraint as HorizontalConstraint);
      case ConstraintType.VERTICAL:
        return this.evaluateVertical(constraint as VerticalConstraint);
      case ConstraintType.ANGLE:
        return this.evaluateAngle(constraint as AngleConstraint);
      case ConstraintType.RADIUS:
        return this.evaluateRadius(constraint as RadiusConstraint);
      default:
        throw new Error(`Unsupported constraint type: ${(constraint as any).type}`);
    }
  }

  /**
   * Get point position from variables
   */
  private getPointPosition(pointId: string): Vec2 {
    const point = this.geometry.get(pointId) as Point2D;
    if (!point) throw new Error(`Point not found: ${pointId}`);

    if (point.fixed) {
      return point.position;
    }

    const x = this.variables.get(`${pointId}.x`) ?? point.position.x;
    const y = this.variables.get(`${pointId}.y`) ?? point.position.y;
    return { x, y };
  }

  /**
   * Distance constraint: |p1 - p2| - target_distance = 0
   */
  private evaluateDistance(constraint: DistanceConstraint): ConstraintEvaluation {
    const [id1, id2] = constraint.elements;
    const p1 = this.getPointPosition(id1);
    const p2 = this.getPointPosition(id2);

    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    const value = distance - constraint.distance;

    // Gradient computation
    const gradient: number[] = [];
    const variables: string[] = [];

    if (distance > 1e-12) {
      // Avoid division by zero
      const factor = 1.0 / distance;

      // Partial derivatives w.r.t. point 1
      if (!this.isPointFixed(id1)) {
        variables.push(`${id1}.x`, `${id1}.y`);
        gradient.push(dx * factor, dy * factor);
      }

      // Partial derivatives w.r.t. point 2
      if (!this.isPointFixed(id2)) {
        variables.push(`${id2}.x`, `${id2}.y`);
        gradient.push(-dx * factor, -dy * factor);
      }
    }

    return { value, gradient, variables };
  }

  /**
   * Coincident constraint: (p1.x - p2.x)² + (p1.y - p2.y)² = 0
   */
  private evaluateCoincident(constraint: CoincidentConstraint): ConstraintEvaluation {
    const [id1, id2] = constraint.elements;
    const p1 = this.getPointPosition(id1);
    const p2 = this.getPointPosition(id2);

    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;

    const value = dx * dx + dy * dy;

    const gradient: number[] = [];
    const variables: string[] = [];

    // Partial derivatives w.r.t. point 1
    if (!this.isPointFixed(id1)) {
      variables.push(`${id1}.x`, `${id1}.y`);
      gradient.push(2 * dx, 2 * dy);
    }

    // Partial derivatives w.r.t. point 2
    if (!this.isPointFixed(id2)) {
      variables.push(`${id2}.x`, `${id2}.y`);
      gradient.push(-2 * dx, -2 * dy);
    }

    return { value, gradient, variables };
  }

  /**
   * Parallel constraint: cross product of direction vectors = 0
   */
  private evaluateParallel(constraint: ParallelConstraint): ConstraintEvaluation {
    const [line1Id, line2Id] = constraint.elements;
    const line1 = this.geometry.get(line1Id) as Line2D;
    const line2 = this.geometry.get(line2Id) as Line2D;

    const p1 = this.getPointPosition(line1.start);
    const p2 = this.getPointPosition(line1.end);
    const p3 = this.getPointPosition(line2.start);
    const p4 = this.getPointPosition(line2.end);

    // Direction vectors
    const v1 = { x: p2.x - p1.x, y: p2.y - p1.y };
    const v2 = { x: p4.x - p3.x, y: p4.y - p3.y };

    // Cross product (2D)
    const value = v1.x * v2.y - v1.y * v2.x;

    const gradient: number[] = [];
    const variables: string[] = [];

    // Gradients w.r.t. line1 points
    if (!this.isPointFixed(line1.start)) {
      variables.push(`${line1.start}.x`, `${line1.start}.y`);
      gradient.push(-v2.y, v2.x);
    }
    if (!this.isPointFixed(line1.end)) {
      variables.push(`${line1.end}.x`, `${line1.end}.y`);
      gradient.push(v2.y, -v2.x);
    }

    // Gradients w.r.t. line2 points
    if (!this.isPointFixed(line2.start)) {
      variables.push(`${line2.start}.x`, `${line2.start}.y`);
      gradient.push(v1.y, -v1.x);
    }
    if (!this.isPointFixed(line2.end)) {
      variables.push(`${line2.end}.x`, `${line2.end}.y`);
      gradient.push(-v1.y, v1.x);
    }

    return { value, gradient, variables };
  }

  /**
   * Perpendicular constraint: dot product of direction vectors = 0
   */
  private evaluatePerpendicular(constraint: PerpendicularConstraint): ConstraintEvaluation {
    const [line1Id, line2Id] = constraint.elements;
    const line1 = this.geometry.get(line1Id) as Line2D;
    const line2 = this.geometry.get(line2Id) as Line2D;

    const p1 = this.getPointPosition(line1.start);
    const p2 = this.getPointPosition(line1.end);
    const p3 = this.getPointPosition(line2.start);
    const p4 = this.getPointPosition(line2.end);

    const v1 = { x: p2.x - p1.x, y: p2.y - p1.y };
    const v2 = { x: p4.x - p3.x, y: p4.y - p3.y };

    // Dot product
    const value = v1.x * v2.x + v1.y * v2.y;

    const gradient: number[] = [];
    const variables: string[] = [];

    // Gradients w.r.t. line1 points
    if (!this.isPointFixed(line1.start)) {
      variables.push(`${line1.start}.x`, `${line1.start}.y`);
      gradient.push(-v2.x, -v2.y);
    }
    if (!this.isPointFixed(line1.end)) {
      variables.push(`${line1.end}.x`, `${line1.end}.y`);
      gradient.push(v2.x, v2.y);
    }

    // Gradients w.r.t. line2 points
    if (!this.isPointFixed(line2.start)) {
      variables.push(`${line2.start}.x`, `${line2.start}.y`);
      gradient.push(-v1.x, -v1.y);
    }
    if (!this.isPointFixed(line2.end)) {
      variables.push(`${line2.end}.x`, `${line2.end}.y`);
      gradient.push(v1.x, v1.y);
    }

    return { value, gradient, variables };
  }

  /**
   * Horizontal constraint: line direction y-component = 0
   */
  private evaluateHorizontal(constraint: HorizontalConstraint): ConstraintEvaluation {
    const lineId = constraint.elements[0];
    const line = this.geometry.get(lineId) as Line2D;

    const p1 = this.getPointPosition(line.start);
    const p2 = this.getPointPosition(line.end);

    const value = p2.y - p1.y;

    const gradient: number[] = [];
    const variables: string[] = [];

    if (!this.isPointFixed(line.start)) {
      variables.push(`${line.start}.x`, `${line.start}.y`);
      gradient.push(0, -1);
    }
    if (!this.isPointFixed(line.end)) {
      variables.push(`${line.end}.x`, `${line.end}.y`);
      gradient.push(0, 1);
    }

    return { value, gradient, variables };
  }

  /**
   * Vertical constraint: line direction x-component = 0
   */
  private evaluateVertical(constraint: VerticalConstraint): ConstraintEvaluation {
    const lineId = constraint.elements[0];
    const line = this.geometry.get(lineId) as Line2D;

    const p1 = this.getPointPosition(line.start);
    const p2 = this.getPointPosition(line.end);

    const value = p2.x - p1.x;

    const gradient: number[] = [];
    const variables: string[] = [];

    if (!this.isPointFixed(line.start)) {
      variables.push(`${line.start}.x`, `${line.start}.y`);
      gradient.push(-1, 0);
    }
    if (!this.isPointFixed(line.end)) {
      variables.push(`${line.end}.x`, `${line.end}.y`);
      gradient.push(1, 0);
    }

    return { value, gradient, variables };
  }

  /**
   * Angle constraint: angle between two lines = target angle
   */
  private evaluateAngle(constraint: AngleConstraint): ConstraintEvaluation {
    // Simplified implementation - more complex angle handling needed for production
    const [line1Id, line2Id] = constraint.elements;
    const line1 = this.geometry.get(line1Id) as Line2D;
    const line2 = this.geometry.get(line2Id) as Line2D;

    const p1 = this.getPointPosition(line1.start);
    const p2 = this.getPointPosition(line1.end);
    const p3 = this.getPointPosition(line2.start);
    const p4 = this.getPointPosition(line2.end);

    const v1 = { x: p2.x - p1.x, y: p2.y - p1.y };
    const v2 = { x: p4.x - p3.x, y: p4.y - p3.y };

    const targetAngleRad = (constraint.angle * Math.PI) / 180;
    const cosTarget = Math.cos(targetAngleRad);

    const len1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
    const len2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);

    if (len1 < 1e-12 || len2 < 1e-12) {
      return { value: 0, gradient: [], variables: [] };
    }

    const dot = v1.x * v2.x + v1.y * v2.y;
    const cosActual = dot / (len1 * len2);

    const value = cosActual - cosTarget;

    // Simplified gradient - full implementation would require chain rule
    return { value, gradient: [], variables: [] };
  }

  /**
   * Radius constraint: circle radius = target radius
   */
  private evaluateRadius(constraint: RadiusConstraint): ConstraintEvaluation {
    const circleId = constraint.elements[0];
    const circle = this.geometry.get(circleId) as Circle2D;

    const value = circle.radius - constraint.radius;

    // No geometric variables for radius - handled at higher level
    return { value, gradient: [], variables: [] };
  }

  /**
   * Check if a point is fixed (non-variable)
   */
  private isPointFixed(pointId: string): boolean {
    const point = this.geometry.get(pointId) as Point2D;
    return point?.fixed ?? false;
  }
}
