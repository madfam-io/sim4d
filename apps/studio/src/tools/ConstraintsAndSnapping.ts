import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import * as THREE from 'three';

// Snap types for different geometric entities
export type SnapType =
  | 'grid'
  | 'endpoint'
  | 'midpoint'
  | 'center'
  | 'intersection'
  | 'perpendicular'
  | 'tangent'
  | 'parallel'
  | 'edge'
  | 'face'
  | 'vertex';

export interface SnapPoint {
  id: string;
  type: SnapType;
  position: THREE.Vector3;
  normal?: THREE.Vector3;
  objectId?: string;
  distance: number;
  visual?: THREE.Object3D;
}

export interface ConstraintType {
  id: string;
  type:
    | 'distance'
    | 'angle'
    | 'parallel'
    | 'perpendicular'
    | 'coincident'
    | 'tangent'
    | 'concentric';
  entities: string[];
  value?: number;
  isActive: boolean;
  isDriving: boolean;
}

export interface SnapSettings {
  enabled: boolean;
  tolerance: number;
  visualFeedback: boolean;
  snapTypes: {
    [K in SnapType]: boolean;
  };
  gridSize: number;
  gridSubdivisions: number;
}

export interface ConstraintsAndSnappingState {
  // Snapping state
  snapSettings: SnapSettings;
  activeSnapPoints: SnapPoint[];
  hoveredSnapPoint?: SnapPoint;
  snapPreview?: THREE.Object3D;

  // Constraints state
  constraints: ConstraintType[];
  temporaryConstraints: ConstraintType[];
  constraintSolver: ConstraintSolver | null;

  // Grid state
  gridVisible: boolean;
  gridHelper?: THREE.GridHelper;

  // Input state
  isSnapping: boolean;
  snapMode: 'auto' | 'manual' | 'off';
}

export interface ConstraintsAndSnappingActions {
  // Snap settings
  updateSnapSettings: (settings: Partial<SnapSettings>) => void;
  toggleSnapType: (type: SnapType) => void;
  setSnapTolerance: (tolerance: number) => void;

  // Snapping operations
  findSnapPoints: (position: THREE.Vector3, scene: THREE.Scene) => SnapPoint[];
  snapToPoint: (position: THREE.Vector3, scene: THREE.Scene) => THREE.Vector3;
  clearSnapPoints: () => void;
  showSnapPreview: (snapPoint: SnapPoint) => void;
  hideSnapPreview: () => void;

  // Grid operations
  showGrid: (size?: number, divisions?: number) => void;
  hideGrid: () => void;
  snapToGrid: (position: THREE.Vector3) => THREE.Vector3;

  // Constraint operations
  addConstraint: (constraint: Omit<ConstraintType, 'id'>) => string;
  removeConstraint: (constraintId: string) => void;
  updateConstraint: (constraintId: string, updates: Partial<ConstraintType>) => void;
  solveConstraints: () => boolean;
  clearConstraints: () => void;

  // Constraint solver
  initializeSolver: (scene: THREE.Scene) => void;
  addTemporaryConstraint: (constraint: Omit<ConstraintType, 'id'>) => void;
  clearTemporaryConstraints: () => void;
}

