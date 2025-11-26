import type { NodeDefinition } from '@sim4d/types';

interface ImportSTLParams {
  units: string;
  validate: boolean;
}

interface ImportSTLInputs {
  fileData: unknown;
}

interface ImportSTLOutputs {
  mesh: unknown;
  isValid: unknown;
}

export const MeshFilesImportSTLNode: NodeDefinition<
  ImportSTLInputs,
  ImportSTLOutputs,
  ImportSTLParams
> = {
  id: 'Mesh::ImportSTL',
  category: 'Mesh',
  label: 'ImportSTL',
  description: 'Import STL mesh',
  inputs: {
    fileData: {
      type: 'Data',
      label: 'File Data',
      required: true,
    },
  },
  outputs: {
    mesh: {
      type: 'Mesh',
      label: 'Mesh',
    },
    isValid: {
      type: 'boolean',
      label: 'Is Valid',
    },
  },
  params: {
    units: {
      type: 'enum',
      label: 'Units',
      default: 'mm',
      options: ['mm', 'cm', 'm', 'inch', 'foot'],
    },
    validate: {
      type: 'boolean',
      label: 'Validate',
      default: true,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'importSTL',
      params: {
        fileData: inputs.fileData,
        units: params.units,
        validate: params.validate,
      },
    });

    return {
      mesh: results.mesh,
      isValid: results.isValid,
    };
  },
};
