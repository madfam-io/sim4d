# SimplifyMesh Node

**Category:** Mesh / Repair

Reduce mesh complexity

## Parameters

### Target Ratio

- **Type:** number
- **Default:** 0.5
- **Min:** 0.01
- **Max:** 1
- **Description:** Target triangle ratio

### Preserve Boundaries

- **Type:** boolean
- **Default:** true

### Preserve Topology

- **Type:** boolean
- **Default:** false

### Max Error

- **Type:** number
- **Default:** 0.1
- **Min:** 0.001
- **Max:** 10

## Inputs

### Mesh

- **Type:** Mesh
- **Required:** Yes

## Outputs

### Simplified

- **Type:** Mesh

### Triangle Count

- **Type:** number
