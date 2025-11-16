# RetainingRing Node

**Category:** MechanicalEngineering / Fasteners

Create retaining ring/circlip

## Parameters

### Shaft Diameter

- **Type:** number
- **Default:** 10
- **Min:** 3
- **Max:** 100

### Type

- **Type:** enum
- **Default:** "external"

### Thickness

- **Type:** number
- **Default:** 1
- **Min:** 0.5
- **Max:** 3

### Groove Width

- **Type:** number
- **Default:** 1.2
- **Min:** 0.6
- **Max:** 4

## Inputs

### Center

- **Type:** Point
- **Required:** Yes

## Outputs

### Ring

- **Type:** Shape

### Groove

- **Type:** Wire
