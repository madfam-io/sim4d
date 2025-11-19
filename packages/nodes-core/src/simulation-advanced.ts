import type {
  NodeDefinition,
  ShapeHandle,
  FEMeshHandle,
  FEMaterialHandle,
  FEBoundaryHandle,
  FELoadHandle,
  FEResultsHandle,
} from '@brepflow/types';

// Additional advanced simulation types (temporary - could be moved to @brepflow/types)
interface MeshQualityMetrics {
  minQuality: number;
  maxQuality: number;
  averageQuality: number;
  worstElements: number[];
}

interface ContactPairHandle {
  id: string;
  surface1: ShapeHandle;
  surface2: ShapeHandle;
  type: 'bonded' | 'sliding' | 'separating';
  friction?: number;
}

interface ConvergenceData {
  iteration: number;
  residual: number;
  converged: boolean;
  tolerance: number;
}

interface FatigueLifeData {
  cyclesEstimate: number;
  damageIndex: number;
  criticalLocations: Float32Array;
}

interface PlotHandle {
  id: string;
  type: 'contour' | 'probe' | 'vector' | 'streamline';
  data: Float32Array | number[];
}

/**
 * Advanced Mesh Generation Node
 * Creates high-quality meshes for FEA simulation
 */
export const AdvancedMeshNode: NodeDefinition<
  { shape: ShapeHandle },
  { mesh: FEMeshHandle; quality: MeshQualityMetrics },
  {
    elementType: 'tet4' | 'tet10' | 'hex8' | 'hex20' | 'wedge6' | 'wedge15';
    meshSize: number;
    refinement: 'uniform' | 'adaptive' | 'curvature' | 'proximity';
    qualityTarget: number;
    growthRate: number;
  }
> = {
  id: 'Simulation::AdvancedMesh',
  name: 'Advanced Mesh',
  description: 'Generate high-quality mesh for FEA',
  category: 'Simulation',
  inputs: {
    shape: { type: 'Shape', description: 'Geometry to mesh' },
  },
  outputs: {
    mesh: { type: 'Mesh', description: 'FEA-ready mesh' },
    quality: { type: 'Data', description: 'Mesh quality metrics' },
  },
  params: {
    elementType: {
      type: 'select',
      default: 'tet10',
      options: ['tet4', 'tet10', 'hex8', 'hex20', 'wedge6', 'wedge15'],
      description: 'Element type (tet=tetrahedral, hex=hexahedral, wedge=prismatic)',
    },
    meshSize: { type: 'number', default: 5, min: 0.1, description: 'Target element size' },
    refinement: {
      type: 'select',
      default: 'adaptive',
      options: ['uniform', 'adaptive', 'curvature', 'proximity'],
      description: 'Refinement strategy',
    },
    qualityTarget: {
      type: 'number',
      default: 0.7,
      min: 0.1,
      max: 1.0,
      description: 'Target quality (0-1)',
    },
    growthRate: {
      type: 'number',
      default: 1.2,
      min: 1.0,
      max: 2.0,
      description: 'Element growth rate',
    },
  },
  async evaluate(ctx, inputs, params) {
    const result = await ctx.worker.invoke('FEA_ADVANCED_MESH', {
      shapeId: inputs.shape.id,
      elementType: params.elementType,
      meshSize: params.meshSize,
      refinement: params.refinement,
      qualityTarget: params.qualityTarget,
      growthRate: params.growthRate,
    });
    return {
      mesh: result.mesh,
      quality: result.quality,
    };
  },
};

/**
 * Mesh Refinement Node
 * Locally refines mesh in critical areas
 */
export const MeshRefinementZoneNode: NodeDefinition<
  { mesh: FEMeshHandle; region?: ShapeHandle },
  { mesh: FEMeshHandle },
  {
    refinementLevel: number;
    transitionType: 'sharp' | 'smooth';
    criteriaType: 'stress' | 'strain' | 'error' | 'curvature';
    threshold: number;
  }
