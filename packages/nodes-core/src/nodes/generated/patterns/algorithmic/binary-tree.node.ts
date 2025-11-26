import type { NodeDefinition } from '@sim4d/types';

interface BinaryTreeParams {
  depth: number;
  branchAngle: number;
  lengthRatio: number;
}

interface BinaryTreeInputs {
  root: [number, number, number];
}

interface BinaryTreeOutputs {
  tree: unknown;
}

export const PatternsAlgorithmicBinaryTreeNode: NodeDefinition<
  BinaryTreeInputs,
  BinaryTreeOutputs,
  BinaryTreeParams
> = {
  id: 'Patterns::BinaryTree',
  category: 'Patterns',
  label: 'BinaryTree',
  description: 'Binary tree structure',
  inputs: {
    root: {
      type: 'Point',
      label: 'Root',
      required: true,
    },
  },
  outputs: {
    tree: {
      type: 'Wire[]',
      label: 'Tree',
    },
  },
  params: {
    depth: {
      type: 'number',
      label: 'Depth',
      default: 5,
      min: 1,
      max: 10,
      step: 1,
    },
    branchAngle: {
      type: 'number',
      label: 'Branch Angle',
      default: 30,
      min: 0,
      max: 90,
    },
    lengthRatio: {
      type: 'number',
      label: 'Length Ratio',
      default: 0.7,
      min: 0.3,
      max: 0.9,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'binaryTree',
      params: {
        root: inputs.root,
        depth: params.depth,
        branchAngle: params.branchAngle,
        lengthRatio: params.lengthRatio,
      },
    });

    return {
      tree: result,
    };
  },
};
