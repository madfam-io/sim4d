import type { NodeDefinition } from '@brepflow/types';

interface ZebraAnalysisParams {
  stripeCount: number;
  stripeDirection: [number, number, number];
  stripeWidth: number;
}

interface ZebraAnalysisInputs {
  surface: unknown;
}

interface ZebraAnalysisOutputs {
  stripes: unknown;
}

export const SurfaceAnalysisZebraAnalysisNode: NodeDefinition<
  ZebraAnalysisInputs,
  ZebraAnalysisOutputs,
  ZebraAnalysisParams
> = {
  id: 'Surface::ZebraAnalysis',
  type: 'Surface::ZebraAnalysis',
  category: 'Surface',
  label: 'ZebraAnalysis',
  description: 'Zebra stripe analysis',
  inputs: {
    surface: {
      type: 'Face',
      label: 'Surface',
      required: true,
    },
  },
  outputs: {
    stripes: {
      type: 'Wire[]',
      label: 'Stripes',
    },
  },
  params: {
    stripeCount: {
      type: 'number',
      label: 'Stripe Count',
      default: 20,
      min: 5,
      max: 100,
      step: 1,
    },
    stripeDirection: {
      type: 'vec3',
      label: 'Stripe Direction',
      default: [0, 0, 1],
    },
    stripeWidth: {
      type: 'number',
      label: 'Stripe Width',
      default: 1,
      min: 0.1,
      max: 10,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'zebraAnalysis',
      params: {
        surface: inputs.surface,
        stripeCount: params.stripeCount,
        stripeDirection: params.stripeDirection,
        stripeWidth: params.stripeWidth,
      },
    });

    return {
      stripes: result,
    };
  },
};
