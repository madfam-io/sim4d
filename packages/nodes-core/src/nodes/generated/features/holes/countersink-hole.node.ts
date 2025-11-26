import type { NodeDefinition } from '@sim4d/types';

interface CountersinkHoleParams {
  holeDiameter: number;
  countersinkDiameter: number;
  angle: string;
  depth: number;
}

interface CountersinkHoleInputs {
  solid: unknown;
  position: [number, number, number];
}

interface CountersinkHoleOutputs {
  shape: unknown;
}

export const FeaturesHolesCountersinkHoleNode: NodeDefinition<
  CountersinkHoleInputs,
  CountersinkHoleOutputs,
  CountersinkHoleParams
> = {
  id: 'Features::CountersinkHole',
  category: 'Features',
  label: 'CountersinkHole',
  description: 'Creates a countersink hole for flat head screws',
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
    countersinkDiameter: {
      type: 'number',
      label: 'Countersink Diameter',
      default: 12,
      min: 0.1,
      max: 200,
    },
    angle: {
      type: 'enum',
      label: 'Angle',
      default: '90',
      options: ['82', '90', '100', '120'],
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
      type: 'makeCountersink',
      params: {
        solid: inputs.solid,
        position: inputs.position,
        holeDiameter: params.holeDiameter,
        countersinkDiameter: params.countersinkDiameter,
        angle: params.angle,
        depth: params.depth,
      },
    });

    return {
      shape: result,
    };
  },
};
