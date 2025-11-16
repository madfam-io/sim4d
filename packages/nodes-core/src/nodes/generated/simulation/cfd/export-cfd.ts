import type { NodeDefinition } from '@brepflow/types';

interface ExportCFDParams {
  format: string;
  meshFormat: string;
}

interface ExportCFDInputs {
  cfdModel: unknown;
  setupData: unknown;
}

interface ExportCFDOutputs {
  cfdFiles: unknown;
}

export const SimulationCFDExportCFDNode: NodeDefinition<
  ExportCFDInputs,
  ExportCFDOutputs,
  ExportCFDParams
> = {
  id: 'Simulation::ExportCFD',
  type: 'Simulation::ExportCFD',
  category: 'Simulation',
  label: 'ExportCFD',
  description: 'Export for CFD software',
  inputs: {
    cfdModel: {
      type: 'Mesh',
      label: 'Cfd Model',
      required: true,
    },
    setupData: {
      type: 'Data',
      label: 'Setup Data',
      required: true,
    },
  },
  outputs: {
    cfdFiles: {
      type: 'Data',
      label: 'Cfd Files',
    },
  },
  params: {
    format: {
      type: 'enum',
      label: 'Format',
      default: 'openfoam',
      options: ['openfoam', 'fluent', 'cfx', 'star-ccm'],
    },
    meshFormat: {
      type: 'enum',
      label: 'Mesh Format',
      default: 'polyhedral',
      options: ['polyhedral', 'tetrahedral', 'hexahedral'],
    },
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