// Simple constraint solver for basic geometric constraints
export class ConstraintSolver {
  private scene: THREE.Scene;
  private constraints: ConstraintType[] = [];
  private objects: Map<string, THREE.Object3D> = new Map();

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.updateObjectCache();
  }

  private updateObjectCache(): void {
    this.objects.clear();
    this.scene.traverse((object) => {
      if (object.userData.nodeId) {
        this.objects.set(object.userData.nodeId, object);
      }
    });
  }

  addConstraint(constraint: ConstraintType): void {
    this.constraints.push(constraint);
  }

  removeConstraint(constraintId: string): void {
    this.constraints = this.constraints.filter((c) => c.id !== constraintId);
  }

  solve(): boolean {
    // Simple iterative solver for basic constraints
    const maxIterations = 100;
    const tolerance = 1e-6;

    for (let iteration = 0; iteration < maxIterations; iteration++) {
      let changed = false;

      for (const constraint of this.constraints) {
        if (!constraint.isActive || !constraint.isDriving) continue;

        const applied = this.applyConstraint(constraint);
        if (applied) changed = true;
      }

      if (!changed) break;
    }

    return true;
  }

  private applyConstraint(constraint: ConstraintType): boolean {
    const [entity1Id, entity2Id] = constraint.entities;
    const obj1 = this.objects.get(entity1Id);
    const obj2 = this.objects.get(entity2Id);

    if (!obj1 || !obj2) return false;

    switch (constraint.type) {
      case 'distance':
        return this.applyDistanceConstraint(obj1, obj2, constraint.value || 0);
      case 'parallel':
        return this.applyParallelConstraint(obj1, obj2);
      case 'perpendicular':
        return this.applyPerpendicularConstraint(obj1, obj2);
      case 'coincident':
        return this.applyCoincidentConstraint(obj1, obj2);
      default:
        return false;
    }
  }

  private applyDistanceConstraint(
    obj1: THREE.Object3D,
    obj2: THREE.Object3D,
    targetDistance: number
  ): boolean {
    const currentDistance = obj1.position.distanceTo(obj2.position);
    const diff = targetDistance - currentDistance;

    if (Math.abs(diff) < 1e-6) return false;

    const direction = new THREE.Vector3().subVectors(obj2.position, obj1.position).normalize();
    const offset = direction.multiplyScalar(diff * 0.5);

    obj1.position.sub(offset);
    obj2.position.add(offset);

    return true;
  }

  private applyParallelConstraint(obj1: THREE.Object3D, obj2: THREE.Object3D): boolean {
    // Get direction vectors (assuming objects have meaningful rotation)
    const dir1 = new THREE.Vector3(0, 0, 1).applyQuaternion(obj1.quaternion);
    const dir2 = new THREE.Vector3(0, 0, 1).applyQuaternion(obj2.quaternion);

    const cross = new THREE.Vector3().crossVectors(dir1, dir2);
    if (cross.length() < 1e-6) return false; // Already parallel

    // Rotate obj2 to be parallel to obj1
    const angle = dir1.angleTo(dir2);
    const axis = cross.normalize();
    obj2.rotateOnWorldAxis(axis, -angle * 0.5);

    return true;
  }

  private applyPerpendicularConstraint(obj1: THREE.Object3D, obj2: THREE.Object3D): boolean {
    const dir1 = new THREE.Vector3(0, 0, 1).applyQuaternion(obj1.quaternion);
    const dir2 = new THREE.Vector3(0, 0, 1).applyQuaternion(obj2.quaternion);

    const dot = dir1.dot(dir2);
    if (Math.abs(dot) < 1e-6) return false; // Already perpendicular

    // Rotate obj2 to be perpendicular to obj1
    const targetAngle = Math.PI / 2;
    const currentAngle = Math.acos(Math.abs(dot));
    const deltaAngle = targetAngle - currentAngle;

    const axis = new THREE.Vector3().crossVectors(dir1, dir2).normalize();
    obj2.rotateOnWorldAxis(axis, deltaAngle * 0.5);

    return true;
  }

  private applyCoincidentConstraint(obj1: THREE.Object3D, obj2: THREE.Object3D): boolean {
    const distance = obj1.position.distanceTo(obj2.position);
    if (distance < 1e-6) return false; // Already coincident

    const midpoint = new THREE.Vector3()
      .addVectors(obj1.position, obj2.position)
      .multiplyScalar(0.5);
    obj1.position.copy(midpoint);
    obj2.position.copy(midpoint);

    return true;
  }
}

export const useConstraintsAndSnapping = create<
  ConstraintsAndSnappingState & ConstraintsAndSnappingActions
