import type { NodeDefinition } from '@sim4d/types';

interface Chamfer2DParams {
  distance: number;
}

interface Chamfer2DInputs {
  wire: unknown;
  vertices?: unknown;
}

interface Chamfer2DOutputs {
  chamfered: unknown;
}

export const SketchCurvesChamfer2DNode: NodeDefinition<
  Chamfer2DInputs,
  Chamfer2DOutputs,
  Chamfer2DParams
> = {
  id: 'Sketch::Chamfer2D',
  type: 'Sketch::Chamfer2D',
  category: 'Sketch',
  label: 'Chamfer2D',
  description: 'Chamfer corners of a 2D shape',
  inputs: {
    wire: {
      type: 'Wire',
      label: 'Wire',
      required: true,
    },
    vertices: {
      type: 'Vertex[]',
      label: 'Vertices',
      optional: true,
    },
  },
  outputs: {
    chamfered: {
      type: 'Wire',
      label: 'Chamfered',
    },
  },
  params: {
    distance: {
      type: 'number',
      label: 'Distance',
      default: 5,
      min: 0.1,
      max: 1000,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'chamfer2D',
      params: {
        wire: inputs.wire,
        vertices: inputs.vertices,
        distance: params.distance,
      },
    });

    return {
      chamfered: result,
    };
  },
};
