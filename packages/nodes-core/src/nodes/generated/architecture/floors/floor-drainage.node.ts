import type { NodeDefinition } from '@sim4d/types';

interface FloorDrainageParams {
  slope: number;
  drainType: string;
}

interface FloorDrainageInputs {
  floorBoundary: unknown;
  drainLocations: Array<[number, number, number]>;
}

interface FloorDrainageOutputs {
  slopedFloor: unknown;
  drains: unknown;
}

export const ArchitectureFloorsFloorDrainageNode: NodeDefinition<
  FloorDrainageInputs,
  FloorDrainageOutputs,
  FloorDrainageParams
> = {
  id: 'Architecture::FloorDrainage',
  category: 'Architecture',
  label: 'FloorDrainage',
  description: 'Floor drainage system',
  inputs: {
    floorBoundary: {
      type: 'Wire',
      label: 'Floor Boundary',
      required: true,
    },
    drainLocations: {
      type: 'Point[]',
      label: 'Drain Locations',
      required: true,
    },
  },
  outputs: {
    slopedFloor: {
      type: 'Shape',
      label: 'Sloped Floor',
    },
    drains: {
      type: 'Shape[]',
      label: 'Drains',
    },
  },
  params: {
    slope: {
      type: 'number',
      label: 'Slope',
      default: 0.01,
      min: 0.005,
      max: 0.02,
    },
    drainType: {
      type: 'enum',
      label: 'Drain Type',
      default: 'point',
      options: ['point', 'linear', 'area'],
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'floorDrainage',
      params: {
        floorBoundary: inputs.floorBoundary,
        drainLocations: inputs.drainLocations,
        slope: params.slope,
        drainType: params.drainType,
      },
    });

    return {
      slopedFloor: results.slopedFloor,
      drains: results.drains,
    };
  },
};
