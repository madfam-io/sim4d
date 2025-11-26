import type { NodeDefinition } from '@sim4d/types';

interface DeleteFaceParams {
  healingType: string;
}

interface DeleteFaceInputs {
  shape: unknown;
  facesToDelete: unknown;
}

interface DeleteFaceOutputs {
  result: unknown;
}

export const AdvancedHealingDeleteFaceNode: NodeDefinition<
  DeleteFaceInputs,
  DeleteFaceOutputs,
  DeleteFaceParams
> = {
  id: 'Advanced::DeleteFace',
  category: 'Advanced',
  label: 'DeleteFace',
  description: 'Delete and heal faces',
  inputs: {
    shape: {
      type: 'Shape',
      label: 'Shape',
      required: true,
    },
    facesToDelete: {
      type: 'Face[]',
      label: 'Faces To Delete',
      required: true,
    },
  },
  outputs: {
    result: {
      type: 'Shape',
      label: 'Result',
    },
  },
  params: {
    healingType: {
      type: 'enum',
      label: 'Healing Type',
      default: 'extend',
      options: ['cap', 'extend', 'none'],
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'deleteFace',
      params: {
        shape: inputs.shape,
        facesToDelete: inputs.facesToDelete,
        healingType: params.healingType,
      },
    });

    return {
      result: result,
    };
  },
};
