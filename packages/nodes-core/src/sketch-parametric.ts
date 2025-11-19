/**
 * Parametric sketch nodes with constraint system integration
 * These enhanced nodes automatically register geometry with the constraint system
 */

import type {
import { createLogger } from '@brepflow/engine-core';

const logger = createLogger('NodesCore');
  NodeDefinition,
  Vec3,
  ShapeHandle,
  EvalContext,
  ConstraintElement,
  ConstraintInfo,
} from '@brepflow/types';

/**
 * Enhanced LineNode with constraint integration
 */
export const ParametricLineNode: NodeDefinition<
  { start?: Vec3; end?: Vec3 },
  { curve: ShapeHandle; constraints?: ConstraintInfo },
  { start: Vec3; end: Vec3; enableConstraints: boolean }
> = {
  id: 'Sketch::ParametricLine',
  category: 'Sketch',
  label: 'Parametric Line',
  description: 'Create a line with constraint system integration',
  inputs: {
    start: { type: 'Vector', optional: true },
    end: { type: 'Vector', optional: true },
  },
  outputs: {
    curve: { type: 'Curve' },
    constraints: { type: 'Any', optional: true },
  },
  params: {
    start: {
      type: 'vec3',
      label: 'Start Point',
      default: { x: 0, y: 0, z: 0 },
    },
    end: {
      type: 'vec3',
      label: 'End Point',
      default: { x: 100, y: 0, z: 0 },
    },
    enableConstraints: {
      type: 'boolean',
      label: 'Enable Constraints',
      default: true,
    },
  },
  async evaluate(ctx: EvalContext, inputs, params) {
    const start = inputs.start || params.start;
    const end = inputs.end || params.end;

    // Create geometry via OCCT
    const result = await ctx.worker.invoke('CREATE_LINE', { start, end });

    // Register with constraint system if available and enabled
    let constraintInfo: ConstraintInfo | undefined = undefined;

    if (params.enableConstraints && ctx.constraintManager) {
      try {
        // Create constraint elements
        const startPointId = `${ctx.nodeId}_start`;
        const endPointId = `${ctx.nodeId}_end`;
        const lineId = `${ctx.nodeId}_line`;

        // Register points with constraint manager
        ctx.constraintManager.createPoint(startPointId, start.x, start.y, false);
        ctx.constraintManager.createPoint(endPointId, end.x, end.y, false);

        // Register line with constraint manager
        ctx.constraintManager.createLine(lineId, startPointId, endPointId);

        // Create constraint elements for output
        const constraintElements: ConstraintElement[] = [
          {
            id: startPointId,
            type: 'point',
            data: { position: start, nodeId: ctx.nodeId, role: 'start' },
          },
          {
            id: endPointId,
            type: 'point',
            data: { position: end, nodeId: ctx.nodeId, role: 'end' },
          },
          {
            id: lineId,
            type: 'line',
            data: { start: startPointId, end: endPointId, nodeId: ctx.nodeId },
          },
        ];

        constraintInfo = {
          elements: constraintElements,
          activeConstraints: [], // No constraints added automatically
        };
      } catch (error) {
        logger.warn('Failed to register line with constraint system:', error);
      }
    }

    return {
      curve: result,
      ...(constraintInfo && { constraints: constraintInfo }),
    };
  },
};

/**
 * Enhanced CircleNode with constraint integration
 */
export const ParametricCircleNode: NodeDefinition<
  { center?: Vec3; normal?: Vec3 },
  { curve: ShapeHandle; constraints?: ConstraintInfo },
  { center: Vec3; radius: number; normal: Vec3; enableConstraints: boolean }
