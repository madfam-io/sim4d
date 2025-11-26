import type { NodeDefinition } from '@sim4d/types';

interface TabParams {
  tabWidth: number;
  tabDepth: number;
  tabType: string;
  cornerRadius: number;
}

interface TabInputs {
  sheet: unknown;
  edge: unknown;
  position: [number, number, number];
}

interface TabOutputs {
  result: unknown;
}

export const SheetMetalFeaturesTabNode: NodeDefinition<TabInputs, TabOutputs, TabParams> = {
  id: 'SheetMetal::Tab',
  category: 'SheetMetal',
  label: 'Tab',
  description: 'Create tab feature',
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
    position: {
      type: 'Point',
      label: 'Position',
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
    tabWidth: {
      type: 'number',
      label: 'Tab Width',
      default: 20,
      min: 0.1,
      max: 500,
    },
    tabDepth: {
      type: 'number',
      label: 'Tab Depth',
      default: 10,
      min: 0.1,
      max: 100,
    },
    tabType: {
      type: 'enum',
      label: 'Tab Type',
      default: 'rectangular',
      options: ['rectangular', 'rounded', 'trapezoidal'],
    },
    cornerRadius: {
      type: 'number',
      label: 'Corner Radius',
      default: 2,
      min: 0,
      max: 50,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'sheetTab',
      params: {
        sheet: inputs.sheet,
        edge: inputs.edge,
        position: inputs.position,
        tabWidth: params.tabWidth,
        tabDepth: params.tabDepth,
        tabType: params.tabType,
        cornerRadius: params.cornerRadius,
      },
    });

    return {
      result: result,
    };
  },
};
