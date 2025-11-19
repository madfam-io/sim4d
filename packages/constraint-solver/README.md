# @brepflow/constraint-solver

Parametric constraint solving engine for 2D/3D geometric constraints in BrepFlow.

## Overview

The constraint solver package provides Newton-Raphson based constraint solving for parametric CAD operations. It supports:

- **2D Constraints** - Distance, angle, parallel, perpendicular, tangent, etc.
- **3D Constraints** - Spatial constraints for solid modeling
- **Dimensional Constraints** - Parametric dimensions and relations
- **Geometric Constraints** - Coincident, concentric, equal, symmetric
- **Multiple Methods** - Newton-Raphson, gradient descent, hybrid
- **Conflict Detection** - Identify over-constrained systems
- **High Performance** - Convergence in <100 iterations typical

## Installation

```bash
pnpm add @brepflow/constraint-solver
```

## Quick Start

### 2D Sketch Constraints

```typescript
import { Solver2D, createDistanceConstraint, createParallelConstraint } from '@brepflow/constraint-solver';

// Create solver
const solver = new Solver2D();

// Define points
const p1 = { id: 'p1', x: 0, y: 0, fixed: true };
const p2 = { id: 'p2', x: 100, y: 0 };
const p3 = { id: 'p3', x: 100, y: 50 };
const p4 = { id: 'p4', x: 0, y: 50 };

// Add distance constraint
solver.addConstraint(
  createDistanceConstraint('p1-p2-dist', [p1, p2], 100)
);

// Add parallel constraint
solver.addConstraint(
  createParallelConstraint('p1p2-p3p4-parallel', [p1, p2, p3, p4])
);

// Solve
const result = solver.solve();

if (result.success) {
  console.log('Solved in', result.iterations, 'iterations');
  console.log('Final positions:', result.variables);
} else {
  console.error('Failed to solve:', result.error);
}
```

## API Reference

### Solver2D

2D constraint solver using Newton-Raphson method.

#### Constructor

```typescript
new Solver2D(options?: SolverOptions)
```

**Options:**

```typescript
interface SolverOptions {
  maxIterations?: number;     // Default: 100
  tolerance?: number;          // Default: 1e-8
  damping?: number;            // Default: 0.8
  method?: 'newton-raphson' | 'gradient-descent' | 'hybrid';
  verbose?: boolean;           // Log solver iterations
}
```

#### Methods

##### Constraint Management

```typescript
// Add constraint
solver.addConstraint(constraint: Constraint2D): void

// Remove constraint
solver.removeConstraint(id: string): void

// Clear all constraints
solver.clear(): void

// Get all constraints
solver.getConstraints(): Constraint2D[]

// Enable/disable constraint
solver.setConstraintEnabled(id: string, enabled: boolean): void
```

##### Variable Management

```typescript
// Add variable
solver.addVariable(variable: Variable): void

// Set initial values
solver.setInitialValues(values: Record<string, number>): void

// Get current values
solver.getVariableValues(): Record<string, number>

// Lock/unlock variable
solver.setVariableFixed(id: string, fixed: boolean): void
```

##### Solving

```typescript
// Solve constraint system
solver.solve(): SolveResult

// Single iteration (for debugging)
solver.solveStep(): SolveResult

// Check if system is well-constrained
solver.checkDOF(): {
  dof: number;
  status: 'under-constrained' | 'well-constrained' | 'over-constrained';
}
```

**SolveResult:**

```typescript
interface SolveResult {
  success: boolean;             // True if converged
  iterations: number;           // Number of iterations
  residual: number;             // Final error
  variables: Record<string, number>; // Solution values
  error?: string;               // Error message if failed
}
```

### Constraint Types

#### Geometric Constraints

##### Distance Constraint

Maintains fixed distance between two points.

```typescript
import { createDistanceConstraint } from '@brepflow/constraint-solver';

const constraint = createDistanceConstraint(
  'distance-1',
  [point1, point2],
  100 // target distance
);
```

##### Angle Constraint

Maintains angle between two lines.

```typescript
import { createAngleConstraint } from '@brepflow/constraint-solver';

const constraint = createAngleConstraint(
  'angle-1',
  [line1, line2],
  90 // angle in degrees
);
```

##### Parallel Constraint

Makes two lines parallel.

```typescript
import { createParallelConstraint } from '@brepflow/constraint-solver';

const constraint = createParallelConstraint(
  'parallel-1',
  [p1, p2, p3, p4] // Two lines defined by point pairs
);
```

##### Perpendicular Constraint

Makes two lines perpendicular.

```typescript
import { createPerpendicularConstraint } from '@brepflow/constraint-solver';

const constraint = createPerpendicularConstraint(
  'perpendicular-1',
  [line1, line2]
);
```

##### Coincident Constraint

