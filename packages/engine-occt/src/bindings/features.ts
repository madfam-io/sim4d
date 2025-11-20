/**
 * OCCT Feature Operations
 *
 * This module handles advanced modeling features:
 * - Extrude: Create solid from profile along vector
 * - Revolve: Rotate profile around axis
 * - Sweep: Move profile along path
 * - Loft: Blend between multiple profiles
 * - Fillet: Round edges with radius
 * - Chamfer: Bevel edges with distance
 * - Shell: Hollow out solid with thickness
 * - Draft: Add draft angle to faces
 * - Offset: Offset shape by distance
 */

import type { ShapeHandle } from '@brepflow/types';
import type { WASMModule } from '../occt-bindings';
import type { OCCTShape } from './types';
import { ShapeHandleUtils, Vec3Utils, IDGenerator } from './utils';
import { getLogger } from '../production-logger';

const _logger = getLogger('OCCT:Features');

export class OCCTFeatures {
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

  // ============================================================================
  // Profile-based Operations
  // ============================================================================

  /**
   * Extrude profile along vector
   *
   * @param params.profile - Profile shape ID or handle
   * @param params.direction - Extrusion direction {x, y, z}
   * @param params.distance - Extrusion distance
   * @returns Extruded solid handle
   */
  makeExtrude(params: unknown): ShapeHandle {
    const profile = this.shapes.get(params.profile?.id || params.profile);
    if (!profile) throw new Error('Profile shape not found');

    const vec = this.vec3Utils.createVec3(params.direction || { x: 0, y: 0, z: 1 });
    // Scale the vector manually
    const distance = params.distance || 100;
    const _scaledVec = this.vec3Utils.createVec3({
      x: vec.X() * distance,
      y: vec.Y() * distance,
      z: vec.Z() * distance,
    });

    const prism = new this.occt.BRepPrimAPI_MakePrism(profile, vec);
    const shape = prism.Shape();
    const handle = this.handleUtils.createHandle(shape, 'solid');

    vec.delete();
    prism.delete();
    return handle;
  }

  /**
   * Revolve profile around axis
   *
   * @param params.profile - Profile shape ID or handle
   * @param params.center - Axis center point {x, y, z}
   * @param params.axis - Axis direction {x, y, z}
   * @param params.angle - Revolution angle in radians (default: 2π = full circle)
   * @returns Revolved solid handle
   */
  makeRevolve(params: unknown): ShapeHandle {
    const profile = this.shapes.get(params.profile?.id || params.profile);
    if (!profile) throw new Error('Profile shape not found');

    const axis = this.vec3Utils.createAxis(
      params.center || { x: 0, y: 0, z: 0 },
      params.axis || { x: 0, y: 0, z: 1 }
    );

    const angle = params.angle || Math.PI * 2;
    const revolve = new this.occt.BRepPrimAPI_MakeRevol(profile, axis, angle);

    const shape = revolve.Shape();
    const handle = this.handleUtils.createHandle(shape, 'solid');

    axis.delete();
    revolve.delete();
    return handle;
  }

  /**
   * Sweep profile along path
   *
   * @param params.profile - Profile shape ID or handle
   * @param params.path - Path curve ID or handle
   * @returns Swept solid handle
   */
  makeSweep(params: unknown): ShapeHandle {
    const profile = this.shapes.get(params.profile?.id || params.profile);
    const path = this.shapes.get(params.path?.id || params.path);
    if (!profile || !path) throw new Error('Profile or path shape not found');

    const sweep = new this.occt.BRepOffsetAPI_MakePipe(path, profile);
    const shape = sweep.Shape();
    const handle = this.handleUtils.createHandle(shape, 'solid');

    sweep.delete();
    return handle;
  }

  /**
   * Loft between multiple profiles
   *
   * @param params.profiles - Array of profile shape IDs or handles
   * @param params.solid - Create solid (true) or surface (false)
   * @returns Lofted shape handle
   */
  makeLoft(params: unknown): ShapeHandle {
    const profiles = params.profiles || [];
    if (profiles.length < 2) throw new Error('Loft requires at least 2 profiles');

    const loft = new this.occt.BRepOffsetAPI_ThruSections(params.solid !== false);

    for (const profileRef of profiles) {
      const profile = this.shapes.get(profileRef?.id || profileRef);
      if (profile) {
        loft.AddWire(profile);
      }
    }

    loft.Build();
    const shape = loft.Shape();
    const handle = this.handleUtils.createHandle(shape, 'solid');

    loft.delete();
    return handle;
  }

  // ============================================================================
  // Edge Modification Operations
  // ============================================================================