>()(
  devtools(
    (set, get) => ({
      // Initial state
      snapSettings: {
        enabled: true,
        tolerance: 10, // pixels
        visualFeedback: true,
        snapTypes: {
          grid: true,
          endpoint: true,
          midpoint: true,
          center: true,
          intersection: true,
          perpendicular: false,
          tangent: false,
          parallel: false,
          edge: true,
          face: false,
          vertex: true,
        },
        gridSize: 10,
        gridSubdivisions: 10,
      },
      activeSnapPoints: [],
      constraints: [],
      temporaryConstraints: [],
      constraintSolver: null,
      gridVisible: false,
      isSnapping: false,
      snapMode: 'auto',

      // Snap settings actions
      updateSnapSettings: (settings) => {
        set((state) => ({
          snapSettings: { ...state.snapSettings, ...settings },
        }));
      },

      toggleSnapType: (type) => {
        set((state) => ({
          snapSettings: {
            ...state.snapSettings,
            snapTypes: {
              ...state.snapSettings.snapTypes,
              [type]: !state.snapSettings.snapTypes[type],
            },
          },
        }));
      },

      setSnapTolerance: (tolerance) => {
        set((state) => ({
          snapSettings: { ...state.snapSettings, tolerance },
        }));
      },

      // Snapping operations
      findSnapPoints: (position, scene) => {
        const { snapSettings } = get();
        if (!snapSettings.enabled) return [];

        const snapPoints: SnapPoint[] = [];
        const tolerance = snapSettings.tolerance;

        // Grid snapping
        if (snapSettings.snapTypes.grid) {
          const gridSnap = get().snapToGrid(position);
          if (gridSnap.distanceTo(position) <= tolerance) {
            snapPoints.push({
              id: `grid_${gridSnap.x}_${gridSnap.y}_${gridSnap.z}`,
              type: 'grid',
              position: gridSnap.clone(),
              distance: gridSnap.distanceTo(position),
            });
          }
        }

        // Object snapping
        scene.traverse((object) => {
          if (!(object as any).geometry) return;

          const geometry = (object as any).geometry;
          const worldMatrix = object.matrixWorld;

          // Vertex snapping
          if (snapSettings.snapTypes.vertex && geometry.attributes.position) {
            const positions = geometry.attributes.position;
            for (let i = 0; i < positions.count; i++) {
              const vertex = new THREE.Vector3(
                positions.getX(i),
                positions.getY(i),
                positions.getZ(i)
              );
              vertex.applyMatrix4(worldMatrix);

              const distance = vertex.distanceTo(position);
              if (distance <= tolerance) {
                snapPoints.push({
                  id: `vertex_${object.id}_${i}`,
                  type: 'vertex',
                  position: vertex.clone(),
                  objectId: object.userData.nodeId,
                  distance,
                });
              }
            }
          }

          // Edge midpoint snapping
          if (snapSettings.snapTypes.midpoint && geometry.index) {
            const indices = geometry.index;
            const positions = geometry.attributes.position;

            for (let i = 0; i < indices.count; i += 3) {
              for (let j = 0; j < 3; j++) {
                const idx1 = indices.getX(i + j);
                const idx2 = indices.getX(i + ((j + 1) % 3));

                const v1 = new THREE.Vector3(
                  positions.getX(idx1),
                  positions.getY(idx1),
                  positions.getZ(idx1)
                );
                const v2 = new THREE.Vector3(
                  positions.getX(idx2),
                  positions.getY(idx2),
                  positions.getZ(idx2)
                );

                v1.applyMatrix4(worldMatrix);
                v2.applyMatrix4(worldMatrix);

                const midpoint = new THREE.Vector3().addVectors(v1, v2).multiplyScalar(0.5);
                const distance = midpoint.distanceTo(position);

                if (distance <= tolerance) {
                  snapPoints.push({
                    id: `midpoint_${object.id}_${idx1}_${idx2}`,
                    type: 'midpoint',
                    position: midpoint.clone(),
                    objectId: object.userData.nodeId,
                    distance,
                  });
                }
              }
            }
          }

          // Center snapping (for meshes with bounding box center)
          if (snapSettings.snapTypes.center) {
            const bbox = new THREE.Box3().setFromObject(object);
            const center = bbox.getCenter(new THREE.Vector3());
            const distance = center.distanceTo(position);

            if (distance <= tolerance) {
              snapPoints.push({
                id: `center_${object.id}`,
                type: 'center',
                position: center.clone(),
                objectId: object.userData.nodeId,
                distance,
              });
            }
          }
        });

        // Sort by distance and return closest points
        return snapPoints.sort((a, b) => a.distance - b.distance).slice(0, 5); // Limit to 5 closest points
      },

      snapToPoint: (position, scene) => {
        const snapPoints = get().findSnapPoints(position, scene);
        if (snapPoints.length === 0) return position.clone();

        const closestPoint = snapPoints[0];
        set({ hoveredSnapPoint: closestPoint });

        return closestPoint.position.clone();
      },

      clearSnapPoints: () => {
        set({ activeSnapPoints: [], hoveredSnapPoint: undefined });
      },

      showSnapPreview: (snapPoint) => {
        // Create visual feedback for snap point
        const geometry = new THREE.RingGeometry(2, 4, 8);
        const material = new THREE.MeshBasicMaterial({
          color: 0x00ff00,
          transparent: true,
          opacity: 0.8,
          depthTest: false,
        });
        const preview = new THREE.Mesh(geometry, material);
        preview.position.copy(snapPoint.position);
        preview.renderOrder = 1000;

        set({ snapPreview: preview });
      },

      hideSnapPreview: () => {
        const { snapPreview } = get();
        if (snapPreview && snapPreview.parent) {
          snapPreview.parent.remove(snapPreview);
        }
        set({ snapPreview: undefined });
      },

      // Grid operations
      showGrid: (size = 100, divisions = 10) => {
        const { gridHelper } = get();
        if (gridHelper) {
          if (gridHelper.parent) gridHelper.parent.remove(gridHelper);
        }

        const newGridHelper = new THREE.GridHelper(size, divisions);
        newGridHelper.material.transparent = true;
        newGridHelper.material.opacity = 0.3;

        set({ gridHelper: newGridHelper, gridVisible: true });
      },

      hideGrid: () => {
        const { gridHelper } = get();
        if (gridHelper && gridHelper.parent) {
          gridHelper.parent.remove(gridHelper);
        }
        set({ gridVisible: false });
      },

      snapToGrid: (position) => {
        const { snapSettings } = get();
        const gridSize = snapSettings.gridSize;

        return new THREE.Vector3(
          Math.round(position.x / gridSize) * gridSize,
          Math.round(position.y / gridSize) * gridSize,
          Math.round(position.z / gridSize) * gridSize
        );
      },

      // Constraint operations
      addConstraint: (constraint) => {
        const id = `constraint_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const newConstraint = { ...constraint, id };

        set((state) => ({
          constraints: [...state.constraints, newConstraint],
        }));

        // Add to solver if available
        const { constraintSolver } = get();
        if (constraintSolver) {
          constraintSolver.addConstraint(newConstraint);
        }

        return id;
      },

      removeConstraint: (constraintId) => {
        set((state) => ({
          constraints: state.constraints.filter((c) => c.id !== constraintId),
        }));

        const { constraintSolver } = get();
        if (constraintSolver) {
          constraintSolver.removeConstraint(constraintId);
        }
      },

      updateConstraint: (constraintId, updates) => {
        set((state) => ({
          constraints: state.constraints.map((c) =>
            c.id === constraintId ? { ...c, ...updates } : c
          ),
        }));
      },

      solveConstraints: () => {
        const { constraintSolver } = get();
        if (!constraintSolver) return false;

        return constraintSolver.solve();
      },

      clearConstraints: () => {
        set({ constraints: [], temporaryConstraints: [] });
      },

      // Constraint solver
      initializeSolver: (scene) => {
        const solver = new ConstraintSolver(scene);
        const { constraints } = get();

        // Add existing constraints to solver
        for (const constraint of constraints) {
          solver.addConstraint(constraint);
        }

        set({ constraintSolver: solver });
      },

      addTemporaryConstraint: (constraint) => {
        const id = `temp_constraint_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const newConstraint = { ...constraint, id };

        set((state) => ({
          temporaryConstraints: [...state.temporaryConstraints, newConstraint],
        }));
      },

      clearTemporaryConstraints: () => {
        set({ temporaryConstraints: [] });
      },
    }),
    {
      name: 'constraints-snapping-store',
    }
  )
);

