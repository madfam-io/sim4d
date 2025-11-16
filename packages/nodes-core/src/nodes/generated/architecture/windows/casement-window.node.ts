import type { NodeDefinition } from '@brepflow/types';

interface CasementWindowParams {
  width: number;
  height: number;
  hinge: string;
  opening: number;
}

interface CasementWindowInputs {
  position: [number, number, number];
}

interface CasementWindowOutputs {
  window: unknown;
  frame: unknown;
  glass: unknown;
}

export const ArchitectureWindowsCasementWindowNode: NodeDefinition<
  CasementWindowInputs,
  CasementWindowOutputs,
  CasementWindowParams
> = {
  id: 'Architecture::CasementWindow',
  category: 'Architecture',
  label: 'CasementWindow',
  description: 'Casement window',
  inputs: {
    position: {
      type: 'Point',
      label: 'Position',
      required: true,
    },
  },
  outputs: {
    window: {
      type: 'Shape',
      label: 'Window',
    },
    frame: {
      type: 'Shape',
      label: 'Frame',
    },
    glass: {
      type: 'Face',
      label: 'Glass',
    },
  },
  params: {
    width: {
      type: 'number',
      label: 'Width',
      default: 600,
      min: 400,
      max: 1200,
    },
    height: {
      type: 'number',
      label: 'Height',
      default: 1200,
      min: 600,
      max: 2000,
    },
    hinge: {
      type: 'enum',
      label: 'Hinge',
      default: 'left',
      options: ['left', 'right', 'top'],
    },
    opening: {
      type: 'number',
      label: 'Opening',
      default: 0,
      min: 0,
      max: 90,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'casementWindow',
      params: {
        position: inputs.position,
        width: params.width,
        height: params.height,
        hinge: params.hinge,
        opening: params.opening,
      },
    });

    return {
      window: results.window,
      frame: results.frame,
      glass: results.glass,
    };
  },
};
