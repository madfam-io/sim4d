import type { NodeDefinition } from '@sim4d/types';

interface DeformParams {
  method: string;
  amount: number;
}

interface DeformInputs {
  shape: unknown;
  controlPoints?: Array<[number, number, number]>;
}

interface DeformOutputs {
  deformed: unknown;
}

export const TransformDeformNode: NodeDefinition<DeformInputs, DeformOutputs, DeformParams> = {
  id: 'Transform::Deform',
  type: 'Transform::Deform',
  category: 'Transform',
  label: 'Deform',
  description: 'Deform shape with control points',
  inputs: {
    shape: {
      type: 'Shape',
      label: 'Shape',
      required: true,
    },
    controlPoints: {
      type: 'Point[]',
      label: 'Control Points',
      optional: true,
    },
  },
  outputs: {
    deformed: {
      type: 'Shape',
      label: 'Deformed',
    },
  },
  params: {
    method: {
      type: 'enum',
      label: 'Method',
      default: 'bend',
      options: ['bend', 'twist', 'taper', 'stretch'],
    },
    amount: {
      type: 'number',
      label: 'Amount',
      default: 1,
      min: -10,
      max: 10,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'transformDeform',
      params: {
        shape: inputs.shape,
        controlPoints: inputs.controlPoints,
        method: params.method,
        amount: params.amount,
      },
    });

    return {
      deformed: result,
    };
  },
};
