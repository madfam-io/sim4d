import type { NodeDefinition } from '@brepflow/types';

interface WorkCellSetupParams {
  robotCount: number;
}

interface WorkCellSetupInputs {
  cellBoundary: unknown;
  fixtures?: unknown;
}

interface WorkCellSetupOutputs {
  workCell: unknown;
}

export const FabricationRoboticsWorkCellSetupNode: NodeDefinition<
  WorkCellSetupInputs,
  WorkCellSetupOutputs,
  WorkCellSetupParams
> = {
  id: 'Fabrication::WorkCellSetup',
  category: 'Fabrication',
  label: 'WorkCellSetup',
  description: 'Setup robotic work cell',
  inputs: {
    cellBoundary: {
      type: 'Box',
      label: 'Cell Boundary',
      required: true,
    },
    fixtures: {
      type: 'Shape[]',
      label: 'Fixtures',
      optional: true,
    },
  },
  outputs: {
    workCell: {
      type: 'Data',
      label: 'Work Cell',
    },
  },
  params: {
    robotCount: {
      type: 'number',
      label: 'Robot Count',
      default: 1,
      min: 1,
      max: 4,
      step: 1,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'workCellSetup',
      params: {
        cellBoundary: inputs.cellBoundary,
        fixtures: inputs.fixtures,
        robotCount: params.robotCount,
      },
    });

    return {
      workCell: result,
    };
  },
};
