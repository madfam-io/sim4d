import type { NodeDefinition } from '@brepflow/types';

interface PlaneToPlaneParams {
  distance: number;
  parallel: boolean;
}

interface PlaneToPlaneInputs {
  plane1: unknown;
  plane2: unknown;
}

interface PlaneToPlaneOutputs {
  mated: unknown;
  mate: unknown;
}

export const AssemblyMatesPlaneToPlaneNode: NodeDefinition<
  PlaneToPlaneInputs,
  PlaneToPlaneOutputs,
  PlaneToPlaneParams
> = {
  id: 'Assembly::PlaneToPlane',
  category: 'Assembly',
  label: 'PlaneToPlane',
  description: 'Mate two planes',
  inputs: {
    plane1: {
      type: 'Plane',
      label: 'Plane1',
      required: true,
    },
    plane2: {
      type: 'Plane',
      label: 'Plane2',
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
    distance: {
      type: 'number',
      label: 'Distance',
      default: 0,
    },
    parallel: {
      type: 'boolean',
      label: 'Parallel',
      default: true,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'matePlaneToPlane',
      params: {
        plane1: inputs.plane1,
        plane2: inputs.plane2,
        distance: params.distance,
        parallel: params.parallel,
      },
    });

    return {
      mated: results.mated,
      mate: results.mate,
    };
  },
};
