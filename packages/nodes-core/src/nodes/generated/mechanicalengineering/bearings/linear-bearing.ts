import type { NodeDefinition } from '@brepflow/types';

interface LinearBearingParams {
  shaftDiameter: number;
  outerDiameter: number;
  length: number;
  type: string;
}

interface LinearBearingInputs {
  center: [number, number, number];
  axis?: [number, number, number];
}

interface LinearBearingOutputs {
  bearing: unknown;
  bore: unknown;
}

export const MechanicalEngineeringBearingsLinearBearingNode: NodeDefinition<
  LinearBearingInputs,
  LinearBearingOutputs,
  LinearBearingParams
> = {
  id: 'MechanicalEngineering::LinearBearing',
  type: 'MechanicalEngineering::LinearBearing',
  category: 'MechanicalEngineering',
  label: 'LinearBearing',
  description: 'Create linear motion bearing',
  inputs: {
    center: {
      type: 'Point',
      label: 'Center',
      required: true,
    },
    axis: {
      type: 'Vector',
      label: 'Axis',
      optional: true,
    },
  },
  outputs: {
    bearing: {
      type: 'Shape',
      label: 'Bearing',
    },
    bore: {
      type: 'Wire',
      label: 'Bore',
    },
  },
  params: {
    shaftDiameter: {
      type: 'number',
      label: 'Shaft Diameter',
      default: 8,
      min: 3,
      max: 50,
    },
    outerDiameter: {
      type: 'number',
      label: 'Outer Diameter',
      default: 15,
      min: 8,
      max: 80,
    },
    length: {
      type: 'number',
      label: 'Length',
      default: 24,
      min: 10,
      max: 100,
    },
    type: {
      type: 'enum',
      label: 'Type',
      default: 'ball',
      options: ['ball', 'plain', 'roller'],
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'linearBearing',
      params: {
        center: inputs.center,
        axis: inputs.axis,
        shaftDiameter: params.shaftDiameter,
        outerDiameter: params.outerDiameter,
        length: params.length,
        type: params.type,
      },
    });

    return {
      bearing: results.bearing,
      bore: results.bore,
    };
  },
};
