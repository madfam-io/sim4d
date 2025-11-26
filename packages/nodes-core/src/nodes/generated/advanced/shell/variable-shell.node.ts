import type { NodeDefinition } from '@sim4d/types';

type VariableShellParams = Record<string, never>;

interface VariableShellInputs {
  solid: unknown;
  facesToRemove: unknown;
  thicknessMap: unknown;
}

interface VariableShellOutputs {
  shell: unknown;
}

export const AdvancedShellVariableShellNode: NodeDefinition<
  VariableShellInputs,
  VariableShellOutputs,
  VariableShellParams
> = {
  id: 'Advanced::VariableShell',
  category: 'Advanced',
  label: 'VariableShell',
  description: 'Shell with variable thickness',
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
    thicknessMap: {
      type: 'Data',
      label: 'Thickness Map',
      required: true,
    },
  },
  outputs: {
    shell: {
      type: 'Shape',
      label: 'Shell',
    },
  },
  params: {},
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'variableShell',
      params: {
        solid: inputs.solid,
        facesToRemove: inputs.facesToRemove,
        thicknessMap: inputs.thicknessMap,
      },
    });

    return {
      shell: result,
    };
  },
};
