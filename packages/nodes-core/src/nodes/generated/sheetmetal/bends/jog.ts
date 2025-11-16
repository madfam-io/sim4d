import type { NodeDefinition } from '@brepflow/types';

interface JogParams {
  jogOffset: number;
  jogAngle: number;
  bendRadius: number;
}

interface JogInputs {
  sheet: unknown;
  jogLine: unknown;
}

interface JogOutputs {
  result: unknown;
}

export const SheetMetalBendsJogNode: NodeDefinition<JogInputs, JogOutputs, JogParams> = {
  id: 'SheetMetal::Jog',
  type: 'SheetMetal::Jog',
  category: 'SheetMetal',
  label: 'Jog',
  description: 'Create jog offset in sheet',
  inputs: {
    sheet: {
      type: 'Shape',
      label: 'Sheet',
      required: true,
    },
    jogLine: {
      type: 'Edge',
      label: 'Jog Line',
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
    jogOffset: {
      type: 'number',
      label: 'Jog Offset',
      default: 10,
      min: 0.1,
      max: 1000,
    },
    jogAngle: {
      type: 'number',
      label: 'Jog Angle',
      default: 90,
      min: 0,
      max: 180,
    },
    bendRadius: {
      type: 'number',
      label: 'Bend Radius',
      default: 3,
      min: 0.1,
      max: 100,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'sheetJog',
      params: {
        sheet: inputs.sheet,
        jogLine: inputs.jogLine,
        jogOffset: params.jogOffset,
        jogAngle: params.jogAngle,
        bendRadius: params.bendRadius,
      },
    });

    return {
      result: result,
    };
  },
};
