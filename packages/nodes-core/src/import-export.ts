import type { NodeDefinition, ShapeHandle } from '@brepflow/types';

export const ImportSTEPNode: NodeDefinition<
  Record<string, never>,
  { shapes: ShapeHandle[] },
  { filePath: string; units: string; healGeometry: boolean }
> = {
  id: 'ImportExport::ImportSTEP',
  category: 'Import/Export',
  label: 'Import STEP',
  description: 'Import shapes from STEP file format',
  inputs: {},
  outputs: {
    shapes: { type: 'Shape', multiple: true },
  },
  params: {
    filePath: {
      type: 'string',
      label: 'File Path',
      default: '',
    },
    units: {
      type: 'string',
      label: 'Units',
      default: 'mm',
      options: ['mm', 'cm', 'm', 'in', 'ft'],
    },
    healGeometry: {
      type: 'boolean',
      label: 'Heal Geometry',
      default: true,
    },
  },
  async evaluate(ctx, inputs, params) {
    const result = await ctx.worker.invoke('IMPORT_STEP', {
      filePath: params.filePath,
      units: params.units,
      healGeometry: params.healGeometry,
    });
    return { shapes: result };
  },
};

export const ImportIGESNode: NodeDefinition<
  Record<string, never>,
  { shapes: ShapeHandle[] },
  { filePath: string; units: string; healGeometry: boolean }
> = {
  id: 'ImportExport::ImportIGES',
  category: 'Import/Export',
  label: 'Import IGES',
  description: 'Import shapes from IGES file format',
  inputs: {},
  outputs: {
    shapes: { type: 'Shape', multiple: true },
  },
  params: {
    filePath: {
      type: 'string',
      label: 'File Path',
      default: '',
    },
    units: {
      type: 'string',
      label: 'Units',
      default: 'mm',
      options: ['mm', 'cm', 'm', 'in', 'ft'],
    },
    healGeometry: {
      type: 'boolean',
      label: 'Heal Geometry',
      default: true,
    },
  },
  async evaluate(ctx, inputs, params) {
    const result = await ctx.worker.invoke('IMPORT_IGES', {
      filePath: params.filePath,
      units: params.units,
      healGeometry: params.healGeometry,
    });
    return { shapes: result };
  },
};

export const ImportSTLNode: NodeDefinition<
  Record<string, never>,
  { mesh: any },
  { filePath: string; units: string }
> = {
  id: 'ImportExport::ImportSTL',
  category: 'Import/Export',
  label: 'Import STL',
  description: 'Import mesh from STL file format',
  inputs: {},
  outputs: {
    mesh: { type: 'Mesh' },
  },
  params: {
    filePath: {
      type: 'string',
      label: 'File Path',
      default: '',
    },
    units: {
      type: 'string',
      label: 'Units',
      default: 'mm',
      options: ['mm', 'cm', 'm', 'in', 'ft'],
    },
  },
  async evaluate(ctx, inputs, params) {
    const result = await ctx.worker.invoke('IMPORT_STL', {
      filePath: params.filePath,
      units: params.units,
    });
    return { mesh: result };
  },
};

export const ExportSTEPNode: NodeDefinition<
  { shapes: ShapeHandle[] },
  { result: any },
  { filePath: string; units: string; precision: string }
> = {
  id: 'ImportExport::ExportSTEP',
  category: 'Import/Export',
  label: 'Export STEP',
  description: 'Export shapes to STEP file format',
  inputs: {
    shapes: { type: 'Shape', multiple: true },
  },
  outputs: {
    result: { type: 'Any' },
  },
  params: {
    filePath: {
      type: 'string',
      label: 'File Path',
      default: 'output.step',
    },
    units: {
      type: 'string',
      label: 'Units',
      default: 'mm',
      options: ['mm', 'cm', 'm', 'in', 'ft'],
    },
    precision: {
      type: 'string',
      label: 'Precision',
      default: 'standard',
      options: ['low', 'standard', 'high', 'very_high'],
    },
  },
  async evaluate(ctx, inputs, params) {
    const result = await ctx.worker.invoke('EXPORT_STEP', {
      shapes: inputs.shapes,
      filePath: params.filePath,
      units: params.units,
      precision: params.precision,
    });
    return { result };
  },
};

