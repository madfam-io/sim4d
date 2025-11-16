import type { NodeDefinition } from '@brepflow/types';

interface LanceParams {
  lanceLength: number;
  lanceWidth: number;
  lanceHeight: number;
  lanceAngle: number;
}

interface LanceInputs {
  sheet: unknown;
  sketch: unknown;
}

interface LanceOutputs {
  result: unknown;
}

export const SheetMetalFeaturesLanceNode: NodeDefinition<LanceInputs, LanceOutputs, LanceParams> = {
  id: 'SheetMetal::Lance',
  category: 'SheetMetal',
  label: 'Lance',
  description: 'Create lanced form',
  inputs: {
    sheet: {
      type: 'Shape',
      label: 'Sheet',
      required: true,
    },
    sketch: {
      type: 'Wire',
      label: 'Sketch',
      required: true,
    },
  },
  outputs: {
    result: {
      type: 'Shape',
      label: 'Result',
    },
  },
  params: {
    lanceLength: {
      type: 'number',
      label: 'Lance Length',
      default: 20,
      min: 1,
      max: 200,
    },
    lanceWidth: {
      type: 'number',
      label: 'Lance Width',
      default: 5,
      min: 0.5,
      max: 50,
    },
    lanceHeight: {
      type: 'number',
      label: 'Lance Height',
      default: 3,
      min: 0.1,
      max: 50,
    },
    lanceAngle: {
      type: 'number',
      label: 'Lance Angle',
      default: 30,
      min: 0,
      max: 90,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'sheetLance',
      params: {
        sheet: inputs.sheet,
        sketch: inputs.sketch,
        lanceLength: params.lanceLength,
        lanceWidth: params.lanceWidth,
        lanceHeight: params.lanceHeight,
        lanceAngle: params.lanceAngle,
      },
    });

    return {
      result: result,
    };
  },
};
