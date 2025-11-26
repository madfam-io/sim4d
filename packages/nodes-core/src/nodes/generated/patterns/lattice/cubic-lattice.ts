import type { NodeDefinition } from '@sim4d/types';

interface CubicLatticeParams {
  cellSize: number;
  strutDiameter: number;
}

interface CubicLatticeInputs {
  bounds: unknown;
}

interface CubicLatticeOutputs {
  lattice: unknown;
}

export const PatternsLatticeCubicLatticeNode: NodeDefinition<
  CubicLatticeInputs,
  CubicLatticeOutputs,
  CubicLatticeParams
> = {
  id: 'Patterns::CubicLattice',
  type: 'Patterns::CubicLattice',
  category: 'Patterns',
  label: 'CubicLattice',
  description: 'Cubic lattice structure',
  inputs: {
    bounds: {
      type: 'Box',
      label: 'Bounds',
      required: true,
    },
  },
  outputs: {
    lattice: {
      type: 'Wire[]',
      label: 'Lattice',
    },
  },
  params: {
    cellSize: {
      type: 'number',
      label: 'Cell Size',
      default: 10,
      min: 1,
    },
    strutDiameter: {
      type: 'number',
      label: 'Strut Diameter',
      default: 1,
      min: 0.1,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'cubicLattice',
      params: {
        bounds: inputs.bounds,
        cellSize: params.cellSize,
        strutDiameter: params.strutDiameter,
      },
    });

    return {
      lattice: result,
    };
  },
};
