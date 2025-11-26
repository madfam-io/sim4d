import type { NodeDefinition } from '@sim4d/types';

interface StainedGlassWindowParams {
  pattern: string;
  leadWidth: number;
}

interface StainedGlassWindowInputs {
  opening: unknown;
  pattern?: unknown;
}

interface StainedGlassWindowOutputs {
  stainedGlass: unknown;
  leadCame: unknown;
}

export const ArchitectureWindowsStainedGlassWindowNode: NodeDefinition<
  StainedGlassWindowInputs,
  StainedGlassWindowOutputs,
  StainedGlassWindowParams
> = {
  id: 'Architecture::StainedGlassWindow',
  category: 'Architecture',
  label: 'StainedGlassWindow',
  description: 'Stained glass window',
  inputs: {
    opening: {
      type: 'Wire',
      label: 'Opening',
      required: true,
    },
    pattern: {
      type: 'Wire[]',
      label: 'Pattern',
      optional: true,
    },
  },
  outputs: {
    stainedGlass: {
      type: 'Shape',
      label: 'Stained Glass',
    },
    leadCame: {
      type: 'Wire[]',
      label: 'Lead Came',
    },
  },
  params: {
    pattern: {
      type: 'enum',
      label: 'Pattern',
      default: 'geometric',
      options: ['geometric', 'floral', 'abstract', 'pictorial'],
    },
    leadWidth: {
      type: 'number',
      label: 'Lead Width',
      default: 6,
      min: 4,
      max: 10,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'stainedGlassWindow',
      params: {
        opening: inputs.opening,
        pattern: inputs.pattern,
        pattern: params.pattern,
        leadWidth: params.leadWidth,
      },
    });

    return {
      stainedGlass: results.stainedGlass,
      leadCame: results.leadCame,
    };
  },
};
