import type { NodeDefinition } from '@sim4d/types';

interface ShellParams {
  thickness: number;
  direction: string;
  tolerance: number;
}

interface ShellInputs {
  solid: unknown;
  facesToRemove: unknown;
}

interface ShellOutputs {
  shell: unknown;
}

export const AdvancedShellShellNode: NodeDefinition<ShellInputs, ShellOutputs, ShellParams> = {
  id: 'Advanced::Shell',
  category: 'Advanced',
  label: 'Shell',
  description: 'Hollow out solid',
  inputs: {
    solid: {
      type: 'Shape',
      label: 'Solid',
      required: true,
    },
    facesToRemove: {
      type: 'Face[]',
      label: 'Faces To Remove',
      required: true,
    },
  },
  outputs: {
    shell: {
      type: 'Shape',
      label: 'Shell',
    },
  },
  params: {
    thickness: {
      type: 'number',
      label: 'Thickness',
      default: 2,
      min: 0.01,
      max: 1000,
    },
    direction: {
      type: 'enum',
      label: 'Direction',
      default: 'inward',
      options: ['inward', 'outward', 'both'],
    },
    tolerance: {
      type: 'number',
      label: 'Tolerance',
      default: 0.01,
      min: 0.0001,
      max: 1,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'shell',
      params: {
        solid: inputs.solid,
        facesToRemove: inputs.facesToRemove,
        thickness: params.thickness,
        direction: params.direction,
        tolerance: params.tolerance,
      },
    });

    return {
      shell: result,
    };
  },
};
