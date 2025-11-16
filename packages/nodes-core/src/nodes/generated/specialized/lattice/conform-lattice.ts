import type { NodeDefinition } from '@brepflow/types';

interface ConformLatticeParams {
  conformType: string;
  cellSize: number;
}

interface ConformLatticeInputs {
  targetShape: unknown;
  latticePattern: unknown;
}

interface ConformLatticeOutputs {
  conformed: unknown;
}

export const SpecializedLatticeConformLatticeNode: NodeDefinition<
  ConformLatticeInputs,
  ConformLatticeOutputs,
  ConformLatticeParams
> = {
  id: 'Specialized::ConformLattice',
  type: 'Specialized::ConformLattice',
  category: 'Specialized',
  label: 'ConformLattice',
  description: 'Conformal lattice mapping',
  inputs: {
    targetShape: {
      type: 'Shape',
      label: 'Target Shape',
      required: true,
    },
    latticePattern: {
      type: 'Shape',
      label: 'Lattice Pattern',
      required: true,
    },
  },
  outputs: {
    conformed: {
      type: 'Shape',
      label: 'Conformed',
    },
  },
  params: {
    conformType: {
      type: 'enum',
      label: 'Conform Type',
      default: 'volume',
      options: ['surface', 'volume'],
    },
    cellSize: {
      type: 'number',
      label: 'Cell Size',
      default: 10,
      min: 1,
      max: 100,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'conformLattice',
      params: {
        targetShape: inputs.targetShape,
        latticePattern: inputs.latticePattern,
        conformType: params.conformType,
        cellSize: params.cellSize,
      },
    });

    return {
      conformed: result,
    };
  },
};