Makes two points coincident (same position).

```typescript
import { createCoincidentConstraint } from '@brepflow/constraint-solver';

const constraint = createCoincidentConstraint(
  'coincident-1',
  [point1, point2]
);
```

##### Tangent Constraint

Makes line tangent to circle or arc.

```typescript
import { createTangentConstraint } from '@brepflow/constraint-solver';

const constraint = createTangentConstraint(
  'tangent-1',
  [line, circle]
);
```

##### Concentric Constraint

Makes two circles concentric (same center).

```typescript
const constraint = {
  id: 'concentric-1',
  type: 'concentric' as const,
  entities: [circle1, circle2],
};
```

#### Dimensional Constraints

##### Horizontal Constraint

Makes line horizontal.

```typescript
import { createHorizontalConstraint } from '@brepflow/constraint-solver';

const constraint = createHorizontalConstraint(
  'horizontal-1',
  [point1, point2]
);
```

##### Vertical Constraint

Makes line vertical.

```typescript
import { createVerticalConstraint } from '@brepflow/constraint-solver';

const constraint = createVerticalConstraint(
  'vertical-1',
  [point1, point2]
);
```

##### Fixed Constraint

Fixes point or entity position.

```typescript
import { createFixedConstraint } from '@brepflow/constraint-solver';

const constraint = createFixedConstraint(
  'fixed-1',
  point,
  { x: 100, y: 50 } // fixed position
);
```

##### Equal Constraint

Makes two dimensions equal.

```typescript
import { createEqualConstraint } from '@brepflow/constraint-solver';

const constraint = createEqualConstraint(
  'equal-1',
  [length1, length2]
);
```

##### Radius Constraint

Fixes circle/arc radius.

```typescript
import { createRadiusConstraint } from '@brepflow/constraint-solver';

const constraint = createRadiusConstraint(
  'radius-1',
  circle,
  25 // radius value
);
```

### 3D Constraint Solver

For 3D spatial constraints.

```typescript
import { ConstraintSolver, ConstraintEntity, Constraint } from '@brepflow/constraint-solver';

const solver = new ConstraintSolver({
  maxIterations: 200,
  tolerance: 1e-6,
});

// Define 3D entities
const point1: ConstraintEntity = {
  id: 'p1',
  type: 'point',
  position: [0, 0, 0],
  parameters: new Map([
    ['x', 0],
    ['y', 0],
    ['z', 0],
  ]),
};

const plane: ConstraintEntity = {
  id: 'plane1',
  type: 'plane',
  position: [0, 0, 10],
  normal: [0, 0, 1],
  parameters: new Map([
    ['d', 10], // distance from origin
  ]),
};

// Add constraint
solver.addEntity(point1);
solver.addEntity(plane);

solver.addConstraint({
  id: 'point-on-plane',
  type: 'coincident',
  entities: ['p1', 'plane1'],
  active: true,
});

// Solve
const result = solver.solve();
```

## Examples

### Example 1: Rectangle with Fixed Dimensions

```typescript
import { Solver2D, createDistanceConstraint, createFixedConstraint } from '@brepflow/constraint-solver';

const solver = new Solver2D();

// Define corner points
const p1 = { id: 'p1', x: 0, y: 0 };
const p2 = { id: 'p2', x: 100, y: 0 };
const p3 = { id: 'p3', x: 100, y: 50 };
const p4 = { id: 'p4', x: 0, y: 50 };

// Fix bottom-left corner
solver.addConstraint(
  createFixedConstraint('fix-p1', p1, { x: 0, y: 0 })
);

// Width constraint
solver.addConstraint(
  createDistanceConstraint('width', [p1, p2], 100)
);

// Height constraint
solver.addConstraint(
  createDistanceConstraint('height', [p1, p4], 50)
);

// Perpendicularity
solver.addConstraint({
  id: 'perpendicular',
  type: 'perpendicular',
  entities: [p1, p2, p1, p4],
});

const result = solver.solve();
console.log('Rectangle solved:', result.success);
```

### Example 2: Parametric Slot

```typescript
import { Solver2D } from '@brepflow/constraint-solver';

function createSlot(centerX: number, centerY: number, length: number, width: number) {
  const solver = new Solver2D();

  // Slot is two circles connected by parallel lines
  const c1 = { id: 'c1', x: centerX - length / 2, y: centerY };
  const c2 = { id: 'c2', x: centerX + length / 2, y: centerY };

  // Fix first circle center
  solver.addConstraint({
    id: 'fix-c1',
    type: 'fixed',
    entities: [c1],
    targetValue: { x: c1.x, y: c1.y },
  });

  // Distance between circles
  solver.addConstraint({
    id: 'slot-length',
    type: 'distance',
    entities: [c1, c2],
    targetValue: length,
  });

  // Horizontal alignment
  solver.addConstraint({
    id: 'horizontal',
    type: 'horizontal',
    entities: [c1, c2],
  });

  // Add radius constraints
  solver.addConstraint({
    id: 'radius1',
    type: 'radius',
    entities: [c1],
    targetValue: width / 2,
  });

  solver.addConstraint({
    id: 'radius2',
    type: 'radius',
    entities: [c2],
    targetValue: width / 2,
  });

  const result = solver.solve();
  return result;
}

const slotSolution = createSlot(0, 0, 100, 20);
```

