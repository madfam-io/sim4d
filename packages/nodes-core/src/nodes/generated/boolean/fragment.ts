import type { NodeDefinition } from '@brepflow/types';

type FragmentParams = Record<string, never>;

interface FragmentInputs {
  shapes: unknown;
}

interface FragmentOutputs {
  fragments: unknown;
}

export const BooleanFragmentNode: NodeDefinition<FragmentInputs, FragmentOutputs, FragmentParams> =
  {
    id: 'Boolean::Fragment',
    type: 'Boolean::Fragment',
    category: 'Boolean',
    label: 'Fragment',
    description: 'Fragment all shapes by each other',
    inputs: {
      shapes: {
        type: 'Shape[]',
        label: 'Shapes',
        required: true,
      },
    },
    outputs: {
      fragments: {
        type: 'Shape[]',
        label: 'Fragments',
      },
    },
    params: {},
    async evaluate(context, inputs, params) {
      const result = await context.geometry.execute({
        type: 'booleanFragment',
        params: {
          shapes: inputs.shapes,
        },
      });

      return {
        fragments: result,
      };
    },
  };
