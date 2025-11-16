import type { NodeDefinition } from '@brepflow/types';

interface PolygonParams {
  sides: number;
  radius: number;
  inscribed: boolean;
}

interface PolygonInputs {
  center?: [number, number, number];
}

interface PolygonOutputs {
  polygon: unknown;
}

export const SketchPatternsPolygonNode: NodeDefinition<
  PolygonInputs,
  PolygonOutputs,
  PolygonParams
> = {
  id: 'Sketch::Polygon',
  category: 'Sketch',
  label: 'Polygon',
  description: 'Create a regular polygon',
  inputs: {
    center: {
      type: 'Point',
      label: 'Center',
      optional: true,
    },
  },
  outputs: {
    polygon: {
      type: 'Wire',
      label: 'Polygon',
    },
  },
  params: {
    sides: {
      type: 'number',
      label: 'Sides',
      default: 6,
      min: 3,
      max: 100,
      step: 1,
    },
    radius: {
      type: 'number',
      label: 'Radius',
      default: 50,
      min: 0.1,
      max: 10000,
    },
    inscribed: {
      type: 'boolean',
      label: 'Inscribed',
      default: true,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'makePolygon',
      params: {
        center: inputs.center,
        sides: params.sides,
        radius: params.radius,
        inscribed: params.inscribed,
      },
    });

    return {
      polygon: result,
    };
  },
};
