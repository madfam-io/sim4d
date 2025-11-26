import type { NodeDefinition } from '@sim4d/types';

interface FieldLineParams {
  stepSize: number;
  maxSteps: number;
  direction: string;
}

interface FieldLineInputs {
  field: unknown;
  seeds: Array<[number, number, number]>;
}

interface FieldLineOutputs {
  lines: unknown;
}

export const FieldSampleFieldLineNode: NodeDefinition<
  FieldLineInputs,
  FieldLineOutputs,
  FieldLineParams
> = {
  id: 'Field::FieldLine',
  type: 'Field::FieldLine',
  category: 'Field',
  label: 'FieldLine',
  description: 'Create field lines',
  inputs: {
    field: {
      type: 'VectorField',
      label: 'Field',
      required: true,
    },
    seeds: {
      type: 'Point[]',
      label: 'Seeds',
      required: true,
    },
  },
  outputs: {
    lines: {
      type: 'Wire[]',
      label: 'Lines',
    },
  },
  params: {
    stepSize: {
      type: 'number',
      label: 'Step Size',
      default: 1,
      min: 0.01,
    },
    maxSteps: {
      type: 'number',
      label: 'Max Steps',
      default: 1000,
      min: 10,
      max: 10000,
      step: 10,
    },
    direction: {
      type: 'enum',
      label: 'Direction',
      default: 'forward',
      options: ['forward', 'backward', 'both'],
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'fieldLine',
      params: {
        field: inputs.field,
        seeds: inputs.seeds,
        stepSize: params.stepSize,
        maxSteps: params.maxSteps,
        direction: params.direction,
      },
    });

    return {
      lines: result,
    };
  },
};
