import type { NodeDefinition } from '@brepflow/types';

interface BayWindowParams {
  projection: number;
  angleCount: number;
  centerAngle: number;
}

interface BayWindowInputs {
  wallOpening: unknown;
}

interface BayWindowOutputs {
  bayWindow: unknown;
  windows: unknown;
}

export const ArchitectureWindowsBayWindowNode: NodeDefinition<
  BayWindowInputs,
  BayWindowOutputs,
  BayWindowParams
> = {
  id: 'Architecture::BayWindow',
  type: 'Architecture::BayWindow',
  category: 'Architecture',
  label: 'BayWindow',
  description: 'Bay window projection',
  inputs: {
    wallOpening: {
      type: 'Wire',
      label: 'Wall Opening',
      required: true,
    },
  },
  outputs: {
    bayWindow: {
      type: 'Shape',
      label: 'Bay Window',
    },
    windows: {
      type: 'Shape[]',
      label: 'Windows',
    },
  },
  params: {
    projection: {
      type: 'number',
      label: 'Projection',
      default: 600,
      min: 400,
      max: 1200,
    },
    angleCount: {
      type: 'number',
      label: 'Angle Count',
      default: 3,
      min: 3,
      max: 5,
      step: 1,
    },
    centerAngle: {
      type: 'number',
      label: 'Center Angle',
      default: 135,
      min: 90,
      max: 180,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'bayWindow',
      params: {
        wallOpening: inputs.wallOpening,
        projection: params.projection,
        angleCount: params.angleCount,
        centerAngle: params.centerAngle,
      },
    });

    return {
      bayWindow: results.bayWindow,
      windows: results.windows,
    };
  },
};
