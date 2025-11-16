import type { NodeDefinition } from '@brepflow/types';

interface TimingPulleyParams {
  pitch: string;
  teeth: number;
  width: number;
  flanges: boolean;
}

interface TimingPulleyInputs {
  center: [number, number, number];
}

interface TimingPulleyOutputs {
  pulley: unknown;
  pitchCircle: unknown;
}

export const MechanicalEngineeringGearsTimingPulleyNode: NodeDefinition<
  TimingPulleyInputs,
  TimingPulleyOutputs,
  TimingPulleyParams
> = {
  id: 'MechanicalEngineering::TimingPulley',
  type: 'MechanicalEngineering::TimingPulley',
  category: 'MechanicalEngineering',
  label: 'TimingPulley',
  description: 'Create timing belt pulley',
  inputs: {
    center: {
      type: 'Point',
      label: 'Center',
      required: true,
    },
  },
  outputs: {
    pulley: {
      type: 'Shape',
      label: 'Pulley',
    },
    pitchCircle: {
      type: 'Wire',
      label: 'Pitch Circle',
    },
  },
  params: {
    pitch: {
      type: 'enum',
      label: 'Pitch',
      default: 'GT2',
      options: ['MXL', 'XL', 'L', 'H', 'T2.5', 'T5', 'T10', 'GT2'],
    },
    teeth: {
      type: 'number',
      label: 'Teeth',
      default: 20,
      min: 10,
      max: 100,
    },
    width: {
      type: 'number',
      label: 'Width',
      default: 10,
      min: 6,
      max: 50,
    },
    flanges: {
      type: 'boolean',
      label: 'Flanges',
      default: true,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'timingPulley',
      params: {
        center: inputs.center,
        pitch: params.pitch,
        teeth: params.teeth,
        width: params.width,
        flanges: params.flanges,
      },
    });

    return {
      pulley: results.pulley,
      pitchCircle: results.pitchCircle,
    };
  },
};
