import type { NodeDefinition } from '@sim4d/types';

interface RectangleParams {
  centerX: number;
  centerY: number;
  width: number;
  height: number;
  filled: boolean;
  cornerRadius: number;
}

type RectangleInputs = Record<string, never>;

interface RectangleOutputs {
  shape: unknown;
}

export const SketchBasicRectangleNode: NodeDefinition<
  RectangleInputs,
  RectangleOutputs,
  RectangleParams
> = {
  id: 'Sketch::Rectangle',
  type: 'Sketch::Rectangle',
  category: 'Sketch',
  label: 'Rectangle',
  description: 'Create a rectangle',
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
    width: {
      type: 'number',
      label: 'Width',
      default: 100,
      min: 0.1,
      max: 10000,
    },
    height: {
      type: 'number',
      label: 'Height',
      default: 50,
      min: 0.1,
      max: 10000,
    },
    filled: {
      type: 'boolean',
      label: 'Filled',
      default: true,
    },
    cornerRadius: {
      type: 'number',
      label: 'Corner Radius',
      default: 0,
      min: 0,
      max: 1000,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'makeRectangle',
      params: {
        centerX: params.centerX,
        centerY: params.centerY,
        width: params.width,
        height: params.height,
        filled: params.filled,
        cornerRadius: params.cornerRadius,
      },
    });

    return {
      shape: result,
    };
  },
};
