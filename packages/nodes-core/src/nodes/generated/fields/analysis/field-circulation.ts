import type { NodeDefinition } from '@sim4d/types';

type FieldCirculationParams = Record<string, never>;

interface FieldCirculationInputs {
  vectorField?: unknown;
  curve: unknown;
}

interface FieldCirculationOutputs {
  circulation: number;
}

export const FieldsAnalysisFieldCirculationNode: NodeDefinition<
  FieldCirculationInputs,
  FieldCirculationOutputs,
  FieldCirculationParams
> = {
  id: 'Fields::FieldCirculation',
  type: 'Fields::FieldCirculation',
  category: 'Fields',
  label: 'FieldCirculation',
  description: 'Calculate circulation along curve',
  inputs: {
    vectorField: {
      type: 'VectorField',
      label: 'Vector Field',
      optional: true,
    },
    curve: {
      type: 'Curve',
      label: 'Curve',
      required: true,
    },
  },
  outputs: {
    circulation: {
      type: 'Number',
      label: 'Circulation',
    },
  },
  params: {},
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'calculateCirculation',
      params: {
        vectorField: inputs.vectorField,
        curve: inputs.curve,
      },
    });

    return {
      circulation: result,
    };
  },
};