> = {
  id: 'Sketch::ParametricCircle',
  category: 'Sketch',
  label: 'Parametric Circle',
  description: 'Create a circle with constraint system integration',
  inputs: {
    center: { type: 'Vector', optional: true },
    normal: { type: 'Vector', optional: true },
  },
  outputs: {
    curve: { type: 'Curve' },
    constraints: { type: 'Any', optional: true },
  },
  params: {
    center: {
      type: 'vec3',
      label: 'Center',
      default: { x: 0, y: 0, z: 0 },
    },
    radius: {
      type: 'number',
      label: 'Radius',
      default: 50,
      min: 0.001,
    },
    normal: {
      type: 'vec3',
      label: 'Normal',
      default: { x: 0, y: 0, z: 1 },
    },
    enableConstraints: {
      type: 'boolean',
      label: 'Enable Constraints',
      default: true,
    },
  },
  async evaluate(ctx: EvalContext, inputs, params) {
    const center = inputs.center || params.center;
    const normal = inputs.normal || params.normal;

    // Create geometry via OCCT
    const result = await ctx.worker.invoke('CREATE_CIRCLE', {
      center,
      radius: params.radius,
      normal,
    });

    // Register with constraint system if available and enabled
    let constraintInfo: ConstraintInfo | undefined = undefined;

    if (params.enableConstraints && ctx.constraintManager) {
      try {
        // Create constraint elements
        const centerPointId = `${ctx.nodeId}_center`;
        const circleId = `${ctx.nodeId}_circle`;

        // Register center point with constraint manager
        ctx.constraintManager.createPoint(centerPointId, center.x, center.y, false);

        // Register circle with constraint manager
        ctx.constraintManager.createCircle(circleId, centerPointId, params.radius);

        // Create constraint elements for output
        const constraintElements: ConstraintElement[] = [
          {
            id: centerPointId,
            type: 'point',
            data: { position: center, nodeId: ctx.nodeId, role: 'center' },
          },
          {
            id: circleId,
            type: 'circle',
            data: { center: centerPointId, radius: params.radius, nodeId: ctx.nodeId },
          },
        ];

        constraintInfo = {
          elements: constraintElements,
          activeConstraints: [], // No constraints added automatically
        };
      } catch (error) {
        logger.warn('Failed to register circle with constraint system:', error);
      }
    }

    return {
      curve: result,
      ...(constraintInfo && { constraints: constraintInfo }),
    };
  },
};

/**
 * Enhanced PointNode with constraint integration
 */
export const ParametricPointNode: NodeDefinition<
  { position?: Vec3 },
  { point: ShapeHandle; constraints?: ConstraintInfo },
  { x: number; y: number; z: number; enableConstraints: boolean; fixed: boolean }
> = {
  id: 'Sketch::ParametricPoint',
  category: 'Sketch',
  label: 'Parametric Point',
  description: 'Create a point with constraint system integration',
  inputs: {
    position: { type: 'Vector', optional: true },
  },
  outputs: {
    point: { type: 'Point' },
    constraints: { type: 'Any', optional: true },
  },
  params: {
    x: {
      type: 'number',
      label: 'X',
      default: 0,
    },
    y: {
      type: 'number',
      label: 'Y',
      default: 0,
    },
    z: {
      type: 'number',
      label: 'Z',
      default: 0,
    },
    enableConstraints: {
      type: 'boolean',
      label: 'Enable Constraints',
      default: true,
    },
    fixed: {
      type: 'boolean',
      label: 'Fixed Point',
      default: false,
    },
  },
  async evaluate(ctx: EvalContext, inputs, params) {
    const position = inputs.position || { x: params.x, y: params.y, z: params.z };

    // Create geometry via OCCT
    const result = await ctx.worker.invoke('CREATE_POINT', {
      x: position.x,
      y: position.y,
      z: position.z,
    });

    // Register with constraint system if available and enabled
    let constraintInfo: ConstraintInfo | undefined = undefined;

    if (params.enableConstraints && ctx.constraintManager) {
      try {
        // Create constraint elements
        const pointId = `${ctx.nodeId}_point`;

        // Register point with constraint manager
        ctx.constraintManager.createPoint(pointId, position.x, position.y, params.fixed);

        // Create constraint elements for output
        const constraintElements: ConstraintElement[] = [
          {
            id: pointId,
            type: 'point',
            data: { position, nodeId: ctx.nodeId, fixed: params.fixed },
          },
        ];

        constraintInfo = {
          elements: constraintElements,
          activeConstraints: [], // No constraints added automatically
        };
      } catch (error) {
        logger.warn('Failed to register point with constraint system:', error);
      }
    }

    return {
      point: result,
      ...(constraintInfo && { constraints: constraintInfo }),
    };
  },
};

/**
 * Constraint Application Node - applies constraints between geometry elements
 */
export const ConstraintNode: NodeDefinition<
  {
    element1?: ConstraintInfo;
    element2?: ConstraintInfo;
    element3?: ConstraintInfo;
  },
  { result: boolean },
  {
    constraintType:
      | 'distance'
      | 'coincident'
      | 'parallel'
      | 'perpendicular'
      | 'horizontal'
      | 'vertical';
    value?: number;
    priority: number;
  }
