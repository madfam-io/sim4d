import type { NodeDefinition } from '@brepflow/types';

interface PolylineParams {
  closed: boolean;
}

interface PolylineInputs {
  points: Array<[number, number, number]>;
}

interface PolylineOutputs {
  wire: unknown;
}

export const SketchBasicPolylineNode: NodeDefinition<
  PolylineInputs,
  PolylineOutputs,
  PolylineParams
> = {
  id: 'Sketch::Polyline',
  category: 'Sketch',
  label: 'Polyline',
  description: 'Create a polyline from points',
  inputs: {
    points: {
      type: 'Point[]',
      label: 'Points',
      required: true,
    },
  },
  outputs: {
    wire: {
      type: 'Wire',
      label: 'Wire',
    },
  },
  params: {
    closed: {
      type: 'boolean',
      label: 'Closed',
      default: false,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'makePolyline',
      params: {
        points: inputs.points,
        closed: params.closed,
      },
    });

    return {
      wire: result,
    };
  },
};
