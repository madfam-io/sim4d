import type { NodeDefinition } from '@brepflow/types';

interface SlidingWindowParams {
  panels: number;
  operablePanel: string;
}

interface SlidingWindowInputs {
  opening: unknown;
}

interface SlidingWindowOutputs {
  window: unknown;
  panels: unknown;
}

export const ArchitectureWindowsSlidingWindowNode: NodeDefinition<
  SlidingWindowInputs,
  SlidingWindowOutputs,
  SlidingWindowParams
> = {
  id: 'Architecture::SlidingWindow',
  type: 'Architecture::SlidingWindow',
  category: 'Architecture',
  label: 'SlidingWindow',
  description: 'Horizontal sliding window',
  inputs: {
    opening: {
      type: 'Wire',
      label: 'Opening',
      required: true,
    },
  },
  outputs: {
    window: {
      type: 'Shape',
      label: 'Window',
    },
    panels: {
      type: 'Shape[]',
      label: 'Panels',
    },
  },
  params: {
    panels: {
      type: 'number',
      label: 'Panels',
      default: 2,
      min: 2,
      max: 4,
      step: 1,
    },
    operablePanel: {
      type: 'enum',
      label: 'Operable Panel',
      default: 'left',
      options: ['left', 'right', 'both'],
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'slidingWindow',
      params: {
        opening: inputs.opening,
        panels: params.panels,
        operablePanel: params.operablePanel,
      },
    });

    return {
      window: results.window,
      panels: results.panels,
    };
  },
};
