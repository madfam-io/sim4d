import type { NodeDefinition } from '@sim4d/types';

interface BarcodeParams {
  type: string;
  data: string;
  size: number;
  height: number;
}

type BarcodeInputs = Record<string, never>;

interface BarcodeOutputs {
  barcode: unknown;
}

export const SpecializedTextBarcodeNode: NodeDefinition<
  BarcodeInputs,
  BarcodeOutputs,
  BarcodeParams
> = {
  id: 'Specialized::Barcode',
  type: 'Specialized::Barcode',
  category: 'Specialized',
  label: 'Barcode',
  description: 'Generate barcode geometry',
  inputs: {},
  outputs: {
    barcode: {
      type: 'Shape',
      label: 'Barcode',
    },
  },
  params: {
    type: {
      type: 'enum',
      label: 'Type',
      default: 'QR',
      options: ['QR', 'Code128', 'Code39', 'EAN13'],
    },
    data: {
      type: 'string',
      label: 'Data',
      default: '123456789',
    },
    size: {
      type: 'number',
      label: 'Size',
      default: 20,
      min: 5,
      max: 200,
    },
    height: {
      type: 'number',
      label: 'Height',
      default: 0.5,
      min: 0.01,
      max: 10,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'barcode',
      params: {
        type: params.type,
        data: params.data,
        size: params.size,
        height: params.height,
      },
    });

    return {
      barcode: result,
    };
  },
};
