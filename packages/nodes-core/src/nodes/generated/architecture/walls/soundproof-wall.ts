import type { NodeDefinition } from '@brepflow/types';

interface SoundproofWallParams {
  stcRating: number;
  massLayers: number;
}

interface SoundproofWallInputs {
  wallPath: unknown;
}

interface SoundproofWallOutputs {
  acousticWall: unknown;
}

export const ArchitectureWallsSoundproofWallNode: NodeDefinition<
  SoundproofWallInputs,
  SoundproofWallOutputs,
  SoundproofWallParams
> = {
  id: 'Architecture::SoundproofWall',
  type: 'Architecture::SoundproofWall',
  category: 'Architecture',
  label: 'SoundproofWall',
  description: 'Acoustic wall assembly',
  inputs: {
    wallPath: {
      type: 'Wire',
      label: 'Wall Path',
      required: true,
    },
  },
  outputs: {
    acousticWall: {
      type: 'Shape',
      label: 'Acoustic Wall',
    },
  },
  params: {
    stcRating: {
      type: 'number',
      label: 'Stc Rating',
      default: 50,
      min: 30,
      max: 80,
    },
    massLayers: {
      type: 'number',
      label: 'Mass Layers',
      default: 2,
      min: 1,
      max: 4,
      step: 1,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'soundproofWall',
      params: {
        wallPath: inputs.wallPath,
        stcRating: params.stcRating,
        massLayers: params.massLayers,
      },
    });

    return {
      acousticWall: result,
    };
  },
};
