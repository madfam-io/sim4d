import type { NodeDefinition } from '@sim4d/types';

type ListSliceParams = Record<string, never>;

interface ListSliceInputs {
  list: unknown;
  start: unknown;
  end?: unknown;
}

interface ListSliceOutputs {
  sublist: unknown;
}

export const DataListListSliceNode: NodeDefinition<
  ListSliceInputs,
  ListSliceOutputs,
  ListSliceParams
> = {
  id: 'Data::ListSlice',
  type: 'Data::ListSlice',
  category: 'Data',
  label: 'ListSlice',
  description: 'Extract sublist',
  inputs: {
    list: {
      type: 'Data[]',
      label: 'List',
      required: true,
    },
    start: {
      type: 'number',
      label: 'Start',
      required: true,
    },
    end: {
      type: 'number',
      label: 'End',
      optional: true,
    },
  },
  outputs: {
    sublist: {
      type: 'Data[]',
      label: 'Sublist',
    },
  },
  params: {},
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'listSlice',
      params: {
        list: inputs.list,
        start: inputs.start,
        end: inputs.end,
      },
    });

    return {
      sublist: result,
    };
  },
};
