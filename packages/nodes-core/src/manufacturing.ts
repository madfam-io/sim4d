import type { NodeDefinition, ShapeHandle, Vec3 } from '@sim4d/types';

export const ToolpathGenerationNode: NodeDefinition<
  { shape: ShapeHandle; tool?: unknown },
  { toolpath: unknown },
  {
    machiningOperation: string;
    toolDiameter: number;
    stepover: number;
    feedRate: number;
    spindleSpeed: number;
  }
> = {
  id: 'Manufacturing::ToolpathGeneration',
  category: 'Manufacturing',
  label: 'Toolpath Generation',
  description: 'Generate CNC machining toolpaths for manufacturing',
  inputs: {
    shape: { type: 'Shape' },
    tool: { type: 'Any', optional: true },
  },
  outputs: {
    toolpath: { type: 'Curve' },
  },
  params: {
    machiningOperation: {
      type: 'string',
      label: 'Machining Operation',
      default: 'roughing',
      options: ['roughing', 'finishing', 'drilling', 'pocketing', 'profiling', 'adaptive'],
    },
    toolDiameter: {
      type: 'number',
      label: 'Tool Diameter (mm)',
      default: 6.0,
      min: 0.1,
      max: 50.0,
    },
    stepover: {
      type: 'number',
      label: 'Stepover (%)',
      default: 50,
      min: 10,
      max: 90,
    },
    feedRate: {
      type: 'number',
      label: 'Feed Rate (mm/min)',
      default: 1000,
      min: 10,
      max: 10000,
    },
    spindleSpeed: {
      type: 'number',
      label: 'Spindle Speed (RPM)',
      default: 12000,
      min: 100,
      max: 50000,
    },
  },
  async evaluate(ctx, inputs, params) {
    const result = await ctx.worker.invoke('GENERATE_TOOLPATH', {
      shape: inputs.shape,
      tool: inputs.tool,
      machiningOperation: params.machiningOperation,
      toolDiameter: params.toolDiameter,
      stepover: params.stepover,
      feedRate: params.feedRate,
      spindleSpeed: params.spindleSpeed,
    });
    return { toolpath: result };
  },
};

export const PrintOptimizationNode: NodeDefinition<
  { shape: ShapeHandle },
  { optimizedShape: ShapeHandle; supports: ShapeHandle[] },
  {
    printTechnology: string;
    layerHeight: number;
    infillDensity: number;
    supportAngle: number;
    orientation: Vec3;
  }
> = {
  id: 'Manufacturing::PrintOptimization',
  category: 'Manufacturing',
  label: '3D Print Optimization',
  description: 'Optimize geometry for 3D printing and generate supports',
  inputs: {
    shape: { type: 'Shape' },
  },
  outputs: {
    optimizedShape: { type: 'Shape' },
    supports: { type: 'Shape', multiple: true },
  },
  params: {
    printTechnology: {
      type: 'string',
      label: 'Print Technology',
      default: 'FDM',
      options: ['FDM', 'SLA', 'SLS', 'DMLS', 'PolyJet'],
    },
    layerHeight: {
      type: 'number',
      label: 'Layer Height (mm)',
      default: 0.2,
      min: 0.05,
      max: 1.0,
    },
    infillDensity: {
      type: 'number',
      label: 'Infill Density (%)',
      default: 20,
      min: 0,
      max: 100,
    },
    supportAngle: {
      type: 'number',
      label: 'Support Angle (degrees)',
      default: 45,
      min: 15,
      max: 80,
    },
    orientation: {
      type: 'vec3',
      label: 'Print Orientation',
      default: { x: 0, y: 0, z: 1 },
    },
  },
  async evaluate(ctx, inputs, params) {
    const result = await ctx.worker.invoke('OPTIMIZE_FOR_PRINTING', {
      shape: inputs.shape,
      printTechnology: params.printTechnology,
      layerHeight: params.layerHeight,
      infillDensity: params.infillDensity,
      supportAngle: params.supportAngle,
      orientation: params.orientation,
    });
    return {
      optimizedShape: result.shape,
      supports: result.supports || [],
    };
  },
};

