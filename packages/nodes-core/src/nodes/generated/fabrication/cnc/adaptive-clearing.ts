import type { NodeDefinition } from '@brepflow/types';

interface AdaptiveClearingParams {
  optimalLoad: number;
  helixAngle: number;
}

interface AdaptiveClearingInputs {
  region: unknown;
  depth: number;
}

interface AdaptiveClearingOutputs {
  adaptivePath: unknown;
}

export const FabricationCNCAdaptiveClearingNode: NodeDefinition<
  AdaptiveClearingInputs,
  AdaptiveClearingOutputs,
  AdaptiveClearingParams
> = {
  id: 'Fabrication::AdaptiveClearing',
  type: 'Fabrication::AdaptiveClearing',
  category: 'Fabrication',
  label: 'AdaptiveClearing',
  description: 'Adaptive clearing strategy',
  inputs: {
    region: {
      type: 'Face',
      label: 'Region',
      required: true,
    },
    depth: {
      type: 'Number',
      label: 'Depth',
      required: true,
    },
  },
  outputs: {
    adaptivePath: {
      type: 'Wire',
      label: 'Adaptive Path',
    },
  },
  params: {
    optimalLoad: {
      type: 'number',
      label: 'Optimal Load',
      default: 0.4,
      min: 0.1,
      max: 1,
    },
    helixAngle: {
      type: 'number',
      label: 'Helix Angle',
      default: 3,
      min: 0,
      max: 10,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'adaptiveClearing',
      params: {
        region: inputs.region,
        depth: inputs.depth,
        optimalLoad: params.optimalLoad,
        helixAngle: params.helixAngle,
      },
    });

    return {
      adaptivePath: result,
    };
  },
};
