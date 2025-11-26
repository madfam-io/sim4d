import type { NodeDefinition } from '@sim4d/types';

type PointToPointParams = Record<string, never>;

interface PointToPointInputs {
  point1: [number, number, number];
  point2: [number, number, number];
}

interface PointToPointOutputs {
  mated: unknown;
  mate: unknown;
}

export const AssemblyMatesPointToPointNode: NodeDefinition<
  PointToPointInputs,
  PointToPointOutputs,
  PointToPointParams
> = {
  id: 'Assembly::PointToPoint',
  type: 'Assembly::PointToPoint',
  category: 'Assembly',
  label: 'PointToPoint',
  description: 'Mate two points together',
  inputs: {
    point1: {
      type: 'Point',
      label: 'Point1',
      required: true,
    },
    point2: {
      type: 'Point',
      label: 'Point2',
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
  params: {},
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'matePointToPoint',
      params: {
        point1: inputs.point1,
        point2: inputs.point2,
      },
    });

    return {
      mated: results.mated,
      mate: results.mate,
    };
  },
};
