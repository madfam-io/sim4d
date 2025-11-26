import type { NodeDefinition } from '@sim4d/types';

interface MaterialAssignParams {
  material: string;
  youngsModulus: number;
  poissonsRatio: number;
  density: number;
  yieldStrength: number;
}

interface MaterialAssignInputs {
  mesh: unknown;
  bodies?: unknown;
}

interface MaterialAssignOutputs {
  materializedMesh: unknown;
  materialData: unknown;
}

export const SimulationFEAMaterialAssignNode: NodeDefinition<
  MaterialAssignInputs,
  MaterialAssignOutputs,
  MaterialAssignParams
> = {
  id: 'Simulation::MaterialAssign',
  type: 'Simulation::MaterialAssign',
  category: 'Simulation',
  label: 'MaterialAssign',
  description: 'Assign material properties',
  inputs: {
    mesh: {
      type: 'Mesh',
      label: 'Mesh',
      required: true,
    },
    bodies: {
      type: 'Shape[]',
      label: 'Bodies',
      optional: true,
    },
  },
  outputs: {
    materializedMesh: {
      type: 'Mesh',
      label: 'Materialized Mesh',
    },
    materialData: {
      type: 'Data',
      label: 'Material Data',
    },
  },
  params: {
    material: {
      type: 'enum',
      label: 'Material',
      default: 'steel',
      options: ['steel', 'aluminum', 'titanium', 'plastic', 'composite', 'custom'],
    },
    youngsModulus: {
      type: 'number',
      label: 'Youngs Modulus',
      default: 200000,
      min: 1,
      max: 1000000,
    },
    poissonsRatio: {
      type: 'number',
      label: 'Poissons Ratio',
      default: 0.3,
      min: 0,
      max: 0.5,
    },
    density: {
      type: 'number',
      label: 'Density',
      default: 7850,
      min: 1,
      max: 20000,
    },
    yieldStrength: {
      type: 'number',
      label: 'Yield Strength',
      default: 250,
      min: 1,
      max: 5000,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'materialAssign',
      params: {
        mesh: inputs.mesh,
        bodies: inputs.bodies,
        material: params.material,
        youngsModulus: params.youngsModulus,
        poissonsRatio: params.poissonsRatio,
        density: params.density,
        yieldStrength: params.yieldStrength,
      },
    });

    return {
      materializedMesh: results.materializedMesh,
      materialData: results.materialData,
    };
  },
};
