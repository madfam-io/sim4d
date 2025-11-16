import type { Point2D, Constraint2D, Variable, SolveResult } from './types';

export class Solver2D {
  private constraints: Constraint2D[] = [];
  private variables: Variable[] = [];
  private parameters: number[] = [];

  // Solver parameters
  private readonly TOLERANCE = 1e-8;
  private readonly MAX_ITERATIONS = 100;
  private readonly DAMPING_FACTOR = 0.8;

  constructor() {
    // Initialize solver
  }

  /**
   * Add a constraint to the solver
   */
  addConstraint(constraint: Constraint2D): void {
    this.constraints.push(constraint);
  }

  /**
   * Add a variable to the solver
   */
  addVariable(variable: Variable): void {
    this.variables.push(variable);
    this.parameters.push(variable.value);
  }

  /**
   * Remove all constraints and variables
   */
  clear(): void {
    this.constraints = [];
    this.variables = [];
    this.parameters = [];
  }

  /**
   * Get current variable values
   */
  getVariableValues(): { [id: string]: number } {
    const result: { [id: string]: number } = {};
    for (let i = 0; i < this.variables.length; i++) {
      result[this.variables[i].id] = this.parameters[i];
    }
    return result;
  }

  /**
   * Set initial values for variables
   */
  setInitialValues(values: { [id: string]: number }): void {
    for (let i = 0; i < this.variables.length; i++) {
      const variable = this.variables[i];
      if (values[variable.id] !== undefined) {
        this.parameters[i] = values[variable.id];
        variable.value = values[variable.id];
      }
    }
  }

  /**
   * Solve the constraint system using Newton-Raphson method
   */
  solve(): SolveResult {
    if (this.constraints.length === 0) {
      return {
        success: true,
        iterations: 0,
        residual: 0,
        variables: this.getVariableValues(),
      };
    }

    if (this.parameters.length === 0) {
      return {
        success: true,
        iterations: 0,
        residual: 0,
        variables: {},
      };
    }

    let iteration = 0;
    let error = Number.MAX_VALUE;

    while (iteration < this.MAX_ITERATIONS && error > this.TOLERANCE) {
      const residuals = this.computeResiduals();
      const jacobian = this.computeJacobian();

      // Solve J * delta = -R for parameter updates
      const delta = this.solveLinearSystem(jacobian, residuals);

      // Apply damped update
      for (let i = 0; i < this.parameters.length; i++) {
        const update = delta[i] ?? 0;
        this.parameters[i] += this.DAMPING_FACTOR * update;
      }

      // Update entities with new parameters
      this.updateEntities();

      // Calculate error
      error = Math.sqrt(residuals.reduce((sum, r) => sum + r * r, 0));
      iteration++;
    }

    return {
      success: error <= this.TOLERANCE,
      iterations: iteration,
      residual: error,
      variables: this.getVariableValues(),
    };
  }

  /**
   * Update entity positions based on current parameter values
   */
  private updateEntities(): void {
    for (let i = 0; i < this.variables.length; i++) {
      this.variables[i].value = this.parameters[i];
    }
  }

  /**
   * Compute constraint residuals
   */
  private computeResiduals(): number[] {
    const residuals: number[] = [];

    for (const constraint of this.constraints) {
      switch (constraint.type) {
        case 'distance':
          if (constraint.entities.length >= 2) {
            const p1 = constraint.entities[0] as Point2D;
            const p2 = constraint.entities[1] as Point2D;
            const dist = Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
            const target = typeof constraint.targetValue === 'number' ? constraint.targetValue : 0;
            residuals.push(dist - target);
          }
          break;

        case 'horizontal':
          if (constraint.entities.length >= 2) {
            const p1 = constraint.entities[0] as Point2D;
            const p2 = constraint.entities[1] as Point2D;
            residuals.push(p1.y - p2.y);
          }
          break;

        case 'vertical':
          if (constraint.entities.length >= 2) {
            const p1 = constraint.entities[0] as Point2D;
            const p2 = constraint.entities[1] as Point2D;
            residuals.push(p1.x - p2.x);
          }
          break;

        case 'coincident':
          if (constraint.entities.length >= 2) {
            const p1 = constraint.entities[0] as Point2D;
            const p2 = constraint.entities[1] as Point2D;
            residuals.push(p1.x - p2.x);
            residuals.push(p1.y - p2.y);
          }
          break;

        case 'fixed':
          if (constraint.entities.length >= 1) {
            const p = constraint.entities[0] as Point2D;
            const target =
              constraint.targetValue && typeof constraint.targetValue === 'object'
                ? (constraint.targetValue as { x: number; y: number })
                : { x: p.x, y: p.y };
            if (typeof target.x === 'number' && typeof target.y === 'number') {
              residuals.push(p.x - target.x);
              residuals.push(p.y - target.y);
            }
          }
          break;

        default:
          // Skip unknown constraint types
          break;
      }
    }

    return residuals;
  }

