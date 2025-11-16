import type { NodeDefinition } from '@brepflow/types';

interface SetPartitionsParams {
  k: number;
}

interface SetPartitionsInputs {
  set: unknown;
}

interface SetPartitionsOutputs {
  partitions: unknown;
}

export const DataSetSetPartitionsNode: NodeDefinition<
  SetPartitionsInputs,
  SetPartitionsOutputs,
  SetPartitionsParams
> = {
  id: 'Data::SetPartitions',
  type: 'Data::SetPartitions',
  category: 'Data',
  label: 'SetPartitions',
  description: 'Set partitions',
  inputs: {
    set: {
      type: 'Data[]',
      label: 'Set',
      required: true,
    },
  },
  outputs: {
    partitions: {
      type: 'Data[][][]',
      label: 'Partitions',
    },
  },
  params: {
    k: {
      type: 'number',
      label: 'K',
      default: 2,
      min: 2,
      max: 10,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'setPartitions',
      params: {
        set: inputs.set,
        k: params.k,
      },
    });

    return {
      partitions: result,
    };
  },
};
