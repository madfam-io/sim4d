import type { NodeDefinition } from '@sim4d/types';

interface ImportJSONParams {
  format: string;
}

interface ImportJSONInputs {
  jsonData: unknown;
}

interface ImportJSONOutputs {
  shapes: unknown;
  metadata: unknown;
}

export const IOExchangeImportJSONNode: NodeDefinition<
  ImportJSONInputs,
  ImportJSONOutputs,
  ImportJSONParams
> = {
  id: 'IO::ImportJSON',
  category: 'IO',
  label: 'ImportJSON',
  description: 'Import geometry from JSON',
  inputs: {
    jsonData: {
      type: 'Data',
      label: 'Json Data',
      required: true,
    },
  },
  outputs: {
    shapes: {
      type: 'Shape[]',
      label: 'Shapes',
    },
    metadata: {
      type: 'Data',
      label: 'Metadata',
    },
  },
  params: {
    format: {
      type: 'enum',
      label: 'Format',
      default: 'sim4d',
      options: ['sim4d', 'three', 'custom'],
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'importJSON',
      params: {
        jsonData: inputs.jsonData,
        format: params.format,
      },
    });

    return {
      shapes: results.shapes,
      metadata: results.metadata,
    };
  },
};