> = {
  id: 'Simulation::MeshRefinementZone',
  name: 'Mesh Refinement Zone',
  description: 'Refine mesh in specific regions',
  category: 'Simulation',
  inputs: {
    mesh: { type: 'Mesh', description: 'Base mesh' },
    region: { type: 'Shape', description: 'Region to refine (optional)' },
  },
  outputs: {
    mesh: { type: 'Mesh', description: 'Refined mesh' },
  },
  params: {
    refinementLevel: {
      type: 'number',
      default: 2,
      min: 1,
      max: 5,
      description: 'Refinement level',
    },
    transitionType: {
      type: 'select',
      default: 'smooth',
      options: ['sharp', 'smooth'],
      description: 'Transition between refined and coarse regions',
    },
    criteriaType: {
      type: 'select',
      default: 'stress',
      options: ['stress', 'strain', 'error', 'curvature'],
      description: 'Refinement criteria',
    },
    threshold: {
      type: 'number',
      default: 0.8,
      min: 0,
      max: 1,
      description: 'Refinement threshold',
    },
  },
  async evaluate(ctx, inputs, params) {
    const result = await ctx.worker.invoke('FEA_MESH_REFINEMENT', {
      meshId: inputs.mesh.id,
      regionId: inputs.region?.id,
      refinementLevel: params.refinementLevel,
      transitionType: params.transitionType,
      criteriaType: params.criteriaType,
      threshold: params.threshold,
    });
    return { mesh: result };
  },
};

/**
 * Contact Surface Definition Node
 * Defines contact pairs for simulation
 */
export const ContactSurfaceNode: NodeDefinition<
  { masterSurface: ShapeHandle; slaveSurface: ShapeHandle },
  { contactPair: ContactPairHandle },
  {
    contactType: 'bonded' | 'sliding' | 'frictionless' | 'rough';
    friction: number;
    separation: 'allow' | 'prevent';
    initialGap: number;
  }
> = {
  id: 'Simulation::ContactSurface',
  name: 'Contact Surface',
  description: 'Define contact between surfaces',
  category: 'Simulation',
  inputs: {
    masterSurface: { type: 'Shape', description: 'Master contact surface' },
    slaveSurface: { type: 'Shape', description: 'Slave contact surface' },
  },
  outputs: {
    contactPair: { type: 'Contact', description: 'Contact definition' },
  },
  params: {
    contactType: {
      type: 'select',
      default: 'sliding',
      options: ['bonded', 'sliding', 'frictionless', 'rough'],
      description: 'Contact behavior',
    },
    friction: { type: 'number', default: 0.3, min: 0, max: 1, description: 'Friction coefficient' },
    separation: {
      type: 'select',
      default: 'allow',
      options: ['allow', 'prevent'],
      description: 'Allow separation after contact',
    },
    initialGap: { type: 'number', default: 0, min: 0, description: 'Initial gap tolerance' },
  },
  async evaluate(ctx, inputs, params) {
    const result = await ctx.worker.invoke('FEA_CONTACT_SURFACE', {
      masterSurfaceId: inputs.masterSurface.id,
      slaveSurfaceId: inputs.slaveSurface.id,
      contactType: params.contactType,
      friction: params.friction,
      separation: params.separation,
      initialGap: params.initialGap,
    });
    return { contactPair: result };
  },
};

/**
 * Advanced Material Node
 * Define complex material models
 */
export const AdvancedMaterialNode: NodeDefinition<
  Record<string, never>,
  { material: FEMaterialHandle },
  {
    modelType: 'elastic' | 'plastic' | 'hyperelastic' | 'viscoelastic' | 'composite';
    youngModulus: number;
    poissonRatio: number;
    yieldStrength?: number;
    ultimateStrength?: number;
    hardeningModulus?: number;
    failureCriteria?: 'von-mises' | 'tresca' | 'mohr-coulomb' | 'tsai-wu';
  }
> = {
  id: 'Simulation::AdvancedMaterial',
  name: 'Advanced Material',
  description: 'Define complex material properties',
  category: 'Simulation',
  inputs: {},
  outputs: {
    material: { type: 'Material', description: 'Material definition' },
  },
  params: {
    modelType: {
      type: 'select',
      default: 'elastic',
      options: ['elastic', 'plastic', 'hyperelastic', 'viscoelastic', 'composite'],
      description: 'Material model type',
    },
    youngModulus: { type: 'number', default: 200000, min: 0, description: "Young's modulus (MPa)" },
    poissonRatio: {
      type: 'number',
      default: 0.3,
      min: 0,
      max: 0.5,
      description: "Poisson's ratio",
    },
    yieldStrength: { type: 'number', default: 250, min: 0, description: 'Yield strength (MPa)' },
    ultimateStrength: {
      type: 'number',
      default: 400,
      min: 0,
      description: 'Ultimate strength (MPa)',
    },
    hardeningModulus: {
      type: 'number',
      default: 1000,
      min: 0,
      description: 'Hardening modulus (MPa)',
    },
    failureCriteria: {
      type: 'select',
      default: 'von-mises',
      options: ['von-mises', 'tresca', 'mohr-coulomb', 'tsai-wu'],
      description: 'Failure criteria',
    },
  },
  async evaluate(ctx, inputs, params) {
    const result = await ctx.worker.invoke('FEA_ADVANCED_MATERIAL', params);
    return { material: result };
  },
};

