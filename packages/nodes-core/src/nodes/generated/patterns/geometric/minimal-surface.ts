import type { NodeDefinition } from '@sim4d/types';

interface MinimalSurfaceParams {
  type: string;
  period: number;
}

interface MinimalSurfaceInputs {
  box: unknown;
}

interface MinimalSurfaceOutputs {
  surface: unknown;
}

export const PatternsGeometricMinimalSurfaceNode: NodeDefinition<
  MinimalSurfaceInputs,
  MinimalSurfaceOutputs,
  MinimalSurfaceParams
> = {
  id: 'Patterns::MinimalSurface',
  type: 'Patterns::MinimalSurface',
  category: 'Patterns',
  label: 'MinimalSurface',
  description: 'Minimal surface pattern',
  inputs: {
    box: {
      type: 'Box',
      label: 'Box',
      required: true,
    },
  },
  outputs: {
    surface: {
      type: 'Face[]',
      label: 'Surface',
    },
  },
  params: {
    type: {
      type: 'enum',
      label: 'Type',
      default: 'gyroid',
      options: ['gyroid', 'schwarz', 'diamond', 'neovius'],
    },
    period: {
      type: 'number',
      label: 'Period',
      default: 10,
      min: 1,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'minimalSurface',
      params: {
        box: inputs.box,
        type: params.type,
        period: params.period,
      },
    });

    return {
      surface: result,
    };
  },
};
