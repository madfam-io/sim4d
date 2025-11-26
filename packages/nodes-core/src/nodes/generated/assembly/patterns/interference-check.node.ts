import type { NodeDefinition } from '@sim4d/types';

interface InterferenceCheckParams {
  clearance: number;
}

interface InterferenceCheckInputs {
  assembly: unknown;
}

interface InterferenceCheckOutputs {
  interferences: unknown;
  hasInterference: unknown;
}

export const AssemblyPatternsInterferenceCheckNode: NodeDefinition<
  InterferenceCheckInputs,
  InterferenceCheckOutputs,
  InterferenceCheckParams
> = {
  id: 'Assembly::InterferenceCheck',
  category: 'Assembly',
  label: 'InterferenceCheck',
  description: 'Check for interferences',
  inputs: {
    assembly: {
      type: 'Assembly',
      label: 'Assembly',
      required: true,
    },
  },
  outputs: {
    interferences: {
      type: 'Interference[]',
      label: 'Interferences',
    },
    hasInterference: {
      type: 'boolean',
      label: 'Has Interference',
    },
  },
  params: {
    clearance: {
      type: 'number',
      label: 'Clearance',
      default: 0,
      min: 0,
      max: 100,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'assemblyInterference',
      params: {
        assembly: inputs.assembly,
        clearance: params.clearance,
      },
    });

    return {
      interferences: results.interferences,
      hasInterference: results.hasInterference,
    };
  },
};
