import type { NodeDefinition } from '@brepflow/types';

interface FloorExpansionJointParams {
  jointWidth: number;
  sealantDepth: number;
}

interface FloorExpansionJointInputs {
  jointPath: unknown;
}

interface FloorExpansionJointOutputs {
  expansionJoint: unknown;
}

export const ArchitectureFloorsFloorExpansionJointNode: NodeDefinition<
  FloorExpansionJointInputs,
  FloorExpansionJointOutputs,
  FloorExpansionJointParams
> = {
  id: 'Architecture::FloorExpansionJoint',
  category: 'Architecture',
  label: 'FloorExpansionJoint',
  description: 'Expansion joint detail',
  inputs: {
    jointPath: {
      type: 'Wire',
      label: 'Joint Path',
      required: true,
    },
  },
  outputs: {
    expansionJoint: {
      type: 'Shape',
      label: 'Expansion Joint',
    },
  },
  params: {
    jointWidth: {
      type: 'number',
      label: 'Joint Width',
      default: 25,
      min: 10,
      max: 100,
    },
    sealantDepth: {
      type: 'number',
      label: 'Sealant Depth',
      default: 10,
      min: 5,
      max: 25,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'floorExpansionJoint',
      params: {
        jointPath: inputs.jointPath,
        jointWidth: params.jointWidth,
        sealantDepth: params.sealantDepth,
      },
    });

    return {
      expansionJoint: result,
    };
  },
};