> = {
  id: 'Sketch::Constraint',
  category: 'Sketch',
  label: 'Apply Constraint',
  description: 'Apply geometric constraints between elements',
  inputs: {
    element1: { type: 'Any', optional: true },
    element2: { type: 'Any', optional: true },
    element3: { type: 'Any', optional: true },
  },
  outputs: {
    result: { type: 'Boolean' },
  },
  params: {
    constraintType: {
      type: 'enum',
      label: 'Constraint Type',
      default: 'distance',
      options: ['distance', 'coincident', 'parallel', 'perpendicular', 'horizontal', 'vertical'],
    },
    value: {
      type: 'number',
      label: 'Value',
      default: 10,
    },
    priority: {
      type: 'number',
      label: 'Priority',
      default: 1,
      min: 1,
      max: 10,
    },
  },
  async evaluate(ctx: EvalContext, inputs, params) {
    if (!ctx.constraintManager) {
      logger.warn('Constraint manager not available');
      return { result: false };
    }

    try {
      // Extract element IDs from constraint info
      const elementIds: string[] = [];

      if (inputs.element1?.elements) {
        elementIds.push(...inputs.element1.elements.map((e) => e.id));
      }
      if (inputs.element2?.elements) {
        elementIds.push(...inputs.element2.elements.map((e) => e.id));
      }
      if (inputs.element3?.elements) {
        elementIds.push(...inputs.element3.elements.map((e) => e.id));
      }

      if (elementIds.length < 1) {
        logger.warn('No constraint elements provided');
        return { result: false };
      }

      // Prepare constraint parameters
      const constraintParams: any = {};
      if (params.constraintType === 'distance' && params.value !== undefined) {
        constraintParams.distance = params.value;
      }
      if (params.constraintType === 'angle' && params.value !== undefined) {
        constraintParams.angle = params.value;
      }

      // Validate and apply constraint
      const validation = ctx.constraintManager.validateConstraint(
        params.constraintType.toUpperCase(),
        elementIds,
        constraintParams
      );

      if (!validation.valid) {
        logger.warn('Constraint validation failed:', validation.error);
        return { result: false };
      }

      // Add constraint to system
      ctx.constraintManager.addConstraint(
        params.constraintType.toUpperCase(),
        elementIds,
        constraintParams,
        params.priority
      );

      // Applied constraint ${constraintId} of type ${params.constraintType}
      return { result: true };
    } catch (error) {
      logger.error('Failed to apply constraint:', error);
      return { result: false };
    }
  },
};

/**
 * Constraint Solver Node - triggers constraint solving
 */
export const SolverNode: NodeDefinition<
  { trigger?: boolean },
  { solved: boolean; iterations: number; residual: number },
  { autoSolve: boolean; maxIterations: number; tolerance: number }
> = {
  id: 'Sketch::Solver',
  category: 'Sketch',
  label: 'Constraint Solver',
  description: 'Solve constraint system',
  inputs: {
    trigger: { type: 'Boolean', optional: true },
  },
  outputs: {
    solved: { type: 'Boolean' },
    iterations: { type: 'Number' },
    residual: { type: 'Number' },
  },
  params: {
    autoSolve: {
      type: 'boolean',
      label: 'Auto Solve',
      default: true,
    },
    maxIterations: {
      type: 'number',
      label: 'Max Iterations',
      default: 100,
      min: 1,
      max: 1000,
    },
    tolerance: {
      type: 'number',
      label: 'Tolerance',
      default: 0.000001,
      min: 0.000001,
      max: 0.1,
    },
  },
  async evaluate(ctx: EvalContext, inputs, params) {
    if (!ctx.constraintManager) {
      logger.warn('Constraint manager not available');
      return { solved: false, iterations: 0, residual: Infinity };
    }

    try {
      // Configure solver
      if (ctx.constraintManager.solver) {
        ctx.constraintManager.solver.config.maxIterations = params.maxIterations;
        ctx.constraintManager.solver.config.tolerance = params.tolerance;
      }

      // Solve constraint system
      const result = await ctx.constraintManager.solve();

      // Constraint solving: ${result.success ? 'SUCCESS' : 'FAILED'}
      // Iterations: ${result.iterations}, Residual: ${result.residual}

      return {
        solved: result.success,
        iterations: result.iterations,
        residual: result.residual,
      };
    } catch (error) {
      logger.error('Failed to solve constraints:', error);
      return { solved: false, iterations: 0, residual: Infinity };
    }
  },
};

// Export parametric sketch nodes
export const parametricSketchNodes = [
  ParametricLineNode,
  ParametricCircleNode,
  ParametricPointNode,
  ConstraintNode,
  SolverNode,
];
