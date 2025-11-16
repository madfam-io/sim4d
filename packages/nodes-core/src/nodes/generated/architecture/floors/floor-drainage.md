# FloorDrainage Node

**Category:** Architecture / Floors

Floor drainage system

## Parameters

### Slope

- **Type:** number
- **Default:** 0.01
- **Min:** 0.005
- **Max:** 0.02

### Drain Type

- **Type:** enum
- **Default:** "point"

## Inputs

### Floor Boundary

- **Type:** Wire
- **Required:** Yes

### Drain Locations

- **Type:** Point[]
- **Required:** Yes

## Outputs

### Sloped Floor

- **Type:** Shape

### Drains

- **Type:** Shape[]
