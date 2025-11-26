import type { NodeDefinition } from '@sim4d/types';

interface ConveyorTrackingParams {
  conveyorSpeed: number;
  trackingWindow: number;
}

interface ConveyorTrackingInputs {
  objectPositions: Array<[number, number, number]>;
}

interface ConveyorTrackingOutputs {
  trackingTrajectory: unknown;
}

export const FabricationRoboticsConveyorTrackingNode: NodeDefinition<
  ConveyorTrackingInputs,
  ConveyorTrackingOutputs,
  ConveyorTrackingParams
> = {
  id: 'Fabrication::ConveyorTracking',
  category: 'Fabrication',
  label: 'ConveyorTracking',
  description: 'Moving conveyor tracking',
  inputs: {
    objectPositions: {
      type: 'Point[]',
      label: 'Object Positions',
      required: true,
    },
  },
  outputs: {
    trackingTrajectory: {
      type: 'Transform[]',
      label: 'Tracking Trajectory',
    },
  },
  params: {
    conveyorSpeed: {
      type: 'number',
      label: 'Conveyor Speed',
      default: 100,
      min: 1,
      max: 1000,
    },
    trackingWindow: {
      type: 'number',
      label: 'Tracking Window',
      default: 500,
      min: 100,
      max: 2000,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'conveyorTracking',
      params: {
        objectPositions: inputs.objectPositions,
        conveyorSpeed: params.conveyorSpeed,
        trackingWindow: params.trackingWindow,
      },
    });

    return {
      trackingTrajectory: result,
    };
  },
};
