import type { Constraint, ConstraintEntity, ConstraintSolution, SolverOptions } from './types';
import { GeometricConstraint } from './geometry-constraints';
import { DimensionalConstraint } from './dimensional-constraints';
import { logger } from '@sim4d/engine-core';

export class ConstraintSolverEngine {
  private constraints: Map<string, Constraint> = new Map();
  private entities: Map<string, ConstraintEntity> = new Map();
  private options: Required<SolverOptions>;

  constructor(options?: SolverOptions) {
    this.options = {
      maxIterations: options?.maxIterations ?? 100,
      tolerance: options?.tolerance ?? 1e-6,
      damping: options?.damping ?? 0.8,
      method: options?.method ?? 'newton-raphson',
      verbose: options?.verbose ?? false,
    };
  }

  addEntity(entity: ConstraintEntity): void {
    this.entities.set(entity.id, entity);
  }

  removeEntity(id: string): void {
    this.entities.delete(id);
    // Remove constraints referencing this entity
    for (const [cId, constraint] of this.constraints) {
      if (constraint.entities.includes(id)) {
        this.constraints.delete(cId);
      }
    }
  }

  addConstraint(constraint: Constraint): void {
    this.constraints.set(constraint.id, constraint);
  }

  removeConstraint(id: string): void {
    this.constraints.delete(id);
  }

  solve(): ConstraintSolution {
    const startTime = Date.now();
    let iterations = 0;
    let residual = Infinity;
    const workingEntities = new Map(this.entities);

    while (iterations < this.options.maxIterations && residual > this.options.tolerance) {
      const gradients = this.computeGradients(workingEntities);
      const updates = this.computeUpdates(gradients, workingEntities);

      this.applyUpdates(workingEntities, updates);
      residual = this.computeResidual(workingEntities);

      iterations++;

      if (this.options.verbose) {
        logger.info(`Iteration ${iterations}: residual = ${residual}`);
      }
    }

    const success = residual <= this.options.tolerance;
    const conflicts = success ? undefined : this.detectConflicts(workingEntities);

    if (this.options.verbose) {
      logger.info(
        `Solver ${success ? 'converged' : 'failed'} in ${iterations} iterations (${Date.now() - startTime}ms)`
      );
    }

    return {
      success,
      iterations,
      residual,
      updates: workingEntities,
      conflicts,
    };
  }

  private computeGradients(
    entities: Map<string, ConstraintEntity>
  ): Map<string, Map<string, number>> {
    const gradients = new Map<string, Map<string, number>>();

    for (const constraint of this.constraints.values()) {
      if (!constraint.active) continue;

      const evaluator = this.createEvaluator(constraint);
      const baseError = evaluator.evaluate(entities);

      for (const entityId of constraint.entities) {
        const entity = entities.get(entityId);
        if (!entity) continue;

        const entityGradients = gradients.get(entityId) ?? new Map<string, number>();

        // Numerical gradient for position
        if (entity.position) {
          for (let i = 0; i < 3; i++) {
            const delta = 1e-5;
            const posArray = [entity.position.x, entity.position.y, entity.position.z];
            posArray[i] += delta;
            const modifiedEntity = {
              ...entity,
              position: { x: posArray[0], y: posArray[1], z: posArray[2] },
            };

            const modifiedEntities = new Map(entities);
            modifiedEntities.set(entityId, modifiedEntity);

            const modifiedError = evaluator.evaluate(modifiedEntities);
            const gradient = (modifiedError - baseError) / delta;

            const paramKey = `pos_${i}`;
            entityGradients.set(paramKey, (entityGradients.get(paramKey) ?? 0) + gradient);
          }
        }

        // Compute gradients for other parameters
        for (const [paramKey, paramValue] of entity.parameters) {
          const delta = 1e-5;
          const modifiedEntity = { ...entity, parameters: new Map(entity.parameters) };
          modifiedEntity.parameters.set(paramKey, paramValue + delta);

          const modifiedEntities = new Map(entities);
          modifiedEntities.set(entityId, modifiedEntity);

          const modifiedError = evaluator.evaluate(modifiedEntities);
          const gradient = (modifiedError - baseError) / delta;

          entityGradients.set(paramKey, (entityGradients.get(paramKey) ?? 0) + gradient);
        }

        gradients.set(entityId, entityGradients);
      }
    }

    return gradients;
  }

