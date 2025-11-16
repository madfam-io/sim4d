# SliceModel Node

**Category:** Fabrication / 3D Printing

Slice model for printing

## Parameters

### Layer Height

- **Type:** number
- **Default:** 0.2
- **Min:** 0.05
- **Max:** 1

### Infill Density

- **Type:** number
- **Default:** 0.2
- **Min:** 0
- **Max:** 1

### Infill Pattern

- **Type:** enum
- **Default:** "grid"

## Inputs

### Model

- **Type:** Shape
- **Required:** Yes

## Outputs

### Slices

- **Type:** Wire[]

### Infill

- **Type:** Wire[]
