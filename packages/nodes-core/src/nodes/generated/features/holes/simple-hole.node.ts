import type { NodeDefinition } from '@brepflow/types';

interface SimpleHoleParams {
  diameter: number;
  depth: number;
}

interface SimpleHoleInputs {
  solid: unknown;
  position: [number, number, number];
  direction?: [number, number, number];
}

interface SimpleHoleOutputs {
  shape: unknown;
}

export const FeaturesHolesSimpleHoleNode: NodeDefinition<
  SimpleHoleInputs,
  SimpleHoleOutputs,
  SimpleHoleParams
> = {
  id: 'Features::SimpleHole',
  category: 'Features',
  label: 'SimpleHole',
  description: 'Creates a simple through hole',
  inputs: {
    solid: {
      type: 'Shape',
      label: 'Solid',
      required: true,
    },
    position: {
      type: 'Point',
      label: 'Position',
      required: true,
    },
    direction: {
      type: 'Vector',
      label: 'Direction',
      optional: true,
    },
  },
  outputs: {
    shape: {
      type: 'Shape',
      label: 'Shape',
    },
  },
  params: {
    diameter: {
      type: 'number',
      label: 'Diameter',
      default: 10,
      min: 0.1,
      max: 1000,
      step: 0.1,
    },
    depth: {
      type: 'number',
      label: 'Depth',
      default: -1,
      min: -1,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'makeHole',
      params: {
        solid: inputs.solid,
        position: inputs.position,
        direction: inputs.direction,
        diameter: params.diameter,
        depth: params.depth,
      },
    });

    return {
      shape: result,
    };
  },
};
