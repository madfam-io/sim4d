import type { NodeDefinition } from '@sim4d/types';

interface ContourFlangeParams {
  angle: number;
  bendRadius: number;
  flangePosition: string;
}

interface ContourFlangeInputs {
  sheet: unknown;
  contour: unknown;
  profile?: unknown;
}

interface ContourFlangeOutputs {
  result: unknown;
}

export const SheetMetalFlangesContourFlangeNode: NodeDefinition<
  ContourFlangeInputs,
  ContourFlangeOutputs,
  ContourFlangeParams
> = {
  id: 'SheetMetal::ContourFlange',
  category: 'SheetMetal',
  label: 'ContourFlange',
  description: 'Create flange from sketch contour',
  inputs: {
    sheet: {
      type: 'Shape',
      label: 'Sheet',
      required: true,
    },
    contour: {
      type: 'Wire',
      label: 'Contour',
      required: true,
    },
    profile: {
      type: 'Wire',
      label: 'Profile',
      optional: true,
    },
  },
  outputs: {
    result: {
      type: 'Shape',
      label: 'Result',
    },
  },
  params: {
    angle: {
      type: 'number',
      label: 'Angle',
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
    flangePosition: {
      type: 'enum',
      label: 'Flange Position',
      default: 'material-inside',
      options: ['material-inside', 'bend-outside', 'material-outside'],
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'sheetContourFlange',
      params: {
        sheet: inputs.sheet,
        contour: inputs.contour,
        profile: inputs.profile,
        angle: params.angle,
        bendRadius: params.bendRadius,
        flangePosition: params.flangePosition,
      },
    });

    return {
      result: result,
    };
  },
};
