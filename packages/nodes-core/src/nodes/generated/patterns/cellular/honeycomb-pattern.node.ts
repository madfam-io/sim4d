import type { NodeDefinition } from '@brepflow/types';

interface HoneycombPatternParams {
  cellSize: number;
  wallThickness: number;
}

interface HoneycombPatternInputs {
  boundary: unknown;
}

interface HoneycombPatternOutputs {
  honeycomb: unknown;
}

export const PatternsCellularHoneycombPatternNode: NodeDefinition<
  HoneycombPatternInputs,
  HoneycombPatternOutputs,
  HoneycombPatternParams
> = {
  id: 'Patterns::HoneycombPattern',
  category: 'Patterns',
  label: 'HoneycombPattern',
  description: 'Honeycomb hexagonal pattern',
  inputs: {
    boundary: {
      type: 'Wire',
      label: 'Boundary',
      required: true,
    },
  },
  outputs: {
    honeycomb: {
      type: 'Wire[]',
      label: 'Honeycomb',
    },
  },
  params: {
    cellSize: {
      type: 'number',
      label: 'Cell Size',
      default: 10,
      min: 1,
    },
    wallThickness: {
      type: 'number',
      label: 'Wall Thickness',
      default: 1,
      min: 0.1,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'honeycombPattern',
      params: {
        boundary: inputs.boundary,
        cellSize: params.cellSize,
        wallThickness: params.wallThickness,
      },
    });

    return {
      honeycomb: result,
    };
  },
};
