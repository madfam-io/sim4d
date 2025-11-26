import type { NodeDefinition } from '@sim4d/types';

interface Fillet2DParams {
  radius: number;
  allCorners: boolean;
}

interface Fillet2DInputs {
  wire: unknown;
  vertices?: unknown;
}

interface Fillet2DOutputs {
  filleted: unknown;
}

export const SketchCurvesFillet2DNode: NodeDefinition<
  Fillet2DInputs,
  Fillet2DOutputs,
  Fillet2DParams
> = {
  id: 'Sketch::Fillet2D',
  category: 'Sketch',
  label: 'Fillet2D',
  description: 'Fillet corners of a 2D shape',
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
    filleted: {
      type: 'Wire',
      label: 'Filleted',
    },
  },
  params: {
    radius: {
      type: 'number',
      label: 'Radius',
      default: 5,
      min: 0.1,
      max: 1000,
    },
    allCorners: {
      type: 'boolean',
      label: 'All Corners',
      default: true,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'fillet2D',
      params: {
        wire: inputs.wire,
        vertices: inputs.vertices,
        radius: params.radius,
        allCorners: params.allCorners,
      },
    });

    return {
      filleted: result,
    };
  },
};