export const ManufacturingConstraintsNode: NodeDefinition<
  { shape: ShapeHandle },
  { validationResult: unknown },
  {
    manufacturingProcess: string;
    minWallThickness: number;
    maxAspectRatio: number;
    draftAngle: number;
    checkTolerances: boolean;
  }
> = {
  id: 'Manufacturing::ManufacturingConstraints',
  category: 'Manufacturing',
  label: 'Manufacturing Constraints',
  description: 'Validate design against manufacturing constraints',
  inputs: {
    shape: { type: 'Shape' },
  },
  outputs: {
    validationResult: { type: 'Any' },
  },
  params: {
    manufacturingProcess: {
      type: 'string',
      label: 'Manufacturing Process',
      default: 'machining',
      options: [
        'machining',
        'injection_molding',
        'die_casting',
        'forging',
        'sheet_metal',
        '3d_printing',
      ],
    },
    minWallThickness: {
      type: 'number',
      label: 'Min Wall Thickness (mm)',
      default: 1.0,
      min: 0.1,
      max: 10.0,
    },
    maxAspectRatio: {
      type: 'number',
      label: 'Max Aspect Ratio',
      default: 10.0,
      min: 1.0,
      max: 100.0,
    },
    draftAngle: {
      type: 'number',
      label: 'Required Draft Angle (degrees)',
      default: 1.0,
      min: 0.0,
      max: 10.0,
    },
    checkTolerances: {
      type: 'boolean',
      label: 'Check Manufacturing Tolerances',
      default: true,
    },
  },
  async evaluate(ctx, inputs, params) {
    const result = await ctx.worker.invoke('VALIDATE_MANUFACTURING_CONSTRAINTS', {
      shape: inputs.shape,
      manufacturingProcess: params.manufacturingProcess,
      minWallThickness: params.minWallThickness,
      maxAspectRatio: params.maxAspectRatio,
      draftAngle: params.draftAngle,
      checkTolerances: params.checkTolerances,
    });
    return { validationResult: result };
  },
};

export const MaterialWasteOptimizationNode: NodeDefinition<
  { shapes: ShapeHandle[] },
  { optimizedLayout: unknown },
  { materialDimensions: Vec3; nestingStrategy: string; margin: number; allowRotation: boolean }
> = {
  id: 'Manufacturing::MaterialWasteOptimization',
  category: 'Manufacturing',
  label: 'Material Waste Optimization',
  description: 'Optimize part layout to minimize material waste',
  inputs: {
    shapes: { type: 'Shape', multiple: true },
  },
  outputs: {
    optimizedLayout: { type: 'Any' },
  },
  params: {
    materialDimensions: {
      type: 'vec3',
      label: 'Material Dimensions',
      default: { x: 1000, y: 500, z: 25 },
    },
    nestingStrategy: {
      type: 'string',
      label: 'Nesting Strategy',
      default: 'bottom_left',
      options: ['bottom_left', 'genetic_algorithm', 'simulated_annealing', 'no_fit_polygon'],
    },
    margin: {
      type: 'number',
      label: 'Part Margin (mm)',
      default: 2.0,
      min: 0.0,
      max: 20.0,
    },
    allowRotation: {
      type: 'boolean',
      label: 'Allow Part Rotation',
      default: true,
    },
  },
  async evaluate(ctx, inputs, params) {
    const result = await ctx.worker.invoke('OPTIMIZE_MATERIAL_USAGE', {
      shapes: inputs.shapes,
      materialDimensions: params.materialDimensions,
      nestingStrategy: params.nestingStrategy,
      margin: params.margin,
      allowRotation: params.allowRotation,
    });
    return { optimizedLayout: result };
  },
};

