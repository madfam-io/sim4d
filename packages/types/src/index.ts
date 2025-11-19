/**
 * Core BrepFlow types
 * Centralized type definitions for the entire monorepo
 */

// ============================================================================
// CONSTRAINT SOLVER TYPES (defined in constraint-solver package)
// ============================================================================

// ============================================================================
// CORE TYPE EXPORTS
// ============================================================================

// Branded identifier types (inlined to avoid DTS generation issues)
/**
 * Branded type helper
 */
type Brand<K, T> = K & { __brand: T };

/**
 * Node identifier
 */
export type NodeId = Brand<string, 'NodeId'>;

/**
 * Edge identifier
 */
export type EdgeId = Brand<string, 'EdgeId'>;

/**
 * Socket identifier
 */
export type SocketId = Brand<string, 'SocketId'>;

/**
 * Handle identifier for geometry references
 */
export type HandleId = Brand<string, 'HandleId'>;

/**
 * Graph identifier
 */
export type GraphId = Brand<string, 'GraphId'>;

/**
 * User identifier
 */
export type UserId = Brand<string, 'UserId'>;

/**
 * Session identifier
 */
export type SessionId = Brand<string, 'SessionId'>;

/**
 * Project identifier
 */
export type ProjectId = Brand<string, 'ProjectId'>;

/**
 * Helper functions for creating branded types
 */
export const NodeId = (id: string): NodeId => id as NodeId;
export const EdgeId = (id: string): EdgeId => id as EdgeId;
export const SocketId = (id: string): SocketId => id as SocketId;
export const HandleId = (id: string): HandleId => id as HandleId;
export const GraphId = (id: string): GraphId => id as GraphId;
export const UserId = (id: string): UserId => id as UserId;
export const SessionId = (id: string): SessionId => id as SessionId;
export const ProjectId = (id: string): ProjectId => id as ProjectId;

// ============================================================================
// GEOMETRY TYPES (INLINED TO AVOID ESBUILD MODULE RESOLUTION ISSUES)
// ============================================================================

/**
 * 3D Vector representation
 */
export interface Vec3 {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

/**
 * 2D Vector representation
 */
export interface Vec2 {
  readonly x: number;
  readonly y: number;
}

/**
 * Quaternion for rotations
 */
export interface Quaternion {
  readonly x: number;
  readonly y: number;
  readonly z: number;
  readonly w: number;
}

/**
 * 4x4 Matrix for transformations
 */
export interface Mat4 {
  readonly elements: readonly number[]; // 16 elements in column-major order
}

/**
 * 2x2 Matrix
 */
export interface Mat2 {
  readonly elements: readonly number[]; // 4 elements
}

/**
 * 3x3 Matrix
 */
export interface Mat3 {
  readonly elements: readonly number[]; // 9 elements
}

/**
 * Bounding box in 3D space
 */
export interface BoundingBox {
  readonly min: Vec3;
  readonly max: Vec3;
}

/**
 * Ray for intersection tests
 */
export interface Ray {
  readonly origin: Vec3;
  readonly direction: Vec3;
}

/**
 * Plane in 3D space
 */
export interface Plane {
  readonly normal: Vec3;
  readonly distance: number;
}

/**
 * Transform combining position, rotation, and scale
 */
export interface Transform {
  readonly position: Vec3;
  readonly rotation: Quaternion;
  readonly scale: Vec3;
}

/**
 * Color representation (RGBA)
 */
export interface Color {
  readonly r: number; // 0-1
  readonly g: number; // 0-1
  readonly b: number; // 0-1
  readonly a: number; // 0-1
}

// ============================================================================
// ERROR HANDLING TYPES (INLINED TO AVOID ESBUILD MODULE RESOLUTION ISSUES)
// ============================================================================

/**
 * Error codes for categorization and handling
 */
export enum ErrorCode {
  // Geometry errors (1000-1999)
  GEOMETRY_INVALID_INPUT = 1001,
  GEOMETRY_OPERATION_FAILED = 1002,
  GEOMETRY_ENGINE_NOT_INITIALIZED = 1003,
  GEOMETRY_WASM_LOAD_FAILED = 1004,
  GEOMETRY_WORKER_CRASHED = 1005,

  // Graph errors (2000-2999)
  GRAPH_INVALID_NODE = 2001,
  GRAPH_INVALID_CONNECTION = 2002,
  GRAPH_CYCLE_DETECTED = 2003,
  GRAPH_EVALUATION_FAILED = 2004,

