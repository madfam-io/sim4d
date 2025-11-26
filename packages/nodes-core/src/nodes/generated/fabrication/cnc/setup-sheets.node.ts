import type { NodeDefinition } from '@sim4d/types';

interface SetupSheetsParams {
  includeToolList: boolean;
  includeFixtures: boolean;
}

interface SetupSheetsInputs {
  operations: unknown;
}

interface SetupSheetsOutputs {
  setupDocument: unknown;
}

export const FabricationCNCSetupSheetsNode: NodeDefinition<
  SetupSheetsInputs,
  SetupSheetsOutputs,
  SetupSheetsParams
> = {
  id: 'Fabrication::SetupSheets',
  category: 'Fabrication',
  label: 'SetupSheets',
  description: 'Generate setup documentation',
  inputs: {
    operations: {
      type: 'Data',
      label: 'Operations',
      required: true,
    },
  },
  outputs: {
    setupDocument: {
      type: 'Data',
      label: 'Setup Document',
    },
  },
  params: {
    includeToolList: {
      type: 'boolean',
      label: 'Include Tool List',
      default: true,
    },
    includeFixtures: {
      type: 'boolean',
      label: 'Include Fixtures',
      default: true,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'setupSheets',
      params: {
        operations: inputs.operations,
        includeToolList: params.includeToolList,
        includeFixtures: params.includeFixtures,
      },
    });

    return {
      setupDocument: result,
    };
  },
};
