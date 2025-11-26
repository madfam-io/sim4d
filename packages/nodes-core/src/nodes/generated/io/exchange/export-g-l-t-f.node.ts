import { NodeDefinition } from '@sim4d/types';

interface Params {
  format: string;
  draco: boolean;
}
interface Inputs {
  shape: Shape;
  materials?: Data;
}
interface Outputs {
  gltfData: Data;
}

export const ExportGLTFNode: NodeDefinition<ExportGLTFInputs, ExportGLTFOutputs, ExportGLTFParams> =
  {
    type: 'IO::ExportGLTF',
    category: 'IO',
    subcategory: 'Exchange',

    metadata: {
      label: 'ExportGLTF',
      description: 'Export to GLTF/GLB',
    },

    params: {
      format: {
        default: 'glb',
        options: ['gltf', 'glb'],
      },
      draco: {
        default: false,
      },
    },

    inputs: {
      shape: 'Shape',
      materials: 'Data',
    },

    outputs: {
      gltfData: 'Data',
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
