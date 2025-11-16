import type { NodeDefinition } from '@brepflow/types';

interface DraftParams {
  angle: number;
  pullDirection: [number, number, number];
  neutralPlane: [number, number, number];
}

interface DraftInputs {
  solid: unknown;
  facesToDraft: unknown;
}

interface DraftOutputs {
  drafted: unknown;
}

export const AdvancedDraftDraftNode: NodeDefinition<DraftInputs, DraftOutputs, DraftParams> = {
  id: 'Advanced::Draft',
  type: 'Advanced::Draft',
  category: 'Advanced',
  label: 'Draft',
  description: 'Add draft angle to faces',
  inputs: {
    solid: {
      type: 'Shape',
      label: 'Solid',
      required: true,
    },
    facesToDraft: {
      type: 'Face[]',
      label: 'Faces To Draft',
      required: true,
    },
  },
  outputs: {
    drafted: {
      type: 'Shape',
      label: 'Drafted',
    },
  },
  params: {
    angle: {
      type: 'number',
      label: 'Angle',
      default: 3,
      min: -30,
      max: 30,
    },
    pullDirection: {
      type: 'vec3',
      label: 'Pull Direction',
      default: [0, 0, 1],
    },
    neutralPlane: {
      type: 'vec3',
      label: 'Neutral Plane',
      default: [0, 0, 0],
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'draft',
      params: {
        solid: inputs.solid,
        facesToDraft: inputs.facesToDraft,
        angle: params.angle,
        pullDirection: params.pullDirection,
        neutralPlane: params.neutralPlane,
      },
    });

    return {
      drafted: result,
    };
  },
};
