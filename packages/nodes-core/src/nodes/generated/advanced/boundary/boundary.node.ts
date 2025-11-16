import type { NodeDefinition } from '@brepflow/types';

interface BoundaryParams {
  type: string;
  tangencyType: string;
}

interface BoundaryInputs {
  curves: unknown;
  tangentFaces?: unknown;
}

interface BoundaryOutputs {
  shape: unknown;
}

export const AdvancedBoundaryBoundaryNode: NodeDefinition<
  BoundaryInputs,
  BoundaryOutputs,
  BoundaryParams
> = {
  id: 'Advanced::Boundary',
  category: 'Advanced',
  label: 'Boundary',
  description: 'Create surface from boundary curves',
  inputs: {
    curves: {
      type: 'Wire[]',
      label: 'Curves',
      required: true,
    },
    tangentFaces: {
      type: 'Face[]',
      label: 'Tangent Faces',
      optional: true,
    },
  },
  outputs: {
    shape: {
      type: 'Shape',
      label: 'Shape',
    },
  },
  params: {
    type: {
      type: 'enum',
      label: 'Type',
      default: 'surface',
      options: ['surface', 'solid'],
    },
    tangencyType: {
      type: 'enum',
      label: 'Tangency Type',
      default: 'none',
      options: ['none', 'tangent', 'curvature'],
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'boundary',
      params: {
        curves: inputs.curves,
        tangentFaces: inputs.tangentFaces,
        type: params.type,
        tangencyType: params.tangencyType,
      },
    });

    return {
      shape: result,
    };
  },
};