/**
 * Nonlinear Analysis Node
 * Perform nonlinear FEA simulation
 */
export const NonlinearAnalysisNode: NodeDefinition<
  { mesh: FEMeshHandle; material: FEMaterialHandle; boundaries: unknown[]; loads: unknown[] },
  { results: FEResultsHandle; convergence: ConvergenceData },
  {
    analysisType: 'geometric' | 'material' | 'both';
    solver: 'newton-raphson' | 'arc-length' | 'explicit';
    maxIterations: number;
    convergenceTolerance: number;
    timeSteps: number;
  }
> = {
  id: 'Simulation::NonlinearAnalysis',
  name: 'Nonlinear Analysis',
  description: 'Perform nonlinear FEA simulation',
  category: 'Simulation',
  inputs: {
    mesh: { type: 'Mesh', description: 'FEA mesh' },
    material: { type: 'Material', description: 'Material properties' },
    boundaries: { type: 'Boundary[]', description: 'Boundary conditions' },
    loads: { type: 'Load[]', description: 'Applied loads' },
  },
  outputs: {
    results: { type: 'Results', description: 'Analysis results' },
    convergence: { type: 'Data', description: 'Convergence history' },
  },
  params: {
    analysisType: {
      type: 'select',
      default: 'both',
      options: ['geometric', 'material', 'both'],
      description: 'Nonlinearity type',
    },
    solver: {
      type: 'select',
      default: 'newton-raphson',
      options: ['newton-raphson', 'arc-length', 'explicit'],
      description: 'Solution method',
    },
    maxIterations: { type: 'number', default: 100, min: 1, description: 'Max iterations per step' },
    convergenceTolerance: {
      type: 'number',
      default: 0.001,
      min: 0,
      description: 'Convergence tolerance',
    },
    timeSteps: { type: 'number', default: 10, min: 1, description: 'Number of time steps' },
  },
  async evaluate(ctx, inputs, params) {
    const result = await ctx.worker.invoke('FEA_NONLINEAR_ANALYSIS', {
      meshId: inputs.mesh.id,
      materialId: inputs.material.id,
      boundaryIds: inputs.boundaries.map((b) => b.id),
      loadIds: inputs.loads.map((l) => l.id),
      ...params,
    });
    return {
      results: result.results,
      convergence: result.convergence,
    };
  },
};

/**
 * Buckling Analysis Node
 * Linear buckling eigenvalue analysis
 */
export const BucklingAnalysisNode: NodeDefinition<
  { mesh: FEMeshHandle; material: FEMaterialHandle; boundaries: unknown[]; loads: unknown[] },
  { bucklingFactors: number[]; modes: unknown[] },
  { numberOfModes: number; preStress: boolean }
> = {
  id: 'Simulation::BucklingAnalysis',
  name: 'Buckling Analysis',
  description: 'Perform linear buckling analysis',
  category: 'Simulation',
  inputs: {
    mesh: { type: 'Mesh', description: 'FEA mesh' },
    material: { type: 'Material', description: 'Material properties' },
    boundaries: { type: 'Boundary[]', description: 'Boundary conditions' },
    loads: { type: 'Load[]', description: 'Applied loads' },
  },
  outputs: {
    bucklingFactors: { type: 'Number[]', description: 'Critical load factors' },
    modes: { type: 'Mode[]', description: 'Buckling mode shapes' },
  },
  params: {
    numberOfModes: {
      type: 'number',
      default: 5,
      min: 1,
      max: 20,
      description: 'Number of modes to compute',
    },
    preStress: { type: 'boolean', default: false, description: 'Include pre-stress effects' },
  },
  async evaluate(ctx, inputs, params) {
    const result = await ctx.worker.invoke('FEA_BUCKLING_ANALYSIS', {
      meshId: inputs.mesh.id,
      materialId: inputs.material.id,
      boundaryIds: inputs.boundaries.map((b) => b.id),
      loadIds: inputs.loads.map((l) => l.id),
      numberOfModes: params.numberOfModes,
      preStress: params.preStress,
    });
    return {
      bucklingFactors: result.factors,
      modes: result.modes,
    };
  },
};

