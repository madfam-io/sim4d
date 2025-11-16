import type { NodeDefinition } from '@brepflow/types';

interface BeadParams {
  beadWidth: number;
  beadHeight: number;
  beadProfile: string;
}

interface BeadInputs {
  sheet: unknown;
  path: unknown;
}

interface BeadOutputs {
  result: unknown;
}

export const SheetMetalFeaturesBeadNode: NodeDefinition<BeadInputs, BeadOutputs, BeadParams> = {
  id: 'SheetMetal::Bead',
  type: 'SheetMetal::Bead',
  category: 'SheetMetal',
  label: 'Bead',
  description: 'Create stiffening bead',
  inputs: {
    sheet: {
      type: 'Shape',
      label: 'Sheet',
      required: true,
    },
    path: {
      type: 'Wire',
      label: 'Path',
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
    beadWidth: {
      type: 'number',
      label: 'Bead Width',
      default: 10,
      min: 0.5,
      max: 100,
    },
    beadHeight: {
      type: 'number',
      label: 'Bead Height',
      default: 3,
      min: 0.1,
      max: 50,
    },
    beadProfile: {
      type: 'enum',
      label: 'Bead Profile',
      default: 'U',
      options: ['U', 'V', 'round'],
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'sheetBead',
      params: {
        sheet: inputs.sheet,
        path: inputs.path,
        beadWidth: params.beadWidth,
        beadHeight: params.beadHeight,
        beadProfile: params.beadProfile,
      },
    });

    return {
      result: result,
    };
  },
};
