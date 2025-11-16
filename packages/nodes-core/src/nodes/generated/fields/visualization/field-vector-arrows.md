# FieldVectorArrows Node

**Category:** Fields / Visualization

Display vector field as arrows

## Parameters

### Arrow Scale

- **Type:** number
- **Default:** 1
- **Min:** 0.1
- **Max:** 10
- **Description:** Scale factor for arrows

### Density

- **Type:** number
- **Default:** 0.5
- **Min:** 0
- **Max:** 1
- **Description:** Display density (0-1)

## Inputs

### Field

- **Type:** VectorField
- **Required:** No

### Domain

- **Type:** Geometry
- **Required:** Yes

## Outputs

### Arrows

- **Type:** GeometrySet
