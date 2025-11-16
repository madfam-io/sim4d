import type { NodeDefinition } from '@brepflow/types';

interface OverheadDoorParams {
  sections: number;
  trackType: string;
}

interface OverheadDoorInputs {
  opening: unknown;
}

interface OverheadDoorOutputs {
  overheadDoor: unknown;
  tracks: unknown;
}

export const ArchitectureDoorsOverheadDoorNode: NodeDefinition<
  OverheadDoorInputs,
  OverheadDoorOutputs,
  OverheadDoorParams
> = {
  id: 'Architecture::OverheadDoor',
  category: 'Architecture',
  label: 'OverheadDoor',
  description: 'Overhead sectional door',
  inputs: {
    opening: {
      type: 'Wire',
      label: 'Opening',
      required: true,
    },
  },
  outputs: {
    overheadDoor: {
      type: 'Shape',
      label: 'Overhead Door',
    },
    tracks: {
      type: 'Wire[]',
      label: 'Tracks',
    },
  },
  params: {
    sections: {
      type: 'number',
      label: 'Sections',
      default: 4,
      min: 3,
      max: 6,
      step: 1,
    },
    trackType: {
      type: 'enum',
      label: 'Track Type',
      default: 'standard',
      options: ['standard', 'low-headroom', 'high-lift'],
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'overheadDoor',
      params: {
        opening: inputs.opening,
        sections: params.sections,
        trackType: params.trackType,
      },
    });

    return {
      overheadDoor: results.overheadDoor,
      tracks: results.tracks,
    };
  },
};
