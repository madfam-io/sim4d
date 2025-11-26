import type { NodeDefinition } from '@sim4d/types';

interface FlexibleSubAssemblyParams {
  flexibility: string;
}

interface FlexibleSubAssemblyInputs {
  components: unknown;
  joints?: unknown;
}

interface FlexibleSubAssemblyOutputs {
  subAssembly: unknown;
}

export const AssemblyPatternsFlexibleSubAssemblyNode: NodeDefinition<
  FlexibleSubAssemblyInputs,
  FlexibleSubAssemblyOutputs,
  FlexibleSubAssemblyParams
> = {
  id: 'Assembly::FlexibleSubAssembly',
  category: 'Assembly',
  label: 'FlexibleSubAssembly',
  description: 'Create flexible sub-assembly',
  inputs: {
    components: {
      type: 'Shape[]',
      label: 'Components',
      required: true,
    },
    joints: {
      type: 'Joint[]',
      label: 'Joints',
      optional: true,
    },
  },
  outputs: {
    subAssembly: {
      type: 'Assembly',
      label: 'Sub Assembly',
    },
  },
  params: {
    flexibility: {
      type: 'enum',
      label: 'Flexibility',
      default: 'flexible',
      options: ['rigid', 'flexible'],
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'assemblyFlexible',
      params: {
        components: inputs.components,
        joints: inputs.joints,
        flexibility: params.flexibility,
      },
    });

    return {
      subAssembly: result,
    };
  },
};
