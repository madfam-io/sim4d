# HollowShaft Node

**Category:** MechanicalEngineering / Shafts

Create hollow shaft

## Parameters

### Outer Diameter

- **Type:** number
- **Default:** 40
- **Min:** 10
- **Max:** 200

### Inner Diameter

- **Type:** number
- **Default:** 30
- **Min:** 5
- **Max:** 190

### Length

- **Type:** number
- **Default:** 100
- **Min:** 20
- **Max:** 500

### End Machining

- **Type:** enum
- **Default:** "none"

## Inputs

### Center

- **Type:** Point
- **Required:** Yes

### Axis

- **Type:** Vector
- **Required:** No

## Outputs

### Shaft

- **Type:** Shape

### Bore

- **Type:** Wire
