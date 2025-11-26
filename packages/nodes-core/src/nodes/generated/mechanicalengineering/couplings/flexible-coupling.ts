import type { NodeDefinition } from '@sim4d/types';

interface FlexibleCouplingParams {
  type: string;
  boreDiameter1: number;
  boreDiameter2: number;
  outerDiameter: number;
}

interface FlexibleCouplingInputs {
  center: [number, number, number];
}

interface FlexibleCouplingOutputs {
  coupling: unknown;
  element: unknown;
}

export const MechanicalEngineeringCouplingsFlexibleCouplingNode: NodeDefinition<
  FlexibleCouplingInputs,
  FlexibleCouplingOutputs,
  FlexibleCouplingParams
> = {
  id: 'MechanicalEngineering::FlexibleCoupling',
  type: 'MechanicalEngineering::FlexibleCoupling',
  category: 'MechanicalEngineering',
  label: 'FlexibleCoupling',
  description: 'Create flexible coupling',
  inputs: {
    center: {
      type: 'Point',
      label: 'Center',
      required: true,
    },
  },
  outputs: {
    coupling: {
      type: 'Shape',
      label: 'Coupling',
    },
    element: {
      type: 'Shape',
      label: 'Element',
    },
  },
  params: {
    type: {
      type: 'enum',
      label: 'Type',
      default: 'jaw',
      options: ['jaw', 'disc', 'beam', 'oldham'],
    },
    boreDiameter1: {
      type: 'number',
      label: 'Bore Diameter1',
      default: 10,
      min: 3,
      max: 50,
    },
    boreDiameter2: {
      type: 'number',
      label: 'Bore Diameter2',
      default: 10,
      min: 3,
      max: 50,
    },
    outerDiameter: {
      type: 'number',
      label: 'Outer Diameter',
      default: 30,
      min: 10,
      max: 100,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'flexibleCoupling',
      params: {
        center: inputs.center,
        type: params.type,
        boreDiameter1: params.boreDiameter1,
        boreDiameter2: params.boreDiameter2,
        outerDiameter: params.outerDiameter,
      },
    });

    return {
      coupling: results.coupling,
      element: results.element,
    };
  },
};
