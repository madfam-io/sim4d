import type { NodeDefinition } from '@brepflow/types';

interface ParabolaParams {
  focalLength: number;
  startParam: number;
  endParam: number;
}

interface ParabolaInputs {
  vertex?: [number, number, number];
}

interface ParabolaOutputs {
  curve: unknown;
}

export const SketchCurvesParabolaNode: NodeDefinition<
  ParabolaInputs,
  ParabolaOutputs,
  ParabolaParams
> = {
  id: 'Sketch::Parabola',
  category: 'Sketch',
  label: 'Parabola',
  description: 'Create a parabolic curve',
  inputs: {
    vertex: {
      type: 'Point',
      label: 'Vertex',
      optional: true,
    },
  },
  outputs: {
    curve: {
      type: 'Wire',
      label: 'Curve',
    },
  },
  params: {
    focalLength: {
      type: 'number',
      label: 'Focal Length',
      default: 10,
      min: 0.1,
      max: 10000,
    },
    startParam: {
      type: 'number',
      label: 'Start Param',
      default: -100,
      min: -10000,
      max: 10000,
    },
    endParam: {
      type: 'number',
      label: 'End Param',
      default: 100,
      min: -10000,
      max: 10000,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'makeParabola',
      params: {
        vertex: inputs.vertex,
        focalLength: params.focalLength,
        startParam: params.startParam,
        endParam: params.endParam,
      },
    });

    return {
      curve: result,
    };
  },
};