export const ExportIGESNode: NodeDefinition<
  { shapes: ShapeHandle[] },
  { result: any },
  { filePath: string; units: string; version: string }
> = {
  id: 'ImportExport::ExportIGES',
  category: 'Import/Export',
  label: 'Export IGES',
  description: 'Export shapes to IGES file format',
  inputs: {
    shapes: { type: 'Shape', multiple: true },
  },
  outputs: {
    result: { type: 'Any' },
  },
  params: {
    filePath: {
      type: 'string',
      label: 'File Path',
      default: 'output.iges',
    },
    units: {
      type: 'string',
      label: 'Units',
      default: 'mm',
      options: ['mm', 'cm', 'm', 'in', 'ft'],
    },
    version: {
      type: 'string',
      label: 'IGES Version',
      default: '214',
      options: ['203', '214'],
    },
  },
  async evaluate(ctx, inputs, params) {
    const result = await ctx.worker.invoke('EXPORT_IGES', {
      shapes: inputs.shapes,
      filePath: params.filePath,
      units: params.units,
      version: params.version,
    });
    return { result };
  },
};

export const ExportSTLNode: NodeDefinition<
  { shapes: ShapeHandle[] },
  { result: any },
  { filePath: string; quality: string; binary: boolean }
> = {
  id: 'ImportExport::ExportSTL',
  category: 'Import/Export',
  label: 'Export STL',
  description: 'Export shapes to STL mesh format',
  inputs: {
    shapes: { type: 'Shape', multiple: true },
  },
  outputs: {
    result: { type: 'Any' },
  },
  params: {
    filePath: {
      type: 'string',
      label: 'File Path',
      default: 'output.stl',
    },
    quality: {
      type: 'string',
      label: 'Mesh Quality',
      default: 'standard',
      options: ['low', 'standard', 'high', 'very_high'],
    },
    binary: {
      type: 'boolean',
      label: 'Binary Format',
      default: true,
    },
  },
  async evaluate(ctx, inputs, params) {
    const result = await ctx.worker.invoke('EXPORT_STL', {
      shapes: inputs.shapes,
      filePath: params.filePath,
      quality: params.quality,
      binary: params.binary,
    });
    return { result };
  },
};

export const ExportOBJNode: NodeDefinition<
  { shapes: ShapeHandle[] },
  { result: any },
  { filePath: string; includeNormals: boolean; includeTextures: boolean }
> = {
  id: 'ImportExport::ExportOBJ',
  category: 'Import/Export',
  label: 'Export OBJ',
  description: 'Export shapes to OBJ mesh format',
  inputs: {
    shapes: { type: 'Shape', multiple: true },
  },
  outputs: {
    result: { type: 'Any' },
  },
  params: {
    filePath: {
      type: 'string',
      label: 'File Path',
      default: 'output.obj',
    },
    includeNormals: {
      type: 'boolean',
      label: 'Include Normals',
      default: true,
    },
    includeTextures: {
      type: 'boolean',
      label: 'Include Texture Coordinates',
      default: false,
    },
  },
  async evaluate(ctx, inputs, params) {
    const result = await ctx.worker.invoke('EXPORT_OBJ', {
      shapes: inputs.shapes,
      filePath: params.filePath,
      includeNormals: params.includeNormals,
      includeTextures: params.includeTextures,
    });
    return { result };
  },
};

export const importExportNodes = [
  ImportSTEPNode,
  ImportIGESNode,
  ImportSTLNode,
  ExportSTEPNode,
  ExportIGESNode,
  ExportSTLNode,
  ExportOBJNode,
];
