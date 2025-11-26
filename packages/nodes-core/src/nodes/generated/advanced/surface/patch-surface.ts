import type { NodeDefinition } from '@sim4d/types';

interface PatchSurfaceParams {
  continuity: string;
  constraintType: string;
}

interface PatchSurfaceInputs {
  boundaryEdges: unknown;
  guideWires?: unknown;
}

interface PatchSurfaceOutputs {
  patch: unknown;
}

export const AdvancedSurfacePatchSurfaceNode: NodeDefinition<
  PatchSurfaceInputs,
  PatchSurfaceOutputs,
  PatchSurfaceParams
> = {
  id: 'Advanced::PatchSurface',
  type: 'Advanced::PatchSurface',
  category: 'Advanced',
  label: 'PatchSurface',
  description: 'Create patch surface',
  inputs: {
    boundaryEdges: {
      type: 'Edge[]',
      label: 'Boundary Edges',
      required: true,
    },
    guideWires: {
      type: 'Wire[]',
      label: 'Guide Wires',
      optional: true,
    },
  },
  outputs: {
    patch: {
      type: 'Face',
      label: 'Patch',
    },
  },
  params: {
    continuity: {
      type: 'enum',
      label: 'Continuity',
      default: 'G1',
      options: ['G0', 'G1', 'G2'],
    },
    constraintType: {
      type: 'enum',
      label: 'Constraint Type',
      default: 'tangent',
      options: ['none', 'tangent', 'curvature'],
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'patchSurface',
      params: {
        boundaryEdges: inputs.boundaryEdges,
        guideWires: inputs.guideWires,
        continuity: params.continuity,
        constraintType: params.constraintType,
      },
    });

    return {
      patch: result,
    };
  },
};
