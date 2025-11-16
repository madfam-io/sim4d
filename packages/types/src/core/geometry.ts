/**
 * Core geometry types for BrepFlow
 * These types are fundamental to all geometric operations
 */

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
