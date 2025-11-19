import type { NodeDefinition, ShapeHandle, ConstraintHandle } from '@brepflow/types';

export const CoincidentConstraintNode: NodeDefinition<
  { shape1: ShapeHandle; shape2: ShapeHandle },
  { constraint: ConstraintHandle },
  { offset: number }
> = {
  id: 'Constraints::Coincident',
  category: 'Constraints',
  label: 'Coincident',
  description: 'Constrain two points to be coincident',
  inputs: {
    shape1: { type: 'Shape' },
    shape2: { type: 'Shape' },
  },
  outputs: {
    constraint: { type: 'Constraint' },
  },
  params: {
    offset: {
      type: 'number',
      label: 'Offset',
      default: 0,
      min: -100,
      max: 100,
    },
  },
  evaluate: async (ctx, inputs, params): Promise<{ constraint: ConstraintHandle }> => {
    const shape1 = inputs.shape1;
    const shape2 = inputs.shape2;
    const offset = params.offset;

    const constraint = await ctx.constraintManager.createCoincidentConstraint({
      entity1: shape1,
      entity2: shape2,
      offset,
      options: Record<string, never> as Record<string, never>,
    });

    return { constraint };
  },
};

export const ParallelConstraintNode: NodeDefinition<
  { line1: ShapeHandle; line2: ShapeHandle },
  { result: unknown },
  Record<string, never>
> = {
  id: 'Constraints::Parallel',
  category: 'Constraints',
  label: 'Parallel',
  description: 'Constrain two lines to be parallel',
  inputs: {
    line1: { type: 'Shape' },
    line2: { type: 'Shape' },
  },
  outputs: {
    result: { type: 'Any' },
  },
  params: {},
  async evaluate(ctx, inputs) {
    const result = await ctx.worker.invoke('CONSTRAINT_PARALLEL', {
      line1: inputs.line1,
      line2: inputs.line2,
    });
    return { result };
  },
};

export const PerpendicularConstraintNode: NodeDefinition<
  { line1: ShapeHandle; line2: ShapeHandle },
  { result: unknown },
  Record<string, never>
> = {
  id: 'Constraints::Perpendicular',
  category: 'Constraints',
  label: 'Perpendicular',
  description: 'Constrain two lines to be perpendicular',
  inputs: {
    line1: { type: 'Shape' },
    line2: { type: 'Shape' },
  },
  outputs: {
    result: { type: 'Any' },
  },
  params: {},
  async evaluate(ctx, inputs) {
    const result = await ctx.worker.invoke('CONSTRAINT_PERPENDICULAR', {
      line1: inputs.line1,
      line2: inputs.line2,
    });
    return { result };
  },
};

export const TangentConstraintNode: NodeDefinition<
  { curve1: ShapeHandle; curve2: ShapeHandle },
  { result: unknown },
  Record<string, never>
> = {
  id: 'Constraints::Tangent',
  category: 'Constraints',
  label: 'Tangent',
  description: 'Constrain two curves to be tangent',
  inputs: {
    curve1: { type: 'Shape' },
    curve2: { type: 'Shape' },
  },
  outputs: {
    result: { type: 'Any' },
  },
  params: {},
  async evaluate(ctx, inputs) {
    const result = await ctx.worker.invoke('CONSTRAINT_TANGENT', {
      curve1: inputs.curve1,
      curve2: inputs.curve2,
    });
    return { result };
  },
};

export const DistanceConstraintNode: NodeDefinition<
  { entity1: ShapeHandle; entity2: ShapeHandle },
  { result: unknown },
  { distance: number }
> = {
  id: 'Constraints::Distance',
  category: 'Constraints',
  label: 'Distance',
  description: 'Constrain distance between two entities',
  inputs: {
    entity1: { type: 'Shape' },
    entity2: { type: 'Shape' },
  },
  outputs: {
    result: { type: 'Any' },
  },
  params: {
    distance: {
      type: 'number',
      label: 'Distance',
      default: 10,
      min: 0,
    },
  },
  async evaluate(ctx, inputs, params) {
    const result = await ctx.worker.invoke('CONSTRAINT_DISTANCE', {
      entity1: inputs.entity1,
      entity2: inputs.entity2,
      distance: params.distance,
    });
    return { result };
  },
};

