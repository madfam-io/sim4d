import type { NodeDefinition } from '@sim4d/types';

interface GrasshopperExportParams {
  version: string;
  embedGeometry: boolean;
}

interface GrasshopperExportInputs {
  definition: unknown;
  filePath: unknown;
}

interface GrasshopperExportOutputs {
  success: unknown;
  componentCount: unknown;
}

export const InteroperabilityIntegrationGrasshopperExportNode: NodeDefinition<
  GrasshopperExportInputs,
  GrasshopperExportOutputs,
  GrasshopperExportParams
> = {
  id: 'Interoperability::GrasshopperExport',
  category: 'Interoperability',
  label: 'GrasshopperExport',
  description: 'Export definitions compatible with Grasshopper',
  inputs: {
    definition: {
      type: 'Properties',
      label: 'Definition',
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
    componentCount: {
      type: 'number',
      label: 'Component Count',
    },
  },
  params: {
    version: {
      type: 'enum',
      label: 'Version',
      default: 'GH1',
      options: ['GH1', 'GH2'],
    },
    embedGeometry: {
      type: 'boolean',
      label: 'Embed Geometry',
      default: true,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'grasshopperExport',
      params: {
        definition: inputs.definition,
        filePath: inputs.filePath,
        version: params.version,
        embedGeometry: params.embedGeometry,
      },
    });

    return {
      success: results.success,
      componentCount: results.componentCount,
    };
  },
};
