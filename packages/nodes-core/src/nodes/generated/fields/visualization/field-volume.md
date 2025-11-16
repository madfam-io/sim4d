# FieldVolume Node

**Category:** Fields / Visualization

Generate volumetric field visualization

## Parameters

### Voxel Size

- **Type:** number
- **Default:** 1
- **Min:** 0.1
- **Max:** 10
- **Description:** Size of voxels

### Threshold

- **Type:** number
- **Default:** 0.5
- **Min:** 0
- **Max:** 1
- **Description:** Display threshold

### Opacity

- **Type:** number
- **Default:** 0.8
- **Min:** 0
- **Max:** 1
- **Description:** Volume opacity

## Inputs

### Field

- **Type:** Field
- **Required:** No

### Bounds

- **Type:** Box
- **Required:** Yes

## Outputs

### Volume

- **Type:** Mesh
