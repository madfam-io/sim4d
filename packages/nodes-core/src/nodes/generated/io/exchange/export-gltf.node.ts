import type { NodeDefinition } from '@sim4d/types';

interface ExportGLTFParams {
  format: string;
  draco: boolean;
}

interface ExportGLTFInputs {
  shape: unknown;
  materials?: unknown;
}

interface ExportGLTFOutputs {
  gltfData: unknown;
}

export const IOExchangeExportGLTFNode: NodeDefinition<
  ExportGLTFInputs,
  ExportGLTFOutputs,
  ExportGLTFParams
> = {
  id: 'IO::ExportGLTF',
  category: 'IO',
  label: 'ExportGLTF',
  description: 'Export to GLTF/GLB',
  inputs: {
    shape: {
      type: 'Shape',
      label: 'Shape',
      required: true,
    },
    materials: {
      type: 'Data',
      label: 'Materials',
      optional: true,
    },
  },
  outputs: {
    gltfData: {
      type: 'Data',
      label: 'Gltf Data',
    },
  },
  params: {
    format: {
      type: 'enum',
      label: 'Format',
      default: 'glb',
      options: ['gltf', 'glb'],
    },
    draco: {
      type: 'boolean',
      label: 'Draco',
      default: false,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'exportGLTF',
      params: {
        shape: inputs.shape,
        materials: inputs.materials,
        format: params.format,
        draco: params.draco,
      },
    });

    return {
      gltfData: result,
    };
  },
};
