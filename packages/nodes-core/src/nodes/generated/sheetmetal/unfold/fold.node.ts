import type { NodeDefinition } from '@sim4d/types';

interface FoldParams {
  foldSequence: string;
  partialFold: number;
}

interface FoldInputs {
  flatPattern: unknown;
  bendLines: unknown;
  bendAngles: unknown;
}

interface FoldOutputs {
  foldedShape: unknown;
}

export const SheetMetalUnfoldFoldNode: NodeDefinition<FoldInputs, FoldOutputs, FoldParams> = {
  id: 'SheetMetal::Fold',
  category: 'SheetMetal',
  label: 'Fold',
  description: 'Fold flat pattern to 3D',
  inputs: {
    flatPattern: {
      type: 'Shape',
      label: 'Flat Pattern',
      required: true,
    },
    bendLines: {
      type: 'Edge[]',
      label: 'Bend Lines',
      required: true,
    },
    bendAngles: {
      type: 'number[]',
      label: 'Bend Angles',
      required: true,
    },
  },
  outputs: {
    foldedShape: {
      type: 'Shape',
      label: 'Folded Shape',
    },
  },
  params: {
    foldSequence: {
      type: 'string',
      label: 'Fold Sequence',
      default: 'auto',
    },
    partialFold: {
      type: 'number',
      label: 'Partial Fold',
      default: 1,
      min: 0,
      max: 1,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'sheetFold',
      params: {
        flatPattern: inputs.flatPattern,
        bendLines: inputs.bendLines,
        bendAngles: inputs.bendAngles,
        foldSequence: params.foldSequence,
        partialFold: params.partialFold,
      },
    });

    return {
      foldedShape: result,
    };
  },
};
