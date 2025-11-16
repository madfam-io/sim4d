# SurfaceReconstruction Node

**Category:** Algorithmic / Geometry

Reconstruct surface from point cloud

## Parameters

### Algorithm

- **Type:** enum
- **Default:** "poisson"

### Depth

- **Type:** number
- **Default:** 8
- **Min:** 4
- **Max:** 12

### Samples

- **Type:** number
- **Default:** 1
- **Min:** 0.1
- **Max:** 10

## Inputs

### Points

- **Type:** Point[]
- **Required:** Yes

### Normals

- **Type:** Vector[]
- **Required:** No

## Outputs

### Surface

- **Type:** Shape

### Mesh

- **Type:** Shape

### Quality

- **Type:** number
