import type { NodeDefinition } from '@brepflow/types';

interface SurfaceBoundaryParams {
  includeHoles: boolean;
  simplify: boolean;
}

interface SurfaceBoundaryInputs {
  surface: unknown;
}

interface SurfaceBoundaryOutputs {
  outerBoundary: unknown;
  innerBoundaries: unknown;
  allBoundaries: unknown;
}

export const AnalysisSurfacesSurfaceBoundaryNode: NodeDefinition<
  SurfaceBoundaryInputs,
  SurfaceBoundaryOutputs,
  SurfaceBoundaryParams
> = {
  id: 'Analysis::SurfaceBoundary',
  type: 'Analysis::SurfaceBoundary',
  category: 'Analysis',
  label: 'SurfaceBoundary',
  description: 'Extract surface boundary curves',
  inputs: {
    surface: {
      type: 'Face',
      label: 'Surface',
      required: true,
    },
  },
  outputs: {
    outerBoundary: {
      type: 'Wire',
      label: 'Outer Boundary',
    },
    innerBoundaries: {
      type: 'Wire[]',
      label: 'Inner Boundaries',
    },
    allBoundaries: {
      type: 'Wire[]',
      label: 'All Boundaries',
    },
  },
  params: {
    includeHoles: {
      type: 'boolean',
      label: 'Include Holes',
      default: true,
    },
    simplify: {
      type: 'boolean',
      label: 'Simplify',
      default: false,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'surfaceBoundary',
      params: {
        surface: inputs.surface,
        includeHoles: params.includeHoles,
        simplify: params.simplify,
      },
    });

    return {
      outerBoundary: results.outerBoundary,
      innerBoundaries: results.innerBoundaries,
      allBoundaries: results.allBoundaries,
    };
  },
};
