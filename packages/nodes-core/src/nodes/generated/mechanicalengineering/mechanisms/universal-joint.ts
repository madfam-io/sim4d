import type { NodeDefinition } from '@brepflow/types';

interface UniversalJointParams {
  yokeDiameter: number;
  crossPinDiameter: number;
  length: number;
  angle: number;
}

interface UniversalJointInputs {
  center: [number, number, number];
}

interface UniversalJointOutputs {
  joint: unknown;
  yokes: unknown;
  cross: unknown;
}

export const MechanicalEngineeringMechanismsUniversalJointNode: NodeDefinition<
  UniversalJointInputs,
  UniversalJointOutputs,
  UniversalJointParams
> = {
  id: 'MechanicalEngineering::UniversalJoint',
  type: 'MechanicalEngineering::UniversalJoint',
  category: 'MechanicalEngineering',
  label: 'UniversalJoint',
  description: 'Create universal joint',
  inputs: {
    center: {
      type: 'Point',
      label: 'Center',
      required: true,
    },
  },
  outputs: {
    joint: {
      type: 'Shape',
      label: 'Joint',
    },
    yokes: {
      type: 'Shape[]',
      label: 'Yokes',
    },
    cross: {
      type: 'Shape',
      label: 'Cross',
    },
  },
  params: {
    yokeDiameter: {
      type: 'number',
      label: 'Yoke Diameter',
      default: 30,
      min: 10,
      max: 80,
    },
    crossPinDiameter: {
      type: 'number',
      label: 'Cross Pin Diameter',
      default: 8,
      min: 3,
      max: 20,
    },
    length: {
      type: 'number',
      label: 'Length',
      default: 60,
      min: 20,
      max: 150,
    },
    angle: {
      type: 'number',
      label: 'Angle',
      default: 0,
      min: 0,
      max: 45,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'universalJoint',
      params: {
        center: inputs.center,
        yokeDiameter: params.yokeDiameter,
        crossPinDiameter: params.crossPinDiameter,
        length: params.length,
        angle: params.angle,
      },
    });

    return {
      joint: results.joint,
      yokes: results.yokes,
      cross: results.cross,
    };
  },
};
