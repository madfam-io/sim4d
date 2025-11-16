import type { NodeDefinition } from '@brepflow/types';

type ProductParams = Record<string, never>;

interface ProductInputs {
  values: unknown;
}

interface ProductOutputs {
  product: unknown;
}

export const MathStatisticsProductNode: NodeDefinition<
  ProductInputs,
  ProductOutputs,
  ProductParams
> = {
  id: 'Math::Product',
  type: 'Math::Product',
  category: 'Math',
  label: 'Product',
  description: 'Product of values',
  inputs: {
    values: {
      type: 'number[]',
      label: 'Values',
      required: true,
    },
  },
  outputs: {
    product: {
      type: 'number',
      label: 'Product',
    },
  },
  params: {},
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'mathProduct',
      params: {
        values: inputs.values,
      },
    });

    return {
      product: result,
    };
  },
};
