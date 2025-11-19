import type { NodeDefinition, ShapeHandle } from '@brepflow/types';

export const MeshHealingNode: NodeDefinition<
  { mesh: unknown },
  { healedMesh: unknown },
  { tolerance: number; fillHoles: boolean; removeSpikes: boolean; smoothNormals: boolean }
> = {
  id: 'MeshTopology::MeshHealing',
  category: 'Mesh & Topology',
  label: 'Mesh Healing',
  description: 'Heal and repair mesh geometry defects',
  inputs: {
    mesh: { type: 'Mesh' },
  },
  outputs: {
    healedMesh: { type: 'Mesh' },
  },
  params: {
    tolerance: {
      type: 'number',
      label: 'Healing Tolerance',
      default: 1e-6,
      min: 1e-9,
      max: 1e-3,
    },
    fillHoles: {
      type: 'boolean',
      label: 'Fill Holes',
      default: true,
    },
    removeSpikes: {
      type: 'boolean',
      label: 'Remove Spikes',
      default: true,
    },
    smoothNormals: {
      type: 'boolean',
      label: 'Smooth Normals',
      default: false,
    },
  },
  async evaluate(ctx, inputs, params) {
    const result = await ctx.worker.invoke('HEAL_MESH', {
      mesh: inputs.mesh,
      tolerance: params.tolerance,
      fillHoles: params.fillHoles,
      removeSpikes: params.removeSpikes,
      smoothNormals: params.smoothNormals,
    });
    return { healedMesh: result };
  },
};

export const TopologyOptimizationNode: NodeDefinition<
  { shape: ShapeHandle },
  { optimizedShape: ShapeHandle },
  {
    objectiveFunction: string;
    constraints: unknown[];
    targetReduction: number;
    preserveFeatures: boolean;
  }
> = {
  id: 'MeshTopology::TopologyOptimization',
  category: 'Mesh & Topology',
  label: 'Topology Optimization',
  description: 'Optimize topology for manufacturing and performance',
  inputs: {
    shape: { type: 'Shape' },
  },
  outputs: {
    optimizedShape: { type: 'Shape' },
  },
  params: {
    objectiveFunction: {
      type: 'string',
      label: 'Objective Function',
      default: 'minimize_volume',
      options: ['minimize_volume', 'minimize_mass', 'maximize_stiffness', 'minimize_compliance'],
    },
    constraints: {
      type: 'array',
      label: 'Optimization Constraints',
      default: [],
    },
    targetReduction: {
      type: 'number',
      label: 'Target Volume Reduction (%)',
      default: 30,
      min: 10,
      max: 80,
    },
    preserveFeatures: {
      type: 'boolean',
      label: 'Preserve Critical Features',
      default: true,
    },
  },
  async evaluate(ctx, inputs, params) {
    const result = await ctx.worker.invoke('OPTIMIZE_TOPOLOGY', {
      shape: inputs.shape,
      objectiveFunction: params.objectiveFunction,
      constraints: params.constraints,
      targetReduction: params.targetReduction,
      preserveFeatures: params.preserveFeatures,
    });
    return { optimizedShape: result };
  },
};

export const MeshQualityAnalysisNode: NodeDefinition<
  { mesh: unknown },
  { qualityMetrics: unknown },
  {
    checkAspectRatio: boolean;
    checkSkewness: boolean;
    checkVolume: boolean;
    generateReport: boolean;
  }
> = {
  id: 'MeshTopology::MeshQualityAnalysis',
  category: 'Mesh & Topology',
  label: 'Mesh Quality Analysis',
  description: 'Analyze mesh quality metrics and identify issues',
  inputs: {
    mesh: { type: 'Mesh' },
  },
  outputs: {
    qualityMetrics: { type: 'Any' },
  },
  params: {
    checkAspectRatio: {
      type: 'boolean',
      label: 'Check Aspect Ratio',
      default: true,
    },
    checkSkewness: {
      type: 'boolean',
      label: 'Check Skewness',
      default: true,
    },
    checkVolume: {
      type: 'boolean',
      label: 'Check Volume Ratios',
      default: true,
    },
    generateReport: {
      type: 'boolean',
      label: 'Generate Quality Report',
      default: true,
    },
  },
  async evaluate(ctx, inputs, params) {
    const result = await ctx.worker.invoke('ANALYZE_MESH_QUALITY', {
      mesh: inputs.mesh,
      checkAspectRatio: params.checkAspectRatio,
      checkSkewness: params.checkSkewness,
      checkVolume: params.checkVolume,
      generateReport: params.generateReport,
    });
    return { qualityMetrics: result };
  },
};

