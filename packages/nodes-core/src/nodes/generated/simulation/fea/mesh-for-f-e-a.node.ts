import { NodeDefinition } from '@sim4d/types';

interface Params {
  elementType: string;
  elementSize: number;
  refinementZones: boolean;
  qualityTarget: number;
}
interface Inputs {
  shape: Shape;
  refinementRegions?: Shape[];
}
interface Outputs {
  feaMesh: Mesh;
  qualityReport: Data;
}

export const MeshForFEANode: NodeDefinition<MeshForFEAInputs, MeshForFEAOutputs, MeshForFEAParams> =
  {
    type: 'Simulation::MeshForFEA',
    category: 'Simulation',
    subcategory: 'FEA',

    metadata: {
      label: 'MeshForFEA',
      description: 'Generate FEA-ready mesh',
    },

    params: {
      elementType: {
        default: 'auto',
        options: ['tet4', 'tet10', 'hex8', 'hex20', 'auto'],
      },
      elementSize: {
        default: 5,
        min: 0.1,
        max: 100,
      },
      refinementZones: {
        default: true,
      },
      qualityTarget: {
        default: 0.8,
        min: 0.3,
        max: 1,
      },
    },

    inputs: {
      shape: 'Shape',
      refinementRegions: 'Shape[]',
    },

    outputs: {
      feaMesh: 'Mesh',
      qualityReport: 'Data',
    },

    async evaluate(context, inputs, params) {
      const result = await context.geometry.execute({
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
        feaMesh: result,
        qualityReport: result,
      };
    },
  };
