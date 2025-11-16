# LinearBearing Node

**Category:** MechanicalEngineering / Bearings

Create linear motion bearing

## Parameters

### Shaft Diameter

- **Type:** number
- **Default:** 8
- **Min:** 3
- **Max:** 50

### Outer Diameter

- **Type:** number
- **Default:** 15
- **Min:** 8
- **Max:** 80

### Length

- **Type:** number
- **Default:** 24
- **Min:** 10
- **Max:** 100

### Type

- **Type:** enum
- **Default:** "ball"

## Inputs

### Center

- **Type:** Point
- **Required:** Yes

### Axis

- **Type:** Vector
- **Required:** No

## Outputs

### Bearing

- **Type:** Shape

### Bore

- **Type:** Wire
