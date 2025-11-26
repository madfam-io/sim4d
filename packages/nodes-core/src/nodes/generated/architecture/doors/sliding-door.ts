import type { NodeDefinition } from '@sim4d/types';

interface SlidingDoorParams {
  panelCount: number;
  panelWidth: number;
  openingPercent: number;
}

interface SlidingDoorInputs {
  opening: unknown;
}

interface SlidingDoorOutputs {
  panels: unknown;
  track: unknown;
}

export const ArchitectureDoorsSlidingDoorNode: NodeDefinition<
  SlidingDoorInputs,
  SlidingDoorOutputs,
  SlidingDoorParams
> = {
  id: 'Architecture::SlidingDoor',
  type: 'Architecture::SlidingDoor',
  category: 'Architecture',
  label: 'SlidingDoor',
  description: 'Sliding door system',
  inputs: {
    opening: {
      type: 'Wire',
      label: 'Opening',
      required: true,
    },
  },
  outputs: {
    panels: {
      type: 'Shape[]',
      label: 'Panels',
    },
    track: {
      type: 'Shape',
      label: 'Track',
    },
  },
  params: {
    panelCount: {
      type: 'number',
      label: 'Panel Count',
      default: 2,
      min: 1,
      max: 4,
      step: 1,
    },
    panelWidth: {
      type: 'number',
      label: 'Panel Width',
      default: 900,
      min: 600,
      max: 1500,
    },
    openingPercent: {
      type: 'number',
      label: 'Opening Percent',
      default: 0,
      min: 0,
      max: 100,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'slidingDoor',
      params: {
        opening: inputs.opening,
        panelCount: params.panelCount,
        panelWidth: params.panelWidth,
        openingPercent: params.openingPercent,
      },
    });

    return {
      panels: results.panels,
      track: results.track,
    };
  },
};
