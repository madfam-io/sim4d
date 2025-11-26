import { NodeDefinition } from '@sim4d/types';

interface Params {
  units: string;
  validate: boolean;
}
interface Inputs {
  fileData: Data;
}
interface Outputs {
  mesh: Mesh;
  isValid: boolean;
}

export const ImportSTLNode: NodeDefinition<ImportSTLInputs, ImportSTLOutputs, ImportSTLParams> = {
  type: 'Mesh::ImportSTL',
  category: 'Mesh',
  subcategory: 'Files',

  metadata: {
    label: 'ImportSTL',
    description: 'Import STL mesh',
  },

  params: {
    units: {
      default: 'mm',
      options: ['mm', 'cm', 'm', 'inch', 'foot'],
    },
    validate: {
      default: true,
    },
  },

  inputs: {
    fileData: 'Data',
  },

  outputs: {
    mesh: 'Mesh',
    isValid: 'boolean',
  },

  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'importSTL',
      params: {
        fileData: inputs.fileData,
        units: params.units,
        validate: params.validate,
      },
    });

    return {
      mesh: result,
      isValid: result,
    };
  },
};
