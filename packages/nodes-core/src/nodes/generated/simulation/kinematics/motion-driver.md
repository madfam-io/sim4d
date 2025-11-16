# MotionDriver Node

**Category:** Simulation / Kinematics

Define motion driver

## Parameters

### Motion Type

- **Type:** enum
- **Default:** "constant"

### Velocity

- **Type:** number
- **Default:** 1
- **Min:** -1000
- **Max:** 1000

### Acceleration

- **Type:** number
- **Default:** 0
- **Min:** -1000
- **Max:** 1000

### Period

- **Type:** number
- **Default:** 1
- **Min:** 0.001
- **Max:** 100

## Inputs

### Joint

- **Type:** Data
- **Required:** Yes

### Motion Profile

- **Type:** Data
- **Required:** No

## Outputs

### Driven Joint

- **Type:** Data