  private computeUpdates(
    gradients: Map<string, Map<string, number>>,
    entities: Map<string, ConstraintEntity>
  ): Map<string, Map<string, number>> {
    const updates = new Map<string, Map<string, number>>();

    for (const [entityId, entityGradients] of gradients) {
      const entityUpdates = new Map<string, number>();

      for (const [paramKey, gradient] of entityGradients) {
        const stepSize = this.options.damping * 0.01;
        const update = -gradient * stepSize;
        entityUpdates.set(paramKey, update);
      }

      updates.set(entityId, entityUpdates);
    }

    return updates;
  }

  private applyUpdates(
    entities: Map<string, ConstraintEntity>,
    updates: Map<string, Map<string, number>>
  ): void {
    for (const [entityId, entityUpdates] of updates) {
      const entity = entities.get(entityId);
      if (!entity) continue;

      const updatedEntity = { ...entity };

      // Apply position updates
      if (entity.position) {
        const posX = entity.position.x + (entityUpdates.get('pos_0') ?? 0);
        const posY = entity.position.y + (entityUpdates.get('pos_1') ?? 0);
        const posZ = entity.position.z + (entityUpdates.get('pos_2') ?? 0);
        updatedEntity.position = { x: posX, y: posY, z: posZ };
      }

      // Apply parameter updates
      const newParams = new Map(entity.parameters);
      for (const [paramKey, update] of entityUpdates) {
        if (paramKey.startsWith('pos_')) continue;

        const currentValue = newParams.get(paramKey) ?? 0;
        newParams.set(paramKey, currentValue + update);
      }
      updatedEntity.parameters = newParams;

      entities.set(entityId, updatedEntity);
    }
  }

  private computeResidual(entities: Map<string, ConstraintEntity>): number {
    let totalError = 0;
    let constraintCount = 0;

    for (const constraint of this.constraints.values()) {
      if (!constraint.active) continue;

      const evaluator = this.createEvaluator(constraint);
      const error = evaluator.evaluate(entities);
      totalError += error * error;
      constraintCount++;
    }

    return constraintCount > 0 ? Math.sqrt(totalError / constraintCount) : 0;
  }

  private createEvaluator(constraint: Constraint): GeometricConstraint | DimensionalConstraint {
    const geometricTypes: Set<string> = new Set([
      'coincident',
      'parallel',
      'perpendicular',
      'tangent',
      'horizontal',
      'vertical',
      'concentric',
    ]);

    if (geometricTypes.has(constraint.type)) {
      return new GeometricConstraint(constraint);
    } else {
      return new DimensionalConstraint(constraint);
    }
  }

  private detectConflicts(entities: Map<string, ConstraintEntity>): string[] {
    const conflicts: string[] = [];
    const highErrorConstraints: Array<[string, number]> = [];

    for (const constraint of this.constraints.values()) {
      if (!constraint.active) continue;

      const evaluator = this.createEvaluator(constraint);
      const error = evaluator.evaluate(entities);

      if (error > this.options.tolerance * 10) {
        highErrorConstraints.push([constraint.id, error]);
      }
    }

    // Sort by error magnitude
    highErrorConstraints.sort((a, b) => b[1] - a[1]);

    // Report top conflicts
    for (const [constraintId] of highErrorConstraints.slice(0, 5)) {
      conflicts.push(constraintId);
    }

    return conflicts;
  }

  getEntities(): Map<string, ConstraintEntity> {
    return new Map(this.entities);
  }

  getConstraints(): Map<string, Constraint> {
    return new Map(this.constraints);
  }
}
