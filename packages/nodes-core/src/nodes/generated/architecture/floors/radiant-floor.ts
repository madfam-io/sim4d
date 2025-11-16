import type { NodeDefinition } from '@brepflow/types';

interface RadiantFloorParams {
  pipeSpacing: number;
  pipeDialeter: number;
  zoneCount: number;
}

interface RadiantFloorInputs {
  floorArea: unknown;
}

interface RadiantFloorOutputs {
  radiantLayout: unknown;
  manifold: [number, number, number];
}

export const ArchitectureFloorsRadiantFloorNode: NodeDefinition<
  RadiantFloorInputs,
  RadiantFloorOutputs,
  RadiantFloorParams
> = {
  id: 'Architecture::RadiantFloor',
  type: 'Architecture::RadiantFloor',
  category: 'Architecture',
  label: 'RadiantFloor',
  description: 'In-floor radiant heating',
  inputs: {
    floorArea: {
      type: 'Face',
      label: 'Floor Area',
      required: true,
    },
  },
  outputs: {
    radiantLayout: {
      type: 'Wire[]',
      label: 'Radiant Layout',
    },
    manifold: {
      type: 'Point',
      label: 'Manifold',
    },
  },
  params: {
    pipeSpacing: {
      type: 'number',
      label: 'Pipe Spacing',
      default: 200,
      min: 150,
      max: 300,
    },
    pipeDialeter: {
      type: 'number',
      label: 'Pipe Dialeter',
      default: 16,
      min: 12,
      max: 25,
    },
    zoneCount: {
      type: 'number',
      label: 'Zone Count',
      default: 1,
      min: 1,
      max: 10,
      step: 1,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'radiantFloor',
      params: {
        floorArea: inputs.floorArea,
        pipeSpacing: params.pipeSpacing,
        pipeDialeter: params.pipeDialeter,
        zoneCount: params.zoneCount,
      },
    });

    return {
      radiantLayout: results.radiantLayout,
      manifold: results.manifold,
    };
  },
};
