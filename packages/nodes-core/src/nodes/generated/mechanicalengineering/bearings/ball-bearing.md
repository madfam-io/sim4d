# BallBearing Node

**Category:** MechanicalEngineering / Bearings

Create ball bearing assembly

## Parameters

### Inner Diameter

- **Type:** number
- **Default:** 20
- **Min:** 3
- **Max:** 200
- **Description:** Bore diameter in mm

### Outer Diameter

- **Type:** number
- **Default:** 47
- **Min:** 10
- **Max:** 400
- **Description:** Outer diameter in mm

### Width

- **Type:** number
- **Default:** 14
- **Min:** 3
- **Max:** 100
- **Description:** Width in mm

### Ball Count

- **Type:** number
- **Default:** 8
- **Min:** 5
- **Max:** 20

### Show Cage

- **Type:** boolean
- **Default:** true

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

### Inner Race

- **Type:** Shape

### Outer Race

- **Type:** Shape
