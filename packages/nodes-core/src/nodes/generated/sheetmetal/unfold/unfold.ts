import type { NodeDefinition } from '@brepflow/types';

interface UnfoldParams {
  kFactor: number;
  bendAllowance: number;
  autoRelief: boolean;
}

interface UnfoldInputs {
  foldedShape: unknown;
  fixedFace?: unknown;
}

interface UnfoldOutputs {
  flatPattern: unknown;
  bendLines: unknown;
  bendTable: unknown;
}

export const SheetMetalUnfoldUnfoldNode: NodeDefinition<UnfoldInputs, UnfoldOutputs, UnfoldParams> =
  {
    id: 'SheetMetal::Unfold',
    type: 'SheetMetal::Unfold',
    category: 'SheetMetal',
    label: 'Unfold',
    description: 'Unfold sheet metal to flat pattern',
    inputs: {
      foldedShape: {
        type: 'Shape',
        label: 'Folded Shape',
        required: true,
      },
      fixedFace: {
        type: 'Face',
        label: 'Fixed Face',
        optional: true,
      },
    },
    outputs: {
      flatPattern: {
        type: 'Shape',
        label: 'Flat Pattern',
      },
      bendLines: {
        type: 'Edge[]',
        label: 'Bend Lines',
      },
      bendTable: {
        type: 'Data',
        label: 'Bend Table',
      },
    },
    params: {
      kFactor: {
        type: 'number',
        label: 'K Factor',
        default: 0.44,
        min: 0,
        max: 1,
      },
      bendAllowance: {
        type: 'number',
        label: 'Bend Allowance',
        default: 0,
        min: -10,
        max: 10,
      },
      autoRelief: {
        type: 'boolean',
        label: 'Auto Relief',
        default: true,
      },
    },
    async evaluate(context, inputs, params) {
      const results = await context.geometry.execute({
        type: 'sheetUnfold',
        params: {
          foldedShape: inputs.foldedShape,
          fixedFace: inputs.fixedFace,
          kFactor: params.kFactor,
          bendAllowance: params.bendAllowance,
          autoRelief: params.autoRelief,
        },
      });

      return {
        flatPattern: results.flatPattern,
        bendLines: results.bendLines,
        bendTable: results.bendTable,
      };
    },
  };
