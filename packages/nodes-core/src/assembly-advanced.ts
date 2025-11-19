import type {
  NodeDefinition,
  ShapeHandle,
  Vec3,
  ComponentHandle,
  AssemblyHandle,
  MotionHandle,
  BillOfMaterials,
  AssemblyStep,
  JointHandle,
  InterferenceData,
} from '@brepflow/types';

export const AssemblyComponentNode: NodeDefinition<
  { part: ShapeHandle },
  { component: ComponentHandle },
  { name: string; material: string; color: string }
> = {
  id: 'Assembly::Component',
  category: 'Assembly',
  label: 'Assembly Component',
  description: 'Define a component for assembly',
  inputs: {
    part: { type: 'Shape' },
  },
  outputs: {
    component: { type: 'Any' },
  },
  params: {
    name: {
      type: 'string',
      label: 'Component Name',
      default: 'Component',
    },
    material: {
      type: 'string',
      label: 'Material',
      default: 'Steel',
      options: ['Steel', 'Aluminum', 'Plastic', 'Wood', 'Composite'],
    },
    color: {
      type: 'string',
      label: 'Color',
      default: '#808080',
    },
  },
  async evaluate(ctx, inputs, params) {
    const result = await ctx.worker.invoke('ASSEMBLY_COMPONENT', {
      part: inputs.part,
      name: params.name,
      material: params.material,
      color: params.color,
    });
    return { component: result };
  },
};

export const MateConstraintNode: NodeDefinition<
  { component1: ComponentHandle; component2: ComponentHandle },
  { assembly: AssemblyHandle },
  { mateType: string; offset: number; flip: boolean }
> = {
  id: 'Assembly::MateConstraint',
  category: 'Assembly',
  label: 'Mate Constraint',
  description: 'Create mate constraint between components',
  inputs: {
    component1: { type: 'Any' },
    component2: { type: 'Any' },
  },
  outputs: {
    assembly: { type: 'Any' },
  },
  params: {
    mateType: {
      type: 'string',
      label: 'Mate Type',
      default: 'coincident',
      options: [
        'coincident',
        'parallel',
        'perpendicular',
        'tangent',
        'concentric',
        'distance',
        'angle',
      ],
    },
    offset: {
      type: 'number',
      label: 'Offset/Value',
      default: 0,
    },
    flip: {
      type: 'boolean',
      label: 'Flip Alignment',
      default: false,
    },
  },
  async evaluate(ctx, inputs, params) {
    const result = await ctx.worker.invoke('MATE_CONSTRAINT', {
      component1: inputs.component1,
      component2: inputs.component2,
      mateType: params.mateType,
      offset: params.offset,
      flip: params.flip,
    });
    return { assembly: result };
  },
};

export const AssemblyHierarchyNode: NodeDefinition<
  { components: ComponentHandle[] },
  { assembly: AssemblyHandle },
  { name: string; rootOrigin: Vec3 }
> = {
  id: 'Assembly::Hierarchy',
  category: 'Assembly',
  label: 'Assembly Hierarchy',
  description: 'Create hierarchical assembly structure',
  inputs: {
    components: { type: 'Any', multiple: true },
  },
  outputs: {
    assembly: { type: 'Any' },
  },
  params: {
    name: {
      type: 'string',
      label: 'Assembly Name',
      default: 'Assembly',
    },
    rootOrigin: {
      type: 'vec3',
      label: 'Root Origin',
      default: [0, 0, 0],
    },
  },
  async evaluate(ctx, inputs, params) {
    const result = await ctx.worker.invoke('ASSEMBLY_HIERARCHY', {
      components: inputs.components,
      name: params.name,
      rootOrigin: params.rootOrigin,
    });
    return { assembly: result };
  },
};

export const InterferenceCheckNode: NodeDefinition<
  { assembly: AssemblyHandle },
  { interferences: InterferenceData[]; hasInterference: boolean },
  { tolerance: number; checkType: string }
> = {
  id: 'Assembly::InterferenceCheck',
  category: 'Assembly',
  label: 'Interference Check',
  description: 'Check for interferences between assembly components',
  inputs: {
    assembly: { type: 'Any' },
  },
  outputs: {
    interferences: { type: 'Any', multiple: true },
    hasInterference: { type: 'Boolean' },
  },
  params: {
    tolerance: {
      type: 'number',
      label: 'Tolerance',
      default: 0.001,
      min: 0,
    },
    checkType: {
      type: 'string',
      label: 'Check Type',
      default: 'collision',
      options: ['collision', 'clearance', 'contact'],
    },
  },
  async evaluate(ctx, inputs, params) {
    const result = await ctx.worker.invoke('INTERFERENCE_CHECK', {
      assembly: inputs.assembly,
      tolerance: params.tolerance,
      checkType: params.checkType,
    });
    return {
      interferences: result.interferences,
      hasInterference: result.hasInterference,
    };
  },
};

