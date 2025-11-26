import type { NodeDefinition } from '@sim4d/types';

interface FieldVectorArrowsParams {
  arrowScale: number;
  density: number;
}

interface FieldVectorArrowsInputs {
  field?: unknown;
  domain: unknown;
}

interface FieldVectorArrowsOutputs {
  arrows: unknown;
}

export const FieldsVisualizationFieldVectorArrowsNode: NodeDefinition<
  FieldVectorArrowsInputs,
  FieldVectorArrowsOutputs,
  FieldVectorArrowsParams
> = {
  id: 'Fields::FieldVectorArrows',
  category: 'Fields',
  label: 'FieldVectorArrows',
  description: 'Display vector field as arrows',
  inputs: {
    field: {
      type: 'VectorField',
      label: 'Field',
      optional: true,
    },
    domain: {
      type: 'Geometry',
      label: 'Domain',
      required: true,
    },
  },
  outputs: {
    arrows: {
      type: 'GeometrySet',
      label: 'Arrows',
    },
  },
  params: {
    arrowScale: {
      type: 'number',
      label: 'Arrow Scale',
      default: 1,
      min: 0.1,
      max: 10,
    },
    density: {
      type: 'number',
      label: 'Density',
      default: 0.5,
      min: 0,
      max: 1,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'visualizeFieldVectors',
      params: {
        field: inputs.field,
        domain: inputs.domain,
        arrowScale: params.arrowScale,
        density: params.density,
      },
    });

    return {
      arrows: result,
    };
  },
};