### Example 3: Tangent Circle Pattern

```typescript
import { Solver2D, createTangentConstraint, createRadiusConstraint } from '@brepflow/constraint-solver';

function createTangentCircles(count: number, baseRadius: number) {
  const solver = new Solver2D();

  const circles = [];

  // Create base circle (fixed)
  const baseCircle = {
    id: 'base',
    center: { x: 0, y: 0 },
    radius: baseRadius,
  };

  circles.push(baseCircle);

  solver.addConstraint({
    id: 'fix-base',
    type: 'fixed',
    entities: [baseCircle.center],
    targetValue: { x: 0, y: 0 },
  });

  // Create surrounding circles
  const angleStep = (2 * Math.PI) / count;

  for (let i = 0; i < count; i++) {
    const angle = i * angleStep;
    const distance = baseRadius * 2;

    const circle = {
      id: `circle-${i}`,
      center: {
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
      },
      radius: baseRadius,
    };

    circles.push(circle);

    // Tangent to base circle
    solver.addConstraint(
      createTangentConstraint(`tangent-${i}`, [baseCircle, circle])
    );

    // Equal radius
    solver.addConstraint(
      createRadiusConstraint(`radius-${i}`, circle, baseRadius)
    );

    // Tangent to neighbors
    if (i > 0) {
      solver.addConstraint(
        createTangentConstraint(`neighbor-${i}`, [circles[i], circles[i + 1]])
      );
    }
  }

  // Close the pattern
  solver.addConstraint(
    createTangentConstraint('close', [circles[count], circles[1]])
  );

  const result = solver.solve();
  return { circles, result };
}

const pattern = createTangentCircles(6, 10);
```

### Example 4: Interactive Constraint Solving

```typescript
import { Solver2D } from '@brepflow/constraint-solver';

class InteractiveSketch {
  private solver = new Solver2D({ verbose: true });
  private points = new Map<string, Point2D>();

  addPoint(id: string, x: number, y: number, fixed = false) {
    const point = { id, x, y, fixed };
    this.points.set(id, point);
    return point;
  }

  addDistanceConstraint(p1Id: string, p2Id: string, distance: number) {
    const p1 = this.points.get(p1Id);
    const p2 = this.points.get(p2Id);

    if (p1 && p2) {
      this.solver.addConstraint({
        id: `dist-${p1Id}-${p2Id}`,
        type: 'distance',
        entities: [p1, p2],
        targetValue: distance,
      });
    }
  }

  dragPoint(id: string, newX: number, newY: number) {
    const point = this.points.get(id);
    if (!point || point.fixed) return;

    // Update point position
    point.x = newX;
    point.y = newY;

    // Resolve constraints
    const result = this.solver.solve();

    if (result.success) {
      // Update all points with solved positions
      for (const [id, value] of Object.entries(result.variables)) {
        const point = this.points.get(id);
        if (point) {
          if (id.endsWith('-x')) {
            point.x = value;
          } else if (id.endsWith('-y')) {
            point.y = value;
          }
        }
      }
    }

    return result;
  }

  getPoints() {
    return Array.from(this.points.values());
  }
}

// Usage
const sketch = new InteractiveSketch();
sketch.addPoint('p1', 0, 0, true); // Fixed point
sketch.addPoint('p2', 100, 0);
sketch.addPoint('p3', 100, 100);

sketch.addDistanceConstraint('p1', 'p2', 100);
sketch.addDistanceConstraint('p2', 'p3', 100);

// Simulate dragging p3
sketch.dragPoint('p3', 150, 80);
console.log('Updated points:', sketch.getPoints());
```

## Advanced Usage

### Custom Constraint Implementation

```typescript
import { Constraint2D, Point2D } from '@brepflow/constraint-solver';

// Create custom midpoint constraint
function createMidpointConstraint(
  id: string,
  p1: Point2D,
  p2: Point2D,
  midpoint: Point2D
): Constraint2D[] {
  return [
    {
      id: `${id}-x`,
      type: 'equal',
      entities: [p1, p2, midpoint],
      targetValue: 0, // (p1.x + p2.x) / 2 - midpoint.x = 0
    },
    {
      id: `${id}-y`,
      type: 'equal',
      entities: [p1, p2, midpoint],
      targetValue: 0, // (p1.y + p2.y) / 2 - midpoint.y = 0
    },
  ];
}
```

