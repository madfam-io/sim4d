import type { NodeDefinition } from '@sim4d/types';

interface MicroJointsParams {
  jointWidth: number;
  jointSpacing: number;
}

interface MicroJointsInputs {
  cutPath: unknown;
}

interface MicroJointsOutputs {
  jointedPath: unknown;
}

export const FabricationLaserMicroJointsNode: NodeDefinition<
  MicroJointsInputs,
  MicroJointsOutputs,
  MicroJointsParams
> = {
  id: 'Fabrication::MicroJoints',
  category: 'Fabrication',
  label: 'MicroJoints',
  description: 'Add micro-joints',
  inputs: {
    cutPath: {
      type: 'Wire',
      label: 'Cut Path',
      required: true,
    },
  },
  outputs: {
    jointedPath: {
      type: 'Wire[]',
      label: 'Jointed Path',
    },
  },
  params: {
    jointWidth: {
      type: 'number',
      label: 'Joint Width',
      default: 0.2,
      min: 0.1,
      max: 2,
    },
    jointSpacing: {
      type: 'number',
      label: 'Joint Spacing',
      default: 30,
      min: 10,
      max: 100,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'microJoints',
      params: {
        cutPath: inputs.cutPath,
        jointWidth: params.jointWidth,
        jointSpacing: params.jointSpacing,
      },
    });

    return {
      jointedPath: result,
    };
  },
};
