import type { NodeDefinition } from '@brepflow/types';

interface BeltParams {
  ratio: number;
}

interface BeltInputs {
  pulley1: unknown;
  pulley2: unknown;
}

interface BeltOutputs {
  joint: unknown;
}

export const AssemblyJointsBeltNode: NodeDefinition<BeltInputs, BeltOutputs, BeltParams> = {
  id: 'Assembly::Belt',
  category: 'Assembly',
  label: 'Belt',
  description: 'Create belt/chain constraint',
  inputs: {
    pulley1: {
      type: 'Shape',
      label: 'Pulley1',
      required: true,
    },
    pulley2: {
      type: 'Shape',
      label: 'Pulley2',
      required: true,
    },
  },
  outputs: {
    joint: {
      type: 'Joint',
      label: 'Joint',
    },
  },
  params: {
    ratio: {
      type: 'number',
      label: 'Ratio',
      default: 1,
      min: 0.1,
      max: 100,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'jointBelt',
      params: {
        pulley1: inputs.pulley1,
        pulley2: inputs.pulley2,
        ratio: params.ratio,
      },
    });

    return {
      joint: result,
    };
  },
};
