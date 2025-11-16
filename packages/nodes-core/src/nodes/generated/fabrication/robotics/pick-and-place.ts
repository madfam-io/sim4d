import type { NodeDefinition } from '@brepflow/types';

interface PickAndPlaceParams {
  gripperType: string;
  approachAngle: number;
}

interface PickAndPlaceInputs {
  pickPoints: unknown;
  placePoints: unknown;
}

interface PickAndPlaceOutputs {
  pickPlaceSequence: unknown;
}

export const FabricationRoboticsPickAndPlaceNode: NodeDefinition<
  PickAndPlaceInputs,
  PickAndPlaceOutputs,
  PickAndPlaceParams
> = {
  id: 'Fabrication::PickAndPlace',
  type: 'Fabrication::PickAndPlace',
  category: 'Fabrication',
  label: 'PickAndPlace',
  description: 'Pick and place optimization',
  inputs: {
    pickPoints: {
      type: 'Transform[]',
      label: 'Pick Points',
      required: true,
    },
    placePoints: {
      type: 'Transform[]',
      label: 'Place Points',
      required: true,
    },
  },
  outputs: {
    pickPlaceSequence: {
      type: 'Transform[]',
      label: 'Pick Place Sequence',
    },
  },
  params: {
    gripperType: {
      type: 'enum',
      label: 'Gripper Type',
      default: 'parallel',
      options: ['vacuum', 'parallel', 'angular', 'magnetic'],
    },
    approachAngle: {
      type: 'number',
      label: 'Approach Angle',
      default: 0,
      min: -90,
      max: 90,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'pickAndPlace',
      params: {
        pickPoints: inputs.pickPoints,
        placePoints: inputs.placePoints,
        gripperType: params.gripperType,
        approachAngle: params.approachAngle,
      },
    });

    return {
      pickPlaceSequence: result,
    };
  },
};
