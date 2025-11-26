/**
 * Shared Utility Functions for OCCT Bindings
 *
 * Common helper functions used across all bindings modules
 */

import type { ShapeHandle, Vec3, BoundingBox } from '@sim4d/types';
import { createHandleId } from '@sim4d/types';
import type { WASMModule } from '../occt-bindings';
import type { OCCTShape, OCCTVec3, OCCTHandle } from './types';

/**
 * ID Generator for shape handles
 */
export class IDGenerator {
  private nextId: number;

  constructor(startId: number = 1) {
    this.nextId = startId;
  }

  /**
   * Generate unique shape ID
   */
  generate(): string {
    return `shape_${this.nextId++}`;
  }

  /**
   * Get current ID counter
   */
  getCurrent(): number {
    return this.nextId;
  }

  /**
   * Set ID counter
   */
  setCurrent(id: number): void {
    this.nextId = id;
  }
}

/**
 * Vec3 Helper Functions
 */
export class Vec3Utils {
  private occt: WASMModule;

  constructor(occt: WASMModule) {
    this.occt = occt;
  }

  /**
   * Create OCCT Vec3 from JS object
   */
  createVec3(v: Vec3): OCCTVec3 {
    const vec = new this.occt.gp_Vec();
    vec.SetCoord(v.x, v.y, v.z);
    return vec;
  }

  /**
   * Create OCCT point from JS object
   */
  createPoint(v: Vec3): OCCTHandle {
    return new this.occt.gp_Pnt(v.x, v.y, v.z);
  }

  /**
   * Create OCCT direction from JS object
   */
  createDir(v: Vec3): OCCTHandle {
    return new this.occt.gp_Dir(v.x, v.y, v.z);
  }

  /**
   * Create OCCT axis from center and direction
   */
  createAxis(center: Vec3, direction: Vec3): OCCTHandle {
    const pnt = this.createPoint(center);
    const dir = this.createDir(direction);
    return new this.occt.gp_Ax2(pnt, dir);
  }
}

/**
 * Shape Handle Utilities
 */
export class ShapeHandleUtils {
  private occt: WASMModule;
  private shapes: Map<string, OCCTShape>;
  private idGen: IDGenerator;

  constructor(occt: WASMModule, shapes: Map<string, OCCTShape>, idGen: IDGenerator) {
    this.occt = occt;
    this.shapes = shapes;
    this.idGen = idGen;
  }

  /**
   * Calculate bounding box for shape
   */
  calculateBounds(shape: OCCTShape): BoundingBox {
    const bnd = new this.occt.Bnd_Box();
    const builder = new this.occt.BRepBndLib();
    builder.Add(shape, bnd);

    const min = bnd.CornerMin();
    const max = bnd.CornerMax();

    const bbox: BoundingBox = {
      min: { x: min.X(), y: min.Y(), z: min.Z() },
      max: { x: max.X(), y: max.Y(), z: max.Z() },
    };

    min.delete();
    max.delete();
    bnd.delete();
    builder.delete();

    return bbox;
  }

  /**
   * Create shape handle with metadata
   */
  createHandle(shape: OCCTShape, type: 'solid' | 'surface' | 'curve' = 'solid'): ShapeHandle {
    const id = this.idGen.generate();
    const bbox = this.calculateBounds(shape);

    this.shapes.set(id, shape);

    return {
      id: createHandleId(id),
      type,
      bbox,
      hash: id.substring(0, 16),
    };
  }
}
