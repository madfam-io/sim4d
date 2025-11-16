import type { NodeDefinition } from '@brepflow/types';

interface MeshForFEAParams {
  elementType: string;
  elementSize: number;
  refinementZones: boolean;
  qualityTarget: number;
}

interface MeshForFEAInputs {
  shape: unknown;
  refinementRegions?: unknown;
}

interface MeshForFEAOutputs {
  feaMesh: unknown;
  qualityReport: unknown;
}

export const SimulationFEAMeshForFEANode: NodeDefinition<
  MeshForFEAInputs,
  MeshForFEAOutputs,
  MeshForFEAParams
> = {
  id: 'Simulation::MeshForFEA',
  category: 'Simulation',
  label: 'MeshForFEA',
  description: 'Generate FEA-ready mesh',
  inputs: {
    shape: {
      type: 'Shape',
      label: 'Shape',
      required: true,
    },
    refinementRegions: {
      type: 'Shape[]',
      label: 'Refinement Regions',
      optional: true,
    },
  },
  outputs: {
    feaMesh: {
      type: 'Mesh',
      label: 'Fea Mesh',
    },
    qualityReport: {
      type: 'Data',
      label: 'Quality Report',
    },
  },
  params: {
    elementType: {
      type: 'enum',
      label: 'Element Type',
      default: 'auto',
      options: ['tet4', 'tet10', 'hex8', 'hex20', 'auto'],
    },
    elementSize: {
      type: 'number',
      label: 'Element Size',
      default: 5,
      min: 0.1,
      max: 100,
    },
    refinementZones: {
      type: 'boolean',
      label: 'Refinement Zones',
      default: true,
    },
    qualityTarget: {
      type: 'number',
      label: 'Quality Target',
      default: 0.8,
      min: 0.3,
      max: 1,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'meshForFEA',
      params: {
        shape: inputs.shape,
        refinementRegions: inputs.refinementRegions,
        elementType: params.elementType,
        elementSize: params.elementSize,
        refinementZones: params.refinementZones,
        qualityTarget: params.qualityTarget,
      },
    });

    return {
      feaMesh: results.feaMesh,
      qualityReport: results.qualityReport,
    };
  },
};
