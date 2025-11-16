import type { NodeDefinition } from '@brepflow/types';

interface PointParams {
  x: number;
  y: number;
  z: number;
}

type PointInputs = Record<string, never>;

interface PointOutputs {
  point: [number, number, number];
}

export const SketchBasicPointNode: NodeDefinition<PointInputs, PointOutputs, PointParams> = {
  id: 'Sketch::Point',
  category: 'Sketch',
  label: 'Point',
  description: 'Create a point',
  inputs: {},
  outputs: {
    point: {
      type: 'Point',
      label: 'Point',
    },
  },
  params: {
    x: {
      type: 'number',
      label: 'X',
      default: 0,
      min: -10000,
      max: 10000,
    },
    y: {
      type: 'number',
      label: 'Y',
      default: 0,
      min: -10000,
      max: 10000,
    },
    z: {
      type: 'number',
      label: 'Z',
      default: 0,
      min: -10000,
      max: 10000,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'makePoint',
      params: {
        x: params.x,
        y: params.y,
        z: params.z,
      },
    });

    return {
      point: result,
    };
  },
};
