import type { NodeDefinition } from '@brepflow/types';

interface GothicWindowParams {
  style: string;
  tracery: boolean;
}

interface GothicWindowInputs {
  opening: unknown;
}

interface GothicWindowOutputs {
  gothicWindow: unknown;
  tracery: unknown;
}

export const ArchitectureWindowsGothicWindowNode: NodeDefinition<
  GothicWindowInputs,
  GothicWindowOutputs,
  GothicWindowParams
> = {
  id: 'Architecture::GothicWindow',
  category: 'Architecture',
  label: 'GothicWindow',
  description: 'Gothic arch window',
  inputs: {
    opening: {
      type: 'Wire',
      label: 'Opening',
      required: true,
    },
  },
  outputs: {
    gothicWindow: {
      type: 'Shape',
      label: 'Gothic Window',
    },
    tracery: {
      type: 'Wire[]',
      label: 'Tracery',
    },
  },
  params: {
    style: {
      type: 'enum',
      label: 'Style',
      default: 'equilateral',
      options: ['lancet', 'equilateral', 'flamboyant', 'perpendicular'],
    },
    tracery: {
      type: 'boolean',
      label: 'Tracery',
      default: true,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'gothicWindow',
      params: {
        opening: inputs.opening,
        style: params.style,
        tracery: params.tracery,
      },
    });

    return {
      gothicWindow: results.gothicWindow,
      tracery: results.tracery,
    };
  },
};
