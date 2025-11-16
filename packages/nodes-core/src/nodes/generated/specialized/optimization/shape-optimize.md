# ShapeOptimize Node

**Category:** Specialized / Optimization

Shape optimization

## Parameters

### Objective

- **Type:** enum
- **Default:** "min-weight"

### Morph Radius

- **Type:** number
- **Default:** 5
- **Min:** 0.5
- **Max:** 50

### Iterations

- **Type:** number
- **Default:** 50
- **Min:** 5
- **Max:** 200

## Inputs

### Initial Shape

- **Type:** Shape
- **Required:** Yes

### Boundary Conditions

- **Type:** Data
- **Required:** Yes

## Outputs

### Optimized

- **Type:** Shape
