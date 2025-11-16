import type { NodeDefinition } from '@brepflow/types';

type SetDifferenceParams = Record<string, never>;

interface SetDifferenceInputs {
  setA: unknown;
  setB: unknown;
}

interface SetDifferenceOutputs {
  difference: unknown;
}

export const DataSetSetDifferenceNode: NodeDefinition<
  SetDifferenceInputs,
  SetDifferenceOutputs,
  SetDifferenceParams
> = {
  id: 'Data::SetDifference',
  type: 'Data::SetDifference',
  category: 'Data',
  label: 'SetDifference',
  description: 'Difference of sets',
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
      type: 'setDifference',
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
