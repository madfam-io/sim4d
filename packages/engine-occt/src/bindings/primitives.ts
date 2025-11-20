/**
 * OCCT Primitive Operations
 *
 * This module handles creation of primitive 3D solids and 2D shapes:
 * - 3D Primitives: Box, Sphere, Cylinder, Cone, Torus
 * - 2D Primitives: Line, Circle, Rectangle, Arc, Point, Ellipse, Polygon
 */

import type { ShapeHandle, Vec3, BoundingBox } from '@brepflow/types';
import { createHandleId } from '@brepflow/types';
import type { WASMModule } from '../occt-bindings';
import type { OCCTShape, OCCTVec3, OCCTHandle } from './types';
import { getLogger } from '../production-logger';

const _logger = getLogger('OCCT:Primitives');

export class OCCTPrimitives {
  private shapes: Map<string, OCCTShape>;
  private occt: WASMModule;
  private nextId: number;

  constructor(occt: WASMModule, shapes: Map<string, OCCTShape>, startId: number = 1) {
    this.occt = occt;
    this.shapes = shapes;
    this.nextId = startId;
  }

  /**
   * Generate unique shape ID
   */
  generateId(): string {
    return `shape_${this.nextId++}`;
  }

  /**
   * Get current ID counter (for synchronization with parent)
   */
  getCurrentId(): number {
    return this.nextId;
  }

  /**
   * Set ID counter (for synchronization with parent)
   */
  setCurrentId(id: number): void {
    this.nextId = id;
  }

  // ============================================================================
  // Helper Methods
  // ============================================================================

  /**
   * Create Vec3 from JS object
   */
  private createVec3(v: Vec3): OCCTVec3 {
    const vec = new this.occt.gp_Vec();
    vec.SetCoord(v.x, v.y, v.z);
    return vec;
  }

  /**
   * Create point from JS object
   */
  private createPoint(v: Vec3): OCCTHandle {
    return new this.occt.gp_Pnt(v.x, v.y, v.z);
  }

  /**
   * Create direction from JS object
   */
  private createDir(v: Vec3): OCCTHandle {
    return new this.occt.gp_Dir(v.x, v.y, v.z);
  }

  /**
   * Create axis from center and direction
   */
  private createAxis(center: Vec3, direction: Vec3): OCCTHandle {
    const pnt = this.createPoint(center);
    const dir = this.createDir(direction);
    return new this.occt.gp_Ax2(pnt, dir);
  }

