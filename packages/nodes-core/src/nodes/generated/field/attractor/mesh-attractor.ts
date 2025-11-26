import type { NodeDefinition } from '@sim4d/types';

interface MeshAttractorParams {
  strength: number;
  radius: number;
  weightByArea: boolean;
}

interface MeshAttractorInputs {
  mesh: unknown;
}

interface MeshAttractorOutputs {
  field: unknown;
}

export const FieldAttractorMeshAttractorNode: NodeDefinition<
  MeshAttractorInputs,
  MeshAttractorOutputs,
  MeshAttractorParams
> = {
  id: 'Field::MeshAttractor',
  type: 'Field::MeshAttractor',
  category: 'Field',
  label: 'MeshAttractor',
  description: 'Mesh vertex attractor',
  inputs: {
    mesh: {
      type: 'Mesh',
      label: 'Mesh',
      required: true,
    },
  },
  outputs: {
    field: {
      type: 'ScalarField',
      label: 'Field',
    },
  },
  params: {
    strength: {
      type: 'number',
      label: 'Strength',
      default: 1,
      min: -10,
      max: 10,
    },
    radius: {
      type: 'number',
      label: 'Radius',
      default: 20,
      min: 0.1,
    },
    weightByArea: {
      type: 'boolean',
      label: 'Weight By Area',
      default: false,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'attractorMesh',
      params: {
        mesh: inputs.mesh,
        strength: params.strength,
        radius: params.radius,
        weightByArea: params.weightByArea,
      },
    });

    return {
      field: result,
    };
  },
};
