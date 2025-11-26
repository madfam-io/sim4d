import type { NodeDefinition } from '@sim4d/types';

interface AwningWindowParams {
  opening: number;
}

interface AwningWindowInputs {
  opening: unknown;
}

interface AwningWindowOutputs {
  window: unknown;
}

export const ArchitectureWindowsAwningWindowNode: NodeDefinition<
  AwningWindowInputs,
  AwningWindowOutputs,
  AwningWindowParams
> = {
  id: 'Architecture::AwningWindow',
  category: 'Architecture',
  label: 'AwningWindow',
  description: 'Awning window',
  inputs: {
    opening: {
      type: 'Wire',
      label: 'Opening',
      required: true,
    },
  },
  outputs: {
    window: {
      type: 'Shape',
      label: 'Window',
    },
  },
  params: {
    opening: {
      type: 'number',
      label: 'Opening',
      default: 0,
      min: 0,
      max: 45,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'awningWindow',
      params: {
        opening: inputs.opening,
        opening: params.opening,
      },
    });

    return {
      window: result,
    };
  },
};
