import type { Vec3 } from '@sim4d/types';
import type { Constraint, ConstraintEntity } from './types';

export class DimensionalConstraint {
  constructor(public constraint: Constraint) {}

  evaluate(entities: Map<string, ConstraintEntity>): number {
    switch (this.constraint.type) {
      case 'distance':
        return this.evaluateDistance(entities);
      case 'angle':
        return this.evaluateAngle(entities);
      case 'radius':
        return this.evaluateRadius(entities);
      case 'equal':
        return this.evaluateEqual(entities);
      default:
        return 0;
    }
  }

  private evaluateDistance(entities: Map<string, ConstraintEntity>): number {
    const [e1, e2] = this.getEntities(entities);
    const targetValue = this.constraint.value ?? 0;

    if (e1?.type === 'point' && e2?.type === 'point') {
      if (!e1.position || !e2.position) return Infinity;

      const distance = Math.sqrt(
        Math.pow(e1.position.x - e2.position.x, 2) +
          Math.pow(e1.position.y - e2.position.y, 2) +
          Math.pow(e1.position.z - e2.position.z, 2)
      );

      return Math.abs(distance - targetValue);
    }

    if (e1?.type === 'point' && e2?.type === 'line') {
      if (!e1.position || !e2.position || !e2.direction) return Infinity;

      const v = this.subtract(e1.position, e2.position);
      const proj = this.dot(v, e2.direction);
      const perpDist = Math.sqrt(this.dot(v, v) - proj * proj);

      return Math.abs(perpDist - targetValue);
    }

    return Infinity;
  }

  private evaluateAngle(entities: Map<string, ConstraintEntity>): number {
    const [e1, e2] = this.getEntities(entities);
    const targetAngle = this.constraint.value ?? 0;

    if (!e1?.direction || !e2?.direction) return Infinity;

    const dot = this.dot(e1.direction, e2.direction);
    const currentAngle = Math.acos(Math.max(-1, Math.min(1, dot)));

    return Math.abs(currentAngle - targetAngle);
  }

  private evaluateRadius(entities: Map<string, ConstraintEntity>): number {
    const [entity] = this.getEntities(entities);
    const targetRadius = this.constraint.value ?? 0;

    if (entity?.type !== 'circle' && entity?.type !== 'arc') return Infinity;
    if (!entity.radius) return Infinity;

    return Math.abs(entity.radius - targetRadius);
  }

  private evaluateEqual(entities: Map<string, ConstraintEntity>): number {
    const [e1, e2] = this.getEntities(entities);

    if (e1?.type === 'line' && e2?.type === 'line') {
      if (!e1.parameters.has('length') || !e2.parameters.has('length')) {
        return Infinity;
      }

      const l1 = e1.parameters.get('length')!;
      const l2 = e2.parameters.get('length')!;
      return Math.abs(l1 - l2);
    }

    if (
      (e1?.type === 'circle' || e1?.type === 'arc') &&
      (e2?.type === 'circle' || e2?.type === 'arc')
    ) {
      if (!e1.radius || !e2.radius) return Infinity;

      return Math.abs(e1.radius - e2.radius);
    }

    return Infinity;
  }

  private getEntities(entities: Map<string, ConstraintEntity>): ConstraintEntity[] {
    return this.constraint.entities
      .map((id) => entities.get(id))
      .filter((e): e is ConstraintEntity => e !== undefined);
  }

  private dot(a: Vec3, b: Vec3): number {
    return a.x * b.x + a.y * b.y + a.z * b.z;
  }

  private subtract(a: Vec3, b: Vec3): Vec3 {
    return {
      x: a.x - b.x,
      y: a.y - b.y,
      z: a.z - b.z,
    };
  }
}
