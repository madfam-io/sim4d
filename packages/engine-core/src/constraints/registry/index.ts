/**
 * Constraint registry for managing constraint types and factory methods
 */

import {
  ConstraintType,
  Constraint,
  DistanceConstraint,
  CoincidentConstraint,
  ParallelConstraint,
  PerpendicularConstraint,
  HorizontalConstraint,
  VerticalConstraint,
  AngleConstraint,
  RadiusConstraint,
  GeometryElement,
  Point2D,
  Line2D,
  Circle2D,
} from '../types';

/**
 * Constraint factory function type
 */
export type ConstraintFactory<T extends Constraint = Constraint> = (
  elements: GeometryElement[],
  params: any
) => T;

/**
 * Constraint validation function type
 */
export type ConstraintValidator = (
  elements: GeometryElement[],
  params: any
) => { valid: boolean; error?: string };

/**
 * Constraint definition for registry
 */
export interface ConstraintDefinition {
  type: ConstraintType;
  name: string;
  description: string;
  requiredElements: number;
  elementTypes: string[];
  parameters: Array<{
    name: string;
    type: 'number' | 'boolean' | 'string';
    required: boolean;
    default?: any;
    min?: number;
    max?: number;
  }>;
  factory: ConstraintFactory;
  validator: ConstraintValidator;
}

/**
 * Constraint registry singleton
 */
export class ConstraintRegistry {
  private static instance: ConstraintRegistry | null = null;
  private definitions = new Map<ConstraintType, ConstraintDefinition>();

  private constructor() {
    this.registerBuiltinConstraints();
  }

  static getInstance(): ConstraintRegistry {
    if (!ConstraintRegistry.instance) {
      ConstraintRegistry.instance = new ConstraintRegistry();
    }
    return ConstraintRegistry.instance;
  }

  /**
   * Register a constraint definition
   */
  register(definition: ConstraintDefinition): void {
    this.definitions.set(definition.type, definition);
  }

  /**
   * Get constraint definition by type
   */
  getDefinition(type: ConstraintType): ConstraintDefinition | undefined {
    return this.definitions.get(type);
  }

  /**
   * Get all registered constraint types
   */
  getAvailableTypes(): ConstraintType[] {
    return Array.from(this.definitions.keys());
  }

  /**
   * Create a constraint instance
   */
  createConstraint(
    type: ConstraintType,
    elements: GeometryElement[],
    params: any = {},
    priority: number = 1
  ): Constraint | null {
    const definition = this.definitions.get(type);
    if (!definition) {
      throw new Error(`Unknown constraint type: ${type}`);
    }

    // Validate elements and parameters
    const validation = definition.validator(elements, params);
    if (!validation.valid) {
      throw new Error(`Constraint validation failed: ${validation.error}`);
    }

    // Create constraint using factory
    const constraint = definition.factory(elements, params);

    // Set common properties
    constraint.id = this.generateConstraintId();
    constraint.priority = priority;
    constraint.enabled = true;

    return constraint;
  }

  /**
   * Validate constraint compatibility with elements
   */
  validateConstraint(
    type: ConstraintType,
    elements: GeometryElement[],
    params: any = {}
  ): { valid: boolean; error?: string } {
    const definition = this.definitions.get(type);
    if (!definition) {
      return { valid: false, error: `Unknown constraint type: ${type}` };
    }

    return definition.validator(elements, params);
  }

