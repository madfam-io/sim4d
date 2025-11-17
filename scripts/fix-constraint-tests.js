#!/usr/bin/env node
/**
 * Script to fix constraint-solver test entity references
 * Changes from passing Point2D objects to passing entity IDs
 */

import { readFileSync, writeFileSync } from 'fs';

const filePath = 'packages/constraint-solver/src/solver-2d.comprehensive.test.ts';
let content = readFileSync(filePath, 'utf-8');

// Pattern to find test cases with Point2D declarations and constraints
const fixes = [
  // Fix: zero distance constraint
  {
    before:
      /const p1: Point2D = \{ id: 'p1', x: 0, y: 0 \};\s+const p2: Point2D = \{ id: 'p2', x: 0, y: 0 \};\s+const constraint: Constraint2D = \{\s+id: 'dist1',\s+type: 'distance',\s+entities: \[p1, p2\],/s,
    after: `const p1: Point2D = { id: 'p1', x: 0, y: 0 };
      const p2: Point2D = { id: 'p2', x: 0, y: 0 };

      solver.addEntity(p1);
      solver.addEntity(p2);

      const constraint: Constraint2D = {
        id: 'dist1',
        type: 'distance',
        entities: ['p1', 'p2'],`,
  },
  // Fix: insufficient entities
  {
    before:
      /const p1: Point2D = \{ id: 'p1', x: 0, y: 0 \};\s+const constraint: Constraint2D = \{\s+id: 'dist1',\s+type: 'distance',\s+entities: \[p1\],/s,
    after: `const p1: Point2D = { id: 'p1', x: 0, y: 0 };

      solver.addEntity(p1);

      const constraint: Constraint2D = {
        id: 'dist1',
        type: 'distance',
        entities: ['p1'],`,
  },
  // Fix: horizontal constraint
  {
    before:
      /const p1: Point2D = \{ id: 'p1', x: 0, y: 5 \};\s+const p2: Point2D = \{ id: 'p2', x: 10, y: 5 \};\s+const constraint: Constraint2D = \{\s+id: 'horiz1',\s+type: 'horizontal',\s+entities: \[p1, p2\],/s,
    after: `const p1: Point2D = { id: 'p1', x: 0, y: 5 };
      const p2: Point2D = { id: 'p2', x: 10, y: 5 };

      solver.addEntity(p1);
      solver.addEntity(p2);

      const constraint: Constraint2D = {
        id: 'horiz1',
        type: 'horizontal',
        entities: ['p1', 'p2'],`,
  },
  // Fix: vertical constraint
  {
    before:
      /const p1: Point2D = \{ id: 'p1', x: 5, y: 0 \};\s+const p2: Point2D = \{ id: 'p2', x: 5, y: 10 \};\s+const constraint: Constraint2D = \{\s+id: 'vert1',\s+type: 'vertical',\s+entities: \[p1, p2\],/s,
    after: `const p1: Point2D = { id: 'p1', x: 5, y: 0 };
      const p2: Point2D = { id: 'p2', x: 5, y: 10 };

      solver.addEntity(p1);
      solver.addEntity(p2);

      const constraint: Constraint2D = {
        id: 'vert1',
        type: 'vertical',
        entities: ['p1', 'p2'],`,
  },
  // Fix: fixed constraint
  {
    before:
      /it\('should solve fixed constraint', \(\) => \{\s+const p1: Point2D = \{ id: 'p1', x: 0, y: 0 \};\s+const constraint: Constraint2D = \{\s+id: 'fixed1',\s+type: 'fixed',\s+entities: \[p1\],/s,
    after: `it('should solve fixed constraint', () => {
      const p1: Point2D = { id: 'p1', x: 0, y: 0 };

      solver.addEntity(p1);

      const constraint: Constraint2D = {
        id: 'fixed1',
        type: 'fixed',
        entities: ['p1'],`,
  },
  // Fix: multiple constraints
  {
    before:
      /const p1: Point2D = \{ id: 'p1', x: 0, y: 0 \};\s+const p2: Point2D = \{ id: 'p2', x: 1, y: 0 \};\s+const distConstraint: Constraint2D = \{\s+id: 'dist1',\s+type: 'distance',\s+entities: \[p1, p2\],/s,
    after: `const p1: Point2D = { id: 'p1', x: 0, y: 0 };
      const p2: Point2D = { id: 'p2', x: 1, y: 0 };

      solver.addEntity(p1);
      solver.addEntity(p2);

      const distConstraint: Constraint2D = {
        id: 'dist1',
        type: 'distance',
        entities: ['p1', 'p2'],`,
  },
  // Fix: horizontal constraint in multiple constraints test
  {
    before:
      /const horizConstraint: Constraint2D = \{\s+id: 'horiz1',\s+type: 'horizontal',\s+entities: \[p1, p2\],/s,
    after: `const horizConstraint: Constraint2D = {
        id: 'horiz1',
        type: 'horizontal',
        entities: ['p1', 'p2'],`,
  },
  // Fix: conflicting constraints
  {
    before:
      /const p1: Point2D = \{ id: 'p1', x: 0, y: 0 \};\s+const p2: Point2D = \{ id: 'p2', x: 100, y: 100 \};\s+const distConstraint: Constraint2D = \{\s+id: 'dist1',\s+type: 'distance',\s+entities: \[p1, p2\],/s,
    after: `const p1: Point2D = { id: 'p1', x: 0, y: 0 };
      const p2: Point2D = { id: 'p2', x: 100, y: 100 };

      solver.addEntity(p1);
      solver.addEntity(p2);

      const distConstraint: Constraint2D = {
        id: 'dist1',
        type: 'distance',
        entities: ['p1', 'p2'],`,
  },
  // Fix: fixed constraint in conflicting test
  {
    before:
      /const fixedConstraint: Constraint2D = \{\s+id: 'fixed1',\s+type: 'fixed',\s+entities: \[p1\],/s,
    after: `const fixedConstraint: Constraint2D = {
        id: 'fixed1',
        type: 'fixed',
        entities: ['p1'],`,
  },
  // Fix: missing targetValue
  {
    before:
      /it\('should handle constraint with missing targetValue', \(\) => \{\s+const p1: Point2D = \{ id: 'p1', x: 0, y: 0 \};\s+const p2: Point2D = \{ id: 'p2', x: 5, y: 0 \};\s+const constraint: Constraint2D = \{\s+id: 'dist1',\s+type: 'distance',\s+entities: \[p1, p2\],/s,
    after: `it('should handle constraint with missing targetValue', () => {
      const p1: Point2D = { id: 'p1', x: 0, y: 0 };
      const p2: Point2D = { id: 'p2', x: 5, y: 0 };

      solver.addEntity(p1);
      solver.addEntity(p2);

      const constraint: Constraint2D = {
        id: 'dist1',
        type: 'distance',
        entities: ['p1', 'p2'],`,
  },
  // Fix: negative distance
  {
    before:
      /it\('should handle negative distance target', \(\) => \{\s+const p1: Point2D = \{ id: 'p1', x: 0, y: 0 \};\s+const p2: Point2D = \{ id: 'p2', x: 5, y: 0 \};\s+const constraint: Constraint2D = \{\s+id: 'dist1',\s+type: 'distance',\s+entities: \[p1, p2\],/s,
    after: `it('should handle negative distance target', () => {
      const p1: Point2D = { id: 'p1', x: 0, y: 0 };
      const p2: Point2D = { id: 'p2', x: 5, y: 0 };

      solver.addEntity(p1);
      solver.addEntity(p2);

      const constraint: Constraint2D = {
        id: 'dist1',
        type: 'distance',
        entities: ['p1', 'p2'],`,
  },
  // Fix: large coordinate values
  {
    before:
      /it\('should handle very large coordinate values', \(\) => \{\s+const p1: Point2D = \{ id: 'p1', x: 1e10, y: 1e10 \};\s+const p2: Point2D = \{ id: 'p2', x: 1e10 \+ 5, y: 1e10 \};\s+const constraint: Constraint2D = \{\s+id: 'dist1',\s+type: 'distance',\s+entities: \[p1, p2\],/s,
    after: `it('should handle very large coordinate values', () => {
      const p1: Point2D = { id: 'p1', x: 1e10, y: 1e10 };
      const p2: Point2D = { id: 'p2', x: 1e10 + 5, y: 1e10 };

      solver.addEntity(p1);
      solver.addEntity(p2);

      const constraint: Constraint2D = {
        id: 'dist1',
        type: 'distance',
        entities: ['p1', 'p2'],`,
  },
];

// Apply fixes
let fixedCount = 0;
for (const fix of fixes) {
  if (fix.before.test(content)) {
    content = content.replace(fix.before, fix.after);
    fixedCount++;
  }
}

writeFileSync(filePath, content, 'utf-8');
console.log(`Fixed ${fixedCount} test cases in ${filePath}`);
