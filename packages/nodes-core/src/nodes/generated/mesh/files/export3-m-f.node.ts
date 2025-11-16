import { NodeDefinition } from '@brepflow/types';

interface Params {
  includeColors: boolean;
  includeMaterials: boolean;
  includeMetadata: boolean;
}
interface Inputs {
  mesh: Mesh;
  metadata?: Data;
}
interface Outputs {
  file3MF: Data;
}

export const Export3MFNode: NodeDefinition<Export3MFInputs, Export3MFOutputs, Export3MFParams> = {
  type: 'Mesh::Export3MF',
  category: 'Mesh',
  subcategory: 'Files',

  metadata: {
    label: 'Export3MF',
    description: 'Export to 3MF format',
  },

  params: {
    includeColors: {
      default: true,
    },
    includeMaterials: {
      default: true,
    },
    includeMetadata: {
      default: true,
    },
  },

  inputs: {
    mesh: 'Mesh',
    metadata: 'Data',
  },

  outputs: {
    file3MF: 'Data',
  },

  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'export3MF',
      params: {
        mesh: inputs.mesh,
        metadata: inputs.metadata,
        includeColors: params.includeColors,
        includeMaterials: params.includeMaterials,
        includeMetadata: params.includeMetadata,
      },
    });

    return {
      file3MF: result,
    };
  },
};
