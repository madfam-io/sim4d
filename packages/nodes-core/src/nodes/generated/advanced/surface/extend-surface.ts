import type { NodeDefinition } from '@sim4d/types';

interface ExtendSurfaceParams {
  extensionLength: number;
  extensionType: string;
}

interface ExtendSurfaceInputs {
  surface: unknown;
  edges: unknown;
}

interface ExtendSurfaceOutputs {
  extendedSurface: unknown;
}

export const AdvancedSurfaceExtendSurfaceNode: NodeDefinition<
  ExtendSurfaceInputs,
  ExtendSurfaceOutputs,
  ExtendSurfaceParams
> = {
  id: 'Advanced::ExtendSurface',
  type: 'Advanced::ExtendSurface',
  category: 'Advanced',
  label: 'ExtendSurface',
  description: 'Extend surface edges',
  inputs: {
    surface: {
      type: 'Face',
      label: 'Surface',
      required: true,
    },
    edges: {
      type: 'Edge[]',
      label: 'Edges',
      required: true,
    },
  },
  outputs: {
    extendedSurface: {
      type: 'Face',
      label: 'Extended Surface',
    },
  },
  params: {
    extensionLength: {
      type: 'number',
      label: 'Extension Length',
      default: 10,
      min: 0.1,
      max: 1000,
    },
    extensionType: {
      type: 'enum',
      label: 'Extension Type',
      default: 'natural',
      options: ['linear', 'natural', 'reflective'],
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'extendSurface',
      params: {
        surface: inputs.surface,
        edges: inputs.edges,
        extensionLength: params.extensionLength,
        extensionType: params.extensionType,
      },
    });

    return {
      extendedSurface: result,
    };
  },
};
