import type { NodeDefinition } from '@brepflow/types';

interface AngleMeasurementParams {
  units: string;
  showAnnotation: boolean;
}

interface AngleMeasurementInputs {
  vector1: [number, number, number];
  vector2: [number, number, number];
  vertex?: [number, number, number];
}

interface AngleMeasurementOutputs {
  angle: unknown;
  complementAngle: unknown;
  angleBisector: [number, number, number];
}

export const AnalysisMeasurementAngleMeasurementNode: NodeDefinition<
  AngleMeasurementInputs,
  AngleMeasurementOutputs,
  AngleMeasurementParams
> = {
  id: 'Analysis::AngleMeasurement',
  type: 'Analysis::AngleMeasurement',
  category: 'Analysis',
  label: 'AngleMeasurement',
  description: 'Measure angles between vectors/faces',
  inputs: {
    vector1: {
      type: 'Vector',
      label: 'Vector1',
      required: true,
    },
    vector2: {
      type: 'Vector',
      label: 'Vector2',
      required: true,
    },
    vertex: {
      type: 'Point',
      label: 'Vertex',
      optional: true,
    },
  },
  outputs: {
    angle: {
      type: 'number',
      label: 'Angle',
    },
    complementAngle: {
      type: 'number',
      label: 'Complement Angle',
    },
    angleBisector: {
      type: 'Vector',
      label: 'Angle Bisector',
    },
  },
  params: {
    units: {
      type: 'enum',
      label: 'Units',
      default: 'degrees',
      options: ['degrees', 'radians'],
    },
    showAnnotation: {
      type: 'boolean',
      label: 'Show Annotation',
      default: true,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'angleMeasurement',
      params: {
        vector1: inputs.vector1,
        vector2: inputs.vector2,
        vertex: inputs.vertex,
        units: params.units,
        showAnnotation: params.showAnnotation,
      },
    });

    return {
      angle: results.angle,
      complementAngle: results.complementAngle,
      angleBisector: results.angleBisector,
    };
  },
};
