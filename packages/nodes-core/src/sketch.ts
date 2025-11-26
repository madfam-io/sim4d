import type { NodeDefinition, Vec3, ShapeHandle } from '@sim4d/types';

export const LineNode: NodeDefinition<
  { start?: Vec3; end?: Vec3 },
  { curve: ShapeHandle },
  { start: Vec3; end: Vec3 }
> = {
  id: 'Sketch::Line',
  category: 'Sketch',
  label: 'Line',
  description: 'Create a line between two points',
  inputs: {
    start: { type: 'Vector', optional: true },
    end: { type: 'Vector', optional: true },
  },
  outputs: {
    curve: { type: 'Curve' },
  },
  params: {
    start: {
      type: 'vec3',
      label: 'Start Point',
      default: { x: 0, y: 0, z: 0 },
    },
    end: {
      type: 'vec3',
      label: 'End Point',
      default: { x: 100, y: 0, z: 0 },
    },
  },
  async evaluate(ctx, inputs, params) {
    const start = inputs.start || params.start;
    const end = inputs.end || params.end;

    const result = await ctx.worker.invoke('CREATE_LINE', { start, end });
    return { curve: result };
  },
};

export const CircleNode: NodeDefinition<
  { center?: Vec3; normal?: Vec3 },
  { curve: ShapeHandle },
  { center: Vec3; radius: number; normal: Vec3 }
> = {
  id: 'Sketch::Circle',
  category: 'Sketch',
  label: 'Circle',
  description: 'Create a circle',
  inputs: {
    center: { type: 'Vector', optional: true },
    normal: { type: 'Vector', optional: true },
  },
  outputs: {
    curve: { type: 'Curve' },
  },
  params: {
    center: {
      type: 'vec3',
      label: 'Center',
      default: { x: 0, y: 0, z: 0 },
    },
    radius: {
      type: 'number',
      label: 'Radius',
      default: 50,
      min: 0.001,
    },
    normal: {
      type: 'vec3',
      label: 'Normal',
      default: { x: 0, y: 0, z: 1 },
    },
  },
  async evaluate(ctx, inputs, params) {
    const center = inputs.center || params.center;
    const normal = inputs.normal || params.normal;

    const result = await ctx.worker.invoke('CREATE_CIRCLE', {
      center,
      radius: params.radius,
      normal,
    });
    return { curve: result };
  },
};

export const RectangleNode: NodeDefinition<
  { center?: Vec3 },
  { curve: ShapeHandle },
  { center: Vec3; width: number; height: number }
> = {
  id: 'Sketch::Rectangle',
  category: 'Sketch',
  label: 'Rectangle',
  description: 'Create a rectangle',
  inputs: {
    center: { type: 'Vector', optional: true },
  },
  outputs: {
    curve: { type: 'Curve' },
  },
  params: {
    center: {
      type: 'vec3',
      label: 'Center',
      default: { x: 0, y: 0, z: 0 },
    },
    width: {
      type: 'number',
      label: 'Width',
      default: 100,
      min: 0.001,
    },
    height: {
      type: 'number',
      label: 'Height',
      default: 60,
      min: 0.001,
    },
  },
  async evaluate(ctx, inputs, params) {
    const center = inputs.center || params.center;

    const result = await ctx.worker.invoke('CREATE_RECTANGLE', {
      center,
      width: params.width,
      height: params.height,
    });
    return { curve: result };
  },
};

export const ArcNode: NodeDefinition<
  { center?: Vec3; start?: Vec3; end?: Vec3 },
  { curve: ShapeHandle },
  { center: Vec3; radius: number; startAngle: number; endAngle: number }
> = {
  id: 'Sketch::Arc',
  category: 'Sketch',
  label: 'Arc',
  description: 'Create an arc',
  inputs: {
    center: { type: 'Vector', optional: true },
    start: { type: 'Vector', optional: true },
    end: { type: 'Vector', optional: true },
  },
  outputs: {
    curve: { type: 'Curve' },
  },
  params: {
    center: {
      type: 'vec3',
      label: 'Center',
      default: { x: 0, y: 0, z: 0 },
    },
    radius: {
      type: 'number',
      label: 'Radius',
      default: 50,
      min: 0.001,
    },
    startAngle: {
      type: 'number',
      label: 'Start Angle',
      default: 0,
      min: 0,
      max: 360,
    },
    endAngle: {
      type: 'number',
      label: 'End Angle',
      default: 90,
      min: 0,
      max: 360,
    },
  },
  async evaluate(ctx, inputs, params) {
    const center = inputs.center || params.center;

    const result = await ctx.worker.invoke('CREATE_ARC', {
      center,
      radius: params.radius,
      startAngle: params.startAngle,
      endAngle: params.endAngle,
    });
    return { curve: result };
  },
};

