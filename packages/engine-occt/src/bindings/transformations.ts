/**
 * OCCT Transformation Operations
 *
 * This module handles geometric transformations on shapes:
 * - Transform: Apply arbitrary transformation matrix
 * - Translate: Move shape by vector
 * - Rotate: Rotate shape around axis
 * - Scale: Scale shape by factor
 * - Mirror: Reflect shape across plane
 */

import type { ShapeHandle } from '@brepflow/types';
import type { WASMModule } from '../occt-bindings';
import type { OCCTShape } from './types';
import { ShapeHandleUtils, Vec3Utils, IDGenerator } from './utils';
import { getLogger } from '../production-logger';

const _logger = getLogger('OCCT:Transformations');

export class OCCTTransformations {
  private shapes: Map<string, OCCTShape>;
  private occt: WASMModule;
  private handleUtils: ShapeHandleUtils;
  private vec3Utils: Vec3Utils;

  constructor(occt: WASMModule, shapes: Map<string, OCCTShape>, idGen: IDGenerator) {
    this.occt = occt;
    this.shapes = shapes;
    this.handleUtils = new ShapeHandleUtils(occt, shapes, idGen);
    this.vec3Utils = new Vec3Utils(occt);
  }

  /**
   * Apply arbitrary transformation matrix to shape
   *
   * @param params.shape - Shape ID or handle to transform
   * @param params.matrix - 4x4 transformation matrix (array or object)
   * @returns Transformed shape handle
   */
  // eslint-disable-next-line complexity -- Matrix parsing requires conditional logic for array vs object format
  transform(params: unknown): ShapeHandle {
    const shape = this.shapes.get(params.shape?.id || params.shape);
    if (!shape) throw new Error('Shape not found');

    const trsf = new this.occt.gp_Trsf();

    if (params.matrix) {
      // Apply transformation matrix
      // Expecting 4x4 transformation matrix as array of 16 values or object with properties
      const matrix = Array.isArray(params.matrix)
        ? params.matrix
        : [
            params.matrix.m11 || 1,
            params.matrix.m12 || 0,
            params.matrix.m13 || 0,
            params.matrix.m14 || 0,
            params.matrix.m21 || 0,
            params.matrix.m22 || 1,
            params.matrix.m23 || 0,
            params.matrix.m24 || 0,
            params.matrix.m31 || 0,
            params.matrix.m32 || 0,
            params.matrix.m33 || 1,
            params.matrix.m34 || 0,
            params.matrix.m41 || 0,
            params.matrix.m42 || 0,
            params.matrix.m43 || 0,
            params.matrix.m44 || 1,
          ];

      // OCCT uses 3x4 transformation matrix (rotation + translation)
      // Extract rotation matrix (3x3) and translation vector (3x1)
      trsf.SetValues(
        matrix[0],
        matrix[1],
        matrix[2],
        matrix[3], // Row 1: m11, m12, m13, m14
        matrix[4],
        matrix[5],
        matrix[6],
        matrix[7], // Row 2: m21, m22, m23, m24
        matrix[8],
        matrix[9],
        matrix[10],
        matrix[11] // Row 3: m31, m32, m33, m34
      );
    }

    const transformer = new this.occt.BRepBuilderAPI_Transform(shape, trsf, true);
    const result = transformer.Shape();
    const handle = this.handleUtils.createHandle(result, 'solid');

    trsf.delete();
    transformer.delete();
    return handle;
  }

  /**
   * Translate (move) shape by vector
   *
   * @param params.shape - Shape ID or handle to translate
   * @param params.vector - Translation vector {x, y, z}
   * @returns Translated shape handle
   */
  translate(params: unknown): ShapeHandle {
    const shape = this.shapes.get(params.shape?.id || params.shape);
    if (!shape) throw new Error('Shape not found');

    const vec = this.vec3Utils.createVec3(params.vector || { x: 0, y: 0, z: 0 });
    const trsf = new this.occt.gp_Trsf();
    trsf.SetTranslation(vec);

    const transformer = new this.occt.BRepBuilderAPI_Transform(shape, trsf, true);
    const result = transformer.Shape();
    const handle = this.handleUtils.createHandle(result, 'solid');

    vec.delete();
    trsf.delete();
    transformer.delete();
    return handle;
  }

  /**
   * Rotate shape around axis
   *
   * @param params.shape - Shape ID or handle to rotate
   * @param params.center - Center point of rotation {x, y, z}
   * @param params.axis - Rotation axis direction {x, y, z}
   * @param params.angle - Rotation angle in radians
   * @returns Rotated shape handle
   */
  rotate(params: unknown): ShapeHandle {
    const shape = this.shapes.get(params.shape?.id || params.shape);
    if (!shape) throw new Error('Shape not found');

    const axis = this.vec3Utils.createAxis(
      params.center || { x: 0, y: 0, z: 0 },
      params.axis || { x: 0, y: 0, z: 1 }
    );

    const trsf = new this.occt.gp_Trsf();
    trsf.SetRotation(axis.Axis(), params.angle || 0);

    const transformer = new this.occt.BRepBuilderAPI_Transform(shape, trsf, true);
    const result = transformer.Shape();
    const handle = this.handleUtils.createHandle(result, 'solid');

    axis.delete();
    trsf.delete();
    transformer.delete();
    return handle;
  }

  /**
   * Scale shape by factor
   *
   * @param params.shape - Shape ID or handle to scale
   * @param params.center - Center point of scaling {x, y, z}
   * @param params.factor - Scale factor (1.0 = no change)
   * @returns Scaled shape handle
   */
  scale(params: unknown): ShapeHandle {
    const shape = this.shapes.get(params.shape?.id || params.shape);
    if (!shape) throw new Error('Shape not found');

    const center = this.vec3Utils.createPoint(params.center || { x: 0, y: 0, z: 0 });
    const trsf = new this.occt.gp_Trsf();
    trsf.SetScale(center, params.factor || 1);

    const transformer = new this.occt.BRepBuilderAPI_Transform(shape, trsf, true);
    const result = transformer.Shape();
    const handle = this.handleUtils.createHandle(result, 'solid');

    center.delete();
    trsf.delete();
    transformer.delete();
    return handle;
  }

  /**
   * Mirror (reflect) shape across plane
   *
   * @param params.shape - Shape ID or handle to mirror
   * @param params.point - Point on mirror plane {x, y, z}
   * @param params.normal - Mirror plane normal direction {x, y, z}
   * @returns Mirrored shape handle
   */
  mirror(params: unknown): ShapeHandle {
    const shape = this.shapes.get(params.shape?.id || params.shape);
    if (!shape) throw new Error('Shape not found');

    const point = this.vec3Utils.createPoint(params.point || { x: 0, y: 0, z: 0 });
    const normal = this.vec3Utils.createDir(params.normal || { x: 0, y: 0, z: 1 });
    const plane = new this.occt.gp_Ax2(point, normal);

    const trsf = new this.occt.gp_Trsf();
    trsf.SetMirror(plane.Ax2());

    const transformer = new this.occt.BRepBuilderAPI_Transform(shape, trsf, true);
    const result = transformer.Shape();
    const handle = this.handleUtils.createHandle(result, 'solid');

    point.delete();
    normal.delete();
    plane.delete();
    trsf.delete();
    transformer.delete();
    return handle;
  }
}
