# LinkageMechanism Node

**Category:** MechanicalEngineering / Mechanisms

Create linkage mechanism

## Parameters

### Type

- **Type:** enum
- **Default:** "four-bar"

### Link Length1

- **Type:** number
- **Default:** 50
- **Min:** 10
- **Max:** 200

### Link Length2

- **Type:** number
- **Default:** 80
- **Min:** 10
- **Max:** 200

### Link Length3

- **Type:** number
- **Default:** 60
- **Min:** 10
- **Max:** 200

### Angle

- **Type:** number
- **Default:** 0
- **Min:** 0
- **Max:** 360

## Inputs

### Base Points

- **Type:** Point[]
- **Required:** Yes

## Outputs

### Mechanism

- **Type:** Shape

### Links

- **Type:** Shape[]

### Joints

- **Type:** Point[]
