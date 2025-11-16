import type { NodeDefinition } from '@brepflow/types';

interface CircleParams {
  centerX: number;
  centerY: number;
  centerZ: number;
  radius: number;
  filled: boolean;
}

type CircleInputs = Record<string, never>;

interface CircleOutputs {
  shape: unknown;
}

export const SketchBasicCircleNode: NodeDefinition<CircleInputs, CircleOutputs, CircleParams> = {
  id: 'Sketch::Circle',
  type: 'Sketch::Circle',
  category: 'Sketch',
  label: 'Circle',
  description: 'Create a circle',
  inputs: {},
  outputs: {
    shape: {
      type: 'Shape',
      label: 'Shape',
    },
  },
  params: {
    centerX: {
      type: 'number',
      label: 'Center X',
      default: 0,
      min: -10000,
      max: 10000,
    },
    centerY: {
      type: 'number',
      label: 'Center Y',
      default: 0,
      min: -10000,
      max: 10000,
    },
    centerZ: {
      type: 'number',
      label: 'Center Z',
      default: 0,
      min: -10000,
      max: 10000,
    },
    radius: {
      type: 'number',
      label: 'Radius',
      default: 50,
      min: 0.1,
      max: 10000,
    },
    filled: {
      type: 'boolean',
      label: 'Filled',
      default: true,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'makeCircle',
      params: {
        centerX: params.centerX,
        centerY: params.centerY,
        centerZ: params.centerZ,
        radius: params.radius,
        filled: params.filled,
      },
    });

    return {
      shape: result,
    };
  },
};