  /**
   * Compute Jacobian matrix (partial derivatives of constraints w.r.t. parameters)
   */
  private computeJacobian(): number[][] {
    const numConstraints = this.computeResiduals().length;
    const numParams = this.parameters.length;

    if (numConstraints === 0 || numParams === 0) {
      return [];
    }

    const jacobian: number[][] = [];
    const epsilon = 1e-8;

    for (let i = 0; i < numConstraints; i++) {
      jacobian[i] = [];

      for (let j = 0; j < numParams; j++) {
        // Compute partial derivative using finite differences
        const originalParam = this.parameters[j];

        // Forward difference
        this.parameters[j] = originalParam + epsilon;
        this.updateEntities();
        const residualsPlus = this.computeResiduals();

        // Backward difference
        this.parameters[j] = originalParam - epsilon;
        this.updateEntities();
        const residualsMinus = this.computeResiduals();

        // Restore original value
        this.parameters[j] = originalParam;
        this.updateEntities();

        // Central difference
        const forward = Number(residualsPlus[i] ?? 0);
        const backward = Number(residualsMinus[i] ?? 0);
        const derivative = (forward - backward) / (2 * epsilon);
        jacobian[i][j] = derivative;
      }
    }

    return jacobian;
  }

  /**
   * Solve linear system using Gaussian elimination
   */
  private solveLinearSystem(A: number[][], b: number[]): number[] {
    if (A.length === 0 || b.length === 0) {
      return [];
    }

    const n = b.length;
    const m = A[0]?.length || 0;

    if (m === 0) {
      return [];
    }

    // Use least squares if overdetermined
    if (n > m) {
      return this.leastSquares(A, b);
    }

    // Standard Gaussian elimination for square or underdetermined systems
    const augmented = A.map((row, i) => {
      const rhs = -(b[i] ?? 0);
      return [...row, rhs];
    });

    // Forward elimination
    for (let i = 0; i < Math.min(n, m); i++) {
      // Find pivot
      let maxRow = i;
      for (let k = i + 1; k < n; k++) {
        if (Math.abs(augmented[k][i]) > Math.abs(augmented[maxRow][i])) {
          maxRow = k;
        }
      }

      // Swap rows
      [augmented[i], augmented[maxRow]] = [augmented[maxRow], augmented[i]];

      // Skip if pivot is too small
      if (Math.abs(augmented[i][i]) < 1e-12) {
        continue;
      }

      // Eliminate column
      for (let k = i + 1; k < n; k++) {
        const factor = augmented[k][i] / augmented[i][i];
        for (let j = i; j <= m; j++) {
          augmented[k][j] -= factor * augmented[i][j];
        }
      }
    }

    // Back substitution
    const solution = new Array(m).fill(0);
    for (let i = Math.min(n, m) - 1; i >= 0; i--) {
      if (Math.abs(augmented[i][i]) < 1e-12) {
        continue;
      }

      solution[i] = augmented[i][m];
      for (let j = i + 1; j < m; j++) {
        solution[i] -= augmented[i][j] * solution[j];
      }
      solution[i] /= augmented[i][i];
    }

    return solution;
  }

  /**
   * Solve overdetermined system using least squares
   */
  private leastSquares(A: number[][], b: number[]): number[] {
    try {
      // Use numeric.js for least squares solution
      // Solve A^T * A * x = A^T * b
      const rows = A.length;
      const cols = A[0]?.length ?? 0;
      if (!rows || !cols) {
        return [];
      }

      const ATA: number[][] = Array.from({ length: cols }, () => Array(cols).fill(0));
      const ATb: number[] = Array(cols).fill(0);

      for (let i = 0; i < rows; i++) {
        const row = A[i] ?? [];
        const bi = b[i] ?? 0;
        for (let j = 0; j < cols; j++) {
          const aij = row[j] ?? 0;
          ATb[j] += aij * bi;
          for (let k = 0; k < cols; k++) {
            ATA[j][k] += aij * (row[k] ?? 0);
          }
        }
      }

      return this.solveLinearSystem(ATA, ATb);
    } catch (e) {
      console.warn('Least squares failed, using fallback:', e);
      return new Array(A[0]?.length || 0).fill(0);
    }
  }
}
