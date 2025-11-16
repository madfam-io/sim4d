import type { NodeDefinition } from '@brepflow/types';

interface RaisedFloorParams {
  height: number;
  panelSize: number;
  loadRating: number;
}

interface RaisedFloorInputs {
  roomBoundary: unknown;
}

interface RaisedFloorOutputs {
  raisedFloor: unknown;
  pedestals: unknown;
  panels: unknown;
}

export const ArchitectureFloorsRaisedFloorNode: NodeDefinition<
  RaisedFloorInputs,
  RaisedFloorOutputs,
  RaisedFloorParams
> = {
  id: 'Architecture::RaisedFloor',
  type: 'Architecture::RaisedFloor',
  category: 'Architecture',
  label: 'RaisedFloor',
  description: 'Raised access floor system',
  inputs: {
    roomBoundary: {
      type: 'Wire',
      label: 'Room Boundary',
      required: true,
    },
  },
  outputs: {
    raisedFloor: {
      type: 'Shape',
      label: 'Raised Floor',
    },
    pedestals: {
      type: 'Shape[]',
      label: 'Pedestals',
    },
    panels: {
      type: 'Face[]',
      label: 'Panels',
    },
  },
  params: {
    height: {
      type: 'number',
      label: 'Height',
      default: 300,
      min: 150,
      max: 600,
    },
    panelSize: {
      type: 'number',
      label: 'Panel Size',
      default: 600,
      min: 500,
      max: 1200,
    },
    loadRating: {
      type: 'number',
      label: 'Load Rating',
      default: 1250,
      min: 500,
      max: 2000,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'raisedFloor',
      params: {
        roomBoundary: inputs.roomBoundary,
        height: params.height,
        panelSize: params.panelSize,
        loadRating: params.loadRating,
      },
    });

    return {
      raisedFloor: results.raisedFloor,
      pedestals: results.pedestals,
      panels: results.panels,
    };
  },
};
