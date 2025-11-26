import type { NodeDefinition } from '@sim4d/types';

interface TreeSupportsParams {
  branchAngle: number;
  trunkDiameter: number;
  branchDiameter: number;
}

interface TreeSupportsInputs {
  model: unknown;
}

interface TreeSupportsOutputs {
  treeSupports: unknown;
}

export const Fabrication3DPrintingTreeSupportsNode: NodeDefinition<
  TreeSupportsInputs,
  TreeSupportsOutputs,
  TreeSupportsParams
> = {
  id: 'Fabrication::TreeSupports',
  category: 'Fabrication',
  label: 'TreeSupports',
  description: 'Generate tree-like supports',
  inputs: {
    model: {
      type: 'Shape',
      label: 'Model',
      required: true,
    },
  },
  outputs: {
    treeSupports: {
      type: 'Shape',
      label: 'Tree Supports',
    },
  },
  params: {
    branchAngle: {
      type: 'number',
      label: 'Branch Angle',
      default: 40,
      min: 20,
      max: 60,
    },
    trunkDiameter: {
      type: 'number',
      label: 'Trunk Diameter',
      default: 5,
      min: 1,
      max: 20,
    },
    branchDiameter: {
      type: 'number',
      label: 'Branch Diameter',
      default: 2,
      min: 0.5,
      max: 10,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'treeSupports',
      params: {
        model: inputs.model,
        branchAngle: params.branchAngle,
        trunkDiameter: params.trunkDiameter,
        branchDiameter: params.branchDiameter,
      },
    });

    return {
      treeSupports: result,
    };
  },
};
