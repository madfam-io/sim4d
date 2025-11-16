# CentroidalVoronoi Node

**Category:** Patterns / Voronoi

Lloyd relaxation Voronoi

## Parameters

### Iterations

- **Type:** number
- **Default:** 10
- **Min:** 1
- **Max:** 100

### Convergence

- **Type:** number
- **Default:** 0.001
- **Min:** 0

## Inputs

### Points

- **Type:** Point[]
- **Required:** Yes

### Boundary

- **Type:** Wire
- **Required:** No

## Outputs

### Cells

- **Type:** Wire[]

### Centroids

- **Type:** Point[]
