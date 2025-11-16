import { NodeDefinition } from '@brepflow/types';

interface Params {
  format: string;
  deflection: number;
  angularDeflection: number;
}
interface Inputs {
  shapes: Shape[];
  filePath: string;
}
interface Outputs {
  success: boolean;
  triangleCount: number;
}

export const STLExportNode: NodeDefinition<STLExportInputs, STLExportOutputs, STLExportParams> = {
  type: 'Interoperability::STLExport',
  category: 'Interoperability',
  subcategory: 'Export',

  metadata: {
    label: 'STLExport',
    description: 'Export mesh to STL format',
  },

  params: {
    format: {
      default: 'binary',
      options: ['ascii', 'binary'],
    },
    deflection: {
      default: 0.1,
      min: 0.01,
      max: 1,
    },
    angularDeflection: {
      default: 0.1,
      min: 0.01,
      max: 1,
    },
  },

  inputs: {
    shapes: 'Shape[]',
    filePath: 'string',
  },

  outputs: {
    success: 'boolean',
    triangleCount: 'number',
  },

  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'stlExport',
      params: {
        shapes: inputs.shapes,
        filePath: inputs.filePath,
        format: params.format,
        deflection: params.deflection,
        angularDeflection: params.angularDeflection,
      },
    });

    return {
      success: result,
      triangleCount: result,
    };
  },
};
