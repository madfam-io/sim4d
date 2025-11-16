import type { NodeDefinition } from '@brepflow/types';

interface ConfigurationParams {
  name: string;
  suppressedComponents: string;
}

interface ConfigurationInputs {
  assembly: unknown;
}

interface ConfigurationOutputs {
  configuration: unknown;
}

export const AssemblyPatternsConfigurationNode: NodeDefinition<
  ConfigurationInputs,
  ConfigurationOutputs,
  ConfigurationParams
> = {
  id: 'Assembly::Configuration',
  type: 'Assembly::Configuration',
  category: 'Assembly',
  label: 'Configuration',
  description: 'Create assembly configuration',
  inputs: {
    assembly: {
      type: 'Assembly',
      label: 'Assembly',
      required: true,
    },
  },
  outputs: {
    configuration: {
      type: 'Configuration',
      label: 'Configuration',
    },
  },
  params: {
    name: {
      type: 'string',
      label: 'Name',
      default: 'Default',
    },
    suppressedComponents: {
      type: 'string',
      label: 'Suppressed Components',
      default: '',
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'assemblyConfiguration',
      params: {
        assembly: inputs.assembly,
        name: params.name,
        suppressedComponents: params.suppressedComponents,
      },
    });

    return {
      configuration: result,
    };
  },
};
