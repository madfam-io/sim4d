import type { NodeDefinition, ShapeHandle } from '@sim4d/types';

export const FileInputNode: NodeDefinition<
  Record<string, never>,
  { content: string },
  { path: string }
> = {
  id: 'IO::FileInput',
  category: 'IO',
  label: 'File Input',
  description: 'Read file content',
  inputs: {},
  outputs: {
    content: { type: 'string' },
  },
  params: {
    path: {
      type: 'string',
      label: 'File Path',
      default: '',
    },
  },
  async evaluate(ctx, inputs, params) {
    if (!params.path) {
      throw new Error('File path is required');
    }

    const result = await ctx.worker.invoke('READ_FILE', {
      path: params.path,
    });
    return { content: result };
  },
};

export const ImportSTEPNode: NodeDefinition<
  Record<string, never>,
  { shapes: ShapeHandle[] },
  { filepath: string }
> = {
  id: 'IO::ImportSTEP',
  category: 'IO',
  label: 'Import STEP',
  description: 'Import STEP file',
  inputs: {},
  outputs: {
    shapes: { type: 'Shape', multiple: true },
  },
  params: {
    filepath: {
      type: 'string',
      label: 'File Path',
      default: '',
    },
  },
  async evaluate(ctx, inputs, params) {
    if (!params.filepath) {
      throw new Error('File path is required');
    }

    const result = await ctx.worker.invoke('IMPORT_STEP', {
      filepath: params.filepath,
    });
    return { shapes: result };
  },
};

export const ExportSTEPNode: NodeDefinition<
  { shapes: ShapeHandle[] },
  { success: boolean },
  { filepath: string; asAssembly?: boolean }
> = {
  id: 'IO::ExportSTEP',
  category: 'IO',
  label: 'Export STEP',
  description: 'Export shapes to STEP file',
  inputs: {
    shapes: { type: 'Shape', multiple: true },
  },
  outputs: {
    success: { type: 'Boolean' },
  },
  params: {
    filepath: {
      type: 'string',
      label: 'File Path',
      default: 'output.step',
    },
    asAssembly: {
      type: 'boolean',
      label: 'As Assembly',
      default: false,
    },
  },
  async evaluate(ctx, inputs, params) {
    if (!inputs.shapes || inputs.shapes.length === 0) {
      throw new Error('No shapes to export');
    }

    await ctx.worker.invoke('EXPORT_STEP', {
      shapes: inputs.shapes,
      filepath: params.filepath,
      asAssembly: params.asAssembly,
    });
    return { success: true };
  },
};

export const ExportSTLNode: NodeDefinition<
  { shape: ShapeHandle },
  { success: boolean },
  { filepath: string; binary?: boolean; deflection?: number }
> = {
  id: 'IO::ExportSTL',
  category: 'IO',
  label: 'Export STL',
  description: 'Export shape to STL file',
  inputs: {
    shape: { type: 'Shape' },
  },
  outputs: {
    success: { type: 'Boolean' },
  },
  params: {
    filepath: {
      type: 'string',
      label: 'File Path',
      default: 'output.stl',
    },
    binary: {
      type: 'boolean',
      label: 'Binary Format',
      default: true,
    },
    deflection: {
      type: 'number',
      label: 'Deflection',
      default: 0.1,
      min: 0.001,
      max: 10,
    },
  },
  async evaluate(ctx, inputs, params) {
    await ctx.worker.invoke('EXPORT_STL', {
      shape: inputs.shape,
      filepath: params.filepath,
      binary: params.binary,
      deflection: params.deflection,
    });
    return { success: true };
  },
};

export const ioNodes = [ImportSTEPNode, ExportSTEPNode, ExportSTLNode];
