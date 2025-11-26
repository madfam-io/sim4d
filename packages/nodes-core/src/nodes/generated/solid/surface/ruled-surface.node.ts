import type { NodeDefinition } from '@sim4d/types';

type RuledSurfaceParams = Record<string, never>;

interface RuledSurfaceInputs {
  curve1: unknown;
  curve2: unknown;
}

interface RuledSurfaceOutputs {
  surface: unknown;
}

export const SolidSurfaceRuledSurfaceNode: NodeDefinition<
  RuledSurfaceInputs,
  RuledSurfaceOutputs,
  RuledSurfaceParams
> = {
  id: 'Solid::RuledSurface',
  category: 'Solid',
  label: 'RuledSurface',
  description: 'Create a ruled surface between two curves',
  inputs: {
    curve1: {
      type: 'Wire',
      label: 'Curve1',
      required: true,
    },
    curve2: {
      type: 'Wire',
      label: 'Curve2',
      required: true,
    },
  },
  outputs: {
    surface: {
      type: 'Face',
      label: 'Surface',
    },
  },
  params: {},
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'makeRuledSurface',
      params: {
        curve1: inputs.curve1,
        curve2: inputs.curve2,
      },
    });

    return {
      surface: result,
    };
  },
};
