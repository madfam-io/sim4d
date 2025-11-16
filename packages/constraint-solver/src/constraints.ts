import type { Vec3, Mat4, Quaternion } from '@brepflow/types';

// Define the ConstraintSolver namespace for constraint types
export namespace ConstraintSolver {
  export interface DistanceConstraint {
    type: 'distance';
    entities: [string, string];
    distance: number;
  }

  export interface AngleConstraint {
    type: 'angle';
    entities: [string, string];
    angle: number;
  }

  export interface ParallelConstraint {
    type: 'parallel';
    entities: [string, string];
  }

  export interface PerpendicularConstraint {
    type: 'perpendicular';
    entities: [string, string];
  }

  export interface CoincidentConstraint {
    type: 'coincident';
    entities: [string, string];
  }

  export interface TangentConstraint {
    type: 'tangent';
    entities: [string, string];
  }

  export interface ConcentricConstraint {
    type: 'concentric';
    entities: [string, string];
  }

  export interface HorizontalConstraint {
    type: 'horizontal';
    entities: [string];
  }

  export interface VerticalConstraint {
    type: 'vertical';
    entities: [string];
  }

  export interface FixedConstraint {
    type: 'fixed';
    entities: [string];
    position?: Vec3;
  }

  export interface SymmetricConstraint {
    type: 'symmetric';
    entities: [string, string, string]; // entity1, entity2, symmetry axis
  }
}

// Constraint creation utilities
// These create constraint definition objects that can be passed to the solver

export const createCoincidentConstraint = (e1: string, e2: string) => ({
  type: 'coincident' as const,
  entities: [e1, e2],
});
export const createParallelConstraint = (e1: string, e2: string) => ({
  type: 'parallel' as const,
  entities: [e1, e2],
});
export const createPerpendicularConstraint = (e1: string, e2: string) => ({
  type: 'perpendicular' as const,
  entities: [e1, e2],
});
export const createDistanceConstraint = (e1: string, e2: string, value: number) => ({
  type: 'distance' as const,
  entities: [e1, e2],
  value,
});
export const createAngleConstraint = (e1: string, e2: string, value: number) => ({
  type: 'angle' as const,
  entities: [e1, e2],
  value,
});
export const createRadiusConstraint = (entity: string, value: number) => ({
  type: 'radius' as const,
  entities: [entity],
  value,
});
export const createHorizontalConstraint = (entity: string) => ({
  type: 'horizontal' as const,
  entities: [entity],
});
export const createVerticalConstraint = (entity: string) => ({
  type: 'vertical' as const,
  entities: [entity],
});
export const createTangentConstraint = (e1: string, e2: string) => ({
  type: 'tangent' as const,
  entities: [e1, e2],
});
export const createEqualConstraint = (e1: string, e2: string) => ({
  type: 'equal' as const,
  entities: [e1, e2],
});
export const createFixedConstraint = (entity: string, x: number, y: number) => ({
  type: 'fixed' as const,
  entities: [entity],
  position: { x, y },
});
