import type { NodeDefinition } from '@sim4d/types';

interface PillowBlockParams {
  shaftDiameter: number;
  mountingHoles: number;
  baseWidth: number;
  height: number;
}

interface PillowBlockInputs {
  position: [number, number, number];
}

interface PillowBlockOutputs {
  housing: unknown;
  bearing: unknown;
  mountingPoints: Array<[number, number, number]>;
}

export const MechanicalEngineeringBearingsPillowBlockNode: NodeDefinition<
  PillowBlockInputs,
  PillowBlockOutputs,
  PillowBlockParams
> = {
  id: 'MechanicalEngineering::PillowBlock',
  category: 'MechanicalEngineering',
  label: 'PillowBlock',
  description: 'Create pillow block bearing housing',
  inputs: {
    position: {
      type: 'Point',
      label: 'Position',
      required: true,
    },
  },
  outputs: {
    housing: {
      type: 'Shape',
      label: 'Housing',
    },
    bearing: {
      type: 'Shape',
      label: 'Bearing',
    },
    mountingPoints: {
      type: 'Point[]',
      label: 'Mounting Points',
    },
  },
  params: {
    shaftDiameter: {
      type: 'number',
      label: 'Shaft Diameter',
      default: 20,
      min: 8,
      max: 100,
    },
    mountingHoles: {
      type: 'number',
      label: 'Mounting Holes',
      default: 2,
      min: 2,
      max: 4,
    },
    baseWidth: {
      type: 'number',
      label: 'Base Width',
      default: 80,
      min: 30,
      max: 200,
    },
    height: {
      type: 'number',
      label: 'Height',
      default: 50,
      min: 20,
      max: 150,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'pillowBlock',
      params: {
        position: inputs.position,
        shaftDiameter: params.shaftDiameter,
        mountingHoles: params.mountingHoles,
        baseWidth: params.baseWidth,
        height: params.height,
      },
    });

    return {
      housing: results.housing,
      bearing: results.bearing,
      mountingPoints: results.mountingPoints,
    };
  },
};
