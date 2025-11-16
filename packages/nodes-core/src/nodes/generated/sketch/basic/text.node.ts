import type { NodeDefinition } from '@brepflow/types';

interface TextParams {
  text: string;
  font: string;
  size: number;
  bold: boolean;
  italic: boolean;
  x: number;
  y: number;
}

type TextInputs = Record<string, never>;

interface TextOutputs {
  shape: unknown;
}

export const SketchBasicTextNode: NodeDefinition<TextInputs, TextOutputs, TextParams> = {
  id: 'Sketch::Text',
  category: 'Sketch',
  label: 'Text',
  description: 'Create text as geometry',
  inputs: {},
  outputs: {
    shape: {
      type: 'Shape',
      label: 'Shape',
    },
  },
  params: {
    text: {
      type: 'string',
      label: 'Text',
      default: 'Text',
    },
    font: {
      type: 'string',
      label: 'Font',
      default: 'Arial',
    },
    size: {
      type: 'number',
      label: 'Size',
      default: 20,
      min: 1,
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
    x: {
      type: 'number',
      label: 'X',
      default: 0,
      min: -10000,
      max: 10000,
    },
    y: {
      type: 'number',
      label: 'Y',
      default: 0,
      min: -10000,
      max: 10000,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'makeText',
      params: {
        text: params.text,
        font: params.font,
        size: params.size,
        bold: params.bold,
        italic: params.italic,
        x: params.x,
        y: params.y,
      },
    });

    return {
      shape: result,
    };
  },
};
