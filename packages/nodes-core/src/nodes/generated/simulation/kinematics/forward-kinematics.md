# ForwardKinematics Node

**Category:** Simulation / Kinematics

Calculate forward kinematics

## Parameters

### Time Step

- **Type:** number
- **Default:** 0.01
- **Min:** 0.0001
- **Max:** 1

### Duration

- **Type:** number
- **Default:** 1
- **Min:** 0.01
- **Max:** 100

## Inputs

### Mechanism

- **Type:** Data
- **Required:** Yes

### Joint Values

- **Type:** number[]
- **Required:** Yes

## Outputs

### End Effector Pose

- **Type:** Data

### Trajectory

- **Type:** Wire
