# RayIntersection Node

**Category:** Analysis / Intersection

Cast ray and find intersections

## Parameters

### Tolerance

- **Type:** number
- **Default:** 0.01
- **Min:** 0.001
- **Max:** 1

### Max Distance

- **Type:** number
- **Default:** 1000
- **Min:** 1
- **Max:** 10000

## Inputs

### Ray Origin

- **Type:** Point
- **Required:** Yes

### Ray Direction

- **Type:** Vector
- **Required:** Yes

### Targets

- **Type:** Shape[]
- **Required:** Yes

## Outputs

### Hit Points

- **Type:** Point[]

### Hit Distances

- **Type:** number[]

### Hit Normals

- **Type:** Vector[]
