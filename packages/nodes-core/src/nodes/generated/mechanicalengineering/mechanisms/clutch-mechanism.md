# ClutchMechanism Node

**Category:** MechanicalEngineering / Mechanisms

Create clutch assembly

## Parameters

### Type

- **Type:** enum
- **Default:** "friction"

### Outer Diameter

- **Type:** number
- **Default:** 100
- **Min:** 30
- **Max:** 300

### Inner Diameter

- **Type:** number
- **Default:** 50
- **Min:** 20
- **Max:** 150

### Plate Count

- **Type:** number
- **Default:** 3
- **Min:** 1
- **Max:** 8

## Inputs

### Center

- **Type:** Point
- **Required:** Yes

## Outputs

### Clutch

- **Type:** Shape

### Plates

- **Type:** Shape[]
