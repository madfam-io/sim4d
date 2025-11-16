import type { NodeDefinition } from '@brepflow/types';

type CompoundParams = Record<string, never>;

interface CompoundInputs {
  shapes: unknown;
}

interface CompoundOutputs {
  compound: unknown;
}

export const BooleanCompoundNode: NodeDefinition<CompoundInputs, CompoundOutputs, CompoundParams> =
  {
    id: 'Boolean::Compound',
    category: 'Boolean',
    label: 'Compound',
    description: 'Create a compound from multiple shapes',
    inputs: {
      shapes: {
        type: 'Shape[]',
        label: 'Shapes',
        required: true,
      },
    },
    outputs: {
      compound: {
        type: 'Compound',
        label: 'Compound',
      },
    },
    params: {},
    async evaluate(context, inputs, params) {
      const result = await context.geometry.execute({
        type: 'makeCompound',
        params: {
          shapes: inputs.shapes,
        },
      });

      return {
        compound: result,
      };
    },
  };
