import type { NodeDefinition } from '@brepflow/types';

interface ExplodedViewParams {
  distance: number;
  autoSpace: boolean;
}

interface ExplodedViewInputs {
  assembly: unknown;
}

interface ExplodedViewOutputs {
  exploded: unknown;
  paths: unknown;
}

export const AssemblyPatternsExplodedViewNode: NodeDefinition<
  ExplodedViewInputs,
  ExplodedViewOutputs,
  ExplodedViewParams
> = {
  id: 'Assembly::ExplodedView',
  type: 'Assembly::ExplodedView',
  category: 'Assembly',
  label: 'ExplodedView',
  description: 'Create exploded view',
  inputs: {
    assembly: {
      type: 'Assembly',
      label: 'Assembly',
      required: true,
    },
  },
  outputs: {
    exploded: {
      type: 'Shape[]',
      label: 'Exploded',
    },
    paths: {
      type: 'Wire[]',
      label: 'Paths',
    },
  },
  params: {
    distance: {
      type: 'number',
      label: 'Distance',
      default: 100,
      min: 0,
      max: 10000,
    },
    autoSpace: {
      type: 'boolean',
      label: 'Auto Space',
      default: true,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'assemblyExplodedView',
      params: {
        assembly: inputs.assembly,
        distance: params.distance,
        autoSpace: params.autoSpace,
      },
    });

    return {
      exploded: results.exploded,
      paths: results.paths,
    };
  },
};
