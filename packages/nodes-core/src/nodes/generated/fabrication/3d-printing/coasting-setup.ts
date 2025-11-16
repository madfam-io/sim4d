import type { NodeDefinition } from '@brepflow/types';

interface CoastingSetupParams {
  coastVolume: number;
  minVolume: number;
}

interface CoastingSetupInputs {
  extrusions: unknown;
}

interface CoastingSetupOutputs {
  coastingPoints: Array<[number, number, number]>;
}

export const Fabrication3DPrintingCoastingSetupNode: NodeDefinition<
  CoastingSetupInputs,
  CoastingSetupOutputs,
  CoastingSetupParams
> = {
  id: 'Fabrication::CoastingSetup',
  type: 'Fabrication::CoastingSetup',
  category: 'Fabrication',
  label: 'CoastingSetup',
  description: 'Setup coasting parameters',
  inputs: {
    extrusions: {
      type: 'Wire[]',
      label: 'Extrusions',
      required: true,
    },
  },
  outputs: {
    coastingPoints: {
      type: 'Point[]',
      label: 'Coasting Points',
    },
  },
  params: {
    coastVolume: {
      type: 'number',
      label: 'Coast Volume',
      default: 0.064,
      min: 0,
      max: 1,
    },
    minVolume: {
      type: 'number',
      label: 'Min Volume',
      default: 0.8,
      min: 0.1,
      max: 5,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'coastingSetup',
      params: {
        extrusions: inputs.extrusions,
        coastVolume: params.coastVolume,
        minVolume: params.minVolume,
      },
    });

    return {
      coastingPoints: result,
    };
  },
};
