import type { NodeDefinition } from '@brepflow/types';

interface LouverParams {
  louverLength: number;
  louverWidth: number;
  louverHeight: number;
  louverAngle: number;
}

interface LouverInputs {
  sheet: unknown;
  position: [number, number, number];
  direction: [number, number, number];
}

interface LouverOutputs {
  result: unknown;
}

export const SheetMetalFeaturesLouverNode: NodeDefinition<
  LouverInputs,
  LouverOutputs,
  LouverParams
> = {
  id: 'SheetMetal::Louver',
  type: 'SheetMetal::Louver',
  category: 'SheetMetal',
  label: 'Louver',
  description: 'Create louver ventilation',
  inputs: {
    sheet: {
      type: 'Shape',
      label: 'Sheet',
      required: true,
    },
    position: {
      type: 'Point',
      label: 'Position',
      required: true,
    },
    direction: {
      type: 'Vector',
      label: 'Direction',
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
    louverLength: {
      type: 'number',
      label: 'Louver Length',
      default: 30,
      min: 1,
      max: 500,
    },
    louverWidth: {
      type: 'number',
      label: 'Louver Width',
      default: 5,
      min: 0.5,
      max: 100,
    },
    louverHeight: {
      type: 'number',
      label: 'Louver Height',
      default: 5,
      min: 0.5,
      max: 50,
    },
    louverAngle: {
      type: 'number',
      label: 'Louver Angle',
      default: 45,
      min: 0,
      max: 90,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'sheetLouver',
      params: {
        sheet: inputs.sheet,
        position: inputs.position,
        direction: inputs.direction,
        louverLength: params.louverLength,
        louverWidth: params.louverWidth,
        louverHeight: params.louverHeight,
        louverAngle: params.louverAngle,
      },
    });

    return {
      result: result,
    };
  },
};
