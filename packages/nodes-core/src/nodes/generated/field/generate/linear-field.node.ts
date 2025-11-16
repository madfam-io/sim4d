import type { NodeDefinition } from '@brepflow/types';

interface LinearFieldParams {
  direction: [number, number, number];
  min: number;
  max: number;
}

interface LinearFieldInputs {
  bounds: unknown;
}

interface LinearFieldOutputs {
  field: unknown;
}

export const FieldGenerateLinearFieldNode: NodeDefinition<
  LinearFieldInputs,
  LinearFieldOutputs,
  LinearFieldParams
> = {
  id: 'Field::LinearField',
  category: 'Field',
  label: 'LinearField',
  description: 'Linear gradient field',
  inputs: {
    bounds: {
      type: 'Box',
      label: 'Bounds',
      required: true,
    },
  },
  outputs: {
    field: {
      type: 'ScalarField',
      label: 'Field',
    },
  },
  params: {
    direction: {
      type: 'vec3',
      label: 'Direction',
      default: [1, 0, 0],
    },
    min: {
      type: 'number',
      label: 'Min',
      default: 0,
    },
    max: {
      type: 'number',
      label: 'Max',
      default: 1,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'fieldLinear',
      params: {
        bounds: inputs.bounds,
        direction: params.direction,
        min: params.min,
        max: params.max,
      },
    });

    return {
      field: result,
    };
  },
};
