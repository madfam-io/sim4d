import type { NodeDefinition } from '@brepflow/types';

interface FieldMorphingParams {
  factor: number;
  interpolation: string;
}

interface FieldMorphingInputs {
  field1?: unknown;
  field2?: unknown;
}

interface FieldMorphingOutputs {
  morphedField: unknown;
}

export const FieldsAdvancedFieldMorphingNode: NodeDefinition<
  FieldMorphingInputs,
  FieldMorphingOutputs,
  FieldMorphingParams
> = {
  id: 'Fields::FieldMorphing',
  type: 'Fields::FieldMorphing',
  category: 'Fields',
  label: 'FieldMorphing',
  description: 'Morph between two fields',
  inputs: {
    field1: {
      type: 'Field',
      label: 'Field1',
      optional: true,
    },
    field2: {
      type: 'Field',
      label: 'Field2',
      optional: true,
    },
  },
  outputs: {
    morphedField: {
      type: 'Field',
      label: 'Morphed Field',
    },
  },
  params: {
    factor: {
      type: 'number',
      label: 'Factor',
      default: 0.5,
      min: 0,
      max: 1,
    },
    interpolation: {
      type: 'enum',
      label: 'Interpolation',
      default: '"linear"',
      options: ['linear', 'smooth', 'exponential'],
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'morphFields',
      params: {
        field1: inputs.field1,
        field2: inputs.field2,
        factor: params.factor,
        interpolation: params.interpolation,
      },
    });

    return {
      morphedField: result,
    };
  },
};
