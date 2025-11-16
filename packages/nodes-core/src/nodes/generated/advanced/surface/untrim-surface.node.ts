import type { NodeDefinition } from '@brepflow/types';

interface UntrimSurfaceParams {
  keepHoles: boolean;
}

interface UntrimSurfaceInputs {
  trimmedSurface: unknown;
}

interface UntrimSurfaceOutputs {
  untrimmedSurface: unknown;
}

export const AdvancedSurfaceUntrimSurfaceNode: NodeDefinition<
  UntrimSurfaceInputs,
  UntrimSurfaceOutputs,
  UntrimSurfaceParams
> = {
  id: 'Advanced::UntrimSurface',
  category: 'Advanced',
  label: 'UntrimSurface',
  description: 'Remove trimming from surface',
  inputs: {
    trimmedSurface: {
      type: 'Face',
      label: 'Trimmed Surface',
      required: true,
    },
  },
  outputs: {
    untrimmedSurface: {
      type: 'Face',
      label: 'Untrimmed Surface',
    },
  },
  params: {
    keepHoles: {
      type: 'boolean',
      label: 'Keep Holes',
      default: false,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'untrimSurface',
      params: {
        trimmedSurface: inputs.trimmedSurface,
        keepHoles: params.keepHoles,
      },
    });

    return {
      untrimmedSurface: result,
    };
  },
};
