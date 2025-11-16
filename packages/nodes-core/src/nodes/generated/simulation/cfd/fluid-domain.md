# FluidDomain Node

**Category:** Simulation / CFD

Create fluid domain

## Parameters

### Domain Type

- **Type:** enum
- **Default:** "external"

### Bounding Box Scale

- **Type:** vector3
- **Default:** [3,3,3]

- **Description:** Domain size multiplier

### Refinement Distance

- **Type:** number
- **Default:** 10
- **Min:** 1
- **Max:** 1000

## Inputs

### Geometry

- **Type:** Shape
- **Required:** Yes

## Outputs

### Fluid Domain

- **Type:** Shape

### Walls

- **Type:** Face[]
