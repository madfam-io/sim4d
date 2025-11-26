import type { NodeDefinition } from '@sim4d/types';

interface FoundationWallParams {
  depth: number;
  footingWidth: number;
}

interface FoundationWallInputs {
  foundationLine: unknown;
}

interface FoundationWallOutputs {
  foundationWall: unknown;
  footing: unknown;
}

export const ArchitectureWallsFoundationWallNode: NodeDefinition<
  FoundationWallInputs,
  FoundationWallOutputs,
  FoundationWallParams
> = {
  id: 'Architecture::FoundationWall',
  category: 'Architecture',
  label: 'FoundationWall',
  description: 'Foundation wall system',
  inputs: {
    foundationLine: {
      type: 'Wire',
      label: 'Foundation Line',
      required: true,
    },
  },
  outputs: {
    foundationWall: {
      type: 'Shape',
      label: 'Foundation Wall',
    },
    footing: {
      type: 'Shape',
      label: 'Footing',
    },
  },
  params: {
    depth: {
      type: 'number',
      label: 'Depth',
      default: 1500,
      min: 1000,
      max: 3000,
    },
    footingWidth: {
      type: 'number',
      label: 'Footing Width',
      default: 600,
      min: 400,
      max: 1200,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'foundationWall',
      params: {
        foundationLine: inputs.foundationLine,
        depth: params.depth,
        footingWidth: params.footingWidth,
      },
    });

    return {
      foundationWall: results.foundationWall,
      footing: results.footing,
    };
  },
};
