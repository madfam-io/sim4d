import type { NodeDefinition } from '@brepflow/types';

interface ExportFEAParams {
  format: string;
  includeLoads: boolean;
  includeConstraints: boolean;
  includeMaterials: boolean;
}

interface ExportFEAInputs {
  feaModel: unknown;
  analysisData?: unknown;
}

interface ExportFEAOutputs {
  feaFile: unknown;
}

export const SimulationFEAExportFEANode: NodeDefinition<
  ExportFEAInputs,
  ExportFEAOutputs,
  ExportFEAParams
> = {
  id: 'Simulation::ExportFEA',
  category: 'Simulation',
  label: 'ExportFEA',
  description: 'Export for FEA software',
  inputs: {
    feaModel: {
      type: 'Mesh',
      label: 'Fea Model',
      required: true,
    },
    analysisData: {
      type: 'Data',
      label: 'Analysis Data',
      optional: true,
    },
  },
  outputs: {
    feaFile: {
      type: 'Data',
      label: 'Fea File',
    },
  },
  params: {
    format: {
      type: 'enum',
      label: 'Format',
      default: 'nastran',
      options: ['nastran', 'abaqus', 'ansys', 'calculix'],
    },
    includeLoads: {
      type: 'boolean',
      label: 'Include Loads',
      default: true,
    },
    includeConstraints: {
      type: 'boolean',
      label: 'Include Constraints',
      default: true,
    },
    includeMaterials: {
      type: 'boolean',
      label: 'Include Materials',
      default: true,
    },
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
