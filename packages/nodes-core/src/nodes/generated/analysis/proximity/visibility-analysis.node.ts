import type { NodeDefinition } from '@sim4d/types';

interface VisibilityAnalysisParams {
  viewAngle: number;
  maxDistance: number;
}

interface VisibilityAnalysisInputs {
  viewpoint: [number, number, number];
  targets: Array<[number, number, number]>;
  obstacles?: unknown;
}

interface VisibilityAnalysisOutputs {
  visibleTargets: Array<[number, number, number]>;
  occludedTargets: Array<[number, number, number]>;
  sightLines: unknown;
}

export const AnalysisProximityVisibilityAnalysisNode: NodeDefinition<
  VisibilityAnalysisInputs,
  VisibilityAnalysisOutputs,
  VisibilityAnalysisParams
> = {
  id: 'Analysis::VisibilityAnalysis',
  category: 'Analysis',
  label: 'VisibilityAnalysis',
  description: 'Analyze line-of-sight visibility',
  inputs: {
    viewpoint: {
      type: 'Point',
      label: 'Viewpoint',
      required: true,
    },
    targets: {
      type: 'Point[]',
      label: 'Targets',
      required: true,
    },
    obstacles: {
      type: 'Shape[]',
      label: 'Obstacles',
      optional: true,
    },
  },
  outputs: {
    visibleTargets: {
      type: 'Point[]',
      label: 'Visible Targets',
    },
    occludedTargets: {
      type: 'Point[]',
      label: 'Occluded Targets',
    },
    sightLines: {
      type: 'Wire[]',
      label: 'Sight Lines',
    },
  },
  params: {
    viewAngle: {
      type: 'number',
      label: 'View Angle',
      default: 120,
      min: 10,
      max: 360,
    },
    maxDistance: {
      type: 'number',
      label: 'Max Distance',
      default: 100,
      min: 1,
      max: 1000,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'visibilityAnalysis',
      params: {
        viewpoint: inputs.viewpoint,
        targets: inputs.targets,
        obstacles: inputs.obstacles,
        viewAngle: params.viewAngle,
        maxDistance: params.maxDistance,
      },
    });

    return {
      visibleTargets: results.visibleTargets,
      occludedTargets: results.occludedTargets,
      sightLines: results.sightLines,
    };
  },
};