export const PointNode: NodeDefinition<
  { position?: Vec3 },
  { point: ShapeHandle },
  { x: number; y: number; z: number }
> = {
  id: 'Sketch::Point',
  category: 'Sketch',
  label: 'Point',
  description: 'Create a point in 3D space',
  inputs: {
    position: { type: 'Vector', optional: true },
  },
  outputs: {
    point: { type: 'Point' },
  },
  params: {
    x: {
      type: 'number',
      label: 'X',
      default: 0,
    },
    y: {
      type: 'number',
      label: 'Y',
      default: 0,
    },
    z: {
      type: 'number',
      label: 'Z',
      default: 0,
    },
  },
  async evaluate(ctx, inputs, params) {
    const position = inputs.position || { x: params.x, y: params.y, z: params.z };

    const result = await ctx.worker.invoke('CREATE_POINT', {
      x: position.x,
      y: position.y,
      z: position.z,
    });
    return { point: result };
  },
};

export const EllipseNode: NodeDefinition<
  { center?: Vec3; normal?: Vec3 },
  { curve: ShapeHandle },
  { center: Vec3; majorRadius: number; minorRadius: number; normal: Vec3 }
> = {
  id: 'Sketch::Ellipse',
  category: 'Sketch',
  label: 'Ellipse',
  description: 'Create an ellipse',
  inputs: {
    center: { type: 'Vector', optional: true },
    normal: { type: 'Vector', optional: true },
  },
  outputs: {
    curve: { type: 'Curve' },
  },
  params: {
    center: {
      type: 'vec3',
      label: 'Center',
      default: { x: 0, y: 0, z: 0 },
    },
    majorRadius: {
      type: 'number',
      label: 'Major Radius',
      default: 50,
      min: 0.001,
    },
    minorRadius: {
      type: 'number',
      label: 'Minor Radius',
      default: 30,
      min: 0.001,
    },
    normal: {
      type: 'vec3',
      label: 'Normal',
      default: { x: 0, y: 0, z: 1 },
    },
  },
  async evaluate(ctx, inputs, params) {
    const center = inputs.center || params.center;
    const normal = inputs.normal || params.normal;

    const result = await ctx.worker.invoke('CREATE_ELLIPSE', {
      center,
      majorRadius: params.majorRadius,
      minorRadius: params.minorRadius,
      normal,
    });
    return { curve: result };
  },
};

export const PolygonNode: NodeDefinition<
  { points?: Vec3[] },
  { curve: ShapeHandle },
  { points: Vec3[]; closed: boolean }
> = {
  id: 'Sketch::Polygon',
  category: 'Sketch',
  label: 'Polygon',
  description: 'Create a polygon from points',
  inputs: {
    points: { type: 'Vector', multiple: true, optional: true },
  },
  outputs: {
    curve: { type: 'Curve' },
  },
  params: {
    points: {
      type: 'vec3array',
      label: 'Points',
      default: [
        { x: 0, y: 0, z: 0 },
        { x: 50, y: 0, z: 0 },
        { x: 25, y: 43.3, z: 0 }, // Triangle by default
      ],
    },
    closed: {
      type: 'boolean',
      label: 'Closed',
      default: true,
    },
  },
  async evaluate(ctx, inputs, params) {
    const points = inputs.points || params.points;

    if (!points || points.length < 3) {
      throw new Error('Polygon requires at least 3 points');
    }

    const result = await ctx.worker.invoke('CREATE_POLYGON', {
      points,
      closed: params.closed,
    });
    return { curve: result };
  },
};

export const sketchNodes = [
  LineNode,
  CircleNode,
  RectangleNode,
  ArcNode,
  PointNode,
  EllipseNode,
  PolygonNode,
];