  // Validation errors (3000-3999)
  VALIDATION_FAILED = 3001,
  VALIDATION_TYPE_MISMATCH = 3002,
  VALIDATION_REQUIRED_MISSING = 3003,
  VALIDATION_CONSTRAINT_VIOLATED = 3004,

  // Network errors (4000-4999)
  NETWORK_TIMEOUT = 4001,
  NETWORK_CONNECTION_LOST = 4002,
  NETWORK_UNAUTHORIZED = 4003,
  NETWORK_SERVER_ERROR = 4004,

  // State errors (5000-5999)
  STATE_INCONSISTENT = 5001,
  STATE_TRANSACTION_FAILED = 5002,
  STATE_UNDO_FAILED = 5003,
  STATE_REDO_FAILED = 5004,

  // Resource errors (6000-6999)
  RESOURCE_NOT_FOUND = 6001,
  RESOURCE_ALREADY_EXISTS = 6002,
  RESOURCE_LOCKED = 6003,
  RESOURCE_QUOTA_EXCEEDED = 6004,

  // System errors (9000-9999)
  SYSTEM_UNKNOWN = 9001,
  SYSTEM_OUT_OF_MEMORY = 9002,
  SYSTEM_INITIALIZATION_FAILED = 9003,
}

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
}

/**
 * Error context for debugging and logging
 */
export interface ErrorContext {
  component?: string;
  operation?: string;
  userId?: string;
  sessionId?: string;
  metadata?: Record<string, unknown>;
  stackTrace?: string | undefined;
  timestamp?: number | undefined;
}

/**
 * Base error class for all BrepFlow errors
 */
export class BrepFlowError extends Error {
  public readonly code: ErrorCode;
  public readonly severity: ErrorSeverity;
  public readonly context: ErrorContext;
  public readonly isRetryable: boolean;

  constructor(
    message: string,
    code: ErrorCode,
    severity: ErrorSeverity = ErrorSeverity.ERROR,
    context: ErrorContext = {},
    isRetryable: boolean = false
  ) {
    super(message);
    this.name = 'BrepFlowError';
    this.code = code;
    this.severity = severity;
    this.context = {
      ...context,
      timestamp: context.timestamp ?? Date.now(),
      stackTrace: context.stackTrace ?? this.stack,
    };
    this.isRetryable = isRetryable;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, BrepFlowError);
    }
  }
}

/**
 * Geometry-specific errors
 */
export class GeometryError extends BrepFlowError {
  constructor(
    message: string,
    code: ErrorCode = ErrorCode.GEOMETRY_OPERATION_FAILED,
    context: ErrorContext = {}
  ) {
    super(message, code, ErrorSeverity.ERROR, context, false);
    this.name = 'GeometryError';
  }
}

/**
 * Validation errors
 */
export class ValidationError extends BrepFlowError {
  constructor(
    message: string,
    code: ErrorCode = ErrorCode.VALIDATION_FAILED,
    context: ErrorContext = {}
  ) {
    super(message, code, ErrorSeverity.WARNING, context, false);
    this.name = 'ValidationError';
  }
}

/**
 * Network errors
 */
export class NetworkError extends BrepFlowError {
  constructor(
    message: string,
    code: ErrorCode = ErrorCode.NETWORK_SERVER_ERROR,
    context: ErrorContext = {}
  ) {
    super(message, code, ErrorSeverity.ERROR, context, true);
    this.name = 'NetworkError';
  }
}

/**
 * State management errors
 */
export class StateError extends BrepFlowError {
  constructor(
    message: string,
    code: ErrorCode = ErrorCode.STATE_INCONSISTENT,
    context: ErrorContext = {}
  ) {
    super(message, code, ErrorSeverity.CRITICAL, context, false);
    this.name = 'StateError';
  }
}

/**
 * Error recovery strategies
 */
export interface ErrorRecoveryStrategy {
  recover(error: BrepFlowError): Promise<void>;
  canRecover(error: BrepFlowError): boolean;
}

/**
 * Error handler interface
 */
export interface ErrorHandler {
  handle(error: Error | BrepFlowError): void;
  report(error: Error | BrepFlowError): Promise<void>;
  log(error: Error | BrepFlowError): void;
}

// Legacy type exports for backward compatibility
// These will be deprecated in Phase 2
// (Import types are now inlined above to avoid esbuild module resolution issues)

// Parameter types
export type ParamValue = number | string | boolean | Vec3 | Mat4 | EnumValue | Expression;

export interface EnumValue {
  value: string;
  options: string[];
}

export interface Expression {
  raw: string;
  evaluated?: number;
}

