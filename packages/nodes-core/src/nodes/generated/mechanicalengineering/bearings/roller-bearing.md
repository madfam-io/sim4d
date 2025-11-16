# RollerBearing Node

**Category:** MechanicalEngineering / Bearings

Create roller bearing

## Parameters

### Inner Diameter

- **Type:** number
- **Default:** 25
- **Min:** 5
- **Max:** 200

### Outer Diameter

- **Type:** number
- **Default:** 52
- **Min:** 15
- **Max:** 400

### Width

- **Type:** number
- **Default:** 15
- **Min:** 5
- **Max:** 100

### Roller Type

- **Type:** enum
- **Default:** "cylindrical"

## Inputs

### Center

- **Type:** Point
- **Required:** Yes

## Outputs

### Bearing

- **Type:** Shape

### Rollers

- **Type:** Shape[]
