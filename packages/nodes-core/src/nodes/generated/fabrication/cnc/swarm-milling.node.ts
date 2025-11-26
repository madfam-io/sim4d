import type { NodeDefinition } from '@sim4d/types';

interface SwarmMillingParams {
  passCount: number;
  overlap: number;
}

interface SwarmMillingInputs {
  surface: unknown;
}

interface SwarmMillingOutputs {
  swarmPaths: unknown;
}

export const FabricationCNCSwarmMillingNode: NodeDefinition<
  SwarmMillingInputs,
  SwarmMillingOutputs,
  SwarmMillingParams
> = {
  id: 'Fabrication::SwarmMilling',
  category: 'Fabrication',
  label: 'SwarmMilling',
  description: 'Swarm/parallel finishing',
  inputs: {
    surface: {
      type: 'Face',
      label: 'Surface',
      required: true,
    },
  },
  outputs: {
    swarmPaths: {
      type: 'Wire[]',
      label: 'Swarm Paths',
    },
  },
  params: {
    passCount: {
      type: 'number',
      label: 'Pass Count',
      default: 5,
      min: 1,
      max: 20,
      step: 1,
    },
    overlap: {
      type: 'number',
      label: 'Overlap',
      default: 0.1,
      min: 0,
      max: 0.5,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'swarmMilling',
      params: {
        surface: inputs.surface,
        passCount: params.passCount,
        overlap: params.overlap,
      },
    });

    return {
      swarmPaths: result,
    };
  },
};