  /**
   * Register built-in constraint types
   */
  private registerBuiltinConstraints(): void {
    // Distance constraint
    this.register({
      type: ConstraintType.DISTANCE,
      name: 'Distance',
      description: 'Maintain fixed distance between two points',
      requiredElements: 2,
      elementTypes: ['Point2D', 'Point2D'],
      parameters: [{ name: 'distance', type: 'number', required: true, min: 0 }],
      factory: (elements, params) => this.createDistanceConstraint(elements, params),
      validator: (elements, params) => this.validateDistanceConstraint(elements, params),
    });

    // Coincident constraint
    this.register({
      type: ConstraintType.COINCIDENT,
      name: 'Coincident',
      description: 'Make two points coincident',
      requiredElements: 2,
      elementTypes: ['Point2D', 'Point2D'],
      parameters: [],
      factory: (elements, params) => this.createCoincidentConstraint(elements, params),
      validator: (elements, params) => this.validateCoincidentConstraint(elements, params),
    });

    // Parallel constraint
    this.register({
      type: ConstraintType.PARALLEL,
      name: 'Parallel',
      description: 'Make two lines parallel',
      requiredElements: 2,
      elementTypes: ['Line2D', 'Line2D'],
      parameters: [],
      factory: (elements, params) => this.createParallelConstraint(elements, params),
      validator: (elements, params) => this.validateParallelConstraint(elements, params),
    });

    // Perpendicular constraint
    this.register({
      type: ConstraintType.PERPENDICULAR,
      name: 'Perpendicular',
      description: 'Make two lines perpendicular',
      requiredElements: 2,
      elementTypes: ['Line2D', 'Line2D'],
      parameters: [],
      factory: (elements, params) => this.createPerpendicularConstraint(elements, params),
      validator: (elements, params) => this.validatePerpendicularConstraint(elements, params),
    });

    // Horizontal constraint
    this.register({
      type: ConstraintType.HORIZONTAL,
      name: 'Horizontal',
      description: 'Make line horizontal',
      requiredElements: 1,
      elementTypes: ['Line2D'],
      parameters: [],
      factory: (elements, params) => this.createHorizontalConstraint(elements, params),
      validator: (elements, params) => this.validateHorizontalConstraint(elements, params),
    });

    // Vertical constraint
    this.register({
      type: ConstraintType.VERTICAL,
      name: 'Vertical',
      description: 'Make line vertical',
      requiredElements: 1,
      elementTypes: ['Line2D'],
      parameters: [],
      factory: (elements, params) => this.createVerticalConstraint(elements, params),
      validator: (elements, params) => this.validateVerticalConstraint(elements, params),
    });

    // Angle constraint
    this.register({
      type: ConstraintType.ANGLE,
      name: 'Angle',
      description: 'Set angle between two lines',
      requiredElements: 2,
      elementTypes: ['Line2D', 'Line2D'],
      parameters: [{ name: 'angle', type: 'number', required: true, min: 0, max: 180 }],
      factory: (elements, params) => this.createAngleConstraint(elements, params),
      validator: (elements, params) => this.validateAngleConstraint(elements, params),
    });

    // Radius constraint
    this.register({
      type: ConstraintType.RADIUS,
      name: 'Radius',
      description: 'Set circle radius',
      requiredElements: 1,
      elementTypes: ['Circle2D'],
      parameters: [{ name: 'radius', type: 'number', required: true, min: 0.001 }],
      factory: (elements, params) => this.createRadiusConstraint(elements, params),
      validator: (elements, params) => this.validateRadiusConstraint(elements, params),
    });
  }

  // Constraint factory methods
  private createDistanceConstraint(elements: GeometryElement[], params: any): DistanceConstraint {
    return {
      id: '',
      type: ConstraintType.DISTANCE,
      elements: [elements[0].id, elements[1].id],
      distance: params.distance,
      priority: 1,
      enabled: true,
    };
  }

  private createCoincidentConstraint(
    elements: GeometryElement[],
    params: any
  ): CoincidentConstraint {
    return {
      id: '',
      type: ConstraintType.COINCIDENT,
      elements: [elements[0].id, elements[1].id],
      priority: 10, // High priority for coincidence
      enabled: true,
    };
  }

  private createParallelConstraint(elements: GeometryElement[], params: any): ParallelConstraint {
    return {
      id: '',
      type: ConstraintType.PARALLEL,
      elements: [elements[0].id, elements[1].id],
      priority: 1,
      enabled: true,
    };
  }

  private createPerpendicularConstraint(
    elements: GeometryElement[],
    params: any
  ): PerpendicularConstraint {
    return {
      id: '',
      type: ConstraintType.PERPENDICULAR,
      elements: [elements[0].id, elements[1].id],
      priority: 1,
      enabled: true,
    };
  }

  private createHorizontalConstraint(
    elements: GeometryElement[],
    params: any
  ): HorizontalConstraint {
    return {
      id: '',
      type: ConstraintType.HORIZONTAL,
      elements: [elements[0].id],
      priority: 1,
      enabled: true,
    };
  }

  private createVerticalConstraint(elements: GeometryElement[], params: any): VerticalConstraint {
    return {
      id: '',
      type: ConstraintType.VERTICAL,
      elements: [elements[0].id],
      priority: 1,
      enabled: true,
    };
  }

  private createAngleConstraint(elements: GeometryElement[], params: any): AngleConstraint {
    return {
      id: '',
      type: ConstraintType.ANGLE,
      elements: [elements[0].id, elements[1].id],
      angle: params.angle,
      priority: 1,
      enabled: true,
    };
  }

