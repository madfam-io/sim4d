# CamProfile Node

**Category:** MechanicalEngineering / Mechanisms

Create cam profile

## Parameters

### Base Radius

- **Type:** number
- **Default:** 30
- **Min:** 10
- **Max:** 100

### Lift

- **Type:** number
- **Default:** 10
- **Min:** 2
- **Max:** 50

### Profile Type

- **Type:** enum
- **Default:** "harmonic"

### Dwell Angle

- **Type:** number
- **Default:** 60
- **Min:** 0
- **Max:** 180

## Inputs

### Center

- **Type:** Point
- **Required:** Yes

### Custom Profile

- **Type:** Wire
- **Required:** No

## Outputs

### Cam

- **Type:** Shape

### Profile

- **Type:** Wire
