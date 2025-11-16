# ThrustBearing Node

**Category:** MechanicalEngineering / Bearings

Create thrust bearing for axial loads

## Parameters

### Inner Diameter

- **Type:** number
- **Default:** 20
- **Min:** 5
- **Max:** 150

### Outer Diameter

- **Type:** number
- **Default:** 40
- **Min:** 15
- **Max:** 300

### Height

- **Type:** number
- **Default:** 10
- **Min:** 3
- **Max:** 50

### Type

- **Type:** enum
- **Default:** "ball"

## Inputs

### Center

- **Type:** Point
- **Required:** Yes

## Outputs

### Bearing

- **Type:** Shape

### Raceways

- **Type:** Shape[]
