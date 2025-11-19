/**
 * Assembly Kinematics Solver
 * Solves motion and constraints for mechanical assemblies
 */

import { Vec3, Mat4, Quaternion } from '@brepflow/types';

export enum JointType {
  FIXED = 'fixed',
  REVOLUTE = 'revolute', // 1 DOF rotation
  PRISMATIC = 'prismatic', // 1 DOF translation
  CYLINDRICAL = 'cylindrical', // 1 DOF rotation + 1 DOF translation
  SPHERICAL = 'spherical', // 3 DOF rotation
  PLANAR = 'planar', // 2 DOF translation + 1 DOF rotation
  UNIVERSAL = 'universal', // 2 DOF rotation (Cardan joint)
  GEAR = 'gear', // Coupled rotation
  RACK_PINION = 'rack_pinion', // Rotation to translation coupling
  CAM = 'cam', // Profile-driven motion
  SCREW = 'screw', // Helical motion
}

export interface Joint {
  id: string;
  type: JointType;
  parent: string; // Component ID
  child: string; // Component ID

  // Joint frame relative to parent
  parentFrame: {
    origin: Vec3;
    axis: Vec3;
    reference: Vec3;
  };

  // Joint frame relative to child
  childFrame: {
    origin: Vec3;
    axis: Vec3;
    reference: Vec3;
  };

  // Joint limits and parameters
  limits?: {
    lower?: number;
    upper?: number;
    velocity?: number;
    acceleration?: number;
    force?: number;
  };

  // Current state
  position?: number | number[]; // Joint position(s)
  velocity?: number | number[]; // Joint velocity(ies)

  // Special parameters
  ratio?: number; // For gear/rack-pinion
  pitch?: number; // For screw joint
  profile?: Vec3[]; // For cam joint
}

export interface Component {
  id: string;
  name: string;

  // Physical properties
  mass: number;
  inertia: Mat4; // Inertia tensor
  centerOfMass: Vec3;

  // Current state
  position: Vec3;
  orientation: Quaternion;
  velocity: Vec3;
  angularVelocity: Vec3;

  // Geometry reference
  shapeId?: string;

  // Fixed to ground?
  isGround?: boolean;
}

export interface KinematicChain {
  components: Map<string, Component>;
  joints: Map<string, Joint>;
  rootComponent?: string; // Ground/fixed component
}

export class KinematicsSolver {
  private chain: KinematicChain;
  private readonly POSITION_TOLERANCE = 1e-6;
  private readonly ORIENTATION_TOLERANCE = 1e-6;
  private readonly MAX_ITERATIONS = 100;

  constructor(chain: KinematicChain) {
    this.chain = chain;
    this.validateChain();
  }

  /**
   * Forward kinematics - compute component positions from joint values
   */
  forwardKinematics(jointPositions: Map<string, number | number[]>): Map<string, Mat4> {
    const transforms = new Map<string, Mat4>();

    // Start from ground component
    const ground = this.findGroundComponent();
    if (!ground) throw new Error('No ground component found');

    // Initialize ground transform
    transforms.set(ground.id, this.componentToTransform(ground));

    // Traverse kinematic tree
    const visited = new Set<string>();
    const queue = [ground.id];

    while (queue.length > 0) {
      const parentId = queue.shift()!;
      if (visited.has(parentId)) continue;
      visited.add(parentId);

      // Find child joints
      const childJoints = Array.from(this.chain.joints.values()).filter(
        (j) => j.parent === parentId
      );

      for (const joint of childJoints) {
        const childId = joint.child;
        const parentTransform = transforms.get(parentId)!;

        // Get joint position
        const jointPos = jointPositions.get(joint.id) ?? joint.position ?? 0;

        // Calculate joint transform
        const jointTransform = this.getJointTransform(joint, jointPos);

        // Calculate child transform
        const childTransform = this.multiplyTransforms(
          parentTransform,
          this.frameToTransform(joint.parentFrame),
          jointTransform,
          this.inverseTransform(this.frameToTransform(joint.childFrame))
        );

        transforms.set(childId, childTransform);
        queue.push(childId);
      }
    }

    return transforms;
  }

