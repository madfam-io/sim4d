import type { NodeDefinition } from '@brepflow/types';

type SetPowerSetParams = Record<string, never>;

interface SetPowerSetInputs {
  set: unknown;
}

interface SetPowerSetOutputs {
  powerSet: unknown;
}

export const DataSetSetPowerSetNode: NodeDefinition<
  SetPowerSetInputs,
  SetPowerSetOutputs,
  SetPowerSetParams
> = {
  id: 'Data::SetPowerSet',
  type: 'Data::SetPowerSet',
  category: 'Data',
  label: 'SetPowerSet',
  description: 'Power set',
  inputs: {
    set: {
      type: 'Data[]',
      label: 'Set',
      required: true,
    },
  },
  outputs: {
    powerSet: {
      type: 'Data[][]',
      label: 'Power Set',
    },
  },
  params: {},
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'setPowerSet',
      params: {
        set: inputs.set,
      },
    });

    return {
      powerSet: result,
    };
  },
};
