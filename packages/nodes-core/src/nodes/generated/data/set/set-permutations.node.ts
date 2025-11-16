import type { NodeDefinition } from '@brepflow/types';

interface SetPermutationsParams {
  k: number;
}

interface SetPermutationsInputs {
  set: unknown;
}

interface SetPermutationsOutputs {
  permutations: unknown;
}

export const DataSetSetPermutationsNode: NodeDefinition<
  SetPermutationsInputs,
  SetPermutationsOutputs,
  SetPermutationsParams
> = {
  id: 'Data::SetPermutations',
  category: 'Data',
  label: 'SetPermutations',
  description: 'Permutations of set',
  inputs: {
    set: {
      type: 'Data[]',
      label: 'Set',
      required: true,
    },
  },
  outputs: {
    permutations: {
      type: 'Data[][]',
      label: 'Permutations',
    },
  },
  params: {
    k: {
      type: 'number',
      label: 'K',
      default: -1,
      min: -1,
      max: 10,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'setPermutations',
      params: {
        set: inputs.set,
        k: params.k,
      },
    });

    return {
      permutations: result,
    };
  },
};
