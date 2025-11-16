# PathPlanning Node

**Category:** Fabrication / Robotics

Robot path planning

## Parameters

### Algorithm

- **Type:** enum
- **Default:** "rrt"

### Smoothing

- **Type:** boolean
- **Default:** true

## Inputs

### Waypoints

- **Type:** Transform[]
- **Required:** Yes

### Obstacles

- **Type:** Shape[]
- **Required:** No

## Outputs

### Trajectory

- **Type:** Transform[]

### Joint Trajectory

- **Type:** Data
