import { NodeDefinition } from '@sim4d/types';

interface Params {
  format: string;
  includeLoads: boolean;
  includeConstraints: boolean;
  includeMaterials: boolean;
}
interface Inputs {
  feaModel: Mesh;
  analysisData?: Data;
}
interface Outputs {
  feaFile: Data;
}

export const ExportFEANode: NodeDefinition<ExportFEAInputs, ExportFEAOutputs, ExportFEAParams> = {
  type: 'Simulation::ExportFEA',
  category: 'Simulation',
  subcategory: 'FEA',

  metadata: {
    label: 'ExportFEA',
    description: 'Export for FEA software',
  },

  params: {
    format: {
      default: 'nastran',
      options: ['nastran', 'abaqus', 'ansys', 'calculix'],
    },
    includeLoads: {
      default: true,
    },
    includeConstraints: {
      default: true,
    },
    includeMaterials: {
      default: true,
    },
  },

  inputs: {
    feaModel: 'Mesh',
    analysisData: 'Data',
  },

  outputs: {
    feaFile: 'Data',
  },

  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'exportFEA',
      params: {
        feaModel: inputs.feaModel,
        analysisData: inputs.analysisData,
        format: params.format,
        includeLoads: params.includeLoads,
        includeConstraints: params.includeConstraints,
        includeMaterials: params.includeMaterials,
      },
    });

    return {
      feaFile: result,
    };
  },
};
