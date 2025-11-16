import type { NodeDefinition } from '@brepflow/types';

interface WrapParams {
  wrapType: string;
  depth: number;
}

interface WrapInputs {
  targetSurface: unknown;
  sketch: unknown;
  projectionDirection?: [number, number, number];
}

interface WrapOutputs {
  wrappedShape: unknown;
}

export const AdvancedFeaturesWrapNode: NodeDefinition<WrapInputs, WrapOutputs, WrapParams> = {
  id: 'Advanced::Wrap',
  type: 'Advanced::Wrap',
  category: 'Advanced',
  label: 'Wrap',
  description: 'Wrap geometry onto surface',
  inputs: {
    targetSurface: {
      type: 'Face',
      label: 'Target Surface',
      required: true,
    },
    sketch: {
      type: 'Wire',
      label: 'Sketch',
      required: true,
    },
    projectionDirection: {
      type: 'Vector',
      label: 'Projection Direction',
      optional: true,
    },
  },
  outputs: {
    wrappedShape: {
      type: 'Shape',
      label: 'Wrapped Shape',
    },
  },
  params: {
    wrapType: {
      type: 'enum',
      label: 'Wrap Type',
      default: 'emboss',
      options: ['scribe', 'emboss', 'deboss'],
    },
    depth: {
      type: 'number',
      label: 'Depth',
      default: 1,
      min: 0.01,
      max: 100,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'wrap',
      params: {
        targetSurface: inputs.targetSurface,
        sketch: inputs.sketch,
        projectionDirection: inputs.projectionDirection,
        wrapType: params.wrapType,
        depth: params.depth,
      },
    });

    return {
      wrappedShape: result,
    };
  },
};
