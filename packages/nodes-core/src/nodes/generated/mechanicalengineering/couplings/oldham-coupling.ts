import type { NodeDefinition } from '@brepflow/types';

interface OldhamCouplingParams {
  hubDiameter: number;
  discDiameter: number;
  slotWidth: number;
  totalLength: number;
}

interface OldhamCouplingInputs {
  center: [number, number, number];
}

interface OldhamCouplingOutputs {
  assembly: unknown;
  hubs: unknown;
  disc: unknown;
}

export const MechanicalEngineeringCouplingsOldhamCouplingNode: NodeDefinition<
  OldhamCouplingInputs,
  OldhamCouplingOutputs,
  OldhamCouplingParams
> = {
  id: 'MechanicalEngineering::OldhamCoupling',
  type: 'MechanicalEngineering::OldhamCoupling',
  category: 'MechanicalEngineering',
  label: 'OldhamCoupling',
  description: 'Create Oldham coupling',
  inputs: {
    center: {
      type: 'Point',
      label: 'Center',
      required: true,
    },
  },
  outputs: {
    assembly: {
      type: 'Shape',
      label: 'Assembly',
    },
    hubs: {
      type: 'Shape[]',
      label: 'Hubs',
    },
    disc: {
      type: 'Shape',
      label: 'Disc',
    },
  },
  params: {
    hubDiameter: {
      type: 'number',
      label: 'Hub Diameter',
      default: 40,
      min: 20,
      max: 100,
    },
    discDiameter: {
      type: 'number',
      label: 'Disc Diameter',
      default: 35,
      min: 15,
      max: 90,
    },
    slotWidth: {
      type: 'number',
      label: 'Slot Width',
      default: 8,
      min: 3,
      max: 20,
    },
    totalLength: {
      type: 'number',
      label: 'Total Length',
      default: 40,
      min: 20,
      max: 100,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'oldhamCoupling',
      params: {
        center: inputs.center,
        hubDiameter: params.hubDiameter,
        discDiameter: params.discDiameter,
        slotWidth: params.slotWidth,
        totalLength: params.totalLength,
      },
    });

    return {
      assembly: results.assembly,
      hubs: results.hubs,
      disc: results.disc,
    };
  },
};
