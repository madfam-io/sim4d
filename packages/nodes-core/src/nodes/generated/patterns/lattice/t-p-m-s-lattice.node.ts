import { NodeDefinition } from '@brepflow/types';

interface Params {
  type: string;
  period: number;
  thickness: number;
}
interface Inputs {
  bounds: Box;
}
interface Outputs {
  lattice: Shape;
}

export const TPMSLatticeNode: NodeDefinition<
  TPMSLatticeInputs,
  TPMSLatticeOutputs,
  TPMSLatticeParams
> = {
  type: 'Patterns::TPMSLattice',
  category: 'Patterns',
  subcategory: 'Lattice',

  metadata: {
    label: 'TPMSLattice',
    description: 'TPMS lattice structures',
  },

  params: {
    type: {
      default: 'gyroid',
      options: ['gyroid', 'schwarz-p', 'schwarz-d', 'neovius'],
    },
    period: {
      default: 10,
      min: 1,
    },
    thickness: {
      default: 1,
      min: 0.1,
    },
  },

  inputs: {
    bounds: 'Box',
  },

  outputs: {
    lattice: 'Shape',
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
