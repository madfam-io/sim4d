import type { NodeDefinition } from '@sim4d/types';

type OrientParams = Record<string, never>;

interface OrientInputs {
  shape: unknown;
  fromDirection: [number, number, number];
  toDirection: [number, number, number];
}

interface OrientOutputs {
  oriented: unknown;
}

export const TransformOrientNode: NodeDefinition<OrientInputs, OrientOutputs, OrientParams> = {
  id: 'Transform::Orient',
  category: 'Transform',
  label: 'Orient',
  description: 'Orient shape to match reference orientation',
  inputs: {
    shape: {
      type: 'Shape',
      label: 'Shape',
      required: true,
    },
    fromDirection: {
      type: 'Vector',
      label: 'From Direction',
      required: true,
    },
    toDirection: {
      type: 'Vector',
      label: 'To Direction',
      required: true,
    },
  },
  outputs: {
    oriented: {
      type: 'Shape',
      label: 'Oriented',
    },
  },
  params: {},
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'transformOrient',
      params: {
        shape: inputs.shape,
        fromDirection: inputs.fromDirection,
        toDirection: inputs.toDirection,
      },
    });

    return {
      oriented: result,
    };
  },
};
