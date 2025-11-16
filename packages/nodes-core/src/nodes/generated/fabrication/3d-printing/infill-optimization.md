# InfillOptimization Node

**Category:** Fabrication / 3D Printing

Adaptive infill generation

## Parameters

### Min Density

- **Type:** number
- **Default:** 0.1
- **Min:** 0
- **Max:** 1

### Max Density

- **Type:** number
- **Default:** 0.5
- **Min:** 0
- **Max:** 1

### Gradient Distance

- **Type:** number
- **Default:** 5
- **Min:** 1
- **Max:** 20

## Inputs

### Model

- **Type:** Shape
- **Required:** Yes

### Stress Map

- **Type:** Data
- **Required:** No

## Outputs

### Adaptive Infill

- **Type:** Wire[]
