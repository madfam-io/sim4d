import type { NodeDefinition } from '@sim4d/types';

interface KelvinLatticeParams {
  cellSize: number;
  wallThickness: number;
}

interface KelvinLatticeInputs {
  bounds: unknown;
}

interface KelvinLatticeOutputs {
  foam: unknown;
}

export const PatternsLatticeKelvinLatticeNode: NodeDefinition<
  KelvinLatticeInputs,
  KelvinLatticeOutputs,
  KelvinLatticeParams
> = {
  id: 'Patterns::KelvinLattice',
  type: 'Patterns::KelvinLattice',
  category: 'Patterns',
  label: 'KelvinLattice',
  description: 'Kelvin foam structure',
  inputs: {
    bounds: {
      type: 'Box',
      label: 'Bounds',
      required: true,
    },
  },
  outputs: {
    foam: {
      type: 'Face[]',
      label: 'Foam',
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
      default: 0.5,
      min: 0.1,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'kelvinLattice',
      params: {
        bounds: inputs.bounds,
        cellSize: params.cellSize,
        wallThickness: params.wallThickness,
      },
    });

    return {
      foam: result,
    };
  },
};
