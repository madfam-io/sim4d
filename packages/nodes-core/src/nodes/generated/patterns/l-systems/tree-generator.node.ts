import type { NodeDefinition } from '@sim4d/types';

interface TreeGeneratorParams {
  treeType: string;
  height: number;
  branches: number;
  seed: number;
}

interface TreeGeneratorInputs {
  base: [number, number, number];
}

interface TreeGeneratorOutputs {
  trunk: unknown;
  leaves: Array<[number, number, number]>;
}

export const PatternsLSystemsTreeGeneratorNode: NodeDefinition<
  TreeGeneratorInputs,
  TreeGeneratorOutputs,
  TreeGeneratorParams
> = {
  id: 'Patterns::TreeGenerator',
  category: 'Patterns',
  label: 'TreeGenerator',
  description: 'Parametric tree generator',
  inputs: {
    base: {
      type: 'Point',
      label: 'Base',
      required: true,
    },
  },
  outputs: {
    trunk: {
      type: 'Wire[]',
      label: 'Trunk',
    },
    leaves: {
      type: 'Point[]',
      label: 'Leaves',
    },
  },
  params: {
    treeType: {
      type: 'enum',
      label: 'Tree Type',
      default: 'oak',
      options: ['oak', 'pine', 'willow', 'palm', 'fractal'],
    },
    height: {
      type: 'number',
      label: 'Height',
      default: 100,
      min: 10,
    },
    branches: {
      type: 'number',
      label: 'Branches',
      default: 5,
      min: 2,
      max: 10,
      step: 1,
    },
    seed: {
      type: 'number',
      label: 'Seed',
      default: 0,
      min: 0,
      max: 999999,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'treeGenerator',
      params: {
        base: inputs.base,
        treeType: params.treeType,
        height: params.height,
        branches: params.branches,
        seed: params.seed,
      },
    });

    return {
      trunk: results.trunk,
      leaves: results.leaves,
    };
  },
};
