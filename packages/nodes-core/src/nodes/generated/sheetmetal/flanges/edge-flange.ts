import type { NodeDefinition } from '@sim4d/types';

interface EdgeFlangeParams {
  height: number;
  angle: number;
  bendRadius: number;
  bendRelief: string;
  reliefRatio: number;
}

interface EdgeFlangeInputs {
  sheet: unknown;
  edge: unknown;
}

interface EdgeFlangeOutputs {
  result: unknown;
}

export const SheetMetalFlangesEdgeFlangeNode: NodeDefinition<
  EdgeFlangeInputs,
  EdgeFlangeOutputs,
  EdgeFlangeParams
> = {
  id: 'SheetMetal::EdgeFlange',
  type: 'SheetMetal::EdgeFlange',
  category: 'SheetMetal',
  label: 'EdgeFlange',
  description: 'Create flange from edge',
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
    bendRadius: {
      type: 'number',
      label: 'Bend Radius',
      default: 3,
      min: 0.1,
      max: 100,
    },
    bendRelief: {
      type: 'enum',
      label: 'Bend Relief',
      default: 'rectangular',
      options: ['rectangular', 'obround', 'tear'],
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
      type: 'sheetEdgeFlange',
      params: {
        sheet: inputs.sheet,
        edge: inputs.edge,
        height: params.height,
        angle: params.angle,
        bendRadius: params.bendRadius,
        bendRelief: params.bendRelief,
        reliefRatio: params.reliefRatio,
      },
    });

    return {
      result: result,
    };
  },
};
