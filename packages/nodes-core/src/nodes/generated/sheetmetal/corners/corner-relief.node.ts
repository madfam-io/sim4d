import type { NodeDefinition } from '@sim4d/types';

interface CornerReliefParams {
  reliefType: string;
  reliefSize: number;
  reliefRatio: number;
}

interface CornerReliefInputs {
  sheet: unknown;
  corners: unknown;
}

interface CornerReliefOutputs {
  result: unknown;
}

export const SheetMetalCornersCornerReliefNode: NodeDefinition<
  CornerReliefInputs,
  CornerReliefOutputs,
  CornerReliefParams
> = {
  id: 'SheetMetal::CornerRelief',
  category: 'SheetMetal',
  label: 'CornerRelief',
  description: 'Add corner relief cuts',
  inputs: {
    sheet: {
      type: 'Shape',
      label: 'Sheet',
      required: true,
    },
    corners: {
      type: 'Vertex[]',
      label: 'Corners',
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
    reliefType: {
      type: 'enum',
      label: 'Relief Type',
      default: 'circular',
      options: ['circular', 'square', 'obround', 'tear'],
    },
    reliefSize: {
      type: 'number',
      label: 'Relief Size',
      default: 5,
      min: 0.1,
      max: 100,
    },
    reliefRatio: {
      type: 'number',
      label: 'Relief Ratio',
      default: 0.5,
      min: 0.1,
      max: 1,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'sheetCornerRelief',
      params: {
        sheet: inputs.sheet,
        corners: inputs.corners,
        reliefType: params.reliefType,
        reliefSize: params.reliefSize,
        reliefRatio: params.reliefRatio,
      },
    });

    return {
      result: result,
    };
  },
};
