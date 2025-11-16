import type { NodeDefinition } from '@brepflow/types';

type SetUnionParams = Record<string, never>;

interface SetUnionInputs {
  setA: unknown;
  setB: unknown;
}

interface SetUnionOutputs {
  union: unknown;
}

export const DataSetSetUnionNode: NodeDefinition<SetUnionInputs, SetUnionOutputs, SetUnionParams> =
  {
    id: 'Data::SetUnion',
    category: 'Data',
    label: 'SetUnion',
    description: 'Union of sets',
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
      union: {
        type: 'Data[]',
        label: 'Union',
      },
    },
    params: {},
    async evaluate(context, inputs, params) {
      const result = await context.geometry.execute({
        type: 'setUnion',
        params: {
          setA: inputs.setA,
          setB: inputs.setB,
        },
      });

      return {
        union: result,
      };
    },
  };
