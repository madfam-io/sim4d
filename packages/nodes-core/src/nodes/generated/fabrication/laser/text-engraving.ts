import type { NodeDefinition } from '@sim4d/types';

interface TextEngravingParams {
  font: string;
  height: number;
}

interface TextEngravingInputs {
  text: unknown;
  position: [number, number, number];
}

interface TextEngravingOutputs {
  textPaths: unknown;
}

export const FabricationLaserTextEngravingNode: NodeDefinition<
  TextEngravingInputs,
  TextEngravingOutputs,
  TextEngravingParams
> = {
  id: 'Fabrication::TextEngraving',
  type: 'Fabrication::TextEngraving',
  category: 'Fabrication',
  label: 'TextEngraving',
  description: 'Optimize text for engraving',
  inputs: {
    text: {
      type: 'Data',
      label: 'Text',
      required: true,
    },
    position: {
      type: 'Point',
      label: 'Position',
      required: true,
    },
  },
  outputs: {
    textPaths: {
      type: 'Wire[]',
      label: 'Text Paths',
    },
  },
  params: {
    font: {
      type: 'enum',
      label: 'Font',
      default: 'single-line',
      options: ['single-line', 'outline', 'filled'],
    },
    height: {
      type: 'number',
      label: 'Height',
      default: 10,
      min: 1,
      max: 100,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'textEngraving',
      params: {
        text: inputs.text,
        position: inputs.position,
        font: params.font,
        height: params.height,
      },
    });

    return {
      textPaths: result,
    };
  },
};