// Hook for using constraints and snapping in components
export const useSnapToGrid = () => {
  const { snapToGrid, snapSettings } = useConstraintsAndSnapping();

  return (position: THREE.Vector3) => {
    if (!snapSettings.snapTypes.grid) return position;
    return snapToGrid(position);
  };
};

// Hook for constraint visualization
export const useConstraintVisuals = (scene: THREE.Scene) => {
  const { constraints, temporaryConstraints } = useConstraintsAndSnapping();

  // Create visual representations of constraints
  const updateConstraintVisuals = () => {
    // Remove existing constraint visuals
    scene.traverse((object) => {
      if (object.userData.isConstraintVisual) {
        scene.remove(object);
      }
    });

    // Add visuals for active constraints
    const allConstraints = [...constraints, ...temporaryConstraints];

    for (const constraint of allConstraints) {
      if (!constraint.isActive) continue;

      // Create constraint visualization based on type
      let visual: THREE.Object3D | null = null;

      switch (constraint.type) {
        case 'distance':
          visual = createDistanceConstraintVisual(constraint, scene);
          break;
        case 'parallel':
          visual = createParallelConstraintVisual(constraint, scene);
          break;
        case 'perpendicular':
          visual = createPerpendicularConstraintVisual(constraint, scene);
          break;
      }

      if (visual) {
        visual.userData.isConstraintVisual = true;
        visual.userData.constraintId = constraint.id;
        scene.add(visual);
      }
    }
  };

  return { updateConstraintVisuals };
};

