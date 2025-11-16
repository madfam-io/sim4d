# JointDefinition Node

**Category:** Simulation / Kinematics

Define kinematic joint

## Parameters

### Joint Type

- **Type:** enum
- **Default:** "revolute"

### Axis

- **Type:** vector3
- **Default:** [0,0,1]

### Min Limit

- **Type:** number
- **Default:** -180
- **Min:** -360
- **Max:** 360

### Max Limit

- **Type:** number
- **Default:** 180
- **Min:** -360
- **Max:** 360

## Inputs

### Body1

- **Type:** Shape
- **Required:** Yes

### Body2

- **Type:** Shape
- **Required:** Yes

### Joint Location

- **Type:** Point
- **Required:** Yes

## Outputs

### Joint

- **Type:** Data

### Assembly

- **Type:** Shape
