import type { NodeDefinition } from '@brepflow/types';

interface ReflectionLinesParams {
  lineCount: number;
  viewDirection: [number, number, number];
}

interface ReflectionLinesInputs {
  surface: unknown;
}

interface ReflectionLinesOutputs {
  reflectionLines: unknown;
}

export const SurfaceAnalysisReflectionLinesNode: NodeDefinition<
  ReflectionLinesInputs,
  ReflectionLinesOutputs,
  ReflectionLinesParams
> = {
  id: 'Surface::ReflectionLines',
  category: 'Surface',
  label: 'ReflectionLines',
  description: 'Reflection line analysis',
  inputs: {
    surface: {
      type: 'Face',
      label: 'Surface',
      required: true,
    },
  },
  outputs: {
    reflectionLines: {
      type: 'Wire[]',
      label: 'Reflection Lines',
    },
  },
  params: {
    lineCount: {
      type: 'number',
      label: 'Line Count',
      default: 10,
      min: 3,
      max: 50,
      step: 1,
    },
    viewDirection: {
      type: 'vec3',
      label: 'View Direction',
      default: [0, 0, 1],
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'reflectionLines',
      params: {
        surface: inputs.surface,
        lineCount: params.lineCount,
        viewDirection: params.viewDirection,
      },
    });

    return {
      reflectionLines: result,
    };
  },
};
