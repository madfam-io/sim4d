import type { NodeDefinition } from '@sim4d/types';

interface ContextFreeArtParams {
  rules: string;
  depth: number;
}

interface ContextFreeArtInputs {
  canvas: unknown;
}

interface ContextFreeArtOutputs {
  art: unknown;
}

export const PatternsProceduralContextFreeArtNode: NodeDefinition<
  ContextFreeArtInputs,
  ContextFreeArtOutputs,
  ContextFreeArtParams
> = {
  id: 'Patterns::ContextFreeArt',
  category: 'Patterns',
  label: 'ContextFreeArt',
  description: 'Context-free art generation',
  inputs: {
    canvas: {
      type: 'Face',
      label: 'Canvas',
      required: true,
    },
  },
  outputs: {
    art: {
      type: 'Shape[]',
      label: 'Art',
    },
  },
  params: {
    rules: {
      type: 'string',
      label: 'Rules',
      default: 'CIRCLE{},SQUARE{r 45}',
    },
    depth: {
      type: 'number',
      label: 'Depth',
      default: 10,
      min: 1,
      max: 20,
      step: 1,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'contextFreeArt',
      params: {
        canvas: inputs.canvas,
        rules: params.rules,
        depth: params.depth,
      },
    });

    return {
      art: result,
    };
  },
};
