import type { NodeDefinition } from '@brepflow/types';

type SetCartesianProductParams = Record<string, never>;

interface SetCartesianProductInputs {
  setA: unknown;
  setB: unknown;
}

interface SetCartesianProductOutputs {
  product: unknown;
}

export const DataSetSetCartesianProductNode: NodeDefinition<
  SetCartesianProductInputs,
  SetCartesianProductOutputs,
  SetCartesianProductParams
> = {
  id: 'Data::SetCartesianProduct',
  category: 'Data',
  label: 'SetCartesianProduct',
  description: 'Cartesian product',
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
    product: {
      type: 'Data[][]',
      label: 'Product',
    },
  },
  params: {},
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'setCartesian',
      params: {
        setA: inputs.setA,
        setB: inputs.setB,
      },
    });

    return {
      product: result,
    };
  },
};
