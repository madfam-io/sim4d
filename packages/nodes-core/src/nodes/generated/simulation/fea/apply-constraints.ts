import type { NodeDefinition } from '@sim4d/types';

interface ApplyConstraintsParams {
  constraintType: string;
  dof: unknown;
}

interface ApplyConstraintsInputs {
  mesh: unknown;
  constraintFaces: unknown;
}

interface ApplyConstraintsOutputs {
  constrainedMesh: unknown;
  constraintData: unknown;
}

export const SimulationFEAApplyConstraintsNode: NodeDefinition<
  ApplyConstraintsInputs,
  ApplyConstraintsOutputs,
  ApplyConstraintsParams
> = {
  id: 'Simulation::ApplyConstraints',
  type: 'Simulation::ApplyConstraints',
  category: 'Simulation',
  label: 'ApplyConstraints',
  description: 'Define boundary conditions',
  inputs: {
    mesh: {
      type: 'Mesh',
      label: 'Mesh',
      required: true,
    },
    constraintFaces: {
      type: 'Face[]',
      label: 'Constraint Faces',
      required: true,
    },
  },
  outputs: {
    constrainedMesh: {
      type: 'Mesh',
      label: 'Constrained Mesh',
    },
    constraintData: {
      type: 'Data',
      label: 'Constraint Data',
    },
  },
  params: {
    constraintType: {
      type: 'enum',
      label: 'Constraint Type',
      default: 'fixed',
      options: ['fixed', 'pinned', 'roller', 'spring', 'displacement'],
    },
    dof: {
      type: 'boolean[]',
      label: 'Dof',
      default: [true, true, true, true, true, true],
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'applyConstraints',
      params: {
        mesh: inputs.mesh,
        constraintFaces: inputs.constraintFaces,
        constraintType: params.constraintType,
        dof: params.dof,
      },
    });

    return {
      constrainedMesh: results.constrainedMesh,
      constraintData: results.constraintData,
    };
  },
};
