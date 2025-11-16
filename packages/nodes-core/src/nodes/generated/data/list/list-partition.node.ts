import type { NodeDefinition } from '@brepflow/types';

type ListPartitionParams = Record<string, never>;

interface ListPartitionInputs {
  list: unknown;
  size: unknown;
}

interface ListPartitionOutputs {
  partitions: unknown;
}

export const DataListListPartitionNode: NodeDefinition<
  ListPartitionInputs,
  ListPartitionOutputs,
  ListPartitionParams
> = {
  id: 'Data::ListPartition',
  category: 'Data',
  label: 'ListPartition',
  description: 'Partition list into chunks',
  inputs: {
    list: {
      type: 'Data[]',
      label: 'List',
      required: true,
    },
    size: {
      type: 'number',
      label: 'Size',
      required: true,
    },
  },
  outputs: {
    partitions: {
      type: 'Data[][]',
      label: 'Partitions',
    },
  },
  params: {},
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'listPartition',
      params: {
        list: inputs.list,
        size: inputs.size,
      },
    });

    return {
      partitions: result,
    };
  },
};
