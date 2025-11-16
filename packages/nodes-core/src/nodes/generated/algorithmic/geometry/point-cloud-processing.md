# PointCloudProcessing Node

**Category:** Algorithmic / Geometry

Process and filter point clouds

## Parameters

### Operation

- **Type:** enum
- **Default:** "filter"

### Radius

- **Type:** number
- **Default:** 1
- **Min:** 0.1
- **Max:** 10

### Neighbors

- **Type:** number
- **Default:** 6
- **Min:** 3
- **Max:** 50

## Inputs

### Points

- **Type:** Point[]
- **Required:** Yes

## Outputs

### Processed

- **Type:** Point[]

### Normals

- **Type:** Vector[]

### Indices

- **Type:** number[]
