import type { NodeDefinition } from '@sim4d/types';

type FastenedParams = Record<string, never>;

interface FastenedInputs {
  component1: unknown;
  component2: unknown;
}

interface FastenedOutputs {
  fastened: unknown;
  mate: unknown;
}

export const AssemblyMatesFastenedNode: NodeDefinition<
  FastenedInputs,
  FastenedOutputs,
  FastenedParams
> = {
  id: 'Assembly::Fastened',
  type: 'Assembly::Fastened',
  category: 'Assembly',
  label: 'Fastened',
  description: 'Fasten components together rigidly',
  inputs: {
    component1: {
      type: 'Shape',
      label: 'Component1',
      required: true,
    },
    component2: {
      type: 'Shape',
      label: 'Component2',
      required: true,
    },
  },
  outputs: {
    fastened: {
      type: 'Shape[]',
      label: 'Fastened',
    },
    mate: {
      type: 'Mate',
      label: 'Mate',
    },
  },
  params: {},
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'mateFastened',
      params: {
        component1: inputs.component1,
        component2: inputs.component2,
      },
    });

    return {
      fastened: results.fastened,
      mate: results.mate,
    };
  },
};
