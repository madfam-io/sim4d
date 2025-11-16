import type { NodeDefinition } from '@brepflow/types';

interface EmbossParams {
  height: number;
  angle: number;
  roundEdges: boolean;
}

interface EmbossInputs {
  targetFace: unknown;
  pattern: unknown;
}

interface EmbossOutputs {
  embossed: unknown;
}

export const SpecializedTextEmbossNode: NodeDefinition<EmbossInputs, EmbossOutputs, EmbossParams> =
  {
    id: 'Specialized::Emboss',
    type: 'Specialized::Emboss',
    category: 'Specialized',
    label: 'Emboss',
    description: 'Emboss text or pattern',
    inputs: {
      targetFace: {
        type: 'Face',
        label: 'Target Face',
        required: true,
      },
      pattern: {
        type: 'Wire',
        label: 'Pattern',
        required: true,
      },
    },
    outputs: {
      embossed: {
        type: 'Shape',
        label: 'Embossed',
      },
    },
    params: {
      height: {
        type: 'number',
        label: 'Height',
        default: 1,
        min: 0.01,
        max: 100,
      },
      angle: {
        type: 'number',
        label: 'Angle',
        default: 45,
        min: 0,
        max: 90,
      },
      roundEdges: {
        type: 'boolean',
        label: 'Round Edges',
        default: true,
      },
    },
    async evaluate(context, inputs, params) {
      const result = await context.geometry.execute({
        type: 'emboss',
        params: {
          targetFace: inputs.targetFace,
          pattern: inputs.pattern,
          height: params.height,
          angle: params.angle,
          roundEdges: params.roundEdges,
        },
      });

      return {
        embossed: result,
      };
    },
  };
