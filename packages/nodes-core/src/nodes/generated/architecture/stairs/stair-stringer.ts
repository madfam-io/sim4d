import type { NodeDefinition } from '@sim4d/types';

interface StairStringerParams {
  type: string;
  material: string;
  depth: number;
}

interface StairStringerInputs {
  stairProfile: unknown;
}

interface StairStringerOutputs {
  stringers: unknown;
}

export const ArchitectureStairsStairStringerNode: NodeDefinition<
  StairStringerInputs,
  StairStringerOutputs,
  StairStringerParams
> = {
  id: 'Architecture::StairStringer',
  type: 'Architecture::StairStringer',
  category: 'Architecture',
  label: 'StairStringer',
  description: 'Stair stringer structure',
  inputs: {
    stairProfile: {
      type: 'Wire',
      label: 'Stair Profile',
      required: true,
    },
  },
  outputs: {
    stringers: {
      type: 'Shape[]',
      label: 'Stringers',
    },
  },
  params: {
    type: {
      type: 'enum',
      label: 'Type',
      default: 'closed',
      options: ['closed', 'open', 'mono'],
    },
    material: {
      type: 'enum',
      label: 'Material',
      default: 'steel',
      options: ['steel', 'wood', 'concrete'],
    },
    depth: {
      type: 'number',
      label: 'Depth',
      default: 300,
      min: 200,
      max: 500,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'stairStringer',
      params: {
        stairProfile: inputs.stairProfile,
        type: params.type,
        material: params.material,
        depth: params.depth,
      },
    });

    return {
      stringers: result,
    };
  },
};