  /**
   * Inverse kinematics - compute joint values to reach target position
   */
  inverseKinematics(
    targetComponent: string,
    targetTransform: Mat4,
    options?: {
      maxIterations?: number;
      tolerance?: number;
      damping?: number;
    }
  ): Map<string, number | number[]> {
    const maxIter = options?.maxIterations ?? this.MAX_ITERATIONS;
    const tolerance = options?.tolerance ?? this.POSITION_TOLERANCE;
    const damping = options?.damping ?? 0.1;

    // Get current joint positions
    const jointPositions = new Map<string, number | number[]>();
    for (const [id, joint] of this.chain.joints) {
      jointPositions.set(id, joint.position ?? 0);
    }

    // Jacobian-based IK solver
    for (let iter = 0; iter < maxIter; iter++) {
      // Forward kinematics to get current transforms
      const transforms = this.forwardKinematics(jointPositions);
      const currentTransform = transforms.get(targetComponent);

      if (!currentTransform) {
        throw new Error(`Component ${targetComponent} not found in kinematic chain`);
      }

      // Calculate error
      const error = this.calculateTransformError(currentTransform, targetTransform);
      const errorMagnitude = this.vectorMagnitude(error);

      if (errorMagnitude < tolerance) {
        break; // Converged
      }

      // Build Jacobian matrix
      const jacobian = this.buildJacobian(targetComponent, jointPositions);

      // Solve for joint velocities using pseudo-inverse
      const jointVelocities = this.solveJacobian(jacobian, error, damping);

      // Update joint positions
      let i = 0;
      for (const [jointId, joint] of this.chain.joints) {
        const velocity = jointVelocities[i];
        const currentPos = jointPositions.get(jointId) as number;
        let newPos = currentPos + velocity;

        // Apply joint limits
        if (joint.limits) {
          if (joint.limits.lower !== undefined) {
            newPos = Math.max(newPos, joint.limits.lower);
          }
          if (joint.limits.upper !== undefined) {
            newPos = Math.min(newPos, joint.limits.upper);
          }
        }

        jointPositions.set(jointId, newPos);
        i++;
      }
    }

    return jointPositions;
  }

  /**
   * Motion simulation - simulate assembly motion over time
   */
  simulate(
    timeStep: number,
    forces?: Map<string, { force: Vec3; torque: Vec3 }>,
    constraints?: MotionConstraint[]
  ): void {
    // Update velocities based on forces
    if (forces) {
      for (const [componentId, { force, torque }] of forces) {
        const component = this.chain.components.get(componentId);
        if (!component || component.isGround) continue;

        // F = ma, τ = Iα
        const linearAccel = this.scaleVector(force, 1 / component.mass);
        const angularAccel = this.solveInertia(component.inertia, torque);

        // Update velocities
        component.velocity = this.addVectors(
          component.velocity,
          this.scaleVector(linearAccel, timeStep)
        );
        component.angularVelocity = this.addVectors(
          component.angularVelocity,
          this.scaleVector(angularAccel, timeStep)
        );
      }
    }

    // Apply constraints
    if (constraints) {
      this.applyConstraints(constraints, timeStep);
    }

    // Update positions based on velocities
    for (const component of this.chain.components.values()) {
      if (component.isGround) continue;

      // Update position
      component.position = this.addVectors(
        component.position,
        this.scaleVector(component.velocity, timeStep)
      );

      // Update orientation (using quaternion integration)
      const angularVelQuat = this.vectorToQuaternion(component.angularVelocity);
      const deltaRotation = this.scaleQuaternion(angularVelQuat, timeStep * 0.5);
      component.orientation = this.multiplyQuaternions(component.orientation, deltaRotation);
      component.orientation = this.normalizeQuaternion(component.orientation);
    }

    // Update joint positions from component transforms
    this.updateJointPositions();
  }

