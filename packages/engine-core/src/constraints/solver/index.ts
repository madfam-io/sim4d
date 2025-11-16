/**
 * Newton-Raphson constraint solver for 2D parametric modeling
 */

import {
  ConstraintSystem,
  Constraint,
  GeometryElement,
  SolverConfig,
  SolverResult,
} from '../types';
import { ConstraintEvaluator } from '../evaluator';

/**
 * Default solver configuration
 */
const DEFAULT_CONFIG: SolverConfig = {
  maxIterations: 100,
  tolerance: 1e-6,
  dampingFactor: 1.0,
  enableDebug: false,
};

/**
 * Sparse matrix representation for Jacobian
 */
interface SparseMatrix {
  rows: number;
  cols: number;
  entries: Map<string, number>; // "row,col" -> value
}

/**
 * Newton-Raphson constraint solver
 */
export class ConstraintSolver {
  private config: SolverConfig;
  private evaluator: ConstraintEvaluator | null = null;

  constructor(config: Partial<SolverConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Solve constraint system using Newton-Raphson method
   */
  async solve(system: ConstraintSystem): Promise<SolverResult> {
    const startTime = performance.now();

    try {
      // Initialize evaluator
      this.evaluator = new ConstraintEvaluator(system.geometry, system.variables);

      // Get all variable names
      const variableNames = Array.from(system.variables.keys());
      const numVariables = variableNames.length;

      if (numVariables === 0) {
        return {
          success: true,
          iterations: 0,
          residual: 0,
          time: performance.now() - startTime,
          variables: new Map(system.variables),
        };
      }

      // Get active constraints
      const activeConstraints = Array.from(system.constraints.values())
        .filter((c) => c.enabled)
        .sort((a, b) => b.priority - a.priority);

      if (activeConstraints.length === 0) {
        return {
          success: true,
          iterations: 0,
          residual: 0,
          time: performance.now() - startTime,
          variables: new Map(system.variables),
        };
      }

      // Current variable values
      const variables = new Map(system.variables);
      let iteration = 0;
      let residual = Infinity;

      // Newton-Raphson iterations
      for (iteration = 0; iteration < this.config.maxIterations; iteration++) {
        // Update evaluator with current variables
        this.evaluator = new ConstraintEvaluator(system.geometry, variables);

        // Evaluate all constraints
        const evaluations = activeConstraints.map((constraint) =>
          this.evaluator!.evaluate(constraint)
        );

        // Build residual vector (constraint function values)
        const residualVector = evaluations.map((evaluation) => evaluation.value);
        residual = this.computeResidualNorm(residualVector);

        if (this.config.enableDebug) {
          console.log(`Iteration ${iteration}: residual = ${residual}`);
        }

        // Check convergence
        if (residual < this.config.tolerance) {
          system.solved = true;
          system.lastSolveTime = performance.now() - startTime;
          system.iterations = iteration;
          break;
        }

        // Build Jacobian matrix (constraint gradients)
        const jacobian = this.buildJacobian(evaluations, variableNames);

        // Solve linear system: J * delta = -residual
        const delta = this.solveLinearSystem(jacobian, residualVector, variableNames);

        if (!delta) {
          return {
            success: false,
            iterations: iteration,
            residual,
            time: performance.now() - startTime,
            error: 'Failed to solve linear system',
            variables,
          };
        }

        // Update variables with damping
        this.updateVariables(variables, delta, variableNames);
      }

      // Update system state
      system.variables = variables;
      system.solved = residual < this.config.tolerance;
      system.lastSolveTime = performance.now() - startTime;
      system.iterations = iteration;

      return {
        success: system.solved,
        iterations: iteration,
        residual,
        time: performance.now() - startTime,
        variables,
        error: system.solved ? undefined : 'Maximum iterations reached',
      };
    } catch (error) {
      return {
        success: false,
        iterations: 0,
        residual: Infinity,
        time: performance.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown solver error',
        variables: new Map(system.variables),
      };
    }
  }

  /**
   * Build Jacobian matrix from constraint evaluations
   */
  private buildJacobian(
    evaluations: Array<{ value: number; gradient: number[]; variables: string[] }>,
    allVariables: string[]
  ): SparseMatrix {
    const numConstraints = evaluations.length;
    const numVariables = allVariables.length;

    const jacobian: SparseMatrix = {
      rows: numConstraints,
      cols: numVariables,
      entries: new Map(),
    };

    // Build variable index map
    const variableIndex = new Map<string, number>();
    allVariables.forEach((name, index) => {
      variableIndex.set(name, index);
    });

    // Fill Jacobian entries
    evaluations.forEach((evaluation, constraintIndex) => {
      evaluation.variables.forEach((varName, gradientIndex) => {
        const varIndex = variableIndex.get(varName);
        if (varIndex !== undefined) {
          const key = `${constraintIndex},${varIndex}`;
          jacobian.entries.set(key, evaluation.gradient[gradientIndex]);
        }
      });
    });

    return jacobian;
  }

  /**
   * Solve linear system using simplified method
   * For production, use proper sparse matrix solver (e.g., LDLT, QR)
   */
  private solveLinearSystem(
    jacobian: SparseMatrix,
    residual: number[],
    variableNames: string[]
  ): Map<string, number> | null {
    const n = jacobian.cols;
    const m = jacobian.rows;

    if (n === 0 || m === 0) return new Map();

    // Convert to dense matrices for simplicity
    // Production code should use sparse matrix libraries
    const J = this.sparseToDense(jacobian);
    const r = residual;

    try {
      // Solve normal equations: (J^T * J) * delta = -J^T * r
      const JT = this.transpose(J);
      const JTJ = this.multiply(JT, J);
      const JTr = this.multiplyVector(JT, r);

      // Negate for Newton step
      const negJTr = JTr.map((x) => -x);

      // Solve using simple Gauss elimination (replace with proper solver)
      const deltaArray = this.gaussElimination(JTJ, negJTr);

      if (!deltaArray) return null;

      // Convert back to map
      const delta = new Map<string, number>();
      variableNames.forEach((name, index) => {
        delta.set(name, deltaArray[index] || 0);
      });

      return delta;
    } catch (error) {
      if (this.config.enableDebug) {
        console.error('Linear system solve failed:', error);
      }
      return null;
    }
  }

  /**
   * Update variables with Newton step and damping
   */
  private updateVariables(
    variables: Map<string, number>,
    delta: Map<string, number>,
    variableNames: string[]
  ): void {
    variableNames.forEach((name) => {
      const currentValue = variables.get(name) || 0;
      const deltaValue = delta.get(name) || 0;
      const newValue = currentValue + this.config.dampingFactor * deltaValue;
      variables.set(name, newValue);
    });
  }

  /**
   * Compute L2 norm of residual vector
   */
  private computeResidualNorm(residual: number[]): number {
    return Math.sqrt(residual.reduce((sum, r) => sum + r * r, 0));
  }

  /**
   * Convert sparse matrix to dense (for simple implementation)
   */
  private sparseToDense(sparse: SparseMatrix): number[][] {
    const dense: number[][] = [];

    for (let i = 0; i < sparse.rows; i++) {
      dense[i] = new Array(sparse.cols).fill(0);
      for (let j = 0; j < sparse.cols; j++) {
        const key = `${i},${j}`;
        dense[i][j] = sparse.entries.get(key) || 0;
      }
    }

    return dense;
  }

  /**
   * Matrix transpose
   */
  private transpose(matrix: number[][]): number[][] {
    const rows = matrix.length;
    const cols = matrix[0]?.length || 0;
    const result: number[][] = [];

    for (let j = 0; j < cols; j++) {
      result[j] = [];
      for (let i = 0; i < rows; i++) {
        result[j][i] = matrix[i][j];
      }
    }

    return result;
  }

  /**
   * Matrix multiplication
   */
  private multiply(A: number[][], B: number[][]): number[][] {
    const rowsA = A.length;
    const colsA = A[0]?.length || 0;
    const colsB = B[0]?.length || 0;

    const result: number[][] = [];

    for (let i = 0; i < rowsA; i++) {
      result[i] = [];
      for (let j = 0; j < colsB; j++) {
        let sum = 0;
        for (let k = 0; k < colsA; k++) {
          sum += A[i][k] * B[k][j];
        }
        result[i][j] = sum;
      }
    }

    return result;
  }

  /**
   * Matrix-vector multiplication
   */
  private multiplyVector(matrix: number[][], vector: number[]): number[] {
    const rows = matrix.length;
    const result: number[] = [];

    for (let i = 0; i < rows; i++) {
      let sum = 0;
      for (let j = 0; j < vector.length; j++) {
        sum += matrix[i][j] * vector[j];
      }
      result[i] = sum;
    }

    return result;
  }

  /**
   * Simple Gauss elimination for small systems
   * Production code should use LAPACK or similar
   */
  private gaussElimination(A: number[][], b: number[]): number[] | null {
    const n = A.length;
    if (n !== b.length || n === 0) return null;

    // Create augmented matrix
    const augmented: number[][] = [];
    for (let i = 0; i < n; i++) {
      augmented[i] = [...A[i], b[i]];
    }

    // Forward elimination
    for (let i = 0; i < n; i++) {
      // Find pivot
      let maxRow = i;
      for (let k = i + 1; k < n; k++) {
        if (Math.abs(augmented[k][i]) > Math.abs(augmented[maxRow][i])) {
          maxRow = k;
        }
      }

      // Swap rows
      if (maxRow !== i) {
        [augmented[i], augmented[maxRow]] = [augmented[maxRow], augmented[i]];
      }

      // Check for singular matrix
      if (Math.abs(augmented[i][i]) < 1e-12) {
        return null; // Singular matrix
      }

      // Eliminate column
      for (let k = i + 1; k < n; k++) {
        const factor = augmented[k][i] / augmented[i][i];
        for (let j = i; j <= n; j++) {
          augmented[k][j] -= factor * augmented[i][j];
        }
      }
    }

    // Back substitution
    const x = new Array(n).fill(0);
    for (let i = n - 1; i >= 0; i--) {
      x[i] = augmented[i][n];
      for (let j = i + 1; j < n; j++) {
        x[i] -= augmented[i][j] * x[j];
      }
      x[i] /= augmented[i][i];
    }

    return x;
  }
}