export const AngleConstraintNode: NodeDefinition<
  { line1: ShapeHandle; line2: ShapeHandle },
  { result: unknown },
  { angle: number }
> = {
  id: 'Constraints::Angle',
  category: 'Constraints',
  label: 'Angle',
  description: 'Constrain angle between two lines',
  inputs: {
    line1: { type: 'Shape' },
    line2: { type: 'Shape' },
  },
  outputs: {
    result: { type: 'Any' },
  },
  params: {
    angle: {
      type: 'number',
      label: 'Angle (degrees)',
      default: 90,
      min: 0,
      max: 180,
    },
  },
  async evaluate(ctx, inputs, params) {
    const result = await ctx.worker.invoke('CONSTRAINT_ANGLE', {
      line1: inputs.line1,
      line2: inputs.line2,
      angle: (params.angle * Math.PI) / 180,
    });
    return { result };
  },
};

export const RadiusConstraintNode: NodeDefinition<
  { circle: ShapeHandle },
  { result: unknown },
  { radius: number }
> = {
  id: 'Constraints::Radius',
  category: 'Constraints',
  label: 'Radius',
  description: 'Constrain radius of a circle or arc',
  inputs: {
    circle: { type: 'Shape' },
  },
  outputs: {
    result: { type: 'Any' },
  },
  params: {
    radius: {
      type: 'number',
      label: 'Radius',
      default: 5,
      min: 0,
    },
  },
  async evaluate(ctx, inputs, params) {
    const result = await ctx.worker.invoke('CONSTRAINT_RADIUS', {
      circle: inputs.circle,
      radius: params.radius,
    });
    return { result };
  },
};

export const HorizontalConstraintNode: NodeDefinition<
  { line: ShapeHandle },
  { result: unknown },
  Record<string, never>
> = {
  id: 'Constraints::Horizontal',
  category: 'Constraints',
  label: 'Horizontal',
  description: 'Constrain a line to be horizontal',
  inputs: {
    line: { type: 'Shape' },
  },
  outputs: {
    result: { type: 'Any' },
  },
  params: {},
  async evaluate(ctx, inputs) {
    const result = await ctx.worker.invoke('CONSTRAINT_HORIZONTAL', {
      line: inputs.line,
    });
    return { result };
  },
};

export const VerticalConstraintNode: NodeDefinition<
  { line: ShapeHandle },
  { result: unknown },
  Record<string, never>
> = {
  id: 'Constraints::Vertical',
  category: 'Constraints',
  label: 'Vertical',
  description: 'Constrain a line to be vertical',
  inputs: {
    line: { type: 'Shape' },
  },
  outputs: {
    result: { type: 'Any' },
  },
  params: {},
  async evaluate(ctx, inputs) {
    const result = await ctx.worker.invoke('CONSTRAINT_VERTICAL', {
      line: inputs.line,
    });
    return { result };
  },
};

export const EqualConstraintNode: NodeDefinition<
  { entity1: ShapeHandle; entity2: ShapeHandle },
  { result: unknown },
  Record<string, never>
> = {
  id: 'Constraints::Equal',
  category: 'Constraints',
  label: 'Equal',
  description: 'Constrain two entities to have equal dimensions',
  inputs: {
    entity1: { type: 'Shape' },
    entity2: { type: 'Shape' },
  },
  outputs: {
    result: { type: 'Any' },
  },
  params: {},
  async evaluate(ctx, inputs) {
    const result = await ctx.worker.invoke('CONSTRAINT_EQUAL', {
      entity1: inputs.entity1,
      entity2: inputs.entity2,
    });
    return { result };
  },
};

