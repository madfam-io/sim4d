import type { NodeDefinition } from '@sim4d/types';

interface TiltUpPanelParams {
  panelThickness: number;
  reinforcement: boolean;
}

interface TiltUpPanelInputs {
  panelOutline: unknown;
}

interface TiltUpPanelOutputs {
  panel: unknown;
  liftingPoints: Array<[number, number, number]>;
}

export const ArchitectureWallsTiltUpPanelNode: NodeDefinition<
  TiltUpPanelInputs,
  TiltUpPanelOutputs,
  TiltUpPanelParams
> = {
  id: 'Architecture::TiltUpPanel',
  category: 'Architecture',
  label: 'TiltUpPanel',
  description: 'Tilt-up concrete panel',
  inputs: {
    panelOutline: {
      type: 'Wire',
      label: 'Panel Outline',
      required: true,
    },
  },
  outputs: {
    panel: {
      type: 'Shape',
      label: 'Panel',
    },
    liftingPoints: {
      type: 'Point[]',
      label: 'Lifting Points',
    },
  },
  params: {
    panelThickness: {
      type: 'number',
      label: 'Panel Thickness',
      default: 200,
      min: 150,
      max: 400,
    },
    reinforcement: {
      type: 'boolean',
      label: 'Reinforcement',
      default: true,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'tiltUpPanel',
      params: {
        panelOutline: inputs.panelOutline,
        panelThickness: params.panelThickness,
        reinforcement: params.reinforcement,
      },
    });

    return {
      panel: results.panel,
      liftingPoints: results.liftingPoints,
    };
  },
};
