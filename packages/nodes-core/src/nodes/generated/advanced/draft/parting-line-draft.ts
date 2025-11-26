import type { NodeDefinition } from '@sim4d/types';

interface PartingLineDraftParams {
  upperAngle: number;
  lowerAngle: number;
  pullDirection: [number, number, number];
}

interface PartingLineDraftInputs {
  solid: unknown;
  partingEdges: unknown;
}

interface PartingLineDraftOutputs {
  drafted: unknown;
}

export const AdvancedDraftPartingLineDraftNode: NodeDefinition<
  PartingLineDraftInputs,
  PartingLineDraftOutputs,
  PartingLineDraftParams
> = {
  id: 'Advanced::PartingLineDraft',
  type: 'Advanced::PartingLineDraft',
  category: 'Advanced',
  label: 'PartingLineDraft',
  description: 'Draft from parting line',
  inputs: {
    solid: {
      type: 'Shape',
      label: 'Solid',
      required: true,
    },
    partingEdges: {
      type: 'Edge[]',
      label: 'Parting Edges',
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
    upperAngle: {
      type: 'number',
      label: 'Upper Angle',
      default: 3,
      min: 0,
      max: 30,
    },
    lowerAngle: {
      type: 'number',
      label: 'Lower Angle',
      default: 3,
      min: 0,
      max: 30,
    },
    pullDirection: {
      type: 'vec3',
      label: 'Pull Direction',
      default: [0, 0, 1],
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'partingLineDraft',
      params: {
        solid: inputs.solid,
        partingEdges: inputs.partingEdges,
        upperAngle: params.upperAngle,
        lowerAngle: params.lowerAngle,
        pullDirection: params.pullDirection,
      },
    });

    return {
      drafted: result,
    };
  },
};
