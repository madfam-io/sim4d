import type { NodeDefinition } from '@sim4d/types';

interface PocketingStrategyParams {
  pattern: string;
  stepdown: number;
  finishPass: boolean;
}

interface PocketingStrategyInputs {
  pocket: unknown;
  depth: number;
}

interface PocketingStrategyOutputs {
  roughing: unknown;
  finishing: unknown;
}

export const FabricationCNCPocketingStrategyNode: NodeDefinition<
  PocketingStrategyInputs,
  PocketingStrategyOutputs,
  PocketingStrategyParams
> = {
  id: 'Fabrication::PocketingStrategy',
  category: 'Fabrication',
  label: 'PocketingStrategy',
  description: 'Pocket machining strategy',
  inputs: {
    pocket: {
      type: 'Wire',
      label: 'Pocket',
      required: true,
    },
    depth: {
      type: 'Number',
      label: 'Depth',
      required: true,
    },
  },
  outputs: {
    roughing: {
      type: 'Wire[]',
      label: 'Roughing',
    },
    finishing: {
      type: 'Wire[]',
      label: 'Finishing',
    },
  },
  params: {
    pattern: {
      type: 'enum',
      label: 'Pattern',
      default: 'spiral',
      options: ['spiral', 'zigzag', 'contour', 'trochoidal'],
    },
    stepdown: {
      type: 'number',
      label: 'Stepdown',
      default: 2,
      min: 0.1,
      max: 10,
    },
    finishPass: {
      type: 'boolean',
      label: 'Finish Pass',
      default: true,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'pocketingStrategy',
      params: {
        pocket: inputs.pocket,
        depth: inputs.depth,
        pattern: params.pattern,
        stepdown: params.stepdown,
        finishPass: params.finishPass,
      },
    });

    return {
      roughing: results.roughing,
      finishing: results.finishing,
    };
  },
};
