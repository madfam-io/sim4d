import type { NodeDefinition } from '@brepflow/types';

interface SetCombinationsParams {
  k: number;
}

interface SetCombinationsInputs {
  set: unknown;
}

interface SetCombinationsOutputs {
  combinations: unknown;
}

export const DataSetSetCombinationsNode: NodeDefinition<
  SetCombinationsInputs,
  SetCombinationsOutputs,
  SetCombinationsParams
> = {
  id: 'Data::SetCombinations',
  category: 'Data',
  label: 'SetCombinations',
  description: 'Combinations of set',
  inputs: {
    set: {
      type: 'Data[]',
      label: 'Set',
      required: true,
    },
  },
  outputs: {
    combinations: {
      type: 'Data[][]',
      label: 'Combinations',
    },
  },
  params: {
    k: {
      type: 'number',
      label: 'K',
      default: 2,
      min: 1,
      max: 10,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'setCombinations',
      params: {
        set: inputs.set,
        k: params.k,
      },
    });

    return {
      combinations: result,
    };
  },
};