export const ExplodedViewNode: NodeDefinition<
  { assembly: AssemblyHandle },
  { explodedAssembly: AssemblyHandle },
  { explodeDistance: number; direction: Vec3; uniformExplode: boolean }
> = {
  id: 'Assembly::ExplodedView',
  category: 'Assembly',
  label: 'Exploded View',
  description: 'Create exploded view of assembly',
  inputs: {
    assembly: { type: 'Any' },
  },
  outputs: {
    explodedAssembly: { type: 'Any' },
  },
  params: {
    explodeDistance: {
      type: 'number',
      label: 'Explode Distance',
      default: 100,
      min: 0,
    },
    direction: {
      type: 'vec3',
      label: 'Explode Direction',
      default: [0, 0, 1],
    },
    uniformExplode: {
      type: 'boolean',
      label: 'Uniform Explode',
      default: true,
    },
  },
  async evaluate(ctx, inputs, params) {
    const result = await ctx.worker.invoke('EXPLODED_VIEW', {
      assembly: inputs.assembly,
      explodeDistance: params.explodeDistance,
      direction: params.direction,
      uniformExplode: params.uniformExplode,
    });
    return { explodedAssembly: result };
  },
};

export const MotionStudyNode: NodeDefinition<
  { assembly: AssemblyHandle },
  { motion: MotionHandle; trajectory: Vec3[] },
  { simulationType: string; duration: number; steps: number }
> = {
  id: 'Assembly::MotionStudy',
  category: 'Assembly',
  label: 'Motion Study',
  description: 'Simulate assembly motion',
  inputs: {
    assembly: { type: 'Any' },
  },
  outputs: {
    motion: { type: 'Any' },
    trajectory: { type: 'Any', multiple: true },
  },
  params: {
    simulationType: {
      type: 'string',
      label: 'Simulation Type',
      default: 'kinematic',
      options: ['kinematic', 'dynamic', 'static'],
    },
    duration: {
      type: 'number',
      label: 'Duration (s)',
      default: 1,
      min: 0.1,
      max: 10,
    },
    steps: {
      type: 'number',
      label: 'Simulation Steps',
      default: 30,
      min: 10,
      max: 100,
    },
  },
  async evaluate(ctx, inputs, params) {
    const result = await ctx.worker.invoke('MOTION_STUDY', {
      assembly: inputs.assembly,
      simulationType: params.simulationType,
      duration: params.duration,
      steps: params.steps,
    });
    return {
      motion: result.motion,
      trajectory: result.trajectory,
    };
  },
};

export const BillOfMaterialsNode: NodeDefinition<
  { assembly: AssemblyHandle },
  { bom: BillOfMaterials; totalWeight: number; totalCost: number },
  { includeSubAssemblies: boolean; costCalculation: boolean }
> = {
  id: 'Assembly::BillOfMaterials',
  category: 'Assembly',
  label: 'Bill of Materials',
  description: 'Generate bill of materials from assembly',
  inputs: {
    assembly: { type: 'Any' },
  },
  outputs: {
    bom: { type: 'Any' },
    totalWeight: { type: 'Number' },
    totalCost: { type: 'Number' },
  },
  params: {
    includeSubAssemblies: {
      type: 'boolean',
      label: 'Include Sub-Assemblies',
      default: true,
    },
    costCalculation: {
      type: 'boolean',
      label: 'Calculate Cost',
      default: true,
    },
  },
  async evaluate(ctx, inputs, params) {
    const result = await ctx.worker.invoke('BILL_OF_MATERIALS', {
      assembly: inputs.assembly,
      includeSubAssemblies: params.includeSubAssemblies,
      costCalculation: params.costCalculation,
    });
    return {
      bom: result.bom,
      totalWeight: result.totalWeight,
      totalCost: result.totalCost,
    };
  },
};

export const AssemblySequenceNode: NodeDefinition<
  { assembly: AssemblyHandle },
  { sequence: AssemblyStep[]; instructions: string[] },
  { optimizeSequence: boolean; generateInstructions: boolean }
> = {
  id: 'Assembly::Sequence',
  category: 'Assembly',
  label: 'Assembly Sequence',
  description: 'Generate assembly sequence and instructions',
  inputs: {
    assembly: { type: 'Any' },
  },
  outputs: {
    sequence: { type: 'Any', multiple: true },
    instructions: { type: 'String', multiple: true },
  },
  params: {
    optimizeSequence: {
      type: 'boolean',
      label: 'Optimize Sequence',
      default: true,
    },
    generateInstructions: {
      type: 'boolean',
      label: 'Generate Instructions',
      default: true,
    },
  },
  async evaluate(ctx, inputs, params) {
    const result = await ctx.worker.invoke('ASSEMBLY_SEQUENCE', {
      assembly: inputs.assembly,
      optimizeSequence: params.optimizeSequence,
      generateInstructions: params.generateInstructions,
    });
    return {
      sequence: result.sequence,
      instructions: result.instructions,
    };
  },
};

