import type { NodeDefinition } from '@brepflow/types';

interface StairHandrailParams {
  height: number;
  diameter: number;
  mountType: string;
}

interface StairHandrailInputs {
  stairEdge: unknown;
}

interface StairHandrailOutputs {
  handrail: unknown;
  posts: unknown;
}

export const ArchitectureStairsStairHandrailNode: NodeDefinition<
  StairHandrailInputs,
  StairHandrailOutputs,
  StairHandrailParams
> = {
  id: 'Architecture::StairHandrail',
  category: 'Architecture',
  label: 'StairHandrail',
  description: 'Stair handrail system',
  inputs: {
    stairEdge: {
      type: 'Wire',
      label: 'Stair Edge',
      required: true,
    },
  },
  outputs: {
    handrail: {
      type: 'Shape',
      label: 'Handrail',
    },
    posts: {
      type: 'Shape[]',
      label: 'Posts',
    },
  },
  params: {
    height: {
      type: 'number',
      label: 'Height',
      default: 900,
      min: 850,
      max: 1000,
    },
    diameter: {
      type: 'number',
      label: 'Diameter',
      default: 50,
      min: 40,
      max: 60,
    },
    mountType: {
      type: 'enum',
      label: 'Mount Type',
      default: 'post',
      options: ['wall', 'post', 'glass'],
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'stairHandrail',
      params: {
        stairEdge: inputs.stairEdge,
        height: params.height,
        diameter: params.diameter,
        mountType: params.mountType,
      },
    });

    return {
      handrail: results.handrail,
      posts: results.posts,
    };
  },
};
