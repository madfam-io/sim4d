import type { NodeDefinition } from '@brepflow/types';

interface ImprintParams {
  depth: number;
}

interface ImprintInputs {
  base: unknown;
  imprint: unknown;
}

interface ImprintOutputs {
  result: unknown;
}

export const BooleanImprintNode: NodeDefinition<ImprintInputs, ImprintOutputs, ImprintParams> = {
  id: 'Boolean::Imprint',
  category: 'Boolean',
  label: 'Imprint',
  description: 'Imprint one shape onto another',
  inputs: {
    base: {
      type: 'Shape',
      label: 'Base',
      required: true,
    },
    imprint: {
      type: 'Shape',
      label: 'Imprint',
      required: true,
    },
  },
  outputs: {
    result: {
      type: 'Shape',
      label: 'Result',
    },
  },
  params: {
    depth: {
      type: 'number',
      label: 'Depth',
      default: 1,
      min: 0.01,
      max: 1000,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'booleanImprint',
      params: {
        base: inputs.base,
        imprint: inputs.imprint,
        depth: params.depth,
      },
    });

    return {
      result: result,
    };
  },
};
