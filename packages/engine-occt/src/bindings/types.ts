/**
 * Shared OCCT type definitions for all bindings modules
 *
 * This module contains all type interfaces for OCCT WASM operations.
 * These types are used across all bindings modules (primitives, features, etc.)
 */

import type { ShapeHandle } from '@brepflow/types';
import type { EmscriptenVector } from '../occt-bindings';

/**
 * Base OCCT handle with pointer and cleanup
 */
export interface OCCTHandle {
  $$: { ptr: number };
  delete(): void;
}

/**
 * OCCT 3D vector with coordinate access
 */
export interface OCCTVec3 extends OCCTHandle {
  X(): number;
  Y(): number;
  Z(): number;
  SetCoord(x: number, y: number, z: number): void;
}

/**
 * OCCT shape representation
 */
export interface OCCTShape extends OCCTHandle {
  IsNull(): boolean;
  NbChildren(): number;
}

/**
 * OCCT builder for primitive and feature operations
 */
export interface OCCTBuilder extends OCCTHandle {
  MakeBox(dx: number, dy: number, dz: number): OCCTShape;
  MakeSphere(center: OCCTVec3, radius: number): OCCTShape;
  MakeCylinder(axis: OCCTVec3, radius: number, height: number): OCCTShape;
  MakeCone(axis: OCCTVec3, r1: number, r2: number, height: number): OCCTShape;
  MakeTorus(axis: OCCTVec3, majorRadius: number, minorRadius: number): OCCTShape;
  MakePrism(profile: OCCTShape, vec: OCCTVec3): OCCTShape;
  MakeRevolution(profile: OCCTShape, axis: OCCTVec3, angle: number): OCCTShape;
  MakePipe(profile: OCCTShape, path: OCCTShape): OCCTShape;
  MakeLoft(profiles: EmscriptenVector<OCCTShape>, solid: boolean): OCCTShape;
}

/**
 * OCCT boolean operations (union, subtract, intersect)
 */
export interface OCCTBoolean extends OCCTHandle {
  SetArguments(shape1: OCCTShape, shape2: OCCTShape): void;
  SetOperation(operation: number): void; // 0=Common, 1=Fuse, 2=Cut
  Build(): void;
  Shape(): OCCTShape;
  HasErrors(): boolean;
}

/**
 * OCCT fillet/chamfer operations
 */
export interface OCCTFillet extends OCCTHandle {
  Init(shape: OCCTShape, radius: number): void;
  Add(radius: number): void;
  Build(): void;
  Shape(): OCCTShape;
  IsDone(): boolean;
}

/**
 * OCCT mesh/tessellation operations
 */
export interface OCCTMesh extends OCCTHandle {
  Perform(shape: OCCTShape): void;
  IsDone(): boolean;
  GetVertices(): Float32Array;
  GetNormals(): Float32Array;
  GetIndices(): Uint32Array;
}

/**
 * OCCT bounding box calculations
 */
export interface OCCTBounds extends OCCTHandle {
  Add(shape: OCCTShape): void;
  Get(): { min: OCCTVec3; max: OCCTVec3 };
}

/**
 * Result from pattern operations (linear/circular arrays)
 */
export interface PatternResult {
  shapes: ShapeHandle[];
  compound: ShapeHandle | null;
}
