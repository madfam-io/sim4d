# ExtensionSpring Node

**Category:** MechanicalEngineering / Springs

Create extension spring with hooks

## Parameters

### Wire Diameter

- **Type:** number
- **Default:** 1.5
- **Min:** 0.5
- **Max:** 8

### Coil Diameter

- **Type:** number
- **Default:** 15
- **Min:** 5
- **Max:** 80

### Body Length

- **Type:** number
- **Default:** 40
- **Min:** 10
- **Max:** 150

### Coils

- **Type:** number
- **Default:** 10
- **Min:** 5
- **Max:** 40

### Hook Type

- **Type:** enum
- **Default:** "machine"

## Inputs

### Center

- **Type:** Point
- **Required:** Yes

## Outputs

### Spring

- **Type:** Shape

### Hooks

- **Type:** Wire[]
