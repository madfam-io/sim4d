# CompressionSpring Node

**Category:** MechanicalEngineering / Springs

Create compression coil spring

## Parameters

### Wire Diameter

- **Type:** number
- **Default:** 2
- **Min:** 0.5
- **Max:** 10

### Coil Diameter

- **Type:** number
- **Default:** 20
- **Min:** 5
- **Max:** 100

### Free Length

- **Type:** number
- **Default:** 50
- **Min:** 10
- **Max:** 200

### Coils

- **Type:** number
- **Default:** 8
- **Min:** 3
- **Max:** 30

### End Type

- **Type:** enum
- **Default:** "closed"

## Inputs

### Center

- **Type:** Point
- **Required:** Yes

### Axis

- **Type:** Vector
- **Required:** No

## Outputs

### Spring

- **Type:** Shape

### Helix

- **Type:** Wire
