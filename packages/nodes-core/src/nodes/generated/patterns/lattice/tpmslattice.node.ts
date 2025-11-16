import type { NodeDefinition } from '@brepflow/types';

interface TPMSLatticeParams {
  type: string;
  period: number;
  thickness: number;
}

interface TPMSLatticeInputs {
  bounds: unknown;
}

interface TPMSLatticeOutputs {
  lattice: unknown;
}

export const PatternsLatticeTPMSLatticeNode: NodeDefinition<
  TPMSLatticeInputs,
  TPMSLatticeOutputs,
  TPMSLatticeParams
> = {
  id: 'Patterns::TPMSLattice',
  category: 'Patterns',
  label: 'TPMSLattice',
  description: 'TPMS lattice structures',
  inputs: {
    bounds: {
      type: 'Box',
      label: 'Bounds',
      required: true,
    },
  },
  outputs: {
    lattice: {
      type: 'Shape',
      label: 'Lattice',
    },
  },
  params: {
    type: {
      type: 'enum',
      label: 'Type',
      default: 'gyroid',
      options: ['gyroid', 'schwarz-p', 'schwarz-d', 'neovius'],
    },
    period: {
      type: 'number',
      label: 'Period',
      default: 10,
      min: 1,
    },
    thickness: {
      type: 'number',
      label: 'Thickness',
      default: 1,
      min: 0.1,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'tpmsLattice',
      params: {
        bounds: inputs.bounds,
        type: params.type,
        period: params.period,
        thickness: params.thickness,
      },
    });

    return {
      lattice: result,
    };
  },
};