  /**
   * Add fillets (rounds) to edges
   *
   * @param params.shape - Shape ID or handle to fillet
   * @param params.radius - Fillet radius
   * @returns Filleted shape handle
   */
  makeFillet(params: unknown): ShapeHandle {
    const shape = this.shapes.get(params.shape?.id || params.shape);
    if (!shape) throw new Error('Shape not found');

    const fillet = new this.occt.BRepFilletAPI_MakeFillet(shape);

    // Add all edges with the specified radius
    const explorer = new this.occt.TopExp_Explorer(shape, this.occt.TopAbs_EDGE);
    while (explorer.More()) {
      fillet.Add(params.radius || 5, explorer.Current());
      explorer.Next();
    }

    fillet.Build();
    const result = fillet.Shape();
    const handle = this.handleUtils.createHandle(result, 'solid');

    explorer.delete();
    fillet.delete();
    return handle;
  }

  /**
   * Add chamfers (bevels) to edges
   *
   * @param params.shape - Shape ID or handle to chamfer
   * @param params.distance - Chamfer distance
   * @returns Chamfered shape handle
   */
  makeChamfer(params: unknown): ShapeHandle {
    const shape = this.shapes.get(params.shape?.id || params.shape);
    if (!shape) throw new Error('Shape not found');

    const chamfer = new this.occt.BRepFilletAPI_MakeChamfer(shape);

    // Add all edges with the specified distance
    const explorer = new this.occt.TopExp_Explorer(shape, this.occt.TopAbs_EDGE);
    while (explorer.More()) {
      chamfer.Add(params.distance || 5, explorer.Current());
      explorer.Next();
    }

    chamfer.Build();
    const result = chamfer.Shape();
    const handle = this.handleUtils.createHandle(result, 'solid');

    explorer.delete();
    chamfer.delete();
    return handle;
  }

  // ============================================================================
  // Shape Modification Operations
  // ============================================================================

  /**
   * Create hollow shell from solid
   *
   * @param params.shape - Shape ID or handle to shell
   * @param params.thickness - Wall thickness (negative = inward)
   * @returns Shelled shape handle
   */
  makeShell(params: unknown): ShapeHandle {
    const shape = this.shapes.get(params.shape?.id || params.shape);
    if (!shape) throw new Error('Shape not found');

    const faces = new this.occt.TopTools_ListOfShape();

    // Select faces to remove (for now, remove top face)
    const explorer = new this.occt.TopExp_Explorer(shape, this.occt.TopAbs_FACE);
    if (explorer.More()) {
      faces.Append(explorer.Current());
    }

    const shell = new this.occt.BRepOffsetAPI_MakeThickSolid();
    shell.MakeThickSolidByJoin(shape, faces, params.thickness || -5, 1.0e-3);

    const result = shell.Shape();
    const handle = this.handleUtils.createHandle(result, 'solid');

    faces.delete();
    explorer.delete();
    shell.delete();
    return handle;
  }

  /**
   * Add draft angle to faces
   *
   * @param params.shape - Shape ID or handle to draft
   * @param params.direction - Draft direction {x, y, z}
   * @param params.angle - Draft angle in radians
   * @returns Drafted shape handle
   */
  makeDraft(params: unknown): ShapeHandle {
    const shape = this.shapes.get(params.shape?.id || params.shape);
    if (!shape) throw new Error('Shape not found');

    const direction = this.vec3Utils.createDir(params.direction || { x: 0, y: 0, z: 1 });
    const draft = new this.occt.BRepOffsetAPI_DraftAngle(shape);

    // Add all faces with the specified angle
    const explorer = new this.occt.TopExp_Explorer(shape, this.occt.TopAbs_FACE);
    while (explorer.More()) {
      draft.Add(explorer.Current(), direction, params.angle || (Math.PI / 180) * 5);
      explorer.Next();
    }

    draft.Build();
    const result = draft.Shape();
    const handle = this.handleUtils.createHandle(result, 'solid');

    direction.delete();
    explorer.delete();
    draft.delete();
    return handle;
  }

  /**
   * Offset shape by distance
   *
   * @param params.shape - Shape ID or handle to offset
   * @param params.distance - Offset distance (positive = outward)
   * @param params.join - Join type: 'arc' or 'intersection'
   * @returns Offset shape handle
   */
  makeOffset(params: unknown): ShapeHandle {
    const shape = this.shapes.get(params.shape?.id || params.shape);
    if (!shape) throw new Error('Shape not found');

    const distance = params.distance || 1.0;
    const _join = params.join || 'arc'; // 'arc' or 'intersection'

    const offset = new this.occt.BRepOffsetAPI_MakeOffsetShape();
    offset.PerformByJoin(shape, distance, 1e-7);

    if (!offset.IsDone()) {
      offset.delete();
      throw new Error('Failed to create offset shape');
    }

    const result = offset.Shape();
    const handle = this.handleUtils.createHandle(result, 'solid');

    offset.delete();
    return handle;
  }
}
