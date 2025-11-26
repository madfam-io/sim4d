import type { NodeDefinition } from '@sim4d/types';

type SetSubsetParams = Record<string, never>;

interface SetSubsetInputs {
  setA: unknown;
  setB: unknown;
}

interface SetSubsetOutputs {
  isSubset: unknown;
}

export const DataSetSetSubsetNode: NodeDefinition<
  SetSubsetInputs,
  SetSubsetOutputs,
  SetSubsetParams
> = {
  id: 'Data::SetSubset',
  category: 'Data',
  label: 'SetSubset',
  description: 'Check if subset',
  inputs: {
    setA: {
      type: 'Data[]',
      label: 'Set A',
      required: true,
    },
    setB: {
      type: 'Data[]',
      label: 'Set B',
      required: true,
    },
  },
  outputs: {
    isSubset: {
      type: 'boolean',
      label: 'Is Subset',
    },
  },
  params: {},
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'setSubset',
      params: {
        setA: inputs.setA,
        setB: inputs.setB,
      },
    });

    return {
      isSubset: result,
    };
  },
};
