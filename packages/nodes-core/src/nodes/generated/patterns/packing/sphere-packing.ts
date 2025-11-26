import type { NodeDefinition } from '@sim4d/types';

interface SpherePackingParams {
  packingType: string;
}

interface SpherePackingInputs {
  container: unknown;
  radius: unknown;
}

interface SpherePackingOutputs {
  centers: Array<[number, number, number]>;
  spheres: unknown;
}

export const PatternsPackingSpherePackingNode: NodeDefinition<
  SpherePackingInputs,
  SpherePackingOutputs,
  SpherePackingParams
> = {
  id: 'Patterns::SpherePacking',
  type: 'Patterns::SpherePacking',
  category: 'Patterns',
  label: 'SpherePacking',
  description: '3D sphere packing',
  inputs: {
    container: {
      type: 'Shape',
      label: 'Container',
      required: true,
    },
    radius: {
      type: 'number',
      label: 'Radius',
      required: true,
    },
  },
  outputs: {
    centers: {
      type: 'Point[]',
      label: 'Centers',
    },
    spheres: {
      type: 'Shape[]',
      label: 'Spheres',
    },
  },
  params: {
    packingType: {
      type: 'enum',
      label: 'Packing Type',
      default: 'hexagonal',
      options: ['cubic', 'hexagonal', 'random', 'optimal'],
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'spherePacking',
      params: {
        container: inputs.container,
        radius: inputs.radius,
        packingType: params.packingType,
      },
    });

    return {
      centers: results.centers,
      spheres: results.spheres,
    };
  },
};
