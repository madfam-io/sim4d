# ShadowAnalysis Node

**Category:** Analysis / Proximity

Calculate shadow patterns

## Parameters

### Light Type

- **Type:** enum
- **Default:** "directional"

### Intensity

- **Type:** number
- **Default:** 1
- **Min:** 0.1
- **Max:** 10

## Inputs

### Light Source

- **Type:** Point
- **Required:** Yes

### Light Direction

- **Type:** Vector
- **Required:** No

### Objects

- **Type:** Shape[]
- **Required:** Yes

### Ground Plane

- **Type:** Face
- **Required:** Yes

## Outputs

### Shadow Regions

- **Type:** Face[]

### Light Rays

- **Type:** Wire[]

### Illuminated Areas

- **Type:** Face[]
