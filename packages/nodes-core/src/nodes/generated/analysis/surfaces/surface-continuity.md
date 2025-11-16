# SurfaceContinuity Node

**Category:** Analysis / Surfaces

Analyze surface continuity across edges

## Parameters

### Continuity Type

- **Type:** enum
- **Default:** "G1"

### Tolerance

- **Type:** number
- **Default:** 0.01
- **Min:** 0.001
- **Max:** 1

### Show Analysis

- **Type:** boolean
- **Default:** true

## Inputs

### Surface1

- **Type:** Face
- **Required:** Yes

### Surface2

- **Type:** Face
- **Required:** Yes

## Outputs

### Is Continuous

- **Type:** boolean

### Discontinuity Points

- **Type:** Point[]

### Analysis Lines

- **Type:** Wire[]
