import type { NodeDefinition } from '@sim4d/types';

interface GreenWallParams {
  moduleSize: number;
  irrigationType: string;
}

interface GreenWallInputs {
  wallSurface: unknown;
}

interface GreenWallOutputs {
  greenWall: unknown;
  modules: unknown;
}

export const ArchitectureWallsGreenWallNode: NodeDefinition<
  GreenWallInputs,
  GreenWallOutputs,
  GreenWallParams
> = {
  id: 'Architecture::GreenWall',
  category: 'Architecture',
  label: 'GreenWall',
  description: 'Living green wall system',
  inputs: {
    wallSurface: {
      type: 'Face',
      label: 'Wall Surface',
      required: true,
    },
  },
  outputs: {
    greenWall: {
      type: 'Shape',
      label: 'Green Wall',
    },
    modules: {
      type: 'Shape[]',
      label: 'Modules',
    },
  },
  params: {
    moduleSize: {
      type: 'number',
      label: 'Module Size',
      default: 600,
      min: 300,
      max: 1200,
    },
    irrigationType: {
      type: 'enum',
      label: 'Irrigation Type',
      default: 'drip',
      options: ['drip', 'hydroponic', 'aeroponic'],
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'greenWall',
      params: {
        wallSurface: inputs.wallSurface,
        moduleSize: params.moduleSize,
        irrigationType: params.irrigationType,
      },
    });

    return {
      greenWall: results.greenWall,
      modules: results.modules,
    };
  },
};
