import type { NodeDefinition } from '@brepflow/types';

interface StretchCeilingParams {
  fabricType: string;
  backlighting: boolean;
}

interface StretchCeilingInputs {
  ceilingBoundary: unknown;
}

interface StretchCeilingOutputs {
  stretchCeiling: unknown;
  track: unknown;
}

export const ArchitectureCeilingsStretchCeilingNode: NodeDefinition<
  StretchCeilingInputs,
  StretchCeilingOutputs,
  StretchCeilingParams
> = {
  id: 'Architecture::StretchCeiling',
  category: 'Architecture',
  label: 'StretchCeiling',
  description: 'Stretch fabric ceiling',
  inputs: {
    ceilingBoundary: {
      type: 'Wire',
      label: 'Ceiling Boundary',
      required: true,
    },
  },
  outputs: {
    stretchCeiling: {
      type: 'Face',
      label: 'Stretch Ceiling',
    },
    track: {
      type: 'Wire',
      label: 'Track',
    },
  },
  params: {
    fabricType: {
      type: 'enum',
      label: 'Fabric Type',
      default: 'matte',
      options: ['matte', 'satin', 'gloss', 'translucent'],
    },
    backlighting: {
      type: 'boolean',
      label: 'Backlighting',
      default: false,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'stretchCeiling',
      params: {
        ceilingBoundary: inputs.ceilingBoundary,
        fabricType: params.fabricType,
        backlighting: params.backlighting,
      },
    });

    return {
      stretchCeiling: results.stretchCeiling,
      track: results.track,
    };
  },
};