// Socket types
export type SocketType =
  | 'Shape'
  | 'Curve'
  | 'Surface'
  | 'Solid'
  | 'Vector'
  | 'Number'
  | 'Boolean'
  | 'String'
  | 'Array'
  | 'Geometry'
  | 'Point'
  | 'Plane'
  | 'Matrix'
  | 'Box'
  | 'Any'
  | 'Point[]'
  | 'Curve[]'
  | 'Surface[]'
  | 'Vector[]'
  | 'Number[]'
  | 'Boolean[]'
  | 'Number[][]'
  | 'Point[][]'
  | 'Geometry[]'
  | 'Any[]'
  | 'Any[][]';

export interface SocketRef {
  nodeId: NodeId;
  socketId: SocketId;
}

export interface SocketSpec {
  type: SocketType;
  label?: string;
  multiple?: boolean;
  optional?: boolean;
  required?: boolean;
}

// Node types
export interface NodeInstance<I = Record<string, unknown>, O = Record<string, unknown>, P = Record<string, unknown>> {
  id: NodeId;
  type: string;
  position?: { x: number; y: number };
  inputs: Partial<Record<keyof I, SocketRef | SocketRef[]>>;
  outputs?: Partial<Record<keyof O, unknown>>;
  params: P;
  state?: Record<string, unknown>;
  dirty?: boolean;
}

export interface NodeDefinition<I = Record<string, unknown>, O = Record<string, unknown>, P = Record<string, unknown>> {
  id: string;
  type: string; // Node type identifier (same as id for compatibility)
  category: string;
  label: string;
  description?: string;
  inputs: Record<keyof I, SocketSpec>;
  outputs: Record<keyof O, SocketSpec>;
  params: ParamSpec;
  evaluate: (ctx: EvalContext, inputs: I, params: P) => Promise<O>;
  execute?: (inputs: I, params: P, context: EvalContext) => Promise<O>;
}

// Parameter specifications
export interface ParamSpec {
  [key: string]: ParamDefinition;
}

export interface ParamDefinition {
  type: 'number' | 'string' | 'boolean' | 'vec3' | 'enum' | 'expression';
  label?: string;
  default?: ParamValue;
  min?: number;
  max?: number;
  step?: number;
  options?: string[];
}

// Constraint system integration
export interface ConstraintElement {
  id: string;
  type: 'point' | 'line' | 'circle' | 'arc';
  data: unknown;
}

export interface ConstraintInfo {
  elements: ConstraintElement[];
  activeConstraints: string[];
}

// Enhanced output types for constraint-aware nodes
export interface ParametricOutput<T = unknown> {
  geometry: T;
  constraints?: ConstraintInfo;
}

// Evaluation context
export interface EvalContext {
  nodeId: NodeId;
  graph: GraphInstance;
  cache: Map<string, unknown>;
  worker: WorkerAPI;
  constraintManager?: any; // ConstraintManager from engine-core
  abort?: AbortController;
}

// Constraint system persistence
export interface ConstraintSystemState {
  geometry: Array<[string, unknown]>;
  constraints: Array<[string, unknown]>;
  variables: Array<[string, number]>;
  solved: boolean;
  lastSolveTime: number;
  iterations: number;
}

// Graph types
export interface GraphInstance {
  version: string;
  units: 'mm' | 'cm' | 'm' | 'in';
  tolerance: number;
  nodes: NodeInstance[];
  edges: Edge[];
  constraints?: ConstraintSystemState;
  metadata?: {
    created?: string;
    author?: string;
    description?: string;
    name?: string;
    createdAt?: string;
    updatedAt?: string;
  };
}

// Type aliases for compatibility
export type Graph = GraphInstance;
export type Node = NodeInstance;
export type Connection = Edge;

// Re-export utility functions for creating branded types
export { NodeId as createNodeId } from './core/identifiers';
export { EdgeId as createEdgeId } from './core/identifiers';
export { SocketId as createSocketId } from './core/identifiers';
export { HandleId as createHandleId } from './core/identifiers';
export { GraphId as createGraphId } from './core/identifiers';
export { UserId as createUserId } from './core/identifiers';
export { SessionId as createSessionId } from './core/identifiers';
export { ProjectId as createProjectId } from './core/identifiers';

// Constraint handle type
export interface ConstraintHandle {
  id: string;
  type: string;
  entities: string[];
  parameters: Record<string, number>;
}

export interface Edge {
  id: string;
  source: NodeId;
  sourceHandle: SocketId;
  target: NodeId;
  targetHandle: SocketId;
}

