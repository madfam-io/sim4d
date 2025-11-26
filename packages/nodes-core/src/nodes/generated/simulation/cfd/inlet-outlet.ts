import type { NodeDefinition } from '@sim4d/types';

interface InletOutletParams {
  boundaryType: string;
  velocity: number;
  pressure: number;
  temperature: number;
}

interface InletOutletInputs {
  mesh: unknown;
  boundaryFaces: unknown;
}

interface InletOutletOutputs {
  boundaryMesh: unknown;
  boundaryData: unknown;
}

export const SimulationCFDInletOutletNode: NodeDefinition<
  InletOutletInputs,
  InletOutletOutputs,
  InletOutletParams
> = {
  id: 'Simulation::InletOutlet',
  type: 'Simulation::InletOutlet',
  category: 'Simulation',
  label: 'InletOutlet',
  description: 'Define inlet/outlet conditions',
  inputs: {
    mesh: {
      type: 'Mesh',
      label: 'Mesh',
      required: true,
    },
    boundaryFaces: {
      type: 'Face[]',
      label: 'Boundary Faces',
      required: true,
    },
  },
  outputs: {
    boundaryMesh: {
      type: 'Mesh',
      label: 'Boundary Mesh',
    },
    boundaryData: {
      type: 'Data',
      label: 'Boundary Data',
    },
  },
  params: {
    boundaryType: {
      type: 'enum',
      label: 'Boundary Type',
      default: 'velocity-inlet',
      options: [
        'velocity-inlet',
        'pressure-inlet',
        'mass-flow-inlet',
        'pressure-outlet',
        'outflow',
      ],
    },
    velocity: {
      type: 'number',
      label: 'Velocity',
      default: 1,
      min: 0,
      max: 1000,
    },
    pressure: {
      type: 'number',
      label: 'Pressure',
      default: 101325,
      min: 0,
      max: 10000000,
    },
    temperature: {
      type: 'number',
      label: 'Temperature',
      default: 293,
      min: 0,
      max: 1000,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'inletOutlet',
      params: {
        mesh: inputs.mesh,
        boundaryFaces: inputs.boundaryFaces,
        boundaryType: params.boundaryType,
        velocity: params.velocity,
        pressure: params.pressure,
        temperature: params.temperature,
      },
    });

    return {
      boundaryMesh: results.boundaryMesh,
      boundaryData: results.boundaryData,
    };
  },
};
