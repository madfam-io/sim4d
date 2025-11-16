import type { NodeDefinition } from '@brepflow/types';

interface CheckGeometryParams {
  checkLevel: string;
}

interface CheckGeometryInputs {
  shape: unknown;
}

interface CheckGeometryOutputs {
  isValid: unknown;
  errors: unknown;
}

export const AdvancedHealingCheckGeometryNode: NodeDefinition<
  CheckGeometryInputs,
  CheckGeometryOutputs,
  CheckGeometryParams
> = {
  id: 'Advanced::CheckGeometry',
  type: 'Advanced::CheckGeometry',
  category: 'Advanced',
  label: 'CheckGeometry',
  description: 'Validate geometry',
  inputs: {
    shape: {
      type: 'Shape',
      label: 'Shape',
      required: true,
    },
  },
  outputs: {
    isValid: {
      type: 'boolean',
      label: 'Is Valid',
    },
    errors: {
      type: 'Data',
      label: 'Errors',
    },
  },
  params: {
    checkLevel: {
      type: 'enum',
      label: 'Check Level',
      default: 'standard',
      options: ['basic', 'standard', 'advanced'],
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'checkGeometry',
      params: {
        shape: inputs.shape,
        checkLevel: params.checkLevel,
      },
    });

    return {
      isValid: results.isValid,
      errors: results.errors,
    };
  },
};
