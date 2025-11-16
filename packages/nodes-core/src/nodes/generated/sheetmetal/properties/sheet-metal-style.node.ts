import type { NodeDefinition } from '@brepflow/types';

interface SheetMetalStyleParams {
  thickness: number;
  material: string;
  kFactor: number;
  minBendRadius: number;
  reliefType: string;
}

type SheetMetalStyleInputs = Record<string, never>;

interface SheetMetalStyleOutputs {
  style: unknown;
}

export const SheetMetalPropertiesSheetMetalStyleNode: NodeDefinition<
  SheetMetalStyleInputs,
  SheetMetalStyleOutputs,
  SheetMetalStyleParams
> = {
  id: 'SheetMetal::SheetMetalStyle',
  category: 'SheetMetal',
  label: 'SheetMetalStyle',
  description: 'Define sheet metal parameters',
  inputs: {},
  outputs: {
    style: {
      type: 'Data',
      label: 'Style',
    },
  },
  params: {
    thickness: {
      type: 'number',
      label: 'Thickness',
      default: 2,
      min: 0.1,
      max: 50,
    },
    material: {
      type: 'enum',
      label: 'Material',
      default: 'steel',
      options: ['steel', 'aluminum', 'stainless', 'copper', 'brass'],
    },
    kFactor: {
      type: 'number',
      label: 'K Factor',
      default: 0.44,
      min: 0,
      max: 1,
    },
    minBendRadius: {
      type: 'number',
      label: 'Min Bend Radius',
      default: 2,
      min: 0.1,
      max: 50,
    },
    reliefType: {
      type: 'enum',
      label: 'Relief Type',
      default: 'rectangular',
      options: ['rectangular', 'obround', 'tear'],
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'sheetStyle',
      params: {
        thickness: params.thickness,
        material: params.material,
        kFactor: params.kFactor,
        minBendRadius: params.minBendRadius,
        reliefType: params.reliefType,
      },
    });

    return {
      style: result,
    };
  },
};
