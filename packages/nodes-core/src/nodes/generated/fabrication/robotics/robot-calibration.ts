import type { NodeDefinition } from '@brepflow/types';

interface RobotCalibrationParams {
  method: string;
}

interface RobotCalibrationInputs {
  measurementPoints: Array<[number, number, number]>;
}

interface RobotCalibrationOutputs {
  calibrationMatrix: unknown;
  accuracy: number;
}

export const FabricationRoboticsRobotCalibrationNode: NodeDefinition<
  RobotCalibrationInputs,
  RobotCalibrationOutputs,
  RobotCalibrationParams
> = {
  id: 'Fabrication::RobotCalibration',
  type: 'Fabrication::RobotCalibration',
  category: 'Fabrication',
  label: 'RobotCalibration',
  description: 'Robot calibration routine',
  inputs: {
    measurementPoints: {
      type: 'Point[]',
      label: 'Measurement Points',
      required: true,
    },
  },
  outputs: {
    calibrationMatrix: {
      type: 'Transform',
      label: 'Calibration Matrix',
    },
    accuracy: {
      type: 'Number',
      label: 'Accuracy',
    },
  },
  params: {
    method: {
      type: 'enum',
      label: 'Method',
      default: 'dh-parameters',
      options: ['dh-parameters', 'circle-point', 'plane', 'hand-eye'],
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'robotCalibration',
      params: {
        measurementPoints: inputs.measurementPoints,
        method: params.method,
      },
    });

    return {
      calibrationMatrix: results.calibrationMatrix,
      accuracy: results.accuracy,
    };
  },
};
