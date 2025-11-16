/**
 * Core constraint system types for 2D parametric modeling
 */

export interface Vec2 {
  x: number;
  y: number;
}

export interface Point2D {
  id: string;
  position: Vec2;
  fixed?: boolean;
}

export interface Line2D {
  id: string;
  start: string; // Point ID
  end: string; // Point ID
}

export interface Circle2D {
  id: string;
  center: string; // Point ID
  radius: number;
}

export type GeometryElement = Point2D | Line2D | Circle2D;

/**
 * Base constraint interface
 */
export interface BaseConstraint {
  id: string;
  type: ConstraintType;
  elements: string[]; // IDs of geometry elements
  priority: number; // Solver priority (higher = more important)
  enabled: boolean;
}

/**
 * Constraint types supported by the solver
 */
export enum ConstraintType {
  DISTANCE = 'distance',
  COINCIDENT = 'coincident',
  PARALLEL = 'parallel',
  PERPENDICULAR = 'perpendicular',
  HORIZONTAL = 'horizontal',
  VERTICAL = 'vertical',
  ANGLE = 'angle',
  RADIUS = 'radius',
}

/**
 * Distance constraint between two points or point to line
 */
export interface DistanceConstraint extends BaseConstraint {
  type: ConstraintType.DISTANCE;
  elements: [string, string]; // Two point IDs or point and line
  distance: number;
}

/**
 * Coincident constraint - two points occupy same position
 */
export interface CoincidentConstraint extends BaseConstraint {
  type: ConstraintType.COINCIDENT;
  elements: [string, string]; // Two point IDs
}

/**
 * Parallel constraint between two lines
 */
export interface ParallelConstraint extends BaseConstraint {
  type: ConstraintType.PARALLEL;
  elements: [string, string]; // Two line IDs
}

/**
 * Perpendicular constraint between two lines
 */
export interface PerpendicularConstraint extends BaseConstraint {
  type: ConstraintType.PERPENDICULAR;
  elements: [string, string]; // Two line IDs
}

/**
 * Horizontal constraint - line is horizontal
 */
export interface HorizontalConstraint extends BaseConstraint {
  type: ConstraintType.HORIZONTAL;
  elements: [string]; // Line ID
}

/**
 * Vertical constraint - line is vertical
 */
export interface VerticalConstraint extends BaseConstraint {
  type: ConstraintType.VERTICAL;
  elements: [string]; // Line ID
}

/**
 * Angle constraint between two lines
 */
export interface AngleConstraint extends BaseConstraint {
  type: ConstraintType.ANGLE;
  elements: [string, string]; // Two line IDs
  angle: number; // Angle in degrees
}

/**
 * Radius constraint for circles
 */
export interface RadiusConstraint extends BaseConstraint {
  type: ConstraintType.RADIUS;
  elements: [string]; // Circle ID
  radius: number;
}

/**
 * Union type for all constraints
 */
export type Constraint =
  | DistanceConstraint
  | CoincidentConstraint
  | ParallelConstraint
  | PerpendicularConstraint
  | HorizontalConstraint
  | VerticalConstraint
  | AngleConstraint
  | RadiusConstraint;

/**
 * Constraint system state
 */
export interface ConstraintSystem {
  geometry: Map<string, GeometryElement>;
  constraints: Map<string, Constraint>;
  variables: Map<string, number>; // Variable name -> current value
  solved: boolean;
  lastSolveTime: number;
  iterations: number;
}

/**
 * Solver configuration
 */
export interface SolverConfig {
  maxIterations: number;
  tolerance: number;
  dampingFactor: number;
  enableDebug: boolean;
}

/**
 * Solver result
 */
export interface SolverResult {
  success: boolean;
  iterations: number;
  residual: number;
  time: number;
  error?: string;
  variables: Map<string, number>;
}
