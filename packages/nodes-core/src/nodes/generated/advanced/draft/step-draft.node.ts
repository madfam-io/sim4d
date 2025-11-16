import type { NodeDefinition } from '@brepflow/types';

interface StepDraftParams {
  steps: number;
}

interface StepDraftInputs {
  solid: unknown;
  draftData: unknown;
}

interface StepDraftOutputs {
  drafted: unknown;
}

export const AdvancedDraftStepDraftNode: NodeDefinition<
  StepDraftInputs,
  StepDraftOutputs,
  StepDraftParams
> = {
  id: 'Advanced::StepDraft',
  category: 'Advanced',
  label: 'StepDraft',
  description: 'Multi-step draft',
  inputs: {
    solid: {
      type: 'Shape',
      label: 'Solid',
      required: true,
    },
    draftData: {
      type: 'Data',
      label: 'Draft Data',
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
    steps: {
      type: 'number',
      label: 'Steps',
      default: 2,
      min: 1,
      max: 10,
      step: 1,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'stepDraft',
      params: {
        solid: inputs.solid,
        draftData: inputs.draftData,
        steps: params.steps,
      },
    });

    return {
      drafted: result,
    };
  },
};
