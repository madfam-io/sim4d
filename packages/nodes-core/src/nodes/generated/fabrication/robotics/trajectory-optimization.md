# TrajectoryOptimization Node

**Category:** Fabrication / Robotics

Optimize robot trajectory

## Parameters

### Objective

- **Type:** enum
- **Default:** "time"

### Max Velocity

- **Type:** number
- **Default:** 1000
- **Min:** 10
- **Max:** 5000

### Max Acceleration

- **Type:** number
- **Default:** 5000
- **Min:** 100
- **Max:** 20000

## Inputs

### Trajectory

- **Type:** Transform[]
- **Required:** Yes

## Outputs

### Optimized Trajectory

- **Type:** Transform[]

### Velocity Profile

- **Type:** Data
