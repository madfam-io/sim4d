import type { NodeDefinition } from '@sim4d/types';

interface SketchedBendParams {
  angle: number;
  bendRadius: number;
  bendDirection: string;
  bendAllowance: number;
}

interface SketchedBendInputs {
  sheet: unknown;
  bendLine: unknown;
}

interface SketchedBendOutputs {
  result: unknown;
}

export const SheetMetalBendsSketchedBendNode: NodeDefinition<
  SketchedBendInputs,
  SketchedBendOutputs,
  SketchedBendParams
> = {
  id: 'SheetMetal::SketchedBend',
  type: 'SheetMetal::SketchedBend',
  category: 'SheetMetal',
  label: 'SketchedBend',
  description: 'Create bend from sketch line',
  inputs: {
    sheet: {
      type: 'Shape',
      label: 'Sheet',
      required: true,
    },
    bendLine: {
      type: 'Edge',
      label: 'Bend Line',
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
    angle: {
      type: 'number',
      label: 'Angle',
      default: 90,
      min: -180,
      max: 180,
    },
    bendRadius: {
      type: 'number',
      label: 'Bend Radius',
      default: 3,
      min: 0.1,
      max: 100,
    },
    bendDirection: {
      type: 'enum',
      label: 'Bend Direction',
      default: 'up',
      options: ['up', 'down'],
    },
    bendAllowance: {
      type: 'number',
      label: 'Bend Allowance',
      default: 0,
      min: -10,
      max: 10,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'sheetSketchedBend',
      params: {
        sheet: inputs.sheet,
        bendLine: inputs.bendLine,
        angle: params.angle,
        bendRadius: params.bendRadius,
        bendDirection: params.bendDirection,
        bendAllowance: params.bendAllowance,
      },
    });

    return {
      result: result,
    };
  },
};
