import type { NodeDefinition } from '@sim4d/types';

interface PyramidParams {
  baseWidth: number;
  baseDepth: number;
  height: number;
  topWidth: number;
  topDepth: number;
}

type PyramidInputs = Record<string, never>;

interface PyramidOutputs {
  solid: unknown;
}

export const SolidParametricPyramidNode: NodeDefinition<
  PyramidInputs,
  PyramidOutputs,
  PyramidParams
> = {
  id: 'Solid::Pyramid',
  category: 'Solid',
  label: 'Pyramid',
  description: 'Create a pyramid or truncated pyramid',
  inputs: {},
  outputs: {
    solid: {
      type: 'Solid',
      label: 'Solid',
    },
  },
  params: {
    baseWidth: {
      type: 'number',
      label: 'Base Width',
      default: 100,
      min: 0.1,
      max: 10000,
    },
    baseDepth: {
      type: 'number',
      label: 'Base Depth',
      default: 100,
      min: 0.1,
      max: 10000,
    },
    height: {
      type: 'number',
      label: 'Height',
      default: 100,
      min: 0.1,
      max: 10000,
    },
    topWidth: {
      type: 'number',
      label: 'Top Width',
      default: 0,
      min: 0,
      max: 10000,
    },
    topDepth: {
      type: 'number',
      label: 'Top Depth',
      default: 0,
      min: 0,
      max: 10000,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'makePyramid',
      params: {
        baseWidth: params.baseWidth,
        baseDepth: params.baseDepth,
        height: params.height,
        topWidth: params.topWidth,
        topDepth: params.topDepth,
      },
    });

    return {
      solid: result,
    };
  },
};
