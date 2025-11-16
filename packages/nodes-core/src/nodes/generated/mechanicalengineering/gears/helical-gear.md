# HelicalGear Node

**Category:** MechanicalEngineering / Gears

Create helical gear with angle

## Parameters

### Module

- **Type:** number
- **Default:** 2
- **Min:** 0.5
- **Max:** 20

### Teeth

- **Type:** number
- **Default:** 20
- **Min:** 6
- **Max:** 200

### Helix Angle

- **Type:** number
- **Default:** 15
- **Min:** 0
- **Max:** 45
- **Description:** Helix angle in degrees

### Width

- **Type:** number
- **Default:** 20
- **Min:** 1
- **Max:** 200

### Handedness

- **Type:** enum
- **Default:** "right"

## Inputs

### Center

- **Type:** Point
- **Required:** No

## Outputs

### Gear

- **Type:** Shape

### Profile

- **Type:** Wire