### Conflict Detection

```typescript
import { Solver2D } from '@brepflow/constraint-solver';

const solver = new Solver2D({ verbose: true });

// Add conflicting constraints
solver.addConstraint({ /* constraint 1 */ });
solver.addConstraint({ /* constraint 2 */ }); // Conflicts with constraint 1

const dof = solver.checkDOF();

if (dof.status === 'over-constrained') {
  console.warn('System is over-constrained!');
  console.warn('Degrees of freedom:', dof.dof);

  // Try to identify conflicting constraints
  const result = solver.solve();
  if (!result.success && result.error) {
    console.error('Conflict:', result.error);
  }
}
```

### Incremental Solving

```typescript
import { Solver2D } from '@brepflow/constraint-solver';

const solver = new Solver2D();

// Add base constraints
solver.addConstraint(/* base constraints */);
solver.solve();

// Add incremental constraint
solver.addConstraint(/* new constraint */);
const result = solver.solve();

// If fails, remove last constraint
if (!result.success) {
  solver.removeConstraint('last-constraint-id');
  console.warn('Constraint rejected due to conflict');
}
```

### Performance Optimization

```typescript
import { Solver2D } from '@brepflow/constraint-solver';

// For large systems
const solver = new Solver2D({
  maxIterations: 200,
  tolerance: 1e-6,
  damping: 0.9, // Higher damping for stability
  method: 'hybrid', // Combines Newton-Raphson and gradient descent
});

// Set good initial guess
solver.setInitialValues({
  'point1-x': 100,
  'point1-y': 50,
  // ... other variables
});

// Solve
const result = solver.solve();
console.log(`Converged in ${result.iterations} iterations`);
```

## Performance Characteristics

### Typical Performance

- **Small systems** (< 10 constraints): < 10 iterations, < 1ms
- **Medium systems** (10-50 constraints): 10-30 iterations, 1-10ms
- **Large systems** (50-200 constraints): 30-100 iterations, 10-50ms
- **Very large** (> 200 constraints): May require hybrid method

### Convergence Tips

1. **Good initial guess** - Set initial values close to solution
2. **Constraint ordering** - Add constraints incrementally
3. **Fixed points** - Fix at least one point to anchor system
4. **Damping** - Adjust damping factor (0.6-0.9)
5. **Hybrid method** - Use for difficult systems

## Solver Methods

### Newton-Raphson (Default)

- Fast convergence for well-posed problems
- Requires Jacobian computation
- May diverge for poor initial guess

### Gradient Descent

- More robust but slower
- Good for poorly initialized systems
- Always converges (eventually)

### Hybrid

- Starts with gradient descent
- Switches to Newton-Raphson near solution
- Best of both worlds

## Troubleshooting

### Solver Not Converging

**Symptoms**: `result.success === false`, high residual

**Solutions**:
1. Check for over-constrained system: `solver.checkDOF()`
2. Provide better initial values
3. Increase max iterations
4. Increase damping factor
5. Try hybrid method

### Over-Constrained System

**Symptoms**: DOF < 0, conflicting constraints

**Solutions**:
1. Remove redundant constraints
2. Check for duplicate constraints
3. Use priority levels to resolve conflicts

### Under-Constrained System

**Symptoms**: DOF > 0, multiple solutions

**Solutions**:
1. Add more constraints
2. Fix additional points
3. Add dimensional constraints

### Slow Performance

**Solutions**:
1. Reduce constraint count
2. Use sparse matrix solver (for large systems)
3. Simplify constraint graph
4. Cache solver instances

## Testing

```typescript
import { Solver2D, createDistanceConstraint } from '@brepflow/constraint-solver';
import { describe, it, expect } from 'vitest';

describe('Constraint Solver', () => {
  it('should solve distance constraint', () => {
    const solver = new Solver2D();

    const p1 = { id: 'p1', x: 0, y: 0, fixed: true };
    const p2 = { id: 'p2', x: 50, y: 0 };

    solver.addConstraint(
      createDistanceConstraint('dist', [p1, p2], 100)
    );

    const result = solver.solve();

    expect(result.success).toBe(true);
    expect(result.iterations).toBeLessThan(50);

    const finalDist = Math.sqrt(
      (p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2
    );
    expect(finalDist).toBeCloseTo(100, 6);
  });
});
```

## Resources

- [Constraint Solving in CAD](https://en.wikipedia.org/wiki/Geometric_constraint_solving)
- [Newton-Raphson Method](https://en.wikipedia.org/wiki/Newton%27s_method)
- [API Documentation](../../docs/api/API_OVERVIEW.md)

## License

MPL-2.0 - See LICENSE in repository root
