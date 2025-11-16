import type { NodeDefinition } from '@brepflow/types';

interface ListShiftParams {
  wrap: boolean;
}

interface ListShiftInputs {
  list: unknown;
  offset: unknown;
}

interface ListShiftOutputs {
  shifted: unknown;
}

export const DataListListShiftNode: NodeDefinition<
  ListShiftInputs,
  ListShiftOutputs,
  ListShiftParams
> = {
  id: 'Data::ListShift',
  type: 'Data::ListShift',
  category: 'Data',
  label: 'ListShift',
  description: 'Shift list items',
  inputs: {
    list: {
      type: 'Data[]',
      label: 'List',
      required: true,
    },
    offset: {
      type: 'number',
      label: 'Offset',
      required: true,
    },
  },
  outputs: {
    shifted: {
      type: 'Data[]',
      label: 'Shifted',
    },
  },
  params: {
    wrap: {
      type: 'boolean',
      label: 'Wrap',
      default: true,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'listShift',
      params: {
        list: inputs.list,
        offset: inputs.offset,
        wrap: params.wrap,
      },
    });

    return {
      shifted: result,
    };
  },
};
