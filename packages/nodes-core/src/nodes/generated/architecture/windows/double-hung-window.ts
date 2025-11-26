import type { NodeDefinition } from '@sim4d/types';

interface DoubleHungWindowParams {
  width: number;
  height: number;
  sashPosition: number;
}

interface DoubleHungWindowInputs {
  position: [number, number, number];
}

interface DoubleHungWindowOutputs {
  window: unknown;
  upperSash: unknown;
  lowerSash: unknown;
}

export const ArchitectureWindowsDoubleHungWindowNode: NodeDefinition<
  DoubleHungWindowInputs,
  DoubleHungWindowOutputs,
  DoubleHungWindowParams
> = {
  id: 'Architecture::DoubleHungWindow',
  type: 'Architecture::DoubleHungWindow',
  category: 'Architecture',
  label: 'DoubleHungWindow',
  description: 'Double hung window',
  inputs: {
    position: {
      type: 'Point',
      label: 'Position',
      required: true,
    },
  },
  outputs: {
    window: {
      type: 'Shape',
      label: 'Window',
    },
    upperSash: {
      type: 'Shape',
      label: 'Upper Sash',
    },
    lowerSash: {
      type: 'Shape',
      label: 'Lower Sash',
    },
  },
  params: {
    width: {
      type: 'number',
      label: 'Width',
      default: 900,
      min: 600,
      max: 1500,
    },
    height: {
      type: 'number',
      label: 'Height',
      default: 1500,
      min: 900,
      max: 2400,
    },
    sashPosition: {
      type: 'number',
      label: 'Sash Position',
      default: 0.5,
      min: 0,
      max: 1,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'doubleHungWindow',
      params: {
        position: inputs.position,
        width: params.width,
        height: params.height,
        sashPosition: params.sashPosition,
      },
    });

    return {
      window: results.window,
      upperSash: results.upperSash,
      lowerSash: results.lowerSash,
    };
  },
};
