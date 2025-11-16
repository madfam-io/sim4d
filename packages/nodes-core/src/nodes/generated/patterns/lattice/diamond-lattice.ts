import type { NodeDefinition } from '@brepflow/types';

interface DiamondLatticeParams {
  cellSize: number;
  strutDiameter: number;
}

interface DiamondLatticeInputs {
  bounds: unknown;
}

interface DiamondLatticeOutputs {
  lattice: unknown;
}

export const PatternsLatticeDiamondLatticeNode: NodeDefinition<
  DiamondLatticeInputs,
  DiamondLatticeOutputs,
  DiamondLatticeParams
> = {
  id: 'Patterns::DiamondLattice',
  type: 'Patterns::DiamondLattice',
  category: 'Patterns',
  label: 'DiamondLattice',
  description: 'Diamond lattice structure',
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
      type: 'diamondLattice',
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