  /**
   * Collision detection between components
   */
  detectCollisions(): CollisionPair[] {
    const collisions: CollisionPair[] = [];
    const components = Array.from(this.chain.components.values());

    for (let i = 0; i < components.length - 1; i++) {
      for (let j = i + 1; j < components.length; j++) {
        const c1 = components[i];
        const c2 = components[j];

        // Skip if connected by joint
        if (this.areConnected(c1.id, c2.id)) continue;

        // Broad phase - bounding box check
        if (this.boundingBoxesIntersect(c1, c2)) {
          // Narrow phase would go here (GJK, SAT, etc.)
          collisions.push({
            component1: c1.id,
            component2: c2.id,
            point: [0, 0, 0], // Would be computed by narrow phase
            normal: [0, 0, 1],
            depth: 0,
          });
        }
      }
    }

    return collisions;
  }

  /**
   * Get degrees of freedom for the assembly
   */
  getDegreesOfFreedom(): number {
    let dof = 0;

    for (const joint of this.chain.joints.values()) {
      switch (joint.type) {
        case JointType.FIXED:
          break; // 0 DOF
        case JointType.REVOLUTE:
        case JointType.PRISMATIC:
          dof += 1;
          break;
        case JointType.CYLINDRICAL:
        case JointType.UNIVERSAL:
          dof += 2;
          break;
        case JointType.SPHERICAL:
          dof += 3;
          break;
        case JointType.PLANAR:
          dof += 3;
          break;
        case JointType.GEAR:
        case JointType.RACK_PINION:
          dof += 1; // Coupled motion
          break;
      }
    }

    return dof;
  }

  /**
   * Analyze mobility using Gruebler's equation
   */
  analyzeMobility(): {
    dof: number;
    redundant: boolean;
    overconstrained: boolean;
  } {
    const n = this.chain.components.size; // Number of links
    const j = this.chain.joints.size; // Number of joints
    const dof = this.getDegreesFreedom();

    // Gruebler's equation: F = 6(n-j-1) + Σfi
    const theoreticalDOF = 6 * (n - j - 1) + dof;

    return {
      dof: theoreticalDOF,
      redundant: theoreticalDOF > 0,
      overconstrained: theoreticalDOF < 0,
    };
  }

  /**
   * Export assembly motion to keyframes
   */
  exportMotion(
    duration: number,
    fps: number,
    motionProfile?: (t: number) => number
  ): MotionKeyframes {
    const frameCount = Math.ceil(duration * fps);
    const timeStep = 1 / fps;
    const keyframes: MotionKeyframes = {
      fps,
      duration,
      frames: [],
    };

    for (let frame = 0; frame < frameCount; frame++) {
      const t = frame * timeStep;
      const normalizedTime = t / duration;

      // Apply motion profile (default: linear)
      const profileValue = motionProfile ? motionProfile(normalizedTime) : normalizedTime;

      // Interpolate joint positions
      const jointPositions = new Map<string, number | number[]>();
      for (const [id, joint] of this.chain.joints) {
        if (joint.type !== JointType.FIXED) {
          const range = (joint.limits?.upper ?? 360) - (joint.limits?.lower ?? 0);
          const position = (joint.limits?.lower ?? 0) + range * profileValue;
          jointPositions.set(id, position);
        }
      }

      // Calculate transforms
      const transforms = this.forwardKinematics(jointPositions);

      // Store keyframe
      keyframes.frames.push({
        time: t,
        transforms: Array.from(transforms.entries()).map(([id, transform]) => ({
          componentId: id,
          transform: Array.from(transform) as number[],
        })),
      });
    }

    return keyframes;
  }

  // Helper methods

