import type { NodeDefinition } from '@brepflow/types';

interface HealShapeParams {
  tolerance: number;
  fixSmallEdges: boolean;
  fixSmallFaces: boolean;
  sewFaces: boolean;
  makeManifold: boolean;
}

interface HealShapeInputs {
  shape: unknown;
}

interface HealShapeOutputs {
  healed: unknown;
  report: unknown;
}

export const AdvancedHealingHealShapeNode: NodeDefinition<
  HealShapeInputs,
  HealShapeOutputs,
  HealShapeParams
> = {
  id: 'Advanced::HealShape',
  category: 'Advanced',
  label: 'HealShape',
  description: 'Repair geometric errors',
  inputs: {
    shape: {
      type: 'Shape',
      label: 'Shape',
      required: true,
    },
  },
  outputs: {
    healed: {
      type: 'Shape',
      label: 'Healed',
    },
    report: {
      type: 'Data',
      label: 'Report',
    },
  },
  params: {
    tolerance: {
      type: 'number',
      label: 'Tolerance',
      default: 0.01,
      min: 0.0001,
      max: 1,
    },
    fixSmallEdges: {
      type: 'boolean',
      label: 'Fix Small Edges',
      default: true,
    },
    fixSmallFaces: {
      type: 'boolean',
      label: 'Fix Small Faces',
      default: true,
    },
    sewFaces: {
      type: 'boolean',
      label: 'Sew Faces',
      default: true,
    },
    makeManifold: {
      type: 'boolean',
      label: 'Make Manifold',
      default: false,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'healShape',
      params: {
        shape: inputs.shape,
        tolerance: params.tolerance,
        fixSmallEdges: params.fixSmallEdges,
        fixSmallFaces: params.fixSmallFaces,
        sewFaces: params.sewFaces,
        makeManifold: params.makeManifold,
      },
    });

    return {
      healed: results.healed,
      report: results.report,
    };
  },
};
