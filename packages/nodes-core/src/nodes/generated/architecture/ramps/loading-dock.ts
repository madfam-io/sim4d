import type { NodeDefinition } from '@brepflow/types';

interface LoadingDockParams {
  dockHeight: number;
  levellerType: string;
}

interface LoadingDockInputs {
  dockPosition: [number, number, number];
}

interface LoadingDockOutputs {
  dockRamp: unknown;
  leveller: unknown;
}

export const ArchitectureRampsLoadingDockNode: NodeDefinition<
  LoadingDockInputs,
  LoadingDockOutputs,
  LoadingDockParams
> = {
  id: 'Architecture::LoadingDock',
  type: 'Architecture::LoadingDock',
  category: 'Architecture',
  label: 'LoadingDock',
  description: 'Loading dock ramp',
  inputs: {
    dockPosition: {
      type: 'Point',
      label: 'Dock Position',
      required: true,
    },
  },
  outputs: {
    dockRamp: {
      type: 'Shape',
      label: 'Dock Ramp',
    },
    leveller: {
      type: 'Shape',
      label: 'Leveller',
    },
  },
  params: {
    dockHeight: {
      type: 'number',
      label: 'Dock Height',
      default: 1200,
      min: 900,
      max: 1500,
    },
    levellerType: {
      type: 'enum',
      label: 'Leveller Type',
      default: 'hydraulic',
      options: ['hydraulic', 'mechanical', 'air-powered'],
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'loadingDock',
      params: {
        dockPosition: inputs.dockPosition,
        dockHeight: params.dockHeight,
        levellerType: params.levellerType,
      },
    });

    return {
      dockRamp: results.dockRamp,
      leveller: results.leveller,
    };
  },
};
