import type { NodeDefinition } from '@brepflow/types';

interface TopologyOptimizerParams {
  densityElements: number;
  volumeFraction: number;
  penalization: number;
  filter: boolean;
}

interface TopologyOptimizerInputs {
  designDomain: unknown;
  loads: unknown;
  supports: unknown;
}

interface TopologyOptimizerOutputs {
  optimizedShape: unknown;
  densityField: unknown;
  compliance: unknown;
}

export const AlgorithmicOptimizationTopologyOptimizerNode: NodeDefinition<
  TopologyOptimizerInputs,
  TopologyOptimizerOutputs,
  TopologyOptimizerParams
> = {
  id: 'Algorithmic::TopologyOptimizer',
  category: 'Algorithmic',
  label: 'TopologyOptimizer',
  description: 'Topology optimization for structures',
  inputs: {
    designDomain: {
      type: 'Shape',
      label: 'Design Domain',
      required: true,
    },
    loads: {
      type: 'Properties[]',
      label: 'Loads',
      required: true,
    },
    supports: {
      type: 'Properties[]',
      label: 'Supports',
      required: true,
    },
  },
  outputs: {
    optimizedShape: {
      type: 'Shape',
      label: 'Optimized Shape',
    },
    densityField: {
      type: 'Properties',
      label: 'Density Field',
    },
    compliance: {
      type: 'number',
      label: 'Compliance',
    },
  },
  params: {
    densityElements: {
      type: 'number',
      label: 'Density Elements',
      default: 100,
      min: 10,
      max: 1000,
    },
    volumeFraction: {
      type: 'number',
      label: 'Volume Fraction',
      default: 0.5,
      min: 0.1,
      max: 0.9,
    },
    penalization: {
      type: 'number',
      label: 'Penalization',
      default: 3,
      min: 1,
      max: 5,
    },
    filter: {
      type: 'boolean',
      label: 'Filter',
      default: true,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'topologyOptimizer',
      params: {
        designDomain: inputs.designDomain,
        loads: inputs.loads,
        supports: inputs.supports,
        densityElements: params.densityElements,
        volumeFraction: params.volumeFraction,
        penalization: params.penalization,
        filter: params.filter,
      },
    });

    return {
      optimizedShape: results.optimizedShape,
      densityField: results.densityField,
      compliance: results.compliance,
    };
  },
};
