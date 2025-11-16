import type { NodeDefinition } from '@brepflow/types';

interface RobotMaintenanceParams {
  operatingHours: number;
}

interface RobotMaintenanceInputs {
  robotData: unknown;
}

interface RobotMaintenanceOutputs {
  maintenanceSchedule: unknown;
}

export const FabricationRoboticsRobotMaintenanceNode: NodeDefinition<
  RobotMaintenanceInputs,
  RobotMaintenanceOutputs,
  RobotMaintenanceParams
> = {
  id: 'Fabrication::RobotMaintenance',
  category: 'Fabrication',
  label: 'RobotMaintenance',
  description: 'Maintenance scheduling',
  inputs: {
    robotData: {
      type: 'Data',
      label: 'Robot Data',
      required: true,
    },
  },
  outputs: {
    maintenanceSchedule: {
      type: 'Data',
      label: 'Maintenance Schedule',
    },
  },
  params: {
    operatingHours: {
      type: 'number',
      label: 'Operating Hours',
      default: 1000,
      min: 0,
      max: 50000,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'robotMaintenance',
      params: {
        robotData: inputs.robotData,
        operatingHours: params.operatingHours,
      },
    });

    return {
      maintenanceSchedule: result,
    };
  },
};
