import type { NodeDefinition } from '@sim4d/types';

interface KeywayJointParams {
  shaftDiameter: number;
  keyWidth: number;
  keyHeight: number;
  keyLength: number;
}

interface KeywayJointInputs {
  shaftCenter: [number, number, number];
}

interface KeywayJointOutputs {
  shaft: unknown;
  key: unknown;
  keyway: unknown;
}

export const MechanicalEngineeringFastenersKeywayJointNode: NodeDefinition<
  KeywayJointInputs,
  KeywayJointOutputs,
  KeywayJointParams
> = {
  id: 'MechanicalEngineering::KeywayJoint',
  type: 'MechanicalEngineering::KeywayJoint',
  category: 'MechanicalEngineering',
  label: 'KeywayJoint',
  description: 'Create keyway and key',
  inputs: {
    shaftCenter: {
      type: 'Point',
      label: 'Shaft Center',
      required: true,
    },
  },
  outputs: {
    shaft: {
      type: 'Shape',
      label: 'Shaft',
    },
    key: {
      type: 'Shape',
      label: 'Key',
    },
    keyway: {
      type: 'Wire',
      label: 'Keyway',
    },
  },
  params: {
    shaftDiameter: {
      type: 'number',
      label: 'Shaft Diameter',
      default: 20,
      min: 6,
      max: 100,
    },
    keyWidth: {
      type: 'number',
      label: 'Key Width',
      default: 6,
      min: 2,
      max: 30,
    },
    keyHeight: {
      type: 'number',
      label: 'Key Height',
      default: 6,
      min: 2,
      max: 30,
    },
    keyLength: {
      type: 'number',
      label: 'Key Length',
      default: 25,
      min: 10,
      max: 100,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'keywayJoint',
      params: {
        shaftCenter: inputs.shaftCenter,
        shaftDiameter: params.shaftDiameter,
        keyWidth: params.keyWidth,
        keyHeight: params.keyHeight,
        keyLength: params.keyLength,
      },
    });

    return {
      shaft: results.shaft,
      key: results.key,
      keyway: results.keyway,
    };
  },
};
