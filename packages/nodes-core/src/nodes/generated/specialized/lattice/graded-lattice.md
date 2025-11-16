# GradedLattice Node

**Category:** Specialized / Lattice

Density-graded lattice

## Parameters

### Min Density

- **Type:** number
- **Default:** 0.2
- **Min:** 0.1
- **Max:** 0.9

### Max Density

- **Type:** number
- **Default:** 0.8
- **Min:** 0.2
- **Max:** 0.95

### Gradient Type

- **Type:** enum
- **Default:** "linear"

## Inputs

### Bounding Shape

- **Type:** Shape
- **Required:** Yes

### Density Field

- **Type:** Data
- **Required:** No

## Outputs

### Graded Lattice

- **Type:** Shape
