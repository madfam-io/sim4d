import { NodeDefinition } from '@brepflow/types';

interface Params {
  format: string;
  meshFormat: string;
}
interface Inputs {
  cfdModel: Mesh;
  setupData: Data;
}
interface Outputs {
  cfdFiles: Data;
}

export const ExportCFDNode: NodeDefinition<ExportCFDInputs, ExportCFDOutputs, ExportCFDParams> = {
  type: 'Simulation::ExportCFD',
  category: 'Simulation',
  subcategory: 'CFD',

  metadata: {
    label: 'ExportCFD',
    description: 'Export for CFD software',
  },

  params: {
    format: {
      default: 'openfoam',
      options: ['openfoam', 'fluent', 'cfx', 'star-ccm'],
    },
    meshFormat: {
      default: 'polyhedral',
      options: ['polyhedral', 'tetrahedral', 'hexahedral'],
    },
  },

  inputs: {
    cfdModel: 'Mesh',
    setupData: 'Data',
  },

  outputs: {
    cfdFiles: 'Data',
  },

  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'exportCFD',
      params: {
        cfdModel: inputs.cfdModel,
        setupData: inputs.setupData,
        format: params.format,
        meshFormat: params.meshFormat,
      },
    });

    return {
      cfdFiles: result,
    };
  },
};
