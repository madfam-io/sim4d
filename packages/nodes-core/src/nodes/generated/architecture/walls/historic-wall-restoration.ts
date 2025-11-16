import type { NodeDefinition } from '@brepflow/types';

interface HistoricWallRestorationParams {
  period: string;
  preservationLevel: string;
}

interface HistoricWallRestorationInputs {
  existingWall: unknown;
}

interface HistoricWallRestorationOutputs {
  restoredWall: unknown;
}

export const ArchitectureWallsHistoricWallRestorationNode: NodeDefinition<
  HistoricWallRestorationInputs,
  HistoricWallRestorationOutputs,
  HistoricWallRestorationParams
> = {
  id: 'Architecture::HistoricWallRestoration',
  type: 'Architecture::HistoricWallRestoration',
  category: 'Architecture',
  label: 'HistoricWallRestoration',
  description: 'Historic wall analysis',
  inputs: {
    existingWall: {
      type: 'Shape',
      label: 'Existing Wall',
      required: true,
    },
  },
  outputs: {
    restoredWall: {
      type: 'Shape',
      label: 'Restored Wall',
    },
  },
  params: {
    period: {
      type: 'enum',
      label: 'Period',
      default: 'victorian',
      options: ['victorian', 'georgian', 'art-deco', 'modernist'],
    },
    preservationLevel: {
      type: 'enum',
      label: 'Preservation Level',
      default: 'preserve',
      options: ['restore', 'rehabilitate', 'preserve'],
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'historicWallRestoration',
      params: {
        existingWall: inputs.existingWall,
        period: params.period,
        preservationLevel: params.preservationLevel,
      },
    });

    return {
      restoredWall: result,
    };
  },
};
