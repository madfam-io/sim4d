/**
 * OCCT Analysis Operations
 *
 * This module handles shape analysis and measurement:
 * - Tessellate: Convert shape to triangle mesh
 * - Get Properties: Volume, center of mass, bounding box
 * - Get Volume: Calculate solid volume
 * - Get Area: Calculate surface area
 * - Get Center of Mass: Calculate centroid
 */

import type { Vec3, MeshData, BoundingBox } from '@sim4d/types';
import type { WASMModule } from '../occt-bindings';
import type { OCCTShape } from './types';
import { ShapeHandleUtils, IDGenerator } from './utils';
import { getLogger } from '../production-logger';

const _logger = getLogger('OCCT:Analysis');

export class OCCTAnalysis {
  private shapes: Map<string, OCCTShape>;
  private occt: WASMModule;
  private handleUtils: ShapeHandleUtils;

  constructor(occt: WASMModule, shapes: Map<string, OCCTShape>, idGen: IDGenerator) {
    this.occt = occt;
    this.shapes = shapes;
    this.handleUtils = new ShapeHandleUtils(occt, shapes, idGen);
  }

  // ============================================================================
  // Mesh Generation
  // ============================================================================

  /**
   * Tessellate shape to triangle mesh
   *
   * @param params.shape - Shape ID or handle to tessellate
   * @param params.deflection - Maximum distance between mesh and actual surface
   * @param params.angle - Angular deflection for curved surfaces
   * @returns Mesh data with positions, normals, and indices
   */
  async tessellate(params: unknown): Promise<MeshData> {
    const shapeId = params.shape?.id || params.shape || params.shapeId;
    const shape = this.shapes.get(shapeId);
    if (!shape) throw new Error('Shape not found');

    const mesher = new this.occt.BRepMesh_IncrementalMesh(
      shape,
      params.deflection || 0.1,
      false,
      params.angle || 0.5
    );

    mesher.Perform();

    // Extract mesh data
    const triangulation = new this.occt.Poly_Triangulation();
    const location = new this.occt.TopLoc_Location();

    const vertices: number[] = [];
    const normals: number[] = [];
    const indices: number[] = [];

    const explorer = new this.occt.TopExp_Explorer(shape, this.occt.TopAbs_FACE);
    let indexOffset = 0;

    while (explorer.More()) {
      const face = this.occt.TopoDS.Face(explorer.Current());
      const tri = this.occt.BRep_Tool.Triangulation(face, location);

      if (tri && !tri.IsNull()) {
        const nodes = tri.Nodes();
        const triangles = tri.Triangles();

        // Add vertices
        for (let i = 1; i <= nodes.Length(); i++) {
          const node = nodes.Value(i);
          vertices.push(node.X(), node.Y(), node.Z());

          // Calculate normal (simplified - should use face normal)
          normals.push(0, 0, 1);
        }

        // Add indices
        for (let i = 1; i <= triangles.Length(); i++) {
          const triangle = triangles.Value(i);
          indices.push(
            triangle.Value(1) - 1 + indexOffset,
            triangle.Value(2) - 1 + indexOffset,
            triangle.Value(3) - 1 + indexOffset
          );
        }

        indexOffset += nodes.Length();
      }

      explorer.Next();
    }

    mesher.delete();
    triangulation.delete();
    location.delete();
    explorer.delete();

    return {
      positions: new Float32Array(vertices),
      normals: new Float32Array(normals),
      indices: new Uint32Array(indices),
    };
  }

  // ============================================================================
  // Shape Properties
  // ============================================================================

  /**
   * Get comprehensive shape properties
   *
   * @param params.shape - Shape ID or handle to analyze
   * @returns Object with volume, center of mass, and bounding box
   */
  getProperties(params: unknown): {
    volume: number;
    centerOfMass: Vec3;
    boundingBox: BoundingBox;
  } {
    const shape = this.shapes.get(params.shape?.id || params.shape);
    if (!shape) throw new Error('Shape not found');

    const props = new this.occt.GProp_GProps();
    const calculator = new this.occt.BRepGProp();

    calculator.VolumeProperties(shape, props);

    const mass = props.Mass();
    const centerOfMass = props.CentreOfMass();

    const result = {
      volume: mass,
      centerOfMass: {
        x: centerOfMass.X(),
        y: centerOfMass.Y(),
        z: centerOfMass.Z(),
      },
      boundingBox: this.handleUtils.calculateBounds(shape),
    };

    props.delete();
    calculator.delete();

    return result;
  }

  /**
   * Get solid volume
   *
   * @param params.shape - Shape ID or handle to measure
   * @returns Volume in cubic units
   */
  getVolume(params: unknown): number {
    const shape = this.shapes.get(params.shape?.id || params.shape);
    if (!shape) throw new Error('Shape not found');

    const props = new this.occt.GProp_GProps();
    const calculator = new this.occt.BRepGProp();

    calculator.VolumeProperties(shape, props);
    const volume = props.Mass();

    props.delete();
    calculator.delete();

    return volume;
  }

  /**
   * Get surface area
   *
   * @param params.shape - Shape ID or handle to measure
   * @returns Surface area in square units
   */
  getArea(params: unknown): number {
    const shape = this.shapes.get(params.shape?.id || params.shape);
    if (!shape) throw new Error('Shape not found');

    const props = new this.occt.GProp_GProps();
    const calculator = new this.occt.BRepGProp();

    calculator.SurfaceProperties(shape, props);
    const area = props.Mass();

    props.delete();
    calculator.delete();

    return area;
  }

  /**
   * Get center of mass (centroid)
   *
   * @param params.shape - Shape ID or handle to analyze
   * @returns Center of mass coordinates {x, y, z}
   */
  getCenterOfMass(params: unknown): Vec3 {
    const shape = this.shapes.get(params.shape?.id || params.shape);
    if (!shape) throw new Error('Shape not found');

    const props = new this.occt.GProp_GProps();
    const calculator = new this.occt.BRepGProp();

    calculator.VolumeProperties(shape, props);
    const center = props.CentreOfMass();

    const result = {
      x: center.X(),
      y: center.Y(),
      z: center.Z(),
    };

    props.delete();
    calculator.delete();

    return result;
  }
}
