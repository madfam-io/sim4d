import type { NodeDefinition } from '@brepflow/types';

interface VectorFieldParams {
  expressionX: string;
  expressionY: string;
  expressionZ: string;
}

interface VectorFieldInputs {
  domain: unknown;
}

interface VectorFieldOutputs {
  field: unknown;
}

export const FieldGenerateVectorFieldNode: NodeDefinition<
  VectorFieldInputs,
  VectorFieldOutputs,
  VectorFieldParams
> = {
  id: 'Field::VectorField',
  category: 'Field',
  label: 'VectorField',
  description: 'Vector field from expression',
  inputs: {
    domain: {
      type: 'Box',
      label: 'Domain',
      required: true,
    },
  },
  outputs: {
    field: {
      type: 'VectorField',
      label: 'Field',
    },
  },
  params: {
    expressionX: {
      type: 'string',
      label: 'Expression X',
      default: 'y',
    },
    expressionY: {
      type: 'string',
      label: 'Expression Y',
      default: '-x',
    },
    expressionZ: {
      type: 'string',
      label: 'Expression Z',
      default: '0',
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'fieldVector',
      params: {
        domain: inputs.domain,
        expressionX: params.expressionX,
        expressionY: params.expressionY,
        expressionZ: params.expressionZ,
      },
    });

    return {
      field: result,
    };
  },
};
