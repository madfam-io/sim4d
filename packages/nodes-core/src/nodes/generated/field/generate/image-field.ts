import type { NodeDefinition } from '@sim4d/types';

interface ImageFieldParams {
  channel: string;
  scale: unknown;
  height: number;
}

interface ImageFieldInputs {
  image: unknown;
}

interface ImageFieldOutputs {
  field: unknown;
}

export const FieldGenerateImageFieldNode: NodeDefinition<
  ImageFieldInputs,
  ImageFieldOutputs,
  ImageFieldParams
> = {
  id: 'Field::ImageField',
  type: 'Field::ImageField',
  category: 'Field',
  label: 'ImageField',
  description: 'Field from image',
  inputs: {
    image: {
      type: 'Data',
      label: 'Image',
      required: true,
    },
  },
  outputs: {
    field: {
      type: 'ScalarField',
      label: 'Field',
    },
  },
  params: {
    channel: {
      type: 'enum',
      label: 'Channel',
      default: 'luminance',
      options: ['red', 'green', 'blue', 'alpha', 'luminance'],
    },
    scale: {
      type: 'vector2',
      label: 'Scale',
      default: [100, 100],
    },
    height: {
      type: 'number',
      label: 'Height',
      default: 10,
      min: 0,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'fieldImage',
      params: {
        image: inputs.image,
        channel: params.channel,
        scale: params.scale,
        height: params.height,
      },
    });

    return {
      field: result,
    };
  },
};