/**
 * Fatigue Analysis Node
 * Predict fatigue life under cyclic loading
 */
export const FatigueAnalysisNode: NodeDefinition<
  { stressResults: FEResultsHandle; material: FEMaterialHandle },
  { life: FatigueLifeData; damage: FatigueLifeData; safetyFactor: number },
  {
    method: 'stress-life' | 'strain-life' | 'lefm';
    loadType: 'constant' | 'variable' | 'random';
    meanStressCorrection: 'goodman' | 'gerber' | 'soderberg';
    surfaceFinish: 'polished' | 'machined' | 'forged' | 'cast';
  }
> = {
  id: 'Simulation::FatigueAnalysis',
  name: 'Fatigue Analysis',
  description: 'Analyze fatigue life',
  category: 'Simulation',
  inputs: {
    stressResults: { type: 'Results', description: 'Stress analysis results' },
    material: { type: 'Material', description: 'Material with fatigue properties' },
  },
  outputs: {
    life: { type: 'Data', description: 'Fatigue life (cycles)' },
    damage: { type: 'Data', description: 'Cumulative damage' },
    safetyFactor: { type: 'Number', description: 'Fatigue safety factor' },
  },
  params: {
    method: {
      type: 'select',
      default: 'stress-life',
      options: ['stress-life', 'strain-life', 'lefm'],
      description: 'Fatigue analysis method',
    },
    loadType: {
      type: 'select',
      default: 'constant',
      options: ['constant', 'variable', 'random'],
      description: 'Loading type',
    },
    meanStressCorrection: {
      type: 'select',
      default: 'goodman',
      options: ['goodman', 'gerber', 'soderberg'],
      description: 'Mean stress correction',
    },
    surfaceFinish: {
      type: 'select',
      default: 'machined',
      options: ['polished', 'machined', 'forged', 'cast'],
      description: 'Surface finish factor',
    },
  },
  async evaluate(ctx, inputs, params) {
    const result = await ctx.worker.invoke('FEA_FATIGUE_ANALYSIS', {
      stressResultsId: inputs.stressResults.id,
      materialId: inputs.material.id,
      ...params,
    });
    return {
      life: result.life,
      damage: result.damage,
      safetyFactor: result.safetyFactor,
    };
  },
};

/**
 * Results Post-Processing Node
 * Extract and visualize simulation results
 */
export const ResultsPostProcessingNode: NodeDefinition<
  { results: FEResultsHandle },
  { contourPlot: PlotHandle; probePlot: PlotHandle; maxValue: number; minValue: number },
  {
    resultType: 'stress' | 'strain' | 'displacement' | 'temperature' | 'pressure';
    component: 'magnitude' | 'x' | 'y' | 'z' | 'von-mises' | 'principal';
    deformationScale: number;
  }
> = {
  id: 'Simulation::ResultsPostProcessing',
  name: 'Results Post-Processing',
  description: 'Process and visualize FEA results',
  category: 'Simulation',
  inputs: {
    results: { type: 'Results', description: 'Simulation results' },
  },
  outputs: {
    contourPlot: { type: 'Visualization', description: 'Contour plot data' },
    probePlot: { type: 'Data', description: 'Probe values' },
    maxValue: { type: 'Number', description: 'Maximum value' },
    minValue: { type: 'Number', description: 'Minimum value' },
  },
  params: {
    resultType: {
      type: 'select',
      default: 'stress',
      options: ['stress', 'strain', 'displacement', 'temperature', 'pressure'],
      description: 'Result quantity to display',
    },
    component: {
      type: 'select',
      default: 'von-mises',
      options: ['magnitude', 'x', 'y', 'z', 'von-mises', 'principal'],
      description: 'Component to extract',
    },
    deformationScale: {
      type: 'number',
      default: 1,
      min: 0,
      description: 'Deformation scale factor',
    },
  },
  async evaluate(ctx, inputs, params) {
    const result = await ctx.worker.invoke('FEA_POST_PROCESSING', {
      resultsId: inputs.results.id,
      ...params,
    });
    return {
      contourPlot: result.contour,
      probePlot: result.probe,
      maxValue: result.max,
      minValue: result.min,
    };
  },
};
