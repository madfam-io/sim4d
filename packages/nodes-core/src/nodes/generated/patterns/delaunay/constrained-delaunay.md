# ConstrainedDelaunay Node

**Category:** Patterns / Delaunay

Constrained Delaunay triangulation

## Parameters

### Refinement

- **Type:** boolean
- **Default:** true

### Max Area

- **Type:** number
- **Default:** 100
- **Min:** 0.1

## Inputs

### Points

- **Type:** Point[]
- **Required:** Yes

### Boundary

- **Type:** Wire
- **Required:** Yes

### Holes

- **Type:** Wire[]
- **Required:** No

## Outputs

### Triangulation

- **Type:** Mesh
