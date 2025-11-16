import type { NodeDefinition } from '@brepflow/types';

interface ProjectCurveParams {
  projectionDirection: [number, number, number];
  projectBoth: boolean;
}

interface ProjectCurveInputs {
  curve: unknown;
  surface: unknown;
}

interface ProjectCurveOutputs {
  projectedCurve: unknown;
}

export const SurfaceCurveOpsProjectCurveNode: NodeDefinition<
  ProjectCurveInputs,
  ProjectCurveOutputs,
  ProjectCurveParams
> = {
  id: 'Surface::ProjectCurve',
  category: 'Surface',
  label: 'ProjectCurve',
  description: 'Project curve onto surface',
  inputs: {
    curve: {
      type: 'Wire',
      label: 'Curve',
      required: true,
    },
    surface: {
      type: 'Face',
      label: 'Surface',
      required: true,
    },
  },
  outputs: {
    projectedCurve: {
      type: 'Wire',
      label: 'Projected Curve',
    },
  },
  params: {
    projectionDirection: {
      type: 'vec3',
      label: 'Projection Direction',
      default: [0, 0, -1],
    },
    projectBoth: {
      type: 'boolean',
      label: 'Project Both',
      default: false,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'projectCurve',
      params: {
        curve: inputs.curve,
        surface: inputs.surface,
        projectionDirection: params.projectionDirection,
        projectBoth: params.projectBoth,
      },
    });

    return {
      projectedCurve: result,
    };
  },
};
