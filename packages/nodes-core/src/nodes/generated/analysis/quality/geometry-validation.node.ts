import type { NodeDefinition } from '@brepflow/types';

interface GeometryValidationParams {
  tolerance: number;
  checkClosed: boolean;
  checkValid: boolean;
}

interface GeometryValidationInputs {
  geometry: unknown;
}

interface GeometryValidationOutputs {
  isValid: unknown;
  isClosed: unknown;
  errors: unknown;
  problemAreas: unknown;
}

export const AnalysisQualityGeometryValidationNode: NodeDefinition<
  GeometryValidationInputs,
  GeometryValidationOutputs,
  GeometryValidationParams
> = {
  id: 'Analysis::GeometryValidation',
  category: 'Analysis',
  label: 'GeometryValidation',
  description: 'Validate geometry integrity',
  inputs: {
    geometry: {
      type: 'Shape',
      label: 'Geometry',
      required: true,
    },
  },
  outputs: {
    isValid: {
      type: 'boolean',
      label: 'Is Valid',
    },
    isClosed: {
      type: 'boolean',
      label: 'Is Closed',
    },
    errors: {
      type: 'string[]',
      label: 'Errors',
    },
    problemAreas: {
      type: 'Shape[]',
      label: 'Problem Areas',
    },
  },
  params: {
    tolerance: {
      type: 'number',
      label: 'Tolerance',
      default: 0.01,
      min: 0.001,
      max: 1,
    },
    checkClosed: {
      type: 'boolean',
      label: 'Check Closed',
      default: true,
    },
    checkValid: {
      type: 'boolean',
      label: 'Check Valid',
      default: true,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'geometryValidation',
      params: {
        geometry: inputs.geometry,
        tolerance: params.tolerance,
        checkClosed: params.checkClosed,
        checkValid: params.checkValid,
      },
    });

    return {
      isValid: results.isValid,
      isClosed: results.isClosed,
      errors: results.errors,
      problemAreas: results.problemAreas,
    };
  },
};
