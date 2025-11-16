# InverseKinematics Node

**Category:** Simulation / Kinematics

Calculate inverse kinematics

## Parameters

### Solver

- **Type:** enum
- **Default:** "jacobian"

### Max Iterations

- **Type:** number
- **Default:** 100
- **Min:** 10
- **Max:** 1000

### Tolerance

- **Type:** number
- **Default:** 0.001
- **Min:** 0.0001
- **Max:** 0.1

## Inputs

### Mechanism

- **Type:** Data
- **Required:** Yes

### Target Pose

- **Type:** Data
- **Required:** Yes

## Outputs

### Joint Values

- **Type:** number[]

### Reachable

- **Type:** boolean
