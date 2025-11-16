import type { NodeDefinition } from '@brepflow/types';

interface CounterboreHoleParams {
  holeDiameter: number;
  counterbore: number;
  cbDepth: number;
  holeDepth: number;
}

interface CounterboreHoleInputs {
  solid: unknown;
  position: [number, number, number];
}

interface CounterboreHoleOutputs {
  shape: unknown;
}

export const FeaturesHolesCounterboreHoleNode: NodeDefinition<
  CounterboreHoleInputs,
  CounterboreHoleOutputs,
  CounterboreHoleParams
> = {
  id: 'Features::CounterboreHole',
  category: 'Features',
  label: 'CounterboreHole',
  description: 'Creates a counterbore hole for socket head cap screws',
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
  },
  outputs: {
    shape: {
      type: 'Shape',
      label: 'Shape',
    },
  },
  params: {
    holeDiameter: {
      type: 'number',
      label: 'Hole Diameter',
      default: 6.5,
      min: 0.1,
      max: 100,
    },
    counterbore: {
      type: 'number',
      label: 'Counterbore',
      default: 11,
      min: 0.1,
      max: 200,
    },
    cbDepth: {
      type: 'number',
      label: 'Cb Depth',
      default: 6,
      min: 0.1,
      max: 100,
    },
    holeDepth: {
      type: 'number',
      label: 'Hole Depth',
      default: -1,
      min: -1,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'makeCounterbore',
      params: {
        solid: inputs.solid,
        position: inputs.position,
        holeDiameter: params.holeDiameter,
        counterbore: params.counterbore,
        cbDepth: params.cbDepth,
        holeDepth: params.holeDepth,
      },
    });

    return {
      shape: result,
    };
  },
};
