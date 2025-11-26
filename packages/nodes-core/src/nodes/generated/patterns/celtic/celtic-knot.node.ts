import type { NodeDefinition } from '@sim4d/types';

interface CelticKnotParams {
  type: string;
  width: number;
}

interface CelticKnotInputs {
  path: unknown;
}

interface CelticKnotOutputs {
  knot: unknown;
}

export const PatternsCelticCelticKnotNode: NodeDefinition<
  CelticKnotInputs,
  CelticKnotOutputs,
  CelticKnotParams
> = {
  id: 'Patterns::CelticKnot',
  category: 'Patterns',
  label: 'CelticKnot',
  description: 'Celtic knot pattern',
  inputs: {
    path: {
      type: 'Wire',
      label: 'Path',
      required: true,
    },
  },
  outputs: {
    knot: {
      type: 'Wire[]',
      label: 'Knot',
    },
  },
  params: {
    type: {
      type: 'enum',
      label: 'Type',
      default: 'trinity',
      options: ['trinity', 'spiral', 'maze', 'cross'],
    },
    width: {
      type: 'number',
      label: 'Width',
      default: 2,
      min: 0.5,
      max: 5,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'celticKnot',
      params: {
        path: inputs.path,
        type: params.type,
        width: params.width,
      },
    });

    return {
      knot: result,
    };
  },
};
