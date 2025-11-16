import type { NodeDefinition } from '@brepflow/types';

interface AxisToAxisParams {
  colinear: boolean;
  offset: number;
}

interface AxisToAxisInputs {
  axis1: unknown;
  axis2: unknown;
}

interface AxisToAxisOutputs {
  mated: unknown;
  mate: unknown;
}

export const AssemblyMatesAxisToAxisNode: NodeDefinition<
  AxisToAxisInputs,
  AxisToAxisOutputs,
  AxisToAxisParams
> = {
  id: 'Assembly::AxisToAxis',
  category: 'Assembly',
  label: 'AxisToAxis',
  description: 'Align two axes',
  inputs: {
    axis1: {
      type: 'Axis',
      label: 'Axis1',
      required: true,
    },
    axis2: {
      type: 'Axis',
      label: 'Axis2',
      required: true,
    },
  },
  outputs: {
    mated: {
      type: 'Shape[]',
      label: 'Mated',
    },
    mate: {
      type: 'Mate',
      label: 'Mate',
    },
  },
  params: {
    colinear: {
      type: 'boolean',
      label: 'Colinear',
      default: true,
    },
    offset: {
      type: 'number',
      label: 'Offset',
      default: 0,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'mateAxisToAxis',
      params: {
        axis1: inputs.axis1,
        axis2: inputs.axis2,
        colinear: params.colinear,
        offset: params.offset,
      },
    });

    return {
      mated: results.mated,
      mate: results.mate,
    };
  },
};
