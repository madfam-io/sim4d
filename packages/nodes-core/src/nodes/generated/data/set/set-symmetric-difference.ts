import type { NodeDefinition } from '@sim4d/types';

type SetSymmetricDifferenceParams = Record<string, never>;

interface SetSymmetricDifferenceInputs {
  setA: unknown;
  setB: unknown;
}

interface SetSymmetricDifferenceOutputs {
  difference: unknown;
}

export const DataSetSetSymmetricDifferenceNode: NodeDefinition<
  SetSymmetricDifferenceInputs,
  SetSymmetricDifferenceOutputs,
  SetSymmetricDifferenceParams
> = {
  id: 'Data::SetSymmetricDifference',
  type: 'Data::SetSymmetricDifference',
  category: 'Data',
  label: 'SetSymmetricDifference',
  description: 'Symmetric difference',
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
    difference: {
      type: 'Data[]',
      label: 'Difference',
    },
  },
  params: {},
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'setSymmetricDifference',
      params: {
        setA: inputs.setA,
        setB: inputs.setB,
      },
    });

    return {
      difference: result,
    };
  },
};
