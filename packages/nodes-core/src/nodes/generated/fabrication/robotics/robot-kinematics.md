# RobotKinematics Node

**Category:** Fabrication / Robotics

Robot kinematics solver

## Parameters

### Robot Type

- **Type:** enum
- **Default:** "6-axis"

### Solver

- **Type:** enum
- **Default:** "inverse"

## Inputs

### Target

- **Type:** Transform
- **Required:** Yes

### Joint Limits

- **Type:** Data
- **Required:** No

## Outputs

### Joint Angles

- **Type:** Number[]

### Reachable

- **Type:** Boolean
