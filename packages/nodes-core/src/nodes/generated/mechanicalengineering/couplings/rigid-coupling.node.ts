import type { NodeDefinition } from '@sim4d/types';

interface RigidCouplingParams {
  shaft1Diameter: number;
  shaft2Diameter: number;
  couplingDiameter: number;
  length: number;
}

interface RigidCouplingInputs {
  center: [number, number, number];
}

interface RigidCouplingOutputs {
  coupling: unknown;
  bores: unknown;
}

export const MechanicalEngineeringCouplingsRigidCouplingNode: NodeDefinition<
  RigidCouplingInputs,
  RigidCouplingOutputs,
  RigidCouplingParams
> = {
  id: 'MechanicalEngineering::RigidCoupling',
  category: 'MechanicalEngineering',
  label: 'RigidCoupling',
  description: 'Create rigid shaft coupling',
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
    bores: {
      type: 'Wire[]',
      label: 'Bores',
    },
  },
  params: {
    shaft1Diameter: {
      type: 'number',
      label: 'Shaft1 Diameter',
      default: 20,
      min: 5,
      max: 100,
    },
    shaft2Diameter: {
      type: 'number',
      label: 'Shaft2 Diameter',
      default: 20,
      min: 5,
      max: 100,
    },
    couplingDiameter: {
      type: 'number',
      label: 'Coupling Diameter',
      default: 40,
      min: 15,
      max: 150,
    },
    length: {
      type: 'number',
      label: 'Length',
      default: 50,
      min: 20,
      max: 150,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'rigidCoupling',
      params: {
        center: inputs.center,
        shaft1Diameter: params.shaft1Diameter,
        shaft2Diameter: params.shaft2Diameter,
        couplingDiameter: params.couplingDiameter,
        length: params.length,
      },
    });

    return {
      coupling: results.coupling,
      bores: results.bores,
    };
  },
};
