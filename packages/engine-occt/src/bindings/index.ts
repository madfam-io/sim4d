/**
 * Refactored OCCT Bindings - Modular Architecture
 *
 * This module provides a backward-compatible facade that delegates
 * operations to specialized modules:
 * - primitives: Box, Sphere, Cylinder, Line, Circle, etc.
 * - boolean-ops: Union, Subtract, Intersect
 * - transformations: Transform, Translate, Rotate, Scale, Mirror
 * - features: Extrude, Revolve, Fillet, Chamfer, Shell, etc.
 * - analysis: Tessellate, GetProperties, GetVolume, GetArea
 * - assembly: CreateAssembly, CreateMate, CreatePattern
 */

import type { WorkerAPI } from '@sim4d/types';
import type { WASMModule } from '../occt-bindings';
import type { OCCTShape } from './types';
import { IDGenerator } from './utils';
import { OCCTPrimitives } from './primitives';
import { OCCTBooleanOps } from './boolean-ops';
import { OCCTTransformations } from './transformations';
import { OCCTFeatures } from './features';
import { OCCTAnalysis } from './analysis';
import { OCCTAssembly } from './assembly';
import { getLogger } from '../production-logger';

const logger = getLogger('OCCT');

// Declare OCCT module interface - matches Emscripten output
declare const Module: WASMModule;

/**
 * Refactored Real OCCT implementation using modular architecture
 *
 * This class maintains 100% backward compatibility with the original
 * RealOCCT class while organizing code into focused modules.
 */
export class RealOCCT implements WorkerAPI {
  private occt: WASMModule | null = null;
  private shapes = new Map<string, OCCTShape>();
  private idGen: IDGenerator;

  // Specialized operation modules
  private primitives!: OCCTPrimitives;
  private booleanOps!: OCCTBooleanOps;
  private transformations!: OCCTTransformations;
  private features!: OCCTFeatures;
  private analysis!: OCCTAnalysis;
  private assembly!: OCCTAssembly;

  constructor() {
    this.idGen = new IDGenerator(1);
    // Modules will be initialized in init()
  }

  /**
   * Initialize OCCT module and all operation modules
   */
  async init(): Promise<void> {
    if (this.occt) return;

    try {
      // Load OCCT WASM module
      if (typeof Module === 'undefined') {
        throw new Error('OCCT Module not loaded');
      }

      await Module.ready;
      this.occt = Module;

      // Initialize all operation modules
      // Primitives uses separate ID management, sync on each invoke
      this.primitives = new OCCTPrimitives(this.occt, this.shapes);
      this.booleanOps = new OCCTBooleanOps(this.occt, this.shapes, this.idGen);
      this.transformations = new OCCTTransformations(this.occt, this.shapes, this.idGen);
      this.features = new OCCTFeatures(this.occt, this.shapes, this.idGen);
      this.analysis = new OCCTAnalysis(this.occt, this.shapes, this.idGen);
      this.assembly = new OCCTAssembly(this.occt, this.shapes, this.idGen);

      logger.info('[RealOCCT] Initialized with version:', this.getVersion());
    } catch (error) {
      logger.error('[RealOCCT] Initialization failed:', error);
      throw error;
    }
  }

  /**
   * Get OCCT version
   */
  private getVersion(): string {
    if (this.occt && this.occt.version) {
      return this.occt.version();
    }
    return 'OCCT 7.8.0'; // Default version
  }

