import type { NodeDefinition } from '@brepflow/types';

interface FieldPotentialParams {
  referencePoint: [number, number, number];
}

interface FieldPotentialInputs {
  vectorField?: unknown;
}

interface FieldPotentialOutputs {
  potentialField: unknown;
  isConservative: boolean;
}

export const FieldsAnalysisFieldPotentialNode: NodeDefinition<
  FieldPotentialInputs,
  FieldPotentialOutputs,
  FieldPotentialParams
> = {
  id: 'Fields::FieldPotential',
  category: 'Fields',
  label: 'FieldPotential',
  description: 'Find potential function for conservative field',
  inputs: {
    vectorField: {
      type: 'VectorField',
      label: 'Vector Field',
      optional: true,
    },
  },
  outputs: {
    potentialField: {
      type: 'Field',
      label: 'Potential Field',
    },
    isConservative: {
      type: 'Boolean',
      label: 'Is Conservative',
    },
  },
  params: {
    referencePoint: {
      type: 'vec3',
      label: 'Reference Point',
      default: '[0, 0, 0]',
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'findPotential',
      params: {
        vectorField: inputs.vectorField,
        referencePoint: params.referencePoint,
      },
    });

    return {
      potentialField: results.potentialField,
      isConservative: results.isConservative,
    };
  },
};
