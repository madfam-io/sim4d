import type { NodeDefinition } from '@brepflow/types';

interface HexNutParams {
  size: string;
  height: number;
  style: string;
}

interface HexNutInputs {
  position: [number, number, number];
}

interface HexNutOutputs {
  nut: unknown;
  thread: unknown;
}

export const MechanicalEngineeringFastenersHexNutNode: NodeDefinition<
  HexNutInputs,
  HexNutOutputs,
  HexNutParams
> = {
  id: 'MechanicalEngineering::HexNut',
  category: 'MechanicalEngineering',
  label: 'HexNut',
  description: 'Create hexagonal nut',
  inputs: {
    position: {
      type: 'Point',
      label: 'Position',
      required: true,
    },
  },
  outputs: {
    nut: {
      type: 'Shape',
      label: 'Nut',
    },
    thread: {
      type: 'Wire',
      label: 'Thread',
    },
  },
  params: {
    size: {
      type: 'enum',
      label: 'Size',
      default: 'M6',
      options: ['M3', 'M4', 'M5', 'M6', 'M8', 'M10', 'M12'],
    },
    height: {
      type: 'number',
      label: 'Height',
      default: 5,
      min: 2,
      max: 20,
    },
    style: {
      type: 'enum',
      label: 'Style',
      default: 'standard',
      options: ['standard', 'nylon-insert', 'castle', 'wing'],
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'hexNut',
      params: {
        position: inputs.position,
        size: params.size,
        height: params.height,
        style: params.style,
      },
    });

    return {
      nut: results.nut,
      thread: results.thread,
    };
  },
};
