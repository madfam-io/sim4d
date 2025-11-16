import type { NodeDefinition } from '@brepflow/types';

interface FoldingDoorParams {
  panels: number;
  foldDirection: string;
}

interface FoldingDoorInputs {
  opening: unknown;
}

interface FoldingDoorOutputs {
  foldingDoor: unknown;
}

export const ArchitectureDoorsFoldingDoorNode: NodeDefinition<
  FoldingDoorInputs,
  FoldingDoorOutputs,
  FoldingDoorParams
> = {
  id: 'Architecture::FoldingDoor',
  category: 'Architecture',
  label: 'FoldingDoor',
  description: 'Bi-fold door system',
  inputs: {
    opening: {
      type: 'Wire',
      label: 'Opening',
      required: true,
    },
  },
  outputs: {
    foldingDoor: {
      type: 'Shape[]',
      label: 'Folding Door',
    },
  },
  params: {
    panels: {
      type: 'number',
      label: 'Panels',
      default: 4,
      min: 2,
      max: 8,
      step: 2,
    },
    foldDirection: {
      type: 'enum',
      label: 'Fold Direction',
      default: 'left',
      options: ['left', 'right', 'center'],
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'foldingDoor',
      params: {
        opening: inputs.opening,
        panels: params.panels,
        foldDirection: params.foldDirection,
      },
    });

    return {
      foldingDoor: result,
    };
  },
};
