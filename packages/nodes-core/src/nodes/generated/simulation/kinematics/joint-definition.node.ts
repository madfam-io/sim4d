import type { NodeDefinition } from '@sim4d/types';

interface JointDefinitionParams {
  jointType: string;
  axis: [number, number, number];
  minLimit: number;
  maxLimit: number;
}

interface JointDefinitionInputs {
  body1: unknown;
  body2: unknown;
  jointLocation: [number, number, number];
}

interface JointDefinitionOutputs {
  joint: unknown;
  assembly: unknown;
}

export const SimulationKinematicsJointDefinitionNode: NodeDefinition<
  JointDefinitionInputs,
  JointDefinitionOutputs,
  JointDefinitionParams
> = {
  id: 'Simulation::JointDefinition',
  category: 'Simulation',
  label: 'JointDefinition',
  description: 'Define kinematic joint',
  inputs: {
    body1: {
      type: 'Shape',
      label: 'Body1',
      required: true,
    },
    body2: {
      type: 'Shape',
      label: 'Body2',
      required: true,
    },
    jointLocation: {
      type: 'Point',
      label: 'Joint Location',
      required: true,
    },
  },
  outputs: {
    joint: {
      type: 'Data',
      label: 'Joint',
    },
    assembly: {
      type: 'Shape',
      label: 'Assembly',
    },
  },
  params: {
    jointType: {
      type: 'enum',
      label: 'Joint Type',
      default: 'revolute',
      options: ['revolute', 'prismatic', 'cylindrical', 'spherical', 'planar', 'fixed'],
    },
    axis: {
      type: 'vec3',
      label: 'Axis',
      default: [0, 0, 1],
    },
    minLimit: {
      type: 'number',
      label: 'Min Limit',
      default: -180,
      min: -360,
      max: 360,
    },
    maxLimit: {
      type: 'number',
      label: 'Max Limit',
      default: 180,
      min: -360,
      max: 360,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'jointDefinition',
      params: {
        body1: inputs.body1,
        body2: inputs.body2,
        jointLocation: inputs.jointLocation,
        jointType: params.jointType,
        axis: params.axis,
        minLimit: params.minLimit,
        maxLimit: params.maxLimit,
      },
    });

    return {
      joint: results.joint,
      assembly: results.assembly,
    };
  },
};
