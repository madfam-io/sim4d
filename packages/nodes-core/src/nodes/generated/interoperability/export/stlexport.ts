import type { NodeDefinition } from '@brepflow/types';

interface STLExportParams {
  format: string;
  deflection: number;
  angularDeflection: number;
}

interface STLExportInputs {
  shapes: unknown;
  filePath: unknown;
}

interface STLExportOutputs {
  success: unknown;
  triangleCount: unknown;
}

export const InteroperabilityExportSTLExportNode: NodeDefinition<
  STLExportInputs,
  STLExportOutputs,
  STLExportParams
> = {
  id: 'Interoperability::STLExport',
  type: 'Interoperability::STLExport',
  category: 'Interoperability',
  label: 'STLExport',
  description: 'Export mesh to STL format',
  inputs: {
    shapes: {
      type: 'Shape[]',
      label: 'Shapes',
      required: true,
    },
    filePath: {
      type: 'string',
      label: 'File Path',
      required: true,
    },
  },
  outputs: {
    success: {
      type: 'boolean',
      label: 'Success',
    },
    triangleCount: {
      type: 'number',
      label: 'Triangle Count',
    },
  },
  params: {
    format: {
      type: 'enum',
      label: 'Format',
      default: 'binary',
      options: ['ascii', 'binary'],
    },
    deflection: {
      type: 'number',
      label: 'Deflection',
      default: 0.1,
      min: 0.01,
      max: 1,
    },
    angularDeflection: {
      type: 'number',
      label: 'Angular Deflection',
      default: 0.1,
      min: 0.01,
      max: 1,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
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
      success: results.success,
      triangleCount: results.triangleCount,
    };
  },
};
