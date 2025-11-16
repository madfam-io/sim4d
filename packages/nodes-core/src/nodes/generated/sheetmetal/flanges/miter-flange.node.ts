import type { NodeDefinition } from '@brepflow/types';

interface MiterFlangeParams {
  height: number;
  angle: number;
  miterAngle: number;
  bendRadius: number;
}

interface MiterFlangeInputs {
  sheet: unknown;
  edges: unknown;
}

interface MiterFlangeOutputs {
  result: unknown;
}

export const SheetMetalFlangesMiterFlangeNode: NodeDefinition<
  MiterFlangeInputs,
  MiterFlangeOutputs,
  MiterFlangeParams
> = {
  id: 'SheetMetal::MiterFlange',
  category: 'SheetMetal',
  label: 'MiterFlange',
  description: 'Create mitered flange',
  inputs: {
    sheet: {
      type: 'Shape',
      label: 'Sheet',
      required: true,
    },
    edges: {
      type: 'Edge[]',
      label: 'Edges',
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
    height: {
      type: 'number',
      label: 'Height',
      default: 25,
      min: 0.1,
      max: 1000,
    },
    angle: {
      type: 'number',
      label: 'Angle',
      default: 90,
      min: 0,
      max: 180,
    },
    miterAngle: {
      type: 'number',
      label: 'Miter Angle',
      default: 45,
      min: 0,
      max: 90,
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
      type: 'sheetMiterFlange',
      params: {
        sheet: inputs.sheet,
        edges: inputs.edges,
        height: params.height,
        angle: params.angle,
        miterAngle: params.miterAngle,
        bendRadius: params.bendRadius,
      },
    });

    return {
      result: result,
    };
  },
};
