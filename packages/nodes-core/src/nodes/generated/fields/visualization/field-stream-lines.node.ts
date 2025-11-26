import type { NodeDefinition } from '@sim4d/types';

interface FieldStreamLinesParams {
  seedCount: number;
  stepSize: number;
  maxSteps: number;
}

interface FieldStreamLinesInputs {
  field?: unknown;
  seedPoints?: unknown;
}

interface FieldStreamLinesOutputs {
  streamlines: unknown;
}

export const FieldsVisualizationFieldStreamLinesNode: NodeDefinition<
  FieldStreamLinesInputs,
  FieldStreamLinesOutputs,
  FieldStreamLinesParams
> = {
  id: 'Fields::FieldStreamLines',
  category: 'Fields',
  label: 'FieldStreamLines',
  description: 'Generate streamlines through vector field',
  inputs: {
    field: {
      type: 'VectorField',
      label: 'Field',
      optional: true,
    },
    seedPoints: {
      type: 'PointSet',
      label: 'Seed Points',
      optional: true,
    },
  },
  outputs: {
    streamlines: {
      type: 'CurveSet',
      label: 'Streamlines',
    },
  },
  params: {
    seedCount: {
      type: 'number',
      label: 'Seed Count',
      default: 20,
      min: 1,
      max: 1000,
    },
    stepSize: {
      type: 'number',
      label: 'Step Size',
      default: 0.1,
      min: 0.01,
      max: 1,
    },
    maxSteps: {
      type: 'number',
      label: 'Max Steps',
      default: 100,
      min: 10,
      max: 1000,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'generateStreamlines',
      params: {
        field: inputs.field,
        seedPoints: inputs.seedPoints,
        seedCount: params.seedCount,
        stepSize: params.stepSize,
        maxSteps: params.maxSteps,
      },
    });

    return {
      streamlines: result,
    };
  },
};
