import type { NodeDefinition } from '@brepflow/types';

interface ParquetPatternParams {
  pattern: string;
  plankLength: number;
  plankWidth: number;
}

interface ParquetPatternInputs {
  surface: unknown;
}

interface ParquetPatternOutputs {
  planks: unknown;
}

export const PatternsTilingParquetPatternNode: NodeDefinition<
  ParquetPatternInputs,
  ParquetPatternOutputs,
  ParquetPatternParams
> = {
  id: 'Patterns::ParquetPattern',
  type: 'Patterns::ParquetPattern',
  category: 'Patterns',
  label: 'ParquetPattern',
  description: 'Wood parquet patterns',
  inputs: {
    surface: {
      type: 'Face',
      label: 'Surface',
      required: true,
    },
  },
  outputs: {
    planks: {
      type: 'Face[]',
      label: 'Planks',
    },
  },
  params: {
    pattern: {
      type: 'enum',
      label: 'Pattern',
      default: 'herringbone',
      options: ['herringbone', 'chevron', 'basket', 'versailles', 'chantilly'],
    },
    plankLength: {
      type: 'number',
      label: 'Plank Length',
      default: 30,
      min: 1,
    },
    plankWidth: {
      type: 'number',
      label: 'Plank Width',
      default: 5,
      min: 1,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'parquetPattern',
      params: {
        surface: inputs.surface,
        pattern: params.pattern,
        plankLength: params.plankLength,
        plankWidth: params.plankWidth,
      },
    });

    return {
      planks: result,
    };
  },
};
