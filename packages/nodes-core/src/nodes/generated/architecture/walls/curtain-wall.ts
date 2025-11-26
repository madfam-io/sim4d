import type { NodeDefinition } from '@sim4d/types';

interface CurtainWallParams {
  gridU: number;
  gridV: number;
  mullionWidth: number;
  mullionDepth: number;
}

interface CurtainWallInputs {
  surface: unknown;
}

interface CurtainWallOutputs {
  curtainWall: unknown;
  mullions: unknown;
  panels: unknown;
}

export const ArchitectureWallsCurtainWallNode: NodeDefinition<
  CurtainWallInputs,
  CurtainWallOutputs,
  CurtainWallParams
> = {
  id: 'Architecture::CurtainWall',
  type: 'Architecture::CurtainWall',
  category: 'Architecture',
  label: 'CurtainWall',
  description: 'Glass curtain wall system',
  inputs: {
    surface: {
      type: 'Face',
      label: 'Surface',
      required: true,
    },
  },
  outputs: {
    curtainWall: {
      type: 'Shape',
      label: 'Curtain Wall',
    },
    mullions: {
      type: 'Shape[]',
      label: 'Mullions',
    },
    panels: {
      type: 'Face[]',
      label: 'Panels',
    },
  },
  params: {
    gridU: {
      type: 'number',
      label: 'Grid U',
      default: 1500,
      min: 500,
      max: 3000,
    },
    gridV: {
      type: 'number',
      label: 'Grid V',
      default: 1500,
      min: 500,
      max: 3000,
    },
    mullionWidth: {
      type: 'number',
      label: 'Mullion Width',
      default: 50,
      min: 20,
      max: 200,
    },
    mullionDepth: {
      type: 'number',
      label: 'Mullion Depth',
      default: 100,
      min: 50,
      max: 300,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'curtainWall',
      params: {
        surface: inputs.surface,
        gridU: params.gridU,
        gridV: params.gridV,
        mullionWidth: params.mullionWidth,
        mullionDepth: params.mullionDepth,
      },
    });

    return {
      curtainWall: results.curtainWall,
      mullions: results.mullions,
      panels: results.panels,
    };
  },
};
