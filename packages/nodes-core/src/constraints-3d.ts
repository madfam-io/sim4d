import type { NodeDefinition, ShapeHandle, AssemblyHandle } from '@sim4d/types';

export const CoincidentConstraintNode: NodeDefinition<
  {
    assembly: AssemblyHandle;
    part1: ShapeHandle;
    part2: ShapeHandle;
    element1?: ShapeHandle;
    element2?: ShapeHandle;
  },
  { assembly: AssemblyHandle },
  { tolerance: number }
> = {
  id: 'Constraint3D::Coincident',
  category: '3D Constraint',
  label: 'Coincident',
  description: 'Make two geometric elements coincident',
  inputs: {
    assembly: { type: 'Assembly' },
    part1: { type: 'Shape' },
    part2: { type: 'Shape' },
    element1: { type: 'Shape', optional: true },
    element2: { type: 'Shape', optional: true },
  },
  outputs: {
    assembly: { type: 'Assembly' },
  },
  params: {
    tolerance: {
      type: 'number',
      label: 'Tolerance',
      default: 0.01,
      min: 0.001,
      max: 1.0,
    },
  },
  async evaluate(ctx, inputs, params) {
    const result = await ctx.worker.invoke('CREATE_3D_COINCIDENT', {
      assembly: inputs.assembly,
      part1: inputs.part1,
      part2: inputs.part2,
      element1: inputs.element1,
      element2: inputs.element2,
      tolerance: params.tolerance,
    });
    return { assembly: result };
  },
};

export const ConcentricConstraintNode: NodeDefinition<
  {
    assembly: AssemblyHandle;
    part1: ShapeHandle;
    part2: ShapeHandle;
    axis1: ShapeHandle;
    axis2: ShapeHandle;
  },
  { assembly: AssemblyHandle },
  { tolerance: number }
> = {
  id: 'Constraint3D::Concentric',
  category: '3D Constraint',
  label: 'Concentric',
  description: 'Make two cylindrical elements concentric',
  inputs: {
    assembly: { type: 'Assembly' },
    part1: { type: 'Shape' },
    part2: { type: 'Shape' },
    axis1: { type: 'Shape' },
    axis2: { type: 'Shape' },
  },
  outputs: {
    assembly: { type: 'Assembly' },
  },
  params: {
    tolerance: {
      type: 'number',
      label: 'Tolerance',
      default: 0.01,
      min: 0.001,
      max: 1.0,
    },
  },
  async evaluate(ctx, inputs, params) {
    const result = await ctx.worker.invoke('CREATE_3D_CONCENTRIC', {
      assembly: inputs.assembly,
      part1: inputs.part1,
      part2: inputs.part2,
      axis1: inputs.axis1,
      axis2: inputs.axis2,
      tolerance: params.tolerance,
    });
    return { assembly: result };
  },
};

export const ParallelConstraintNode: NodeDefinition<
  {
    assembly: AssemblyHandle;
    part1: ShapeHandle;
    part2: ShapeHandle;
    face1: ShapeHandle;
    face2: ShapeHandle;
  },
  { assembly: AssemblyHandle },
  { tolerance: number }
> = {
  id: 'Constraint3D::Parallel',
  category: '3D Constraint',
  label: 'Parallel',
  description: 'Make two faces or axes parallel',
  inputs: {
    assembly: { type: 'Assembly' },
    part1: { type: 'Shape' },
    part2: { type: 'Shape' },
    face1: { type: 'Shape' },
    face2: { type: 'Shape' },
  },
  outputs: {
    assembly: { type: 'Assembly' },
  },
  params: {
    tolerance: {
      type: 'number',
      label: 'Tolerance',
      default: 0.01,
      min: 0.001,
      max: 1.0,
    },
  },
  async evaluate(ctx, inputs, params) {
    const result = await ctx.worker.invoke('CREATE_3D_PARALLEL', {
      assembly: inputs.assembly,
      part1: inputs.part1,
      part2: inputs.part2,
      face1: inputs.face1,
      face2: inputs.face2,
      tolerance: params.tolerance,
    });
    return { assembly: result };
  },
};

export const PerpendicularConstraintNode: NodeDefinition<
  {
    assembly: AssemblyHandle;
    part1: ShapeHandle;
    part2: ShapeHandle;
    face1: ShapeHandle;
    face2: ShapeHandle;
  },
  { assembly: AssemblyHandle },
  { tolerance: number }
> = {
  id: 'Constraint3D::Perpendicular',
  category: '3D Constraint',
  label: 'Perpendicular',
  description: 'Make two faces or axes perpendicular',
  inputs: {
    assembly: { type: 'Assembly' },
    part1: { type: 'Shape' },
    part2: { type: 'Shape' },
    face1: { type: 'Shape' },
    face2: { type: 'Shape' },
  },
  outputs: {
    assembly: { type: 'Assembly' },
  },
  params: {
    tolerance: {
      type: 'number',
      label: 'Tolerance',
      default: 0.01,
      min: 0.001,
      max: 1.0,
    },
  },
  async evaluate(ctx, inputs, params) {
    const result = await ctx.worker.invoke('CREATE_3D_PERPENDICULAR', {
      assembly: inputs.assembly,
      part1: inputs.part1,
      part2: inputs.part2,
      face1: inputs.face1,
      face2: inputs.face2,
      tolerance: params.tolerance,
    });
    return { assembly: result };
  },
};

