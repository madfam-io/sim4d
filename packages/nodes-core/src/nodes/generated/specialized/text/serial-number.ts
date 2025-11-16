import type { NodeDefinition } from '@brepflow/types';

interface SerialNumberParams {
  prefix: string;
  startNumber: number;
  digits: number;
  increment: number;
}

interface SerialNumberInputs {
  count: unknown;
}

interface SerialNumberOutputs {
  serials: unknown;
}

export const SpecializedTextSerialNumberNode: NodeDefinition<
  SerialNumberInputs,
  SerialNumberOutputs,
  SerialNumberParams
> = {
  id: 'Specialized::SerialNumber',
  type: 'Specialized::SerialNumber',
  category: 'Specialized',
  label: 'SerialNumber',
  description: 'Generate serial numbers',
  inputs: {
    count: {
      type: 'number',
      label: 'Count',
      required: true,
    },
  },
  outputs: {
    serials: {
      type: 'string[]',
      label: 'Serials',
    },
  },
  params: {
    prefix: {
      type: 'string',
      label: 'Prefix',
      default: 'SN',
    },
    startNumber: {
      type: 'number',
      label: 'Start Number',
      default: 1,
      min: 0,
      max: 999999,
      step: 1,
    },
    digits: {
      type: 'number',
      label: 'Digits',
      default: 6,
      min: 1,
      max: 10,
      step: 1,
    },
    increment: {
      type: 'number',
      label: 'Increment',
      default: 1,
      min: 1,
      max: 100,
      step: 1,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'serialNumber',
      params: {
        count: inputs.count,
        prefix: params.prefix,
        startNumber: params.startNumber,
        digits: params.digits,
        increment: params.increment,
      },
    });

    return {
      serials: result,
    };
  },
};
