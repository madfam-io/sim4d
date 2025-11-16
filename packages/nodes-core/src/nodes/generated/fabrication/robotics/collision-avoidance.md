# CollisionAvoidance Node

**Category:** Fabrication / Robotics

Collision detection and avoidance

## Parameters

### Safety Margin

- **Type:** number
- **Default:** 10
- **Min:** 0
- **Max:** 50

## Inputs

### Robot Path

- **Type:** Transform[]
- **Required:** Yes

### Environment

- **Type:** Shape[]
- **Required:** Yes

## Outputs

### Safe Path

- **Type:** Transform[]

### Collision Points

- **Type:** Point[]
