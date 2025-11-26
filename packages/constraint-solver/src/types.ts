import type { Vec3 } from '@sim4d/types';

// 2D solver primitives
export interface Point2D {
  id?: string;
  x: number;
  y: number;
  fixed?: boolean;
}

export interface Variable {
  id: string;
  value: number;
  type: 'x' | 'y' | 'angle' | 'distance' | 'parameter';
}

export type Constraint2DType =
  | 'distance'
  | 'horizontal'
  | 'vertical'
  | 'parallel'
  | 'perpendicular'
  | 'coincident'
  | 'tangent'
  | 'concentric'
  | 'angle'
  | 'fixed';

export interface Constraint2D {
  id: string;
  type: Constraint2DType;
  entities: Array<Point2D | Variable | unknown>;
  targetValue?: number | { x: number; y: number };
  enabled?: boolean;
}

export interface SolveResult {
  success: boolean;
  iterations: number;
  residual: number;
  variables: Record<string, number>;
  error?: string;
}

export type ConstraintType =
  | 'coincident'
  | 'parallel'
  | 'perpendicular'
  | 'tangent'
  | 'concentric'
  | 'horizontal'
  | 'vertical'
  | 'distance'
  | 'angle'
  | 'radius'
  | 'equal'
  | 'symmetric'
  | 'fixed';

export interface ConstraintEntity {
  id: string;
  type: 'point' | 'line' | 'circle' | 'arc' | 'spline' | 'plane';
  position?: Vec3;
  direction?: Vec3;
  radius?: number;
  normal?: Vec3;
  parameters: Map<string, number>;
}

export interface Constraint {
  id: string;
  type: ConstraintType;
  entities: string[]; // Entity IDs
  value?: number; // For dimensional constraints
  priority?: number;
  active: boolean;
}

export interface ConstraintSolution {
  success: boolean;
  iterations: number;
  residual: number;
  updates: Map<string, ConstraintEntity>;
  conflicts?: string[];
}

export interface SolverOptions {
  maxIterations?: number;
  tolerance?: number;
  damping?: number;
  method?: 'newton-raphson' | 'gradient-descent' | 'hybrid';
  verbose?: boolean;
}
