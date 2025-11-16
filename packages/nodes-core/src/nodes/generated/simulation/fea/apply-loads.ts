import type { NodeDefinition } from '@brepflow/types';

interface ApplyLoadsParams {
  loadType: string;
  magnitude: number;
  direction: [number, number, number];
  units: string;
}

interface ApplyLoadsInputs {
  mesh: unknown;
  applicationFaces: unknown;
}

interface ApplyLoadsOutputs {
  loadedMesh: unknown;
  loadData: unknown;
}

export const SimulationFEAApplyLoadsNode: NodeDefinition<
  ApplyLoadsInputs,
  ApplyLoadsOutputs,
  ApplyLoadsParams
> = {
  id: 'Simulation::ApplyLoads',
  type: 'Simulation::ApplyLoads',
  category: 'Simulation',
  label: 'ApplyLoads',
  description: 'Define load conditions',
  inputs: {
    mesh: {
      type: 'Mesh',
      label: 'Mesh',
      required: true,
    },
    applicationFaces: {
      type: 'Face[]',
      label: 'Application Faces',
      required: true,
    },
  },
  outputs: {
    loadedMesh: {
      type: 'Mesh',
      label: 'Loaded Mesh',
    },
    loadData: {
      type: 'Data',
      label: 'Load Data',
    },
  },
  params: {
    loadType: {
      type: 'enum',
      label: 'Load Type',
      default: 'force',
      options: ['force', 'pressure', 'torque', 'gravity', 'thermal'],
    },
    magnitude: {
      type: 'number',
      label: 'Magnitude',
      default: 1000,
      min: 0,
      max: 1000000,
    },
    direction: {
      type: 'vec3',
      label: 'Direction',
      default: [0, 0, -1],
    },
    units: {
      type: 'enum',
      label: 'Units',
      default: 'N',
      options: ['N', 'kN', 'lbf', 'Pa', 'MPa'],
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'applyLoads',
      params: {
        mesh: inputs.mesh,
        applicationFaces: inputs.applicationFaces,
        loadType: params.loadType,
        magnitude: params.magnitude,
        direction: params.direction,
        units: params.units,
      },
    });

    return {
      loadedMesh: results.loadedMesh,
      loadData: results.loadData,
    };
  },
};
