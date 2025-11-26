import type { NodeDefinition } from '@sim4d/types';

interface LeafSpringParams {
  leafCount: number;
  length: number;
  width: number;
  thickness: number;
  camber: number;
}

interface LeafSpringInputs {
  center: [number, number, number];
}

interface LeafSpringOutputs {
  assembly: unknown;
  leaves: unknown;
}

export const MechanicalEngineeringSpringsLeafSpringNode: NodeDefinition<
  LeafSpringInputs,
  LeafSpringOutputs,
  LeafSpringParams
> = {
  id: 'MechanicalEngineering::LeafSpring',
  type: 'MechanicalEngineering::LeafSpring',
  category: 'MechanicalEngineering',
  label: 'LeafSpring',
  description: 'Create leaf spring assembly',
  inputs: {
    center: {
      type: 'Point',
      label: 'Center',
      required: true,
    },
  },
  outputs: {
    assembly: {
      type: 'Shape',
      label: 'Assembly',
    },
    leaves: {
      type: 'Shape[]',
      label: 'Leaves',
    },
  },
  params: {
    leafCount: {
      type: 'number',
      label: 'Leaf Count',
      default: 5,
      min: 1,
      max: 10,
    },
    length: {
      type: 'number',
      label: 'Length',
      default: 500,
      min: 100,
      max: 1500,
    },
    width: {
      type: 'number',
      label: 'Width',
      default: 50,
      min: 20,
      max: 150,
    },
    thickness: {
      type: 'number',
      label: 'Thickness',
      default: 6,
      min: 3,
      max: 15,
    },
    camber: {
      type: 'number',
      label: 'Camber',
      default: 50,
      min: 0,
      max: 150,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'leafSpring',
      params: {
        center: inputs.center,
        leafCount: params.leafCount,
        length: params.length,
        width: params.width,
        thickness: params.thickness,
        camber: params.camber,
      },
    });

    return {
      assembly: results.assembly,
      leaves: results.leaves,
    };
  },
};
