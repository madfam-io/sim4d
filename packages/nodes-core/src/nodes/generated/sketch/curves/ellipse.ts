import type { NodeDefinition } from '@sim4d/types';

interface EllipseParams {
  majorRadius: number;
  minorRadius: number;
  startAngle: number;
  endAngle: number;
}

interface EllipseInputs {
  center?: [number, number, number];
}

interface EllipseOutputs {
  curve: unknown;
}

export const SketchCurvesEllipseNode: NodeDefinition<EllipseInputs, EllipseOutputs, EllipseParams> =
  {
    id: 'Sketch::Ellipse',
    type: 'Sketch::Ellipse',
    category: 'Sketch',
    label: 'Ellipse',
    description: 'Create an ellipse',
    inputs: {
      center: {
        type: 'Point',
        label: 'Center',
        optional: true,
      },
    },
    outputs: {
      curve: {
        type: 'Wire',
        label: 'Curve',
      },
    },
    params: {
      majorRadius: {
        type: 'number',
        label: 'Major Radius',
        default: 100,
        min: 0.1,
        max: 10000,
      },
      minorRadius: {
        type: 'number',
        label: 'Minor Radius',
        default: 50,
        min: 0.1,
        max: 10000,
      },
      startAngle: {
        type: 'number',
        label: 'Start Angle',
        default: 0,
        min: 0,
        max: 360,
      },
      endAngle: {
        type: 'number',
        label: 'End Angle',
        default: 360,
        min: 0,
        max: 360,
      },
    },
    async evaluate(context, inputs, params) {
      const result = await context.geometry.execute({
        type: 'makeEllipse',
        params: {
          center: inputs.center,
          majorRadius: params.majorRadius,
          minorRadius: params.minorRadius,
          startAngle: params.startAngle,
          endAngle: params.endAngle,
        },
      });

      return {
        curve: result,
      };
    },
  };
