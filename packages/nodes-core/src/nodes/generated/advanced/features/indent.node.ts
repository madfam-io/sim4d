import type { NodeDefinition } from '@brepflow/types';

interface IndentParams {
  offset: number;
  flipDirection: boolean;
}

interface IndentInputs {
  targetBody: unknown;
  toolBody: unknown;
}

interface IndentOutputs {
  indented: unknown;
}

export const AdvancedFeaturesIndentNode: NodeDefinition<IndentInputs, IndentOutputs, IndentParams> =
  {
    id: 'Advanced::Indent',
    category: 'Advanced',
    label: 'Indent',
    description: 'Create indent from tool body',
    inputs: {
      targetBody: {
        type: 'Shape',
        label: 'Target Body',
        required: true,
      },
      toolBody: {
        type: 'Shape',
        label: 'Tool Body',
        required: true,
      },
    },
    outputs: {
      indented: {
        type: 'Shape',
        label: 'Indented',
      },
    },
    params: {
      offset: {
        type: 'number',
        label: 'Offset',
        default: 0.5,
        min: 0,
        max: 100,
      },
      flipDirection: {
        type: 'boolean',
        label: 'Flip Direction',
        default: false,
      },
    },
    async evaluate(context, inputs, params) {
      const result = await context.geometry.execute({
        type: 'indent',
        params: {
          targetBody: inputs.targetBody,
          toolBody: inputs.toolBody,
          offset: params.offset,
          flipDirection: params.flipDirection,
        },
      });

      return {
        indented: result,
      };
    },
  };
