import type { NodeDefinition } from '@brepflow/types';

type SampleFieldParams = Record<string, never>;

interface SampleFieldInputs {
  field: unknown;
  points: Array<[number, number, number]>;
}

interface SampleFieldOutputs {
  values: unknown;
}

export const FieldSampleSampleFieldNode: NodeDefinition<
  SampleFieldInputs,
  SampleFieldOutputs,
  SampleFieldParams
> = {
  id: 'Field::SampleField',
  category: 'Field',
  label: 'SampleField',
  description: 'Sample field at points',
  inputs: {
    field: {
      type: 'ScalarField',
      label: 'Field',
      required: true,
    },
    points: {
      type: 'Point[]',
      label: 'Points',
      required: true,
    },
  },
  outputs: {
    values: {
      type: 'number[]',
      label: 'Values',
    },
  },
  params: {},
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'fieldSample',
      params: {
        field: inputs.field,
        points: inputs.points,
      },
    });

    return {
      values: result,
    };
  },
};
