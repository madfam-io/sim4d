# GeometrySimplification Node

**Category:** Algorithmic / Geometry

Simplify complex geometry

## Parameters

### Algorithm

- **Type:** enum
- **Default:** "quadric"

### Reduction

- **Type:** number
- **Default:** 0.5
- **Min:** 0.1
- **Max:** 0.9

### Preserve Boundary

- **Type:** boolean
- **Default:** true

## Inputs

### Geometry

- **Type:** Shape
- **Required:** Yes

## Outputs

### Simplified

- **Type:** Shape

### Reduction Ratio

- **Type:** number

### Error

- **Type:** number