  private createRadiusConstraint(elements: GeometryElement[], params: any): RadiusConstraint {
    return {
      id: '',
      type: ConstraintType.RADIUS,
      elements: [elements[0].id],
      radius: params.radius,
      priority: 1,
      enabled: true,
    };
  }

  // Validation methods
  private validateDistanceConstraint(
    elements: GeometryElement[],
    params: any
  ): { valid: boolean; error?: string } {
    if (elements.length !== 2) {
      return { valid: false, error: 'Distance constraint requires exactly 2 points' };
    }

    if (!elements.every((e) => e.id && this.isPoint(e))) {
      return { valid: false, error: 'Distance constraint requires two Point2D elements' };
    }

    if (typeof params.distance !== 'number' || params.distance < 0) {
      return { valid: false, error: 'Distance must be a non-negative number' };
    }

    return { valid: true };
  }

  private validateCoincidentConstraint(
    elements: GeometryElement[],
    params: any
  ): { valid: boolean; error?: string } {
    if (elements.length !== 2) {
      return { valid: false, error: 'Coincident constraint requires exactly 2 points' };
    }

    if (!elements.every((e) => this.isPoint(e))) {
      return { valid: false, error: 'Coincident constraint requires two Point2D elements' };
    }

    return { valid: true };
  }

  private validateParallelConstraint(
    elements: GeometryElement[],
    params: any
  ): { valid: boolean; error?: string } {
    if (elements.length !== 2) {
      return { valid: false, error: 'Parallel constraint requires exactly 2 lines' };
    }

    if (!elements.every((e) => this.isLine(e))) {
      return { valid: false, error: 'Parallel constraint requires two Line2D elements' };
    }

    return { valid: true };
  }

  private validatePerpendicularConstraint(
    elements: GeometryElement[],
    params: any
  ): { valid: boolean; error?: string } {
    if (elements.length !== 2) {
      return { valid: false, error: 'Perpendicular constraint requires exactly 2 lines' };
    }

    if (!elements.every((e) => this.isLine(e))) {
      return { valid: false, error: 'Perpendicular constraint requires two Line2D elements' };
    }

    return { valid: true };
  }

  private validateHorizontalConstraint(
    elements: GeometryElement[],
    params: any
  ): { valid: boolean; error?: string } {
    if (elements.length !== 1) {
      return { valid: false, error: 'Horizontal constraint requires exactly 1 line' };
    }

    if (!this.isLine(elements[0])) {
      return { valid: false, error: 'Horizontal constraint requires a Line2D element' };
    }

    return { valid: true };
  }

  private validateVerticalConstraint(
    elements: GeometryElement[],
    params: any
  ): { valid: boolean; error?: string } {
    if (elements.length !== 1) {
      return { valid: false, error: 'Vertical constraint requires exactly 1 line' };
    }

    if (!this.isLine(elements[0])) {
      return { valid: false, error: 'Vertical constraint requires a Line2D element' };
    }

    return { valid: true };
  }

  private validateAngleConstraint(
    elements: GeometryElement[],
    params: any
  ): { valid: boolean; error?: string } {
    if (elements.length !== 2) {
      return { valid: false, error: 'Angle constraint requires exactly 2 lines' };
    }

    if (!elements.every((e) => this.isLine(e))) {
      return { valid: false, error: 'Angle constraint requires two Line2D elements' };
    }

    if (typeof params.angle !== 'number' || params.angle < 0 || params.angle > 180) {
      return { valid: false, error: 'Angle must be between 0 and 180 degrees' };
    }

    return { valid: true };
  }

  private validateRadiusConstraint(
    elements: GeometryElement[],
    params: any
  ): { valid: boolean; error?: string } {
    if (elements.length !== 1) {
      return { valid: false, error: 'Radius constraint requires exactly 1 circle' };
    }

    if (!this.isCircle(elements[0])) {
      return { valid: false, error: 'Radius constraint requires a Circle2D element' };
    }

    if (typeof params.radius !== 'number' || params.radius <= 0) {
      return { valid: false, error: 'Radius must be a positive number' };
    }

    return { valid: true };
  }

  // Type guards
  private isPoint(element: GeometryElement): element is Point2D {
    return 'position' in element;
  }

  private isLine(element: GeometryElement): element is Line2D {
    return 'start' in element && 'end' in element;
  }

  private isCircle(element: GeometryElement): element is Circle2D {
    return 'center' in element && 'radius' in element;
  }

  /**
   * Generate unique constraint ID
   */
  private generateConstraintId(): string {
    return `constraint_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
