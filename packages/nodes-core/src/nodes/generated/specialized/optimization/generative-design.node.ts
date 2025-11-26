import type { NodeDefinition } from '@sim4d/types';

interface GenerativeDesignParams {
  objectives: unknown;
  generations: number;
  populationSize: number;
}

interface GenerativeDesignInputs {
  designSpace: unknown;
  requirements: unknown;
}

interface GenerativeDesignOutputs {
  designs: unknown;
  paretoFront: unknown;
}

export const SpecializedOptimizationGenerativeDesignNode: NodeDefinition<
  GenerativeDesignInputs,
  GenerativeDesignOutputs,
  GenerativeDesignParams
> = {
  id: 'Specialized::GenerativeDesign',
  category: 'Specialized',
  label: 'GenerativeDesign',
  description: 'AI-driven generative design',
  inputs: {
    designSpace: {
      type: 'Shape',
      label: 'Design Space',
      required: true,
    },
    requirements: {
      type: 'Data',
      label: 'Requirements',
      required: true,
    },
  },
  outputs: {
    designs: {
      type: 'Shape[]',
      label: 'Designs',
    },
    paretoFront: {
      type: 'Data',
      label: 'Pareto Front',
    },
  },
  params: {
    objectives: {
      type: 'string[]',
      label: 'Objectives',
      default: ['weight', 'strength'],
    },
    generations: {
      type: 'number',
      label: 'Generations',
      default: 20,
      min: 5,
      max: 100,
      step: 5,
    },
    populationSize: {
      type: 'number',
      label: 'Population Size',
      default: 50,
      min: 10,
      max: 500,
      step: 10,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'generativeDesign',
      params: {
        designSpace: inputs.designSpace,
        requirements: inputs.requirements,
        objectives: params.objectives,
        generations: params.generations,
        populationSize: params.populationSize,
      },
    });

    return {
      designs: results.designs,
      paretoFront: results.paretoFront,
    };
  },
};
