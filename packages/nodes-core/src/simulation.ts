import type {
  NodeDefinition,
  ShapeHandle,
  Vec3,
  FEMeshHandle,
  FEMaterialHandle,
  FEBoundaryHandle,
  FELoadHandle,
  FEResultsHandle,
} from '@sim4d/types';

export const MeshNode: NodeDefinition<
  { shape: ShapeHandle },
  { mesh: FEMeshHandle },
  { elementSize: number; meshType: string; quality: number }
> = {
  id: 'Simulation::Mesh',
  category: 'Simulation',
  label: 'Generate Mesh',
  description: 'Generate finite element mesh from geometry',
  inputs: {
    shape: { type: 'Shape' },
  },
  outputs: {
    mesh: { type: 'Mesh' },
  },
  params: {
    elementSize: {
      type: 'number',
      label: 'Element Size',
      default: 5.0,
      min: 0.1,
      max: 100.0,
    },
    meshType: {
      type: 'string',
      label: 'Element Type',
      default: 'tetrahedral',
      options: ['tetrahedral', 'hexahedral', 'mixed'],
    },
    quality: {
      type: 'number',
      label: 'Mesh Quality',
      default: 0.8,
      min: 0.1,
      max: 1.0,
    },
  },
  async evaluate(ctx, inputs, params) {
    const result = await ctx.worker.invoke('GENERATE_MESH', {
      shape: inputs.shape,
      elementSize: params.elementSize,
      meshType: params.meshType,
      quality: params.quality,
    });
    return { mesh: result };
  },
};

export const MaterialNode: NodeDefinition<
  Record<string, never>,
  { material: FEMaterialHandle },
  {
    name: string;
    density: number;
    youngsModulus: number;
    poissonsRatio: number;
    yieldStrength: number;
  }
> = {
  id: 'Simulation::Material',
  category: 'Simulation',
  label: 'Material Properties',
  description: 'Define material properties for simulation',
  inputs: {},
  outputs: {
    material: { type: 'Material' },
  },
  params: {
    name: {
      type: 'string',
      label: 'Material Name',
      default: 'Steel',
    },
    density: {
      type: 'number',
      label: 'Density (kg/m³)',
      default: 7850,
      min: 100,
      max: 20000,
    },
    youngsModulus: {
      type: 'number',
      label: "Young's Modulus (Pa)",
      default: 2.1e11,
      min: 1e6,
      max: 1e12,
    },
    poissonsRatio: {
      type: 'number',
      label: "Poisson's Ratio",
      default: 0.3,
      min: 0.0,
      max: 0.5,
    },
    yieldStrength: {
      type: 'number',
      label: 'Yield Strength (Pa)',
      default: 2.5e8,
      min: 1e6,
      max: 1e10,
    },
  },
  async evaluate(ctx, inputs, params) {
    const result = await ctx.worker.invoke('CREATE_MATERIAL', {
      name: params.name,
      density: params.density,
      youngsModulus: params.youngsModulus,
      poissonsRatio: params.poissonsRatio,
      yieldStrength: params.yieldStrength,
    });
    return { material: result };
  },
};

export const FixedSupportNode: NodeDefinition<
  { mesh: FEMeshHandle; faces?: ShapeHandle[] },
  { boundary: FEBoundaryHandle },
  { faces: ShapeHandle[]; constrainTranslation: Vec3; constrainRotation: Vec3 }
