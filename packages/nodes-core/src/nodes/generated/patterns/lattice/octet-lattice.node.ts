import type { NodeDefinition } from '@sim4d/types';

interface OctetLatticeParams {
  cellSize: number;
  strutDiameter: number;
}

interface OctetLatticeInputs {
  bounds: unknown;
}

interface OctetLatticeOutputs {
  lattice: unknown;
}

export const PatternsLatticeOctetLatticeNode: NodeDefinition<
  OctetLatticeInputs,
  OctetLatticeOutputs,
  OctetLatticeParams
> = {
  id: 'Patterns::OctetLattice',
  category: 'Patterns',
  label: 'OctetLattice',
  description: 'Octet truss lattice',
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
      type: 'octetLattice',
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