export const SymmetricConstraintNode: NodeDefinition<
  { entity1: ShapeHandle; entity2: ShapeHandle; axis: ShapeHandle },
  { result: unknown },
  Record<string, never>
> = {
  id: 'Constraints::Symmetric',
  category: 'Constraints',
  label: 'Symmetric',
  description: 'Constrain two entities to be symmetric about an axis',
  inputs: {
    entity1: { type: 'Shape' },
    entity2: { type: 'Shape' },
    axis: { type: 'Shape' },
  },
  outputs: {
    result: { type: 'Any' },
  },
  params: {},
  async evaluate(ctx, inputs) {
    const result = await ctx.worker.invoke('CONSTRAINT_SYMMETRIC', {
      entity1: inputs.entity1,
      entity2: inputs.entity2,
      axis: inputs.axis,
    });
    return { result };
  },
};

export const FixedConstraintNode: NodeDefinition<
  { entity: ShapeHandle },
  { result: unknown },
  Record<string, never>
> = {
  id: 'Constraints::Fixed',
  category: 'Constraints',
  label: 'Fixed',
  description: 'Fix an entity in place',
  inputs: {
    entity: { type: 'Shape' },
  },
  outputs: {
    result: { type: 'Any' },
  },
  params: {},
  async evaluate(ctx, inputs) {
    const result = await ctx.worker.invoke('CONSTRAINT_FIXED', {
      entity: inputs.entity,
    });
    return { result };
  },
};

export const ConcentricConstraintNode: NodeDefinition<
  { circle1: ShapeHandle; circle2: ShapeHandle },
  { result: unknown },
  Record<string, never>
> = {
  id: 'Constraints::Concentric',
  category: 'Constraints',
  label: 'Concentric',
  description: 'Constrain two circles to be concentric',
  inputs: {
    circle1: { type: 'Shape' },
    circle2: { type: 'Shape' },
  },
  outputs: {
    result: { type: 'Any' },
  },
  params: {},
  async evaluate(ctx, inputs) {
    const result = await ctx.worker.invoke('CONSTRAINT_CONCENTRIC', {
      circle1: inputs.circle1,
      circle2: inputs.circle2,
    });
    return { result };
  },
};

export const ConstraintSolverNode: NodeDefinition<
  { constraints: unknown[] },
  { solvedGeometry: ShapeHandle },
  { maxIterations: number; tolerance: number; method: string }
> = {
  id: 'Constraints::Solver',
  category: 'Constraints',
  label: 'Constraint Solver',
  description: 'Solve a system of constraints',
  inputs: {
    constraints: { type: 'Any', multiple: true },
  },
  outputs: {
    solvedGeometry: { type: 'Shape' },
  },
  params: {
    maxIterations: {
      type: 'number',
      label: 'Max Iterations',
      default: 100,
      min: 1,
      max: 1000,
    },
    tolerance: {
      type: 'number',
      label: 'Tolerance',
      default: 0.000001,
      min: 0.0000001,
      max: 0.01,
    },
    method: {
      type: 'string',
      label: 'Solver Method',
      default: 'newton-raphson',
      options: ['newton-raphson', 'gradient-descent', 'hybrid'],
    },
  },
  async evaluate(ctx, inputs, params) {
    const result = await ctx.worker.invoke('SOLVE_CONSTRAINTS', {
      constraints: inputs.constraints,
      maxIterations: params.maxIterations,
      tolerance: params.tolerance,
      method: params.method,
    });
    return { solvedGeometry: result };
  },
};

export const constraintNodes = [
  CoincidentConstraintNode,
  ParallelConstraintNode,
  PerpendicularConstraintNode,
  TangentConstraintNode,
  DistanceConstraintNode,
  AngleConstraintNode,
  RadiusConstraintNode,
  HorizontalConstraintNode,
  VerticalConstraintNode,
  EqualConstraintNode,
  SymmetricConstraintNode,
  FixedConstraintNode,
  ConcentricConstraintNode,
  ConstraintSolverNode,
];
