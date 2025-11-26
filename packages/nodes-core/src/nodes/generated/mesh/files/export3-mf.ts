import type { NodeDefinition } from '@sim4d/types';

interface Export3MFParams {
  includeColors: boolean;
  includeMaterials: boolean;
  includeMetadata: boolean;
}

interface Export3MFInputs {
  mesh: unknown;
  metadata?: unknown;
}

interface Export3MFOutputs {
  file3MF: unknown;
}

export const MeshFilesExport3MFNode: NodeDefinition<
  Export3MFInputs,
  Export3MFOutputs,
  Export3MFParams
> = {
  id: 'Mesh::Export3MF',
  type: 'Mesh::Export3MF',
  category: 'Mesh',
  label: 'Export3MF',
  description: 'Export to 3MF format',
  inputs: {
    mesh: {
      type: 'Mesh',
      label: 'Mesh',
      required: true,
    },
    metadata: {
      type: 'Data',
      label: 'Metadata',
      optional: true,
    },
  },
  outputs: {
    file3MF: {
      type: 'Data',
      label: 'File3 MF',
    },
  },
  params: {
    includeColors: {
      type: 'boolean',
      label: 'Include Colors',
      default: true,
    },
    includeMaterials: {
      type: 'boolean',
      label: 'Include Materials',
      default: true,
    },
    includeMetadata: {
      type: 'boolean',
      label: 'Include Metadata',
      default: true,
    },
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
