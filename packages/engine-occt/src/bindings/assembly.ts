/**
 * OCCT Assembly Operations
 *
 * This module handles assembly management and pattern operations:
 * - Create Assembly: Group multiple parts into an assembly
 * - Create Mate: Define constraints between parts
 * - Create Pattern: Generate linear, circular, or rectangular arrays
 *
 * Note: This is a simplified assembly system. Full assembly constraints
 * and kinematics would require additional OCCT modules.
 */

import type { WASMModule } from '../occt-bindings';
import type { OCCTShape } from './types';
import { IDGenerator } from './utils';
import { getLogger } from '../production-logger';

const _logger = getLogger('OCCT:Assembly');

/**
 * Assembly data structure
 */
interface AssemblyData {
  id: string;
  name: string;
  parts: AssemblyPart[];
  mates: Mate[];
  visible: boolean;
  hash: string;
}

/**
 * Part in an assembly
 */
interface AssemblyPart {
  id: string;
  type: string;
  originalId?: string;
  transform?: Transform;
  patternInstance?: boolean;
}

/**
 * Mate constraint between parts
 */
interface Mate {
  id: string;
  type: string;
  part1: string;
  part2: string;
  axis1?: unknown;
  axis2?: unknown;
  distance?: number;
  angle?: number;
}

/**
 * Part transformation
 */
interface Transform {
  translation: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: number;
}

export class OCCTAssembly {
  private shapes: Map<string, OCCTShape>;
  private occt: WASMModule;
  private assemblies: Map<string, AssemblyData>;
  private idGen: IDGenerator;

  constructor(occt: WASMModule, shapes: Map<string, OCCTShape>, idGen: IDGenerator) {
    this.occt = occt;
    this.shapes = shapes;
    this.assemblies = new Map();
    this.idGen = idGen;
  }

  /**
   * Get assemblies map (for external access)
   */
  getAssemblies(): Map<string, AssemblyData> {
    return this.assemblies;
  }

  /**
   * Create assembly from multiple parts
   *
   * @param params.parts - Array of part IDs to include
   * @param params.name - Assembly name
   * @param params.visible - Visibility flag
   * @returns Assembly data structure
   */
  createAssembly(params: unknown): AssemblyData {
    const { parts = [], name = 'Assembly', visible = true } = params;

    const assemblyId = this.idGen.generate();
    const mates: Mate[] = [];

    // Store parts in assembly structure
    const assemblyHandle: AssemblyData = {
      id: assemblyId,
      name,
      parts: parts.map((part: unknown) => ({
        id: part?.id || part,
        type: 'Shape',
      })),
      mates,
      visible,
      hash: this.idGen.generate(),
    };

    // Store assembly data
    this.assemblies.set(assemblyId, assemblyHandle);

    return assemblyHandle;
  }

  /**
   * Create mate constraint between two parts
   *
   * @param params.assembly - Assembly ID
   * @param params.part1 - First part ID
   * @param params.part2 - Second part ID
   * @param params.mateType - Type of mate (coincident, parallel, perpendicular, etc.)
   * @param params.axis1 - First axis/reference
   * @param params.axis2 - Second axis/reference
   * @param params.distance - Distance constraint
   * @param params.angle - Angle constraint
   * @returns Updated assembly data
   */
  createMate(params: unknown): AssemblyData {
    const {
      assembly,
      part1,
      part2,
      mateType = 'coincident',
      axis1,
      axis2,
      distance,
      angle,
    } = params;

    const assemblyData = this.assemblies.get(assembly?.id || assembly);
    if (!assemblyData) throw new Error('Assembly not found');

    const mateId = this.idGen.generate();
    const mate: Mate = {
      id: mateId,
      type: mateType,
      part1: part1?.id || part1,
      part2: part2?.id || part2,
      axis1,
      axis2,
      distance,
      angle,
    };

    assemblyData.mates.push(mate);

    // Update assembly hash
    assemblyData.hash = this.idGen.generate();

    return assemblyData;
  }

  /**
   * Create pattern (array) of parts
   *
   * @param params.assembly - Assembly ID
   * @param params.part - Part ID to pattern
   * @param params.patternType - Type: 'linear', 'circular', or 'rectangular'
   * @param params.count - Number of instances
   * @param params.spacing - Spacing between instances
   * @param params.axis - Pattern axis direction {x, y, z}
   * @param params.angle - Angle between circular pattern instances
   * @returns Updated assembly data
   */
  createPattern(params: unknown): AssemblyData {
    const {
      assembly,
      part,
      patternType = 'linear',
      count = 3,
      spacing = 50,
      axis = { x: 1, y: 0, z: 0 },
      angle = 45,
    } = params;

    const assemblyData = this.assemblies.get(assembly?.id || assembly);
    if (!assemblyData) throw new Error('Assembly not found');

    const originalPart = part?.id || part;

    // Create pattern instances
    for (let i = 1; i < count; i++) {
      let transform: Transform;

      if (patternType === 'linear') {
        transform = {
          translation: {
            x: axis.x * spacing * i,
            y: axis.y * spacing * i,
            z: axis.z * spacing * i,
          },
          rotation: { x: 0, y: 0, z: 0 },
          scale: 1.0,
        };
      } else if (patternType === 'circular') {
        const angleRad = (angle * i * Math.PI) / 180;
        transform = {
          translation: { x: 0, y: 0, z: 0 },
          rotation: { x: 0, y: 0, z: angleRad },
          scale: 1.0,
        };
      } else {
        // rectangular pattern
        const cols = Math.ceil(Math.sqrt(count));
        const row = Math.floor(i / cols);
        const col = i % cols;
        transform = {
          translation: {
            x: col * spacing,
            y: row * spacing,
            z: 0,
          },
          rotation: { x: 0, y: 0, z: 0 },
          scale: 1.0,
        };
      }

      // Add pattern instance to assembly
      assemblyData.parts.push({
        id: this.idGen.generate(),
        type: 'Shape',
        originalId: originalPart,
        transform,
        patternInstance: true,
      });
    }

    // Update assembly hash
    assemblyData.hash = this.idGen.generate();

    return assemblyData;
  }
}
