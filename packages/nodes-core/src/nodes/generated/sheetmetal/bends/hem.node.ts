import type { NodeDefinition } from '@sim4d/types';

interface HemParams {
  hemType: string;
  hemLength: number;
  hemGap: number;
  hemRadius: number;
}

interface HemInputs {
  sheet: unknown;
  edge: unknown;
}

interface HemOutputs {
  result: unknown;
}

export const SheetMetalBendsHemNode: NodeDefinition<HemInputs, HemOutputs, HemParams> = {
  id: 'SheetMetal::Hem',
  category: 'SheetMetal',
  label: 'Hem',
  description: 'Create hemmed edge',
  inputs: {
    sheet: {
      type: 'Shape',
      label: 'Sheet',
      required: true,
    },
    edge: {
      type: 'Edge',
      label: 'Edge',
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
    hemType: {
      type: 'enum',
      label: 'Hem Type',
      default: 'closed',
      options: ['closed', 'open', 'teardrop'],
    },
    hemLength: {
      type: 'number',
      label: 'Hem Length',
      default: 10,
      min: 0.1,
      max: 100,
    },
    hemGap: {
      type: 'number',
      label: 'Hem Gap',
      default: 0.5,
      min: 0,
      max: 10,
    },
    hemRadius: {
      type: 'number',
      label: 'Hem Radius',
      default: 0.5,
      min: 0.1,
      max: 10,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'sheetHem',
      params: {
        sheet: inputs.sheet,
        edge: inputs.edge,
        hemType: params.hemType,
        hemLength: params.hemLength,
        hemGap: params.hemGap,
        hemRadius: params.hemRadius,
      },
    });

    return {
      result: result,
    };
  },
};
