import type { NodeDefinition } from '@sim4d/types';

interface BendTableParams {
  tableType: string;
}

interface BendTableInputs {
  tableData: unknown;
}

interface BendTableOutputs {
  bendTable: unknown;
}

export const SheetMetalPropertiesBendTableNode: NodeDefinition<
  BendTableInputs,
  BendTableOutputs,
  BendTableParams
> = {
  id: 'SheetMetal::BendTable',
  type: 'SheetMetal::BendTable',
  category: 'SheetMetal',
  label: 'BendTable',
  description: 'Define bend deduction table',
  inputs: {
    tableData: {
      type: 'Data',
      label: 'Table Data',
      required: true,
    },
  },
  outputs: {
    bendTable: {
      type: 'Data',
      label: 'Bend Table',
    },
  },
  params: {
    tableType: {
      type: 'enum',
      label: 'Table Type',
      default: 'k-factor',
      options: ['bend-deduction', 'bend-allowance', 'k-factor'],
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'sheetBendTable',
      params: {
        tableData: inputs.tableData,
        tableType: params.tableType,
      },
    });

    return {
      bendTable: result,
    };
  },
};
