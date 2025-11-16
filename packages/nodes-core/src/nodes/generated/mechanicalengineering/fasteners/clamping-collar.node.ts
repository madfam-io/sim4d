import type { NodeDefinition } from '@brepflow/types';

interface ClampingCollarParams {
  shaftDiameter: number;
  outerDiameter: number;
  width: number;
  clampType: string;
}

interface ClampingCollarInputs {
  position: [number, number, number];
}

interface ClampingCollarOutputs {
  collar: unknown;
  bore: unknown;
}

export const MechanicalEngineeringFastenersClampingCollarNode: NodeDefinition<
  ClampingCollarInputs,
  ClampingCollarOutputs,
  ClampingCollarParams
> = {
  id: 'MechanicalEngineering::ClampingCollar',
  category: 'MechanicalEngineering',
  label: 'ClampingCollar',
  description: 'Create shaft collar/clamp',
  inputs: {
    position: {
      type: 'Point',
      label: 'Position',
      required: true,
    },
  },
  outputs: {
    collar: {
      type: 'Shape',
      label: 'Collar',
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
      default: 10,
      min: 3,
      max: 50,
    },
    outerDiameter: {
      type: 'number',
      label: 'Outer Diameter',
      default: 20,
      min: 8,
      max: 80,
    },
    width: {
      type: 'number',
      label: 'Width',
      default: 8,
      min: 3,
      max: 20,
    },
    clampType: {
      type: 'enum',
      label: 'Clamp Type',
      default: 'set-screw',
      options: ['set-screw', 'split', 'hinged'],
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'clampingCollar',
      params: {
        position: inputs.position,
        shaftDiameter: params.shaftDiameter,
        outerDiameter: params.outerDiameter,
        width: params.width,
        clampType: params.clampType,
      },
    });

    return {
      collar: results.collar,
      bore: results.bore,
    };
  },
};
