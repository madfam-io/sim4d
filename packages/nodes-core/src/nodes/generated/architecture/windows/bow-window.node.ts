import type { NodeDefinition } from '@sim4d/types';

interface BowWindowParams {
  projection: number;
  segments: number;
}

interface BowWindowInputs {
  wallOpening: unknown;
}

interface BowWindowOutputs {
  bowWindow: unknown;
}

export const ArchitectureWindowsBowWindowNode: NodeDefinition<
  BowWindowInputs,
  BowWindowOutputs,
  BowWindowParams
> = {
  id: 'Architecture::BowWindow',
  category: 'Architecture',
  label: 'BowWindow',
  description: 'Bow window projection',
  inputs: {
    wallOpening: {
      type: 'Wire',
      label: 'Wall Opening',
      required: true,
    },
  },
  outputs: {
    bowWindow: {
      type: 'Shape',
      label: 'Bow Window',
    },
  },
  params: {
    projection: {
      type: 'number',
      label: 'Projection',
      default: 600,
      min: 400,
      max: 1200,
    },
    segments: {
      type: 'number',
      label: 'Segments',
      default: 5,
      min: 3,
      max: 7,
      step: 1,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'bowWindow',
      params: {
        wallOpening: inputs.wallOpening,
        projection: params.projection,
        segments: params.segments,
      },
    });

    return {
      bowWindow: result,
    };
  },
};
