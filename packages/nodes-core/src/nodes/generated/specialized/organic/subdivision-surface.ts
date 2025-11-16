import type { NodeDefinition } from '@brepflow/types';

interface SubdivisionSurfaceParams {
  scheme: string;
  levels: number;
}

interface SubdivisionSurfaceInputs {
  controlMesh: unknown;
}

interface SubdivisionSurfaceOutputs {
  subdivided: unknown;
}

export const SpecializedOrganicSubdivisionSurfaceNode: NodeDefinition<
  SubdivisionSurfaceInputs,
  SubdivisionSurfaceOutputs,
  SubdivisionSurfaceParams
> = {
  id: 'Specialized::SubdivisionSurface',
  type: 'Specialized::SubdivisionSurface',
  category: 'Specialized',
  label: 'SubdivisionSurface',
  description: 'Subdivision surface modeling',
  inputs: {
    controlMesh: {
      type: 'Shape',
      label: 'Control Mesh',
      required: true,
    },
  },
  outputs: {
    subdivided: {
      type: 'Shape',
      label: 'Subdivided',
    },
  },
  params: {
    scheme: {
      type: 'enum',
      label: 'Scheme',
      default: 'catmull-clark',
      options: ['catmull-clark', 'loop', 'doo-sabin'],
    },
    levels: {
      type: 'number',
      label: 'Levels',
      default: 2,
      min: 1,
      max: 5,
      step: 1,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'subdivisionSurface',
      params: {
        controlMesh: inputs.controlMesh,
        scheme: params.scheme,
        levels: params.levels,
      },
    });

    return {
      subdivided: result,
    };
  },
};
