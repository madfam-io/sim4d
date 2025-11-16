import type { NodeDefinition } from '@brepflow/types';

interface STEPImportParams {
  units: string;
  healGeometry: boolean;
  precision: number;
  mergeSurfaces: boolean;
}

interface STEPImportInputs {
  filePath: unknown;
}

interface STEPImportOutputs {
  shapes: unknown;
  metadata: unknown;
  units: unknown;
}

export const InteroperabilityImportSTEPImportNode: NodeDefinition<
  STEPImportInputs,
  STEPImportOutputs,
  STEPImportParams
> = {
  id: 'Interoperability::STEPImport',
  category: 'Interoperability',
  label: 'STEPImport',
  description: 'Import STEP (.stp) CAD files',
  inputs: {
    filePath: {
      type: 'string',
      label: 'File Path',
      required: true,
    },
  },
  outputs: {
    shapes: {
      type: 'Shape[]',
      label: 'Shapes',
    },
    metadata: {
      type: 'Properties',
      label: 'Metadata',
    },
    units: {
      type: 'string',
      label: 'Units',
    },
  },
  params: {
    units: {
      type: 'enum',
      label: 'Units',
      default: 'auto',
      options: ['auto', 'mm', 'cm', 'm', 'inch', 'ft'],
    },
    healGeometry: {
      type: 'boolean',
      label: 'Heal Geometry',
      default: true,
    },
    precision: {
      type: 'number',
      label: 'Precision',
      default: 0.01,
      min: 0.001,
      max: 1,
    },
    mergeSurfaces: {
      type: 'boolean',
      label: 'Merge Surfaces',
      default: false,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'stepImport',
      params: {
        filePath: inputs.filePath,
        units: params.units,
        healGeometry: params.healGeometry,
        precision: params.precision,
        mergeSurfaces: params.mergeSurfaces,
      },
    });

    return {
      shapes: results.shapes,
      metadata: results.metadata,
      units: results.units,
    };
  },
};
