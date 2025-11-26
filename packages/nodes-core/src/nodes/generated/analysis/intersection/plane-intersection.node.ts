import type { NodeDefinition } from '@sim4d/types';

interface PlaneIntersectionParams {
  tolerance: number;
}

interface PlaneIntersectionInputs {
  geometry: unknown;
  plane: unknown;
}

interface PlaneIntersectionOutputs {
  intersectionCurves: unknown;
  sectionProfiles: unknown;
}

export const AnalysisIntersectionPlaneIntersectionNode: NodeDefinition<
  PlaneIntersectionInputs,
  PlaneIntersectionOutputs,
  PlaneIntersectionParams
> = {
  id: 'Analysis::PlaneIntersection',
  category: 'Analysis',
  label: 'PlaneIntersection',
  description: 'Intersect geometry with plane',
  inputs: {
    geometry: {
      type: 'Shape',
      label: 'Geometry',
      required: true,
    },
    plane: {
      type: 'Face',
      label: 'Plane',
      required: true,
    },
  },
  outputs: {
    intersectionCurves: {
      type: 'Wire[]',
      label: 'Intersection Curves',
    },
    sectionProfiles: {
      type: 'Wire[]',
      label: 'Section Profiles',
    },
  },
  params: {
    tolerance: {
      type: 'number',
      label: 'Tolerance',
      default: 0.01,
      min: 0.001,
      max: 1,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'planeIntersection',
      params: {
        geometry: inputs.geometry,
        plane: inputs.plane,
        tolerance: params.tolerance,
      },
    });

    return {
      intersectionCurves: results.intersectionCurves,
      sectionProfiles: results.sectionProfiles,
    };
  },
};
