import { NodeDefinition } from '@sim4d/types';
import {
  NumberParam,
  BoolParam,
  StringParam,
  EnumParam,
  Vector3Param,
} from '../../../../utils/param-utils.js';

interface Params {
  units: string;
  includeColors: boolean;
  compression: boolean;
}
interface Inputs {
  models: Shape[];
  filePath: string;
}
interface Outputs {
  success: boolean;
  modelCount: number;
}

export const ThreeMFExportNode: NodeDefinition<Inputs, Outputs, Params> = {
  type: 'Interoperability::3MFExport',
  category: 'Interoperability',
  subcategory: 'Export',

  metadata: {
    label: '3MFExport',
    description: 'Export to 3D Manufacturing Format',
  },

  params: {
    units: EnumParam({
      default: 'mm',
      options: ['mm', 'cm', 'm'],
    }),
    includeColors: BoolParam({
      default: true,
    }),
    compression: BoolParam({
      default: true,
    }),
  },

  inputs: {
    models: 'Shape[]',
    filePath: 'string',
  },

  outputs: {
    success: 'boolean',
    modelCount: 'number',
  },

  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'threeMFExport',
      params: {
        models: inputs.models,
        filePath: inputs.filePath,
        units: params.units,
        includeColors: params.includeColors,
        compression: params.compression,
      },
    });

    return {
      success: result,
      modelCount: result,
    };
  },
};
