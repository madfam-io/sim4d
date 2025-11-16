# PickAndPlace Node

**Category:** Fabrication / Robotics

Pick and place optimization

## Parameters

### Gripper Type

- **Type:** enum
- **Default:** "parallel"

### Approach Angle

- **Type:** number
- **Default:** 0
- **Min:** -90
- **Max:** 90

## Inputs

### Pick Points

- **Type:** Transform[]
- **Required:** Yes

### Place Points

- **Type:** Transform[]
- **Required:** Yes

## Outputs

### Pick Place Sequence

- **Type:** Transform[]
