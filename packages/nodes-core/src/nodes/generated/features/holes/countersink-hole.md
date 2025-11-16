# CountersinkHole Node

**Category:** Features / Holes

Creates a countersink hole for flat head screws

## Parameters

### Hole Diameter

- **Type:** number
- **Default:** 6.5
- **Min:** 0.1
- **Max:** 100

### Countersink Diameter

- **Type:** number
- **Default:** 12
- **Min:** 0.1
- **Max:** 200

### Angle

- **Type:** enum
- **Default:** "90"

- **Description:** Countersink angle in degrees

### Depth

- **Type:** number
- **Default:** -1
- **Min:** -1

## Inputs

### Solid

- **Type:** Shape
- **Required:** Yes

### Position

- **Type:** Point
- **Required:** Yes

## Outputs

### Shape

- **Type:** Shape
