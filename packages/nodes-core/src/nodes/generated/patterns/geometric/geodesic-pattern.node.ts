import type { NodeDefinition } from '@brepflow/types';

interface GeodesicPatternParams {
  frequency: number;
  class: string;
}

interface GeodesicPatternInputs {
  sphere: unknown;
}

interface GeodesicPatternOutputs {
  geodesic: unknown;
}

export const PatternsGeometricGeodesicPatternNode: NodeDefinition<
  GeodesicPatternInputs,
  GeodesicPatternOutputs,
  GeodesicPatternParams
> = {
  id: 'Patterns::GeodesicPattern',
  category: 'Patterns',
  label: 'GeodesicPattern',
  description: 'Geodesic dome pattern',
  inputs: {
    sphere: {
      type: 'Face',
      label: 'Sphere',
      required: true,
    },
  },
  outputs: {
    geodesic: {
      type: 'Wire[]',
      label: 'Geodesic',
    },
  },
  params: {
    frequency: {
      type: 'number',
      label: 'Frequency',
      default: 3,
      min: 1,
      max: 10,
      step: 1,
    },
    class: {
      type: 'enum',
      label: 'Class',
      default: 'I',
      options: ['I', 'II', 'III'],
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'geodesicPattern',
      params: {
        sphere: inputs.sphere,
        frequency: params.frequency,
        class: params.class,
      },
    });

    return {
      geodesic: result,
    };
  },
};
