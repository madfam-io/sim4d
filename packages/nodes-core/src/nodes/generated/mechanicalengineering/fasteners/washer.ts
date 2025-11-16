import type { NodeDefinition } from '@brepflow/types';

interface WasherParams {
  innerDiameter: number;
  outerDiameter: number;
  thickness: number;
  type: string;
}

interface WasherInputs {
  center: [number, number, number];
}

interface WasherOutputs {
  washer: unknown;
}

export const MechanicalEngineeringFastenersWasherNode: NodeDefinition<
  WasherInputs,
  WasherOutputs,
  WasherParams
> = {
  id: 'MechanicalEngineering::Washer',
  type: 'MechanicalEngineering::Washer',
  category: 'MechanicalEngineering',
  label: 'Washer',
  description: 'Create washer',
  inputs: {
    center: {
      type: 'Point',
      label: 'Center',
      required: true,
    },
  },
  outputs: {
    washer: {
      type: 'Shape',
      label: 'Washer',
    },
  },
  params: {
    innerDiameter: {
      type: 'number',
      label: 'Inner Diameter',
      default: 6.4,
      min: 2,
      max: 50,
    },
    outerDiameter: {
      type: 'number',
      label: 'Outer Diameter',
      default: 12,
      min: 4,
      max: 100,
    },
    thickness: {
      type: 'number',
      label: 'Thickness',
      default: 1.6,
      min: 0.5,
      max: 5,
    },
    type: {
      type: 'enum',
      label: 'Type',
      default: 'flat',
      options: ['flat', 'spring', 'lock', 'fender'],
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'washer',
      params: {
        center: inputs.center,
        innerDiameter: params.innerDiameter,
        outerDiameter: params.outerDiameter,
        thickness: params.thickness,
        type: params.type,
      },
    });

    return {
      washer: result,
    };
  },
};
