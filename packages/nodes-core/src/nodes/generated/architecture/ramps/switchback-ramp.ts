import type { NodeDefinition } from '@brepflow/types';

interface SwitchbackRampParams {
  runLength: number;
  landingSize: number;
}

interface SwitchbackRampInputs {
  startPoint: [number, number, number];
  totalRise: number;
}

interface SwitchbackRampOutputs {
  ramp: unknown;
  landings: unknown;
}

export const ArchitectureRampsSwitchbackRampNode: NodeDefinition<
  SwitchbackRampInputs,
  SwitchbackRampOutputs,
  SwitchbackRampParams
> = {
  id: 'Architecture::SwitchbackRamp',
  type: 'Architecture::SwitchbackRamp',
  category: 'Architecture',
  label: 'SwitchbackRamp',
  description: 'Switchback accessibility ramp',
  inputs: {
    startPoint: {
      type: 'Point',
      label: 'Start Point',
      required: true,
    },
    totalRise: {
      type: 'Number',
      label: 'Total Rise',
      required: true,
    },
  },
  outputs: {
    ramp: {
      type: 'Shape',
      label: 'Ramp',
    },
    landings: {
      type: 'Shape[]',
      label: 'Landings',
    },
  },
  params: {
    runLength: {
      type: 'number',
      label: 'Run Length',
      default: 9000,
      min: 6000,
      max: 12000,
    },
    landingSize: {
      type: 'number',
      label: 'Landing Size',
      default: 1500,
      min: 1500,
      max: 2000,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'switchbackRamp',
      params: {
        startPoint: inputs.startPoint,
        totalRise: inputs.totalRise,
        runLength: params.runLength,
        landingSize: params.landingSize,
      },
    });

    return {
      ramp: results.ramp,
      landings: results.landings,
    };
  },
};
