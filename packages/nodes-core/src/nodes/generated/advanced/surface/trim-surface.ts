import type { NodeDefinition } from '@sim4d/types';

interface TrimSurfaceParams {
  keepRegion: string;
  projectCurves: boolean;
}

interface TrimSurfaceInputs {
  surface: unknown;
  trimmingCurves: unknown;
}

interface TrimSurfaceOutputs {
  trimmedSurface: unknown;
}

export const AdvancedSurfaceTrimSurfaceNode: NodeDefinition<
  TrimSurfaceInputs,
  TrimSurfaceOutputs,
  TrimSurfaceParams
> = {
  id: 'Advanced::TrimSurface',
  type: 'Advanced::TrimSurface',
  category: 'Advanced',
  label: 'TrimSurface',
  description: 'Trim surface with curves',
  inputs: {
    surface: {
      type: 'Face',
      label: 'Surface',
      required: true,
    },
    trimmingCurves: {
      type: 'Wire[]',
      label: 'Trimming Curves',
      required: true,
    },
  },
  outputs: {
    trimmedSurface: {
      type: 'Face',
      label: 'Trimmed Surface',
    },
  },
  params: {
    keepRegion: {
      type: 'enum',
      label: 'Keep Region',
      default: 'inside',
      options: ['inside', 'outside'],
    },
    projectCurves: {
      type: 'boolean',
      label: 'Project Curves',
      default: true,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'trimSurface',
      params: {
        surface: inputs.surface,
        trimmingCurves: inputs.trimmingCurves,
        keepRegion: params.keepRegion,
        projectCurves: params.projectCurves,
      },
    });

    return {
      trimmedSurface: result,
    };
  },
};