// Worker API
export interface WorkerAPI {
  init?(): Promise<void>;
  invoke<T = unknown>(operation: string, params: unknown): Promise<T>;
  execute?<T = unknown>(operation: string, params: unknown): Promise<T>;
  tessellate(shapeId: HandleId, deflection: number): Promise<MeshData>;
  dispose(handleId: HandleId): Promise<void>;
  healthCheck?(): Promise<{ status: string; timestamp: number }>;
  terminate?(): Promise<void>;
}

// Worker communication types
export type WorkerMessageType =
  | 'INIT'
  | 'HEALTH_CHECK'
  | 'CLEANUP'
  | 'SHUTDOWN'
  | 'MAKE_BOX'
  | 'MAKE_SPHERE'
  | 'MAKE_CYLINDER'
  | 'MAKE_CONE'
  | 'MAKE_TORUS'
  | 'MAKE_EXTRUDE'
  | 'TESSELLATE'
  | 'DISPOSE'
  | string;

export interface WorkerRequest {
  id: number;
  type: WorkerMessageType;
  params: unknown;
}

export interface WorkerResponse<T = unknown> {
  id?: number;
  success?: boolean;
  result?: T;
  error?: {
    message: string;
    code?: string;
    details?: unknown;
  };
  type?: string;
}

// Geometry handles
export interface ShapeHandle {
  id: HandleId;
  type: string;
  hash?: string;
  bbox?: BoundingBox;
  bbox_min_x?: number;
  bbox_min_y?: number;
  bbox_min_z?: number;
  bbox_max_x?: number;
  bbox_max_y?: number;
  bbox_max_z?: number;
  metadata?: Record<string, unknown>;
  volume?: number;
  area?: number;
  centerX?: number;
  centerY?: number;
  centerZ?: number;
}

// Component handle (for assembly components)
export interface ComponentHandle {
  id: HandleId;
  part: ShapeHandle;
  name: string;
  material?: string;
  color?: string;
  visible?: boolean;
  transform?: Transform;
  hash?: string;
}

// Assembly handle
export interface AssemblyHandle {
  id: HandleId;
  name: string;
  parts: ComponentHandle[];
  mates: MateConstraint[];
  visible: boolean;
  hash?: string;
}

// Assembly constraint types
export interface MateConstraint {
  id: string;
  type:
    | 'coincident'
    | 'concentric'
    | 'parallel'
    | 'perpendicular'
    | 'tangent'
    | 'distance'
    | 'angle';
  part1: HandleId;
  part2: HandleId;
  axis1?: Vec3;
  axis2?: Vec3;
  distance?: number;
  angle?: number;
}

// Joint handle for kinematic joints
export interface JointHandle {
  id: HandleId;
  type: 'revolute' | 'prismatic' | 'cylindrical' | 'spherical' | 'planar' | 'fixed';
  component1: HandleId;
  component2: HandleId;
  axis?: Vec3;
  limits?: { min: number; max: number };
  hash?: string;
}

// Motion analysis result
export interface MotionHandle {
  id: HandleId;
  type: 'linear' | 'rotational' | 'complex';
  trajectory: Vec3[];
  duration: number;
  velocity?: Vec3[];
  acceleration?: Vec3[];
  hash?: string;
}

// Bill of Materials entry
export interface BOMEntry {
  partId: HandleId;
  name: string;
  quantity: number;
  material?: string;
  weight?: number;
  cost?: number;
  supplier?: string;
}

// Bill of Materials
export interface BillOfMaterials {
  entries: BOMEntry[];
  totalWeight: number;
  totalCost: number;
  currency?: string;
}

// Assembly sequence step
export interface AssemblyStep {
  stepNumber: number;
  component: HandleId;
  operation: 'place' | 'fasten' | 'align' | 'weld' | 'glue';
  instruction: string;
  toolsRequired?: string[];
  duration?: number;
}

// Interference detection result
export interface InterferenceData {
  component1: HandleId;
  component2: HandleId;
  volume: number;
  location: Vec3;
  severity: 'warning' | 'error';
}

// Mesh data
export interface MeshData {
  positions: Float32Array;
  normals: Float32Array;
  indices: Uint32Array;
  edges?: Uint32Array;
  uvs?: Float32Array;
  vertices?: Float32Array;
  vertexCount?: number;
  triangleCount?: number;
  edgeCount?: number;
}

// Export formats
export type ExportFormat = 'step' | 'iges' | 'stl' | 'obj' | '3dm' | 'gltf' | 'usd';

export interface ExportOptions {
  format: ExportFormat;
  binary?: boolean;
  units?: string;
  tolerance?: number;
}

// ============================================================================
// SECURITY: HTML SANITIZATION UTILITIES
// ============================================================================
export * from './sanitization';
