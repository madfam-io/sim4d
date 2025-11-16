# GeometryMatching Node

**Category:** Algorithmic / Geometry

Match and align geometries

## Parameters

### Algorithm

- **Type:** enum
- **Default:** "icp"

### Tolerance

- **Type:** number
- **Default:** 0.01
- **Min:** 0.001
- **Max:** 1

### Iterations

- **Type:** number
- **Default:** 50
- **Min:** 10
- **Max:** 500

## Inputs

### Source

- **Type:** Shape
- **Required:** Yes

### Target

- **Type:** Shape
- **Required:** Yes

## Outputs

### Transform

- **Type:** Properties

### Aligned

- **Type:** Shape

### Error

- **Type:** number

### Correspondences

- **Type:** Properties[]
