import type { NodeDefinition } from '@sim4d/types';

interface RampEntryParams {
  rampAngle: number;
  rampLength: number;
}

interface RampEntryInputs {
  entryEdge: unknown;
  depth: number;
}

interface RampEntryOutputs {
  rampPath: unknown;
}

export const FabricationCNCRampEntryNode: NodeDefinition<
  RampEntryInputs,
  RampEntryOutputs,
  RampEntryParams
> = {
  id: 'Fabrication::RampEntry',
  category: 'Fabrication',
  label: 'RampEntry',
  description: 'Ramped plunge entry',
  inputs: {
    entryEdge: {
      type: 'Edge',
      label: 'Entry Edge',
      required: true,
    },
    depth: {
      type: 'Number',
      label: 'Depth',
      required: true,
    },
  },
  outputs: {
    rampPath: {
      type: 'Wire',
      label: 'Ramp Path',
    },
  },
  params: {
    rampAngle: {
      type: 'number',
      label: 'Ramp Angle',
      default: 5,
      min: 1,
      max: 30,
    },
    rampLength: {
      type: 'number',
      label: 'Ramp Length',
      default: 20,
      min: 5,
      max: 100,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'rampEntry',
      params: {
        entryEdge: inputs.entryEdge,
        depth: inputs.depth,
        rampAngle: params.rampAngle,
        rampLength: params.rampLength,
      },
    });

    return {
      rampPath: result,
    };
  },
};
