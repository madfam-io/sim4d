# CollisionDetection Node

**Category:** Simulation / Kinematics

Setup collision detection

## Parameters

### Detection Type

- **Type:** enum
- **Default:** "discrete"

### Tolerance

- **Type:** number
- **Default:** 0.1
- **Min:** 0.001
- **Max:** 10

### Include Self Collision

- **Type:** boolean
- **Default:** true

## Inputs

### Bodies

- **Type:** Shape[]
- **Required:** Yes

## Outputs

### Collision Pairs

- **Type:** Data
