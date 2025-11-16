import type { NodeDefinition } from '@brepflow/types';

interface StraightRampParams {
  slope: number;
  width: number;
  handrails: boolean;
}

interface StraightRampInputs {
  startPoint: [number, number, number];
  endPoint: [number, number, number];
}

interface StraightRampOutputs {
  ramp: unknown;
  handrails: unknown;
}

export const ArchitectureRampsStraightRampNode: NodeDefinition<
  StraightRampInputs,
  StraightRampOutputs,
  StraightRampParams
> = {
  id: 'Architecture::StraightRamp',
  type: 'Architecture::StraightRamp',
  category: 'Architecture',
  label: 'StraightRamp',
  description: 'Straight access ramp',
  inputs: {
    startPoint: {
      type: 'Point',
      label: 'Start Point',
      required: true,
    },
    endPoint: {
      type: 'Point',
      label: 'End Point',
      required: true,
    },
  },
  outputs: {
    ramp: {
      type: 'Shape',
      label: 'Ramp',
    },
    handrails: {
      type: 'Shape[]',
      label: 'Handrails',
    },
  },
  params: {
    slope: {
      type: 'number',
      label: 'Slope',
      default: 0.083,
      min: 0.05,
      max: 0.125,
    },
    width: {
      type: 'number',
      label: 'Width',
      default: 1200,
      min: 900,
      max: 2000,
    },
    handrails: {
      type: 'boolean',
      label: 'Handrails',
      default: true,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'straightRamp',
      params: {
        startPoint: inputs.startPoint,
        endPoint: inputs.endPoint,
        slope: params.slope,
        width: params.width,
        handrails: params.handrails,
      },
    });

    return {
      ramp: results.ramp,
      handrails: results.handrails,
    };
  },
};
