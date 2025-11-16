import type { NodeDefinition } from '@brepflow/types';

interface AdditiveManufacturingParams {
  nozzleSize: number;
  layerHeight: number;
}

interface AdditiveManufacturingInputs {
  printPaths: unknown;
}

interface AdditiveManufacturingOutputs {
  roboticPrintPath: unknown;
}

export const FabricationRoboticsAdditiveManufacturingNode: NodeDefinition<
  AdditiveManufacturingInputs,
  AdditiveManufacturingOutputs,
  AdditiveManufacturingParams
> = {
  id: 'Fabrication::AdditiveManufacturing',
  category: 'Fabrication',
  label: 'AdditiveManufacturing',
  description: 'Robotic 3D printing',
  inputs: {
    printPaths: {
      type: 'Wire[]',
      label: 'Print Paths',
      required: true,
    },
  },
  outputs: {
    roboticPrintPath: {
      type: 'Transform[]',
      label: 'Robotic Print Path',
    },
  },
  params: {
    nozzleSize: {
      type: 'number',
      label: 'Nozzle Size',
      default: 4,
      min: 0.4,
      max: 10,
    },
    layerHeight: {
      type: 'number',
      label: 'Layer Height',
      default: 2,
      min: 0.1,
      max: 5,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'additiveManufacturing',
      params: {
        printPaths: inputs.printPaths,
        nozzleSize: params.nozzleSize,
        layerHeight: params.layerHeight,
      },
    });

    return {
      roboticPrintPath: result,
    };
  },
};
