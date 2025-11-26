import type { NodeDefinition } from '@sim4d/types';

interface BoundaryLayersParams {
  firstLayerHeight: number;
  growthRate: number;
  numberOfLayers: number;
  transitionRatio: number;
}

interface BoundaryLayersInputs {
  mesh: unknown;
  wallFaces: unknown;
}

interface BoundaryLayersOutputs {
  layeredMesh: unknown;
}

export const SimulationCFDBoundaryLayersNode: NodeDefinition<
  BoundaryLayersInputs,
  BoundaryLayersOutputs,
  BoundaryLayersParams
> = {
  id: 'Simulation::BoundaryLayers',
  type: 'Simulation::BoundaryLayers',
  category: 'Simulation',
  label: 'BoundaryLayers',
  description: 'Add boundary layer mesh',
  inputs: {
    mesh: {
      type: 'Mesh',
      label: 'Mesh',
      required: true,
    },
    wallFaces: {
      type: 'Face[]',
      label: 'Wall Faces',
      required: true,
    },
  },
  outputs: {
    layeredMesh: {
      type: 'Mesh',
      label: 'Layered Mesh',
    },
  },
  params: {
    firstLayerHeight: {
      type: 'number',
      label: 'First Layer Height',
      default: 0.01,
      min: 0.0001,
      max: 1,
    },
    growthRate: {
      type: 'number',
      label: 'Growth Rate',
      default: 1.2,
      min: 1,
      max: 2,
    },
    numberOfLayers: {
      type: 'number',
      label: 'Number Of Layers',
      default: 5,
      min: 1,
      max: 20,
      step: 1,
    },
    transitionRatio: {
      type: 'number',
      label: 'Transition Ratio',
      default: 0.5,
      min: 0.1,
      max: 1,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'boundaryLayers',
      params: {
        mesh: inputs.mesh,
        wallFaces: inputs.wallFaces,
        firstLayerHeight: params.firstLayerHeight,
        growthRate: params.growthRate,
        numberOfLayers: params.numberOfLayers,
        transitionRatio: params.transitionRatio,
      },
    });

    return {
      layeredMesh: result,
    };
  },
};
