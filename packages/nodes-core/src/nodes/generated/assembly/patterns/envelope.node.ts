import type { NodeDefinition } from '@sim4d/types';

interface EnvelopeParams {
  type: string;
}

interface EnvelopeInputs {
  assembly: unknown;
}

interface EnvelopeOutputs {
  envelope: unknown;
}

export const AssemblyPatternsEnvelopeNode: NodeDefinition<
  EnvelopeInputs,
  EnvelopeOutputs,
  EnvelopeParams
> = {
  id: 'Assembly::Envelope',
  category: 'Assembly',
  label: 'Envelope',
  description: 'Create assembly envelope',
  inputs: {
    assembly: {
      type: 'Assembly',
      label: 'Assembly',
      required: true,
    },
  },
  outputs: {
    envelope: {
      type: 'Shape',
      label: 'Envelope',
    },
  },
  params: {
    type: {
      type: 'enum',
      label: 'Type',
      default: 'bounding',
      options: ['bounding', 'swept', 'motion'],
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'assemblyEnvelope',
      params: {
        assembly: inputs.assembly,
        type: params.type,
      },
    });

    return {
      envelope: result,
    };
  },
};