export const DistanceConstraintNode: NodeDefinition<
  {
    assembly: AssemblyHandle;
    part1: ShapeHandle;
    part2: ShapeHandle;
    face1: ShapeHandle;
    face2: ShapeHandle;
  },
  { assembly: AssemblyHandle },
  { distance: number; tolerance: number }
> = {
  id: 'Constraint3D::Distance',
  category: '3D Constraint',
  label: 'Distance',
  description: 'Maintain a specific distance between elements',
  inputs: {
    assembly: { type: 'Assembly' },
    part1: { type: 'Shape' },
    part2: { type: 'Shape' },
    face1: { type: 'Shape' },
    face2: { type: 'Shape' },
  },
  outputs: {
    assembly: { type: 'Assembly' },
  },
  params: {
    distance: {
      type: 'number',
      label: 'Distance',
      default: 10,
      min: 0,
    },
    tolerance: {
      type: 'number',
      label: 'Tolerance',
      default: 0.01,
      min: 0.001,
      max: 1.0,
    },
  },
  async evaluate(ctx, inputs, params) {
    const result = await ctx.worker.invoke('CREATE_3D_DISTANCE', {
      assembly: inputs.assembly,
      part1: inputs.part1,
      part2: inputs.part2,
      face1: inputs.face1,
      face2: inputs.face2,
      distance: params.distance,
      tolerance: params.tolerance,
    });
    return { assembly: result };
  },
};

export const AngleConstraintNode: NodeDefinition<
  {
    assembly: AssemblyHandle;
    part1: ShapeHandle;
    part2: ShapeHandle;
    face1: ShapeHandle;
    face2: ShapeHandle;
  },
  { assembly: AssemblyHandle },
  { angle: number; tolerance: number }
> = {
  id: 'Constraint3D::Angle',
  category: '3D Constraint',
  label: 'Angle',
  description: 'Maintain a specific angle between elements',
  inputs: {
    assembly: { type: 'Assembly' },
    part1: { type: 'Shape' },
    part2: { type: 'Shape' },
    face1: { type: 'Shape' },
    face2: { type: 'Shape' },
  },
  outputs: {
    assembly: { type: 'Assembly' },
  },
  params: {
    angle: {
      type: 'number',
      label: 'Angle (degrees)',
      default: 90,
      min: 0,
      max: 180,
    },
    tolerance: {
      type: 'number',
      label: 'Tolerance',
      default: 0.01,
      min: 0.001,
      max: 1.0,
    },
  },
  async evaluate(ctx, inputs, params) {
    const result = await ctx.worker.invoke('CREATE_3D_ANGLE', {
      assembly: inputs.assembly,
      part1: inputs.part1,
      part2: inputs.part2,
      face1: inputs.face1,
      face2: inputs.face2,
      angle: params.angle,
      tolerance: params.tolerance,
    });
    return { assembly: result };
  },
};

export const TangentConstraintNode: NodeDefinition<
  {
    assembly: AssemblyHandle;
    part1: ShapeHandle;
    part2: ShapeHandle;
    surface1: ShapeHandle;
    surface2: ShapeHandle;
  },
  { assembly: AssemblyHandle },
  { tolerance: number }
> = {
  id: 'Constraint3D::Tangent',
  category: '3D Constraint',
  label: 'Tangent',
  description: 'Make two surfaces tangent',
  inputs: {
    assembly: { type: 'Assembly' },
    part1: { type: 'Shape' },
    part2: { type: 'Shape' },
    surface1: { type: 'Shape' },
    surface2: { type: 'Shape' },
  },
  outputs: {
    assembly: { type: 'Assembly' },
  },
  params: {
    tolerance: {
      type: 'number',
      label: 'Tolerance',
      default: 0.01,
      min: 0.001,
      max: 1.0,
    },
  },
  async evaluate(ctx, inputs, params) {
    const result = await ctx.worker.invoke('CREATE_3D_TANGENT', {
      assembly: inputs.assembly,
      part1: inputs.part1,
      part2: inputs.part2,
      surface1: inputs.surface1,
      surface2: inputs.surface2,
      tolerance: params.tolerance,
    });
    return { assembly: result };
  },
};

export const ConstraintSolverNode: NodeDefinition<
  { assembly: AssemblyHandle },
  { assembly: AssemblyHandle; solved: boolean },
  { maxIterations: number; convergence: number }
> = {
  id: 'Constraint3D::Solver',
  category: '3D Constraint',
  label: 'Constraint Solver',
  description: 'Solve 3D assembly constraints',
  inputs: {
    assembly: { type: 'Assembly' },
  },
  outputs: {
    assembly: { type: 'Assembly' },
    solved: { type: 'Boolean' },
  },
  params: {
    maxIterations: {
      type: 'number',
      label: 'Max Iterations',
      default: 100,
      min: 10,
      max: 1000,
    },
    convergence: {
      type: 'number',
      label: 'Convergence Tolerance',
      default: 1e-6,
      min: 1e-10,
      max: 1e-3,
    },
  },
  async evaluate(ctx, inputs, params) {
    const result = await ctx.worker.invoke('SOLVE_3D_CONSTRAINTS', {
      assembly: inputs.assembly,
      maxIterations: params.maxIterations,
      convergence: params.convergence,
    });
    return { assembly: result.assembly, solved: result.solved };
  },
};

export const constraints3DNodes = [
  CoincidentConstraintNode,
  ConcentricConstraintNode,
  ParallelConstraintNode,
  PerpendicularConstraintNode,
  DistanceConstraintNode,
  AngleConstraintNode,
  TangentConstraintNode,
  ConstraintSolverNode,
];
