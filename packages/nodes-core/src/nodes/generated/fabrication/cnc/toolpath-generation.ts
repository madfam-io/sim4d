import type { NodeDefinition } from '@sim4d/types';

interface ToolpathGenerationParams {
  strategy: string;
  toolDiameter: number;
  stepover: number;
}

interface ToolpathGenerationInputs {
  model: unknown;
  stock?: unknown;
}

interface ToolpathGenerationOutputs {
  toolpath: unknown;
  rapids: unknown;
}

export const FabricationCNCToolpathGenerationNode: NodeDefinition<
  ToolpathGenerationInputs,
  ToolpathGenerationOutputs,
  ToolpathGenerationParams
> = {
  id: 'Fabrication::ToolpathGeneration',
  type: 'Fabrication::ToolpathGeneration',
  category: 'Fabrication',
  label: 'ToolpathGeneration',
  description: 'Generate CNC toolpaths',
  inputs: {
    model: {
      type: 'Shape',
      label: 'Model',
      required: true,
    },
    stock: {
      type: 'Shape',
      label: 'Stock',
      optional: true,
    },
  },
  outputs: {
    toolpath: {
      type: 'Wire[]',
      label: 'Toolpath',
    },
    rapids: {
      type: 'Wire[]',
      label: 'Rapids',
    },
  },
  params: {
    strategy: {
      type: 'enum',
      label: 'Strategy',
      default: 'parallel',
      options: ['parallel', 'contour', 'pocket', 'adaptive'],
    },
    toolDiameter: {
      type: 'number',
      label: 'Tool Diameter',
      default: 6,
      min: 0.1,
      max: 50,
    },
    stepover: {
      type: 'number',
      label: 'Stepover',
      default: 0.5,
      min: 0.1,
      max: 1,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'toolpathGeneration',
      params: {
        model: inputs.model,
        stock: inputs.stock,
        strategy: params.strategy,
        toolDiameter: params.toolDiameter,
        stepover: params.stepover,
      },
    });

    return {
      toolpath: results.toolpath,
      rapids: results.rapids,
    };
  },
};
