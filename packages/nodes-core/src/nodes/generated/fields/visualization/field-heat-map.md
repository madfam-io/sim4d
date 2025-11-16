# FieldHeatMap Node

**Category:** Fields / Visualization

Generate heat map visualization

## Parameters

### Resolution

- **Type:** number
- **Default:** 50
- **Min:** 10
- **Max:** 200
- **Description:** Grid resolution

### Interpolation

- **Type:** enum
- **Default:** "\"bilinear\""

- **Description:** Interpolation method

## Inputs

### Field

- **Type:** Field
- **Required:** No

### Plane

- **Type:** Plane
- **Required:** Yes

## Outputs

### Heat Map

- **Type:** Mesh