  /**
   * Calculate bounding box for shape
   */
  private calculateBounds(shape: OCCTShape): BoundingBox {
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
  private createHandle(
    shape: OCCTShape,
    type: 'solid' | 'surface' | 'curve' = 'solid'
  ): ShapeHandle {
    const id = this.generateId();
    const bbox = this.calculateBounds(shape);

    this.shapes.set(id, shape);

    return {
      id: createHandleId(id),
      type,
      bbox,
      hash: id.substring(0, 16),
    };
  }

  // ============================================================================
  // 3D Primitive Operations
  // ============================================================================

  /**
   * Create box primitive
   */
  makeBox(params: unknown): ShapeHandle {
    const builder = new this.occt.BRepPrimAPI_MakeBox(
      params.width || 100,
      params.height || 100,
      params.depth || 100
    );

    const shape = builder.Shape();
    const handle = this.createHandle(shape, 'solid');

    builder.delete();
    return handle;
  }

  /**
   * Create sphere primitive
   */
  makeSphere(params: unknown): ShapeHandle {
    const center = this.createPoint(params.center || { x: 0, y: 0, z: 0 });
    const builder = new this.occt.BRepPrimAPI_MakeSphere(center, params.radius || 50);

    const shape = builder.Shape();
    const handle = this.createHandle(shape, 'solid');

    center.delete();
    builder.delete();
    return handle;
  }

  /**
   * Create cylinder primitive
   */
  makeCylinder(params: unknown): ShapeHandle {
    const axis = this.createAxis(
      params.center || { x: 0, y: 0, z: 0 },
      params.axis || { x: 0, y: 0, z: 1 }
    );

    const builder = new this.occt.BRepPrimAPI_MakeCylinder(
      axis,
      params.radius || 50,
      params.height || 100
    );

    const shape = builder.Shape();
    const handle = this.createHandle(shape, 'solid');

    axis.delete();
    builder.delete();
    return handle;
  }

  /**
   * Create cone primitive
   */
  makeCone(params: unknown): ShapeHandle {
    const axis = this.createAxis(
      params.center || { x: 0, y: 0, z: 0 },
      params.axis || { x: 0, y: 0, z: 1 }
    );

    const builder = new this.occt.BRepPrimAPI_MakeCone(
      axis,
      params.radius1 || 50,
      params.radius2 || 25,
      params.height || 100
    );

    const shape = builder.Shape();
    const handle = this.createHandle(shape, 'solid');

    axis.delete();
    builder.delete();
    return handle;
  }

  /**
   * Create torus primitive
   */
  makeTorus(params: unknown): ShapeHandle {
    const axis = this.createAxis(
      params.center || { x: 0, y: 0, z: 0 },
      params.axis || { x: 0, y: 0, z: 1 }
    );

    const builder = new this.occt.BRepPrimAPI_MakeTorus(
      axis,
      params.majorRadius || 50,
      params.minorRadius || 20
    );

    const shape = builder.Shape();
    const handle = this.createHandle(shape, 'solid');

    axis.delete();
    builder.delete();
    return handle;
  }

  // ============================================================================
  // 2D Primitive Operations
  // ============================================================================

  /**
   * Create line (edge)
   */
  createLine(params: unknown): ShapeHandle {
    const start = this.createPoint(params.start);
    const end = this.createPoint(params.end);

    const edge = new this.occt.BRepBuilderAPI_MakeEdge(start, end);
    const shape = edge.Shape();
    const handle = this.createHandle(shape, 'curve');

    start.delete();
    end.delete();
    edge.delete();
    return handle;
  }

  /**
   * Create circle (wire)
   */
  createCircle(params: unknown): ShapeHandle {
    const center = this.createPoint(params.center || { x: 0, y: 0, z: 0 });
    const normal = this.createDir(params.normal || { x: 0, y: 0, z: 1 });
    const axis = new this.occt.gp_Ax2(center, normal);

    const circle = new this.occt.gp_Circ(axis, params.radius || 50);
    const edge = new this.occt.BRepBuilderAPI_MakeEdge(circle);
    const wire = new this.occt.BRepBuilderAPI_MakeWire(edge.Edge());

    const shape = wire.Shape();
    const handle = this.createHandle(shape, 'curve');

    center.delete();
    normal.delete();
    axis.delete();
    circle.delete();
    edge.delete();
    wire.delete();
    return handle;
  }

  /**
   * Create rectangle (wire)
   */
  createRectangle(params: unknown): ShapeHandle {
    const center = params.center || { x: 0, y: 0, z: 0 };
    const width = params.width || 100;
    const height = params.height || 100;

    const p1 = this.createPoint({ x: center.x - width / 2, y: center.y - height / 2, z: center.z });
    const p2 = this.createPoint({ x: center.x + width / 2, y: center.y - height / 2, z: center.z });
    const p3 = this.createPoint({ x: center.x + width / 2, y: center.y + height / 2, z: center.z });
    const p4 = this.createPoint({ x: center.x - width / 2, y: center.y + height / 2, z: center.z });

    const wire = new this.occt.BRepBuilderAPI_MakeWire();
    wire.Add(new this.occt.BRepBuilderAPI_MakeEdge(p1, p2).Edge());
    wire.Add(new this.occt.BRepBuilderAPI_MakeEdge(p2, p3).Edge());
    wire.Add(new this.occt.BRepBuilderAPI_MakeEdge(p3, p4).Edge());
    wire.Add(new this.occt.BRepBuilderAPI_MakeEdge(p4, p1).Edge());

    const shape = wire.Shape();
    const handle = this.createHandle(shape, 'curve');

    p1.delete();
    p2.delete();
    p3.delete();
    p4.delete();
    wire.delete();
    return handle;
  }

  /**
   * Create arc (edge)
   */
  createArc(params: unknown): ShapeHandle {
    const center = this.createPoint(params.center || { x: 0, y: 0, z: 0 });
    const start = this.createPoint(params.start);
    const end = this.createPoint(params.end);

    const arc = new this.occt.GC_MakeArcOfCircle(start, center, end);
    const edge = new this.occt.BRepBuilderAPI_MakeEdge(arc.Value());

    const shape = edge.Shape();
    const handle = this.createHandle(shape, 'curve');

    center.delete();
    start.delete();
    end.delete();
    arc.delete();
    edge.delete();
    return handle;
  }

  /**
   * Create point (vertex)
   */
  createPointShape(params: unknown): ShapeHandle {
    const { x = 0, y = 0, z = 0 } = params;

    const point = new this.occt.gp_Pnt(x, y, z);
    const vertex = new this.occt.BRepBuilderAPI_MakeVertex(point);
    vertex.Build();

    if (!vertex.IsDone()) {
      throw new Error('Failed to create point');
    }

    const shape = vertex.Shape();
    const id = this.generateId();
    this.shapes.set(id, shape);

    return { id: createHandleId(id), type: 'Point' };
  }

  /**
   * Create ellipse (edge)
   */
  createEllipse(params: unknown): ShapeHandle {
    const {
      center = { x: 0, y: 0, z: 0 },
      majorRadius = 50,
      minorRadius = 30,
      normal = { x: 0, y: 0, z: 1 },
    } = params;

    const centerPnt = new this.occt.gp_Pnt(center.x, center.y, center.z);
    const normalVec = new this.occt.gp_Dir(normal.x, normal.y, normal.z);
    const majorVec = new this.occt.gp_Dir(1, 0, 0); // Default major axis direction

    const axis = new this.occt.gp_Ax2(centerPnt, normalVec, majorVec);
    const ellipse = new this.occt.gp_Elips(axis, majorRadius, minorRadius);

    const curve = new this.occt.GC_MakeEllipse(ellipse);
    const edge = new this.occt.BRepBuilderAPI_MakeEdge(curve.Value());
    edge.Build();

    if (!edge.IsDone()) {
      throw new Error('Failed to create ellipse');
    }

    const shape = edge.Shape();
    const id = this.generateId();
    this.shapes.set(id, shape);

    return { id: createHandleId(id), type: 'Curve' };
  }

  /**
   * Create polygon (wire)
   */
  createPolygon(params: unknown): ShapeHandle {
    const { points = [], closed = true } = params;

    if (points.length < 3) {
      throw new Error('Polygon requires at least 3 points');
    }

    const wire = new this.occt.BRepBuilderAPI_MakeWire();

    for (let i = 0; i < points.length; i++) {
      const current = points[i];
      const next = points[(i + 1) % points.length];

      if (i === points.length - 1 && !closed) break;

      const p1 = new this.occt.gp_Pnt(current.x, current.y, current.z || 0);
      const p2 = new this.occt.gp_Pnt(next.x, next.y, next.z || 0);

      const line = new this.occt.GC_MakeSegment(p1, p2);
      const edge = new this.occt.BRepBuilderAPI_MakeEdge(line.Value());
      edge.Build();

      if (edge.IsDone()) {
        wire.Add(edge.Shape());
      }
    }

    wire.Build();

    if (!wire.IsDone()) {
      throw new Error('Failed to create polygon');
    }

    const shape = wire.Shape();
    const id = this.generateId();
    this.shapes.set(id, shape);

    return { id: createHandleId(id), type: 'Wire' };
  }
}
