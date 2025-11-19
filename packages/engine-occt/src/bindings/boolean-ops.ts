/**
 * OCCT Boolean Operations
 *
 * This module handles boolean operations on 3D shapes:
 * - Union (Fuse): Combine multiple shapes into one
 * - Subtract (Cut): Remove tool shapes from base shape
 * - Intersect (Common): Find common volume of shapes
 */

import type { ShapeHandle } from '@brepflow/types';
import type { WASMModule } from '../occt-bindings';
import type { OCCTShape, OCCTHandle } from './types';
import { ShapeHandleUtils, IDGenerator } from './utils';
import { getLogger } from '../production-logger';

const _logger = getLogger('OCCT:BooleanOps');

export class OCCTBooleanOps {
  private shapes: Map<string, OCCTShape>;
  private occt: WASMModule;
  private handleUtils: ShapeHandleUtils;

  constructor(occt: WASMModule, shapes: Map<string, OCCTShape>, idGen: IDGenerator) {
    this.occt = occt;
    this.shapes = shapes;
    this.handleUtils = new ShapeHandleUtils(occt, shapes, idGen);
  }

  /**
   * Boolean union - combine multiple shapes into one
   *
   * @param params.shapes - Array of shape IDs or handles to combine
   * @returns Combined shape handle
   */
  booleanUnion(params: unknown): ShapeHandle {
    const shapes = params.shapes || [];
    if (shapes.length < 2) throw new Error('Union requires at least 2 shapes');

    let result = this.shapes.get(shapes[0]?.id || shapes[0]);
    if (!result) throw new Error('First shape not found');

    for (let i = 1; i < shapes.length; i++) {
      const tool = this.shapes.get(shapes[i]?.id || shapes[i]);
      if (!tool) continue;

      const fuse: OCCTHandle = new this.occt.BRepAlgoAPI_Fuse(result, tool);
      fuse.Build();

      if (i > 1 && result) {
        // Clean up intermediate result
        result.delete();
      }

      const newResult = fuse.Shape();
      fuse.delete();

      if (!newResult) throw new Error('Boolean union operation failed');
      result = newResult;
    }

    if (!result) throw new Error('Boolean union: final result is null');
    const handle = this.handleUtils.createHandle(result, 'solid');
    return handle;
  }

  /**
   * Boolean subtract - remove tool shapes from base shape
   *
   * @param params.base - Base shape ID or handle
   * @param params.tools - Array of tool shape IDs or handles to subtract
   * @returns Resulting shape handle
   */
  booleanSubtract(params: unknown): ShapeHandle {
    const base = this.shapes.get(params.base?.id || params.base);
    const tools = params.tools || [];

    if (!base) throw new Error('Base shape not found');
    if (tools.length === 0) throw new Error('Subtract requires at least one tool');

    let result = base;

    for (const toolRef of tools) {
      const tool = this.shapes.get(toolRef?.id || toolRef);
      if (!tool) continue;

      const cut = new this.occt.BRepAlgoAPI_Cut(result, tool);
      cut.Build();

      if (result !== base) {
        // Clean up intermediate result
        result.delete();
      }

      result = cut.Shape();
      cut.delete();
    }

    const handle = this.handleUtils.createHandle(result, 'solid');
    return handle;
  }

  /**
   * Boolean intersect - find common volume of shapes
   *
   * @param params.shapes - Array of shape IDs or handles to intersect
   * @returns Intersection shape handle
   */
  booleanIntersect(params: unknown): ShapeHandle {
    const shapes = params.shapes || [];
    if (shapes.length < 2) throw new Error('Intersect requires at least 2 shapes');

    let result = this.shapes.get(shapes[0]?.id || shapes[0]);
    if (!result) throw new Error('First shape not found');

    for (let i = 1; i < shapes.length; i++) {
      const tool = this.shapes.get(shapes[i]?.id || shapes[i]);
      if (!tool) continue;

      const common: OCCTHandle = new this.occt.BRepAlgoAPI_Common(result, tool);
      common.Build();

      if (i > 1 && result) {
        // Clean up intermediate result
        result.delete();
      }

      const newResult = common.Shape();
      common.delete();

      if (!newResult) throw new Error('Boolean intersection operation failed');
      result = newResult;
    }

    if (!result) throw new Error('Boolean intersection: final result is null');
    const handle = this.handleUtils.createHandle(result, 'solid');
    return handle;
  }
}
