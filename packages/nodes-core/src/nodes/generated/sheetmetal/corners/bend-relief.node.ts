import type { NodeDefinition } from '@sim4d/types';

interface BendReliefParams {
  reliefType: string;
  reliefDepth: number;
  reliefWidth: number;
}

interface BendReliefInputs {
  sheet: unknown;
  bends: unknown;
}

interface BendReliefOutputs {
  result: unknown;
}

export const SheetMetalCornersBendReliefNode: NodeDefinition<
  BendReliefInputs,
  BendReliefOutputs,
  BendReliefParams
> = {
  id: 'SheetMetal::BendRelief',
  category: 'SheetMetal',
  label: 'BendRelief',
  description: 'Add bend relief cuts',
  inputs: {
    sheet: {
      type: 'Shape',
      label: 'Sheet',
      required: true,
    },
    bends: {
      type: 'Edge[]',
      label: 'Bends',
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
      default: 'rectangular',
      options: ['rectangular', 'obround', 'tear'],
    },
    reliefDepth: {
      type: 'number',
      label: 'Relief Depth',
      default: 5,
      min: 0.1,
      max: 100,
    },
    reliefWidth: {
      type: 'number',
      label: 'Relief Width',
      default: 2,
      min: 0.1,
      max: 50,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'sheetBendRelief',
      params: {
        sheet: inputs.sheet,
        bends: inputs.bends,
        reliefType: params.reliefType,
        reliefDepth: params.reliefDepth,
        reliefWidth: params.reliefWidth,
      },
    });

    return {
      result: result,
    };
  },
};