// Helper functions for constraint visuals
function createDistanceConstraintVisual(
  constraint: ConstraintType,
  scene: THREE.Scene
): THREE.Object3D | null {
  // Find the objects
  const [entity1Id, entity2Id] = constraint.entities;
  let obj1: THREE.Object3D | null = null;
  let obj2: THREE.Object3D | null = null;

  scene.traverse((object) => {
    if (object.userData.nodeId === entity1Id) obj1 = object;
    if (object.userData.nodeId === entity2Id) obj2 = object;
  });

  if (!obj1 || !obj2) return null;

  // Create dimension line
  const geometry = new THREE.BufferGeometry().setFromPoints([
    (obj1 as THREE.Object3D).position,
    (obj2 as THREE.Object3D).position,
  ]);

  const material = new THREE.LineBasicMaterial({
    color: constraint.isDriving ? 0x0000ff : 0x888888,
    linewidth: 2,
  });

  return new THREE.Line(geometry, material);
}

function createParallelConstraintVisual(
  constraint: ConstraintType,
  scene: THREE.Scene
): THREE.Object3D | null {
  // Create parallel constraint symbol
  const group = new THREE.Group();

  // Add parallel lines symbol
  const geometry = new THREE.PlaneGeometry(1, 0.1);
  const material = new THREE.MeshBasicMaterial({
    color: constraint.isDriving ? 0x0000ff : 0x888888,
    transparent: true,
    opacity: 0.7,
  });

  const line1 = new THREE.Mesh(geometry, material);
  const line2 = new THREE.Mesh(geometry, material);

  line2.position.y = 0.5;

  group.add(line1, line2);

  return group;
}

function createPerpendicularConstraintVisual(
  constraint: ConstraintType,
  scene: THREE.Scene
): THREE.Object3D | null {
  // Create perpendicular constraint symbol
  const group = new THREE.Group();

  const geometry = new THREE.PlaneGeometry(0.5, 0.1);
  const material = new THREE.MeshBasicMaterial({
    color: constraint.isDriving ? 0x0000ff : 0x888888,
    transparent: true,
    opacity: 0.7,
  });

  const line1 = new THREE.Mesh(geometry, material);
  const line2 = new THREE.Mesh(geometry, material);

  line2.rotation.z = Math.PI / 2;

  group.add(line1, line2);

  return group;
}

// Export helper functions for external use
export const getConstraintInfo = (constraintId: string): ConstraintType | undefined => {
  const state = useConstraintsAndSnapping.getState();
  return state.constraints.find((c) => c.id === constraintId);
};

export const getAllActiveConstraints = (): ConstraintType[] => {
  const state = useConstraintsAndSnapping.getState();
  return state.constraints.filter((c) => c.isActive);
};

export const getSnapPointsNear = (
  position: THREE.Vector3,
  scene: THREE.Scene,
  tolerance?: number
): SnapPoint[] => {
  const state = useConstraintsAndSnapping.getState();
  const snapPoints = state.findSnapPoints(position, scene);
  const actualTolerance = tolerance || state.snapSettings.tolerance;

  return snapPoints.filter((point) => point.distance <= actualTolerance);
};
