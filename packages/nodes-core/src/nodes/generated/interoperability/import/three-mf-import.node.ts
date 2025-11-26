import { NodeDefinition } from '@sim4d/types';
import {
  NumberParam,
  BoolParam,
  StringParam,
  EnumParam,
  Vector3Param,
} from '../../../../utils/param-utils.js';

interface Params {
  loadTextures: boolean;
  loadMaterials: boolean;
  units: string;
}
interface Inputs {
  filePath: string;
}
interface Outputs {
  models: Shape[];
  materials: Properties[];
  build: Properties;
}

export const ThreeMFImportNode: NodeDefinition<Inputs, Outputs, Params> = {
  type: 'Interoperability::3MFImport',
  category: 'Interoperability',
  subcategory: 'Import',

  metadata: {
    label: '3MFImport',
    description: 'Import 3D Manufacturing Format files',
  },

  params: {
    loadTextures: BoolParam({
      default: true,
    }),
    loadMaterials: BoolParam({
      default: true,
    }),
    units: EnumParam({
      default: 'auto',
      options: ['auto', 'mm', 'cm', 'm'],
    }),
  },

  inputs: {
    filePath: 'string',
  },

  outputs: {
    models: 'Shape[]',
    materials: 'Properties[]',
    build: 'Properties',
  },

  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'threeMFImport',
      params: {
        filePath: inputs.filePath,
        loadTextures: params.loadTextures,
        loadMaterials: params.loadMaterials,
        units: params.units,
      },
    });

    return {
      models: result,
      materials: result,
      build: result,
    };
  },
};