  private validateChain(): void {
    // Check for ground component
    const groundComponents = Array.from(this.chain.components.values()).filter((c) => c.isGround);

    if (groundComponents.length === 0) {
      throw new Error('Kinematic chain must have at least one ground component');
    }

    // Check joint connectivity
    for (const joint of this.chain.joints.values()) {
      if (!this.chain.components.has(joint.parent)) {
        throw new Error(`Joint ${joint.id} references unknown parent ${joint.parent}`);
      }
      if (!this.chain.components.has(joint.child)) {
        throw new Error(`Joint ${joint.id} references unknown child ${joint.child}`);
      }
    }
  }

  private findGroundComponent(): Component | undefined {
    return Array.from(this.chain.components.values()).find((c) => c.isGround);
  }

  private getJointTransform(joint: Joint, position: number | number[]): Mat4 {
    const transform = this.identityTransform();

    switch (joint.type) {
      case JointType.REVOLUTE: {
        // Rotation around axis
        const angle = position as number;
        return this.rotationTransform(joint.parentFrame.axis, angle);
      }

      case JointType.PRISMATIC: {
        // Translation along axis
        const distance = position as number;
        const translation = this.scaleVector(joint.parentFrame.axis, distance);
        return this.translationTransform(translation);
      }

      case JointType.CYLINDRICAL: {
        // Rotation + translation
        const [rot, trans] = position as number[];
        const rotTransform = this.rotationTransform(joint.parentFrame.axis, rot);
        const transTransform = this.translationTransform(
          this.scaleVector(joint.parentFrame.axis, trans)
        );
        return this.multiplyTransforms(rotTransform, transTransform);
      }

      case JointType.SPHERICAL: {
        // 3 DOF rotation (Euler angles)
        const [rx, ry, rz] = position as number[];
        return this.eulerToTransform(rx, ry, rz);
      }

      default:
        return transform;
    }
  }

  private buildJacobian(
    targetComponent: string,
    jointPositions: Map<string, number | number[]>
  ): number[][] {
    const joints = Array.from(this.chain.joints.values());
    const jacobian: number[][] = Array(6)
      .fill(0)
      .map(() => Array(joints.length).fill(0));

    // Numerical differentiation for Jacobian
    const h = 1e-6;
    const baseTransforms = this.forwardKinematics(jointPositions);
    const baseTransform = baseTransforms.get(targetComponent)!;
    const basePos = this.extractPosition(baseTransform);
    const baseRot = this.extractRotation(baseTransform);

    for (let i = 0; i < joints.length; i++) {
      const joint = joints[i];
      const originalPos = jointPositions.get(joint.id) as number;

      // Perturb joint
      jointPositions.set(joint.id, originalPos + h);
      const perturbedTransforms = this.forwardKinematics(jointPositions);
      const perturbedTransform = perturbedTransforms.get(targetComponent)!;

      // Calculate derivatives
      const perturbedPos = this.extractPosition(perturbedTransform);
      const perturbedRot = this.extractRotation(perturbedTransform);

      // Linear velocity contribution
      jacobian[0][i] = (perturbedPos[0] - basePos[0]) / h;
      jacobian[1][i] = (perturbedPos[1] - basePos[1]) / h;
      jacobian[2][i] = (perturbedPos[2] - basePos[2]) / h;

      // Angular velocity contribution
      const deltaRot = this.rotationDifference(baseRot, perturbedRot);
      jacobian[3][i] = deltaRot[0] / h;
      jacobian[4][i] = deltaRot[1] / h;
      jacobian[5][i] = deltaRot[2] / h;

      // Restore original position
      jointPositions.set(joint.id, originalPos);
    }

    return jacobian;
  }