export const CostEstimationNode: NodeDefinition<
  { shape: ShapeHandle },
  { costAnalysis: unknown },
  {
    manufacturingProcess: string;
    material: string;
    quantity: number;
    laborRate: number;
    machineRate: number;
  }
> = {
  id: 'Manufacturing::CostEstimation',
  category: 'Manufacturing',
  label: 'Production Cost Estimation',
  description: 'Estimate manufacturing costs and production time',
  inputs: {
    shape: { type: 'Shape' },
  },
  outputs: {
    costAnalysis: { type: 'Any' },
  },
  params: {
    manufacturingProcess: {
      type: 'string',
      label: 'Manufacturing Process',
      default: 'cnc_machining',
      options: ['cnc_machining', '3d_printing', 'injection_molding', 'sheet_metal', 'die_casting'],
    },
    material: {
      type: 'string',
      label: 'Material',
      default: 'aluminum_6061',
      options: [
        'aluminum_6061',
        'steel_1018',
        'stainless_316',
        'abs_plastic',
        'pla_plastic',
        'titanium_ti6al4v',
      ],
    },
    quantity: {
      type: 'number',
      label: 'Production Quantity',
      default: 1,
      min: 1,
      max: 100000,
    },
    laborRate: {
      type: 'number',
      label: 'Labor Rate ($/hour)',
      default: 50.0,
      min: 10.0,
      max: 200.0,
    },
    machineRate: {
      type: 'number',
      label: 'Machine Rate ($/hour)',
      default: 75.0,
      min: 20.0,
      max: 500.0,
    },
  },
  async evaluate(ctx, inputs, params) {
    const result = await ctx.worker.invoke('ESTIMATE_MANUFACTURING_COST', {
      shape: inputs.shape,
      manufacturingProcess: params.manufacturingProcess,
      material: params.material,
      quantity: params.quantity,
      laborRate: params.laborRate,
      machineRate: params.machineRate,
    });
    return { costAnalysis: result };
  },
};

export const QualityControlNode: NodeDefinition<
  { referenceShape: ShapeHandle; inspectionData?: unknown },
  { qualityReport: unknown },
  {
    toleranceType: string;
    toleranceValue: number;
    inspectionMethod: string;
    generateReport: boolean;
  }
> = {
  id: 'Manufacturing::QualityControl',
  category: 'Manufacturing',
  label: 'Quality Control',
  description: 'Quality control analysis and inspection validation',
  inputs: {
    referenceShape: { type: 'Shape' },
    inspectionData: { type: 'Any', optional: true },
  },
  outputs: {
    qualityReport: { type: 'Any' },
  },
  params: {
    toleranceType: {
      type: 'string',
      label: 'Tolerance Type',
      default: 'dimensional',
      options: ['dimensional', 'geometric', 'surface_finish', 'form', 'position'],
    },
    toleranceValue: {
      type: 'number',
      label: 'Tolerance Value (mm)',
      default: 0.1,
      min: 0.001,
      max: 10.0,
    },
    inspectionMethod: {
      type: 'string',
      label: 'Inspection Method',
      default: 'cmm',
      options: ['cmm', 'optical_scanner', 'laser_tracker', 'manual_measurement', 'vision_system'],
    },
    generateReport: {
      type: 'boolean',
      label: 'Generate Inspection Report',
      default: true,
    },
  },
  async evaluate(ctx, inputs, params) {
    const result = await ctx.worker.invoke('PERFORM_QUALITY_CONTROL', {
      referenceShape: inputs.referenceShape,
      inspectionData: inputs.inspectionData,
      toleranceType: params.toleranceType,
      toleranceValue: params.toleranceValue,
      inspectionMethod: params.inspectionMethod,
      generateReport: params.generateReport,
    });
    return { qualityReport: result };
  },
};

export const manufacturingNodes = [
  ToolpathGenerationNode,
  PrintOptimizationNode,
  ManufacturingConstraintsNode,
  MaterialWasteOptimizationNode,
  CostEstimationNode,
  QualityControlNode,
];