> = {
  id: 'Simulation::FixedSupport',
  category: 'Simulation',
  label: 'Fixed Support',
  description: 'Apply fixed boundary conditions',
  inputs: {
    mesh: { type: 'Mesh' },
    faces: { type: 'Shape', multiple: true, optional: true },
  },
  outputs: {
    boundary: { type: 'BoundaryCondition' },
  },
  params: {
    faces: {
      type: 'array',
      label: 'Constrained Faces',
      default: [],
    },
    constrainTranslation: {
      type: 'vec3',
      label: 'Constrain Translation',
      default: { x: 1, y: 1, z: 1 },
    },
    constrainRotation: {
      type: 'vec3',
      label: 'Constrain Rotation',
      default: { x: 1, y: 1, z: 1 },
    },
  },
  async evaluate(ctx, inputs, params) {
    const faces = inputs.faces || params.faces;

    const result = await ctx.worker.invoke('CREATE_FIXED_SUPPORT', {
      mesh: inputs.mesh,
      faces,
      constrainTranslation: params.constrainTranslation,
      constrainRotation: params.constrainRotation,
    });
    return { boundary: result };
  },
};

export const ForceLoadNode: NodeDefinition<
  { mesh: FEMeshHandle; faces?: ShapeHandle[] },
  { load: FELoadHandle },
  { faces: ShapeHandle[]; force: Vec3; distributed: boolean }
> = {
  id: 'Simulation::Force',
  category: 'Simulation',
  label: 'Force Load',
  description: 'Apply force loading conditions',
  inputs: {
    mesh: { type: 'Mesh' },
    faces: { type: 'Shape', multiple: true, optional: true },
  },
  outputs: {
    load: { type: 'Load' },
  },
  params: {
    faces: {
      type: 'array',
      label: 'Loaded Faces',
      default: [],
    },
    force: {
      type: 'vec3',
      label: 'Force Vector (N)',
      default: { x: 0, y: 0, z: -1000 },
    },
    distributed: {
      type: 'boolean',
      label: 'Distributed Load',
      default: true,
    },
  },
  async evaluate(ctx, inputs, params) {
    const faces = inputs.faces || params.faces;

    const result = await ctx.worker.invoke('CREATE_FORCE_LOAD', {
      mesh: inputs.mesh,
      faces,
      force: params.force,
      distributed: params.distributed,
    });
    return { load: result };
  },
};

export const PressureLoadNode: NodeDefinition<
  { mesh: FEMeshHandle; faces?: ShapeHandle[] },
  { load: FELoadHandle },
  { faces: ShapeHandle[]; pressure: number }
> = {
  id: 'Simulation::Pressure',
  category: 'Simulation',
  label: 'Pressure Load',
  description: 'Apply pressure loading conditions',
  inputs: {
    mesh: { type: 'Mesh' },
    faces: { type: 'Shape', multiple: true, optional: true },
  },
  outputs: {
    load: { type: 'Load' },
  },
  params: {
    faces: {
      type: 'array',
      label: 'Loaded Faces',
      default: [],
    },
    pressure: {
      type: 'number',
      label: 'Pressure (Pa)',
      default: 100000,
      min: -1e9,
      max: 1e9,
    },
  },
  async evaluate(ctx, inputs, params) {
    const faces = inputs.faces || params.faces;

    const result = await ctx.worker.invoke('CREATE_PRESSURE_LOAD', {
      mesh: inputs.mesh,
      faces,
      pressure: params.pressure,
    });
    return { load: result };
  },
};

export const StaticAnalysisNode: NodeDefinition<
  { mesh: FEMeshHandle; material: FEMaterialHandle; boundaries: unknown[]; loads: unknown[] },
  { results: FEResultsHandle },
  { solver: string; convergence: number; maxIterations: number }
> = {
  id: 'Simulation::StaticAnalysis',
  category: 'Simulation',
  label: 'Static Analysis',
  description: 'Perform static structural analysis',
  inputs: {
    mesh: { type: 'Mesh' },
    material: { type: 'Material' },
    boundaries: { type: 'BoundaryCondition', multiple: true },
    loads: { type: 'Load', multiple: true },
  },
  outputs: {
    results: { type: 'SimulationResults' },
  },
  params: {
    solver: {
      type: 'string',
      label: 'Solver Type',
      default: 'direct',
      options: ['direct', 'iterative', 'conjugate_gradient'],
    },
    convergence: {
      type: 'number',
      label: 'Convergence Tolerance',
      default: 1e-6,
      min: 1e-10,
      max: 1e-3,
    },
    maxIterations: {
      type: 'number',
      label: 'Max Iterations',
      default: 1000,
      min: 10,
      max: 10000,
    },
  },
  async evaluate(ctx, inputs, params) {
    const result = await ctx.worker.invoke('RUN_STATIC_ANALYSIS', {
      mesh: inputs.mesh,
      material: inputs.material,
      boundaries: inputs.boundaries,
      loads: inputs.loads,
      solver: params.solver,
      convergence: params.convergence,
      maxIterations: params.maxIterations,
    });
    return { results: result };
  },
};