  private solveJacobian(jacobian: number[][], error: number[], damping: number): number[] {
    // Damped least squares (Levenberg-Marquardt)
    const m = jacobian.length; // 6 (position + orientation)
    const n = jacobian[0].length; // Number of joints

    // J^T * J + λI
    const JtJ = Array(n)
      .fill(0)
      .map(() => Array(n).fill(0));
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        for (let k = 0; k < m; k++) {
          JtJ[i][j] += jacobian[k][i] * jacobian[k][j];
        }
        if (i === j) {
          JtJ[i][j] += damping * damping;
        }
      }
    }

    // J^T * e
    const Jte = Array(n).fill(0);
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < m; j++) {
        Jte[i] += jacobian[j][i] * error[j];
      }
    }

    // Solve (J^T * J + λI) * Δq = J^T * e
    return this.solveLinearSystem(JtJ, Jte);
  }

  private solveLinearSystem(A: number[][], b: number[]): number[] {
    // Gaussian elimination with partial pivoting
    const n = b.length;
    const augmented = A.map((row, i) => [...row, b[i]]);

    for (let i = 0; i < n; i++) {
      // Partial pivoting
      let maxRow = i;
      for (let k = i + 1; k < n; k++) {
        if (Math.abs(augmented[k][i]) > Math.abs(augmented[maxRow][i])) {
          maxRow = k;
        }
      }
      [augmented[i], augmented[maxRow]] = [augmented[maxRow], augmented[i]];

      // Forward elimination
      for (let k = i + 1; k < n; k++) {
        const factor = augmented[k][i] / augmented[i][i];
        for (let j = i; j <= n; j++) {
          augmented[k][j] -= factor * augmented[i][j];
        }
      }
    }

    // Back substitution
    const x = Array(n).fill(0);
    for (let i = n - 1; i >= 0; i--) {
      x[i] = augmented[i][n];
      for (let j = i + 1; j < n; j++) {
        x[i] -= augmented[i][j] * x[j];
      }
      x[i] /= augmented[i][i];
    }

    return x;
  }

  private areConnected(id1: string, id2: string): boolean {
    return Array.from(this.chain.joints.values()).some(
      (j) => (j.parent === id1 && j.child === id2) || (j.parent === id2 && j.child === id1)
    );
  }

  private boundingBoxesIntersect(c1: Component, c2: Component): boolean {
    // Simplified - would use actual bounding boxes
    const distance = this.vectorMagnitude(this.subtractVectors(c1.position, c2.position));
    return distance < 100; // Arbitrary threshold
  }

  private updateJointPositions(): void {
    // Update joint positions based on component transforms
    for (const joint of this.chain.joints.values()) {
      const parent = this.chain.components.get(joint.parent)!;
      const child = this.chain.components.get(joint.child)!;

      // Calculate relative transform
      const parentTransform = this.componentToTransform(parent);
      const childTransform = this.componentToTransform(child);
      const relativeTransform = this.multiplyTransforms(
        this.inverseTransform(parentTransform),
        childTransform
      );

      // Extract joint position based on type
      switch (joint.type) {
        case JointType.REVOLUTE:
          joint.position = this.extractRotationAngle(relativeTransform, joint.parentFrame.axis);
          break;
        case JointType.PRISMATIC:
          joint.position = this.extractTranslationDistance(
            relativeTransform,
            joint.parentFrame.axis
          );
          break;
        // Add other joint types
      }
    }
  }

  private applyConstraints(constraints: MotionConstraint[], timeStep: number): void {
    // Apply motion constraints (velocity limits, etc.)
    for (const constraint of constraints) {
      // Implementation depends on constraint type
    }
  }

  // Transform utilities
  private identityTransform(): Mat4 {
    return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
  }

  private componentToTransform(component: Component): Mat4 {
    return this.poseToTransform(component.position, component.orientation);
  }

  private frameToTransform(frame: unknown): Mat4 {
    // Convert frame definition to transform matrix
    return this.identityTransform(); // Simplified
  }

  private multiplyTransforms(...transforms: Mat4[]): Mat4 {
    return transforms.reduce((acc, t) => this.matrixMultiply(acc, t));
  }

  private matrixMultiply(a: Mat4, b: Mat4): Mat4 {
    const result: Mat4 = new Array(16).fill(0);
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        for (let k = 0; k < 4; k++) {
          result[i * 4 + j] += a[i * 4 + k] * b[k * 4 + j];
        }
      }
    }
    return result;
  }

  private inverseTransform(transform: Mat4): Mat4 {
    // Simplified inverse for rigid transforms
    const inv: Mat4 = [...transform];
    // Transpose rotation part
    [inv[1], inv[4]] = [inv[4], inv[1]];
    [inv[2], inv[8]] = [inv[8], inv[2]];
    [inv[6], inv[9]] = [inv[9], inv[6]];
    // Negate translation
    inv[12] = -transform[12];
    inv[13] = -transform[13];
    inv[14] = -transform[14];
    return inv;
  }

  private translationTransform(translation: Vec3): Mat4 {
    return [1, 0, 0, translation[0], 0, 1, 0, translation[1], 0, 0, 1, translation[2], 0, 0, 0, 1];
  }

  private rotationTransform(axis: Vec3, angle: number): Mat4 {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    const t = 1 - c;
    const [x, y, z] = this.normalizeVector(axis);

    return [
      t * x * x + c,
      t * x * y - s * z,
      t * x * z + s * y,
      0,
      t * x * y + s * z,
      t * y * y + c,
      t * y * z - s * x,
      0,
      t * x * z - s * y,
      t * y * z + s * x,
      t * z * z + c,
      0,
      0,
      0,
      0,
      1,
    ];
  }

  private eulerToTransform(rx: number, ry: number, rz: number): Mat4 {
    const cx = Math.cos(rx),
      sx = Math.sin(rx);
    const cy = Math.cos(ry),
      sy = Math.sin(ry);
    const cz = Math.cos(rz),
      sz = Math.sin(rz);

    return [
      cy * cz,
      -cy * sz,
      sy,
      0,
      sx * sy * cz + cx * sz,
      -sx * sy * sz + cx * cz,
      -sx * cy,
      0,
      -cx * sy * cz + sx * sz,
      cx * sy * sz + sx * cz,
      cx * cy,
      0,
      0,
      0,
      0,
      1,
    ];
  }

  private poseToTransform(position: Vec3, orientation: Quaternion): Mat4 {
    const [x, y, z, w] = orientation;
    const xx = x * x,
      yy = y * y,
      zz = z * z;
    const xy = x * y,
      xz = x * z,
      yz = y * z;
    const wx = w * x,
      wy = w * y,
      wz = w * z;

    return [
      1 - 2 * (yy + zz),
      2 * (xy - wz),
      2 * (xz + wy),
      position[0],
      2 * (xy + wz),
      1 - 2 * (xx + zz),
      2 * (yz - wx),
      position[1],
      2 * (xz - wy),
      2 * (yz + wx),
      1 - 2 * (xx + yy),
      position[2],
      0,
      0,
      0,
      1,
    ];
  }

  private extractPosition(transform: Mat4): Vec3 {
    return [transform[12], transform[13], transform[14]];
  }

  private extractRotation(transform: Mat4): Mat4 {
    const rot = [...transform];
    rot[12] = rot[13] = rot[14] = 0;
    return rot;
  }

  private extractRotationAngle(transform: Mat4, axis: Vec3): number {
    // Extract angle from rotation matrix around given axis
    // Simplified - would use Rodriguez formula
    return Math.atan2(transform[6], transform[10]);
  }

  private extractTranslationDistance(transform: Mat4, axis: Vec3): number {
    const translation = this.extractPosition(transform);
    return this.dotProduct(translation, axis);
  }

  private calculateTransformError(current: Mat4, target: Mat4): number[] {
    const posError = this.subtractVectors(
      this.extractPosition(target),
      this.extractPosition(current)
    );

    const rotError = this.rotationDifference(
      this.extractRotation(current),
      this.extractRotation(target)
    );

    return [...posError, ...rotError];
  }

  private rotationDifference(r1: Mat4, r2: Mat4): Vec3 {
    // Convert to axis-angle and return axis * angle
    // Simplified - would use proper rotation math
    return [r2[6] - r1[6], r2[2] - r1[2], r2[1] - r1[1]];
  }

  // Vector utilities
  private addVectors(a: Vec3, b: Vec3): Vec3 {
    return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
  }

  private subtractVectors(a: Vec3, b: Vec3): Vec3 {
    return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  }

  private scaleVector(v: Vec3, s: number): Vec3 {
    return [v[0] * s, v[1] * s, v[2] * s];
  }

  private dotProduct(a: Vec3, b: Vec3): number {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  }

  private vectorMagnitude(v: Vec3 | number[]): number {
    return Math.sqrt(v.reduce((sum, x) => sum + x * x, 0));
  }

  private normalizeVector(v: Vec3): Vec3 {
    const mag = this.vectorMagnitude(v);
    return mag === 0 ? [0, 0, 0] : this.scaleVector(v, 1 / mag);
  }

  private solveInertia(inertia: Mat4, torque: Vec3): Vec3 {
    // Solve I * α = τ for angular acceleration
    // Simplified - would invert inertia tensor
    return torque; // Placeholder
  }

  // Quaternion utilities
  private vectorToQuaternion(v: Vec3): Quaternion {
    const angle = this.vectorMagnitude(v);
    if (angle === 0) return [0, 0, 0, 1];
    const axis = this.scaleVector(v, 1 / angle);
    const halfAngle = angle * 0.5;
    const s = Math.sin(halfAngle);
    return [axis[0] * s, axis[1] * s, axis[2] * s, Math.cos(halfAngle)];
  }

  private multiplyQuaternions(q1: Quaternion, q2: Quaternion): Quaternion {
    const [x1, y1, z1, w1] = q1;
    const [x2, y2, z2, w2] = q2;
    return [
      w1 * x2 + x1 * w2 + y1 * z2 - z1 * y2,
      w1 * y2 - x1 * z2 + y1 * w2 + z1 * x2,
      w1 * z2 + x1 * y2 - y1 * x2 + z1 * w2,
      w1 * w2 - x1 * x2 - y1 * y2 - z1 * z2,
    ];
  }

  private scaleQuaternion(q: Quaternion, s: number): Quaternion {
    return [q[0] * s, q[1] * s, q[2] * s, q[3] * s];
  }

  private normalizeQuaternion(q: Quaternion): Quaternion {
    const mag = Math.sqrt(q[0] * q[0] + q[1] * q[1] + q[2] * q[2] + q[3] * q[3]);
    return mag === 0 ? [0, 0, 0, 1] : [q[0] / mag, q[1] / mag, q[2] / mag, q[3] / mag];
  }

  private integrateVelocity(component: string, velocity: number[], _timeStep: number): void {
    // Integration logic here
    const _constraint = this.constraints.find((c) => c.targetComponent === component);
    // Update component position based on velocity
  }

  private updateConstraintForces(constraint: unknown, _frame: number, forces: unknown): void {
    // Update constraint forces
  }

  private getConstraintAxis(constraint: unknown, _axis: string): Vec3 {
    // Get constraint axis
    return [0, 0, 1];
  }
}

// Type definitions

export interface CollisionPair {
  component1: string;
  component2: string;
  point: Vec3;
  normal: Vec3;
  depth: number;
}

export interface MotionConstraint {
  type: 'velocity' | 'acceleration' | 'position';
  componentId: string;
  value: Vec3 | number;
  axis?: Vec3;
}

export interface MotionKeyframes {
  fps: number;
  duration: number;
  frames: Array<{
    time: number;
    transforms: Array<{
      componentId: string;
      transform: number[];
    }>;
  }>;
}