export const JointDefinitionNode: NodeDefinition<
  { component1: ComponentHandle; component2: ComponentHandle },
  { joint: JointHandle },
  { jointType: string; limits: Vec3; friction: number; damping: number }
> = {
  id: 'Assembly::JointDefinition',
  category: 'Assembly',
  label: 'Joint Definition',
  description: 'Define mechanical joint between components',
  inputs: {
    component1: { type: 'Any' },
    component2: { type: 'Any' },
  },
  outputs: {
    joint: { type: 'Any' },
  },
  params: {
    jointType: {
      type: 'string',
      label: 'Joint Type',
      default: 'revolute',
      options: ['revolute', 'prismatic', 'cylindrical', 'spherical', 'planar', 'fixed'],
    },
    limits: {
      type: 'vec3',
      label: 'Motion Limits [min, max, velocity]',
      default: [-180, 180, 100],
    },
    friction: {
      type: 'number',
      label: 'Friction Coefficient',
      default: 0.1,
      min: 0,
      max: 1,
    },
    damping: {
      type: 'number',
      label: 'Damping',
      default: 0.01,
      min: 0,
      max: 1,
    },
  },
  async evaluate(ctx, inputs, params) {
    const result = await ctx.worker.invoke('JOINT_DEFINITION', {
      component1: inputs.component1,
      component2: inputs.component2,
      jointType: params.jointType,
      limits: params.limits,
      friction: params.friction,
      damping: params.damping,
    });
    return { joint: result };
  },
};

export const KinematicSolverNode: NodeDefinition<
  { assembly: AssemblyHandle; joints: JointHandle[] },
  { solution: JointHandle; reachable: boolean },
  { targetPosition: Vec3; targetOrientation: Vec3; solverIterations: number }
> = {
  id: 'Assembly::KinematicSolver',
  category: 'Assembly',
  label: 'Kinematic Solver',
  description: 'Solve assembly kinematics',
  inputs: {
    assembly: { type: 'Any' },
    joints: { type: 'Any', multiple: true },
  },
  outputs: {
    solution: { type: 'Any' },
    reachable: { type: 'Boolean' },
  },
  params: {
    targetPosition: {
      type: 'vec3',
      label: 'Target Position',
      default: [100, 0, 0],
    },
    targetOrientation: {
      type: 'vec3',
      label: 'Target Orientation',
      default: [0, 0, 0],
    },
    solverIterations: {
      type: 'number',
      label: 'Solver Iterations',
      default: 100,
      min: 10,
      max: 1000,
    },
  },
  async evaluate(ctx, inputs, params) {
    const result = await ctx.worker.invoke('KINEMATIC_SOLVER', {
      assembly: inputs.assembly,
      joints: inputs.joints,
      targetPosition: params.targetPosition,
      targetOrientation: params.targetOrientation,
      solverIterations: params.solverIterations,
    });
    return {
      solution: result.solution,
      reachable: result.reachable,
    };
  },
};

export const AdvancedAssemblyNode: NodeDefinition<
  { parts: 'GeometryHandle[]'; constraints: 'unknown[]' },
  { assembly: 'AssemblyHandle' },
  { tolerance: number }
> = {
  id: 'Assembly::AdvancedAssembly',
  category: 'Assembly',
  label: 'Advanced Assembly',
  description: 'Create assembly from parts and constraints',
  inputs: {
    parts: { type: 'GeometryHandle', multiple: true },
    constraints: { type: 'Any', multiple: true },
  },
  outputs: {
    assembly: { type: 'AssemblyHandle' },
  },
  params: {
    tolerance: {
      type: 'number',
      label: 'Tolerance',
      default: 0.001,
      min: 0,
    },
  },
  evaluate: async (ctx, inputs, params): Promise<{ assembly: unknown }> => {
    const parts = inputs.parts as unknown[];
    const constraints = inputs.constraints as unknown[];
    const tolerance = params.tolerance as unknown;

    // Assembly logic with parts and constraints
    const result = await ctx.geom.invoke('MAKE_ASSEMBLY', {
      parts,
      constraints,
      tolerance,
    });

    return { assembly: result as unknown };
  },
};

export const advancedAssemblyNodes = [
  AdvancedAssemblyNode,
  AssemblyComponentNode,
  MateConstraintNode,
  AssemblyHierarchyNode,
  InterferenceCheckNode,
  ExplodedViewNode,
  MotionStudyNode,
  BillOfMaterialsNode,
  AssemblySequenceNode,
  JointDefinitionNode,
  KinematicSolverNode,
];
