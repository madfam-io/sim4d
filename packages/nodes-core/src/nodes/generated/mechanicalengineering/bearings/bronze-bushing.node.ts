import type { NodeDefinition } from '@sim4d/types';

interface BronzeBushingParams {
  innerDiameter: number;
  outerDiameter: number;
  length: number;
  oilGrooves: boolean;
  flanged: boolean;
}

interface BronzeBushingInputs {
  center: [number, number, number];
}

interface BronzeBushingOutputs {
  bushing: unknown;
  grooves: unknown;
}

export const MechanicalEngineeringBearingsBronzeBushingNode: NodeDefinition<
  BronzeBushingInputs,
  BronzeBushingOutputs,
  BronzeBushingParams
> = {
  id: 'MechanicalEngineering::BronzeBushing',
  category: 'MechanicalEngineering',
  label: 'BronzeBushing',
  description: 'Create bronze bushing',
  inputs: {
    center: {
      type: 'Point',
      label: 'Center',
      required: true,
    },
  },
  outputs: {
    bushing: {
      type: 'Shape',
      label: 'Bushing',
    },
    grooves: {
      type: 'Wire[]',
      label: 'Grooves',
    },
  },
  params: {
    innerDiameter: {
      type: 'number',
      label: 'Inner Diameter',
      default: 10,
      min: 3,
      max: 100,
    },
    outerDiameter: {
      type: 'number',
      label: 'Outer Diameter',
      default: 14,
      min: 5,
      max: 120,
    },
    length: {
      type: 'number',
      label: 'Length',
      default: 15,
      min: 5,
      max: 100,
    },
    oilGrooves: {
      type: 'boolean',
      label: 'Oil Grooves',
      default: true,
    },
    flanged: {
      type: 'boolean',
      label: 'Flanged',
      default: false,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'bronzeBushing',
      params: {
        center: inputs.center,
        innerDiameter: params.innerDiameter,
        outerDiameter: params.outerDiameter,
        length: params.length,
        oilGrooves: params.oilGrooves,
        flanged: params.flanged,
      },
    });

    return {
      bushing: results.bushing,
      grooves: results.grooves,
    };
  },
};
