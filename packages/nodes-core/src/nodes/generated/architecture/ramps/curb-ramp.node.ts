import type { NodeDefinition } from '@sim4d/types';

interface CurbRampParams {
  type: string;
  flareSlope: number;
}

interface CurbRampInputs {
  curbLine: unknown;
}

interface CurbRampOutputs {
  curbRamp: unknown;
}

export const ArchitectureRampsCurbRampNode: NodeDefinition<
  CurbRampInputs,
  CurbRampOutputs,
  CurbRampParams
> = {
  id: 'Architecture::CurbRamp',
  category: 'Architecture',
  label: 'CurbRamp',
  description: 'Curb cut ramp',
  inputs: {
    curbLine: {
      type: 'Wire',
      label: 'Curb Line',
      required: true,
    },
  },
  outputs: {
    curbRamp: {
      type: 'Shape',
      label: 'Curb Ramp',
    },
  },
  params: {
    type: {
      type: 'enum',
      label: 'Type',
      default: 'perpendicular',
      options: ['perpendicular', 'parallel', 'combination'],
    },
    flareSlope: {
      type: 'number',
      label: 'Flare Slope',
      default: 0.1,
      min: 0.083,
      max: 0.125,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'curbRamp',
      params: {
        curbLine: inputs.curbLine,
        type: params.type,
        flareSlope: params.flareSlope,
      },
    });

    return {
      curbRamp: result,
    };
  },
};
