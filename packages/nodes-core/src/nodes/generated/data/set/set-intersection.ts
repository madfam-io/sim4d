import type { NodeDefinition } from '@brepflow/types';

type SetIntersectionParams = Record<string, never>;

interface SetIntersectionInputs {
  setA: unknown;
  setB: unknown;
}

interface SetIntersectionOutputs {
  intersection: unknown;
}

export const DataSetSetIntersectionNode: NodeDefinition<
  SetIntersectionInputs,
  SetIntersectionOutputs,
  SetIntersectionParams
> = {
  id: 'Data::SetIntersection',
  type: 'Data::SetIntersection',
  category: 'Data',
  label: 'SetIntersection',
  description: 'Intersection of sets',
  inputs: {
    setA: {
      type: 'Data[]',
      label: 'Set A',
      required: true,
    },
    setB: {
      type: 'Data[]',
      label: 'Set B',
      required: true,
    },
  },
  outputs: {
    intersection: {
      type: 'Data[]',
      label: 'Intersection',
    },
  },
  params: {},
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'setIntersection',
      params: {
        setA: inputs.setA,
        setB: inputs.setB,
      },
    });

    return {
      intersection: result,
    };
  },
};