export const ModalAnalysisNode: NodeDefinition<
  { mesh: FEMeshHandle; material: FEMaterialHandle; boundaries: unknown[] },
  { results: FEResultsHandle },
  { numModes: number; frequency: number }
> = {
  id: 'Simulation::ModalAnalysis',
  category: 'Simulation',
  label: 'Modal Analysis',
  description: 'Perform modal frequency analysis',
  inputs: {
    mesh: { type: 'Mesh' },
    material: { type: 'Material' },
    boundaries: { type: 'BoundaryCondition', multiple: true },
  },
  outputs: {
    results: { type: 'SimulationResults' },
  },
  params: {
    numModes: {
      type: 'number',
      label: 'Number of Modes',
      default: 10,
      min: 1,
      max: 100,
    },
    frequency: {
      type: 'number',
      label: 'Max Frequency (Hz)',
      default: 1000,
      min: 1,
      max: 100000,
    },
  },
  async evaluate(ctx, inputs, params) {
    const result = await ctx.worker.invoke('RUN_MODAL_ANALYSIS', {
      mesh: inputs.mesh,
      material: inputs.material,
      boundaries: inputs.boundaries,
      numModes: params.numModes,
      frequency: params.frequency,
    });
    return { results: result };
  },
};

export const ThermalAnalysisNode: NodeDefinition<
  {
    mesh: FEMeshHandle;
    material: FEMaterialHandle;
    boundaries: unknown[];
    thermalLoads: unknown[];
  },
  { results: FEResultsHandle },
  { conductivity: number; specificHeat: number; ambientTemp: number }
> = {
  id: 'Simulation::ThermalAnalysis',
  category: 'Simulation',
  label: 'Thermal Analysis',
  description: 'Perform thermal analysis',
  inputs: {
    mesh: { type: 'Mesh' },
    material: { type: 'Material' },
    boundaries: { type: 'BoundaryCondition', multiple: true },
    thermalLoads: { type: 'Load', multiple: true },
  },
  outputs: {
    results: { type: 'SimulationResults' },
  },
  params: {
    conductivity: {
      type: 'number',
      label: 'Thermal Conductivity (W/mK)',
      default: 50,
      min: 0.1,
      max: 1000,
    },
    specificHeat: {
      type: 'number',
      label: 'Specific Heat (J/kgK)',
      default: 460,
      min: 100,
      max: 5000,
    },
    ambientTemp: {
      type: 'number',
      label: 'Ambient Temperature (°C)',
      default: 20,
      min: -273,
      max: 3000,
    },
  },
  async evaluate(ctx, inputs, params) {
    const result = await ctx.worker.invoke('RUN_THERMAL_ANALYSIS', {
      mesh: inputs.mesh,
      material: inputs.material,
      boundaries: inputs.boundaries,
      thermalLoads: inputs.thermalLoads,
      conductivity: params.conductivity,
      specificHeat: params.specificHeat,
      ambientTemp: params.ambientTemp,
    });
    return { results: result };
  },
};

export const simulationNodes = [
  MeshNode,
  MaterialNode,
  FixedSupportNode,
  ForceLoadNode,
  PressureLoadNode,
  StaticAnalysisNode,
  ModalAnalysisNode,
  ThermalAnalysisNode,
];
