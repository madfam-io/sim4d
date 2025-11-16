import type { NodeDefinition } from '@brepflow/types';

interface FlexParams {
  bendAngle: number;
  bendRadius: number;
  accuracy: number;
}

interface FlexInputs {
  solid: unknown;
  bendPlane: unknown;
  trimPlanes?: unknown;
}

interface FlexOutputs {
  flexed: unknown;
}

export const AdvancedFeaturesFlexNode: NodeDefinition<FlexInputs, FlexOutputs, FlexParams> = {
  id: 'Advanced::Flex',
  type: 'Advanced::Flex',
  category: 'Advanced',
  label: 'Flex',
  description: 'Flex solid for living hinges',
  inputs: {
    solid: {
      type: 'Shape',
      label: 'Solid',
      required: true,
    },
    bendPlane: {
      type: 'Plane',
      label: 'Bend Plane',
      required: true,
    },
    trimPlanes: {
      type: 'Plane[]',
      label: 'Trim Planes',
      optional: true,
    },
  },
  outputs: {
    flexed: {
      type: 'Shape',
      label: 'Flexed',
    },
  },
  params: {
    bendAngle: {
      type: 'number',
      label: 'Bend Angle',
      default: 90,
      min: 0,
      max: 180,
    },
    bendRadius: {
      type: 'number',
      label: 'Bend Radius',
      default: 10,
      min: 0.1,
      max: 1000,
    },
    accuracy: {
      type: 'number',
      label: 'Accuracy',
      default: 1,
      min: 0.1,
      max: 10,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'flex',
      params: {
        solid: inputs.solid,
        bendPlane: inputs.bendPlane,
        trimPlanes: inputs.trimPlanes,
        bendAngle: params.bendAngle,
        bendRadius: params.bendRadius,
        accuracy: params.accuracy,
      },
    });

    return {
      flexed: result,
    };
  },
};
