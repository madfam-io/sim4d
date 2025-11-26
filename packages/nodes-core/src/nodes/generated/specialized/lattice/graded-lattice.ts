import type { NodeDefinition } from '@sim4d/types';

interface GradedLatticeParams {
  minDensity: number;
  maxDensity: number;
  gradientType: string;
}

interface GradedLatticeInputs {
  boundingShape: unknown;
  densityField?: unknown;
}

interface GradedLatticeOutputs {
  gradedLattice: unknown;
}

export const SpecializedLatticeGradedLatticeNode: NodeDefinition<
  GradedLatticeInputs,
  GradedLatticeOutputs,
  GradedLatticeParams
> = {
  id: 'Specialized::GradedLattice',
  type: 'Specialized::GradedLattice',
  category: 'Specialized',
  label: 'GradedLattice',
  description: 'Density-graded lattice',
  inputs: {
    boundingShape: {
      type: 'Shape',
      label: 'Bounding Shape',
      required: true,
    },
    densityField: {
      type: 'Data',
      label: 'Density Field',
      optional: true,
    },
  },
  outputs: {
    gradedLattice: {
      type: 'Shape',
      label: 'Graded Lattice',
    },
  },
  params: {
    minDensity: {
      type: 'number',
      label: 'Min Density',
      default: 0.2,
      min: 0.1,
      max: 0.9,
    },
    maxDensity: {
      type: 'number',
      label: 'Max Density',
      default: 0.8,
      min: 0.2,
      max: 0.95,
    },
    gradientType: {
      type: 'enum',
      label: 'Gradient Type',
      default: 'linear',
      options: ['linear', 'radial', 'field'],
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'gradedLattice',
      params: {
        boundingShape: inputs.boundingShape,
        densityField: inputs.densityField,
        minDensity: params.minDensity,
        maxDensity: params.maxDensity,
        gradientType: params.gradientType,
      },
    });

    return {
      gradedLattice: result,
    };
  },
};
