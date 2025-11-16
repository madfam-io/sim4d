# FluidProperties Node

**Category:** Simulation / CFD

Set fluid properties

## Parameters

### Fluid

- **Type:** enum
- **Default:** "air"

### Density

- **Type:** number
- **Default:** 1.225
- **Min:** 0.001
- **Max:** 20000
- **Description:** kg/m³

### Viscosity

- **Type:** number
- **Default:** 0.0000181
- **Min:** 1e-10
- **Max:** 100
- **Description:** Pa·s

### Compressible

- **Type:** boolean
- **Default:** false

## Inputs

### Domain

- **Type:** Shape
- **Required:** Yes

## Outputs

### Fluid Domain

- **Type:** Shape

### Fluid Data

- **Type:** Data
