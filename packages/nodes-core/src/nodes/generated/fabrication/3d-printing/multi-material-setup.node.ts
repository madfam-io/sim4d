import type { NodeDefinition } from '@brepflow/types';

interface MultiMaterialSetupParams {
  materials: number;
  purgeVolume: number;
}

interface MultiMaterialSetupInputs {
  regions: unknown;
}

interface MultiMaterialSetupOutputs {
  materialAssignment: unknown;
  purgeBlock: unknown;
}

export const Fabrication3DPrintingMultiMaterialSetupNode: NodeDefinition<
  MultiMaterialSetupInputs,
  MultiMaterialSetupOutputs,
  MultiMaterialSetupParams
> = {
  id: 'Fabrication::MultiMaterialSetup',
  category: 'Fabrication',
  label: 'MultiMaterialSetup',
  description: 'Setup multi-material regions',
  inputs: {
    regions: {
      type: 'Shape[]',
      label: 'Regions',
      required: true,
    },
  },
  outputs: {
    materialAssignment: {
      type: 'Data',
      label: 'Material Assignment',
    },
    purgeBlock: {
      type: 'Shape',
      label: 'Purge Block',
    },
  },
  params: {
    materials: {
      type: 'number',
      label: 'Materials',
      default: 2,
      min: 2,
      max: 5,
      step: 1,
    },
    purgeVolume: {
      type: 'number',
      label: 'Purge Volume',
      default: 50,
      min: 0,
      max: 200,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'multiMaterialSetup',
      params: {
        regions: inputs.regions,
        materials: params.materials,
        purgeVolume: params.purgeVolume,
      },
    });

    return {
      materialAssignment: results.materialAssignment,
      purgeBlock: results.purgeBlock,
    };
  },
};
