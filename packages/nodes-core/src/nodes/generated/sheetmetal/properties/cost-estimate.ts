import type { NodeDefinition } from '@brepflow/types';

interface CostEstimateParams {
  materialCostPerKg: number;
  setupCost: number;
  bendCost: number;
  cutCostPerMeter: number;
}

interface CostEstimateInputs {
  sheet: unknown;
  quantity?: unknown;
}

interface CostEstimateOutputs {
  cost: unknown;
  breakdown: unknown;
}

export const SheetMetalPropertiesCostEstimateNode: NodeDefinition<
  CostEstimateInputs,
  CostEstimateOutputs,
  CostEstimateParams
> = {
  id: 'SheetMetal::CostEstimate',
  type: 'SheetMetal::CostEstimate',
  category: 'SheetMetal',
  label: 'CostEstimate',
  description: 'Estimate manufacturing cost',
  inputs: {
    sheet: {
      type: 'Shape',
      label: 'Sheet',
      required: true,
    },
    quantity: {
      type: 'number',
      label: 'Quantity',
      optional: true,
    },
  },
  outputs: {
    cost: {
      type: 'number',
      label: 'Cost',
    },
    breakdown: {
      type: 'Data',
      label: 'Breakdown',
    },
  },
  params: {
    materialCostPerKg: {
      type: 'number',
      label: 'Material Cost Per Kg',
      default: 2,
      min: 0.1,
      max: 1000,
    },
    setupCost: {
      type: 'number',
      label: 'Setup Cost',
      default: 50,
      min: 0,
      max: 10000,
    },
    bendCost: {
      type: 'number',
      label: 'Bend Cost',
      default: 0.5,
      min: 0,
      max: 100,
    },
    cutCostPerMeter: {
      type: 'number',
      label: 'Cut Cost Per Meter',
      default: 1,
      min: 0,
      max: 100,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'sheetCostEstimate',
      params: {
        sheet: inputs.sheet,
        quantity: inputs.quantity,
        materialCostPerKg: params.materialCostPerKg,
        setupCost: params.setupCost,
        bendCost: params.bendCost,
        cutCostPerMeter: params.cutCostPerMeter,
      },
    });

    return {
      cost: results.cost,
      breakdown: results.breakdown,
    };
  },
};
