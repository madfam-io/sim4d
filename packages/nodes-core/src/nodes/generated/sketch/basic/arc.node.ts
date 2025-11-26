import type { NodeDefinition } from '@sim4d/types';

interface ArcParams {
  centerX: number;
  centerY: number;
  centerZ: number;
  radius: number;
  startAngle: number;
  endAngle: number;
}

type ArcInputs = Record<string, never>;

interface ArcOutputs {
  edge: unknown;
}

export const SketchBasicArcNode: NodeDefinition<ArcInputs, ArcOutputs, ArcParams> = {
  id: 'Sketch::Arc',
  category: 'Sketch',
  label: 'Arc',
  description: 'Create a circular arc',
  inputs: {},
  outputs: {
    edge: {
      type: 'Edge',
      label: 'Edge',
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
    startAngle: {
      type: 'number',
      label: 'Start Angle',
      default: 0,
      min: 0,
      max: 360,
    },
    endAngle: {
      type: 'number',
      label: 'End Angle',
      default: 90,
      min: 0,
      max: 360,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'makeArc',
      params: {
        centerX: params.centerX,
        centerY: params.centerY,
        centerZ: params.centerZ,
        radius: params.radius,
        startAngle: params.startAngle,
        endAngle: params.endAngle,
      },
    });

    return {
      edge: result,
    };
  },
};
