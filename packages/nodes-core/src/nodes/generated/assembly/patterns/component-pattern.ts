import type { NodeDefinition } from '@sim4d/types';

interface ComponentPatternParams {
  patternType: string;
  count: number;
  spacing: number;
}

interface ComponentPatternInputs {
  component: unknown;
  mates?: unknown;
}

interface ComponentPatternOutputs {
  pattern: unknown;
}

export const AssemblyPatternsComponentPatternNode: NodeDefinition<
  ComponentPatternInputs,
  ComponentPatternOutputs,
  ComponentPatternParams
> = {
  id: 'Assembly::ComponentPattern',
  type: 'Assembly::ComponentPattern',
  category: 'Assembly',
  label: 'ComponentPattern',
  description: 'Pattern components in assembly',
  inputs: {
    component: {
      type: 'Shape',
      label: 'Component',
      required: true,
    },
    mates: {
      type: 'Mate[]',
      label: 'Mates',
      optional: true,
    },
  },
  outputs: {
    pattern: {
      type: 'Shape[]',
      label: 'Pattern',
    },
  },
  params: {
    patternType: {
      type: 'enum',
      label: 'Pattern Type',
      default: 'linear',
      options: ['linear', 'circular', 'mirror'],
    },
    count: {
      type: 'number',
      label: 'Count',
      default: 3,
      min: 2,
      max: 100,
    },
    spacing: {
      type: 'number',
      label: 'Spacing',
      default: 100,
      min: 0.1,
      max: 10000,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'assemblyComponentPattern',
      params: {
        component: inputs.component,
        mates: inputs.mates,
        patternType: params.patternType,
        count: params.count,
        spacing: params.spacing,
      },
    });

    return {
      pattern: result,
    };
  },
};
