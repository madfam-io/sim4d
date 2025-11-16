# MedialAxis Node

**Category:** Algorithmic / Geometry

Compute medial axis/skeleton

## Parameters

### Resolution

- **Type:** number
- **Default:** 0.1
- **Min:** 0.01
- **Max:** 1

### Pruning

- **Type:** number
- **Default:** 0.1
- **Min:** 0
- **Max:** 1

### Simplify

- **Type:** boolean
- **Default:** true

## Inputs

### Shape

- **Type:** Shape
- **Required:** Yes

## Outputs

### Skeleton

- **Type:** Wire[]

### Branch Points

- **Type:** Point[]

### Endpoints

- **Type:** Point[]
