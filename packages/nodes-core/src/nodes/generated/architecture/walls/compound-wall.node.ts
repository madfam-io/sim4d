import type { NodeDefinition } from '@brepflow/types';

interface CompoundWallParams {
  layers: number;
  layerThicknesses: string;
  layerMaterials: string;
}

interface CompoundWallInputs {
  path: unknown;
}

interface CompoundWallOutputs {
  compoundWall: unknown;
  layers: unknown;
}

export const ArchitectureWallsCompoundWallNode: NodeDefinition<
  CompoundWallInputs,
  CompoundWallOutputs,
  CompoundWallParams
> = {
  id: 'Architecture::CompoundWall',
  category: 'Architecture',
  label: 'CompoundWall',
  description: 'Multi-layer wall assembly',
  inputs: {
    path: {
      type: 'Wire',
      label: 'Path',
      required: true,
    },
  },
  outputs: {
    compoundWall: {
      type: 'Shape',
      label: 'Compound Wall',
    },
    layers: {
      type: 'Shape[]',
      label: 'Layers',
    },
  },
  params: {
    layers: {
      type: 'number',
      label: 'Layers',
      default: 3,
      min: 1,
      max: 10,
      step: 1,
    },
    layerThicknesses: {
      type: 'string',
      label: 'Layer Thicknesses',
      default: '100,50,100',
    },
    layerMaterials: {
      type: 'string',
      label: 'Layer Materials',
      default: 'brick,insulation,drywall',
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'compoundWall',
      params: {
        path: inputs.path,
        layers: params.layers,
        layerThicknesses: params.layerThicknesses,
        layerMaterials: params.layerMaterials,
      },
    });

    return {
      compoundWall: results.compoundWall,
      layers: results.layers,
    };
  },
};
