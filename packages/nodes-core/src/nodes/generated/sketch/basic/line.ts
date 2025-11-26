import type { NodeDefinition } from '@sim4d/types';

interface LineParams {
  startX: number;
  startY: number;
  startZ: number;
  endX: number;
  endY: number;
  endZ: number;
}

type LineInputs = Record<string, never>;

interface LineOutputs {
  edge: unknown;
}

export const SketchBasicLineNode: NodeDefinition<LineInputs, LineOutputs, LineParams> = {
  id: 'Sketch::Line',
  type: 'Sketch::Line',
  category: 'Sketch',
  label: 'Line',
  description: 'Create a line segment',
  inputs: {},
  outputs: {
    edge: {
      type: 'Edge',
      label: 'Edge',
    },
  },
  params: {
    startX: {
      type: 'number',
      label: 'Start X',
      default: 0,
      min: -10000,
      max: 10000,
    },
    startY: {
      type: 'number',
      label: 'Start Y',
      default: 0,
      min: -10000,
      max: 10000,
    },
    startZ: {
      type: 'number',
      label: 'Start Z',
      default: 0,
      min: -10000,
      max: 10000,
    },
    endX: {
      type: 'number',
      label: 'End X',
      default: 100,
      min: -10000,
      max: 10000,
    },
    endY: {
      type: 'number',
      label: 'End Y',
      default: 0,
      min: -10000,
      max: 10000,
    },
    endZ: {
      type: 'number',
      label: 'End Z',
      default: 0,
      min: -10000,
      max: 10000,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'makeLine',
      params: {
        startX: params.startX,
        startY: params.startY,
        startZ: params.startZ,
        endX: params.endX,
        endY: params.endY,
        endZ: params.endZ,
      },
    });

    return {
      edge: result,
    };
  },
};
