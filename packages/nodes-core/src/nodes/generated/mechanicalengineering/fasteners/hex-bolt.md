# HexBolt Node

**Category:** MechanicalEngineering / Fasteners

Create hex head bolt

## Parameters

### Diameter

- **Type:** enum
- **Default:** "M6"

### Length

- **Type:** number
- **Default:** 20
- **Min:** 5
- **Max:** 200
- **Description:** Length in mm

### Thread Pitch

- **Type:** number
- **Default:** 1
- **Min:** 0.5
- **Max:** 3

### Head Height

- **Type:** number
- **Default:** 4
- **Min:** 2
- **Max:** 20

## Inputs

### Position

- **Type:** Point
- **Required:** Yes

### Direction

- **Type:** Vector
- **Required:** No

## Outputs

### Bolt

- **Type:** Shape

### Thread

- **Type:** Wire
