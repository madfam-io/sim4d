import type { NodeDefinition } from '@sim4d/types';

interface RetainingRingParams {
  shaftDiameter: number;
  type: string;
  thickness: number;
  grooveWidth: number;
}

interface RetainingRingInputs {
  center: [number, number, number];
}

interface RetainingRingOutputs {
  ring: unknown;
  groove: unknown;
}

export const MechanicalEngineeringFastenersRetainingRingNode: NodeDefinition<
  RetainingRingInputs,
  RetainingRingOutputs,
  RetainingRingParams
> = {
  id: 'MechanicalEngineering::RetainingRing',
  type: 'MechanicalEngineering::RetainingRing',
  category: 'MechanicalEngineering',
  label: 'RetainingRing',
  description: 'Create retaining ring/circlip',
  inputs: {
    center: {
      type: 'Point',
      label: 'Center',
      required: true,
    },
  },
  outputs: {
    ring: {
      type: 'Shape',
      label: 'Ring',
    },
    groove: {
      type: 'Wire',
      label: 'Groove',
    },
  },
  params: {
    shaftDiameter: {
      type: 'number',
      label: 'Shaft Diameter',
      default: 10,
      min: 3,
      max: 100,
    },
    type: {
      type: 'enum',
      label: 'Type',
      default: 'external',
      options: ['external', 'internal'],
    },
    thickness: {
      type: 'number',
      label: 'Thickness',
      default: 1,
      min: 0.5,
      max: 3,
    },
    grooveWidth: {
      type: 'number',
      label: 'Groove Width',
      default: 1.2,
      min: 0.6,
      max: 4,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'retainingRing',
      params: {
        center: inputs.center,
        shaftDiameter: params.shaftDiameter,
        type: params.type,
        thickness: params.thickness,
        grooveWidth: params.grooveWidth,
      },
    });

    return {
      ring: results.ring,
      groove: results.groove,
    };
  },
};
