import type { NodeDefinition } from '@brepflow/types';

interface Text3DParams {
  text: string;
  font: string;
  size: number;
  height: number;
  bold: boolean;
  italic: boolean;
}

interface Text3DInputs {
  position?: [number, number, number];
  direction?: [number, number, number];
}

interface Text3DOutputs {
  text: unknown;
}

export const SpecializedTextText3DNode: NodeDefinition<Text3DInputs, Text3DOutputs, Text3DParams> =
  {
    id: 'Specialized::Text3D',
    category: 'Specialized',
    label: 'Text3D',
    description: 'Create 3D text',
    inputs: {
      position: {
        type: 'Point',
        label: 'Position',
        optional: true,
      },
      direction: {
        type: 'Vector',
        label: 'Direction',
        optional: true,
      },
    },
    outputs: {
      text: {
        type: 'Shape',
        label: 'Text',
      },
    },
    params: {
      text: {
        type: 'string',
        label: 'Text',
        default: 'HELLO',
      },
      font: {
        type: 'enum',
        label: 'Font',
        default: 'Arial',
        options: ['Arial', 'Helvetica', 'Times', 'Courier'],
      },
      size: {
        type: 'number',
        label: 'Size',
        default: 20,
        min: 1,
        max: 1000,
      },
      height: {
        type: 'number',
        label: 'Height',
        default: 5,
        min: 0.1,
        max: 1000,
      },
      bold: {
        type: 'boolean',
        label: 'Bold',
        default: false,
      },
      italic: {
        type: 'boolean',
        label: 'Italic',
        default: false,
      },
    },
    async evaluate(context, inputs, params) {
      const result = await context.geometry.execute({
        type: 'text3D',
        params: {
          position: inputs.position,
          direction: inputs.direction,
          text: params.text,
          font: params.font,
          size: params.size,
          height: params.height,
          bold: params.bold,
          italic: params.italic,
        },
      });

      return {
        text: result,
      };
    },
  };