  /**
   * Main operation invocation - routes to appropriate module
   *
   * @param operation - Operation type (e.g., 'MAKE_BOX', 'BOOLEAN_UNION')
   * @param params - Operation parameters
   * @returns Operation result
   */
  // eslint-disable-next-line complexity -- Large switch statement for operation routing (inherent from original design)
  async invoke<T = unknown>(operation: string, params: unknown): Promise<T> {
    if (!this.occt) {
      throw new Error('OCCT not initialized');
    }

    switch (operation) {
      // ======================================================================
      // 3D Primitives
      // ======================================================================
      case 'MAKE_BOX':
      case 'CREATE_BOX':
        return this.primitives.makeBox(params) as T;

      case 'MAKE_SPHERE':
      case 'CREATE_SPHERE':
        return this.primitives.makeSphere(params) as T;

      case 'MAKE_CYLINDER':
      case 'CREATE_CYLINDER':
        return this.primitives.makeCylinder(params) as T;

      case 'MAKE_CONE':
        return this.primitives.makeCone(params) as T;

      case 'MAKE_TORUS':
        return this.primitives.makeTorus(params) as T;

      // ======================================================================
      // 2D Primitives
      // ======================================================================
      case 'CREATE_LINE':
        return this.primitives.createLine(params) as T;

      case 'CREATE_CIRCLE':
        return this.primitives.createCircle(params) as T;

      case 'CREATE_RECTANGLE':
        return this.primitives.createRectangle(params) as T;

      case 'CREATE_ARC':
        return this.primitives.createArc(params) as T;

      case 'CREATE_POINT':
        return this.primitives.createPointShape(params) as T;

      case 'CREATE_ELLIPSE':
        return this.primitives.createEllipse(params) as T;

      case 'CREATE_POLYGON':
        return this.primitives.createPolygon(params) as T;

      // ======================================================================
      // Modeling Features
      // ======================================================================
      case 'MAKE_EXTRUDE':
      case 'EXTRUDE':
        return this.features.makeExtrude(params) as T;

      case 'MAKE_REVOLVE':
      case 'REVOLVE':
        return this.features.makeRevolve(params) as T;

      case 'MAKE_SWEEP':
      case 'SWEEP':
        return this.features.makeSweep(params) as T;

      case 'MAKE_LOFT':
      case 'LOFT':
        return this.features.makeLoft(params) as T;

      case 'MAKE_FILLET':
      case 'FILLET':
        return this.features.makeFillet(params) as T;

      case 'MAKE_CHAMFER':
      case 'CHAMFER':
        return this.features.makeChamfer(params) as T;

      case 'MAKE_SHELL':
      case 'SHELL':
        return this.features.makeShell(params) as T;

      case 'MAKE_DRAFT':
      case 'DRAFT':
        return this.features.makeDraft(params) as T;

      case 'MAKE_OFFSET':
        return this.features.makeOffset(params) as T;

      // ======================================================================
      // Boolean Operations
      // ======================================================================
      case 'BOOLEAN_UNION':
      case 'UNION':
        return this.booleanOps.booleanUnion(params) as T;

      case 'BOOLEAN_SUBTRACT':
      case 'SUBTRACT':
        return this.booleanOps.booleanSubtract(params) as T;

      case 'BOOLEAN_INTERSECT':
      case 'INTERSECT':
        return this.booleanOps.booleanIntersect(params) as T;

      // ======================================================================
      // Transformations
      // ======================================================================
      case 'TRANSFORM':
        return this.transformations.transform(params) as T;

      case 'TRANSLATE':
        return this.transformations.translate(params) as T;

      case 'ROTATE':
        return this.transformations.rotate(params) as T;

      case 'SCALE':
        return this.transformations.scale(params) as T;

      case 'MIRROR':
        return this.transformations.mirror(params) as T;

      // ======================================================================
      // Analysis Operations
      // ======================================================================
      case 'TESSELLATE':
        return this.analysis.tessellate(params) as T;

      case 'GET_PROPERTIES':
        return this.analysis.getProperties(params) as T;

      case 'GET_VOLUME':
        return this.analysis.getVolume(params) as T;

      case 'GET_AREA':
        return this.analysis.getArea(params) as T;

      case 'GET_CENTER_OF_MASS':
        return this.analysis.getCenterOfMass(params) as T;

      // ======================================================================
      // Assembly Operations
      // ======================================================================
      case 'CREATE_ASSEMBLY':
        return this.assembly.createAssembly(params) as T;

      case 'CREATE_MATE':
        return this.assembly.createMate(params) as T;

      case 'CREATE_PATTERN':
        return this.assembly.createPattern(params) as T;

      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
  }
}

// Re-export types for convenience
export type {
  OCCTShape,
  OCCTVec3,
  OCCTHandle,
  OCCTBuilder,
  OCCTBoolean,
  OCCTFillet,
  OCCTMesh,
  OCCTBounds,
  PatternResult,
} from './types';