export const NonManifoldRepairNode: NodeDefinition<
  { shape: ShapeHandle },
  { repairedShape: ShapeHandle },
  { repairMode: string; tolerance: number; preserveTopology: boolean }
> = {
  id: 'MeshTopology::NonManifoldRepair',
  category: 'Mesh & Topology',
  label: 'Non-Manifold Repair',
  description: 'Repair non-manifold geometry and topology issues',
  inputs: {
    shape: { type: 'Shape' },
  },
  outputs: {
    repairedShape: { type: 'Shape' },
  },
  params: {
    repairMode: {
      type: 'string',
      label: 'Repair Mode',
      default: 'automatic',
      options: ['automatic', 'conservative', 'aggressive', 'manual'],
    },
    tolerance: {
      type: 'number',
      label: 'Repair Tolerance',
      default: 1e-6,
      min: 1e-9,
      max: 1e-3,
    },
    preserveTopology: {
      type: 'boolean',
      label: 'Preserve Original Topology',
      default: true,
    },
  },
  async evaluate(ctx, inputs, params) {
    const result = await ctx.worker.invoke('REPAIR_NON_MANIFOLD', {
      shape: inputs.shape,
      repairMode: params.repairMode,
      tolerance: params.tolerance,
      preserveTopology: params.preserveTopology,
    });
    return { repairedShape: result };
  },
};

export const MeshRefinementNode: NodeDefinition<
  { mesh: unknown },
  { refinedMesh: unknown },
  {
    refinementMethod: string;
    targetSize: number;
    adaptiveRefinement: boolean;
    preserveBoundaries: boolean;
  }
> = {
  id: 'MeshTopology::MeshRefinement',
  category: 'Mesh & Topology',
  label: 'Mesh Refinement',
  description: 'Refine mesh density and improve element quality',
  inputs: {
    mesh: { type: 'Mesh' },
  },
  outputs: {
    refinedMesh: { type: 'Mesh' },
  },
  params: {
    refinementMethod: {
      type: 'string',
      label: 'Refinement Method',
      default: 'uniform',
      options: ['uniform', 'adaptive', 'gradient_based', 'feature_based'],
    },
    targetSize: {
      type: 'number',
      label: 'Target Element Size',
      default: 5.0,
      min: 0.1,
      max: 100.0,
    },
    adaptiveRefinement: {
      type: 'boolean',
      label: 'Adaptive Refinement',
      default: true,
    },
    preserveBoundaries: {
      type: 'boolean',
      label: 'Preserve Boundaries',
      default: true,
    },
  },
  async evaluate(ctx, inputs, params) {
    const result = await ctx.worker.invoke('REFINE_MESH', {
      mesh: inputs.mesh,
      refinementMethod: params.refinementMethod,
      targetSize: params.targetSize,
      adaptiveRefinement: params.adaptiveRefinement,
      preserveBoundaries: params.preserveBoundaries,
    });
    return { refinedMesh: result };
  },
};

export const MeshSmoothingNode: NodeDefinition<
  { mesh: unknown },
  { smoothedMesh: unknown },
  {
    smoothingMethod: string;
    iterations: number;
    relaxationFactor: number;
    preserveFeatures: boolean;
  }
> = {
  id: 'MeshTopology::MeshSmoothing',
  category: 'Mesh & Topology',
  label: 'Mesh Smoothing',
  description: 'Smooth mesh geometry to improve quality',
  inputs: {
    mesh: { type: 'Mesh' },
  },
  outputs: {
    smoothedMesh: { type: 'Mesh' },
  },
  params: {
    smoothingMethod: {
      type: 'string',
      label: 'Smoothing Method',
      default: 'laplacian',
      options: ['laplacian', 'taubin', 'bilaplacian', 'angle_based'],
    },
    iterations: {
      type: 'number',
      label: 'Smoothing Iterations',
      default: 10,
      min: 1,
      max: 100,
    },
    relaxationFactor: {
      type: 'number',
      label: 'Relaxation Factor',
      default: 0.5,
      min: 0.1,
      max: 1.0,
    },
    preserveFeatures: {
      type: 'boolean',
      label: 'Preserve Sharp Features',
      default: true,
    },
  },
  async evaluate(ctx, inputs, params) {
    const result = await ctx.worker.invoke('SMOOTH_MESH', {
      mesh: inputs.mesh,
      smoothingMethod: params.smoothingMethod,
      iterations: params.iterations,
      relaxationFactor: params.relaxationFactor,
      preserveFeatures: params.preserveFeatures,
    });
    return { smoothedMesh: result };
  },
};

export const meshTopologyNodes = [
  MeshHealingNode,
  TopologyOptimizationNode,
  MeshQualityAnalysisNode,
  NonManifoldRepairNode,
  MeshRefinementNode,
  MeshSmoothingNode,
];
