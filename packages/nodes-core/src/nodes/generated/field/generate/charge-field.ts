import type { NodeDefinition } from '@brepflow/types';

interface ChargeFieldParams {
  charge: number;
  falloff: string;
}

interface ChargeFieldInputs {
  points: Array<[number, number, number]>;
}

interface ChargeFieldOutputs {
  field: unknown;
}

export const FieldGenerateChargeFieldNode: NodeDefinition<
  ChargeFieldInputs,
  ChargeFieldOutputs,
  ChargeFieldParams
> = {
  id: 'Field::ChargeField',
  type: 'Field::ChargeField',
  category: 'Field',
  label: 'ChargeField',
  description: 'Electric charge field',
  inputs: {
    points: {
      type: 'Point[]',
      label: 'Points',
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
    charge: {
      type: 'number',
      label: 'Charge',
      default: 1,
      min: -10,
      max: 10,
    },
    falloff: {
      type: 'enum',
      label: 'Falloff',
      default: 'inverse-square',
      options: ['inverse', 'inverse-square', 'exponential'],
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'fieldCharge',
      params: {
        points: inputs.points,
        charge: params.charge,
        falloff: params.falloff,
      },
    });

    return {
      field: result,
    };
  },
};
