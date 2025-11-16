import type { NodeDefinition } from '@brepflow/types';

interface ExportJSONParams {
  format: string;
  precision: number;
  includeTopology: boolean;
}

interface ExportJSONInputs {
  shapes: unknown;
  metadata?: unknown;
}

interface ExportJSONOutputs {
  jsonData: unknown;
}

export const IOExchangeExportJSONNode: NodeDefinition<
  ExportJSONInputs,
  ExportJSONOutputs,
  ExportJSONParams
> = {
  id: 'IO::ExportJSON',
  type: 'IO::ExportJSON',
  category: 'IO',
  label: 'ExportJSON',
  description: 'Export geometry to JSON',
  inputs: {
    shapes: {
      type: 'Shape[]',
      label: 'Shapes',
      required: true,
    },
    metadata: {
      type: 'Data',
      label: 'Metadata',
      optional: true,
    },
  },
  outputs: {
    jsonData: {
      type: 'string',
      label: 'Json Data',
    },
  },
  params: {
    format: {
      type: 'enum',
      label: 'Format',
      default: 'brepflow',
      options: ['brepflow', 'three', 'custom'],
    },
    precision: {
      type: 'number',
      label: 'Precision',
      default: 6,
      min: 1,
      max: 15,
      step: 1,
    },
    includeTopology: {
      type: 'boolean',
      label: 'Include Topology',
      default: true,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'exportJSON',
      params: {
        shapes: inputs.shapes,
        metadata: inputs.metadata,
        format: params.format,
        precision: params.precision,
        includeTopology: params.includeTopology,
      },
    });

    return {
      jsonData: result,
    };
  },
};
