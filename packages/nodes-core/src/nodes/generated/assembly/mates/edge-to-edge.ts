import type { NodeDefinition } from '@sim4d/types';

interface EdgeToEdgeParams {
  alignment: string;
}

interface EdgeToEdgeInputs {
  edge1: unknown;
  edge2: unknown;
}

interface EdgeToEdgeOutputs {
  mated: unknown;
  mate: unknown;
}

export const AssemblyMatesEdgeToEdgeNode: NodeDefinition<
  EdgeToEdgeInputs,
  EdgeToEdgeOutputs,
  EdgeToEdgeParams
> = {
  id: 'Assembly::EdgeToEdge',
  type: 'Assembly::EdgeToEdge',
  category: 'Assembly',
  label: 'EdgeToEdge',
  description: 'Mate two edges together',
  inputs: {
    edge1: {
      type: 'Edge',
      label: 'Edge1',
      required: true,
    },
    edge2: {
      type: 'Edge',
      label: 'Edge2',
      required: true,
    },
  },
  outputs: {
    mated: {
      type: 'Shape[]',
      label: 'Mated',
    },
    mate: {
      type: 'Mate',
      label: 'Mate',
    },
  },
  params: {
    alignment: {
      type: 'enum',
      label: 'Alignment',
      default: 'aligned',
      options: ['aligned', 'anti-aligned'],
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'mateEdgeToEdge',
      params: {
        edge1: inputs.edge1,
        edge2: inputs.edge2,
        alignment: params.alignment,
      },
    });

    return {
      mated: results.mated,
      mate: results.mate,
    };
  },
};
